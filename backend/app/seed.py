from app.database import SessionLocal, Base, engine

from app.models.role import Role
from app.models.user import User
from app.models.building import Building
from app.models.apartment import Apartment
from app.models.amenity import Amenity
from app.models.tenant import Tenant
from app.models.roommate import Roommate
from app.models.emergency_contact import EmergencyContact
from app.models.booking import Booking
from app.models.contract import Contract
from app.models.deposit import Deposit
from app.models.receivable import Receivable
from app.models.payment import Payment
from app.models.debt_ledger import DebtLedger
from app.models.system_alert import SystemAlert
from app.models.maintenance_request import MaintenanceRequest
from app.models.document_chunk import DocumentChunk
from app.models.audit_log import AuditLog

from app.utils.security import hash_password


def seed_roles():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    roles = [
        {
            "role_code": "ADMIN",
            "role_name": "Quản lý",
            "description": "Quản lý toàn bộ hệ thống"
        },
        {
            "role_code": "STAFF",
            "role_name": "Nhân viên",
            "description": "Nhân viên vận hành"
        },
        {
            "role_code": "ACCOUNTANT",
            "role_name": "Kế toán",
            "description": "Quản lý tài chính và thanh toán"
        },
        {
            "role_code": "TENANT",
            "role_name": "Khách thuê",
            "description": "Cư dân đã ký hợp đồng thuê"
        }
    ]

    for item in roles:

        existing_role = db.query(Role).filter(
            Role.role_code == item["role_code"]
        ).first()

        if existing_role is None:
            db.add(Role(**item))

    db.commit()
    db.close()


def seed_admin():

    db = SessionLocal()

    admin_role = db.query(Role).filter(
        Role.role_code == "ADMIN"
    ).first()

    existing_admin = db.query(User).filter(
        User.username == "admin"
    ).first()

    if existing_admin is None:

        admin = User(
            role_id=admin_role.id,
            username="admin",
            password_hash=hash_password("123456"),
            full_name="Quản trị viên",
            email="admin@gmail.com",
            phone="0123456789",
            is_active=True
        )

        db.add(admin)
        db.commit()

        print("[OK] Da tao tai khoan Admin (username: admin, password: 123456)!")

    else:
        print("[INFO] Tai khoan Admin da ton tai!")

    db.close()


if __name__ == "__main__":

    seed_roles()

    seed_admin()