from pydantic import BaseModel, ConfigDict
from datetime import datetime
from decimal import Decimal


class PaymentCreate(BaseModel):
    receivable_id: int
    amount: Decimal
    payment_method: str
    transaction_code: str | None = None
    note: str | None = None


class PaymentResponse(BaseModel):
    id: int
    receivable_id: int
    amount: Decimal
    payment_method: str
    transaction_code: str | None
    payment_date: datetime
    note: str | None
    handled_by: int

    model_config = ConfigDict(
        from_attributes=True
    )