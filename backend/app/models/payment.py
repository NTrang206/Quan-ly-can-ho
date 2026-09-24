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


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    receivable_id = Column(
        Integer,
        ForeignKey("receivables.id"),
        nullable=False
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    payment_method = Column(
        String(30),
        nullable=False
    )

    transaction_code = Column(
    String(50),
    unique=True,
    nullable=True
)

    payment_date = Column(
        DateTime,
        default=datetime.now
    )

    note = Column(
        String(255),
        nullable=True
    )

    handled_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )