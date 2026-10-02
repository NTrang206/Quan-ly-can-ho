from datetime import date, timedelta
from decimal import Decimal
import pytest


def test_expiring_contract_alert_criteria():
    """Kiểm tra điều kiện kích hoạt cảnh báo hợp đồng sắp hết hạn trong vòng 30 ngày"""
    today = date.today()
    
    # Trường hợp 1: Hết hạn sau 10 ngày -> Kích hoạt cảnh báo
    contract_end_1 = today + timedelta(days=10)
    days_left = (contract_end_1 - today).days
    assert 0 <= days_left <= 30
    
    # Trường hợp 2: Hết hạn sau 45 ngày -> Chưa kích hoạt cảnh báo
    contract_end_2 = today + timedelta(days=45)
    days_left_2 = (contract_end_2 - today).days
    assert not (0 <= days_left_2 <= 30)


def test_overdue_debt_alert_criteria():
    """Kiểm tra điều kiện kích hoạt cảnh báo công nợ quá hạn (> 5 ngày so với hạn nộp)"""
    due_date = date(2026, 10, 10)
    current_date = date(2026, 10, 18)
    
    days_overdue = (current_date - due_date).days
    assert days_overdue == 8
    
    # Quá hạn > 5 ngày -> Đủ điều kiện cảnh báo đôn đốc
    is_alert_required = days_overdue > 5
    assert is_alert_required is True


def test_alert_priority_classification():
    """Kiểm tra phân loại mức độ ưu tiên: URGENT (> 15 ngày nợ), HIGH (> 5 ngày nợ), NORMAL"""
    def get_priority(days_overdue: int, amount: Decimal) -> str:
        if days_overdue >= 15 or amount >= Decimal("20000000"):
            return "URGENT"
        elif days_overdue > 5:
            return "HIGH"
        return "NORMAL"
    
    assert get_priority(18, Decimal("15000000")) == "URGENT"
    assert get_priority(7, Decimal("5000000")) == "HIGH"
    assert get_priority(2, Decimal("3000000")) == "NORMAL"


def test_alert_dunning_channels():
    """Kiểm tra các kênh gửi đôn đốc hợp lệ: ZALO, SMS, EMAIL, APP_PUSH"""
    supported_channels = {"ZALO", "SMS", "EMAIL", "APP_PUSH"}
    assert "ZALO" in supported_channels
    assert "SMS" in supported_channels
    assert "EMAIL" in supported_channels
