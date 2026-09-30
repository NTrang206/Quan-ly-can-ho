from decimal import Decimal

import pytest
from fastapi import HTTPException

from app.services.billing_service import generate_monthly_receivables


@pytest.mark.parametrize(
    "month,year,service_amount,detail",
    [
        (0, 2026, Decimal("0"), "Tháng thu"),
        (13, 2026, Decimal("0"), "Tháng thu"),
        (1, 1999, Decimal("0"), "Năm thu"),
        (1, 2026, Decimal("-1"), "Tiền dịch vụ"),
    ]
)
def test_billing_validates_period_and_amount(
    month,
    year,
    service_amount,
    detail
):
    with pytest.raises(HTTPException) as error:
        generate_monthly_receivables(
            month,
            year,
            service_amount,
            db=None
        )

    assert detail in error.value.detail
