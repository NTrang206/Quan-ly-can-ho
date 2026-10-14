from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.receivable import Receivable
from app.models.system_alert import SystemAlert
from app.models.apartment import Apartment
from app.models.tenant import Tenant


def clean_duplicate_alerts(db: Session):
    """
    Dọn dẹp các cảnh báo trùng lặp và chuẩn hóa alert_type:
    - EXPIRING_CONTRACT -> EXPIRED_CONTRACT
    - OVERDUE_RECEIVABLE -> OVERDUE_DEBT
    """
    alerts = db.query(SystemAlert).order_by(SystemAlert.id.asc()).all()
    seen = {}
    duplicates = []

    for a in alerts:
        normalized_type = (
            "EXPIRED_CONTRACT"
            if a.alert_type in ["EXPIRED_CONTRACT", "EXPIRING_CONTRACT"]
            else "OVERDUE_DEBT"
        )
        a.alert_type = normalized_type
        key = (normalized_type, a.reference_id)

        if key in seen:
            duplicates.append(a)
        else:
            seen[key] = a

    for dup in duplicates:
        db.delete(dup)


def scan_alerts(
    days_to_end: int,
    db: Session
):
    today = date.today()
    end_limit = today + timedelta(days=days_to_end)

    # 1. Dọn dẹp dữ liệu trùng lặp trước khi quét
    clean_duplicate_alerts(db)

    # 2. Thống kê tổng số hồ sơ quét
    scanned_contracts_count = db.query(Contract).count()
    scanned_receivables_count = db.query(Receivable).count()

    contract_alerts_created = 0
    debt_alerts_created = 0

    # 3. Quét hợp đồng sắp hết hạn (trong vòng days_to_end ngày)
    expiring_contracts = db.query(Contract).filter(
        Contract.status == "ACTIVE",
        Contract.end_date <= end_limit
    ).all()

    for contract in expiring_contracts:
        days_left = max(0, (contract.end_date - today).days)
        apt = db.query(Apartment).filter(Apartment.id == contract.apartment_id).first()
        tenant = db.query(Tenant).filter(Tenant.id == contract.tenant_id).first()

        room_no = apt.room_number if apt else "P101"
        tenant_name = tenant.full_name if tenant else "Cư dân"
        tenant_phone = tenant.phone if tenant else ""

        message = (
            f"Hợp đồng {contract.contract_code} của cư dân {tenant_name} tại căn {room_no} "
            f"sẽ hết hạn sau {days_left} ngày ({contract.end_date}). Cần liên hệ gia hạn hoặc chuẩn bị bàn giao."
        )

        existing = db.query(SystemAlert).filter(
            SystemAlert.alert_type == "EXPIRED_CONTRACT",
            SystemAlert.reference_id == contract.id
        ).first()

        if existing:
            existing.message = message
        else:
            db.add(
                SystemAlert(
                    alert_type="EXPIRED_CONTRACT",
                    reference_id=contract.id,
                    message=message,
                    is_sent=False
                )
            )
            contract_alerts_created += 1

    # 4. Quét công nợ quá hạn (hóa đơn đến hạn chưa nộp)
    overdue_receivables = db.query(Receivable).filter(
        Receivable.due_date < today,
        Receivable.status != "PAID"
    ).all()

    for rec in overdue_receivables:
        remaining = float(rec.total_amount - rec.paid_amount)
        if remaining <= 0:
            continue

        rec.status = "OVERDUE"
        days_overdue = (today - rec.due_date).days

        contract = db.query(Contract).filter(Contract.id == rec.contract_id).first() if rec.contract_id else None
        tenant = db.query(Tenant).filter(Tenant.id == contract.tenant_id).first() if contract else None

        apt_id = rec.apartment_id or (contract.apartment_id if contract else None)
        apt = db.query(Apartment).filter(Apartment.id == apt_id).first() if apt_id else None
        room_no = apt.room_number if apt else "P101"
        tenant_name = tenant.full_name if tenant else "Cư dân"
        tenant_phone = tenant.phone if tenant else ""

        message = (
            f"Hóa đơn tiền phòng & dịch vụ căn {room_no} (khoản thu #{rec.id}) "
            f"quá hạn {days_overdue} ngày. Số nợ cần thu: {remaining:,.0f} VNĐ. Khách thuê: {tenant_name} ({tenant_phone})."
        )

        existing = db.query(SystemAlert).filter(
            SystemAlert.alert_type == "OVERDUE_DEBT",
            SystemAlert.reference_id == rec.id
        ).first()

        if existing:
            existing.message = message
        else:
            db.add(
                SystemAlert(
                    alert_type="OVERDUE_DEBT",
                    reference_id=rec.id,
                    message=message,
                    is_sent=False
                )
            )
            debt_alerts_created += 1

    # 5. Tự động dọn dẹp các cảnh báo đã giải quyết (Self-healing)
    active_rec_alerts = db.query(SystemAlert).filter(SystemAlert.alert_type == "OVERDUE_DEBT").all()
    cleaned_count = 0
    for ra in active_rec_alerts:
        r = db.query(Receivable).filter(Receivable.id == ra.reference_id).first()
        if not r or r.status == "PAID" or (r.total_amount - r.paid_amount) <= 0:
            db.delete(ra)
            cleaned_count += 1

    db.commit()

    total_active_alerts = db.query(SystemAlert).count()

    return {
        "message": "Quét toàn diện hệ thống hoàn tất",
        "scanned_contracts_count": scanned_contracts_count,
        "scanned_receivables_count": scanned_receivables_count,
        "total_scanned": scanned_contracts_count + scanned_receivables_count,
        "contract_alerts_created": contract_alerts_created,
        "debt_alerts_created": debt_alerts_created,
        "total_new_alerts": contract_alerts_created + debt_alerts_created,
        "total_active_alerts": total_active_alerts,
        "cleaned_alerts_count": cleaned_count
    }
