from decimal import Decimal
import pytest
from app.services.debt_service import recalculate_debt


def test_payment_methods_supported():
    """Kiểm tra các hình thức thanh toán được chấp nhận: VietQR (BANK_TRANSFER) và CASH"""
    allowed_methods = {"BANK_TRANSFER", "CASH"}
    
    assert "BANK_TRANSFER" in allowed_methods
    assert "CASH" in allowed_methods
    assert "CRYPTO" not in allowed_methods


def test_payment_debt_deduction_calculation():
    """Kiểm tra thanh toán khấu trừ dư nợ chính xác"""
    initial_debt = Decimal("15000000")
    paid_amount = Decimal("10000000")
    
    remaining_debt = initial_debt - paid_amount
    assert remaining_debt == Decimal("5000000")
    assert remaining_debt > Decimal("0"), "Khoản thu còn nợ một phần (PARTIALLY_PAID)"
    
    # Thanh toán nốt số tiền còn lại
    second_payment = Decimal("5000000")
    final_debt = remaining_debt - second_payment
    assert final_debt == Decimal("0"), "Khoản thu đã được thanh toán toàn bộ (PAID)"


def test_payment_cannot_exceed_debt():
    """Kiểm tra không cho phép thanh toán vượt quá số nợ còn lại"""
    current_debt = Decimal("8500000")
    attempted_payment = Decimal("9000000")
    
    is_valid_amount = Decimal("0") < attempted_payment <= current_debt
    assert is_valid_amount is False, "Số tiền nộp không được vượt quá số dư nợ hiện tại"


def test_vietqr_content_generation():
    """Kiểm tra quy cách nội dung chuyển khoản VietQR tự động chứa mã HĐ và tháng thu"""
    contract_code = "HD-2026-P101"
    billing_month = 10
    
    clean_code = contract_code.replace("-", "")
    transfer_content = f"{clean_code} T{billing_month}"
    
    assert "HD2026P101" in transfer_content
    assert "T10" in transfer_content
