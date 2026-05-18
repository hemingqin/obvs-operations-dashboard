import json
import logging

from config import settings


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
    )


def log_event(logger: logging.Logger, event: str, **fields) -> None:
    logger.info(
        json.dumps(
            {"event": event, "app_env": settings.app_env, **fields},
            default=str,
        )
    )
