from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Numeric
)

from datetime import datetime
from sqlalchemy.orm import relationship

from app.database import Base


class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    building_id = Column(
        Integer,
        ForeignKey("buildings.id"),
        nullable=False
    )

    room_number = Column(
        String(20),
        nullable=False
    )

    floor = Column(
        Integer,
        nullable=False
    )

    area_sqm = Column(
        Numeric(6, 2),
        nullable=False
    )

    price = Column(
        Numeric(12, 2),
        nullable=False
    )

    max_occupants = Column(
        Integer,
        default=2
    )

    status = Column(
        String(20),
        default="AVAILABLE"
    )

    bedrooms = Column(
        Integer,
        default=1
    )

    bathrooms = Column(
        Integer,
        default=1
    )

    image_url = Column(
        String(500),
        nullable=True
    )

    description = Column(
        String(1000),
        nullable=True
    )

    deposit_default = Column(
        Numeric(12, 2),
        nullable=True
    )

    view_direction = Column(
        String(100),
        default="Đông Nam"
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )

    contracts = relationship(
        "Contract",
        back_populates="apartment"
    )
    bookings = relationship(
        "Booking",
        back_populates="apartment"
    )