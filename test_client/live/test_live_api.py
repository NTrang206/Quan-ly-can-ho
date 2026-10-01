"""
KIỂM THỬ TRỰC TIẾP QUA GIAO THỨC HTTP VỚI SERVER ĐANG CHẠY (LIVE API TEST)
Được kết nối trực tiếp với BoBaoCaoKiemThu để có thể tự động đổ kết quả vào file Excel.
Đang ở trạng thái sẵn sàng tiếp nhận các endpoint mới theo yêu cầu nghiệp vụ.
"""

import sys
from pathlib import Path
import httpx

thu_muc_client = Path(__file__).resolve().parent.parent
if str(thu_muc_client) not in sys.path:
    sys.path.insert(0, str(thu_muc_client))

from core.reporter import BoBaoCaoKiemThu
from config.settings import BASE_URL, HTTP_TIMEOUT


def chay_kiem_thu_live_api(bao_cao: BoBaoCaoKiemThu = None, base_url: str = BASE_URL) -> bool:
    """
    Thực thi kiểm thử HTTP Request thật tới Live Server.
    Nếu có đối tượng bao_cao, tự động ghi nhận kết quả để đồng bộ vào Excel.
    """
    tao_moi_bao_cao = False
    if bao_cao is None:
        bao_cao = BoBaoCaoKiemThu("LIVE API SERVER (HTTP THẬT)")
        tao_moi_bao_cao = True

    print("=" * 80)
    print(f" BẮT ĐẦU KIỂM THỬ LIVE API TRÊN MÁY CHỦ: {base_url}")
    print("=" * 80)

    client = httpx.Client(base_url=base_url, timeout=HTTP_TIMEOUT)

    # 1. Kiểm tra kết nối máy chủ
    try:
        res_root = client.get("/")
    except Exception as e:
        print(f"\n[CẢNH BÁO]: Không thể kết nối tới máy chủ Live tại {base_url}!")
        print(f"Chi tiết lỗi: {e}")
        print("\nVui lòng khởi chạy server Backend trước:")
        print("    cd backend")
        print("    py -m uvicorn main:app --host 127.0.0.1 --port 8000")
        if tao_moi_bao_cao:
            bao_cao.ghi_nhan("LIVE-00", "Kết nối máy chủ Live Server (Health Check)", False, f"Server offline tại {base_url}")
            bao_cao.in_bang_tong_hop()
        return False

    # 2. Kiểm tra Health Check & OpenAPI docs
    is_root_ok = res_root.status_code == 200
    bao_cao.ghi_nhan("LIVE-01", "Kiểm tra máy chủ hoạt động (Root Endpoint /)", is_root_ok, f"HTTP {res_root.status_code}")

    res_docs = client.get("/docs")
    res_openapi = client.get("/openapi.json")
    is_docs_ok = res_docs.status_code == 200 and res_openapi.status_code == 200
    bao_cao.ghi_nhan("LIVE-02", "Tài liệu Swagger UI (/docs) và OpenAPI JSON", is_docs_ok, f"Docs: {res_docs.status_code}, OpenAPI: {res_openapi.status_code}")

    # Các kịch bản live api theo từng phân hệ sẽ được tự động sinh tại đây khi tiếp nhận file Excel nghiệp vụ mới.

    if tao_moi_bao_cao:
        bao_cao.in_bang_tong_hop()

    return True


if __name__ == "__main__":
    chay_kiem_thu_live_api()
