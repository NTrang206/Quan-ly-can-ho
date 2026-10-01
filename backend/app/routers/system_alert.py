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

    return alert


# =========================================================
# AI SINH NỘI DUNG ĐÔN ĐỐC / NHẮC NỢ
# =========================================================
@router.post(
    "/{alert_id}/generate-dunning"
)
def generate_dunning_message(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN", "STAFF", "ACCOUNTANT")
    )
):
    alert = db.query(SystemAlert).filter(SystemAlert.id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy cảnh báo")

    target_name = "Quý cư dân"
    target_phone = "0904.123.456"
    amount_due = 21100000
    days_overdue = 12

    # Trích xuất từ message
    import re
    due_match = re.search(r"Số nợ cần thu:\s*([\d\.,]+)", alert.message)
    if due_match:
        try:
            amount_due = int(due_match.group(1).replace(".", "").replace(",", ""))
        except:
            pass

    phone_match = re.search(r"\((\d{10,11})\)", alert.message)
    if phone_match:
        target_phone = phone_match.group(1)

    name_match = re.search(r"Khách thuê:\s*([^\(]+)", alert.message)
    if name_match:
        target_name = name_match.group(1).strip()

    overdue_match = re.search(r"quá hạn\s+(\d+)\s+ngày", alert.message)
    if overdue_match:
        days_overdue = int(overdue_match.group(1))

    email_subject = f"[Dwell Sunshine Homes] Thông báo nhắc cước phí dịch vụ quá hạn - {target_name}"
    message_body = (
        f"Kính gửi Quý cư dân {target_name},\n\n"
        f"Ban Quản Lý Tòa Nhà Sunshine Homes xin trân trọng thông báo: Khoản thanh toán cước phí căn hộ hiện đã quá hạn {days_overdue} ngày "
        f"với tổng số tiền cần thanh toán là {amount_due:,} VNĐ.\n\n"
        f"Kính mong Quý cư dân sớm hoàn tất chuyển khoản hoặc quét mã VietQR Napas247 đính kèm để hệ thống gạch nợ tự động. "
        f"Nếu đã thanh toán, xin vui lòng bỏ qua thông báo này.\n\n"
        f"Trân trọng cảm ơn sự phối hợp của Quý cư dân!\nBan Quản Lý Tòa Nhà Sunshine Homes."
    )
    sms_body = f"[Sunshine Homes] Nhac no: Khoan phi phong da qua han {days_overdue} ngay, so tien {amount_due:,}d. Quy khach vui long chuyen khoan VietQR hoac lien he hotline 19008899."

    return {
        "alert_id": alert.id,
        "message_body": message_body,
        "sms_body": sms_body,
        "email_subject": email_subject,
        "recipient_name": target_name,
        "recipient_phone": target_phone,
        "amount_due": amount_due,
        "days_overdue": days_overdue
    }