from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.receivable import Receivable
from app.models.system_alert import SystemAlert


def alert_exists(
    db: Session,
    alert_type: str,
    reference_id: int
):
    return db.query(SystemAlert).filter(
        SystemAlert.alert_type == alert_type,
        SystemAlert.reference_id == reference_id
    ).first() is not None


def scan_alerts(
    days_to_end: int,
    db: Session
):
    today = date.today()
    end_limit = today + timedelta(days=days_to_end)
    contract_alerts_created = 0
    debt_alerts_created = 0

    contracts = db.query(Contract).filter(
        Contract.status == "ACTIVE",
        Contract.end_date >= today,
        Contract.end_date <= end_limit
    ).all()

    for contract in contracts:
        days_left = (contract.end_date - today).days
        if alert_exists(db, "EXPIRED_CONTRACT", contract.id):
            continue

        db.add(
            SystemAlert(
                alert_type="EXPIRED_CONTRACT",
                reference_id=contract.id,
                message=(
                    f"Hợp đồng {contract.contract_code} sẽ hết hạn "
                    f"sau {days_left} ngày ({contract.end_date})."
                ),
                is_sent=False
            )
        )
        contract_alerts_created += 1

    receivables = db.query(Receivable).filter(
        Receivable.due_date < today,
        Receivable.status != "PAID"
    ).all()

    for receivable in receivables:
        remaining = receivable.total_amount - receivable.paid_amount
        if remaining <= 0:
            continue

        receivable.status = "OVERDUE"
        days_overdue = (today - receivable.due_date).days
        if alert_exists(db, "OVERDUE_DEBT", receivable.id):
            continue

        db.add(
            SystemAlert(
                alert_type="OVERDUE_DEBT",
                reference_id=receivable.id,
                message=(
                    f"Khoản thu #{receivable.id} đã quá hạn "
                    f"{days_overdue} ngày. Số tiền còn nợ: "
                    f"{remaining} VNĐ."
                ),
                is_sent=False
            )
        )
        debt_alerts_created += 1

    return {
        "contract_alerts_created": contract_alerts_created,
        "debt_alerts_created": debt_alerts_created
    }
