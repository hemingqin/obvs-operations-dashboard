#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
BRANCH="${DEPLOY_BRANCH:-main}"

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "Docker Compose is not installed." >&2
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Missing $COMPOSE_FILE" >&2
  exit 1
fi

# $ENV_FILE (.env.production) is the single source of truth for production
# secrets. This script only ever READS it (via --env-file below, and via the
# explicit `. "./$ENV_FILE"` sourcing further down to forward specific
# variable names into the preflight check). Nothing in this script, in CI,
# or anywhere else in this repo writes, regenerates, copies over, or deletes
# this file -- it is created once, by hand, on the EC2 host (see the README
# "Environment Files" section) and is git-ignored so it can never be touched
# by `git pull`/`git checkout` either. If you're debugging unexpected
# configuration changes, that rules out this script and git as the source.
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create it from .env.production.example on the EC2 host." >&2
  exit 1
fi

wait_for_healthy() {
  service="$1"
  max_attempts="${2:-30}"
  attempt=1
  while [ "$attempt" -le "$max_attempts" ]; do
    if $COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps "$service" 2>/dev/null | grep -q "(healthy)"; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 2
  done
  return 1
}

echo "==> Deploying branch: $BRANCH"

if [ -d .git ]; then
  echo "==> Pulling latest code"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  echo "==> No .git directory found; skipping code pull"
fi

echo "==> Validating Compose configuration"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null

echo "==> Pulling available base/runtime images"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull --ignore-pull-failures

echo "==> Building application images"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

echo "==> Ensuring database and cache are up"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-recreate postgres redis

echo "==> Waiting for postgres to report healthy"
if ! wait_for_healthy postgres; then
  echo "DEPLOY ABORTED: postgres did not become healthy in time. Backend was not touched." >&2
  exit 1
fi

echo "==> Waiting for redis to report healthy"
if ! wait_for_healthy redis; then
  echo "DEPLOY ABORTED: redis did not become healthy in time. Backend was not touched." >&2
  exit 1
fi

echo "==> Running database credential preflight (see docs/deployment-database-credentials.md)"
# Load POSTGRES_USER/POSTGRES_DB into this shell so -e can forward them to the
# one-off container; DATABASE_URL and POSTGRES_PASSWORD are already declared
# on the backend/postgres services and reach the containers through --env-file.
set -a
# shellcheck disable=SC1090
. "./$ENV_FILE"
set +a

if ! $COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" run --rm --no-deps \
  -e POSTGRES_USER -e POSTGRES_DB -e POSTGRES_PASSWORD backend python db_preflight.py; then
  echo "DEPLOY ABORTED: database credential preflight failed. The currently running backend was left untouched." >&2
  echo "This usually means POSTGRES_PASSWORD/DATABASE_URL in $ENV_FILE no longer matches the password PostgreSQL actually has stored for this data volume." >&2
  echo "See docs/deployment-database-credentials.md before changing any secrets." >&2
  exit 1
fi

echo "==> Preflight passed. Starting services"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --remove-orphans

echo "==> Removing dangling images"
docker image prune -f

echo "==> Deployment status"
$COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

echo "==> Health check"
if command -v curl >/dev/null 2>&1; then
  curl -fsS http://127.0.0.1/health >/dev/null && echo "Nginx/backend health check passed"
else
  wget -qO- http://127.0.0.1/health >/dev/null && echo "Nginx/backend health check passed"
fi
