from fastapi import APIRouter
from fastapi import BackgroundTasks
from fastapi import Depends
from fastapi import Path
from fastapi import Query
from sqlalchemy.orm import Session

from db import get_db
from routers.auth import require_role
from schemas import CurrentUser, DonationCreate, DonationRead
from services.notification_service import dispatch_notification_task
from services.donation_service import (
    create_donation as create_donation_record,
    delete_donation as delete_donation_record,
    list_donations,
)

router = APIRouter()


@router.get('/donations', response_model=list[DonationRead])
def donations(
    limit: int = Query(20, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return list_donations(db, limit, offset)


@router.post('/donations', response_model=DonationRead, status_code=201)
def create_donation(
    background_tasks: BackgroundTasks,
    payload: DonationCreate,
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(require_role("staff", "admin")),
):
    donation, notification = create_donation_record(db, payload, _user)
    background_tasks.add_task(dispatch_notification_task, notification.id)
    return donation


@router.delete('/donations/{id}', status_code=204)
def delete_donation(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(require_role("admin")),
):
    delete_donation_record(db, id)
