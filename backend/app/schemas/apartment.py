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


class ApartmentUpdate(BaseModel):
    building_id: int
    room_number: str
    floor: int
    area_sqm: Decimal
    price: Decimal
    max_occupants: int
    status: str


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