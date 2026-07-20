"""
Deployment preflight check.

Confirms that the configured DATABASE_URL can actually authenticate against
PostgreSQL *before* scripts/deploy.sh recreates the backend container. This
exists because PostgreSQL only applies POSTGRES_PASSWORD the first time it
initializes an empty data directory -- if the data directory already existed
when a new secret was introduced, the environment variable and the database's
real stored password silently diverge, and the backend starts crash-looping
on every deploy. See docs/deployment-database-credentials.md for the full
explanation and safe remediation steps.

Checks performed, in order (first failure stops the deploy):
  1. DATABASE_URL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB all present.
  2. DATABASE_URL parses into a host, database, and username.
  3. DATABASE_URL's username/database match POSTGRES_USER/POSTGRES_DB.
  4. DATABASE_URL's embedded password matches POSTGRES_PASSWORD (catches the
     two variables drifting apart from each other in .env.production).
  5. A real connection to PostgreSQL with these credentials succeeds
     (catches the two variables agreeing with each other but not with what
     PostgreSQL actually has stored on disk -- the production incident this
     script exists to prevent from recurring silently).

Run via (see scripts/deploy.sh):
  docker compose -f docker-compose.prod.yml --env-file .env.production \
    run --rm --no-deps -e POSTGRES_USER -e POSTGRES_DB -e POSTGRES_PASSWORD \
    backend python db_preflight.py

Exits 0 on success, 1 on any validation or connection failure. Never prints
a password -- only host, port, database name, and username are logged, and
password comparisons are same/different checks only.
"""

import os
import sys
from urllib.parse import unquote, urlparse


def fail(message: str) -> None:
    print(f"PREFLIGHT FAILED: {message}", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    database_url = os.environ.get("DATABASE_URL", "")
    postgres_user = os.environ.get("POSTGRES_USER", "")
    postgres_db = os.environ.get("POSTGRES_DB", "")
    postgres_password = os.environ.get("POSTGRES_PASSWORD", "")
    postgres_password_present = bool(postgres_password)

    missing = [
        name
        for name, value in (
            ("DATABASE_URL", database_url),
            ("POSTGRES_USER", postgres_user),
            ("POSTGRES_DB", postgres_db),
        )
        if not value
    ]
    if not postgres_password_present:
        missing.append("POSTGRES_PASSWORD")
    if missing:
        fail(f"Missing required environment variable(s): {', '.join(missing)}")

    parsed = urlparse(database_url)
    host = parsed.hostname or ""
    port = parsed.port or 5432
    db_name = (parsed.path or "").lstrip("/")
    username = unquote(parsed.username or "")

    if not host or not db_name or not username:
        fail(
            "DATABASE_URL is missing a host, database name, or username "
            f"(host={host or '<empty>'}, db={db_name or '<empty>'}, user={username or '<empty>'})"
        )

    if username != postgres_user:
        fail(
            "DATABASE_URL username does not match POSTGRES_USER "
            f"(DATABASE_URL user='{username}', POSTGRES_USER='{postgres_user}')"
        )

    if db_name != postgres_db:
        fail(
            "DATABASE_URL database name does not match POSTGRES_DB "
            f"(DATABASE_URL db='{db_name}', POSTGRES_DB='{postgres_db}')"
        )

    # Consistency check between the two places a password is configured.
    # This catches "someone updated one variable but not the other" *before*
    # it becomes a real authentication failure -- distinct from the actual
    # connection attempt below, which catches the case where both variables
    # agree with each other but neither matches what PostgreSQL has stored.
    if unquote(parsed.password or "") != postgres_password:
        fail(
            "The password embedded in DATABASE_URL does not match POSTGRES_PASSWORD. "
            "These two variables must be kept in sync in .env.production "
            "(no values shown; this is a same/different comparison only)."
        )

    print(f"Preflight: connecting to postgresql://{username}:***@{host}:{port}/{db_name}")

    try:
        import psycopg2
    except ImportError:
        fail("psycopg2 is not available in this image; cannot verify database auth")
        return

    try:
        connection = psycopg2.connect(
            host=host,
            port=port,
            dbname=db_name,
            user=username,
            password=parsed.password or "",
            connect_timeout=5,
        )
        connection.close()
    except psycopg2.OperationalError as exc:
        reason = str(exc).strip().lower()
        if "password authentication failed" in reason:
            fail(
                f"PostgreSQL rejected the configured credentials (host={host}, db={db_name}, user={username}). "
                "The configured password does not match the password already stored in the existing "
                "PostgreSQL data volume. This is expected behavior: PostgreSQL only applies "
                "POSTGRES_PASSWORD the first time it initializes an empty data directory, and does not "
                "update it on later restarts, even if .env.production changes. "
                "The database role's password must be updated first (ALTER ROLE), before this deploy can "
                "proceed -- see docs/deployment-database-credentials.md. "
                "The currently running backend has been left untouched."
            )
        elif "could not translate host name" in reason or "could not connect to server" in reason:
            fail(f"Cannot reach PostgreSQL at {host}:{port} (network/DNS issue): {exc}")
        else:
            fail(f"Unexpected database connection error (host={host}, db={db_name}, user={username}): {exc}")
        return

    print("Preflight passed: DATABASE_URL authenticates successfully.")


if __name__ == "__main__":
    main()
