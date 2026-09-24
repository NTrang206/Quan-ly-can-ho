from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from datetime import date

from app.database import get_db
from app.services.debt_service import recalculate_debt
from app.models.deposit import Deposit
from app.models.contract import Contract
from app.models.tenant import Tenant
from app.models.user import User

from app.schemas.deposit import (
    ReceiveDepositRequest,
    SettleDepositRequest,
    DepositSettlementPreviewRequest,
    DepositResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/deposits",
    tags=["Deposits"]
)


# =========================================================
# DANH SÁCH TIỀN CỌC
# =========================================================
@router.get(
    "",
    response_model=list[DepositResponse]
)
def get_deposits(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "ACCOUNTANT"
        )
    )
):

    return db.query(Deposit).all()


# =========================================================
# TENANT XEM TIỀN CỌC CỦA MÌNH
# =========================================================
@router.get(
    "/my",
    response_model=list[DepositResponse]
)
def get_my_deposits(
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

    deposits = (
        db.query(Deposit)
        .join(
            Contract,
            Deposit.contract_id == Contract.id
        )
        .filter(
            Contract.tenant_id == tenant.id
        )
        .all()
    )

    return deposits


# =========================================================
# GHI NHẬN THU TIỀN CỌC
# PENDING -> HELD
# =========================================================
@router.patch(
    "/contract/{contract_id}/receive",
    response_model=DepositResponse
)
def receive_deposit(
    contract_id: int,
    data: ReceiveDepositRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
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

    if contract.status != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Chỉ hợp đồng DRAFT mới được thu cọc"
        )

    deposit = db.query(Deposit).filter(
        Deposit.contract_id == contract_id
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bản ghi tiền cọc"
        )

    if deposit.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Tiền cọc không ở trạng thái PENDING"
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Số tiền cọc phải lớn hơn 0"
        )

    # Theo luồng hiện tại:
    # phải nộp đủ số tiền cọc hợp đồng
    if data.amount < contract.deposit_amount:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Chưa đủ tiền cọc. "
                f"Cần nộp {contract.deposit_amount}"
            )
        )

    deposit.amount = data.amount
    deposit.paid_date = date.today()

    deposit.status = "HELD"

    deposit.handled_by = current_user.id

    db.commit()
    db.refresh(deposit)

    return deposit


# =========================================================
# XEM TIỀN CỌC THEO CONTRACT
# =========================================================
@router.get(
    "/contract/{contract_id}",
    response_model=DepositResponse
)
def get_deposit_by_contract(
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

    deposit = db.query(Deposit).filter(
        Deposit.contract_id == contract_id
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=404,
            detail="Hợp đồng chưa có thông tin tiền cọc"
        )

    return deposit


# =========================================================
# THANH LÝ / HOÀN CỌC
# HELD -> REFUNDED / DEDUCTED
# =========================================================
@router.patch(
    "/contract/{contract_id}/settle",
    response_model=DepositResponse
)
def settle_deposit(
    contract_id: int,
    data: SettleDepositRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "ACCOUNTANT"
        )
    )
):

    # 1. Contract
    contract = db.query(Contract).filter(
        Contract.id == contract_id
    ).first()

    if contract is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy hợp đồng"
        )

    # Chỉ xử lý cọc khi đang chuẩn bị kết thúc HĐ
    if contract.status not in [
        "ACTIVE",
        "EXPIRED"
    ]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Chỉ hợp đồng ACTIVE hoặc EXPIRED "
                "mới được thanh lý tiền cọc"
            )
        )

    # 2. Deposit
    deposit = db.query(Deposit).filter(
        Deposit.contract_id == contract_id
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tiền cọc"
        )

    if deposit.status != "HELD":
        raise HTTPException(
            status_code=400,
            detail="Tiền cọc không ở trạng thái HELD"
        )

    # 3. Kiểm tra công nợ
    ledger = recalculate_debt(
        contract.tenant_id,
        db
    )

    if ledger.current_debt > 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Khách thuê còn nợ "
                f"{ledger.current_debt}. "
                f"Cần chốt công nợ trước khi hoàn cọc."
            )
        )

    # 4. Kiểm tra khấu trừ
    if data.deduction_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Số tiền khấu trừ không hợp lệ"
        )

    if data.deduction_amount > deposit.amount:
        raise HTTPException(
            status_code=400,
            detail="Tiền khấu trừ lớn hơn tiền cọc"
        )

    if (
        data.deduction_amount > 0
        and not data.deduction_reason
    ):
        raise HTTPException(
            status_code=400,
            detail="Phải nhập lý do khấu trừ"
        )

    # 5. Tính tiền hoàn
    refund = (
        deposit.amount
        - data.deduction_amount
    )

    deposit.deduction_amount = (
        data.deduction_amount
    )

    deposit.deduction_reason = (
        data.deduction_reason
    )

    deposit.refund_amount = refund

    deposit.handled_by = current_user.id

    # Theo class design hiện tại
    if refund > 0:
        deposit.status = "REFUNDED"
    else:
        deposit.status = "DEDUCTED"

    db.commit()
    db.refresh(deposit)

    return deposit
# =========================================================
# XEM TRƯỚC SỐ TIỀN HOÀN CỌC
# =========================================================
@router.post(
    "/contract/{contract_id}/settlement-preview"
)
def preview_deposit_settlement(
    contract_id: int,
    data: DepositSettlementPreviewRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
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

    deposit = db.query(Deposit).filter(
        Deposit.contract_id == contract_id
    ).first()

    if deposit is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tiền cọc"
        )

    if deposit.status != "HELD":
        raise HTTPException(
            status_code=400,
            detail="Tiền cọc không ở trạng thái HELD"
        )

    if data.deduction_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Tiền khấu trừ không hợp lệ"
        )

    if data.deduction_amount > deposit.amount:
        raise HTTPException(
            status_code=400,
            detail="Tiền khấu trừ lớn hơn tiền cọc"
        )

    # Tính lại công nợ mới nhất
    ledger = recalculate_debt(
        contract.tenant_id,
        db
    )

    current_debt = ledger.current_debt

    # Công thức trong tài liệu:
    # hoàn = cọc - khấu trừ - công nợ
    estimated_refund = (
        deposit.amount
        - data.deduction_amount
        - current_debt
    )

    extra_amount_due = 0

    if estimated_refund < 0:
        extra_amount_due = abs(
            estimated_refund
        )

        estimated_refund = 0

    return {
        "contract_id": contract.id,
        "deposit_amount": deposit.amount,
        "deduction_amount": data.deduction_amount,
        "current_debt": current_debt,
        "estimated_refund": estimated_refund,
        "extra_amount_due": extra_amount_due
    }