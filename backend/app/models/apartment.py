from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Numeric
)

from datetime import datetime

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

    created_at = Column(
        DateTime,
        default=datetime.now
    )