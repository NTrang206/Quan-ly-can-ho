from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel

class ReceivableCreate(BaseModel):
    contract_id: int
    billing_month: int
    billing_year: int
    service_amount: Decimal = Decimal("0")
    electricity_cost: Decimal = Decimal("0")
    electricity_usage_kwh: Decimal = Decimal("0")
    water_cost: Decimal = Decimal("0")
    water_usage_m3: Decimal = Decimal("0")
    management_cost: Decimal = Decimal("0")
    parking_cost: Decimal = Decimal("0")
    internet_cost: Decimal = Decimal("0")


class MonthlyReceivableGenerateRequest(BaseModel):
    billing_month: int
    billing_year: int
    service_amount: Decimal = Decimal("0")


class MonthlyReceivableGenerateResponse(BaseModel):
    count: int
    total_amount: Decimal


class ReceivableResponse(BaseModel):
    id: int

    contract_id: int
    apartment_id: int

    billing_month: int
    billing_year: int

    room_amount: Decimal
    service_amount: Decimal
    electricity_cost: Decimal | None = Decimal("0")
    electricity_usage_kwh: Decimal | None = Decimal("0")
    water_cost: Decimal | None = Decimal("0")
    water_usage_m3: Decimal | None = Decimal("0")
    management_cost: Decimal | None = Decimal("0")
    parking_cost: Decimal | None = Decimal("0")
    internet_cost: Decimal | None = Decimal("0")
    total_amount: Decimal
    paid_amount: Decimal

    status: str
    due_date: date

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
class VietQRResponse(BaseModel):
    receivable_id: int
    contract_id: int
    amount: int

    bank_id: str
    account_no: str
    account_name: str

    transfer_content: str
    qr_url: str