from sqlalchemy.orm import Session

from models import Notification


def list_notifications(
    db: Session,
    role: str | None = None,
    user_id: int | None = None,
) -> list[Notification]:
    query = db.query(Notification)

    if role in {"admin", "staff"}:
        query = query.filter(Notification.audience_role == "operations")
    elif role == "volunteer" and user_id is not None:
        query = query.filter(Notification.recipient_user_id == user_id)

    return query.order_by(Notification.id.desc()).all()


def create_notification(
    db: Session,
    message: str,
    type: str = "system",
    audience_role: str = "operations",
    recipient_user_id: int | None = None,
) -> Notification:
    notification = Notification(
        message=message,
        status="pending",
        type=type,
        audience_role=audience_role,
        recipient_user_id=recipient_user_id,
        is_read=False,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notification_by_id(db: Session, notification_id: int) -> Notification | None:
    return db.get(Notification, notification_id)


def save_notification(db: Session, notification: Notification) -> Notification:
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
