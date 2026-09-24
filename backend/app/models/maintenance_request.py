from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Numeric
)

from datetime import datetime

from app.database import Base


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    apartment_id = Column(
        Integer,
        ForeignKey("apartments.id"),
        nullable=False
    )

    reporter_name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    issue_description = Column(
        Text,
        nullable=False
    )

    priority = Column(
        String(20),
        default="MEDIUM"
    )

    status = Column(
        String(20),
        default="PENDING"
    )

    repair_cost = Column(
        Numeric(12, 2),
        default=0
    )

    assigned_staff_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.now
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

    image_url = Column(
        String(255),
        nullable=True
    )

    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id"),
        nullable=True
    )