from datetime import datetime, timedelta, timezone
import logging

import jwt
from fastapi import status

from config import settings
from errors import raise_api_error
from logging_utils import log_event
from repository.user_repository import get_user_by_username
from redis_client import delete_key, increment_with_ttl
from schemas import CurrentUser

logger = logging.getLogger("app.auth")

JWT_ALGORITHM = "HS256"


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.token_expire_minutes)
    payload = {"user_id": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def login_user(username: str, password: str, rate_limit_key: str) -> str:
    user = get_user_by_username(username)
    if not user or password != user["password"]:
        attempts = increment_with_ttl(
            rate_limit_key,
            settings.login_rate_limit_window_seconds,
        )
        if attempts is not None and attempts > settings.login_rate_limit_max_attempts:
            log_event(
                logger,
                "auth_failure",
                reason="rate_limited",
                username=username,
            )
            raise_api_error(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "RATE_LIMIT_EXCEEDED",
                "Too many login attempts",
            )
        log_event(logger, "auth_failure", reason="invalid_login", username=username)
        raise_api_error(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_LOGIN",
            "Invalid username or password",
        )
    delete_key(rate_limit_key)
    return create_access_token(user["id"], user["role"])


def get_user_from_token(token: str) -> CurrentUser:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        role = payload.get("role")
    except jwt.InvalidTokenError:
        log_event(logger, "auth_failure", reason="invalid_token")
        raise_api_error(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_TOKEN",
            "Invalid or expired token",
        )

    if not isinstance(user_id, int) or role not in {"admin", "staff", "volunteer"}:
        log_event(logger, "auth_failure", reason="invalid_credentials")
        raise_api_error(
            status.HTTP_401_UNAUTHORIZED,
            "INVALID_CREDENTIALS",
            "Invalid authentication credentials",
        )

    return CurrentUser(id=user_id, role=role)


def ensure_role(user: CurrentUser, *allowed_roles: str) -> CurrentUser:
    if user.role not in allowed_roles:
        log_event(
            logger,
            "auth_failure",
            reason="insufficient_role",
            user_id=user.id,
            role=user.role,
        )
        raise_api_error(
            status.HTTP_403_FORBIDDEN,
            "INSUFFICIENT_ROLE",
            "Insufficient role",
        )
    return user
