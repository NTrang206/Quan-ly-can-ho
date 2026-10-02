"""Quản lý bối cảnh kiểm thử (Test Context), DB In-Memory và TestClient độc lập."""

import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Đảm bảo đường dẫn backend nằm trong sys.path
backend_root = Path(__file__).resolve().parent.parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.core.database import Base, lay_phien_db
from app.core.security import bam_mat_khau
from app.models.auth import Role, Permission, User, UserRole
from app.services.seed_service import seed_all
from main import app

# Khởi tạo engine SQLite In-Memory dùng chung cho phiên test
engine_in_memory = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionInMem = sessionmaker(autocommit=False, autoflush=False, bind=engine_in_memory)


def _ghi_de_phien_db():
    phien = SessionInMem()
    try:
        yield phien
    finally:
        phien.close()


app.dependency_overrides[lay_phien_db] = _ghi_de_phien_db
test_client = TestClient(app)


def khoi_tao_db_moi():
    """Tạo lại schema sạch và nạp dữ liệu người dùng mẫu cho từng gói test."""
    Base.metadata.drop_all(bind=engine_in_memory)
    Base.metadata.create_all(bind=engine_in_memory)

    phien: Session = SessionInMem()
    try:
        seed_all(phien)

        # Tạo thêm các tài khoản kiểm thử chính
        tai_khoan_kiem_thu = [
            User(
                username="customer",
                email="customer@warehouse.local",
                full_name="Đại Lý Tuấn Phương",
                hashed_password=bam_mat_khau("Customer@1234"),
                role=UserRole.CUSTOMER.value,
                token_version=1,
                is_active=True,
            ),
            User(
                username="sales_mgr",
                email="sales_mgr@warehouse.local",
                full_name="Giám Đốc Kinh Doanh",
                hashed_password=bam_mat_khau("SalesMgr@1234"),
                role=UserRole.SALES_MANAGER.value,
                token_version=1,
                is_active=True,
            ),
            User(
                username="wh_mgr",
                email="wh_mgr@warehouse.local",
                full_name="Trưởng Kho Tổng",
                hashed_password=bam_mat_khau("WhMgr@1234"),
                role=UserRole.WH_MANAGER.value,
                token_version=1,
                is_active=True,
            ),
        ]
        phien.add_all(tai_khoan_kiem_thu)
        phien.commit()
    finally:
        phien.close()


def lay_client_va_db():
    """Trả về TestClient và phiên kết nối DB in-memory."""
    khoi_tao_db_moi()
    phien = SessionInMem()
    return test_client, phien
