from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    Numeric
)

from datetime import datetime

from app.database import Base


class DebtLedger(Base):
    __tablename__ = "debt_ledger"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id"),
        unique=True,
        nullable=False
    )

    total_receivable = Column(
        Numeric(14, 2),
        default=0
    )

    total_paid = Column(
        Numeric(14, 2),
        default=0
    )

    current_debt = Column(
        Numeric(14, 2),
        default=0
    )

    last_updated = Column(
        DateTime,
        default=datetime.now
    )