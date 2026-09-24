from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from datetime import date

from app.database import get_db
from app.models.tenant import Tenant
from app.models.receivable import Receivable
from app.models.contract import Contract
from app.models.user import User

from app.schemas.receivable import (
    ReceivableCreate,
    ReceivableResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/receivables",
    tags=["Receivables"]
)


# =========================================================
# TẠO KHOẢN PHẢI THU HÀNG THÁNG
# =========================================================
@router.post(
    "",
    response_model=ReceivableResponse
)
def create_receivable(
    data: ReceivableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "ACCOUNTANT"
        )
    )
):

    # 1. Kiểm tra tháng
    if data.billing_month < 1 or data.billing_month > 12:
        raise HTTPException(
            status_code=400,
            detail="Tháng thu phải từ 1 đến 12"
        )

    # 2. Kiểm tra năm
    if data.billing_year < 2000:
        raise HTTPException(
            status_code=400,
            detail="Năm thu không hợp lệ"
        )

    # 3. Tiền dịch vụ không được âm
    if data.service_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Tiền dịch vụ không được nhỏ hơn 0"
        )

    # 4. Tìm hợp đồng
    contract = db.query(Contract).filter(
        Contract.id == data.contract_id
    ).first()

    if contract is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hợp đồng"
        )

    # 5. Chỉ sinh khoản thu từ hợp đồng ACTIVE
    if contract.status != "ACTIVE":
        raise HTTPException(
            status_code=400,
            detail="Chỉ hợp đồng ACTIVE mới được sinh khoản phải thu"
        )

    # 6. Chống sinh trùng cùng kỳ
    existing = db.query(Receivable).filter(
        Receivable.contract_id == data.contract_id,
        Receivable.billing_month == data.billing_month,
        Receivable.billing_year == data.billing_year
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Khoản phải thu của kỳ này đã tồn tại"
        )

    # 7. Tiền phòng lấy từ hợp đồng
    room_amount = contract.rental_price

    # 8. Tổng phải thu
    total_amount = (
        room_amount
        + data.service_amount
    )

    # 9. Hạn nộp ngày 10 hàng tháng
    due_date = date(
        data.billing_year,
        data.billing_month,
        10
    )

    # 10. Tạo khoản phải thu
    receivable = Receivable(
        contract_id=contract.id,
        apartment_id=contract.apartment_id,
        billing_month=data.billing_month,
        billing_year=data.billing_year,
        room_amount=room_amount,
        service_amount=data.service_amount,
        total_amount=total_amount,
        paid_amount=0,
        status="UNPAID",
        due_date=due_date
    )

    db.add(receivable)
    db.commit()
    db.refresh(receivable)

    return receivable


# =========================================================
# KIỂM TRA VÀ CẬP NHẬT CÁC KHOẢN QUÁ HẠN
# =========================================================
@router.patch("/check-overdue")
def check_overdue_receivables(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "ACCOUNTANT"
        )
    )
):

    today = date.today()

    receivables = db.query(Receivable).filter(
        Receivable.status.in_(
            ["UNPAID", "PARTIAL"]
        )
    ).all()

    updated_count = 0

    for receivable in receivables:

        if (
            today > receivable.due_date
            and receivable.paid_amount
            < receivable.total_amount
        ):

            receivable.status = "OVERDUE"

            updated_count += 1

    db.commit()

    return {
        "message": "Kiểm tra quá hạn thành công",
        "updated_count": updated_count
    }


# =========================================================
# LẤY DANH SÁCH KHOẢN PHẢI THU
# =========================================================
@router.get(
    "",
    response_model=list[ReceivableResponse]
)
def get_receivables(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    return db.query(Receivable).all()


# =========================================================
# LẤY KHOẢN THU THEO HỢP ĐỒNG
# =========================================================
@router.get(
    "/contract/{contract_id}",
    response_model=list[ReceivableResponse]
)
def get_receivables_by_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    contract = db.query(Contract).filter(
        Contract.id == contract_id
    ).first()

    if contract is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hợp đồng"
        )

    receivables = db.query(Receivable).filter(
        Receivable.contract_id == contract_id
    ).all()

    return receivables


# =========================================================
# XEM CHI TIẾT MỘT KHOẢN THU
# =========================================================
@router.get(
    "/my",
    response_model=list[ReceivableResponse]
)
def get_my_receivables(
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

    receivables = (
        db.query(Receivable)
        .join(
            Contract,
            Receivable.contract_id == Contract.id
        )
        .filter(
            Contract.tenant_id == tenant.id
        )
        .all()
    )

    return receivables
@router.get(
    "/{receivable_id}",
    response_model=ReceivableResponse
)
def get_receivable(
    receivable_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    receivable = db.query(Receivable).filter(
        Receivable.id == receivable_id
    ).first()

    if receivable is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khoản phải thu"
        )

    return receivable