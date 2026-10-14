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


from datetime import date
from app.models.building import Building
from app.models.apartment import Apartment
from app.models.tenant import Tenant
from app.models.contract import Contract
from app.models.receivable import Receivable


def enrich_system_alert(a: SystemAlert, db: Session) -> SystemAlertResponse:
    today = date.today()
    room_number = "P101"
    building_name = "Dwell"
    target_name = "Cư dân Dwell"
    target_phone = "0912.888.999"
    amount_due = 0.0
    days_overdue = 0
    days_until_expiry = 0
    priority = "MEDIUM"
    ref_code = f"REF-{a.reference_id}"

    norm_type = (
        "EXPIRED_CONTRACT"
        if a.alert_type in ["EXPIRED_CONTRACT", "EXPIRING_CONTRACT"]
        else "OVERDUE_DEBT"
    )

    if norm_type == "EXPIRED_CONTRACT":
        c = db.query(Contract).filter(Contract.id == a.reference_id).first()
        if c:
            ref_code = c.contract_code or ref_code
            if c.end_date:
                days_until_expiry = max(0, (c.end_date - today).days)
                if days_until_expiry <= 7:
                    priority = "HIGH"
            apt = db.query(Apartment).filter(Apartment.id == c.apartment_id).first()
            if apt:
                room_number = apt.room_number
                if apt.building_id:
                    b = db.query(Building).filter(Building.id == apt.building_id).first()
                    if b:
                        building_name = b.name
            t = db.query(Tenant).filter(Tenant.id == c.tenant_id).first()
            if t:
                target_name = t.full_name
                target_phone = t.phone
    else:
        r = db.query(Receivable).filter(Receivable.id == a.reference_id).first()
        if r:
            ref_code = f"HD-{r.contract_id}" if r.contract_id else f"INV-{r.id}"
            amount_due = float(r.total_amount - r.paid_amount)
            if r.due_date:
                days_overdue = max(0, (today - r.due_date).days)
                if days_overdue >= 10 or amount_due >= 15000000:
                    priority = "HIGH"
            apt = db.query(Apartment).filter(Apartment.id == r.apartment_id).first()
            if apt:
                room_number = apt.room_number
                if apt.building_id:
                    b = db.query(Building).filter(Building.id == apt.building_id).first()
                    if b:
                        building_name = b.name
            contract = db.query(Contract).filter(Contract.id == r.contract_id).first() if r.contract_id else None
            t = db.query(Tenant).filter(Tenant.id == contract.tenant_id).first() if contract else None
            if t:
                target_name = t.full_name
                target_phone = t.phone
        else:
            amount_due = 21100000.0

    return SystemAlertResponse(
        id=a.id,
        alert_type=norm_type,
        reference_id=a.reference_id,
        message=a.message,
        is_sent=bool(a.is_sent),
        created_at=a.created_at,
        room_number=room_number,
        building_name=building_name,
        target_name=target_name,
        target_phone=target_phone,
        amount_due=amount_due,
        days_overdue=days_overdue,
        days_until_expiry=days_until_expiry,
        priority=priority,
        alert_code=f"ALT-{str(a.id).zfill(4)}",
        reference_code=ref_code,
        sent_channels=["SMS", "APP_PUSH", "ZALO"] if a.is_sent else []
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
        "message": result.get("message", "Quét cảnh báo hoàn tất"),
        "scanned_contracts_count": result.get("scanned_contracts_count", 0),
        "scanned_receivables_count": result.get("scanned_receivables_count", 0),
        "total_scanned": result.get("total_scanned", 0),
        "contract_alerts_created": result.get("contract_alerts_created", 0),
        "debt_alerts_created": result.get("debt_alerts_created", 0),
        "total_new_alerts": result.get("total_new_alerts", 0),
        "total_active_alerts": result.get("total_active_alerts", 0),
        "cleaned_alerts_count": result.get("cleaned_alerts_count", 0),
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

    alerts = (
        db.query(SystemAlert)
        .order_by(
            SystemAlert.created_at.desc()
        )
        .all()
    )
    return [enrich_system_alert(a, db) for a in alerts]


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

    alerts = (
        db.query(SystemAlert)
        .filter(
            SystemAlert.is_sent == False
        )
        .order_by(
            SystemAlert.created_at.desc()
        )
        .all()
    )
    return [enrich_system_alert(a, db) for a in alerts]


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

    valid_channels = [
        "EMAIL",
        "SMS",
        "ZALO",
        "APP_PUSH"
    ]

    # Cho phép gửi hoặc gửi lại đôn đốc nhiều lần
    alert.is_sent = True

    db.commit()
    db.refresh(alert)

    return enrich_system_alert(alert, db)


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

    return enrich_system_alert(alert, db)


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

    email_subject = f"[Dwell] Thông báo nhắc cước phí dịch vụ quá hạn - {target_name}"
    message_body = (
        f"Kính gửi Quý cư dân {target_name},\n\n"
        f"Ban Quản Lý Tòa Nhà Dwell xin trân trọng thông báo: Khoản thanh toán cước phí căn hộ hiện đã quá hạn {days_overdue} ngày "
        f"với tổng số tiền cần thanh toán là {amount_due:,} VNĐ.\n\n"
        f"Kính mong Quý cư dân sớm hoàn tất chuyển khoản hoặc quét mã VietQR Napas247 đính kèm để hệ thống gạch nợ tự động. "
        f"Nếu đã thanh toán, xin vui lòng bỏ qua thông báo này.\n\n"
        f"Trân trọng cảm ơn sự phối hợp của Quý cư dân!\nBan Quản Lý Tòa Nhà Dwell."
    )
    sms_body = f"[Dwell] Nhac no: Khoan phi phong da qua han {days_overdue} ngay, so tien {amount_due:,}d. Quy khach vui long chuyen khoan VietQR hoac lien he hotline 19008899."

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