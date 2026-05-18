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

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create it from .env.production.example on the EC2 host." >&2
  exit 1
fi

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

echo "==> Starting services"
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
