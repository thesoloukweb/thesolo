#!/usr/bin/env bash
#
# Send a built site to the server.
#
#   deploy/push.sh root@1.2.3.4          # builds, then uploads
#   SKIP_BUILD=1 deploy/push.sh root@…   # uploads whatever is in dist/
#
# Each upload lands in its own release directory and only becomes live when the
# `current` symlink is moved, which is a single atomic operation. A visitor
# mid-request is either fully on the old release or fully on the new one, never
# on half of each.
set -euo pipefail

TARGET="${1:-}"
[ -n "$TARGET" ] || { echo "istifadə: deploy/push.sh user@host"; exit 2; }

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SITE_DIR"

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "==> build"
  npm run build
fi
[ -f dist/index.html ] || { echo "dist/index.html yoxdur — build alınmadı"; exit 1; }

RELEASE="$(date -u +%Y%m%d-%H%M%S)"
REMOTE_ROOT=/var/www/thesolo

echo "==> yüklənir: $RELEASE"
# --delete keeps the release a faithful copy of dist rather than an accumulation
# of every file that has ever been built.
rsync -az --delete --human-readable --info=stats1 \
  dist/ "$TARGET:$REMOTE_ROOT/releases/$RELEASE/"

echo "==> canlıya keçirilir"
ssh "$TARGET" bash -s <<REMOTE
set -euo pipefail
chown -R thesolo:thesolo "$REMOTE_ROOT/releases/$RELEASE"
ln -sfn "$REMOTE_ROOT/releases/$RELEASE" "$REMOTE_ROOT/current.new"
mv -T "$REMOTE_ROOT/current.new" "$REMOTE_ROOT/current"
nginx -t >/dev/null && systemctl reload nginx
# Keep the three most recent releases so a rollback is a symlink away.
cd "$REMOTE_ROOT/releases"
ls -1t | tail -n +4 | xargs -r rm -rf
echo "  canlı: \$(readlink $REMOTE_ROOT/current)"
echo "  saxlanan buraxılışlar: \$(ls -1 | wc -l)"
REMOTE

echo "==> hazırdır"
