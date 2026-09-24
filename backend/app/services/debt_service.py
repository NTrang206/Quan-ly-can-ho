from sqlalchemy.orm import Session
from sqlalchemy import func

from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException

from app.models.debt_ledger import DebtLedger
from app.models.tenant import Tenant
from app.models.contract import Contract
from app.models.receivable import Receivable
from app.models.payment import Payment


def recalculate_debt(
    tenant_id: int,
    db: Session
):

    # Kiểm tra Tenant
    tenant = db.query(Tenant).filter(
        Tenant.id == tenant_id
    ).first()

    if tenant is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy khách thuê"
        )

    # Tổng số tiền phải thu
    total_receivable = (
        db.query(
            func.coalesce(
                func.sum(Receivable.total_amount),
                0
            )
        )
        .join(
            Contract,
            Receivable.contract_id == Contract.id
        )
        .filter(
            Contract.tenant_id == tenant_id
        )
        .scalar()
    )

    # Tổng số tiền đã thanh toán
    total_paid = (
        db.query(
            func.coalesce(
                func.sum(Payment.amount),
                0
            )
        )
        .join(
            Receivable,
            Payment.receivable_id == Receivable.id
        )
        .join(
            Contract,
            Receivable.contract_id == Contract.id
        )
        .filter(
            Contract.tenant_id == tenant_id
        )
        .scalar()
    )

    total_receivable = Decimal(
        str(total_receivable)
    )

    total_paid = Decimal(
        str(total_paid)
    )

    current_debt = (
        total_receivable
        - total_paid
    )

    # Tìm sổ công nợ
    ledger = db.query(DebtLedger).filter(
        DebtLedger.tenant_id == tenant_id
    ).first()

    # Nếu chưa có thì tạo
    if ledger is None:

        ledger = DebtLedger(
            tenant_id=tenant_id,
            total_receivable=total_receivable,
            total_paid=total_paid,
            current_debt=current_debt,
            last_updated=datetime.now()
        )

        db.add(ledger)

    # Nếu đã có thì cập nhật
    else:

        ledger.total_receivable = (
            total_receivable
        )

        ledger.total_paid = (
            total_paid
        )

        ledger.current_debt = (
            current_debt
        )

        ledger.last_updated = (
            datetime.now()
        )

    db.commit()
    db.refresh(ledger)

    return ledger