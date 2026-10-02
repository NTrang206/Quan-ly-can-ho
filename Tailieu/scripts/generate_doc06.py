import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Add current scripts directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from doc_helpers import (
    set_page_setup, format_run, add_p, add_bullet,
    add_h1, add_h2, add_h3, create_styled_table, add_figure,
    FONT_FAMILY, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_TEXT, COLOR_MUTED
)

def build_document_06():
    doc = docx.Document()
    set_page_setup(doc)

    # ==================== METADATA & TITLE BLOCK ====================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("SCREEN FLOW & TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU")
    format_run(r_title, size_pt=17, bold=True, color_rgb=COLOR_PRIMARY)

    p_grp = doc.add_paragraph()
    p_grp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_grp.paragraph_format.space_after = Pt(3)
    r_grp = p_grp.add_run("Nhóm 12 - Thành viên nhóm")
    format_run(r_grp, size_pt=13, bold=False)

    p_mem1 = doc.add_paragraph()
    p_mem1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_mem1.paragraph_format.space_after = Pt(3)
    r_mem1 = p_mem1.add_run("Nguyễn Thị Trang (Trưởng nhóm)")
    format_run(r_mem1, size_pt=13, bold=False, color_rgb=COLOR_SECONDARY)

    p_mem2 = doc.add_paragraph()
    p_mem2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_mem2.paragraph_format.space_after = Pt(4)
    r_mem2 = p_mem2.add_run("Lê Quang Khánh")
    format_run(r_mem2, size_pt=13, bold=False, color_rgb=COLOR_SECONDARY)

    p_app = doc.add_paragraph()
    p_app.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_app.paragraph_format.space_after = Pt(4)
    r_app_lbl = p_app.add_run("Tên ứng dụng: ")
    format_run(r_app_lbl, size_pt=13, bold=False)
    r_app_val = p_app.add_run("Hệ thống quản lý thuê căn hộ có tích hợp AI")
    format_run(r_app_val, size_pt=13, bold=True, color_rgb=COLOR_SECONDARY)

    p_time = doc.add_paragraph()
    p_time.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_time.paragraph_format.space_after = Pt(14)
    r_time = p_time.add_run("Thời gian thực hiện: Từ 27/07/2026 đến 27/09/2026 (9 tuần)")
    format_run(r_time, size_pt=13, bold=False)

    # ==================== PHẦN 1: SCREEN FLOW ====================
    add_h1(doc, "1. Screen Flow: Phân luồng màn hình của ứng dụng")

    add_h2(doc, "1.1. Sơ đồ Kiến trúc Phân cấp & Điều hướng Màn hình Tổng thể (Screen Navigation Architecture)")
    add_p(doc, 
        "Kiến trúc điều hướng của ứng dụng web được tổ chức theo mô hình phân cấp phân luồng trạng thái "
        "(Hierarchical Screen Flow), tách biệt ranh giới truy cập giữa người dùng công khai và người dùng nội bộ "
        "được kiểm soát bằng cơ chế bảo vệ Route (PrivateRoute) và kiểm soát vai trò RBAC (Role-Based Access Control):"
    )

    nav_arch_headers = ["Phân vùng / Layout", "Màn hình Cấp 1 (Primary Routes)", "Màn hình Cấp 2 / Modals / Drawers", "Tác nhân Cho phép"]
    nav_arch_data = [
        ["Public Portal (Không yêu cầu xác thực)", "• SCR-01: Khám phá căn hộ (/)\n• SCR-02: Chi tiết căn hộ (/apartments/:id)\n• SCR-03: Đăng nhập hệ thống (/login)", "• MDL-01: AI Room Matcher Modal\n• MDL-02: Booking Giữ chỗ Modal\n• MDL-03: Bộ lọc đa tiêu chí", "Khách vãng lai, Khách tìm thuê, Cư dân, Nhân viên"],
        ["Enterprise Admin Portal (/admin/*)", "• SCR-04: Dashboard KPI (/admin/dashboard)\n• SCR-05: Quản lý Tòa nhà & Phòng (/admin/buildings)\n• SCR-06: Quản lý Đặt phòng (/admin/bookings)\n• SCR-07: Quản lý Khách thuê (/admin/tenants)\n• SCR-08: Quản lý Hợp đồng (/admin/contracts)\n• SCR-09: Quản lý Tài chính (/admin/finance)\n• SCR-10: Bảo trì Sự cố (/admin/maintenance)\n• SCR-11: Cảnh báo & AI Nhắc nợ (/admin/alerts)\n• SCR-12: Chatbot RAG (/admin/rag-chatbot)", "• MDL-04: Form Thêm/Sửa Căn hộ\n• MDL-05: Form Lập Hợp đồng mới\n• DWR-01: AI Summarizer Drawer\n• MDL-06: Sinh Khoản thu hàng loạt\n• MDL-07: VietQR Payment Modal\n• MDL-08: Biên lai thu tiền\n• MDL-09: Phân công kỹ thuật\n• DWR-02: AI Dunning Drawer", "Quản trị viên (Admin),\nNhân viên vận hành (Staff),\nKế toán (Accountant)"],
        ["Tenant Portal (/tenant-portal)", "• SCR-13: Cổng Dịch vụ Cư dân Trực tuyến\n  - Tab 1: Tổng quan căn hộ đang thuê\n  - Tab 2: Hợp đồng điện tử & Tóm tắt AI\n  - Tab 3: Hóa đơn tiện ích & VietQR\n  - Tab 4: Báo cáo bảo trì sự cố\n  - Tab 5: Hồ sơ cá nhân & Thông báo", "• DWR-01: AI Summarizer Studio\n• MDL-07: VietQR Payment Modal\n• MDL-10: Modal Báo hỏng kèm Upload ảnh\n• MDL-11: Nghiệm thu & Đánh giá 5 sao\n• WGT-01: Floating AI RAG Chatbot", "Cư dân thuê căn hộ (Tenant),\nAdmin/Staff (Chế độ mô phỏng)"],
        ["System Routes", "• SCR-14: Từ chối truy cập (/unauthorized)\n• SCR-15: Trang không tìm thấy (/404)", "• Modal thông báo lỗi hệ thống", "Tất cả tác nhân"]
    ]
    create_styled_table(doc, nav_arch_headers, nav_arch_data, col_widths=[1.5, 2.3, 2.2, 1.2], header_bg="1F497D")

    add_h2(doc, "1.2. Ma trận Chuyển đổi Trạng thái Màn hình Chuẩn (Screen Transition & Navigation Matrix)")
    add_p(doc, 
        "Bảng ma trận chuẩn kỹ thuật quy định chi tiết sự kiện kích hoạt (Trigger Actions), điều kiện rẽ nhánh (Conditions) "
        "và màn hình đích chuyển tiếp (Target Screens) cho toàn bộ hệ thống:"
    )

    screen_matrix_headers = ["Mã SCR", "Tên Màn hình / Component", "URL Route", "Màn hình Nguồn", "Hành động Kích hoạt (Trigger)", "Điều kiện Rẽ nhánh", "Màn hình Đích"]
    screen_matrix_data = [
        ["SCR-01", "Khám phá Căn hộ", "/", "URL trực tiếp / Navbar", "Click Card phòng / Click AI Matcher", "None", "SCR-02 / MDL-01"],
        ["SCR-02", "Chi tiết Căn hộ", "/apartments/:id", "SCR-01", "Click 'Đặt phòng ngay'", "Phòng = AVAILABLE", "MDL-02 (Booking Modal)"],
        ["MDL-01", "AI Room Matcher Modal", "Popup Modal", "SCR-01", "Gửi tin nhắn nhu cầu tìm phòng", "AI gợi ý phòng phù hợp", "SCR-02 (Chi tiết phòng)"],
        ["MDL-02", "Đặt phòng Giữ chỗ Modal", "Popup Modal", "SCR-02", "Submit form thông tin khách", "Hợp lệ -> Cấp Booking Code", "SCR-01 (Phòng -> RESERVED)"],
        ["SCR-03", "Đăng nhập Hệ thống", "/login", "Navbar / Direct", "Submit Username & Password", "Xác thực JWT thành công", "Rẽ nhánh theo Role (RBAC)"],
        ["--", "Bộ điều hướng RBAC", "Internal", "SCR-03", "Giải mã JWT Role", "Role = ADMIN / ACCOUNTANT\nRole = STAFF\nRole = TENANT\nKhông đủ quyền", "SCR-04 (Dashboard)\nSCR-05 (Buildings)\nSCR-13 (Tenant Portal)\nSCR-14 (Unauthorized)"],
        ["SCR-04", "Tổng quan & Dashboard", "/admin/dashboard", "SCR-03 / Sidebar", "Click thẻ KPI / Quick Action", "Role in [ADMIN, ACCOUNTANT]", "SCR-05 / SCR-08 / SCR-09"],
        ["SCR-05", "Quản lý Tòa nhà & Phòng", "/admin/buildings", "Sidebar / SCR-04", "Click 'Thêm căn hộ' / 'Tạo HĐ'", "Role in [ADMIN, STAFF]", "MDL-04 / SCR-08"],
        ["SCR-06", "Quản lý Đặt phòng", "/admin/bookings", "Sidebar", "Click 'Duyệt & Lập hợp đồng'", "Booking = PENDING", "SCR-08 (Kế thừa thông tin)"],
        ["SCR-07", "Quản lý Khách thuê", "/admin/tenants", "Sidebar", "Click 'Thêm khách' / 'Người ở cùng'", "Role in [ADMIN, STAFF]", "Modal Thêm Khách / Ở cùng"],
        ["SCR-08", "Quản lý Hợp đồng & Cọc", "/admin/contracts", "Sidebar / SCR-05,06", "Click 'Lập HĐ' / 'AI Tóm tắt' / 'Duyệt'", "Role in [ADMIN, STAFF]", "MDL-05 / DWR-01 / Thu cọc"],
        ["DWR-01", "AI Summarizer Drawer", "Drawer trượt", "SCR-08 / SCR-13", "Click 'Xem AI Tóm tắt'", "Contract != Null", "Hiển thị 5 điều khoản tóm tắt"],
        ["SCR-09", "Quản lý Tài chính & Sổ nợ", "/admin/finance", "Sidebar / SCR-04", "Click 'Sinh khoản thu' / 'VietQR'", "Role in [ADMIN, ACCOUNTANT]", "MDL-06 / MDL-07 / MDL-08"],
        ["MDL-07", "VietQR Payment Modal", "Popup Modal", "SCR-09 / SCR-13", "Click 'Thanh toán VietQR'", "Hóa đơn = UNPAID", "Hiển thị QR Napas 24/7 -> PAID"],
        ["SCR-10", "Tiếp nhận & Bảo trì Sự cố", "/admin/maintenance", "Sidebar / SCR-04", "Click 'Phân công' / 'Nghiệm thu'", "Role in [ADMIN, STAFF]", "MDL-09 (Chuyển IN_PROGRESS/DONE)"],
        ["SCR-11", "Cảnh báo & AI Nhắc nợ", "/admin/alerts", "Sidebar", "Click 'Quét cảnh báo' / 'AI Soạn'", "Phát hiện nợ quá hạn/HĐ hết hạn", "DWR-02 (AI Dunning Drawer)"],
        ["DWR-02", "AI Dunning Drawer", "Drawer trượt", "SCR-11", "Click 'Gửi thông báo'", "Duyệt nội dung AI", "Dispatch Zalo/SMS (is_sent=True)"],
        ["SCR-12", "Trợ lý Chatbot RAG", "/admin/rag-chatbot", "Sidebar / Float", "Gửi câu hỏi tra cứu nội quy", "Vector Search Cosine", "Hiển thị câu trả lời + Trích dẫn"],
        ["SCR-13", "Cổng Cư dân Trực tuyến", "/tenant-portal", "SCR-03 / Direct", "Chuyển Tab chức năng", "Role = TENANT", "Hiển thị Tab HĐ, Phí, Báo hỏng"],
        ["SCR-14", "Từ chối Quyền hạn", "/unauthorized", "PrivateRoute", "Truy cập URL vượt thẩm quyền", "403 Forbidden", "Nút quay lại Trang chủ / Login"]
    ]
    create_styled_table(doc, screen_matrix_headers, screen_matrix_data, col_widths=[0.6, 1.4, 1.0, 1.0, 1.4, 1.0, 1.0], header_bg="1F497D")

    add_h2(doc, "1.3. Đặc tả Kỹ thuật Các Phân luồng Màn hình Nghiệp vụ Trọng tâm")
    add_p(doc, 
        "Dưới đây là 10 luồng màn hình nghiệp vụ chuẩn (Screen Flow Sequences) được mô hình hóa theo chuỗi chuyển đổi trạng thái "
        "màn hình, điều kiện logic và thành phần giao diện kích hoạt tương ứng:"
    )

    # SF-01
    add_h3(doc, "1.3.1. Phân luồng SF-01: Khám phá Căn hộ & Đặt phòng Giữ chỗ Trực tuyến (Public Booking Flow - UC011)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-01: PublicExplorePage] ──(Click Card căn hộ)──> [SCR-02: ApartmentDetailPage] ──(Click 'Đặt phòng ngay')──> [MDL-02: BookingModal] ──(Submit form hợp lệ)──> Cấp mã Booking, chuyển trạng thái Căn hộ sang RESERVED ──(Redirect)──> [SCR-01]\n"
        "• Nhánh rẽ phụ AI Matcher:\n"
        "[SCR-01: PublicExplorePage] ──(Click 'Trợ lý AI Tìm phòng')──> [MDL-01: AIRoomMatcherModal] ──(AI gợi ý phòng phù hợp)──> Click chọn phòng ──(Redirect)──> [SCR-02: ApartmentDetailPage]"
    )
    sf01_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf01_data = [
        ["1", "SCR-01 (Explore)", "Duyệt danh sách hoặc lọc phòng", "Hiển thị danh sách phòng AVAILABLE", "SCR-01", "Filter Bar (Building, Price, Beds)"],
        ["2", "SCR-01 (Explore)", "Click vào 1 Card căn hộ", "Truy vấn ID phòng qua API", "SCR-02 (Detail)", "Apartment Card Click Event"],
        ["3", "SCR-02 (Detail)", "Xem ảnh, thông số & click 'Đặt phòng'", "Kiểm tra phòng vẫn AVAILABLE", "MDL-02 (Modal)", "Nút 'Đặt phòng & Giữ chỗ ngay'"],
        ["4", "MDL-02 (Modal)", "Điền Form (Họ tên, SĐT, CCCD, Ngày vào)", "Validate hợp lệ -> Tạo Booking (PENDING)", "SCR-01 (Explore)", "Nút 'Gửi yêu cầu đặt phòng'"]
    ]
    create_styled_table(doc, sf01_headers, sf01_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 3_ Cổng Tìm Phòng & Đặt Phòng Trực Tuyến (UC011).png",
               "Hình 1.1: Phân luồng Màn hình Khám phá Căn hộ & Cổng Đặt phòng Trực tuyến (SF-01 - UC011)", width=Inches(5.9))

    # SF-02
    add_h3(doc, "1.3.2. Phân luồng SF-02: Xác thực Danh tính & Điều hướng Phân quyền RBAC (Authentication Flow - UC009)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-03: LoginPage] ──(Nhập Username/Password & Submit)──> [API: /auth/login] ──(So khớp Hash BCrypt & Sinh JWT Token)──>\n"
        "  ├─ Trường hợp 1: Role = 'ADMIN' hoặc 'ACCOUNTANT' ──(Điều hướng)──> [SCR-04: AdminDashboardPage]\n"
        "  ├─ Trường hợp 2: Role = 'STAFF' ──(Điều hướng)──> [SCR-05: BuildingsPage]\n"
        "  ├─ Trường hợp 3: Role = 'TENANT' ──(Điều hướng)──> [SCR-13: ResidentPortalPage]\n"
        "  └─ Trường hợp 4: Sai tài khoản/mật khẩu ──(Giữ nguyên)──> [SCR-03] kèm Toast Error"
    )
    sf02_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf02_data = [
        ["1", "SCR-03 (Login)", "Nhập Username & Password", "Form validation không rỗng", "SCR-03", "Input Fields (Username, Password)"],
        ["2", "SCR-03 (Login)", "Nhấn 'Đăng nhập vào Hệ thống'", "API xác thực BCrypt, sinh JWT Token", "Điều hướng RBAC", "Button 'Đăng nhập' (Submit)"],
        ["3a", "Điều hướng RBAC", "Hệ thống tự động chuyển hướng", "Role in ['ADMIN', 'ACCOUNTANT']", "SCR-04 (Dashboard)", "PrivateRoute Redirection"],
        ["3b", "Điều hướng RBAC", "Hệ thống tự động chuyển hướng", "Role = 'STAFF'", "SCR-05 (Buildings)", "PrivateRoute Redirection"],
        ["3c", "Điều hướng RBAC", "Hệ thống tự động chuyển hướng", "Role = 'TENANT'", "SCR-13 (Portal)", "PrivateRoute Redirection"]
    ]
    create_styled_table(doc, sf02_headers, sf02_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 11_ Phân Quyền RBAC & Quản Trị Hệ Thống.png",
               "Hình 1.2: Phân luồng Màn hình Xác thực & Kiểm soát Truy cập Đa vai trò RBAC (SF-02 - UC009)", width=Inches(5.9))

    # SF-03
    add_h3(doc, "1.3.3. Phân luồng SF-03: Lập Hợp đồng Thuê, Kích hoạt AI Tóm tắt & Phê duyệt (Contract Flow - UC001, UC002)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-05 / SCR-06] ──(Click 'Lập HĐ')──> [SCR-08: ContractsPage] ──(Click 'Lập HĐ Mới')──> [MDL-05: ContractModal] ──(Nhập thông tin & Click 'AI Tóm tắt')──> [DWR-01: AISummarizerDrawer] ──(Submit)──> Lưu Hợp đồng DRAFT / PENDING_APPROVAL ──(Admin Click 'Phê duyệt')──> Hợp đồng ACTIVE, Căn hộ chuyển OCCUPIED, sinh bản ghi Cọc HELD."
    )
    sf03_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf03_data = [
        ["1", "SCR-08 (Contracts)", "Click nút 'Lập Hợp đồng Mới'", "Mở biểu mẫu hợp đồng rỗng", "MDL-05 (Modal)", "Button '+ Lập Hợp đồng Mới'"],
        ["2", "MDL-05 (Modal)", "Chọn Căn hộ, Khách thuê, Thời hạn, Giá", "Kiểm tra chống trùng lịch thuê (RB-01)", "MDL-05 (Modal)", "Select Apartment, DatePickers"],
        ["3", "MDL-05 (Modal)", "Click nút 'AI Tóm tắt Điều khoản'", "LLM phân tích trích xuất 5 điều khoản", "DWR-01 (Drawer)", "Button 'Kích hoạt AI Summarizer'"],
        ["4", "MDL-05 (Modal)", "Click 'Lưu Hợp đồng & Gửi Duyệt'", "Tạo bản ghi contracts (PENDING_APPROVAL)", "SCR-08 (Contracts)", "Button 'Lưu Dự thảo & Gửi duyệt'"],
        ["5", "SCR-08 (Contracts)", "Admin nhấn 'Phê duyệt Hợp đồng'", "Contract -> ACTIVE; Apartment -> OCCUPIED", "SCR-08 (Contracts)", "Button 'Phê duyệt' (Action Column)"]
    ]
    create_styled_table(doc, sf03_headers, sf03_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 5_ Hợp Đồng Thuê, Tiền Cọc & AI Tóm Tắt (UC001, UC002).png",
               "Hình 1.3: Phân luồng Màn hình Quản lý Hợp đồng Thuê & AI Tóm tắt Điều khoản (SF-03 - UC001, UC002)", width=Inches(5.9))

    # SF-04
    add_h3(doc, "1.3.4. Phân luồng SF-04: Quản lý Hồ sơ Khách thuê & Khai báo Người ở cùng (Tenant Flow - UC008)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-07: TenantsPage] ──(Click 'Thêm Khách')──> [Modal: Thêm Khách thuê] ──(Submit CCCD duy nhất)──> Bản ghi Khách thuê tạo lập ──(Click dòng Khách)──> Mở chi tiết Tab 'Người ở cùng' ──(Click 'Thêm người ở cùng')──> Lưu CCCD & SĐT người ở cùng vào bảng roommates."
    )
    sf04_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf04_data = [
        ["1", "SCR-07 (Tenants)", "Click 'Thêm Khách thuê Mới'", "Mở modal nhập hồ sơ pháp lý", "Modal Thêm Khách", "Button '+ Thêm Khách thuê'"],
        ["2", "Modal Thêm Khách", "Nhập Họ tên, CCCD, SĐT, Quê quán", "Kiểm tra UNIQUE(citizen_id)", "SCR-07 (Tenants)", "Button 'Lưu thông tin'"],
        ["3", "SCR-07 (Tenants)", "Chọn Tab 'Người ở cùng phòng'", "Lọc danh sách roommates theo tenant_id", "SCR-07 (Tenants)", "Tab Header 'Người ở cùng'"],
        ["4", "SCR-07 (Tenants)", "Click 'Thêm người ở cùng' & Submit", "Thêm bản ghi vào bảng roommates", "SCR-07 (Tenants)", "Form Modal 'Thêm người ở cùng'"]
    ]
    create_styled_table(doc, sf04_headers, sf04_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 4_ Quản Lý Khách Thuê & Người Ở Cùng (UC008).png",
               "Hình 1.4: Phân luồng Màn hình Quản lý Hồ sơ Khách thuê & Người ở cùng (SF-04 - UC008)", width=Inches(5.9))

    # SF-05
    add_h3(doc, "1.3.5. Phân luồng SF-05: Thu phí Định kỳ, Quét mã VietQR & Cập nhật Sổ nợ (Finance Flow - UC003)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-09: FinancePage] ──(Click 'Sinh khoản thu hàng loạt')──> [MDL-06: BatchBillingModal] ──(Xác nhận kỳ thu)──> Sinh danh sách Hóa đơn UNPAID ──(Click 'Thanh toán VietQR')──> [MDL-07: VietQRModal] ──(Khách quét mã chuyển tiền thành công / Kế toán xác nhận)──> Hóa đơn chuyển PAID, cập nhật số dư debt_ledger ──(Click 'In phiếu thu')──> [MDL-08: ReceiptModal]."
    )
    sf05_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf05_data = [
        ["1", "SCR-09 (Finance)", "Click 'Sinh Khoản thu Định kỳ'", "Mở modal chọn tháng/năm thu phí", "MDL-06 (Modal)", "Button 'Sinh khoản thu định kỳ'"],
        ["2", "MDL-06 (Modal)", "Chọn Tháng, Năm & Hạn nộp", "Quét HĐ ACTIVE, sinh receivables", "SCR-09 (Finance)", "Button 'Xác nhận tạo khoản thu'"],
        ["3", "SCR-09 (Finance)", "Click 'VietQR' tại dòng hóa đơn", "Tạo chuỗi VietQR Napas động kèm số tiền", "MDL-07 (QR Modal)", "Button 'VietQR' (Action Row)"],
        ["4", "MDL-07 (QR Modal)", "Xác nhận đã nhận thanh toán", "paid_amount = total; status = PAID", "SCR-09 (Finance)", "Button 'Xác nhận thanh toán'"],
        ["5", "SCR-09 (Finance)", "Click 'Xem Biên lai' tại hóa đơn PAID", "Truy vấn payments, hiển thị phiếu thu", "MDL-08 (Receipt)", "Button 'In biên lai điện tử'"]
    ]
    create_styled_table(doc, sf05_headers, sf05_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 6_ Khoản Thu Định Kỳ, Thanh Toán VietQR & Sổ Nợ (UC003).png",
               "Hình 1.5: Phân luồng Màn hình Quản lý Thu phí Định kỳ & Thanh toán VietQR Napas (SF-05 - UC003)", width=Inches(5.9))

    # SF-06
    add_h3(doc, "1.3.6. Phân luồng SF-06: Tiếp nhận Báo hỏng, Tạm khóa Phòng & Nghiệm thu (Maintenance Flow - UC004)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-13: ResidentPortal (Tab Sự cố)] ──(Click 'Báo hỏng mới')──> [MDL-10: ReportModal] ──(Nhập mô tả + Ảnh)──> Tạo phiếu PENDING ──(Chuyển sang Ban Quản lý)──> [SCR-10: MaintenancePage] ──(Click 'Phân công')──> [MDL-09: AssignModal] (Nếu URGENT: Căn hộ -> MAINTENANCE) ──(Kỹ thuật sửa xong)──> [SCR-10] Click 'Nghiệm thu' ──(Chốt chi phí)──> Phiếu COMPLETED, khôi phục phòng OCCUPIED."
    )
    sf06_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf06_data = [
        ["1", "SCR-13 (Portal)", "Cư dân vào Tab Sự cố & nhấn Báo hỏng", "Mở modal báo cáo sự cố kèm upload ảnh", "MDL-10 (Modal)", "Button '+ Báo hỏng mới'"],
        ["2", "MDL-10 (Modal)", "Nhập mô tả, chọn mức ưu tiên, đính ảnh", "Tạo bản ghi maintenance_requests", "SCR-13 (Portal)", "Button 'Gửi yêu cầu sửa chữa'"],
        ["3", "SCR-10 (Admin)", "Nhân viên xem phiếu & nhấn Phân công", "Chuyển phiếu sang IN_PROGRESS", "MDL-09 (Modal)", "Button 'Phân công kỹ thuật'"],
        ["4", "SCR-10 (Admin)", "Nhân viên nhấn 'Nghiệm thu hoàn thành'", "Nhập chi phí sửa, đóng phiếu COMPLETED", "SCR-10 (Admin)", "Button 'Nghiệm thu ĐẠT'"]
    ]
    create_styled_table(doc, sf06_headers, sf06_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 7_ Tiếp Nhận & Nghiệm Thu Bảo Trì Kỹ Thuật & Xử Lý Sự Cố (UC004).png",
               "Hình 1.6: Phân luồng Màn hình Tiếp nhận & Nghiệm thu Bảo trì Kỹ thuật Sự cố (SF-06 - UC004)", width=Inches(5.9))

    # SF-07
    add_h3(doc, "1.3.7. Phân luồng SF-07: Quét Cảnh báo Tự động & AI Soạn tin Đôn đốc Nợ (Alert & Dunning Flow - UC005)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-11: AlertsAIPage] ──(Click 'Quét Cảnh báo Tự động')──> Rule Engine quét receivables quá hạn & contracts hết hạn ──(Sinh bản ghi system_alerts)──> Click 'AI Soạn Thảo' ──(Mở DWR-02: AIDunningDrawer)──> LLM sinh nội dung đôn đốc ──(Kiểm duyệt & Click 'Gửi')──> Đổi is_sent = True, thông báo gửi tới Cư dân."
    )
    sf07_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf07_data = [
        ["1", "SCR-11 (Alerts)", "Click 'Quét Cảnh báo Tự động'", "Rule Engine rà soát CSDL tìm nợ/hạn", "SCR-11 (Alerts)", "Button 'Quét cảnh báo tự động'"],
        ["2", "SCR-11 (Alerts)", "Click 'AI Soạn tin' tại dòng cảnh báo", "Gọi Google Gemini API sinh thông điệp", "DWR-02 (Drawer)", "Button 'AI Soạn thảo thông báo'"],
        ["3", "DWR-02 (Drawer)", "Xem trước nội dung tin nhắn đôn đốc", "Hiển thị tiền nợ, ngày trễ, mã VietQR", "DWR-02 (Drawer)", "Text Preview Area"],
        ["4", "DWR-02 (Drawer)", "Click nút 'Phê duyệt & Gửi thông báo'", "Cập nhật is_sent = True, dispatch tin", "SCR-11 (Alerts)", "Button 'Gửi thông báo tới cư dân'"]
    ]
    create_styled_table(doc, sf07_headers, sf07_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 8_ AI Đôn Đốc Nợ & Nhắc Phí Tự Động (UC009).png",
               "Hình 1.7: Phân luồng Màn hình Quét Cảnh báo Tự động & AI Soạn thảo Tin Đôn đốc (SF-07 - UC005)", width=Inches(5.9))

    # SF-08
    add_h3(doc, "1.3.8. Phân luồng SF-08: Trợ lý Chatbot AI RAG Tra cứu Nội quy Tòa nhà 24/7 (RAG Chatbot Flow - UC006)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[Bất kỳ Màn hình nào trên Cổng Cư dân hoặc SCR-12] ──(Click Biểu tượng Bot nổi)──> [WGT-01: FloatingAIChatbot] ──(Gửi câu hỏi tra cứu nội quy)──> Hệ thống truy vấn Vector Cosine Similarity trên document_chunks ──(Prompt Context Injection)──> LLM phản hồi câu trả lời kèm Trích dẫn điều khoản chính xác."
    )
    sf08_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf08_data = [
        ["1", "SCR-13 hoặc SCR-12", "Click icon Chat AI nổi góc phải", "Mở khung đối thoại thông minh", "WGT-01 (Chatbot)", "Floating Chat Icon Button"],
        ["2", "WGT-01 (Chatbot)", "Nhập câu hỏi nội quy (VD: nuôi thú cưng)", "Gửi query tới API `/ai/rag-query`", "WGT-01 (Chatbot)", "Input Text & Button 'Gửi'"],
        ["3", "WGT-01 (Chatbot)", "Hệ thống truy xuất tài liệu", "Vector Search Top-K đoạn văn bản", "WGT-01 (Chatbot)", "RAG Retrieval Engine"],
        ["4", "WGT-01 (Chatbot)", "Hiển thị câu trả lời & trích dẫn", "Loại bỏ ảo giác, trích dẫn số trang", "WGT-01 (Chatbot)", "Bot Response Message Bubble"]
    ]
    create_styled_table(doc, sf08_headers, sf08_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 9_ Trợ Lý AI RAG & Tra Cứu Hỏi Đáp Nội Quy, Hợp Đồng (UC005, UC006).png",
               "Hình 1.8: Phân luồng Màn hình Trợ lý AI RAG Tra cứu Nội quy Tòa nhà & Hợp đồng (SF-08 - UC006)", width=Inches(5.9))

    # SF-09
    add_h3(doc, "1.3.9. Phân luồng SF-09: Dashboard Tổng quan & Điều phối Nghiệp vụ KPI (Dashboard Flow - UC010)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-04: AdminDashboardPage] ──(Xem KPI Tổng quan)──>\n"
        "  ├─ Click Thẻ 'Tỷ lệ lấp đầy phòng' ──(Điều hướng)──> [SCR-05: BuildingsPage]\n"
        "  ├─ Click Thẻ 'Doanh thu tháng' hoặc 'Nợ quá hạn' ──(Điều hướng)──> [SCR-09: FinancePage]\n"
        "  ├─ Click Thẻ 'Sự cố đang chờ xử lý' ──(Điều hướng)──> [SCR-10: MaintenancePage]\n"
        "  └─ Click Nút 'Xuất Báo cáo KPI' ──(Tải file trực tiếp)──> Export Báo cáo Excel/PDF"
    )
    sf09_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf09_data = [
        ["1", "SCR-04 (Dashboard)", "Xem các chỉ số KPI vận hành", "Truy vấn aggregation thời gian thực", "SCR-04 (Dashboard)", "StatCards (Occupancy, Revenue, Debt)"],
        ["2", "SCR-04 (Dashboard)", "Click vào Thẻ StatCard bất kỳ", "Chuyển tiếp đến phân hệ quản lý chi tiết", "SCR-05, SCR-09, SCR-10", "StatCard Click Event"],
        ["3", "SCR-04 (Dashboard)", "Chọn bộ lọc tháng / năm", "Tính toán lại biểu đồ doanh thu", "SCR-04 (Dashboard)", "Select Month / Year Picker"],
        ["4", "SCR-04 (Dashboard)", "Click 'Xuất báo cáo'", "Kết xuất bảng tính chuẩn", "Tải file về máy", "Button 'Xuất Báo cáo Excel/PDF'"]
    ]
    create_styled_table(doc, sf09_headers, sf09_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Kế toán/Màn hình 1_ Tổng Quan & Dashboard KPI (UC010).png",
               "Hình 1.9: Phân luồng Màn hình Dashboard Quản trị & Báo cáo Thống kê KPI Điều hành (SF-09 - UC010)", width=Inches(5.9))

    # SF-10
    add_h3(doc, "1.3.10. Phân luồng SF-10: Cổng Dịch vụ Cư dân Trực tuyến Toàn diện (Tenant Portal Flow)")
    add_p(doc, 
        "• Chuỗi chuyển đổi trạng thái màn hình:\n"
        "[SCR-13: ResidentPortalPage] ──(Tương tác điều hướng Tab Cư dân)──>\n"
        "  ├─ Tab 1: Tổng quan ──(Xem phòng, hạn nộp phí gần nhất, trạng thái thuê)\n"
        "  ├─ Tab 2: Hợp đồng ──(Xem chi tiết hợp đồng & Mở DWR-01: AI Summarizer Studio)\n"
        "  ├─ Tab 3: Hóa đơn & VietQR ──(Xem danh sách phí, Mở MDL-07: Quét VietQR Napas thanh toán)\n"
        "  ├─ Tab 4: Báo trì sự cố ──(Mở MDL-10: Gửi phản ánh kèm ảnh & Đánh giá 5 sao)\n"
        "  └─ Widget: Floating Chatbot ──(Mở WGT-01: Chat RAG nội quy tòa nhà 24/7)"
    )
    sf10_headers = ["Bước", "Màn hình Nguồn", "Hành động Người dùng", "Điều kiện / Xử lý Hệ thống", "Màn hình Đích", "Thành phần UI Kích hoạt"]
    sf10_data = [
        ["1", "SCR-13 (Portal)", "Cư dân đăng nhập và vào Cổng cư dân", "Xác thực JWT Role = TENANT", "SCR-13 (Overview)", "Tenant Sidebar / Navbar"],
        ["2", "SCR-13 (Portal)", "Click Tab 'Hợp đồng' & 'AI Tóm tắt'", "Hiển thị 5 điều khoản hợp đồng số", "DWR-01 (Drawer)", "Button 'Xem AI Tóm tắt'"],
        ["3", "SCR-13 (Portal)", "Click Tab 'Hóa đơn' & 'Thanh toán'", "Mở mã QR động chuẩn VietQR Napas", "MDL-07 (QR Modal)", "Button 'Thanh toán VietQR'"],
        ["4", "SCR-13 (Portal)", "Click Tab 'Bảo trì' & 'Báo hỏng mới'", "Mở form báo sự cố kèm upload ảnh", "MDL-10 (Modal)", "Button 'Gửi báo cáo sự cố'"]
    ]
    create_styled_table(doc, sf10_headers, sf10_data, col_widths=[0.4, 1.2, 1.5, 1.6, 1.2, 1.3], header_bg="2C3E50")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Cổng Dịch Vụ Cư Dân & Khách Thuê Toàn Diện - Sunshine Homes.png",
               "Hình 1.10: Phân luồng Giao diện Cổng Dịch vụ Cư dân Trực tuyến Toàn diện (SF-10 - Resident Portal)", width=Inches(5.9))


    # ==================== PHẦN 2: CƠ SỞ DỮ LIỆU ====================
    add_h1(doc, "2. Cơ sở dữ liệu")

    add_h2(doc, "2.1. Cơ sở dữ liệu quan hệ")
    add_p(doc, 
        "Cơ sở dữ liệu của Hệ thống Quản lý thuê Căn hộ được thiết kế tuân thủ nghiêm ngặt chuẩn hóa dữ liệu dạng 3NF "
        "(Third Normal Form), đảm bảo không trùng lặp thông tin, tối ưu hóa hiệu năng truy vấn và bảo đảm tính toàn vẹn quan hệ "
        "giữa các phân hệ nghiệp vụ: Khách hàng - Phòng - Hợp đồng - Tài chính - Bảo trì - Cảnh báo - AI Knowledge Base. "
        "Hệ thống hỗ trợ cơ chế lưu trữ linh hoạt với Hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở mạnh mẽ (PostgreSQL "
        "v16 / SQLite v3 cho môi trường phát triển cục bộ)."
    )

    add_h3(doc, "2.1.1. Sơ đồ Quan hệ Thực thể Tổng thể (ERD - Entity Relationship Diagram)")
    add_p(doc, 
        "Sơ đồ ERD tổng thể bao gồm 18 thực thể dữ liệu chuẩn hóa, thể hiện đầy đủ các mối quan hệ (1-1, 1-N, N-N), "
        "khóa chính (Primary Key - PK) và khóa ngoại (Foreign Key - FK) liên kết giữa các bảng:"
    )

    erd_img_path = "d:/Detai12_QLCH/Tailieu/scratch_imgs/doc4_img_2.png"
    add_figure(doc, erd_img_path, "Hình 2.1: Sơ đồ Quan hệ Thực thể Cơ sở dữ liệu Tổng quan (ERD 18 Bảng chuẩn 3NF)", width=Inches(6.2))

    add_h3(doc, "2.1.2. Danh mục Bảng Dữ liệu Quan hệ trong Hệ thống")
    add_p(doc, "Bảng tổng hợp danh mục 18 thực thể dữ liệu cấu thành cơ sở dữ liệu hệ thống:")

    table_catalog_headers = ["STT", "Tên Bảng (Table)", "Tên Thực thể Nghiệp vụ", "Phân hệ Nghiệp vụ", "Số Cột", "Khóa Chính (PK)", "Khóa Ngoại (FK)"]
    table_catalog_data = [
        ["1", "roles", "Vai trò Người dùng", "Xác thực & RBAC", "5", "id", "Không"],
        ["2", "users", "Tài khoản Người dùng", "Xác thực & RBAC", "9", "id", "role_id"],
        ["3", "buildings", "Danh mục Tòa nhà", "Quản lý Căn hộ", "7", "id", "Không"],
        ["4", "apartments", "Danh mục Căn hộ", "Quản lý Căn hộ", "16", "id", "building_id"],
        ["5", "amenities", "Trang thiết bị / Tiện ích", "Quản lý Căn hộ", "6", "id", "apartment_id"],
        ["6", "tenants", "Hồ sơ Khách thuê", "Quản lý Khách thuê", "9", "id", "user_id"],
        ["7", "roommates", "Người ở cùng phòng", "Quản lý Khách thuê", "7", "id", "tenant_id, apartment_id"],
        ["8", "emergency_contacts", "Người liên hệ khẩn cấp", "Quản lý Khách thuê", "5", "id", "tenant_id"],
        ["9", "contracts", "Hợp đồng thuê căn hộ", "Quản lý Hợp đồng", "14", "id", "apartment_id, tenant_id, created_by, approved_by, booking_id"],
        ["10", "deposits", "Quản lý Tiền cọc", "Quản lý Hợp đồng", "10", "id", "contract_id, handled_by"],
        ["11", "receivables", "Khoản phải thu / Hóa đơn", "Quản lý Tài chính", "11", "id", "contract_id, apartment_id"],
        ["12", "payments", "Lịch sử Giao dịch Thu", "Quản lý Tài chính", "8", "id", "receivable_id, handled_by"],
        ["13", "debt_ledger", "Sổ cái Công nợ Cư dân", "Quản lý Tài chính", "6", "id", "tenant_id"],
        ["14", "maintenance_requests", "Phiếu Yêu cầu Bảo trì", "Vận hành & Kỹ thuật", "13", "id", "apartment_id, assigned_staff_id, tenant_id"],
        ["15", "system_alerts", "Cảnh báo Tự động & AI", "Cảnh báo & AI", "6", "id", "Không (reference_id)"],
        ["16", "document_chunks", "Văn bản Phân mảnh RAG", "Trí tuệ Nhân tạo", "6", "id", "Không"],
        ["17", "bookings", "Yêu cầu Đặt phòng", "Cổng Khách hàng", "11", "id", "apartment_id"],
        ["18", "audit_logs", "Nhật ký Kiểm toán Hệ thống", "Bảo mật & Giám sát", "7", "id", "user_id"]
    ]
    create_styled_table(doc, table_catalog_headers, table_catalog_data, col_widths=[0.4, 1.4, 1.5, 1.2, 0.5, 0.4, 1.5], header_bg="1F497D")

    add_h3(doc, "2.1.3. Đặc tả Cấu trúc Chi tiết Toàn bộ 18 Bảng Cơ sở Dữ liệu")
    add_p(doc, 
        "Dưới đây là từ điển dữ liệu (Data Dictionary) chi tiết của toàn bộ 18 bảng, định rõ kiểu dữ liệu, "
        "ràng buộc khóa, giá trị mặc định và ý nghĩa nghiệp vụ của từng trường:"
    )

    # 1. roles
    add_p(doc, "Bảng 1: roles - Danh mục vai trò phân quyền người dùng trong hệ thống (RBAC)", bold_prefix="2.1.3.1. ")
    r_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    r_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của vai trò"],
        ["2", "role_code", "VARCHAR(30)", "UNIQUE, NOT NULL", "None", "Mã vai trò chuẩn (ADMIN, STAFF, ACCOUNTANT, TENANT)"],
        ["3", "role_name", "VARCHAR(50)", "NOT NULL", "None", "Tên hiển thị vai trò (Quản trị viên, Nhân viên, Kế toán, Khách thuê)"],
        ["4", "description", "VARCHAR(255)", "NULL", "None", "Mô tả phạm vi quyền hạn và trách nhiệm của vai trò"],
        ["5", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm khởi tạo bản ghi vai trò"]
    ]
    create_styled_table(doc, r_hdr, r_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 2. users
    add_p(doc, "Bảng 2: users - Tài khoản người dùng đăng nhập hệ thống và thông tin xác thực", bold_prefix="2.1.3.2. ")
    u_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    u_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của người dùng"],
        ["2", "role_id", "INTEGER", "FK(roles.id), NOT NULL", "None", "Liên kết vai trò phân quyền của tài khoản"],
        ["3", "username", "VARCHAR(50)", "UNIQUE, NOT NULL", "None", "Tên đăng nhập hệ thống duy nhất"],
        ["4", "password_hash", "VARCHAR(255)", "NOT NULL", "None", "Mật khẩu băm an toàn theo thuật toán BCrypt"],
        ["5", "full_name", "VARCHAR(100)", "NOT NULL", "None", "Họ và tên đầy đủ của người dùng"],
        ["6", "email", "VARCHAR(100)", "NULL", "None", "Địa chỉ thư điện tử nhận thông báo"],
        ["7", "phone", "VARCHAR(20)", "NOT NULL", "None", "Số điện thoại liên lạc chính thức"],
        ["8", "is_active", "BOOLEAN", "NOT NULL", "TRUE", "Trạng thái tài khoản (TRUE: đang hoạt động, FALSE: bị khóa)"],
        ["9", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm đăng ký tài khoản"]
    ]
    create_styled_table(doc, u_hdr, u_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 3. buildings
    add_p(doc, "Bảng 3: buildings - Danh mục các tòa nhà căn hộ do đơn vị vận hành quản lý", bold_prefix="2.1.3.3. ")
    b_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    b_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của tòa nhà"],
        ["2", "building_code", "VARCHAR(30)", "UNIQUE, NOT NULL", "None", "Mã hiệu viết tắt của tòa nhà (VD: TN-A, TN-B)"],
        ["3", "name", "VARCHAR(100)", "NOT NULL", "None", "Tên đầy đủ của tòa nhà (VD: Sunshine Tower A)"],
        ["4", "address", "VARCHAR(255)", "NOT NULL", "None", "Địa chỉ hành chính thực tế của tòa nhà"],
        ["5", "total_floors", "INTEGER", "NOT NULL", "1", "Tổng số tầng lầu của tòa nhà"],
        ["6", "total_apartments", "INTEGER", "NOT NULL", "0", "Tổng số lượng căn hộ hiện hữu trong tòa nhà"],
        ["7", "status", "VARCHAR(30)", "NOT NULL", "'ACTIVE'", "Trạng thái vận hành tòa nhà (ACTIVE, INACTIVE)"],
        ["8", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm đưa tòa nhà vào quản lý"]
    ]
    create_styled_table(doc, b_hdr, b_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 4. apartments
    add_p(doc, "Bảng 4: apartments - Danh mục thông tin chi tiết từng căn hộ cho thuê", bold_prefix="2.1.3.4. ")
    a_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    a_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của căn hộ"],
        ["2", "building_id", "INTEGER", "FK(buildings.id), NOT NULL", "None", "Mã tòa nhà trực thuộc"],
        ["3", "room_number", "VARCHAR(20)", "NOT NULL", "None", "Số phòng căn hộ (VD: P.101, P.302, P.505)"],
        ["4", "floor", "INTEGER", "NOT NULL", "1", "Vị trí tầng của căn hộ"],
        ["5", "area_sqm", "NUMERIC(8, 2)", "NOT NULL", "None", "Diện tích sử dụng thực tế (m2)"],
        ["6", "price", "NUMERIC(12, 2)", "NOT NULL", "None", "Giá thuê niêm yết hàng tháng (VNĐ)"],
        ["7", "max_occupants", "INTEGER", "NOT NULL", "2", "Số lượng người cư trú tối đa cho phép"],
        ["8", "status", "VARCHAR(20)", "NOT NULL", "'AVAILABLE'", "Trạng thái phòng: AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE"],
        ["9", "bedrooms", "INTEGER", "NOT NULL", "1", "Số lượng phòng ngủ"],
        ["10", "bathrooms", "INTEGER", "NOT NULL", "1", "Số lượng phòng vệ sinh / tắm"],
        ["11", "image_url", "VARCHAR(255)", "NULL", "None", "Đường dẫn URL ảnh đại diện căn hộ"],
        ["12", "description", "TEXT", "NULL", "None", "Mô tả chi tiết nội thất, hướng gió và tiện ích"],
        ["13", "deposit_default", "NUMERIC(12, 2)", "NULL", "0", "Mức tiền cọc mặc định khi ký hợp đồng"],
        ["14", "view_direction", "VARCHAR(50)", "NULL", "None", "Hướng ban công căn hộ (Đông Nam, Tây Bắc...)"],
        ["15", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm khởi tạo bản ghi phòng"]
    ]
    create_styled_table(doc, a_hdr, a_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 5. amenities
    add_p(doc, "Bảng 5: amenities - Danh mục tiện ích, trang thiết bị nội thất bố trí trong căn hộ", bold_prefix="2.1.3.5. ")
    am_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    am_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh trang thiết bị"],
        ["2", "apartment_id", "INTEGER", "FK(apartments.id), NOT NULL", "None", "Căn hộ được trang bị tiện ích này"],
        ["3", "name", "VARCHAR(100)", "NOT NULL", "None", "Tên thiết bị (Điều hòa Daikin, Tủ lạnh Toshiba...)"],
        ["4", "brand", "VARCHAR(50)", "NULL", "None", "Thương hiệu nhà sản xuất thiết bị"],
        ["5", "serial_number", "VARCHAR(50)", "NULL", "None", "Số sê-ri định danh tài sản kỹ thuật"],
        ["6", "condition_status", "VARCHAR(30)", "NOT NULL", "'GOOD'", "Tình trạng sử dụng: GOOD (Tốt), REPAIRING (Đang sửa), BROKEN (Hỏng)"]
    ]
    create_styled_table(doc, am_hdr, am_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 6. tenants
    add_p(doc, "Bảng 6: tenants - Hồ sơ thông tin pháp lý của khách thuê đại diện hợp đồng", bold_prefix="2.1.3.6. ")
    t_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    t_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của khách thuê"],
        ["2", "full_name", "VARCHAR(100)", "NOT NULL", "None", "Họ và tên đầy đủ của khách thuê"],
        ["3", "citizen_id", "VARCHAR(20)", "UNIQUE, NOT NULL", "None", "Số Căn cước công dân / Hộ chiếu pháp lý"],
        ["4", "phone", "VARCHAR(20)", "NOT NULL", "None", "Số điện thoại di động chính thức"],
        ["5", "email", "VARCHAR(100)", "NULL", "None", "Hòm thư điện tử cá nhân nhận hợp đồng & hóa đơn"],
        ["6", "hometown", "VARCHAR(100)", "NULL", "None", "Quê quán / Địa chỉ thường trú theo CCCD"],
        ["7", "is_bad_debt", "BOOLEAN", "NOT NULL", "FALSE", "Cờ đánh dấu nợ xấu / vi phạm quy chế (TRUE/FALSE)"],
        ["8", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm tạo hồ sơ khách thuê"],
        ["9", "user_id", "INTEGER", "FK(users.id), NULL", "None", "Liên kết tài khoản đăng nhập Cổng Cư dân (nếu có)"]
    ]
    create_styled_table(doc, t_hdr, t_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 7. roommates
    add_p(doc, "Bảng 7: roommates - Danh sách người cùng lưu trú trong căn hộ theo hợp đồng", bold_prefix="2.1.3.7. ")
    rm_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    rm_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh người ở cùng"],
        ["2", "tenant_id", "INTEGER", "FK(tenants.id), NOT NULL", "None", "Khách thuê chính đại diện bảo lãnh"],
        ["3", "apartment_id", "INTEGER", "FK(apartments.id), NOT NULL", "None", "Căn hộ đang lưu trú cùng"],
        ["4", "full_name", "VARCHAR(100)", "NOT NULL", "None", "Họ tên người ở cùng"],
        ["5", "citizen_id", "VARCHAR(20)", "NOT NULL", "None", "Số CCCD người ở cùng phục vụ tạm trú"],
        ["6", "phone", "VARCHAR(20)", "NULL", "None", "Số điện thoại liên lạc"],
        ["7", "relationship", "VARCHAR(50)", "NULL", "None", "Mối quan hệ với khách chính (Vợ/Chồng, Bạn, Con...)"]
    ]
    create_styled_table(doc, rm_hdr, rm_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 8. emergency_contacts
    add_p(doc, "Bảng 8: emergency_contacts - Người liên hệ khẩn cấp trong trường hợp sự cố phát sinh", bold_prefix="2.1.3.8. ")
    ec_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    ec_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh liên hệ khẩn cấp"],
        ["2", "tenant_id", "INTEGER", "FK(tenants.id), NOT NULL", "None", "Khách thuê liên quan"],
        ["3", "full_name", "VARCHAR(100)", "NOT NULL", "None", "Họ tên người thân liên hệ khẩn cấp"],
        ["4", "phone", "VARCHAR(20)", "NOT NULL", "None", "Số điện thoại khẩn cấp 24/7"],
        ["5", "relationship", "VARCHAR(50)", "NOT NULL", "None", "Mối quan hệ thân nhân (Bố, Mẹ, Anh/Chị ruột)"]
    ]
    create_styled_table(doc, ec_hdr, ec_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 9. contracts
    add_p(doc, "Bảng 9: contracts - Hợp đồng thuê căn hộ chính thức giữa Ban quản lý và Khách thuê", bold_prefix="2.1.3.9. ")
    c_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    c_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của hợp đồng"],
        ["2", "contract_code", "VARCHAR(50)", "UNIQUE, NOT NULL", "None", "Mã số hợp đồng pháp lý (VD: HD-2026-001)"],
        ["3", "apartment_id", "INTEGER", "FK(apartments.id), NOT NULL", "None", "Căn hộ đối tượng cho thuê"],
        ["4", "tenant_id", "INTEGER", "FK(tenants.id), NOT NULL", "None", "Khách thuê đứng tên ký kết"],
        ["5", "start_date", "DATE", "NOT NULL", "None", "Ngày bắt đầu có hiệu lực hợp đồng"],
        ["6", "end_date", "DATE", "NOT NULL", "None", "Ngày hợp đồng kết thúc thời hạn"],
        ["7", "rental_price", "NUMERIC(12, 2)", "NOT NULL", "None", "Giá thuê thỏa thuận cố định hàng tháng (VNĐ)"],
        ["8", "deposit_amount", "NUMERIC(12, 2)", "NOT NULL", "None", "Số tiền cọc thỏa thuận ràng buộc (VNĐ)"],
        ["9", "status", "VARCHAR(20)", "NOT NULL", "'DRAFT'", "Trạng thái: DRAFT, PENDING_APPROVAL, ACTIVE, EXPIRED, TERMINATED"],
        ["10", "rejection_reason", "VARCHAR(500)", "NULL", "None", "Lý do từ chối nếu cấp quản lý không duyệt"],
        ["11", "created_by", "INTEGER", "FK(users.id), NOT NULL", "None", "Nhân viên phụ trách lập dự thảo hợp đồng"],
        ["12", "approved_by", "INTEGER", "FK(users.id), NULL", "None", "Quản lý cấp cao thực hiện phê duyệt hợp đồng"],
        ["13", "booking_id", "INTEGER", "FK(bookings.id), NULL", "None", "Mã đơn đặt phòng gốc chuyển đổi sang (nếu có)"],
        ["14", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm tạo lập bản ghi hợp đồng"]
    ]
    create_styled_table(doc, c_hdr, c_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 10. deposits
    add_p(doc, "Bảng 10: deposits - Quản lý thu, giữ và quyết toán hoàn trả tiền cọc hợp đồng", bold_prefix="2.1.3.10. ")
    dp_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    dp_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh khoản tiền cọc"],
        ["2", "contract_id", "INTEGER", "FK(contracts.id), NOT NULL", "None", "Hợp đồng thuê căn hộ tương ứng"],
        ["3", "amount", "NUMERIC(12, 2)", "NOT NULL", "None", "Số tiền cọc thực tế khách phải nộp (VNĐ)"],
        ["4", "paid_date", "DATE", "NULL", "None", "Ngày khách hàng nộp tiền cọc đủ"],
        ["5", "status", "VARCHAR(20)", "NOT NULL", "'PENDING'", "Trạng thái: PENDING (Chờ nộp), HELD (Đang giữ), REFUNDED (Hoàn trả), DEDUCTED (Khấu trừ)"],
        ["6", "refund_amount", "NUMERIC(12, 2)", "NOT NULL", "0", "Số tiền cọc thực tế hoàn trả lại cho khách khi thanh lý"],
        ["7", "deduction_amount", "NUMERIC(12, 2)", "NOT NULL", "0", "Số tiền cọc bị trừ để đền bù hư hỏng / trừ nợ"],
        ["8", "deduction_reason", "TEXT", "NULL", "None", "Biên bản giải trình lý do khấu trừ tiền cọc"],
        ["9", "handled_by", "INTEGER", "FK(users.id), NULL", "None", "Kế toán phụ trách quyết toán tiền cọc"],
        ["10", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm sinh bản ghi cọc"]
    ]
    create_styled_table(doc, dp_hdr, dp_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 11. receivables
    add_p(doc, "Bảng 11: receivables - Quản lý các khoản phải thu định kỳ hàng tháng (Hóa đơn)", bold_prefix="2.1.3.11. ")
    rc_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    rc_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh duy nhất của hóa đơn / khoản thu"],
        ["2", "contract_id", "INTEGER", "FK(contracts.id), NOT NULL", "None", "Hợp đồng phát sinh khoản thu"],
        ["3", "apartment_id", "INTEGER", "FK(apartments.id), NOT NULL", "None", "Căn hộ sử dụng dịch vụ"],
        ["4", "billing_month", "INTEGER", "NOT NULL", "None", "Kỳ tháng thu phí (1 - 12)"],
        ["5", "billing_year", "INTEGER", "NOT NULL", "None", "Kỳ năm thu phí (VD: 2026)"],
        ["6", "room_amount", "NUMERIC(12, 2)", "NOT NULL", "None", "Tiền phòng theo giá thuê hợp đồng (VNĐ)"],
        ["7", "service_amount", "NUMERIC(12, 2)", "NOT NULL", "0", "Tổng phí dịch vụ: điện, nước, internet, rác..."],
        ["8", "total_amount", "NUMERIC(12, 2)", "NOT NULL", "None", "Tổng số tiền cần thanh toán (room + service)"],
        ["9", "paid_amount", "NUMERIC(12, 2)", "NOT NULL", "0", "Số tiền khách đã thanh toán lũy kế trong kỳ"],
        ["10", "status", "VARCHAR(20)", "NOT NULL", "'UNPAID'", "Trạng thái: UNPAID, PARTIALLY_PAID, PAID, OVERDUE"],
        ["11", "due_date", "DATE", "NOT NULL", "None", "Hạn chót thanh toán trước khi bị phạt nợ quá hạn"],
        ["12", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm sinh khoản thu tự động"]
    ]
    create_styled_table(doc, rc_hdr, rc_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 12. payments
    add_p(doc, "Bảng 12: payments - Lịch sử các giao dịch thanh toán tiền phòng và dịch vụ", bold_prefix="2.1.3.12. ")
    pm_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    pm_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh phiếu thanh toán"],
        ["2", "receivable_id", "INTEGER", "FK(receivables.id), NOT NULL", "None", "Khoản thu / Hóa đơn được thanh toán"],
        ["3", "amount", "NUMERIC(12, 2)", "NOT NULL", "None", "Số tiền thanh toán thực tế trong giao dịch (VNĐ)"],
        ["4", "payment_method", "VARCHAR(30)", "NOT NULL", "None", "Hình thức: CASH (Tiền mặt), BANK_TRANSFER (VietQR Napas)"],
        ["5", "transaction_code", "VARCHAR(50)", "NULL", "None", "Mã giao dịch ngân hàng / Mã phiếu thu điện tử"],
        ["6", "payment_date", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm khách nộp tiền"],
        ["7", "note", "VARCHAR(255)", "NULL", "None", "Ghi chú thanh toán"],
        ["8", "handled_by", "INTEGER", "FK(users.id), NOT NULL", "None", "Kế toán / Thu ngân tiếp nhận và xác nhận giao dịch"]
    ]
    create_styled_table(doc, pm_hdr, pm_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 13. debt_ledger
    add_p(doc, "Bảng 13: debt_ledger - Sổ cái theo dõi và tổng hợp số dư công nợ cư dân", bold_prefix="2.1.3.13. ")
    dl_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    dl_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh sổ nợ"],
        ["2", "tenant_id", "INTEGER", "FK(tenants.id), UNIQUE, NOT NULL", "None", "Khách thuê đứng tên sổ nợ"],
        ["3", "total_receivable", "NUMERIC(14, 2)", "NOT NULL", "0", "Tổng số tiền phải thu lũy kế từ trước đến nay (VNĐ)"],
        ["4", "total_paid", "NUMERIC(14, 2)", "NOT NULL", "0", "Tổng số tiền khách đã thanh toán lũy kế (VNĐ)"],
        ["5", "current_debt", "NUMERIC(14, 2)", "NOT NULL", "0", "Dư nợ hiện tại còn phải trả (total_receivable - total_paid)"],
        ["6", "last_updated", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm hệ thống cập nhật số dư công nợ gần nhất"]
    ]
    create_styled_table(doc, dl_hdr, dl_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 14. maintenance_requests
    add_p(doc, "Bảng 14: maintenance_requests - Tiếp nhận và theo dõi xử lý yêu cầu bảo trì sự cố", bold_prefix="2.1.3.14. ")
    mr_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    mr_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã phiếu yêu cầu bảo trì sự cố"],
        ["2", "apartment_id", "INTEGER", "FK(apartments.id), NOT NULL", "None", "Căn hộ phát sinh sự cố hư hỏng"],
        ["3", "tenant_id", "INTEGER", "FK(tenants.id), NULL", "None", "Khách thuê gửi yêu cầu báo hỏng"],
        ["4", "reporter_name", "VARCHAR(100)", "NOT NULL", "None", "Họ tên người trực tiếp báo sự cố"],
        ["5", "phone", "VARCHAR(20)", "NOT NULL", "None", "Số điện thoại người báo để thợ liên hệ"],
        ["6", "issue_description", "TEXT", "NOT NULL", "None", "Mô tả chi tiết hiện tượng hư hỏng sự cố"],
        ["7", "priority", "VARCHAR(20)", "NOT NULL", "'MEDIUM'", "Mức độ ưu tiên: LOW, MEDIUM, HIGH, URGENT (Khẩn cấp)"],
        ["8", "status", "VARCHAR(20)", "NOT NULL", "'PENDING'", "Trạng thái: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED"],
        ["9", "repair_cost", "NUMERIC(12, 2)", "NOT NULL", "0", "Chi phí sửa chữa, thay thế vật tư nghiệm thu (VNĐ)"],
        ["10", "assigned_staff_id", "INTEGER", "FK(users.id), NULL", "None", "Kỹ thuật viên phụ trách sửa chữa hiện trường"],
        ["11", "image_url", "VARCHAR(255)", "NULL", "None", "Đường dẫn ảnh chụp hiện trường hư hỏng của cư dân"],
        ["12", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm cư dân gửi yêu cầu sửa chữa"],
        ["13", "resolved_at", "DATETIME", "NULL", "None", "Thời điểm hoàn thành nghiệm thu đóng phiếu"]
    ]
    create_styled_table(doc, mr_hdr, mr_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 15. system_alerts
    add_p(doc, "Bảng 15: system_alerts - Cảnh báo tự động nợ/hợp đồng và dự thảo tin nhắn AI", bold_prefix="2.1.3.15. ")
    sa_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    sa_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh cảnh báo hệ thống"],
        ["2", "alert_type", "VARCHAR(30)", "NOT NULL", "None", "Loại cảnh báo: OVERDUE_DEBT (Nợ quá hạn), CONTRACT_EXPIRING (Hết hạn HĐ)"],
        ["3", "reference_id", "INTEGER", "NOT NULL", "None", "ID tham chiếu tới bảng đối tượng (receivable_id hoặc contract_id)"],
        ["4", "message", "TEXT", "NOT NULL", "None", "Nội dung dự thảo thông báo đôn đốc do GenAI soạn thảo"],
        ["5", "is_sent", "BOOLEAN", "NOT NULL", "FALSE", "Trạng thái phát thông báo: FALSE (Chờ duyệt), TRUE (Đã gửi Zalo/SMS)"],
        ["6", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm Rule Engine quét sinh cảnh báo"]
    ]
    create_styled_table(doc, sa_hdr, sa_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 16. document_chunks
    add_p(doc, "Bảng 16: document_chunks - Phân mảnh tài liệu nội quy và vector nhúng RAG Chatbot", bold_prefix="2.1.3.16. ")
    dc_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    dc_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh đoạn tài liệu"],
        ["2", "document_name", "VARCHAR(100)", "NOT NULL", "None", "Tên tài liệu văn bản gốc (VD: Noi_quy_chung_cu_2026.pdf)"],
        ["3", "chunk_index", "INTEGER", "NOT NULL", "None", "Số thứ tự phân mảnh trong tài liệu gốc"],
        ["4", "content", "TEXT", "NOT NULL", "None", "Nội dung văn bản phân đoạn trích xuất nguyên gốc"],
        ["5", "embedding_vector", "JSON / VECTOR", "NOT NULL", "None", "Vector 768 chiều nhúng ngữ nghĩa (Google Gemini / Sentence-Transformers)"],
        ["6", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm nạp và số hóa tài liệu vào hệ thống RAG"]
    ]
    create_styled_table(doc, dc_hdr, dc_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 17. bookings
    add_p(doc, "Bảng 17: bookings - Yêu cầu giữ chỗ và đặt phòng căn hộ trực tuyến từ khách hàng", bold_prefix="2.1.3.17. ")
    bk_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    bk_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh yêu cầu đặt phòng"],
        ["2", "booking_code", "VARCHAR(50)", "UNIQUE, NOT NULL", "None", "Mã tra cứu đặt phòng (VD: BK-2026-889)"],
        ["3", "customer_name", "VARCHAR(100)", "NOT NULL", "None", "Họ tên khách hàng đăng ký giữ chỗ"],
        ["4", "customer_phone", "VARCHAR(20)", "NOT NULL", "None", "Số điện thoại khách hàng"],
        ["5", "customer_email", "VARCHAR(100)", "NULL", "None", "Email khách hàng nhận xác nhận đặt phòng"],
        ["6", "apartment_id", "INTEGER", "FK(apartments.id), NOT NULL", "None", "Căn hộ khách đăng ký giữ chỗ"],
        ["7", "check_in_date", "DATE", "NOT NULL", "None", "Ngày dự kiến chuyển vào sinh sống"],
        ["8", "deposit_amount", "NUMERIC(12, 2)", "NOT NULL", "None", "Số tiền cọc giữ chỗ dự kiến nộp (VNĐ)"],
        ["9", "status", "VARCHAR(20)", "NOT NULL", "'PENDING'", "Trạng thái: PENDING (Chờ duyệt), CONFIRMED (Đã duyệt), CANCELLED (Hủy)"],
        ["10", "notes", "TEXT", "NULL", "None", "Yêu cầu đặc biệt của khách hàng khi đặt phòng"],
        ["11", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời điểm khách gửi yêu cầu đặt phòng"]
    ]
    create_styled_table(doc, bk_hdr, bk_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")

    # 18. audit_logs
    add_p(doc, "Bảng 18: audit_logs - Nhật ký kiểm toán bảo mật và truy vết thao tác hệ thống", bold_prefix="2.1.3.18. ")
    al_hdr = ["STT", "Tên Cột (Field)", "Kiểu Dữ liệu", "Ràng buộc (Constraint)", "Giá trị Mặc định", "Diễn giải Ý nghĩa Nghiệp vụ"]
    al_data = [
        ["1", "id", "INTEGER", "PK, NOT NULL, AUTO_INCREMENT", "None", "Mã định danh bản ghi kiểm toán"],
        ["2", "user_id", "INTEGER", "FK(users.id), NULL", "None", "Người dùng thực hiện thao tác (NULL nếu hệ thống tự động)"],
        ["3", "action", "VARCHAR(100)", "NOT NULL", "None", "Hành động thực hiện: CREATE, UPDATE, DELETE, APPROVE, LOGIN"],
        ["4", "entity_type", "VARCHAR(100)", "NOT NULL", "None", "Loại thực thể bị tác động (CONTRACT, PAYMENT, APARTMENT...)"],
        ["5", "entity_id", "INTEGER", "NULL", "None", "ID của bản ghi thực thể bị tác động"],
        ["6", "details", "TEXT", "NULL", "None", "Chi tiết dữ liệu thay đổi trước và sau dưới dạng chuỗi JSON"],
        ["7", "created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Thời khắc chính xác ghi nhận thao tác kiểm toán"]
    ]
    create_styled_table(doc, al_hdr, al_data, col_widths=[0.4, 1.2, 1.1, 1.3, 0.9, 1.8], header_bg="2C3E50")


    # ==================== PHẦN 2.2: RÀNG BUỘC TOÀN VẸN ====================
    add_h2(doc, "2.2. Các ràng buộc toàn vẹn trong CSDL")
    add_p(doc, 
        "Hệ thống thiết lập cơ chế kiểm soát tính đúng đắn và an toàn dữ liệu nhiều lớp (Multi-layer Integrity Control), "
        "kết hợp chặt chẽ giữa các ràng buộc mức cơ sở dữ liệu quan hệ (Database Constraints) và các quy tắc kiểm tra "
        "nghiệp vụ tự động tại tầng dịch vụ ứng dụng (Business Service Rules & Triggers):"
    )

    add_h3(doc, "2.2.1. Ràng buộc toàn vẹn thực thể (Entity Integrity)")
    add_p(doc, 
        "Tất cả 18 bảng trong cơ sở dữ liệu đều có thuộc tính khóa chính (Primary Key - PK) đơn mang tên `id`, "
        "kiểu số nguyên INTEGER kết hợp cơ chế tự động tăng (AUTO_INCREMENT / SERIAL). "
        "Giá trị khóa chính đảm bảo tính duy nhất tuyệt đối trên toàn bảng, không bao giờ mang giá trị NULL, "
        "đóng vai trò là mã định danh vật lý bất biến phục vụ lập chỉ mục (B-Tree Indexing) và liên kết quan hệ."
    )

    add_h3(doc, "2.2.2. Ràng buộc toàn vẹn tham chiếu (Referential Integrity)")
    add_p(doc, 
        "Tính toàn vẹn tham chiếu bảo đảm không xuất hiện bản ghi mồ côi (Orphan Records) khi có các thao tác thêm, xóa, sửa. "
        "Hệ thống quy định chính sách khóa ngoại (Foreign Key Constraints) cụ thể như sau:"
    )
    add_bullet(doc, "Xóa một Tòa nhà (buildings) sẽ bị chặn lại (RESTRICT) nếu trong tòa nhà vẫn còn tồn tại Căn hộ (apartments). "
                    "Chỉ được phép xóa tòa nhà khi toàn bộ căn hộ trực thuộc đã được di dời hoặc xóa sạch.",
               bold_prefix="• Quan hệ buildings -> apartments: ")
    add_bullet(doc, "Căn hộ không thể bị xóa vật lý nếu đang có Hợp đồng (contracts), Yêu cầu bảo trì (maintenance_requests) "
                    "hoặc Khoản thu (receivables) liên kết. Hệ thống áp dụng quy tắc chặn xóa (ON DELETE RESTRICT) "
                    "để bảo toàn toàn vẹn lịch sử lưu vết.",
               bold_prefix="• Quan hệ apartments -> contracts / maintenance_requests: ")
    add_bullet(doc, "Khi khách thuê (tenants) xóa hồ sơ, các bản ghi người ở cùng (roommates) và liên hệ khẩn cấp (emergency_contacts) "
                    "sẽ tự động bị xóa theo (ON DELETE CASCADE) do đây là các thực thể yếu phụ thuộc hoàn toàn vào khách chính.",
               bold_prefix="• Quan hệ tenants -> roommates / emergency_contacts: ")
    add_bullet(doc, "Một Hóa đơn (receivables) không thể bị xóa khi đã phát sinh các bản ghi phiếu thu thanh toán trong payments. "
                    "Ngăn chặn triệt để hành vi can thiệp hoặc thất thoát sổ sách kế toán.",
               bold_prefix="• Quan hệ receivables -> payments: ")
    add_bullet(doc, "Khi xóa tài khoản người dùng (users), các trường tham chiếu người tạo, người duyệt (created_by, approved_by) "
                    "trong contracts hoặc payments được thiết lập về giá trị NULL (ON DELETE SET NULL) nhằm lưu vết khách quan.",
               bold_prefix="• Quan hệ users -> contracts / payments: ")

    add_h3(doc, "2.2.3. Ràng buộc toàn vẹn miền giá trị (Domain Integrity & CHECK Constraints)")
    add_p(doc, "Hệ thống áp dụng các ràng buộc CHECK trực tiếp trên các cột số liệu và trạng thái:")
    add_bullet(doc, "Giá thuê niêm yết (price) và tiền cọc mặc định (deposit_default) trong bảng apartments phải luôn lớn hơn 0; "
                    "Diện tích sử dụng (area_sqm) phải lớn hơn 0; Số người tối đa (max_occupants) >= 1.",
               bold_prefix="• Ràng buộc Giá tiền & Thông số căn hộ: ")
    add_bullet(doc, "Ngày kết thúc hợp đồng (end_date) phải luôn sau Ngày bắt đầu (start_date), tức (end_date > start_date). "
                    "Giá thuê hợp đồng (rental_price) > 0 và Tiền cọc (deposit_amount) >= 0.",
               bold_prefix="• Ràng buộc Thời hạn Hợp đồng: ")
    add_bullet(doc, "Số tiền đã thanh toán (paid_amount) phải thỏa mãn: 0 <= paid_amount <= total_amount. "
                    "Không cho phép ghi nhận thanh toán vượt quá tổng giá trị phải thu của hóa đơn.",
               bold_prefix="• Ràng buộc Thanh toán Khoản thu: ")
    add_bullet(doc, "Chỉ chấp nhận các giá trị ENUM hợp lệ được chuẩn hóa: "
                    "Trạng thái phòng ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE'); "
                    "Trạng thái hợp đồng ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED'); "
                    "Trạng thái hóa đơn ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'); "
                    "Mức ưu tiên sự cố ('LOW', 'MEDIUM', 'HIGH', 'URGENT'); "
                    "Phương thức thanh toán ('CASH', 'BANK_TRANSFER').",
               bold_prefix="• Ràng buộc Danh mục Trạng thái (ENUM Values): ")

    add_h3(doc, "2.2.4. Ràng buộc toàn vẹn duy nhất (Unique Constraints)")
    add_bullet(doc, "Số Căn cước công dân (citizen_id) của khách thuê trong bảng tenants phải là duy nhất trên toàn hệ thống.",
               bold_prefix="• Căn cước công dân: ")
    add_bullet(doc, "Tên đăng nhập (username) và Địa chỉ email (email) trong bảng users là duy nhất, không trùng lặp.",
               bold_prefix="• Tài khoản người dùng: ")
    add_bullet(doc, "Mã số hợp đồng (contract_code) và Mã tra cứu đặt phòng (booking_code) được sinh theo quy tắc và là duy nhất.",
               bold_prefix="• Mã giao dịch nghiệp vụ: ")
    add_bullet(doc, "Tổ hợp (building_id, room_number) trong bảng apartments là duy nhất; không thể có hai phòng trùng số trong cùng một tòa nhà.",
               bold_prefix="• Số phòng theo Tòa nhà: ")
    add_bullet(doc, "Tổ hợp (contract_id, billing_month, billing_year) trong bảng receivables là duy nhất; ngăn ngừa sinh trùng hóa đơn trong cùng một kỳ thu.",
               bold_prefix="• Kỳ hóa đơn thanh toán: ")

    add_h3(doc, "2.2.5. Ràng buộc toàn vẹn Nghiệp vụ Phức hợp & Triggers (Complex Business Logic Integrity)")
    add_p(doc, 
        "Hệ thống triển khai 6 quy tắc nghiệp vụ tự động hóa then chốt tại tầng Service và Database Triggers, "
        "bảo đảm hệ thống vận hành thông minh, chính xác tuyệt đối:"
    )

    add_bullet(doc, "Hệ thống kiểm tra xung đột thời gian thực: Tuyệt đối không cho phép phê duyệt hoặc kích hoạt một hợp đồng mới "
                    "nếu khoảng thời gian [start_date, end_date] bị giao thoa (overlap) với bất kỳ hợp đồng nào đang ở trạng thái "
                    "ACTIVE trên cùng căn hộ đó.",
               bold_prefix="1. RB-01 (Chống Xung đột Lịch thuê - Temporal Non-Overlap): ")

    add_bullet(doc, "Khi một yêu cầu đặt phòng (Booking) được tạo -> Trạng thái phòng chuyển sang RESERVED. "
                    "Khi Hợp đồng được phê duyệt và thu cọc -> Trạng thái phòng tự động chuyển sang OCCUPIED. "
                    "Khi Hợp đồng kết thúc (EXPIRED hoặc TERMINATED) -> Trạng thái phòng tự động trả về AVAILABLE (hoặc chuyển sang "
                    "MAINTENANCE để nhân viên kiểm tra vệ sinh trước khi cho thuê tiếp).",
               bold_prefix="2. RB-02 (Đồng bộ Chu trình Trạng thái Căn hộ): ")

    add_bullet(doc, "Khi quyết toán hợp đồng kết thúc: Tổng số tiền hoàn trả cho khách (refund_amount) cộng với số tiền bị khấu trừ "
                    "đền bù (deduction_amount) phải đúng bằng số tiền cọc ban đầu được giữ (amount) trong bảng deposits. "
                    "Mọi khoản khấu trừ đều bắt buộc phải ghi rõ lý do và đính kèm biên bản nghiệm thu.",
               bold_prefix="3. RB-03 (Bảo toàn Tài chính Quyết toán Cọc): ")

    add_bullet(doc, "Khi phát sinh một giao dịch trong payments, hệ thống tự động: (1) Cộng dồn vào paid_amount của hóa đơn tương ứng; "
                    "(2) Cập nhật trạng thái hóa đơn sang PAID nếu đã trả đủ hoặc PARTIALLY_PAID nếu còn thiếu; "
                    "(3) Cập nhật số dư trong debt_ledger: total_paid += amount và current_debt = total_receivable - total_paid.",
               bold_prefix="4. RB-04 (Cân đối Sổ cái Công nợ Cư dân Tự động): ")

    add_bullet(doc, "Khi phát sinh một sự cố kỹ thuật có mức ưu tiên Khẩn cấp (URGENT - cháy nổ, vỡ đường ống nước chính), "
                    "hệ thống cho phép nhân viên vận hành kích hoạt cờ tạm khóa căn hộ sang MAINTENANCE, ngăn chặn lập tức mọi hoạt động "
                    "đặt phòng hoặc giao kết hợp đồng mới cho đến khi sự cố được kỹ thuật nghiệm thu hoàn thành ĐẠT.",
               bold_prefix="5. RB-05 (Tạm khóa Bảo trì Sự cố Khẩn cấp): ")

    add_bullet(doc, "Tài khoản cư dân (vai trò TENANT) chỉ được phép truy xuất các bản ghi hợp đồng, hóa đơn, thông báo và sự cố "
                    "liên kết trực tiếp với mã khách thuê của chính mình (tenant_id giải mã từ JWT Token). "
                    "Mọi hành vi gửi request can thiệp ID của cư dân khác đều bị hệ thống từ chối lập tức với mã lỗi HTTP 403 Forbidden.",
               bold_prefix="6. RB-06 (Cô lập Dữ liệu Cư dân & Ngăn chặn IDOR): ")

    # Save document
    out_path = "d:/Detai12_QLCH/Tailieu/06_GenAI_SoftwareDevelopment_screenflow_db.docx"
    doc.save(out_path)
    print(f"Document 06 generated successfully at: {out_path}")
    print(f"Total paragraphs: {len(doc.paragraphs)}, Total tables: {len(doc.tables)}, Total inline shapes: {len(doc.inline_shapes)}")

if __name__ == "__main__":
    build_document_06()
