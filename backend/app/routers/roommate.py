from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.roommate import Roommate
from app.models.tenant import Tenant
from app.models.apartment import Apartment
from app.models.user import User
from app.models.role import Role
from app.models.contract import Contract

from app.schemas.roommate import (
    RoommateCreate,
    RoommateUpdate,
    RoommateResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/roommates",
    tags=["Roommates"]
)


# =========================
# THÊM NGƯỜI Ở CÙNG / KHAI BÁO TẠM TRÚ
# =========================
@router.post(
    "",
    response_model=RoommateResponse
)
def create_roommate(
    data: RoommateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT",
            "TENANT"
        )
    )
):
    # Nếu là tài khoản cư dân (TENANT), tự động liên kết đúng tenant_id của cư dân
    user_role = db.query(Role).filter(Role.id == current_user.role_id).first()
    if user_role and user_role.role_code == "TENANT":
        user_tenant = db.query(Tenant).filter(
            (Tenant.user_id == current_user.id) |
            (Tenant.phone == current_user.phone) |
            (Tenant.email == current_user.email)
        ).first()
        if user_tenant:
            data.tenant_id = user_tenant.id

    # 1. Kiểm tra Tenant
    tenant = db.query(Tenant).filter(
        Tenant.id == data.tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khách thuê"
        )

    # 2. Tìm hợp đồng tương ứng của khách thuê (ưu tiên hợp đồng ACTIVE)
    active_contract = db.query(Contract).filter(
        Contract.tenant_id == data.tenant_id,
        Contract.apartment_id == data.apartment_id,
        Contract.status == "ACTIVE"
    ).first()

    # Nếu không tìm thấy ở data.apartment_id, kiểm tra xem khách thuê có hợp đồng ACTIVE tại căn hộ khác không
    if not active_contract:
        active_contract = db.query(Contract).filter(
            Contract.tenant_id == data.tenant_id,
            Contract.status == "ACTIVE"
        ).first()
        if active_contract:
            data.apartment_id = active_contract.apartment_id

    # Nếu vẫn chưa thấy, tìm hợp đồng gần nhất của khách thuê
    if not active_contract:
        active_contract = db.query(Contract).filter(
            Contract.tenant_id == data.tenant_id,
            Contract.apartment_id == data.apartment_id
        ).order_by(Contract.id.desc()).first()

    # Fallback cuối cùng: tìm bất kỳ hợp đồng nào của khách thuê
    if not active_contract:
        active_contract = db.query(Contract).filter(
            Contract.tenant_id == data.tenant_id
        ).order_by(Contract.id.desc()).first()
        if active_contract:
            data.apartment_id = active_contract.apartment_id

    # 3. Kiểm tra Apartment
    apartment = db.query(Apartment).filter(
        Apartment.id == data.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    # 4. Kiểm tra thành viên đã khai báo trước đó chưa (tránh lỗi trùng lặp khi bấm nhiều lần)
    existing_rm = None
    if data.citizen_id:
        existing_rm = db.query(Roommate).filter(
            Roommate.apartment_id == data.apartment_id,
            Roommate.citizen_id == data.citizen_id
        ).first()
    if not existing_rm and data.phone:
        existing_rm = db.query(Roommate).filter(
            Roommate.apartment_id == data.apartment_id,
            Roommate.phone == data.phone
        ).first()

    if existing_rm:
        existing_rm.full_name = data.full_name
        existing_rm.citizen_id = data.citizen_id
        existing_rm.phone = data.phone
        existing_rm.relationship = data.relationship
        db.commit()
        db.refresh(existing_rm)
        return existing_rm

    # 5. Đếm số người ở và kiểm tra giới hạn
    roommate_count = db.query(Roommate).filter(
        Roommate.apartment_id == data.apartment_id
    ).count()

    current_occupants = 1 + roommate_count
    max_occ = max(apartment.max_occupants or 4, 4)

    if current_occupants >= max_occ:
        raise HTTPException(
            status_code=400,
            detail=f"Căn hộ đã đạt số người ở tối đa ({max_occ} người)"
        )

    # 6. Tạo Roommate
    roommate = Roommate(
        tenant_id=data.tenant_id,
        apartment_id=data.apartment_id,
        full_name=data.full_name,
        citizen_id=data.citizen_id,
        phone=data.phone,
        relationship=data.relationship
    )

    db.add(roommate)
    db.commit()
    db.refresh(roommate)

    return roommate


# =========================
# DANH SÁCH NGƯỜI Ở CÙNG CỦA MỘT KHÁCH THUÊ
# =========================
@router.get(
    "/tenant/{tenant_id}",
    response_model=list[RoommateResponse]
)
def get_roommates_by_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT",
            "TENANT"
        )
    )
):
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Khách thuê không tồn tại"
        )

    roommates = db.query(Roommate).filter(
        Roommate.tenant_id == tenant_id
    ).all()

    return roommates


# =========================
# XEM CHI TIẾT
# =========================
@router.get(
    "/{roommate_id}",
    response_model=RoommateResponse
)
def get_roommate(
    roommate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT",
            "TENANT"
        )
    )
):
    roommate = db.query(Roommate).filter(
        Roommate.id == roommate_id
    ).first()

    if roommate is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy người ở cùng"
        )

    return roommate


# =========================
# CẬP NHẬT
# =========================
@router.put(
    "/{roommate_id}",
    response_model=RoommateResponse
)
def update_roommate(
    roommate_id: int,
    data: RoommateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF", "TENANT")
    )
):
    roommate = db.query(Roommate).filter(
        Roommate.id == roommate_id
    ).first()

    if roommate is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy người ở cùng"
        )

    tenant = db.query(Tenant).filter(
        Tenant.id == data.tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Khách thuê không tồn tại"
        )

    apartment = db.query(Apartment).filter(
        Apartment.id == data.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Căn hộ không tồn tại"
        )

    roommate.tenant_id = data.tenant_id
    roommate.apartment_id = data.apartment_id
    roommate.full_name = data.full_name
    roommate.citizen_id = data.citizen_id
    roommate.phone = data.phone
    roommate.relationship = data.relationship

    db.commit()
    db.refresh(roommate)

    return roommate


# =========================
# XÓA
# =========================
@router.delete("/{roommate_id}")
def delete_roommate(
    roommate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF", "TENANT")
    )
):
    roommate = db.query(Roommate).filter(
        Roommate.id == roommate_id
    ).first()

    if roommate is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy người ở cùng"
        )

    db.delete(roommate)
    db.commit()

    return {
        "message": "Xóa người ở cùng thành công"
    }