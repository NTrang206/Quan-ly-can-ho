from pydantic import (
    BaseModel,
    ConfigDict,
    Field
)

from datetime import datetime


class AlertScanRequest(BaseModel):
    days_to_end: int = Field(
        default=30,
        ge=15,
        le=30
    )


class AlertMarkSentRequest(BaseModel):
    channel: str | None = "ZALO"
    channels: list[str] | None = None
    edited_body: str | None = None


class SystemAlertResponse(BaseModel):
    id: int
    alert_type: str
    reference_id: int
    message: str
    is_sent: bool
    created_at: datetime
    room_number: str | None = None
    building_name: str | None = None
    target_name: str | None = None
    target_phone: str | None = None
    amount_due: float | None = None
    days_overdue: int | None = None
    days_until_expiry: int | None = None
    priority: str | None = None
    alert_code: str | None = None
    reference_code: str | None = None
    sent_channels: list[str] | None = None

    model_config = ConfigDict(
        from_attributes=True
    )