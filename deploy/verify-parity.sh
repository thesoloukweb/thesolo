#!/usr/bin/env bash
#
# Compare the new server against the one that is live, before DNS moves.
#
#   deploy/verify-parity.sh 1.2.3.4
#
# Every request is made twice: once to the live host, once to the VPS with
# --resolve so it receives the same Host and SNI it will receive after the
# cutover. Anything that differs is printed. The point is that switching DNS
# should change where the bytes come from and nothing else.
#
# Written for bash 3.2, which is what macOS ships: no namerefs, no associative
# arrays. An earlier version used `local -n` and silently compared nothing.
set -uo pipefail

IP="${1:-}"
[ -n "$IP" ] || { echo "istifadə: deploy/verify-parity.sh <vps-ip>"; exit 2; }

HOST=www.thesolo.co.uk
LIVE_OPTS=(--silent --show-error --max-time 25)
VPS_OPTS=(--silent --show-error --max-time 25 --insecure
          --resolve "$HOST:443:$IP"          --resolve "thesolo.co.uk:443:$IP"
          --resolve "$HOST:80:$IP"           --resolve "thesolo.co.uk:80:$IP")

pass=0; fail=0
ok()  { printf '  \033[32m✓\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad() { printf '  \033[31m✗\033[0m %s\n' "$1"
        printf '      canlı: %s\n' "${2:-}"
        printf '      vps  : %s\n' "${3:-}"; fail=$((fail+1)); }
no()  { printf '  \033[31m✗\033[0m %s\n' "$1"; fail=$((fail+1)); }

req() {                       # req <live|vps> <curl args…>
  local mode="$1"; shift
  if [ "$mode" = live ]; then curl "${LIVE_OPTS[@]}" "$@"; else curl "${VPS_OPTS[@]}" "$@"; fi
}

# Where a URL ends up, not how it gets there. Vercel normalises the trailing
# slash before it applies a redirect, so /menu costs two hops there and one on
# nginx; the visitor and the crawler both care about the destination, and a
# shorter chain is not a regression. The hop count is reported separately.
settle_of() {                 # settle_of <mode> <url>  ->  "200|https://…/"
  req "$1" -L --max-redirs 10 -o /dev/null \
      -w '%{http_code}|%{url_effective}' "$2" 2>/dev/null
}

hops_of() {                   # hops_of <mode> <url>  ->  count of redirects
  req "$1" -L --max-redirs 10 -o /dev/null -w '%{num_redirects}' "$2" 2>/dev/null
}

header_of() {                 # header_of <mode> <url> <header-name>
  req "$1" -o /dev/null -D - "$2" 2>/dev/null \
    | tr -d '\r' \
    | awk -v want="$3" 'BEGIN{IGNORECASE=1}
        index(tolower($0), tolower(want) ":") == 1 { sub(/^[^:]*: */, ""); print; exit }'
}

echo "── Səhifələr və yönləndirmələr ─────────────────────────────"
for p in / /about/ /blog/ /contact/ /gallery/ /faq/ /reservation/ \
         /blog/mediterranean-oasis-bethnal-green/ \
         /blog/rooftop-experience-signature-cocktails/ \
         /blog/weekend-brunch-family-dining/ \
         /about /contact /blog \
         /menu /menu/ /az /az/ /az/menu \
         /sitemap-index.xml /robots.txt
do
  a=$(settle_of live "https://$HOST$p")
  b=$(settle_of vps  "https://$HOST$p")
  ha=$(hops_of live "https://$HOST$p"); hb=$(hops_of vps "https://$HOST$p")
  note=""
  [ "$ha" != "$hb" ] && note="   (addım: canlı $ha, vps $hb)"
  if [ "$a" = "$b" ]; then ok "$p  →  ${a#*|}  [${a%%|*}]$note"; else bad "$p" "$a" "$b"; fi
done

echo
echo "── Təhlükəsizlik və keş başlıqları ──────────────────────────"
check_header() {
  local p="$1" h="$2"
  local a b
  a=$(header_of live "https://$HOST$p" "$h")
  b=$(header_of vps  "https://$HOST$p" "$h")
  if [ "$a" = "$b" ]; then ok "$h @ $p  →  ${a:-(yoxdur)}"
  else bad "$h @ $p" "${a:-(yoxdur)}" "${b:-(yoxdur)}"; fi
}
check_header /                              x-content-type-options
check_header /                              x-frame-options
check_header /                              referrer-policy
check_header /                              cache-control
check_header /images/logo.png               cache-control
check_header /pdfs/terms-and-conditions.pdf cache-control

echo
echo "── Səhifə məzmunu eynidirmi (HTML hash) ─────────────────────"
for p in / /about/ /blog/ /contact/ /gallery/; do
  a=$(req live "https://$HOST$p" 2>/dev/null | shasum | cut -c1-12)
  b=$(req vps  "https://$HOST$p" 2>/dev/null | shasum | cut -c1-12)
  if [ "$a" = "$b" ]; then ok "$p  →  $a"; else bad "$p məzmunu fərqlidir" "$a" "$b"; fi
done

echo
echo "── Apex → www ───────────────────────────────────────────────"
a=$(settle_of live "https://thesolo.co.uk/")
b=$(settle_of vps  "https://thesolo.co.uk/")
if [ "$a" = "$b" ]; then ok "apex  →  $a"; else bad "apex" "$a" "$b"; fi

echo
echo "── Mail endpoint (VPS-də, Vercel-dən fərqli olması gözlənilir) ──"
# On Vercel this path first collects a 308 from the trailing-slash rule; nginx
# hands it straight to the service, which is one round trip fewer and the same
# outcome for the form.
c=$(req vps -o /dev/null -w '%{http_code}' -X GET "https://$HOST/api/send-email")
[ "$c" = "405" ] && ok "GET → 405" || no "GET → $c (405 gözlənilirdi)"
c=$(req vps -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' \
        -d '{}' "https://$HOST/api/send-email")
[ "$c" = "400" ] && ok "boş POST → 400 (doğrulama işləyir)" || no "boş POST → $c (400 gözlənilirdi)"
c=$(req vps -o /dev/null -w '%{http_code}' -X POST -H 'Origin: https://evil.example' \
        -H 'Content-Type: application/json' -d '{}' "https://$HOST/api/send-email")
[ "$c" = "403" ] && ok "kənar origin → 403" || no "kənar origin → $c (403 gözlənilirdi)"

echo
echo "── Ana səhifədəki statik fayllar (VPS) ──────────────────────"
missing=0; total=0
urls=$(req vps "https://$HOST/" 2>/dev/null \
       | grep -oE 'src=("[^"]+"|[^ >]+)' | sed 's/^src=//;s/"//g' \
       | grep -E '^/.*\.(webp|jpg|jpeg|png|svg|mp4|webm)$' | sort -u)
while IFS= read -r u; do
  [ -z "$u" ] && continue
  total=$((total+1))
  c=$(req vps -o /dev/null -w '%{http_code}' "https://$HOST$u")
  [ "$c" = 200 ] || { printf '      %s → %s\n' "$u" "$c"; missing=$((missing+1)); }
done <<< "$urls"
if [ "$total" -gt 0 ] && [ "$missing" = 0 ]; then ok "$total fayl, qırıq yoxdur"
else no "$total fayldan $missing qırıq"; fi

echo
echo "────────────────────────────────────────────────────────────"
printf '  keçdi: %d   uğursuz: %d\n' "$pass" "$fail"
if [ "$fail" -eq 0 ]; then echo "  VPS canlı saytla eynidir — DNS keçirilə bilər."
else echo "  Fərqlər var. DNS-i keçirməzdən əvvəl düzəldin."; fi
[ "$fail" -eq 0 ]
