import logging

from fastapi import status
from sqlalchemy.orm import Session

from config import settings
from errors import raise_api_error
from logging_utils import log_event
from repository.donation_repository import (
    create_donation as create_donation_record,
    delete_donation as delete_donation_record,
    get_donation_by_id,
    list_donations as list_donation_records,
)
from redis_client import bump_counter, get_int, get_json, set_json
from schemas import CurrentUser, DonationCreate, DonationRead
from services.notification_service import create_notification_for_donation

logger = logging.getLogger("app.donations")


def list_donations(db: Session, limit: int, offset: int):
    cache_version = get_int("donations:cache_version", 0)
    cache_key = f"donations:list:{cache_version}:{limit}:{offset}"
    cached = get_json(cache_key)
    if cached is not None:
        return cached

    donations = list_donation_records(db, limit, offset)
    payload = [
        DonationRead.model_validate(donation).model_dump(mode="json")
        for donation in donations
    ]
    set_json(cache_key, payload, settings.donations_cache_ttl_seconds)
    return donations


def create_donation(db: Session, payload: DonationCreate, user: CurrentUser):
    donation = create_donation_record(db, payload)
    bump_counter("donations:cache_version")
    notification = create_notification_for_donation(db, donation.id, donation.donor_name)
    log_event(
        logger,
        "donation_created",
        donation_id=donation.id,
        donor_name=donation.donor_name,
        amount=donation.amount,
        user_id=user.id,
        notification_id=notification.id,
    )
    return donation, notification


def delete_donation(db: Session, donation_id: int) -> None:
    donation = get_donation_by_id(db, donation_id)
    if donation is None:
        raise_api_error(
            status.HTTP_404_NOT_FOUND,
            "DONATION_NOT_FOUND",
            "Donation not found",
        )

    delete_donation_record(db, donation)
    bump_counter("donations:cache_version")
