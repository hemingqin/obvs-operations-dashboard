from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from db import get_db
from routers.auth import get_current_user, require_role
from schemas import CurrentUser, ServiceRequestCreate, ServiceRequestRead
from services.service_request_service import (
    claim_service_request,
    create_service_request,
    list_my_service_requests,
    list_service_requests,
)

router = APIRouter()


@router.get('/service-requests', response_model=list[ServiceRequestRead])
def service_requests(
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(require_role("staff", "admin")),
):
    return list_service_requests(db)


@router.post('/service-requests', response_model=ServiceRequestRead, status_code=201)
def create_service_request_endpoint(
    payload: ServiceRequestCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("staff", "admin")),
):
    return create_service_request(db, payload, user)


@router.get('/service-requests/mine', response_model=list[ServiceRequestRead])
def my_service_requests(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return list_my_service_requests(db, user)


@router.post('/service-requests/{request_id}/claim', response_model=ServiceRequestRead)
def claim_service_request_endpoint(
    request_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("volunteer")),
):
    return claim_service_request(db, request_id, user)
