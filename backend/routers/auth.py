from fastapi import Request
from fastapi import APIRouter
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from schemas import CurrentUser, LoginRequest, TokenResponse
from services.auth_service import ensure_role, get_user_from_token, login_user

router = APIRouter()
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    return get_user_from_token(credentials.credentials)


def require_role(*allowed_roles: str):
    def dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        return ensure_role(user, *allowed_roles)

    return dependency


@router.post('/login', response_model=TokenResponse)
def login(request: Request, payload: LoginRequest):
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_key = f"login_attempts:{client_ip}:{payload.username}"
    return TokenResponse(
        access_token=login_user(
            payload.username,
            payload.password,
            rate_limit_key,
        )
    )
