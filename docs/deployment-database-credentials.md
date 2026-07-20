# PostgreSQL credentials and deployment

## Why `POSTGRES_PASSWORD` can silently stop working

The official PostgreSQL Docker image only applies `POSTGRES_USER` /
`POSTGRES_PASSWORD` / `POSTGRES_DB` **once** — the very first time it starts
up against an *empty* data directory (`initdb`). Once the `postgres_data`
volume contains a database, every later container start skips
initialization entirely:

```
PostgreSQL Database directory appears to contain a database; Skipping initialization
```

At that point, the environment variables in `.env.production` become purely
cosmetic from PostgreSQL's point of view. Changing `POSTGRES_PASSWORD` (or
regenerating `.env.production` with a new secret) **does not** change the
password the `postgres` role actually has — the backend picks up the new
value from `DATABASE_URL`, tries to authenticate with it, and PostgreSQL
rejects it because its stored role password is still whatever was set the
day the volume was born:

```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL: password authentication failed for user "postgres"
```

This is not a code bug and not something a redeploy can fix by itself — the
backend, `.env.production`, and the `postgres` container's own environment
can all agree perfectly with each other and still fail, because none of them
control what's actually stored on disk.

## How this deployment now catches it before it causes an outage

`scripts/deploy.sh` runs `backend/db_preflight.py` as a one-off container
(`docker compose run --rm --no-deps backend python db_preflight.py`) after
`postgres`/`redis` are confirmed healthy, but **before** the real `backend`
service is recreated. The preflight:

1. Confirms `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
   `POSTGRES_DB` are all present.
2. Parses `DATABASE_URL` and confirms its username/database match
   `POSTGRES_USER`/`POSTGRES_DB` (catches typos and copy-paste drift between
   the two).
3. Opens a real connection to PostgreSQL with those exact credentials.

If any of that fails, `deploy.sh` stops immediately, prints a clear
host/database/user diagnostic (never the password), and **does not**
recreate the running `backend` container — the previous, working deployment
keeps serving traffic.

## If you actually need to change the database password

Never delete `postgres_data` to "reset" this — that destroys production
data. Instead, update the *stored* role password to match what's in
`.env.production`:

```bash
# From inside the postgres container, using local trust auth (bypasses the
# password you don't have), NOT by trying to log in over the network first:
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c \
  "ALTER ROLE postgres WITH PASSWORD '<the value currently in .env.production>';"
```

After running this, the preflight in the next deploy (or a manual run of
`db_preflight.py`) will confirm the fix before anything else is restarted.

If you're intentionally rotating the password going forward, change it in
one place only (`.env.production`), and immediately run the `ALTER ROLE`
above in the same maintenance window — don't let the two drift apart again.

## Manually running the preflight outside of a deploy

```bash
cd /home/ubuntu/obvs-operations-dashboard
set -a; . ./.env.production; set +a
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm --no-deps -e POSTGRES_USER -e POSTGRES_DB backend python db_preflight.py
```
