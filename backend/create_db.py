import sys
from pathlib import Path

# Đưa thư mục backend vào sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Import chính xác từ app.database
from app.database import Base, engine

# Import đầy đủ các models thực tế trong dự án
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
from app.models.audit_log import AuditLog
from app.models.document_chunk import DocumentChunk

print(f"Đang kết nối tới CSDL: {engine.url.render_as_string(hide_password=True)}...")
try:
    Base.metadata.create_all(bind=engine)
    print("==> TẠO TẤT CẢ CÁC BẢNG THÀNH CÔNG!")
    print("Mẹo: Bạn có thể chạy lệnh 'python -m app.seed' để nạp toàn bộ dữ liệu mẫu!")
except Exception as exc:
    print(f"==> LỖI KHI TẠO BẢNG: {exc}")
    if "vector" in str(exc).lower():
        print("LƯU Ý: PostgreSQL của bạn chưa cài extension 'pgvector'.")
        print("Hãy đổi DATABASE_URL sang SQLite trong backend/.env để chạy ngay lập tức:")
        print("DATABASE_URL=sqlite:///./db_qlch.db")