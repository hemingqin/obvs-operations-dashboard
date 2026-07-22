#!/usr/bin/env sh
# Renews the Let's Encrypt certificate for obvs.hemingqin.com using the same
# certbot_www / certbot_certs volumes the cert was originally issued into,
# then reloads only the nginx service -- never the rest of the stack.
#
# Safe to run unattended (e.g. from cron): `certbot renew` is a no-op when
# the certificate isn't within its renewal window, so most runs simply exit
# 0 without changing anything. Nginx is only reloaded when this script's own
# `certbot renew` invocation exits 0; any renewal failure leaves the
# currently-loaded certificate and running nginx config untouched.
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
CERTBOT_WWW_VOLUME="${CERTBOT_WWW_VOLUME:-obvs-operations-dashboard_certbot_www}"
CERTBOT_CERTS_VOLUME="${CERTBOT_CERTS_VOLUME:-obvs-operations-dashboard_certbot_certs}"

cd "$APP_DIR"

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose is not installed." >&2
  exit 1
fi

echo "==> $(date -u +%Y-%m-%dT%H:%M:%SZ) Running certbot renew"
if docker run --rm \
  -v "${CERTBOT_WWW_VOLUME}:/var/www/certbot" \
  -v "${CERTBOT_CERTS_VOLUME}:/etc/letsencrypt" \
  certbot/certbot renew --quiet; then
  echo "==> certbot renew succeeded (renewed a certificate, or none were due yet)"
else
  echo "==> certbot renew FAILED -- leaving nginx untouched. Currently-loaded certificate is unaffected." >&2
  exit 1
fi

echo "==> Reloading nginx"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T nginx nginx -s reload
echo "==> Done"
