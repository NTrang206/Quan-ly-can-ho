from sqlalchemy.orm import Session
from sqlalchemy import func

from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException

from app.models.debt_ledger import DebtLedger
from app.models.tenant import Tenant
from app.models.contract import Contract
from app.models.receivable import Receivable
from app.models.payment import Payment


def recalculate_debt(
    tenant_id: int,
    db: Session,
    commit: bool = True
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

    if commit:
        db.commit()
    else:
        db.flush()

    db.refresh(ledger)

    return ledger


def apply_deposit_offset(
    tenant_id: int,
    amount: Decimal,
    handled_by: int,
    deposit_id: int,
    db: Session
):
    """Apply deposit money to the tenant's oldest unpaid receivables."""
    remaining_offset = Decimal(str(amount))

    receivables = (
        db.query(Receivable)
        .join(Contract, Receivable.contract_id == Contract.id)
        .filter(
            Contract.tenant_id == tenant_id,
            Receivable.total_amount > Receivable.paid_amount
        )
        .order_by(Receivable.due_date.asc(), Receivable.id.asc())
        .all()
    )

    for receivable in receivables:
        if remaining_offset <= 0:
            break

        receivable_remaining = (
            Decimal(str(receivable.total_amount))
            - Decimal(str(receivable.paid_amount))
        )
        applied_amount = min(remaining_offset, receivable_remaining)

        receivable.paid_amount += applied_amount
        receivable.status = (
            "PAID"
            if receivable.paid_amount == receivable.total_amount
            else "PARTIAL"
        )

        db.add(
            Payment(
                receivable_id=receivable.id,
                amount=applied_amount,
                payment_method="DEPOSIT_OFFSET",
                transaction_code=(
                    f"DEP-{deposit_id}-{receivable.id}-"
                    f"{uuid4().hex[:6].upper()}"
                ),
                note="Cấn trừ công nợ từ tiền cọc khi thanh lý",
                handled_by=handled_by
            )
        )

        remaining_offset -= applied_amount

    return Decimal(str(amount)) - remaining_offset