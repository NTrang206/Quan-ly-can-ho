from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)

from datetime import datetime
from sqlalchemy.orm import relationship

from app.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    citizen_id = Column(
        String(20),
        unique=True,
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    email = Column(
        String(100),
        nullable=True
    )

    hometown = Column(
        String(100),
        nullable=True
    )

    is_bad_debt = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        unique=True
    )

    contracts = relationship(
        "Contract",
        back_populates="tenant"
    )