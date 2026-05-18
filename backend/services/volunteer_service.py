from sqlalchemy.orm import Session

from models import VolunteerProfile
from repository.volunteer_repository import (
    get_or_create_profile,
    list_availability,
    list_services,
    replace_availability,
    replace_services,
    update_profile,
)
from schemas import (
    VolunteerAvailabilityItem,
    VolunteerProfileRead,
    VolunteerProfileUpdate,
    VolunteerServicesItem,
)


def serialize_profile(profile: VolunteerProfile) -> VolunteerProfileRead:
    return VolunteerProfileRead(
        user_id=profile.user_id,
        full_name=profile.full_name,
        email=profile.email,
        phone=profile.phone,
        location=profile.location,
        emergency_contact=profile.emergency_contact,
        notification_preferences={
            "email": profile.notification_email,
            "sms": profile.notification_sms,
            "push": profile.notification_push,
            "urgent_only": profile.notification_urgent_only,
        },
        availability_status=profile.availability_status,
    )


def get_profile(db: Session, user_id: int) -> VolunteerProfileRead:
    return serialize_profile(get_or_create_profile(db, user_id))


def save_profile(db: Session, user_id: int, payload: VolunteerProfileUpdate) -> VolunteerProfileRead:
    return serialize_profile(update_profile(db, user_id, payload))


def get_availability(db: Session, user_id: int) -> list[VolunteerAvailabilityItem]:
    return [
        VolunteerAvailabilityItem.model_validate(item, from_attributes=True)
        for item in list_availability(db, user_id)
    ]


def save_availability(
    db: Session,
    user_id: int,
    items: list[VolunteerAvailabilityItem],
) -> list[VolunteerAvailabilityItem]:
    return [
        VolunteerAvailabilityItem.model_validate(item, from_attributes=True)
        for item in replace_availability(db, user_id, items)
    ]


def get_services(db: Session, user_id: int) -> list[VolunteerServicesItem]:
    return [
        VolunteerServicesItem.model_validate(item, from_attributes=True)
        for item in list_services(db, user_id)
    ]


def save_services(
    db: Session,
    user_id: int,
    items: list[VolunteerServicesItem],
) -> list[VolunteerServicesItem]:
    return [
        VolunteerServicesItem.model_validate(item, from_attributes=True)
        for item in replace_services(db, user_id, items)
    ]
