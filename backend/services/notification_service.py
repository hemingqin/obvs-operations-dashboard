import logging

from fastapi import status
from sqlalchemy.orm import Session

from db import SessionLocal
from errors import raise_api_error
from logging_utils import log_event
from repository.notification_repository import (
    create_notification as create_notification_record,
    get_notification_by_id,
    list_notifications as list_notification_records,
    save_notification,
)
from schemas import CurrentUser
from services.realtime_notification_service import publish_notification_created

logger = logging.getLogger("app.notifications")


def list_notifications(db: Session, user: CurrentUser):
    return list_notification_records(db, role=user.role, user_id=user.id)


def create_notification_for_donation(db: Session, donation_id: int, donor_name: str):
    message = f"Donation {donation_id} created for {donor_name}"
    notification = create_notification_record(
        db,
        message,
        type="donation",
        audience_role="operations",
    )
    publish_notification_created(notification)
    log_event(
        logger,
        "notification_created",
        notification_id=notification.id,
        donation_id=donation_id,
    )
    return notification


def mark_notification_read(db: Session, notification_id: int):
    notification = get_notification_by_id(db, notification_id)
    if notification is None:
        raise_api_error(
            status.HTTP_404_NOT_FOUND,
            "NOTIFICATION_NOT_FOUND",
            "Notification not found",
        )

    notification.is_read = True
    notification = save_notification(db, notification)
    log_event(logger, "notification_read", notification_id=notification.id)
    return notification


def dispatch_notification(db: Session, notification_id: int):
    notification = get_notification_by_id(db, notification_id)
    if notification is None:
        raise_api_error(
            status.HTTP_404_NOT_FOUND,
            "NOTIFICATION_NOT_FOUND",
            "Notification not found",
        )

    notification.status = "sent"
    notification = save_notification(db, notification)
    log_event(
        logger,
        "notification_sent",
        notification_id=notification.id,
    )
    return notification


def dispatch_notification_task(notification_id: int) -> None:
    db = SessionLocal()
    try:
        dispatch_notification(db, notification_id)
    finally:
        db.close()
