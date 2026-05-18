from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from db import get_db
from routers.auth import get_current_user
from schemas import (
    CurrentUser,
    VolunteerAvailabilityItem,
    VolunteerProfileRead,
    VolunteerProfileUpdate,
    VolunteerServicesItem,
)
from services.volunteer_service import (
    get_availability,
    get_profile,
    get_services,
    save_availability,
    save_profile,
    save_services,
)

router = APIRouter()


@router.get('/volunteer/profile', response_model=VolunteerProfileRead)
def volunteer_profile(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return get_profile(db, user.id)


@router.put('/volunteer/profile', response_model=VolunteerProfileRead)
def update_volunteer_profile(
    payload: VolunteerProfileUpdate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return save_profile(db, user.id, payload)


@router.get('/volunteer/availability', response_model=list[VolunteerAvailabilityItem])
def volunteer_availability(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return get_availability(db, user.id)


@router.put('/volunteer/availability', response_model=list[VolunteerAvailabilityItem])
def update_volunteer_availability(
    payload: list[VolunteerAvailabilityItem],
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return save_availability(db, user.id, payload)


@router.get('/volunteer/services', response_model=list[VolunteerServicesItem])
def volunteer_services(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return get_services(db, user.id)


@router.put('/volunteer/services', response_model=list[VolunteerServicesItem])
def update_volunteer_services(
    payload: list[VolunteerServicesItem],
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return save_services(db, user.id, payload)
