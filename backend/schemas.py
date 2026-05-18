from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DonationCreate(BaseModel):
    donor_name: str
    amount: float


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUser(BaseModel):
    id: int
    role: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail


class DonationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    donor_name: str
    amount: float
    created_at: datetime


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    message: str
    status: str
    type: str
    read: bool = Field(alias="is_read")
    created_at: datetime


class NotificationMarkReadResponse(BaseModel):
    success: bool = True


class ServiceRequestCreate(BaseModel):
    client_name: str
    service_type: str
    location: str
    priority: str
    notes: str = ""
    preferred_date: str = ""


class ServiceRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_name: str
    service_type: str
    priority: str
    status: str
    location: str
    assignee_user_id: int | None
    assignee_name: str
    preferred_date: str
    notes: str
    created_at: datetime


class VolunteerProfileNotificationPreferences(BaseModel):
    email: bool
    sms: bool
    push: bool
    urgent_only: bool


class VolunteerProfileRead(BaseModel):
    user_id: int
    full_name: str
    email: str
    phone: str
    location: str
    emergency_contact: str
    notification_preferences: VolunteerProfileNotificationPreferences
    availability_status: str


class VolunteerProfileUpdate(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str
    emergency_contact: str
    notification_preferences: VolunteerProfileNotificationPreferences
    availability_status: str


class VolunteerAvailabilityItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    day: str
    morning: bool
    afternoon: bool
    evening: bool


class VolunteerServicesItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    label: str
    selected: bool
