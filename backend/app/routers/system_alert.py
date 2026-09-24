from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from datetime import date, timedelta

from app.database import get_db

from app.models.system_alert import SystemAlert
from app.models.contract import Contract
from app.models.receivable import Receivable
from app.models.user import User

from app.schemas.system_alert import (
    AlertScanRequest,
    AlertMarkSentRequest,
    SystemAlertResponse
)

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/alerts",
    tags=["System Alerts"]
)


# =========================================================
# HÀM KIỂM TRA ALERT ĐÃ TỒN TẠI
# =========================================================
def alert_exists(
    db: Session,
    alert_type: str,
    reference_id: int
):

    return db.query(SystemAlert).filter(
        SystemAlert.alert_type == alert_type,
        SystemAlert.reference_id == reference_id
    ).first() is not None


# =========================================================
# RULE ENGINE
# QUÉT HĐ SẮP HẾT HẠN + NỢ QUÁ HẠN
# =========================================================
@router.post("/scan")
def scan_alerts(
    data: AlertScanRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    today = date.today()

    end_limit = (
        today
        + timedelta(days=data.days_to_end)
    )

    contract_alert_count = 0
    debt_alert_count = 0

    # =====================================================
    # 1. QUÉT HỢP ĐỒNG SẮP HẾT HẠN
    # =====================================================
    contracts = db.query(Contract).filter(
        Contract.status == "ACTIVE",
        Contract.end_date >= today,
        Contract.end_date <= end_limit
    ).all()

    for contract in contracts:

        days_left = (
            contract.end_date - today
        ).days

        if not alert_exists(
            db,
            "EXPIRED_CONTRACT",
            contract.id
        ):

            alert = SystemAlert(
                alert_type="EXPIRED_CONTRACT",
                reference_id=contract.id,

                message=(
                    f"Hợp đồng {contract.contract_code} "
                    f"sẽ hết hạn sau {days_left} ngày "
                    f"({contract.end_date})."
                ),

                is_sent=False
            )

            db.add(alert)

            contract_alert_count += 1

    # =====================================================
    # 2. QUÉT KHOẢN THU QUÁ HẠN
    # =====================================================
    receivables = db.query(Receivable).filter(
        Receivable.due_date < today,
        Receivable.status != "PAID"
    ).all()

    for receivable in receivables:

        remaining = (
            receivable.total_amount
            - receivable.paid_amount
        )

        if remaining <= 0:
            continue

        # Đồng bộ trạng thái
        receivable.status = "OVERDUE"

        days_overdue = (
            today - receivable.due_date
        ).days

        if not alert_exists(
            db,
            "OVERDUE_DEBT",
            receivable.id
        ):

            alert = SystemAlert(
                alert_type="OVERDUE_DEBT",
                reference_id=receivable.id,

                message=(
                    f"Khoản thu #{receivable.id} "
                    f"đã quá hạn {days_overdue} ngày. "
                    f"Số tiền còn nợ: {remaining} VNĐ."
                ),

                is_sent=False
            )

            db.add(alert)

            debt_alert_count += 1

    db.commit()

    return {
        "message": "Quét cảnh báo hoàn tất",

        "contract_alerts_created":
            contract_alert_count,

        "debt_alerts_created":
            debt_alert_count
    }


# =========================================================
# DANH SÁCH ALERT
# =========================================================
@router.get(
    "",
    response_model=list[SystemAlertResponse]
)
def get_alerts(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    return (
        db.query(SystemAlert)
        .order_by(
            SystemAlert.created_at.desc()
        )
        .all()
    )


# =========================================================
# CHỈ ALERT CHƯA GỬI
# =========================================================
@router.get(
    "/unsent",
    response_model=list[SystemAlertResponse]
)
def get_unsent_alerts(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    return (
        db.query(SystemAlert)
        .filter(
            SystemAlert.is_sent == False
        )
        .order_by(
            SystemAlert.created_at.desc()
        )
        .all()
    )


# =========================================================
# ĐÁNH DẤU ĐÃ GỬI
#
# Đây chỉ cập nhật trạng thái.
# Adapter gửi Email/Zalo/SMS thật sẽ nối ở AI/Notification.
# =========================================================
@router.patch(
    "/{alert_id}/mark-sent",
    response_model=SystemAlertResponse
)
def mark_alert_sent(
    alert_id: int,
    data: AlertMarkSentRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    alert = db.query(SystemAlert).filter(
        SystemAlert.id == alert_id
    ).first()

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy cảnh báo"
        )

    if alert.is_sent:
        raise HTTPException(
            status_code=400,
            detail="Cảnh báo đã được gửi"
        )

    valid_channels = [
        "EMAIL",
        "SMS",
        "ZALO"
    ]

    if data.channel not in valid_channels:
        raise HTTPException(
            status_code=400,
            detail="Kênh gửi không hợp lệ"
        )

    alert.is_sent = True

    db.commit()
    db.refresh(alert)

    return alert


# =========================================================
# XEM ALERT
# =========================================================
@router.get(
    "/{alert_id}",
    response_model=SystemAlertResponse
)
def get_alert(
    alert_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    alert = db.query(SystemAlert).filter(
        SystemAlert.id == alert_id
    ).first()

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy cảnh báo"
        )

    return alert