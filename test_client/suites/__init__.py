"""
Test Suites Package: Phân chia theo từng Phân Hệ Nghiệp Vụ (Domain Modules).
Thư mục hiện tại đang ở trạng thái TRỐNG SẠCH (Sẵn sàng tiếp nhận module test mới).
"""

from typing import Dict, Any

# Registry quản lý các domain test suites (Sẽ tự động đăng ký khi tạo test mới)
SUITES_REGISTRY: Dict[str, Dict[str, Any]] = {}


def chay_tat_ca_suites(bao_cao):
    """Chạy toàn bộ các test suites đã đăng ký trong registry."""
    if not SUITES_REGISTRY:
        print("\n[*] Hiện tại chưa có test suite nào trong thư mục suites/.")
        print("[*] Sẵn sàng tiếp nhận yêu cầu nghiệp vụ / file Excel để tự động sinh test.")
        return

    for ma_suite, info in SUITES_REGISTRY.items():
        print(f"\n--- Đang thực thi Suite: [{info['title']}] ---")
        info["runner"](bao_cao)


def chay_suite_theo_ten(ten_suite: str, bao_cao) -> bool:
    """Chạy riêng một suite theo mã định danh."""
    ten_suite_clean = ten_suite.strip().lower()
    if ten_suite_clean in SUITES_REGISTRY:
        info = SUITES_REGISTRY[ten_suite_clean]
        print(f"\n--- Đang thực thi Suite: [{info['title']}] ---")
        info["runner"](bao_cao)
        return True
    return False
