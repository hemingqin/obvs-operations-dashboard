from sqlalchemy.orm import Session

from db import SessionLocal
from models import User

DEFAULT_USERS = [
    {"id": 1, "username": "admin", "password": "admin123", "role": "admin"},
    {"id": 2, "username": "staff", "password": "staff123", "role": "staff"},
    {"id": 3, "username": "volunteer", "password": "volunteer123", "role": "volunteer"},
]


def seed_default_users() -> None:
    db: Session = SessionLocal()
    try:
        for user_payload in DEFAULT_USERS:
            existing = db.query(User).filter(User.username == user_payload["username"]).first()
            if existing is None:
                db.add(User(**user_payload))
        db.commit()
    finally:
        db.close()


def get_user_by_username(username: str) -> dict | None:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            return None

        return {
            "id": user.id,
            "username": user.username,
            "password": user.password,
            "role": user.role,
        }
    finally:
        db.close()
