from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.system_alert import SystemAlert
from app.models.user import User

from app.schemas.system_alert import (
    AlertScanRequest,
    AlertMarkSentRequest,
    SystemAlertResponse
)

from app.dependencies.auth import require_roles
from app.services.alert_service import scan_alerts as run_alert_scan


router = APIRouter(
    prefix="/alerts",
    tags=["System Alerts"]
)


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

    try:
        result = run_alert_scan(data.days_to_end, db)
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "message": "Quét cảnh báo hoàn tất",

        "contract_alerts_created":
            result["contract_alerts_created"],

        "debt_alerts_created":
            result["debt_alerts_created"]
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