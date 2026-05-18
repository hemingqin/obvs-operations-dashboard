# Architecture

## Production Request Flow

```text
User browser
  -> EC2 security group allows :80 and :443
  -> Nginx container
    -> React static files from frontend_dist
    -> /api/* to FastAPI backend:8000
    -> /notifications/ws to FastAPI backend:8000
  -> FastAPI
    -> PostgreSQL for durable data
    -> Redis for cache, rate limiting, and notification Pub/Sub
```

Only Nginx publishes host ports. Backend, PostgreSQL, and Redis stay on the
private Docker bridge network.

## Nginx Routing Flow

Nginx is the public reverse proxy and static file server:

- `/` serves the built React app from `/usr/share/nginx/html`.
- `/assets/*` serves Vite static assets with long-lived immutable caching.
- `/api/*` removes the `/api` prefix and proxies REST traffic to `backend:8000`.
- `/notifications/ws` forwards WebSocket upgrade traffic to the backend.
- `/health` proxies to the backend health endpoint for deployment checks.
- `/.well-known/acme-challenge/*` is reserved for future Certbot HTTP validation.

## WebSocket Routing Flow

The frontend builds WebSocket URLs from `VITE_WS_BASE_URL`. In production this
is normally empty, so the browser uses the current host and connects to:

```text
wss://your-domain.example/notifications/ws
```

Nginx preserves `Upgrade` and `Connection` headers, uses HTTP/1.1 upstream
proxying, disables proxy buffering for the WebSocket route, and applies long
read/send timeouts so notification connections can stay open.

## Docker Networking

`docker-compose.prod.yml` defines one internal bridge network:

```text
app_internal
```

Service discovery uses Compose DNS names:

- `backend:8000`
- `postgres:5432`
- `redis:6379`

Named volumes keep state across container replacement:

- `frontend_dist` for built React files served by Nginx
- `postgres_data` for database files
- `redis_data` for Redis append-only persistence
- `certbot_www` and `certbot_certs` for future TLS automation

## Frontend And Backend Interaction

The React app calls REST endpoints through `/api`. Nginx strips that prefix
before forwarding to FastAPI, so a browser call to `/api/donations` reaches the
backend as `/donations`.

Notification traffic uses `/notifications/ws`. This path is not handled by the
SPA fallback; it is routed directly to the FastAPI WebSocket endpoint.

## CI/CD Deployment Pipeline

```text
Push to main
  -> GitHub Actions deploy workflow
  -> Checkout repository
  -> Build frontend and backend Docker images
  -> Validate Docker Compose files
  -> SSH to EC2 with EC2_HOST, EC2_USER, EC2_SSH_KEY
  -> Pull latest main branch on EC2
  -> Run scripts/deploy.sh
  -> Compose validates, builds, recreates services, prunes dangling images
  -> Health check confirms Nginx can reach backend
```

The workflow uses placeholders for EC2 connection secrets. The production
environment file remains on EC2 and is not committed.

## Production Deployment Diagram

```text
                           GitHub
                             |
                       push to main
                             |
                    GitHub Actions CD
                             |
                      SSH into EC2 host
                             |
        +--------------------v--------------------+
        |                 AWS EC2                 |
        |                                         |
        |  +--------------- Docker -------------+ |
        |  |                                    | |
        |  |  Nginx :80/:443                   | |
Browser +----> /, /assets, /api, /notifications | |
        |  |        |              |            | |
        |  |        |              v            | |
        |  |        |        FastAPI backend    | |
        |  |        |          |        |        | |
        |  | frontend_dist     v        v        | |
        |  |              PostgreSQL  Redis      | |
        |  |                                    | |
        |  +------------------------------------+ |
        +-----------------------------------------+
```

## Rollback Model

For a simple Compose-based rollback, SSH to EC2, inspect recent commits, check
out the previous known-good commit, and run `scripts/deploy.sh` again. Database
rollback should be handled separately and carefully because PostgreSQL data is
persisted in a named volume.

Future image registry deployment can make rollback faster by tagging each build
with the Git SHA and changing `FRONTEND_IMAGE` and `BACKEND_IMAGE` back to the
previous known-good tags.
