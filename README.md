# Donations App

A full-stack donations and operations dashboard built with React/Vite, FastAPI,
PostgreSQL, Redis, Nginx, and Docker Compose.

## Architecture

Production EC2 flow:

```text
Browser -> EC2 security group (:80/:443) -> Nginx
  -> /                  -> built React static files
  -> /assets/*          -> cached static assets
  -> /api/*             -> FastAPI backend:8000
  -> /notifications/ws  -> FastAPI WebSocket backend:8000
FastAPI -> PostgreSQL / Redis
```

Only Nginx is public. Backend, PostgreSQL, and Redis are reachable only inside
the Docker Compose network. The detailed architecture write-up lives in
[docs/architecture.md](./docs/architecture.md).

## Services

- `frontend`: builds Vite static assets into the `frontend_dist` named volume.
- `backend`: FastAPI served by Gunicorn with `uvicorn.workers.UvicornWorker`.
- `nginx`: public reverse proxy, static server, REST proxy, and WebSocket proxy.
- `postgres`: persistent PostgreSQL database on `postgres_data`.
- `redis`: cache, rate limiting, and notification Pub/Sub on `redis_data`.

## Environment Files

Use separate environment files for local and production settings:

- [.env.development.example](./.env.development.example): disposable local
  values for Docker Compose and Vite development.
- [.env.production.example](./.env.production.example): EC2 production template
  with placeholders only.

Local setup:

```powershell
Copy-Item .env.development.example .env
```

EC2 setup:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Secret strategy:

- Do not commit real `.env`, `.env.production`, SSH keys, JWT secrets, or
  database passwords.
- Generate production secrets on the EC2 host or inject them from a trusted
  secret store during provisioning.
- GitHub Actions uses repository secrets named `EC2_HOST`, `EC2_USER`, and
  `EC2_SSH_KEY`; the workflow file keeps only placeholders.

## Local Development

Production-style local Compose:

```powershell
docker compose up --build
```

Open `http://localhost`.

Vite development with hot reload:

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Open `http://localhost:5173`. API and WebSocket traffic still route through
Nginx at `http://localhost/api` and `ws://localhost/notifications/ws`.

## Production Startup Flow

On EC2, install Docker and Docker Compose, clone the repository, create
`.env.production`, and run:

```bash
chmod +x scripts/deploy.sh
COMPOSE_FILE=docker-compose.prod.yml ENV_FILE=.env.production scripts/deploy.sh
```

The deployment script:

1. Pulls the latest `main` branch when the directory is a Git checkout.
2. Validates `docker-compose.prod.yml`.
3. Pulls available runtime images.
4. Rebuilds frontend and backend images.
5. Recreates services with `docker compose up -d --remove-orphans`.
6. Removes dangling images.
7. Prints service status and checks `http://127.0.0.1/health`.

## CI/CD Flow

Continuous integration remains in `.github/workflows/ci.yml`.

Production deployment is prepared in [.github/workflows/deploy.yml](./.github/workflows/deploy.yml):

```text
push to main
  -> build frontend/backend Docker images
  -> validate Compose files
  -> SSH to EC2 with EC2_HOST, EC2_USER, EC2_SSH_KEY
  -> pull latest repo
  -> run scripts/deploy.sh
  -> restart services safely
```

Before enabling the workflow for a real server, add the GitHub secrets and set
the optional repository variable `EC2_APP_DIR` if the checkout path is not
`~/obvs`.

## Nginx Reverse Proxy

[nginx/nginx.conf](./nginx/nginx.conf) owns public routing:

- `/api/` strips the `/api` prefix and proxies REST traffic to `backend:8000`.
- `/notifications/ws` proxies WebSocket traffic with `Upgrade` and
  `Connection` headers preserved.
- `/health` proxies to the backend health endpoint.
- `/assets/*` uses long-lived immutable caching for Vite build assets.
- `/` serves React and falls back to `index.html` for SPA routes.

Production hardening includes rate limiting, a request body limit, gzip,
security headers, tuned proxy buffering, and longer WebSocket timeouts.

## HTTPS Preparation

The production Compose file exposes Nginx on ports `80` and `443` and mounts
named volumes for future Certbot files:

- `certbot_www` for ACME HTTP challenge files.
- `certbot_certs` for `/etc/letsencrypt`.

The HTTP server block is active today. A separate HTTPS server block is already
included in `nginx/nginx.conf` but commented until real certificates exist.
After Certbot issues certificates, update `server_name`, certificate paths, and
enable the HTTPS block. Do not commit private keys or certificate material.

## WebSocket Production Routing

The frontend networking config is in
[frontend/src/lib/networkConfig.js](./frontend/src/lib/networkConfig.js). In
production, `VITE_WS_BASE_URL` can stay empty so the browser derives the
WebSocket host from the current page:

```text
https://your-domain.example -> wss://your-domain.example/notifications/ws
```

Nginx routes `/notifications/ws` before the SPA fallback, disables proxy
buffering for that path, and keeps the connection open with one-hour
send/read timeouts.

## Rollback Strategy

Simple code rollback:

```bash
git log --oneline -5
git checkout <previous-good-commit>
COMPOSE_FILE=docker-compose.prod.yml ENV_FILE=.env.production scripts/deploy.sh
```

Database data is stored in a named Docker volume, so schema or data rollbacks
must be handled separately. For a stronger future rollout model, push images to
a registry with Git SHA tags and roll back by restoring the previous
`FRONTEND_IMAGE` and `BACKEND_IMAGE` tags.

## Future Scaling Ideas

- Move PostgreSQL to Amazon RDS for managed backups and easier recovery.
- Move Redis to ElastiCache if notification and cache load grows.
- Put an Application Load Balancer in front of EC2 for managed TLS and health
  checks.
- Push Docker images to ECR instead of rebuilding on EC2.
- Use blue/green EC2 instances or an Auto Scaling Group while keeping the app
  Compose-based.
- Add centralized logs and metrics through CloudWatch.

## Development Credentials

Default development users:

- `admin` / `admin123`
- `staff` / `staff123`
- `volunteer` / `volunteer123`

These are development defaults only.
