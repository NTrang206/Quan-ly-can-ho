from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal
from pydantic import (
    BaseModel,
    ConfigDict
)

class ApartmentCreate(BaseModel):
    building_id: int
    room_number: str
    floor: int
    area_sqm: Decimal
    price: Decimal
    max_occupants: int = 2
    status: str = "AVAILABLE"
    bedrooms: int = 1
    bathrooms: int = 1
    image_url: str | None = None
    description: str | None = None
    deposit_default: Decimal | None = None
    view_direction: str | None = "Đông Nam"


class ApartmentUpdate(BaseModel):
    building_id: int
    room_number: str
    floor: int
    area_sqm: Decimal
    price: Decimal
    max_occupants: int
    status: str
    bedrooms: int = 1
    bathrooms: int = 1
    image_url: str | None = None
    description: str | None = None
    deposit_default: Decimal | None = None
    view_direction: str | None = "Đông Nam"


class ApartmentStatusUpdate(BaseModel):
    status: str


class ApartmentResponse(BaseModel):
    id: int
    building_id: int
    room_number: str
    floor: int
    area_sqm: Decimal
    price: Decimal
    max_occupants: int
    status: str
    bedrooms: int = 1
    bathrooms: int = 1
    image_url: str | None = None
    description: str | None = None
    deposit_default: Decimal | None = None
    view_direction: str | None = "Đông Nam"
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class ApartmentSearchResponse(BaseModel):
    id: int
    building_id: int

    room_number: str
    floor: int

    area_sqm: Decimal
    price: Decimal

    max_occupants: int

    status: str

    amenities: list[str]

    model_config = ConfigDict(
        from_attributes=True
    )