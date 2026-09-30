from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Numeric
)

from datetime import datetime
from sqlalchemy.orm import relationship

from app.database import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    contract_code = Column(
        String(50),
        unique=True,
        nullable=False
    )

    apartment_id = Column(
        Integer,
        ForeignKey("apartments.id"),
        nullable=False
    )

    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id"),
        nullable=False
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=False
    )

    rental_price = Column(
        Numeric(12, 2),
        nullable=False
    )

    deposit_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    status = Column(
        String(20),
        default="DRAFT"
    )

    rejection_reason = Column(
        String(500),
        nullable=True
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    approved_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=True
    )

    apartment = relationship(
        "Apartment",
        back_populates="contracts"
    )
    tenant = relationship(
        "Tenant",
        back_populates="contracts"
    )
    deposit = relationship(
        "Deposit",
        back_populates="contract",
        uselist=False
    )
    booking = relationship(
        "Booking",
        back_populates="contract",
        uselist=False
    )
    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )
    approver = relationship(
        "User",
        foreign_keys=[approved_by]
    )