import json
import logging

from redis.exceptions import RedisError
from sqlalchemy.orm import Session

from models import Notification
from redis_client import get_async_redis_client, publish_json
from schemas import CurrentUser, NotificationRead

logger = logging.getLogger("app.notifications.realtime")

NOTIFICATION_CHANNEL = "notifications:events"


def _notification_payload(notification: Notification) -> dict:
    return NotificationRead.model_validate(notification).model_dump(
        by_alias=False,
        mode="json",
    )


def publish_notification_created(notification: Notification) -> None:
    payload = {
        "event": "notification.created",
        "notification": _notification_payload(notification),
        "audience_role": notification.audience_role,
        "recipient_user_id": notification.recipient_user_id,
    }
    publish_json(NOTIFICATION_CHANNEL, payload)


def can_receive_notification_event(event: dict, user: CurrentUser) -> bool:
    recipient_user_id = event.get("recipient_user_id")
    if recipient_user_id is not None:
        return recipient_user_id == user.id

    audience_role = event.get("audience_role")
    if audience_role == "operations":
        return user.role in {"admin", "staff"}

    return audience_role == user.role


async def stream_notification_events(user: CurrentUser):
    client = await get_async_redis_client()
    if not client:
        yield {
            "event": "notifications.error",
            "message": "Realtime notifications are unavailable.",
        }
        return

    pubsub = client.pubsub()
    await pubsub.subscribe(NOTIFICATION_CHANNEL)
    try:
        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=30,
            )
            if message is None:
                yield {"event": "notifications.ping"}
                continue

            try:
                event = json.loads(message["data"])
            except (TypeError, json.JSONDecodeError):
                logger.warning("Invalid realtime notification payload")
                continue

            if can_receive_notification_event(event, user):
                yield event
    except RedisError:
        logger.warning("Redis pubsub disconnected")
        yield {
            "event": "notifications.error",
            "message": "Realtime notifications disconnected.",
        }
    finally:
        await pubsub.unsubscribe(NOTIFICATION_CHANNEL)
        await pubsub.close()


def publish_existing_notification(db: Session, notification_id: int) -> None:
    notification = db.get(Notification, notification_id)
    if notification is not None:
        publish_notification_created(notification)
