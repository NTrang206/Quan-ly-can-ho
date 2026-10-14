# -*- coding: utf-8 -*-
"""
generate_doc06.py
Chương trình tự động tạo tài liệu Screen Flow và Thiết kế Cơ sở Dữ liệu:
06_GenAI_SoftwareDevelopment_screenflow_db.docx
Được hoàn thiện dựa trên đối chiếu và chuẩn hóa 100% với:
  - Tài liệu 02: Yêu cầu phần mềm & QA (FR-01..35, AI-FR01..03, NFR-01..06, RBAC)
  - Tài liệu 03: Đặc tả trường hợp sử dụng Use Case (UC001..UC011, Luồng tương tác, 5 Tác nhân)
  - Tài liệu 04: Thiết kế hướng đối tượng & Mô hình lớp (Chuẩn hóa 17 Lớp thực thể & ERD 17 Bảng 3NF)

Tiêu chí:
  - Đúng chuẩn cấu trúc 3 phần của form mẫu gốc File 06.
  - Súc tích, đúng trọng tâm, loại bỏ toàn bộ các phần rườm rà lan man.
  - Đồng bộ tuyệt đối giữa sơ đồ, bảng biểu và từ điển dữ liệu.
"""

import os
import sys
import json
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import draw_screenflow_custom
import draw_erd_custom
from doc_helpers import (
    set_page_setup, format_run, add_p, add_bullet,
    add_h1, add_h2, add_h3, create_styled_table, add_figure, add_hyperlink,
    FONT_FAMILY, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT, COLOR_MUTED
)

OUT_DOCX = r"d:\Detai12_QLCH\Tailieu\06_GenAI_SoftwareDevelopment_screenflow_db.docx"
SCHEMA_JSON = r"d:\Detai12_QLCH\Tailieu\scripts\doc4_schema.json"
SCREENFLOW_IMG = r"d:\Detai12_QLCH\Tailieu\scratch_imgs\screenflow_standard_diagram.png"
ERD_IMG = r"d:\Detai12_QLCH\Tailieu\scratch_imgs\erd_standard_diagram.png"

def setup_document_page_and_header(doc):
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(0.787)      # 2.0 cm
        section.bottom_margin = Inches(0.787)   # 2.0 cm
        section.left_margin = Inches(1.181)     # 3.0 cm
        section.right_margin = Inches(0.787)    # 2.0 cm
        
        # Running Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.text = ""
        hr = hp.add_run("Đề tài 12: Quản lý thuê căn hộ có tích hợp AI — Screen Flow & Thiết kế CSDL")
        format_run(hr, size_pt=8.5, italic=True, color_rgb=COLOR_MUTED)
        
        # Running Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        fp.text = ""
        fr = fp.add_run("Screen Flow & Tài liệu Thiết kế Cơ sở Dữ liệu — Nhóm 12")
        format_run(fr, size_pt=8.5, italic=True, color_rgb=COLOR_MUTED)

