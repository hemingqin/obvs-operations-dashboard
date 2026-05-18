from pathlib import Path

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session, sessionmaker

from config import settings

engine_kwargs = {"pool_pre_ping": True}

if settings.database_url.startswith("sqlite:///"):
    db_path = Path(settings.database_url.replace("sqlite:///", "", 1))
    db_path.parent.mkdir(parents=True, exist_ok=True)
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    **engine_kwargs,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _cleanup_orphan_postgres_sequences(connection) -> None:
    inspector = inspect(connection)
    table_names = [
        "users",
        "donations",
        "notifications",
        "service_requests",
        "volunteer_availability",
        "volunteer_services",
    ]

    for table_name in table_names:
        if inspector.has_table(table_name):
            continue
        connection.exec_driver_sql(f"DROP SEQUENCE IF EXISTS {table_name}_id_seq CASCADE")


def _add_missing_columns(connection) -> None:
    inspector = inspect(connection)

    if not inspector.has_table("notifications"):
        return

    notification_columns = {
        column["name"] for column in inspector.get_columns("notifications")
    }
    dialect_name = connection.dialect.name

    if "type" not in notification_columns:
        connection.exec_driver_sql(
            "ALTER TABLE notifications "
            "ADD COLUMN type VARCHAR NOT NULL DEFAULT 'system'"
        )

    if "is_read" not in notification_columns:
        default_value = "false" if dialect_name == "postgresql" else "0"
        connection.exec_driver_sql(
            "ALTER TABLE notifications "
            f"ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT {default_value}"
        )

    if "audience_role" not in notification_columns:
        connection.exec_driver_sql(
            "ALTER TABLE notifications "
            "ADD COLUMN audience_role VARCHAR NOT NULL DEFAULT 'operations'"
        )

    if "recipient_user_id" not in notification_columns:
        connection.exec_driver_sql(
            "ALTER TABLE notifications ADD COLUMN recipient_user_id INTEGER"
        )


def init_db() -> None:
    from models import Base
    from repository.user_repository import seed_default_users

    if settings.database_url.startswith("postgresql"):
        with engine.begin() as connection:
            connection.exec_driver_sql("SELECT pg_advisory_lock(424242)")
            try:
                _cleanup_orphan_postgres_sequences(connection)
                Base.metadata.create_all(bind=connection)
                _add_missing_columns(connection)
            finally:
                connection.exec_driver_sql("SELECT pg_advisory_unlock(424242)")
    else:
        with engine.begin() as connection:
            Base.metadata.create_all(bind=connection)
            _add_missing_columns(connection)

    seed_default_users()


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
