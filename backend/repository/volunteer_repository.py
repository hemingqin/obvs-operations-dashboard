from sqlalchemy.orm import Session

from models import VolunteerAvailability, VolunteerProfile, VolunteerService
from schemas import VolunteerAvailabilityItem, VolunteerProfileUpdate, VolunteerServicesItem

DEFAULT_AVAILABILITY = [
    {"day": "Monday", "morning": True, "afternoon": False, "evening": False},
    {"day": "Tuesday", "morning": False, "afternoon": True, "evening": True},
    {"day": "Wednesday", "morning": True, "afternoon": True, "evening": False},
    {"day": "Thursday", "morning": False, "afternoon": False, "evening": True},
    {"day": "Friday", "morning": True, "afternoon": True, "evening": True},
    {"day": "Saturday", "morning": False, "afternoon": True, "evening": False},
    {"day": "Sunday", "morning": False, "afternoon": False, "evening": False},
]

DEFAULT_SERVICES = [
    {"label": "Pantry delivery", "selected": True},
    {"label": "Transportation", "selected": True},
    {"label": "Meal prep support", "selected": False},
    {"label": "Wellness check-ins", "selected": True},
    {"label": "Admin support", "selected": False},
    {"label": "Event setup", "selected": False},
]


def get_or_create_profile(db: Session, user_id: int) -> VolunteerProfile:
    profile = db.get(VolunteerProfile, user_id)
    if profile is None:
        profile = VolunteerProfile(
            user_id=user_id,
            full_name="Taylor Morgan",
            email="taylor.morgan@example.org",
            phone="(555) 014-2288",
            location="Southwest District",
            emergency_contact="Jordan Morgan",
            notification_email=True,
            notification_sms=False,
            notification_push=True,
            notification_urgent_only=False,
            availability_status="Available this week",
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile(db: Session, user_id: int, payload: VolunteerProfileUpdate) -> VolunteerProfile:
    profile = get_or_create_profile(db, user_id)
    profile.full_name = payload.full_name
    profile.email = payload.email
    profile.phone = payload.phone
    profile.location = payload.location
    profile.emergency_contact = payload.emergency_contact
    profile.notification_email = payload.notification_preferences.email
    profile.notification_sms = payload.notification_preferences.sms
    profile.notification_push = payload.notification_preferences.push
    profile.notification_urgent_only = payload.notification_preferences.urgent_only
    profile.availability_status = payload.availability_status
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def list_availability(db: Session, user_id: int) -> list[VolunteerAvailability]:
    availability = (
        db.query(VolunteerAvailability)
        .filter(VolunteerAvailability.user_id == user_id)
        .order_by(VolunteerAvailability.id.asc())
        .all()
    )
    if availability:
        return availability

    for item in DEFAULT_AVAILABILITY:
        db.add(VolunteerAvailability(user_id=user_id, **item))
    db.commit()
    return (
        db.query(VolunteerAvailability)
        .filter(VolunteerAvailability.user_id == user_id)
        .order_by(VolunteerAvailability.id.asc())
        .all()
    )


def replace_availability(
    db: Session,
    user_id: int,
    items: list[VolunteerAvailabilityItem],
) -> list[VolunteerAvailability]:
    db.query(VolunteerAvailability).filter(VolunteerAvailability.user_id == user_id).delete()
    for item in items:
        db.add(VolunteerAvailability(user_id=user_id, **item.model_dump()))
    db.commit()
    return list_availability(db, user_id)


def list_services(db: Session, user_id: int) -> list[VolunteerService]:
    services = (
        db.query(VolunteerService)
        .filter(VolunteerService.user_id == user_id)
        .order_by(VolunteerService.id.asc())
        .all()
    )
    if services:
        return services

    for item in DEFAULT_SERVICES:
        db.add(VolunteerService(user_id=user_id, **item))
    db.commit()
    return (
        db.query(VolunteerService)
        .filter(VolunteerService.user_id == user_id)
        .order_by(VolunteerService.id.asc())
        .all()
    )


def replace_services(
    db: Session,
    user_id: int,
    items: list[VolunteerServicesItem],
) -> list[VolunteerService]:
    db.query(VolunteerService).filter(VolunteerService.user_id == user_id).delete()
    for item in items:
        db.add(
            VolunteerService(
                user_id=user_id,
                label=item.label,
                selected=item.selected,
            )
        )
    db.commit()
    return list_services(db, user_id)
