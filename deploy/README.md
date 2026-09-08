# Running thesolo.co.uk on a VPS

The site is a static build plus one endpoint. Vercel handled both; on a plain
Ubuntu host they are two separate things:

| | |
|---|---|
| `dist/` | ~78 MB of static files, served by nginx |
| `POST /api/send-email` | a small Node service behind nginx, sends the reservation and contact forms to `bookings@thesolo.co.uk` over Gmail SMTP |

If the Node service is not running, both forms fail. It is not optional.

## What is in here

| File | Purpose |
|---|---|
| `provision.sh` | One-time server setup. Idempotent — safe to run again. |
| `nginx/thesolo.conf` | The site config. A translation of `vercel.json`: same redirects, same status codes, same headers, same cache lifetimes. |
| `nginx/thesolo-headers.conf` | Security headers, included in every location because nginx drops inherited `add_header` as soon as a block adds its own. |
| `api/server.mjs` | The former Vercel function as a standalone service. |
| `systemd/thesolo-api.service` | Keeps it running, restarts it, and confines it. |
| `push.sh` | Build and upload. Each upload is a release directory; going live is a symlink move. |
| `verify-parity.sh` | Compares the VPS against the live site before DNS moves. |

## First run

```bash
scp -r site/deploy root@HOST:/tmp/thesolo-deploy
ssh root@HOST 'bash /tmp/thesolo-deploy/provision.sh'
```

Then put the mail credentials in place yourself — they are not in this
repository and should not pass through anyone else's hands:

```bash
ssh root@HOST
nano /etc/thesolo/api.env      # SMTP_USER, SMTP_PASS
systemctl restart thesolo-api
systemctl status thesolo-api --no-pager
```

`SMTP_PASS` is a Gmail **app password**, not the account password. The values
currently in use are in the Vercel project's environment variables.

Upload the site:

```bash
site/deploy/push.sh root@HOST
```

## Before moving DNS

```bash
site/deploy/verify-parity.sh <VPS-IP>
```

Every URL is requested twice — once from the live host, once from the VPS with
`--resolve`, so the VPS sees the Host and SNI it will see after the cutover.
The check compares where each URL *ends up* rather than the first hop: nginx
reaches `/#menus` in one redirect where Vercel takes two, and that is an
improvement, not a difference worth preserving.

Send a real reservation through the form on the VPS before switching. A 200
from the endpoint is not proof the mail arrived.

## The cutover

DNS is Google Cloud DNS (`ns-cloud-e1..e4.googledomains.com`), not Vercel.

| Record | Now | After |
|---|---|---|
| `thesolo.co.uk` A | `216.198.79.1` | VPS IP |
| `www` CNAME | `cname.vercel-dns.com` | delete, replace with an A record to the VPS IP |
| MX | Google Workspace | **unchanged** — mail is not affected |

Drop the TTL to 300 a day ahead, so a rollback takes five minutes rather than
the rest of the day. Certificates need DNS to be pointing here already:

```bash
certbot --nginx -d thesolo.co.uk -d www.thesolo.co.uk --agree-tos -m info@thesolo.co.uk
install -m 644 /tmp/thesolo-deploy/nginx/thesolo.conf /etc/nginx/sites-available/thesolo.conf
nginx -t && systemctl reload nginx
```

Renewal is certbot's own systemd timer; nothing to schedule.

Turn on automatic deploys by setting the repository variable
`DEPLOY_ENABLED` to `true` and adding these secrets:

`DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_TARGET`, `APIFY_TOKEN`,
`GOOGLE_ANALYTICS_ID`, `GOOGLE_TAG_MANAGER_ID`.

Keep the Vercel project. Rolling back is a DNS change, and it only works if
there is something to roll back to.

## Rollback

On the server, past releases are kept:

```bash
ls -1t /var/www/thesolo/releases        # three most recent
ln -sfn /var/www/thesolo/releases/<older> /var/www/thesolo/current.new
mv -T /var/www/thesolo/current.new /var/www/thesolo/current
systemctl reload nginx
```

## What this host does not do that Vercel did

- One location instead of a global network. The audience is in East London and
  the server should be too; a UK or Netherlands region is the sensible choice.
- No automatic preview deployment per branch.
- Security updates, disk, and certificate renewal are now someone's job.
  `unattended-upgrades` covers the first of those; the rest is monitoring.
