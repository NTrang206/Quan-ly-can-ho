from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from datetime import datetime

from app.database import get_db

from app.models.maintenance_request import (
    MaintenanceRequest
)

from app.models.apartment import Apartment
from app.models.tenant import Tenant
from app.models.contract import Contract
from app.models.user import User
from app.models.role import Role

from app.schemas.maintenance_request import (
    MaintenanceCreate,
    TenantMaintenanceCreate,
    AssignStaffRequest,
    CompleteMaintenanceRequest,
    MaintenanceResponse
)

from app.dependencies.auth import (
    require_roles
)


router = APIRouter(
    prefix="/maintenance-requests",
    tags=["Maintenance Requests"]
)


# =========================================================
# CÁC GIÁ TRỊ HỢP LỆ
# =========================================================
VALID_PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT"
]


VALID_STATUSES = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED"
]


def restore_apartment_status(
    db: Session,
    apartment_id: int
):
    apartment = db.query(Apartment).filter(
        Apartment.id == apartment_id
    ).first()

    if apartment is None or apartment.status != "MAINTENANCE":
        return

    active_request = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.apartment_id == apartment_id,
        MaintenanceRequest.status.in_([
            "PENDING",
            "IN_PROGRESS"
        ])
    ).first()

    if active_request is not None:
        return

    active_contract = db.query(Contract).filter(
        Contract.apartment_id == apartment_id,
        Contract.status == "ACTIVE"
    ).first()

    apartment.status = (
        "OCCUPIED"
        if active_contract is not None
        else "AVAILABLE"
    )


# =========================================================
# ADMIN / STAFF TẠO PHIẾU
# =========================================================
@router.post(
    "",
    response_model=MaintenanceResponse
)
def create_maintenance_request(
    data: MaintenanceCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    # -----------------------------------------------------
    # 1. Kiểm tra Apartment
    # -----------------------------------------------------
    apartment = db.query(Apartment).filter(
        Apartment.id == data.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    # -----------------------------------------------------
    # 2. Kiểm tra Priority
    # -----------------------------------------------------
    if data.priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Mức ưu tiên phải là "
                "LOW, MEDIUM, HIGH hoặc URGENT"
            )
        )

    # -----------------------------------------------------
    # 3. Nếu phiếu gắn với Tenant
    # -----------------------------------------------------
    if data.tenant_id is not None:

        tenant = db.query(Tenant).filter(
            Tenant.id == data.tenant_id
        ).first()

        if tenant is None:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy khách thuê"
            )

        # Tenant phải thuê đúng căn hộ này
        active_contract = db.query(Contract).filter(
            Contract.tenant_id == tenant.id,
            Contract.apartment_id == apartment.id,
            Contract.status == "ACTIVE"
        ).first()

        if active_contract is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Khách thuê không có hợp đồng "
                    "ACTIVE tại căn hộ này"
                )
            )

    # -----------------------------------------------------
    # 4. Tạo phiếu
    # -----------------------------------------------------
    maintenance = MaintenanceRequest(
        apartment_id=data.apartment_id,

        reporter_name=data.reporter_name,
        phone=data.phone,

        issue_description=data.issue_description,

        priority=data.priority,

        status="PENDING",

        repair_cost=0,

        assigned_staff_id=None,

        resolved_at=None,

        image_url=data.image_url,

        tenant_id=data.tenant_id
    )

    db.add(maintenance)

    if data.priority == "URGENT":
        apartment.status = "MAINTENANCE"

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# TENANT TỰ GỬI PHIẾU
#
# PHẢI đặt trước /{request_id}
# =========================================================
@router.post(
    "/my",
    response_model=MaintenanceResponse
)
def tenant_create_maintenance(
    data: TenantMaintenanceCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles("TENANT")
    )
):

    # -----------------------------------------------------
    # 1. Tìm Tenant từ tài khoản đăng nhập
    # -----------------------------------------------------
    tenant = db.query(Tenant).filter(
        Tenant.user_id == current_user.id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "Tài khoản chưa liên kết "
                "với hồ sơ khách thuê"
            )
        )

    # -----------------------------------------------------
    # 2. Kiểm tra Apartment
    # -----------------------------------------------------
    apartment = db.query(Apartment).filter(
        Apartment.id == data.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    # -----------------------------------------------------
    # 3. Kiểm tra Tenant thuê đúng Apartment
    # -----------------------------------------------------
    active_contract = db.query(Contract).filter(
        Contract.tenant_id == tenant.id,
        Contract.apartment_id == apartment.id,
        Contract.status == "ACTIVE"
    ).first()

    if active_contract is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "Bạn không có hợp đồng ACTIVE "
                "tại căn hộ này"
            )
        )

    # -----------------------------------------------------
    # 4. Kiểm tra Priority
    # -----------------------------------------------------
    if data.priority not in VALID_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail="Mức độ ưu tiên không hợp lệ"
        )

    # -----------------------------------------------------
    # 5. Tạo phiếu
    # -----------------------------------------------------
    maintenance = MaintenanceRequest(
        apartment_id=apartment.id,

        reporter_name=tenant.full_name,

        phone=tenant.phone,

        issue_description=data.issue_description,

        priority=data.priority,

        status="PENDING",

        repair_cost=0,

        assigned_staff_id=None,

        resolved_at=None,

        image_url=data.image_url,

        tenant_id=tenant.id
    )

    db.add(maintenance)

    if data.priority == "URGENT":
        apartment.status = "MAINTENANCE"

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# TENANT XEM PHIẾU CỦA MÌNH
# =========================================================
@router.get(
    "/my",
    response_model=list[MaintenanceResponse]
)
def get_my_maintenance_requests(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles("TENANT")
    )
):

    tenant = db.query(Tenant).filter(
        Tenant.user_id == current_user.id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hồ sơ khách thuê"
        )

    return (
        db.query(MaintenanceRequest)
        .filter(
            MaintenanceRequest.tenant_id
            == tenant.id
        )
        .order_by(
            MaintenanceRequest.created_at.desc()
        )
        .all()
    )


