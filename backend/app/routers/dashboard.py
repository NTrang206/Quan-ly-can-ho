from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session
from sqlalchemy import func

from datetime import date, datetime, timedelta

from app.database import get_db
from app.models.maintenance_request import MaintenanceRequest
from app.models.apartment import Apartment
from app.models.contract import Contract
from app.models.payment import Payment
from app.models.debt_ledger import DebtLedger
from app.models.receivable import Receivable
from app.models.deposit import Deposit
from app.models.maintenance_request import (
    MaintenanceRequest
)
from app.models.system_alert import SystemAlert
from app.models.user import User

from app.dependencies.auth import require_roles


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================================================
# DASHBOARD TỔNG QUAN
# =========================================================
@router.get("/summary")
def dashboard_summary(
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

    # =====================================================
    # CĂN HỘ
    # =====================================================
    total_apartments = (
        db.query(Apartment).count()
    )

    occupied = db.query(Apartment).filter(
        Apartment.status == "OCCUPIED"
    ).count()

    available = db.query(Apartment).filter(
        Apartment.status == "AVAILABLE"
    ).count()

    reserved = db.query(Apartment).filter(
        Apartment.status == "RESERVED"
    ).count()

    maintenance = db.query(Apartment).filter(
        Apartment.status == "MAINTENANCE"
    ).count()

    occupancy_rate = 0

    if total_apartments > 0:
        occupancy_rate = round(
            occupied
            / total_apartments
            * 100,
            2
        )

    # =====================================================
    # DOANH THU THỰC THU
    # =====================================================
    total_revenue = db.query(
        func.coalesce(
            func.sum(Payment.amount),
            0
        )
    ).scalar()

    # =====================================================
    # CÔNG NỢ
    # =====================================================
    total_debt = db.query(
        func.coalesce(
            func.sum(
                DebtLedger.current_debt
            ),
            0
        )
    ).scalar()

    overdue_receivables = (
        db.query(Receivable)
        .filter(
            Receivable.status == "OVERDUE"
        )
        .count()
    )

    # =====================================================
    # CỌC ĐANG GIỮ
    # =====================================================
    held_deposit = db.query(
        func.coalesce(
            func.sum(Deposit.amount),
            0
        )
    ).filter(
        Deposit.status == "HELD"
    ).scalar()

    # =====================================================
    # HỢP ĐỒNG SẮP HẾT HẠN 30 NGÀY
    # =====================================================
    end_limit = (
        today + timedelta(days=30)
    )

    expiring_contracts = (
        db.query(Contract)
        .filter(
            Contract.status == "ACTIVE",
            Contract.end_date >= today,
            Contract.end_date <= end_limit
        )
        .count()
    )

    # =====================================================
    # BẢO TRÌ TỒN ĐỌNG
    # =====================================================
    pending_maintenance = (
        db.query(MaintenanceRequest)
        .filter(
            MaintenanceRequest.status.in_(
                [
                    "PENDING",
                    "IN_PROGRESS"
                ]
            )
        )
        .count()
    )

    # =====================================================
    # CẢNH BÁO CHƯA XỬ LÝ
    # =====================================================
    unsent_alerts = (
        db.query(SystemAlert)
        .filter(
            SystemAlert.is_sent == False
        )
        .count()
    )

    return {
        "apartments": {
            "total": total_apartments,
            "available": available,
            "reserved": reserved,
            "occupied": occupied,
            "maintenance": maintenance,
            "occupancy_rate": occupancy_rate
        },

        "finance": {
            "total_revenue": total_revenue,
            "total_debt": total_debt,
            "held_deposit": held_deposit,
            "overdue_receivables":
                overdue_receivables
        },

        "operations": {
            "expiring_contracts":
                expiring_contracts,

            "pending_maintenance":
                pending_maintenance,

            "unsent_alerts":
                unsent_alerts
        }
    }


# =========================================================
# DOANH THU THEO KHOẢNG THỜI GIAN
# =========================================================
@router.get("/revenue")
def revenue_report(
    start_date: date,
    end_date: date,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "ACCOUNTANT"
        )
    )
):

    start_datetime = datetime.combine(
        start_date,
        datetime.min.time()
    )

    end_datetime = datetime.combine(
        end_date,
        datetime.max.time()
    )

    total = db.query(
        func.coalesce(
            func.sum(Payment.amount),
            0
        )
    ).filter(
        Payment.payment_date
        >= start_datetime,

        Payment.payment_date
        <= end_datetime
    ).scalar()

    count = db.query(Payment).filter(
        Payment.payment_date
        >= start_datetime,

        Payment.payment_date
        <= end_datetime
    ).count()

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_revenue": total,
        "payment_count": count
    }


# =========================================================
# DANH SÁCH NỢ QUÁ HẠN
# =========================================================
@router.get("/overdue")
def overdue_report(
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

    receivables = db.query(
        Receivable
    ).filter(
        Receivable.due_date < today,
        Receivable.status != "PAID"
    ).all()

    result = []

    for item in receivables:

        remaining = (
            item.total_amount
            - item.paid_amount
        )

        if remaining <= 0:
            continue

        result.append({
            "receivable_id":
                item.id,

            "contract_id":
                item.contract_id,

            "due_date":
                item.due_date,

            "days_overdue":
                (
                    today - item.due_date
                ).days,

            "total_amount":
                item.total_amount,

            "paid_amount":
                item.paid_amount,

            "remaining_amount":
                remaining
        })

    return result