def load_doc4_schema():
    if not os.path.exists(SCHEMA_JSON):
        raise FileNotFoundError(f"Không tìm thấy tệp schema: {SCHEMA_JSON}")
    with open(SCHEMA_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

def build_document_06():
    print("Generating Master Screen Flow Diagram and Draw.io URL...")
    draw_screenflow_custom.render_screenflow_image()
    drawio_xml = draw_screenflow_custom.build_drawio_xml()
    drawio_url = draw_screenflow_custom.generate_drawio_url(drawio_xml)

    print("Generating Master ERD Diagram with clear connector lines...")
    draw_erd_custom.render_erd_image()

    print("Loading relational database schema from Doc 04...")
    db_schema = load_doc4_schema()

    doc = docx.Document()
    setup_document_page_and_header(doc)

    # ==================== METADATA & TITLE BLOCK ====================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("SCREEN FLOW & TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU")
    format_run(r_title, size_pt=18, bold=True, color_rgb=COLOR_PRIMARY)

    p_grp = doc.add_paragraph()
    p_grp.paragraph_format.space_after = Pt(3)
    r_grp = p_grp.add_run("Nhóm 12 - Thành viên nhóm")
    format_run(r_grp, size_pt=13, bold=True, color_rgb=COLOR_TEXT)

    p_mem1 = doc.add_paragraph()
    p_mem1.paragraph_format.space_after = Pt(3)
    r_mem1 = p_mem1.add_run("Nguyễn Thị Trang (Trưởng nhóm)")
    format_run(r_mem1, size_pt=13, bold=False, color_rgb=COLOR_SECONDARY)

    p_mem2 = doc.add_paragraph()
    p_mem2.paragraph_format.space_after = Pt(4)
    r_mem2 = p_mem2.add_run("Lê Quang Khánh")
    format_run(r_mem2, size_pt=13, bold=False, color_rgb=COLOR_SECONDARY)

    p_app = doc.add_paragraph()
    p_app.paragraph_format.space_after = Pt(4)
    r_app_lbl = p_app.add_run("Tên ứng dụng: ")
    format_run(r_app_lbl, size_pt=13, bold=False)
    r_app_val = p_app.add_run("Hệ thống quản lý thuê căn hộ có tích hợp AI")
    format_run(r_app_val, size_pt=13, bold=True, color_rgb=COLOR_SECONDARY)

    p_time = doc.add_paragraph()
    p_time.paragraph_format.space_after = Pt(14)
    r_time = p_time.add_run("Thời gian thực hiện: Từ 27/07/2026 đến 27/09/2026 (9 tuần)")
    format_run(r_time, size_pt=13, bold=False)

    # ==================== PHẦN 1: SCREEN FLOW ====================
    add_h1(doc, "1. Screen Flow: Phân luồng màn hình của ứng dụng")
    
    add_p(doc, 
        "Sơ đồ Screen Flow mô tả trực quan cấu trúc phân luồng màn hình, các điểm rẽ nhánh logic và sự chuyển tiếp trạng thái "
        "của Hệ thống Quản lý Thuê Căn hộ có tích hợp AI. Thiết kế được xây dựng dựa trên 11 Ca sử dụng (UC001 đến UC011 trong Tài liệu 03) "
        "và Ma trận phân quyền 5 nhóm tác nhân (Admin, Staff, Accountant, Tenant, Customer trong Tài liệu 02). "
        "Quy ước hình khối và mã màu chuẩn mực được áp dụng như sau:"
    )

    add_bullet(doc, "Màn hình hiển thị chính (Screen/View) hoặc Modal/Drawer chức năng (Trang chủ, Đăng nhập, Chi tiết phòng, Dashboard, Cổng cư dân).",
               bold_prefix="• Khối chữ nhật màu xanh dương: ")
    add_bullet(doc, "Hành động người dùng chủ động lựa chọn (Click chọn phòng, Chọn Đăng nhập, Gửi yêu cầu đặt cọc, Chọn tab thanh toán).",
               bold_prefix="• Khối chữ nhật màu vàng: ")
    add_bullet(doc, "Điểm rẽ nhánh điều kiện logic do hệ thống tự động kiểm tra (Kiểm tra JWT Token hợp lệ, Kiểm tra trạng thái phòng AVAILABLE).",
               bold_prefix="• Khối hình thoi màu cam: ")
    add_bullet(doc, "Thông báo lỗi nghiệp vụ và vòng lặp quay lại thao tác (Sai mật khẩu, Phòng đã được đặt trước).",
               bold_prefix="• Khối hình tròn màu trắng viền xám: ")
    add_bullet(doc, "Đường mũi tên liên kết màu xanh lá biểu thị luồng chính quy/hợp lệ; đường màu đỏ biểu thị luồng rẽ nhánh/lỗi; khối màu đen biểu thị điểm kết thúc phiên tương tác.",
               bold_prefix="• Đường mũi tên & Điểm kết thúc: ")

    # Sơ đồ Screen Flow Chuẩn Hình 1
    add_figure(doc, SCREENFLOW_IMG, "Hình 1: Sơ đồ Phân luồng Màn hình Tổng thể Hệ thống (Master Screen Flow Diagram)", width=Inches(6.2))

    # Link vẽ và thông tin file nguồn Draw.io
    p_link = doc.add_paragraph()
    p_link.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_link.paragraph_format.space_before = Pt(4)
    p_link.paragraph_format.space_after = Pt(4)
    r_link_lbl = p_link.add_run("🔗 Liên kết mở sơ đồ trực tuyến (Draw.io Online): ")
    format_run(r_link_lbl, bold=True, color_rgb=COLOR_PRIMARY)
    add_hyperlink(p_link, drawio_url, "[Nhấn vào đây để xem và chỉnh sửa sơ đồ trên Draw.io]", color="1F497D", underline=True)

    add_p(doc, 
        "Tệp nguồn Draw.io đi kèm: d:\\Detai12_QLCH\\Tailieu\\so_do_screen_flow.drawio (tương thích hoàn toàn với Diagrams.net và VS Code Draw.io Integration).",
        italic=True, space_after=6
    )

    add_p(doc,
        "Hệ thống vận hành xoay quanh 4 luồng trải nghiệm người dùng cốt lõi:",
        bold_prefix="Phân tích 4 luồng người dùng chính (Core User Journeys): "
    )
    add_bullet(doc, "Khách hàng truy cập Cổng công khai -> Sử dụng bộ lọc hoặc Chat AI gợi ý phòng -> Xem Trang chi tiết -> Nhấn 'Đặt phòng' mở Modal Booking -> Hệ thống kiểm tra phòng AVAILABLE -> Lưu bản ghi Booking (mã BK-xxxx, trạng thái PENDING) và tạm chuyển trạng thái phòng sang RESERVED (khớp UC011 & FR-30, FR-31).",
               bold_prefix="1. Luồng Khám phá & Đặt phòng trực tuyến: ")
    add_bullet(doc, "Người dùng mở trang Đăng nhập -> Nhập thông tin xác thực -> Máy chủ kiểm tra mật khẩu băm BCrypt -> Cấp phát JWT Token kèm Role -> Bộ điều hướng RBAC tự động dẫn tới phân hệ tương ứng: Admin/Accountant vào Dashboard; Staff vào Quản lý vận hành; Tenant vào Cổng cư dân (khớp UC009 & FR-01, NFR-02).",
               bold_prefix="2. Luồng Xác thực & Điều hướng RBAC: ")
    add_bullet(doc, "Staff duyệt Booking -> Tạo hợp đồng thuê -> Gọi GenAI tóm tắt 5 điều khoản pháp lý trọng yếu -> Kế toán thu cọc (trạng thái HELD) -> Kích hoạt HĐ sang ACTIVE (phòng chuyển sang OCCUPIED) -> Đầu tháng Cron Job tự sinh khoản thu (Receivables) -> Cư dân quét mã VietQR Napas247 thanh toán -> Hệ thống gạch nợ tức thì và đồng bộ Sổ nợ -> Kết thúc HĐ: cấn trừ hư hại và hoàn cọc (khớp UC001, UC002, UC003 & FR-11..19).",
               bold_prefix="3. Luồng Vận hành Căn hộ, Hợp đồng & Tài chính: ")
    add_bullet(doc, "Cư dân gửi báo hỏng kèm ảnh hiện trường -> Staff điều phối thợ kỹ thuật -> Nghiệm thu sửa chữa đóng phiếu; Rule Engine quét nợ quá hạn và hợp đồng sắp hết hạn -> Trợ lý AI tự sinh thông báo đôn đốc lịch sự; Cư dân tương tác hỏi đáp nội quy tòa nhà 24/7 qua Chatbot RAG (khớp UC004, UC005, UC006 & FR-20..25, AI-FR01..03).",
               bold_prefix="4. Luồng Sự cố, Cảnh báo & Trợ lý Trí tuệ Nhân tạo: ")

    # Ma trận điều hướng màn hình
    add_p(doc, 
        "Bảng ma trận dưới đây đặc tả chi tiết sự chuyển tiếp giữa các màn hình, sự kiện kích hoạt (Trigger), điều kiện logic và liên kết nghiệp vụ với Tài liệu 02 (FR) và Tài liệu 03 (UC):",
        bold_prefix="Bảng 1: Ma trận điều hướng và chuyển đổi màn hình (Screen Navigation Matrix)"
    )

    screen_matrix_headers = ["Mã SCR", "Tên Màn hình / Phân hệ", "URL Route", "Màn hình Nguồn", "Hành động Kích hoạt (Trigger)", "Điều kiện & Liên kết UC/FR", "Màn hình Đích"]
    screen_matrix_data = [
        ["SCR-01", "Trang chủ Khám phá Căn hộ", "/", "URL trực tiếp / Navbar", "Click Card phòng / Click AI Matcher", "Công khai (UC011, FR-30)", "SCR-02 / MDL-01"],
        ["SCR-02", "Chi tiết Căn hộ & Tiện ích", "/apartments/:id", "SCR-01", "Click nút 'Đặt phòng & Giữ chỗ'", "Phòng = AVAILABLE (UC011)", "MDL-02 (Booking Modal)"],
        ["MDL-01", "AI Room Matcher Modal", "Popup Modal", "SCR-01", "Nhập nhu cầu tìm phòng qua chat AI", "AI gợi ý phòng (AI-FR03)", "SCR-02 (Chi tiết căn hộ)"],
        ["MDL-02", "Modal Đặt phòng Giữ chỗ", "Popup Modal", "SCR-02", "Submit form thông tin khách thuê", "Cấp mã Booking (UC011, FR-31)", "SCR-01 (Phòng -> RESERVED)"],
        ["SCR-03", "Đăng nhập Hệ thống", "/login", "Navbar / Direct", "Submit Username & Password", "Xác thực JWT (UC009, FR-01)", "Bộ điều hướng RBAC"],
        ["--", "Bộ điều hướng RBAC", "Internal Router", "SCR-03", "Giải mã Role từ JWT Payload", "Role in [ADMIN, ACC]\nRole = STAFF\nRole = TENANT\nKhông đủ thẩm quyền", "SCR-04 (Dashboard)\nSCR-05 (Quản lý tòa nhà)\nSCR-13 (Cổng cư dân)\nSCR-14 (Unauthorized)"],
        ["SCR-04", "Tổng quan Điều hành & KPI", "/admin/dashboard", "SCR-03 / Sidebar", "Click thẻ KPI / Quick Action", "Role in [ADMIN, ACC] (UC010, FR-29)", "SCR-05 / SCR-08 / SCR-09"],
        ["SCR-05", "Quản lý Tòa nhà & Căn hộ", "/admin/buildings", "Sidebar / SCR-04", "Click 'Thêm căn hộ' / 'Đổi trạng thái'", "Role in [ADMIN, STAFF] (UC007, FR-04..07)", "Modal Thêm phòng / SCR-08"],
        ["SCR-06", "Quản lý Yêu cầu Đặt phòng", "/admin/bookings", "Sidebar", "Click 'Duyệt & Lập hợp đồng'", "Booking = PENDING (UC011, FR-31)", "SCR-08 (Kế thừa dữ liệu)"],
        ["SCR-07", "Quản lý Hồ sơ Khách thuê", "/admin/tenants", "Sidebar", "Click 'Thêm khách' / 'Người ở cùng'", "Role in [ADMIN, STAFF] (UC008, FR-08..10)", "Modal Thêm Khách / Ở cùng"],
        ["SCR-08", "Quản lý Hợp đồng & Tiền cọc", "/admin/contracts", "Sidebar / SCR-05,06", "Click 'Lập HĐ' / 'Xem AI Tóm tắt'", "Role in [ADMIN, STAFF] (UC001,002, FR-11..15)", "Modal Lập HĐ / DWR-01"],
        ["DWR-01", "AI Summarizer Drawer", "Drawer trượt", "SCR-08 / SCR-13", "Click 'Xem AI Tóm tắt HĐ'", "Trích xuất 5 điều khoản (AI-FR01)", "Hiển thị tóm tắt pháp lý"],
        ["SCR-09", "Quản lý Tài chính & Sổ nợ", "/admin/finance", "Sidebar / SCR-04", "Click 'Sinh khoản thu' / 'VietQR'", "Role in [ADMIN, ACC] (UC003, FR-16..19)", "Modal Sinh phí / VietQR Modal"],
        ["MDL-07", "VietQR Payment Modal", "Popup Modal", "SCR-09 / SCR-13", "Click 'Quét mã VietQR'", "Hóa đơn = UNPAID (UC003, FR-18)", "Quét Napas 24/7 -> PAID"],
        ["SCR-10", "Tiếp nhận & Nghiệm thu Bảo trì", "/admin/maintenance", "Sidebar / SCR-04", "Click 'Phân công' / 'Nghiệm thu'", "Role in [ADMIN, STAFF] (UC004, FR-20..22)", "Modal Phân công / Hoàn thành"],
        ["SCR-11", "Cảnh báo & AI Nhắc nợ", "/admin/alerts", "Sidebar", "Click 'Quét cảnh báo' / 'AI Soạn'", "Rule Engine kích hoạt (UC005, FR-23..25)", "DWR-02 (AI Dunning Drawer)"],
        ["DWR-02", "AI Dunning Drawer", "Drawer trượt", "SCR-11", "Duyệt và gửi thông báo nhắc nợ", "Nội dung AI sinh (AI-FR02)", "Gửi tin Zalo / SMS tự động"],
        ["SCR-12", "Trợ lý Chatbot AI RAG", "/admin/rag-chatbot", "Sidebar / Floating", "Tra cứu nội quy / Tải chunk", "Cosine Similarity (UC006, AI-FR03)", "Trả lời kèm trích dẫn nguồn"],
        ["SCR-13", "Cổng Cư dân Trực tuyến", "/tenant-portal", "SCR-03 / Direct", "Chuyển đổi các Tab chức năng", "Role = TENANT (FR-32..35)", "Xem phòng, HĐ, Phí, Báo hỏng"],
        ["SCR-14", "Từ chối Quyền hạn Truy cập", "/unauthorized", "PrivateRoute", "Truy cập URL vượt quyền", "Mã lỗi 403 Forbidden (NFR-02)", "Nút quay lại Trang chủ / Login"]
    ]
    create_styled_table(doc, screen_matrix_headers, screen_matrix_data, col_widths=[0.6, 1.4, 1.0, 1.0, 1.4, 1.0, 1.0], header_bg="1F497D")

    # ==================== PHẦN 2: CƠ SỞ DỮ LIỆU ====================
    add_h1(doc, "2. Cơ sở dữ liệu")

    add_p(doc, 
        "Cơ sở dữ liệu của Hệ thống Quản lý thuê Căn hộ được chuẩn hóa nghiêm ngặt theo mô hình quan hệ dạng chuẩn 3NF (Third Normal Form), "
        "đảm bảo tính toàn vẹn tham chiếu, loại bỏ hoàn toàn dư thừa dữ liệu và tối ưu hóa hiệu năng truy vấn chỉ mục. "
        "Mô hình được đồng bộ 100% với Mô hình lớp hướng đối tượng trong Tài liệu 04 (gồm đúng 17 thực thể tham gia chu trình vận hành). "
        "Hệ thống triển khai linh hoạt trên PostgreSQL v16 (Production) và SQLite v3 (Development/Testing)."
    )

    # 2.1. CƠ SỞ DỮ LIỆU QUAN HỆ
    add_h2(doc, "2.1. Cơ sở dữ liệu quan hệ")

    add_p(doc, 
        "Sơ đồ quan hệ thực thể tổng thể (ERD 17 Bảng chuẩn 3NF) thể hiện mối liên kết chặt chẽ giữa các phân hệ: "
        "Tài khoản & Phân quyền -> Bất động sản & Căn hộ -> Khách thuê & Cư trú -> Hợp đồng & Cọc -> Tài chính & Sổ nợ -> "
        "Vận hành kỹ thuật -> Cảnh báo tự động & Tri thức GenAI RAG:"
    )

    # Sơ đồ ERD Hình 2
    add_figure(doc, ERD_IMG, "Hình 2: Sơ đồ Thực thể - Mối quan hệ Cơ sở dữ liệu Tổng quan (ERD 17 Bảng dữ liệu chuẩn 3NF)", width=Inches(6.2))

    add_p(doc, "Bảng danh mục 17 bảng dữ liệu được phân chia theo 6 phân hệ chức năng nghiệp vụ chuẩn hóa:",
          bold_prefix="Bảng 2: Danh mục 17 bảng trong Cơ sở dữ liệu quan hệ")

    table_catalog_headers = ["STT", "Tên Bảng (Table)", "Tên Lớp (Class)", "Phân hệ Nghiệp vụ", "Số Cột", "Khóa Chính (PK)", "Mối quan hệ chính (Relations)"]
    table_catalog_data = [
        ["1", "roles", "Role", "Xác thực & RBAC", "5", "id", "1 - N với users"],
        ["2", "users", "User", "Xác thực & RBAC", "10", "id", "N - 1 với roles; liên kết tenants"],
        ["3", "buildings", "Building", "Bất động sản & Căn hộ", "7", "id", "1 - N với apartments"],
        ["4", "apartments", "Apartment", "Bất động sản & Căn hộ", "9", "id", "N - 1 với buildings; 1 - N với amenities"],
        ["5", "amenities", "Amenity", "Bất động sản & Căn hộ", "6", "id", "N - 1 với apartments"],
        ["6", "tenants", "Tenant", "Khách thuê & Cư trú", "9", "id", "1 - N với contracts, roommates; 1 - 1 với debt_ledger"],
        ["7", "roommates", "Roommate", "Khách thuê & Cư trú", "7", "id", "N - 1 với tenants & apartments"],
        ["8", "emergency_contacts", "EmergencyContact", "Khách thuê & Cư trú", "5", "id", "N - 1 với tenants"],
        ["9", "contracts", "Contract", "Hợp đồng & Tiền cọc", "13", "id", "N - 1 với apartments, tenants; 1 - 1 với deposits"],
        ["10", "deposits", "Deposit", "Hợp đồng & Tiền cọc", "10", "id", "Quan hệ duy nhất 1 - 1 với contracts"],
        ["11", "receivables", "Receivable", "Tài chính & Thu phí", "12", "id", "N - 1 với contracts, apartments; 1 - N với payments"],
        ["12", "payments", "Payment", "Tài chính & Thu phí", "8", "id", "N - 1 với receivables; cập nhật debt_ledger"],
        ["13", "debt_ledger", "DebtLedger", "Tài chính & Thu phí", "6", "id", "Quan hệ duy nhất 1 - 1 với tenants"],
        ["14", "maintenance_requests", "MaintenanceRequest", "Vận hành & Kỹ thuật", "13", "id", "N - 1 với apartments, users (technician)"],
        ["15", "system_alerts", "SystemAlert", "Cảnh báo & AI", "6", "id", "Sinh bởi Rule Engine, chuyển tiếp AI"],
        ["16", "document_chunks", "DocumentChunk", "Trí tuệ Nhân tạo", "6", "id", "Kho tri thức nhúng vector 768 chiều (RAG)"],
        ["17", "bookings", "Booking", "Khách hàng & Đặt phòng", "11", "id", "N - 1 với apartments; chuyển thành contracts"]
    ]
    create_styled_table(doc, table_catalog_headers, table_catalog_data, col_widths=[0.4, 1.4, 1.2, 1.4, 0.5, 0.7, 1.8], header_bg="1F497D")

    # Đặc tả chi tiết từ điển dữ liệu 17 bảng
    add_p(doc, 
        "Dưới đây là từ điển dữ liệu (Data Dictionary) chi tiết của toàn bộ 17 bảng, được trích xuất đồng bộ tuyệt đối từ Đặc tả Lớp của Tài liệu 04, "
        "xác định rõ tên thuộc tính, kiểu dữ liệu chuẩn, các ràng buộc CSDL và ý nghĩa nghiệp vụ:",
        bold_prefix="Đặc tả cấu trúc chi tiết 17 bảng dữ liệu trong hệ thống (Data Dictionary): "
    )

    table_titles = {
        "roles": "roles — Danh mục vai trò người dùng trong hệ thống (RBAC)",
        "users": "users — Tài khoản người dùng đăng nhập hệ thống và thông tin xác thực",
        "buildings": "buildings — Danh mục các tòa nhà căn hộ do đơn vị vận hành quản lý",
        "apartments": "apartments — Danh mục căn hộ cho thuê với 4 trạng thái vận hành",
        "amenities": "amenities — Danh mục trang thiết bị, tiện ích nội thất trang bị cho căn hộ",
        "tenants": "tenants — Hồ sơ thông tin khách thuê đại diện pháp lý của hợp đồng",
        "roommates": "roommates — Thông tin những người ở cùng phòng với khách thuê chính",
        "emergency_contacts": "emergency_contacts — Thông tin thân nhân liên hệ trong trường hợp khẩn cấp",
        "contracts": "contracts — Hợp đồng thuê căn hộ và các điều khoản pháp lý ràng buộc",
        "deposits": "deposits — Quản lý tiền cọc giữ chỗ, cấn trừ hư hại và thanh lý hoàn cọc",
        "receivables": "receivables — Sổ theo dõi các khoản phải thu định kỳ (tiền phòng, dịch vụ)",
        "payments": "payments — Nhật ký ghi nhận lịch sử các giao dịch thanh toán và gạch nợ",
        "debt_ledger": "debt_ledger — Sổ cái tổng hợp theo dõi công nợ lũy kế của từng khách thuê",
        "maintenance_requests": "maintenance_requests — Phiếu tiếp nhận, điều phối và nghiệm thu sửa chữa bảo trì sự cố",
        "system_alerts": "system_alerts — Hệ thống cảnh báo tự động thông minh và đôn đốc công nợ",
        "document_chunks": "document_chunks — Kho tri thức quy định tòa nhà phân mảnh phục vụ Chatbot RAG",
        "bookings": "bookings — Theo dõi yêu cầu đặt phòng và giữ chỗ trực tuyến của khách hàng"
    }

    col_w_dict = [0.5, 1.6, 1.2, 1.8, 2.3] # Total 7.4 inches
    dict_headers = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Ý nghĩa Nghiệp vụ"]

    for idx, (tname, fields) in enumerate(db_schema.items(), 1):
        title_text = table_titles.get(tname, f"{tname} — Bảng dữ liệu hệ thống")
        add_p(doc, f"Bảng {idx}: {title_text}", bold_prefix=f"2.1.{idx}. ")
        table_rows = []
        for f in fields:
            table_rows.append([f["stt"], f["name"], f["type"], f["constraint"], f["desc"]])
        create_styled_table(doc, dict_headers, table_rows, col_widths=col_w_dict, header_bg="2C3E50")

    # ==================== PHẦN 2.2: RÀNG BUỘC TOÀN VẸN ====================
    add_h2(doc, "2.2. Các ràng buộc toàn vẹn trong CSDL")

    add_p(doc, 
        "Hệ thống cơ sở dữ liệu tuân thủ nghiêm ngặt 5 nhóm ràng buộc toàn vẹn theo chuẩn lý thuyết Hệ quản trị CSDL quan hệ (RDBMS) "
        "kết hợp các quy tắc an toàn bảo mật và rào chắn GenAI từ Tài liệu 02 và 03, đảm bảo dữ liệu luôn nhất quán và chính xác tuyệt đối:"
    )

    # 1. Thực thể
    add_p(doc, 
        "Tất cả 17 bảng trong cơ sở dữ liệu đều có thuộc tính khóa chính (Primary Key - PK) đơn mang tên id, "
        "kiểu số nguyên INTEGER kết hợp cơ chế tự động tăng (AUTO_INCREMENT / SERIAL). Giá trị khóa chính là bất biến, "
        "duy nhất tuyệt đối trên toàn bảng và không bao giờ mang giá trị NULL, phục vụ đánh chỉ mục B-Tree và liên kết quan hệ nhanh chóng.",
        bold_prefix="1. Ràng buộc toàn vẹn thực thể (Entity Integrity): "
    )

    # 2. Tham chiếu
    add_p(doc, 
        "Hệ thống thiết lập các chính sách khóa ngoại (Foreign Key Constraints) rõ ràng nhằm ngăn chặn triệt để bản ghi mồ côi (Orphan Records):",
        bold_prefix="2. Ràng buộc toàn vẹn tham chiếu (Referential Integrity): "
    )
    add_bullet(doc, "Xóa một Tòa nhà (buildings) sẽ bị chặn lại (ON DELETE RESTRICT) nếu trong tòa nhà vẫn còn Căn hộ (apartments). Căn hộ chỉ được xóa khi không có Hợp đồng (contracts) hoặc Khoản thu (receivables) liên kết.",
               bold_prefix="• Quan hệ buildings -> apartments -> contracts: ")
    add_bullet(doc, "Khi khách thuê (tenants) bị xóa khỏi hệ thống, các bản ghi người ở cùng (roommates) và liên hệ khẩn cấp (emergency_contacts) tự động bị xóa theo (ON DELETE CASCADE) do đây là các thực thể phụ thuộc hoàn toàn.",
               bold_prefix="• Quan hệ tenants -> roommates / emergency_contacts: ")
    add_bullet(doc, "Một khoản phải thu (receivables) không thể bị xóa vật lý nếu đã có giao dịch thanh toán trong payments (ON DELETE RESTRICT), bảo đảm chống thất thoát dòng tiền kế toán.",
               bold_prefix="• Quan hệ receivables -> payments: ")
    add_bullet(doc, "Khi tài khoản người dùng (users) bị khóa hoặc xóa, các trường tham chiếu người tạo, người duyệt (createdBy, approvedBy) trong contracts hoặc payments được gán về NULL (ON DELETE SET NULL) nhằm lưu vết lịch sử khách quan.",
               bold_prefix="• Quan hệ users -> contracts / payments: ")

    # 3. Miền giá trị
    add_p(doc, 
        "Hệ thống kiểm soát chặt chẽ miền giá trị qua các ràng buộc CHECK và kiểu liệt kê ENUM chuẩn hóa:",
        bold_prefix="3. Ràng buộc toàn vẹn miền giá trị (Domain Integrity & CHECK Constraints): "
    )
    add_bullet(doc, "Giá thuê căn hộ (price > 0), diện tích (areaSqm > 0), số người ở tối đa (maxOccupants >= 1); Giá thuê hợp đồng (rentalPrice > 0), tiền cọc (depositAmount >= 0); Số tiền thanh toán (paidAmount <= totalAmount).",
               bold_prefix="• Ràng buộc Giá tiền & Chỉ số vật lý: ")
    add_bullet(doc, "Ngày kết thúc hợp đồng thuê phải luôn sau ngày bắt đầu, tức (endDate > startDate) theo quy định tại FR-12.",
               bold_prefix="• Ràng buộc Thời hạn Hợp đồng: ")
    add_bullet(doc, "Chỉ chấp nhận các giá trị trạng thái đã được định nghĩa trước: "
                    "Căn hộ ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE' theo FR-07); "
                    "Hợp đồng ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED' theo FR-13); "
                    "Tiền cọc ('PENDING', 'HELD', 'REFUNDED', 'DEDUCTED' theo FR-14); "
                    "Khoản thu ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE' theo FR-17); "
                    "Bảo trì ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED' theo FR-21); "
                    "Phương thức thanh toán ('CASH', 'BANK_TRANSFER').",
               bold_prefix="• Ràng buộc Tập trạng thái chuẩn (ENUM Values): ")

    # 4. Duy nhất
    add_p(doc, 
        "Hệ thống thiết lập các chỉ mục duy nhất (UNIQUE Indexes) bảo đảm tính không trùng lặp của dữ liệu định danh pháp lý và giao dịch:",
        bold_prefix="4. Ràng buộc toàn vẹn duy nhất (Unique Constraints): "
    )
    add_bullet(doc, "Số Căn cước công dân (citizenId) 12 chữ số của khách thuê trong bảng tenants là duy nhất trên toàn hệ thống (theo FR-08 & UC008).",
               bold_prefix="• Căn cước công dân: ")
    add_bullet(doc, "Tên đăng nhập (username) và Địa chỉ thư điện tử (email) trong bảng users là duy nhất, ngăn chặn đăng ký trùng lặp tài khoản.",
               bold_prefix="• Tài khoản người dùng: ")
    add_bullet(doc, "Mã số hợp đồng (contractCode: HD-YYYYMM-XXXX) và Mã đặt phòng (bookingCode: BK-YYYYMM-XXXX) là duy nhất trên toàn hệ thống.",
               bold_prefix="• Mã giao dịch nghiệp vụ: ")
    add_bullet(doc, "Tổ hợp (buildingId, roomNumber) trong bảng apartments là duy nhất; không thể có hai phòng trùng số trong cùng một tòa nhà.",
               bold_prefix="• Số phòng theo Tòa nhà: ")
    add_bullet(doc, "Quan hệ 1 - 1 được bảo đảm qua khóa duy nhất: contractId trong bảng deposits là duy nhất (mỗi HĐ chỉ có 1 bản ghi cọc); tenantId trong bảng debt_ledger là duy nhất (mỗi khách chỉ có 1 sổ nợ).",
               bold_prefix="• Ràng buộc Quan hệ 1 - 1: ")

    # 5. Nghiệp vụ phức hợp & Rào chắn AI
    add_p(doc, 
        "Hệ thống triển khai 6 quy tắc nghiệp vụ liên bảng và rào chắn an toàn GenAI tại tầng Application Service và Database Transactions:",
        bold_prefix="5. Ràng buộc Nghiệp vụ Phức hợp & Rào chắn An toàn AI (Complex Business Rules & AI Guardrails): "
    )
    add_bullet(doc, "Không cho phép kích hoạt hợp đồng mới nếu khoảng thời gian [startDate, endDate] bị giao thoa (overlap) với bất kỳ hợp đồng nào đang ở trạng thái ACTIVE trên cùng một căn hộ (theo FR-12 & NFR-03).",
               bold_prefix="• RB-01 (Chống Xung đột Lịch thuê - Temporal Non-Overlap): ")
    add_bullet(doc, "Tự động đồng bộ trạng thái vòng đời căn hộ: Khi có Booking hợp lệ -> Căn hộ chuyển sang RESERVED; Khi hợp đồng được duyệt và cọc chuyển sang HELD -> Căn hộ chuyển sang OCCUPIED; Khi hợp đồng kết thúc -> Căn hộ chuyển về AVAILABLE hoặc MAINTENANCE để vệ sinh.",
               bold_prefix="• RB-02 (Đồng bộ Chu trình Vòng đời Căn hộ): ")
    add_bullet(doc, "Khi thanh lý hợp đồng (TERMINATED), hệ thống bắt buộc công thức bảo toàn: refundAmount = amount - deductionAmount - remainingDebt. Số tiền hoàn cọc chỉ được giải ngân sau khi nghiệm thu tài sản và cấn trừ hết công nợ còn lại.",
               bold_prefix="• RB-03 (Bảo toàn Tài chính Hoàn cọc): ")
    add_bullet(doc, "Khi ghi nhận giao dịch thanh toán trong payments, trong cùng một Transaction: (1) Tăng paidAmount của hóa đơn; (2) Chuyển status = 'PAID' nếu trả đủ; (3) Tăng totalPaid và giảm currentDebt trong debt_ledger tức thời.",
               bold_prefix="• RB-04 (Cân đối Sổ nợ Tự động): ")
    add_bullet(doc, "Khi có sự cố hỏng hóc nghiêm trọng (priority = 'URGENT'), hệ thống cho phép nhân viên vận hành tạm khóa căn hộ sang MAINTENANCE, ngăn chặn lập tức mọi thao tác đặt phòng mới cho đến khi sự cố được nghiệm thu ĐẠT.",
               bold_prefix="• RB-05 (Khóa Căn hộ khi Sự cố Khẩn cấp): ")
    add_bullet(doc, "Cư dân chỉ được phép truy xuất dữ liệu thuộc quyền sở hữu của chính mình (tenantId giải mã từ JWT, chống IDOR theo NFR-02). Chatbot RAG tuân thủ rào chắn 'NO CONTEXT -> NO ANSWER' (NFR-04), chỉ trả lời dựa trên các vector nhúng trong bảng document_chunks của tòa nhà liên quan, từ chối triệt để mọi câu hỏi ngoài phạm vi nội quy hoặc cố ý dò quét CSDL.",
               bold_prefix="• RB-06 (Cô lập Dữ liệu Cư dân & Rào chắn An toàn GenAI): ")

    # Save document
    print(f"Saving document to: {OUT_DOCX}...")
    try:
        doc.save(OUT_DOCX)
        print(f"SUCCESS: Document 06 generated successfully at: {OUT_DOCX}")
    except PermissionError:
        temp_docx = OUT_DOCX.replace(".docx", "_updated.docx")
        doc.save(temp_docx)
        print(f"WARNING: File is locked by Word! Saved updated copy to: {temp_docx}")
    print(f"Total paragraphs: {len(doc.paragraphs)}, Total tables: {len(doc.tables)}, Total inline shapes: {len(doc.inline_shapes)}")

if __name__ == "__main__":
    build_document_06()
