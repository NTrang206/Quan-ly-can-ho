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
from sqlalchemy.orm import relationship

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

    apartment = relationship("Apartment")
    assigned_staff = relationship("User")

    @property
    def room_number(self):
        return self.apartment.room_number if self.apartment else None

    @property
    def building_name(self):
        if self.apartment and hasattr(self.apartment, "building") and self.apartment.building:
            return self.apartment.building.name
        return "Dwell"

    @property
    def assigned_staff_name(self):
        return self.assigned_staff.full_name if self.assigned_staff else None

    @property
    def assigned_staff_phone(self):
        return self.assigned_staff.phone if self.assigned_staff else None