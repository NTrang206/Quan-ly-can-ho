from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    UniqueConstraint
)

from datetime import datetime

from app.database import Base


class Receivable(Base):
    __tablename__ = "receivables"

    __table_args__ = (
        UniqueConstraint(
            "contract_id",
            "billing_month",
            "billing_year",
            name="uq_receivable_contract_period"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    contract_id = Column(
        Integer,
        ForeignKey("contracts.id"),
        nullable=False
    )

    apartment_id = Column(
        Integer,
        ForeignKey("apartments.id"),
        nullable=False
    )

    billing_month = Column(
        Integer,
        nullable=False
    )

    billing_year = Column(
        Integer,
        nullable=False
    )

    room_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    service_amount = Column(
        Numeric(12, 2),
        default=0
    )

    electricity_cost = Column(
        Numeric(12, 2),
        default=0
    )

    electricity_usage_kwh = Column(
        Numeric(10, 2),
        default=0
    )

    water_cost = Column(
        Numeric(12, 2),
        default=0
    )

    water_usage_m3 = Column(
        Numeric(10, 2),
        default=0
    )

    management_cost = Column(
        Numeric(12, 2),
        default=0
    )

    parking_cost = Column(
        Numeric(12, 2),
        default=0
    )

    internet_cost = Column(
        Numeric(12, 2),
        default=0
    )

    total_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    paid_amount = Column(
        Numeric(12, 2),
        default=0
    )

    status = Column(
        String(20),
        default="UNPAID"
    )

    due_date = Column(
        Date,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )