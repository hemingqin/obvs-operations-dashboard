from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, declarative_base, mapped_column

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    donor_name: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    message: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    type: Mapped[str] = mapped_column(String, nullable=False, default="system")
    audience_role: Mapped[str] = mapped_column(String, nullable=False, default="operations")
    recipient_user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_name: Mapped[str] = mapped_column(String, nullable=False)
    service_type: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[str] = mapped_column(String, nullable=False, default="Medium")
    status: Mapped[str] = mapped_column(String, nullable=False, default="Open")
    location: Mapped[str] = mapped_column(String, nullable=False)
    assignee_user_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )
    assignee_name: Mapped[str] = mapped_column(String, nullable=False, default="Unassigned")
    preferred_date: Mapped[str] = mapped_column(String, nullable=False, default="")
    notes: Mapped[str] = mapped_column(String, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class VolunteerProfile(Base):
    __tablename__ = "volunteer_profiles"

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        primary_key=True,
    )
    full_name: Mapped[str] = mapped_column(String, nullable=False, default="")
    email: Mapped[str] = mapped_column(String, nullable=False, default="")
    phone: Mapped[str] = mapped_column(String, nullable=False, default="")
    location: Mapped[str] = mapped_column(String, nullable=False, default="")
    emergency_contact: Mapped[str] = mapped_column(String, nullable=False, default="")
    notification_email: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_sms: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notification_push: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notification_urgent_only: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    availability_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="Available this week",
    )


class VolunteerAvailability(Base):
    __tablename__ = "volunteer_availability"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    day: Mapped[str] = mapped_column(String, nullable=False)
    morning: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    afternoon: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    evening: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class VolunteerService(Base):
    __tablename__ = "volunteer_services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    selected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
