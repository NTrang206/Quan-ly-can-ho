from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Text
)

from datetime import datetime
from sqlalchemy.orm import relationship

from app.database import Base


class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    contract_id = Column(
        Integer,
        ForeignKey("contracts.id"),
        unique=True,
        nullable=False
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    paid_date = Column(
        Date,
        nullable=True
    )

    status = Column(
        String(20),
        default="PENDING"
    )

    refund_amount = Column(
        Numeric(12, 2),
        default=0
    )

    deduction_amount = Column(
        Numeric(12, 2),
        default=0
    )

    deduction_reason = Column(
        Text,
        nullable=True
    )

    handled_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )

    contract = relationship(
        "Contract",
        back_populates="deposit"
    )