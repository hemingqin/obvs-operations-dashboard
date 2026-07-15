from fastapi import APIRouter
from fastapi import Depends
from fastapi import Path
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from sqlalchemy.orm import Session

from db import get_db
from routers.auth import get_current_user, require_role
from services.auth_service import get_user_from_token
from schemas import CurrentUser, NotificationMarkReadResponse, NotificationRead
from services.notification_service import (
    dispatch_notification,
    list_notifications,
    mark_notification_read,
)
from services.realtime_notification_service import stream_notification_events

router = APIRouter()


@router.get('/notifications', response_model=list[NotificationRead])
def notifications(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    return list_notifications(db, user)


@router.websocket('/notifications/ws')
async def notifications_websocket(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    try:
        user = get_user_from_token(token)
    except Exception:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    try:
        async for event in stream_notification_events(user):
            await websocket.send_json(event)
    except WebSocketDisconnect:
        return


@router.post('/notifications/{id}/dispatch', response_model=NotificationRead)
def dispatch_notification_endpoint(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(require_role("staff", "admin")),
):
    return dispatch_notification(db, id)


@router.post('/notifications/{id}/read', response_model=NotificationRead)
def mark_notification_read_endpoint(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    _user: CurrentUser = Depends(get_current_user),
):
    return mark_notification_read(db, id)
