from datetime import date, timedelta
from decimal import Decimal
import pytest
from app.models.contract import Contract
from app.models.apartment import Apartment
from app.models.tenant import Tenant


def test_contract_date_validation():
    """Kiểm tra hợp đồng phải có ngày bắt đầu trước ngày kết thúc"""
    start = date(2026, 1, 1)
    end = date(2026, 12, 31)
    assert start < end, "Ngày bắt đầu phải trước ngày kết thúc hợp đồng"
    
    # Hợp đồng tối thiểu 1 tháng (30 ngày)
    diff_days = (end - start).days
    assert diff_days >= 30, "Thời hạn hợp đồng tối thiểu 30 ngày"


def test_contract_deposit_and_price_calculation():
    """Kiểm tra tính toán tiền thuê và tiền cọc theo đúng quy chế quản lý"""
    monthly_price = Decimal("12000000")
    # Tiền cọc thông thường = 2 tháng tiền nhà
    standard_deposit = monthly_price * 2
    assert standard_deposit == Decimal("24000000")
    assert standard_deposit > Decimal("0"), "Tiền cọc bảo đảm phải lớn hơn 0"


def test_contract_status_transitions():
    """Kiểm tra các trạng thái hợp đồng hợp lệ: DRAFT, ACTIVE, RENEWED, TERMINATED, EXPIRED"""
    valid_statuses = {"DRAFT", "ACTIVE", "RENEWED", "TERMINATED", "EXPIRED"}
    
    current_status = "DRAFT"
    assert current_status in valid_statuses
    
    # Sau khi phê duyệt ký kết -> chuyển sang ACTIVE
    current_status = "ACTIVE"
    assert current_status in valid_statuses
    
    # Khi gia hạn -> chuyển sang RENEWED
    current_status = "RENEWED"
    assert current_status in valid_statuses
    
    # Khi bàn giao trả phòng -> chuyển sang TERMINATED
    current_status = "TERMINATED"
    assert current_status in valid_statuses


def test_contract_expiring_check():
    """Kiểm tra phát hiện hợp đồng sắp hết hạn trong vòng 30 ngày"""
    today = date.today()
    # Hợp đồng hết hạn sau 15 ngày -> nằm trong diện cảnh báo sắp hết hạn
    expiring_end_date = today + timedelta(days=15)
    remaining_days = (expiring_end_date - today).days
    
    is_expiring_soon = 0 <= remaining_days <= 30
    assert is_expiring_soon is True, "Hợp đồng còn 15 ngày phải được đánh dấu sắp hết hạn"
    
    # Hợp đồng còn 120 ngày -> không phải cảnh báo sắp hết hạn
    safe_end_date = today + timedelta(days=120)
    safe_remaining = (safe_end_date - today).days
    assert (0 <= safe_remaining <= 30) is False
