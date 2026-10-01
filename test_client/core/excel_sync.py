"""
Module đồng bộ kết quả kiểm thử vào File Excel chuẩn doanh nghiệp (Excel Sync Engine).
"""

from pathlib import Path
from datetime import datetime
import openpyxl

from core.reporter import BoBaoCaoKiemThu
from config.settings import DUONG_DAN_EXCEL, DUONG_DAN_EXCEL_SYNC


def dong_bo_ket_qua_excel(bao_cao: BoBaoCaoKiemThu, duong_dan_excel: Path = None, nguon_test: str = "Tự Động") -> int:
    """
    Đồng bộ toàn bộ danh sách kết quả trong bao_cao vào Sheet 'Test Cases' và 'Defect Log'.
    """
    if duong_dan_excel is None:
        duong_dan_excel = DUONG_DAN_EXCEL

    if not duong_dan_excel.exists():
        print(f"[CẢNH BÁO]: Không tìm thấy file Excel tại {duong_dan_excel}!")
        return 1

    ket_qua_dict = {item["ma"]: item for item in bao_cao.danh_sach}

    try:
        wb = openpyxl.load_workbook(duong_dan_excel)
    except PermissionError:
        print("\n[LỖI]: File Excel đang được mở trong ứng dụng khác!")
        return 1

    if "Test Cases" not in wb.sheetnames:
        print("Lỗi: Không tìm thấy sheet 'Test Cases' trong file Excel!")
        return 1

    ws_tc = wb["Test Cases"]
    so_dong_cap_nhat = 0
    cac_ca_fail = []

    for row in range(3, ws_tc.max_row + 1):
        ma_tc = ws_tc.cell(row=row, column=4).value  # Cột D: Mã Test Case
        if ma_tc and ma_tc in ket_qua_dict:
            kq = ket_qua_dict[ma_tc]
            trang_thai = kq["trang_thai"]
            chi_tiet = kq["chi_tiet"]

            # Cột K: Actual Result
            if trang_thai == "PASS":
                ws_tc.cell(row=row, column=11, value=f"[{nguon_test}] Chuẩn xác theo nghiệp vụ - Status: PASS ({chi_tiet})")
            else:
                ws_tc.cell(row=row, column=11, value=f"Thất bại: {chi_tiet}")
                cac_ca_fail.append((ma_tc, ws_tc.cell(row=row, column=5).value, chi_tiet))

            # Cột L: Status
            ws_tc.cell(row=row, column=12, value=trang_thai)
            so_dong_cap_nhat += 1

    print(f">>> Đã cập nhật thành công {so_dong_cap_nhat} dòng trong Sheet 'Test Cases'.")

    # Ghi nhận Bug mới vào Sheet 'Defect Log' nếu có FAIL
    if cac_ca_fail and "Defect Log" in wb.sheetnames:
        ws_bug = wb["Defect Log"]
        dong_tiep_theo = ws_bug.max_row + 1

        bugs_da_co = set()
        for r in range(3, ws_bug.max_row + 1):
            tc_cu = ws_bug.cell(row=r, column=2).value
            status_cu = ws_bug.cell(row=r, column=11).value
            if tc_cu and status_cu == "OPEN":
                bugs_da_co.add(tc_cu)

        bugs_moi = 0
        for idx, (ma_tc, ten_tc, ly_do) in enumerate(cac_ca_fail, start=1):
            if ma_tc in bugs_da_co:
                continue
            ma_bug = f"BUG-AUTO-{dong_tiep_theo:03d}"
            ws_bug.cell(row=dong_tiep_theo, column=1, value=ma_bug)
            ws_bug.cell(row=dong_tiep_theo, column=2, value=ma_tc)
            ws_bug.cell(row=dong_tiep_theo, column=3, value=f"[Auto] {ten_tc}")
            ws_bug.cell(row=dong_tiep_theo, column=4, value="Major")
            ws_bug.cell(row=dong_tiep_theo, column=5, value="High")
            ws_bug.cell(row=dong_tiep_theo, column=6, value=f"Kiểm thử {ma_tc}")
            ws_bug.cell(row=dong_tiep_theo, column=7, value=ly_do)
            ws_bug.cell(row=dong_tiep_theo, column=8, value="Phản hồi chuẩn xác theo nghiệp vụ")
            ws_bug.cell(row=dong_tiep_theo, column=9, value="Auto Test")
            ws_bug.cell(row=dong_tiep_theo, column=10, value="Dev Backend")
            ws_bug.cell(row=dong_tiep_theo, column=11, value="OPEN")
            dong_tiep_theo += 1
            bugs_moi += 1

        print(f">>> Đã ghi nhận {bugs_moi} bug mới vào Sheet 'Defect Log'.")
    else:
        print(">>> Không có ca test nào thất bại. Sheet 'Defect Log' sạch đẹp!")

    # Lưu file an toàn
    try:
        wb.save(duong_dan_excel)
        print("=" * 80)
        print(f" HOÀN TẤT! Đã đổ kết quả kiểm thử vào file Excel tại:\n {duong_dan_excel}")
        print("=" * 80)
    except PermissionError:
        backup_excel = DUONG_DAN_EXCEL_SYNC
        wb.save(backup_excel)
        print("=" * 80)
        print(f"[LƯU Ý]: File chính đang mở. Đã lưu kết quả vào file dự phòng:\n {backup_excel}")
        print("=" * 80)

    return 0
