#!/usr/bin/env bash
#
# One-time setup of an Ubuntu 22.04 host for thesolo.co.uk.
#
# Run as root on the server. Safe to run again: every step checks before it
# acts, so a second run repairs rather than duplicates.
#
#   scp -r deploy root@HOST:/tmp/thesolo-deploy
#   ssh root@HOST 'bash /tmp/thesolo-deploy/provision.sh'
#
# It does NOT ask for or store the mail password. The last step prints the one
# command you run yourself to put the credentials in place.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT=/var/www/thesolo
DOMAIN=thesolo.co.uk

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "root olaraq işə salın"; exit 1; }

say "Paketlər"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx ufw rsync curl ca-certificates gnupg

if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -c2- | cut -d. -f1)" -lt 20 ]; then
  say "Node.js 20 LTS"
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update -qq
  apt-get install -y -qq nodejs
fi
echo "  node $(node -v)"

say "Servis istifadəçisi və qovluqlar"
id -u thesolo >/dev/null 2>&1 || useradd --system --home "$SITE_ROOT" --shell /usr/sbin/nologin thesolo
mkdir -p "$SITE_ROOT"/{releases,api} /var/www/certbot /etc/thesolo
chown -R thesolo:thesolo "$SITE_ROOT"

say "Mail servisi"
install -o thesolo -g thesolo -m 644 "$DEPLOY_DIR/api/server.mjs"   "$SITE_ROOT/api/server.mjs"
install -o thesolo -g thesolo -m 644 "$DEPLOY_DIR/api/package.json" "$SITE_ROOT/api/package.json"
cd "$SITE_ROOT/api"
sudo -u thesolo npm install --omit=dev --no-audit --no-fund --silent
cd - >/dev/null
install -m 644 "$DEPLOY_DIR/systemd/thesolo-api.service" /etc/systemd/system/thesolo-api.service
systemctl daemon-reload

if [ ! -f /etc/thesolo/api.env ]; then
  cat > /etc/thesolo/api.env <<'ENVEOF'
# Fill these in, then: systemctl restart thesolo-api
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=bookings@thesolo.co.uk
ALLOWED_ORIGINS=https://www.thesolo.co.uk,https://thesolo.co.uk
PORT=3000
ENVEOF
  echo "  /etc/thesolo/api.env yaradıldı (boş)"
fi
chown root:thesolo /etc/thesolo/api.env
chmod 640 /etc/thesolo/api.env

say "nginx"
mkdir -p /etc/nginx/snippets
install -m 644 "$DEPLOY_DIR/nginx/thesolo-headers.conf" /etc/nginx/snippets/thesolo-headers.conf
install -m 644 "$DEPLOY_DIR/nginx/thesolo.conf"         /etc/nginx/sites-available/thesolo.conf
ln -sfn /etc/nginx/sites-available/thesolo.conf /etc/nginx/sites-enabled/thesolo.conf
rm -f /etc/nginx/sites-enabled/default

# The TLS blocks reference certificates that do not exist yet, so nginx cannot
# start until certbot has run. Serve plain HTTP first, get the certificate,
# then put the real config back.
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  say "Sertifikat yoxdur — müvəqqəti HTTP konfiqurasiyası"
  cat > /etc/nginx/sites-available/thesolo.conf <<'TMPEOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name thesolo.co.uk www.thesolo.co.uk;
    root /var/www/thesolo/current;
    index index.html;
    location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { try_files $uri $uri/index.html =404; }
}
TMPEOF
  nginx -t && systemctl reload nginx
  echo
  echo "  DNS hələ bu serverə baxmırsa sertifikat alına bilməz."
  echo "  DNS hazır olanda:"
  echo "    certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m info@$DOMAIN --redirect"
  echo "    install -m 644 $DEPLOY_DIR/nginx/thesolo.conf /etc/nginx/sites-available/thesolo.conf"
  echo "    nginx -t && systemctl reload nginx"
else
  nginx -t && systemctl reload nginx
fi

say "Divar (firewall)"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
ufw status | sed 's/^/  /'

say "Servisi işə sal"
systemctl enable --now thesolo-api >/dev/null 2>&1 || true
if grep -q '^SMTP_USER=$' /etc/thesolo/api.env; then
  echo "  thesolo-api hələ başlamayacaq: SMTP məlumatları boşdur."
else
  systemctl restart thesolo-api
  systemctl is-active thesolo-api | sed 's/^/  vəziyyət: /'
fi

cat <<'DONE'

────────────────────────────────────────────────────────────────
Server hazırdır. Qalan iki addım sizindir:

1) Mail məlumatlarını yerləşdirin (parolu mən görməməliyəm):

     nano /etc/thesolo/api.env      # SMTP_USER və SMTP_PASS doldurun
     chmod 640 /etc/thesolo/api.env
     systemctl restart thesolo-api
     systemctl status thesolo-api --no-pager

   SMTP_PASS Gmail-in adi parolu deyil, "App password"-dur.
   Vercel-dəki mövcud dəyərləri panelin Environment Variables
   bölməsindən götürə bilərsiniz.

2) Saytı yerləşdirin — GitHub Actions bunu edəcək, və ya yerli:

     deploy/push.sh <server>
────────────────────────────────────────────────────────────────
DONE
