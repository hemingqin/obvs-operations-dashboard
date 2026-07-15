from fastapi import status
from sqlalchemy.orm import Session

from errors import raise_api_error
from repository.notification_repository import create_notification
from repository.service_request_repository import (
    ServiceRequestClaimConflict,
    ServiceRequestNotFound,
    claim_service_request as claim_service_request_record,
    create_service_request as create_service_request_record,
    list_service_requests as list_service_request_records,
    list_service_requests_for_user,
)
from schemas import CurrentUser, ServiceRequestCreate
from services.realtime_notification_service import publish_notification_created


def list_service_requests(db: Session):
    return list_service_request_records(db)


def list_my_service_requests(db: Session, user: CurrentUser):
    return list_service_requests_for_user(db, user.id)


def create_service_request(db: Session, payload: ServiceRequestCreate, user: CurrentUser):
    if user.role not in {"admin", "staff"}:
        raise_api_error(
            status.HTTP_403_FORBIDDEN,
            "INSUFFICIENT_ROLE",
            "Insufficient role",
        )

    assignee_user_id = 3 if payload.priority == "High" else None
    service_request = create_service_request_record(db, payload, assignee_user_id=assignee_user_id)
    operations_notification = create_notification(
        db,
        f"Service request {service_request.id} created for {service_request.client_name}",
        type="request",
        audience_role="operations",
    )
    publish_notification_created(operations_notification)

    if service_request.assignee_user_id is not None:
        volunteer_notification = create_notification(
            db,
            f"Service request {service_request.id} assigned to you",
            type="request",
            audience_role="volunteer",
            recipient_user_id=service_request.assignee_user_id,
        )
        publish_notification_created(volunteer_notification)

    return service_request


def claim_service_request(db: Session, request_id: int, user: CurrentUser):
    try:
        return claim_service_request_record(db, request_id, user.id)
    except ServiceRequestNotFound:
        raise_api_error(
            status.HTTP_404_NOT_FOUND,
            "SERVICE_REQUEST_NOT_FOUND",
            "Service request not found",
        )
    except ServiceRequestClaimConflict:
        raise_api_error(
            status.HTTP_409_CONFLICT,
            "SERVICE_REQUEST_NOT_CLAIMABLE",
            "Service request is already assigned or is not claimable",
        )
