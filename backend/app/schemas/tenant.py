from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class TenantCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    citizen_id: str = Field(pattern=r"^\d{9,12}$")
    phone: str = Field(pattern=r"^0\d{9,10}$")
    email: str | None = None
    hometown: str | None = None


class TenantUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    citizen_id: str = Field(pattern=r"^\d{9,12}$")
    phone: str = Field(pattern=r"^0\d{9,10}$")
    email: str | None = None
    hometown: str | None = None
    is_bad_debt: bool = False


class RoommateItem(BaseModel):
    id: int
    tenant_id: int
    apartment_id: int
    full_name: str
    citizen_id: str
    phone: str | None = None
    relationship: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


class EmergencyContactItem(BaseModel):
    id: int
    tenant_id: int
    full_name: str
    phone: str
    relationship: str

    model_config = ConfigDict(
        from_attributes=True
    )


class TenantResponse(BaseModel):
    id: int
    full_name: str
    citizen_id: str
    phone: str
    email: str | None
    hometown: str | None
    is_bad_debt: bool
    user_id: int | None
    created_at: datetime
    roommates: list[RoommateItem] = []
    emergency_contacts: list[EmergencyContactItem] = []

    model_config = ConfigDict(
        from_attributes=True
    )