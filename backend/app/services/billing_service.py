from datetime import date
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.contract import Contract
from app.models.receivable import Receivable


def generate_monthly_receivables(
    billing_month: int,
    billing_year: int,
    service_amount: Decimal,
    db: Session
):
    if billing_month < 1 or billing_month > 12:
        raise HTTPException(
            status_code=400,
            detail="Tháng thu phải từ 1 đến 12"
        )

    if billing_year < 2000:
        raise HTTPException(
            status_code=400,
            detail="Năm thu không hợp lệ"
        )

    if service_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Tiền dịch vụ không được nhỏ hơn 0"
        )

    active_contracts = db.query(Contract).filter(
        Contract.status == "ACTIVE"
    ).all()

    created_count = 0
    total_amount = Decimal("0")
    due_date = date(billing_year, billing_month, 10)

    for contract in active_contracts:
        existing = db.query(Receivable).filter(
            Receivable.contract_id == contract.id,
            Receivable.billing_month == billing_month,
            Receivable.billing_year == billing_year
        ).first()

        if existing is not None:
            continue

        total = (
            Decimal(str(contract.rental_price))
            + service_amount
        )
        db.add(
            Receivable(
                contract_id=contract.id,
                apartment_id=contract.apartment_id,
                billing_month=billing_month,
                billing_year=billing_year,
                room_amount=contract.rental_price,
                service_amount=service_amount,
                total_amount=total,
                paid_amount=Decimal("0"),
                status="UNPAID",
                due_date=due_date
            )
        )
        created_count += 1
        total_amount += total

    return {
        "count": created_count,
        "total_amount": total_amount
    }