# =========================================================
# TENANT TỰ HỦY PHIẾU CỦA MÌNH
# =========================================================
@router.patch(
    "/my/{request_id}/cancel",
    response_model=MaintenanceResponse
)
def tenant_cancel_maintenance(
    request_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles("TENANT")
    )
):

    tenant = db.query(Tenant).filter(
        Tenant.user_id == current_user.id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hồ sơ khách thuê"
        )

    maintenance = db.query(
        MaintenanceRequest
    ).filter(
        MaintenanceRequest.id == request_id,
        MaintenanceRequest.tenant_id == tenant.id
    ).first()

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiếu bảo trì của bạn"
        )

    if maintenance.status == "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Phiếu đã hoàn thành, không thể hủy"
        )

    if maintenance.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Phiếu đã được hủy"
        )

    maintenance.status = "CANCELLED"
    restore_apartment_status(db, maintenance.apartment_id)

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# DANH SÁCH TẤT CẢ PHIẾU
# =========================================================
@router.get(
    "",
    response_model=list[MaintenanceResponse]
)
def get_maintenance_requests(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    return (
        db.query(MaintenanceRequest)
        .order_by(
            MaintenanceRequest.created_at.desc()
        )
        .all()
    )


# =========================================================
# DANH SÁCH PHIẾU THEO CĂN HỘ
# =========================================================
@router.get(
    "/apartment/{apartment_id}",
    response_model=list[MaintenanceResponse]
)
def get_maintenance_by_apartment(
    apartment_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    apartment = db.query(Apartment).filter(
        Apartment.id == apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    return (
        db.query(MaintenanceRequest)
        .filter(
            MaintenanceRequest.apartment_id
            == apartment_id
        )
        .order_by(
            MaintenanceRequest.created_at.desc()
        )
        .all()
    )


# =========================================================
# PHÂN CÔNG NHÂN VIÊN
# PENDING -> IN_PROGRESS
# =========================================================
@router.patch(
    "/{request_id}/assign",
    response_model=MaintenanceResponse
)
def assign_staff(
    request_id: int,
    data: AssignStaffRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    maintenance = db.query(
        MaintenanceRequest
    ).filter(
        MaintenanceRequest.id == request_id
    ).first()

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiếu bảo trì"
        )

    if maintenance.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=(
                "Chỉ phiếu PENDING "
                "mới được phân công"
            )
        )

    # -----------------------------------------------------
    # Kiểm tra User được phân công
    # -----------------------------------------------------
    staff = db.query(User).filter(
        User.id == data.staff_id
    ).first()

    if staff is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy nhân viên"
        )

    if not staff.is_active:
        raise HTTPException(
            status_code=400,
            detail="Tài khoản nhân viên đã bị khóa"
        )

    # -----------------------------------------------------
    # Kiểm tra đúng role STAFF
    # -----------------------------------------------------
    role = db.query(Role).filter(
        Role.id == staff.role_id
    ).first()

    if (
        role is None
        or role.role_code != "STAFF"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Tài khoản được phân công "
                "phải có role STAFF"
            )
        )

    maintenance.assigned_staff_id = (
        staff.id
    )

    maintenance.status = (
        "IN_PROGRESS"
    )

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# KHÓA CĂN HỘ ĐỂ BẢO TRÌ
# -> MAINTENANCE
# =========================================================
@router.patch(
    "/{request_id}/lock-apartment",
    response_model=MaintenanceResponse
)
def lock_apartment_for_maintenance(
    request_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    maintenance = db.query(
        MaintenanceRequest
    ).filter(
        MaintenanceRequest.id == request_id
    ).first()

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiếu bảo trì"
        )

    if maintenance.status in [
        "COMPLETED",
        "CANCELLED"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Phiếu bảo trì đã kết thúc"
        )

    apartment = db.query(Apartment).filter(
        Apartment.id
        == maintenance.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    apartment.status = "MAINTENANCE"

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# NGHIỆM THU / HOÀN THÀNH
# =========================================================
@router.patch(
    "/{request_id}/complete",
    response_model=MaintenanceResponse
)
def complete_maintenance(
    request_id: int,
    data: CompleteMaintenanceRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    maintenance = db.query(
        MaintenanceRequest
    ).filter(
        MaintenanceRequest.id == request_id
    ).first()

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiếu bảo trì"
        )

    if maintenance.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail=(
                "Phiếu phải ở trạng thái "
                "IN_PROGRESS"
            )
        )

    if data.repair_cost < 0:
        raise HTTPException(
            status_code=400,
            detail="Chi phí sửa chữa không hợp lệ"
        )

    # -----------------------------------------------------
    # Nghiệm thu KHÔNG ĐẠT
    # giữ IN_PROGRESS
    # -----------------------------------------------------
    if not data.is_pass:
        return maintenance

    # -----------------------------------------------------
    # Nghiệm thu ĐẠT
    # -----------------------------------------------------
    maintenance.repair_cost = (
        data.repair_cost
    )

    maintenance.status = (
        "COMPLETED"
    )

    maintenance.resolved_at = (
        datetime.now()
    )

    apartment = db.query(Apartment).filter(
        Apartment.id
        == maintenance.apartment_id
    ).first()

    if apartment is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy căn hộ"
        )

    # -----------------------------------------------------
    # Nếu phòng đang MAINTENANCE
    # kiểm tra còn hợp đồng ACTIVE không
    # -----------------------------------------------------
    if apartment.status == "MAINTENANCE":

        active_contract = db.query(
            Contract
        ).filter(
            Contract.apartment_id
            == apartment.id,

            Contract.status
            == "ACTIVE"
        ).first()

        # Có người đang thuê
        if active_contract:
            apartment.status = "OCCUPIED"

        # Không còn người thuê
        else:
            apartment.status = "AVAILABLE"

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# ADMIN / STAFF HỦY PHIẾU
# =========================================================
@router.patch(
    "/{request_id}/cancel",
    response_model=MaintenanceResponse
)
def cancel_maintenance(
    request_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    maintenance = db.query(
        MaintenanceRequest
    ).filter(
        MaintenanceRequest.id == request_id
    ).first()

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiếu bảo trì"
        )

    if maintenance.status == "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Phiếu đã hoàn thành, không thể hủy"
        )

    if maintenance.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Phiếu đã được hủy"
        )

    maintenance.status = "CANCELLED"
    restore_apartment_status(db, maintenance.apartment_id)

    db.commit()
    db.refresh(maintenance)

    return maintenance


# =========================================================
# CHI TIẾT MỘT PHIẾU
#
# Đặt cuối để không nuốt route /my
# =========================================================
@router.get(
    "/{request_id}",
    response_model=MaintenanceResponse
)
def get_maintenance_request(
    request_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    maintenance = db.query(
        MaintenanceRequest
    ).filter(
        MaintenanceRequest.id
        == request_id
    ).first()

    if maintenance is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy phiếu bảo trì"
        )

    return maintenance