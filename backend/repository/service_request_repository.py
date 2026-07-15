from sqlalchemy.orm import Session

from models import ServiceRequest, User, VolunteerProfile
from schemas import ServiceRequestCreate

CLAIMABLE_STATUSES = {"Open", "OPEN", "UNASSIGNED"}
ASSIGNED_STATUS = "Assigned"


class ServiceRequestNotFound(Exception):
    pass


class ServiceRequestClaimConflict(Exception):
    pass

DEFAULT_SERVICE_REQUESTS = [
    {
        "client_name": "Rosa Martinez",
        "service_type": "Pantry delivery",
        "priority": "High",
        "status": "Open",
        "location": "Downtown East",
        "assignee_user_id": 3,
        "assignee_name": "volunteer",
        "preferred_date": "2026-05-15",
        "notes": "Needs assistance carrying groceries upstairs.",
    },
    {
        "client_name": "Arthur Bennett",
        "service_type": "Wellness check-in",
        "priority": "Medium",
        "status": "In progress",
        "location": "Remote",
        "assignee_user_id": 3,
        "assignee_name": "volunteer",
        "preferred_date": "2026-05-14",
        "notes": "Prefers a late afternoon call and speaks slowly.",
    },
]


def seed_default_service_requests(db: Session) -> None:
    existing = db.query(ServiceRequest).count()
    if existing > 0:
        return

    for item in DEFAULT_SERVICE_REQUESTS:
        db.add(ServiceRequest(**item))
    db.commit()


def list_service_requests(db: Session) -> list[ServiceRequest]:
    seed_default_service_requests(db)
    return db.query(ServiceRequest).order_by(ServiceRequest.id.desc()).all()


def list_service_requests_for_user(db: Session, user_id: int) -> list[ServiceRequest]:
    seed_default_service_requests(db)
    return (
        db.query(ServiceRequest)
        .filter(ServiceRequest.assignee_user_id == user_id)
        .order_by(ServiceRequest.id.desc())
        .all()
    )


def create_service_request(
    db: Session,
    payload: ServiceRequestCreate,
    assignee_user_id: int | None = None,
) -> ServiceRequest:
    assignee_name = "Unassigned"
    if assignee_user_id is not None:
        assignee = db.get(User, assignee_user_id)
        assignee_name = assignee.username if assignee is not None else "Unassigned"

    service_request = ServiceRequest(
        client_name=payload.client_name,
        service_type=payload.service_type,
        priority=payload.priority,
        status="Open",
        location=payload.location,
        assignee_user_id=assignee_user_id,
        assignee_name=assignee_name,
        preferred_date=payload.preferred_date,
        notes=payload.notes,
    )
    db.add(service_request)
    db.commit()
    db.refresh(service_request)
    return service_request


def claim_service_request(
    db: Session,
    request_id: int,
    volunteer_id: int,
) -> ServiceRequest:
    with db.begin():
        service_request = (
            db.query(ServiceRequest)
            .filter(ServiceRequest.id == request_id)
            # with_for_update locks this row until the transaction completes,
            # preventing two volunteers from claiming it concurrently.
            .with_for_update()
            .first()
        )
        if service_request is None:
            raise ServiceRequestNotFound()

        if (
            service_request.status not in CLAIMABLE_STATUSES
            or service_request.assignee_user_id is not None
        ):
            raise ServiceRequestClaimConflict()

        volunteer = db.get(User, volunteer_id)
        profile = db.get(VolunteerProfile, volunteer_id)
        full_name = profile.full_name.strip() if profile and profile.full_name else ""
        assignee_name = full_name or (
            volunteer.username if volunteer is not None else str(volunteer_id)
        )

        service_request.status = ASSIGNED_STATUS
        service_request.assignee_user_id = volunteer_id
        service_request.assignee_name = assignee_name
        db.add(service_request)

    db.refresh(service_request)
    return service_request
