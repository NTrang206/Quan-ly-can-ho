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

def build_document_07():
    doc = docx.Document()
    set_page_setup(doc)

    # ==================== COVER / TITLE PAGE ====================
    # Empty space paragraphs matching template
    for _ in range(3):
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(0)

    p_cover_title = doc.add_paragraph()
    p_cover_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cover_title.paragraph_format.space_after = Pt(18)
    p_cover_title.paragraph_format.line_spacing = 1.15
    r_cov1 = p_cover_title.add_run("HỆ THỐNG QUẢN LÝ THUÊ CĂN HỘ\nCÓ TÍCH HỢP AI - NHÓM 12")
    format_run(r_cov1, size_pt=28, bold=True, color_rgb=COLOR_PRIMARY)

    p_cover_sub = doc.add_paragraph()
    p_cover_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cover_sub.paragraph_format.space_after = Pt(36)
    r_cov2 = p_cover_sub.add_run("TÀI LIỆU HƯỚNG DẪN SỬ DỤNG – V1.0")
    format_run(r_cov2, size_pt=20, bold=False, color_rgb=COLOR_TEXT)

    # Info box on cover
    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_info.paragraph_format.space_after = Pt(4)
    r_info1 = p_info.add_run("NHÓM SINH VIÊN THỰC HIỆN - KTPM K23C\n")
    format_run(r_info1, size_pt=12, bold=True, color_rgb=COLOR_SECONDARY)
    r_info2 = p_info.add_run("1. Nguyễn Thị Trang (Trưởng nhóm)\n2. Lê Quang Khánh\n\n")
    format_run(r_info2, size_pt=12, bold=False, color_rgb=COLOR_TEXT)
    r_info3 = p_info.add_run("Thời gian thực hiện: Từ 27/07/2026 đến 27/09/2026 (9 tuần)\nHệ thống áp dụng: Sunshine Homes / Dwell Living Platform")
    format_run(r_info3, size_pt=11, italic=True, color_rgb=COLOR_MUTED)

    doc.add_page_break()

    # ==================== TABLE OF CONTENTS ====================
    p_toc_title = doc.add_paragraph()
    p_toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc_title.paragraph_format.space_before = Pt(12)
    p_toc_title.paragraph_format.space_after = Pt(14)
    r_toc = p_toc_title.add_run("NỘI DUNG TÀI LIỆU")
    format_run(r_toc, size_pt=16, bold=True, color_rgb=COLOR_PRIMARY)

    toc_headers = ["STT", "Hạng mục Nội dung", "Mục tiêu & Phạm vi Mô tả", "Trang / Mục"]
    toc_data = [
        ["1", "GIỚI THIỆU ỨNG DỤNG", "Mục đích, phạm vi và 4 tính năng AI đột phá của hệ thống", "Mục 1"],
        ["2", "CẤU HÌNH PHẦN CỨNG - PHẦN MỀM", "Yêu cầu kỹ thuật máy chủ, máy trạm, thiết bị di động và môi trường", "Mục 2"],
        ["3", "CÁC CHỨC NĂNG CHÍNH", "Hướng dẫn sử dụng chi tiết phân theo 4 Tác nhân (Actors) SRS", "Mục 3"],
        ["3.1", "- Chức năng của Quản lý / Chủ tòa nhà (Admin)", "Dashboard KPI, Quản lý Tòa nhà - Phòng, Duyệt HĐ, Phân quyền RBAC", "Mục 3.1"],
        ["3.2", "- Chức năng của Nhân viên Vận hành / Lễ tân (Staff)", "Xử lý Booking, Quản lý Khách thuê - Ở cùng, Lập HĐ & AI Tóm tắt, Bảo trì", "Mục 3.2"],
        ["3.3", "- Chức năng của Bộ phận Kế toán (Accountant)", "Thu cọc, Sinh khoản thu định kỳ, VietQR Napas, Sổ nợ, AI Soạn tin nhắc nợ", "Mục 3.3"],
        ["3.4", "- Chức năng của Khách hàng & Cư dân (Customer/Tenant)", "Khám phá phòng, AI Matcher, Đặt cọc trực tuyến, Cổng cư dân, Chatbot RAG", "Mục 3.4"],
        ["4", "PHỤ LỤC & XỬ LÝ SỰ CỐ THƯỜNG GẶP (FAQS)", "Bảng mã lỗi, giải đáp thắc mắc AI và kênh hỗ trợ kỹ thuật", "Mục 4"]
    ]
    create_styled_table(doc, toc_headers, toc_data, col_widths=[0.6, 2.8, 2.2, 0.7], header_bg="1F497D")

    # ==================== PHẦN 1: GIỚI THIỆU ỨNG DỤNG ====================
    add_h1(doc, "GIỚI THIỆU ỨNG DỤNG")

    add_h2(doc, "1.1. Mục đích của tài liệu")
    add_p(doc, 
        "Tài liệu Hướng dẫn Sử dụng (User Guide) này được biên soạn nhằm cung cấp cẩm nang vận hành chi tiết, "
        "trực quan và toàn diện cho tất cả các đối tượng người dùng tham gia vào Hệ thống Quản lý thuê Căn hộ có tích hợp AI "
        "(Sunshine Homes / Dwell Living). Tài liệu hướng dẫn từng bước (step-by-step) các thao tác nghiệp vụ từ cơ bản "
        "đến chuyên sâu, làm rõ quy trình phối hợp giữa các bộ phận (Quản lý - Vận hành - Kế toán - Cư dân) và khai thác "
        "tối đa hiệu quả của các tính năng Trí tuệ Nhân tạo tạo sinh (GenAI) tích hợp trong hệ thống."
    )

    add_h2(doc, "1.2. Phạm vi và Đối tượng áp dụng")
    add_p(doc, "Tài liệu áp dụng cho toàn bộ các cá nhân và bộ phận sử dụng ứng dụng web Sunshine Homes, bao gồm:")
    add_bullet(doc, "Nắm bắt bức tranh kinh doanh toàn diện qua Dashboard KPI, phê duyệt các giao dịch trọng yếu (Hợp đồng, "
                    "thanh lý cọc), thiết lập danh mục tòa nhà - căn hộ và quản trị phân quyền người dùng.",
               bold_prefix="• Ban Giám đốc / Chủ tòa nhà / Quản trị viên (Admin): ")
    add_bullet(doc, "Thực hiện các tác nghiệp vận hành thường nhật: Tiếp nhận và xử lý đặt phòng (Booking), lập hợp đồng thuê, "
                    "quản lý hồ sơ cư dân & người ở cùng, tiếp nhận và điều phối kỹ thuật xử lý sự cố bảo trì.",
               bold_prefix="• Nhân viên Vận hành / Lễ tân (Staff): ")
    add_bullet(doc, "Quản trị dòng tiền: Ghi nhận thu cọc, sinh khoản thu tiền phòng và dịch vụ định kỳ hàng tháng, "
                    "đối soát thanh toán chuyển khoản VietQR tự động, quản lý sổ nợ cư dân và kiểm duyệt thông báo nhắc nợ do AI soạn thảo.",
               bold_prefix="• Bộ phận Kế toán / Thu ngân (Accountant): ")
    add_bullet(doc, "Người có nhu cầu tìm thuê phòng (tra cứu, tương tác AI tư vấn, đặt phòng trực tuyến) và Cư dân đang thuê "
                    "(đăng nhập Cổng cư dân để xem hợp đồng, quét VietQR thanh toán tiền phòng, báo sự cố kèm ảnh và hỏi đáp Chatbot RAG).",
               bold_prefix="• Khách hàng & Cư dân thuê phòng (Customer / Tenant): ")

    add_h2(doc, "1.3. Tổng quan về Giải pháp Sunshine Homes / Dwell Living")
    add_p(doc, 
        "Hệ thống Quản lý thuê Căn hộ Sunshine Homes là nền tảng quản lý bất động sản cho thuê thế hệ mới, "
        "được xây dựng trên kiến trúc web hiện đại (Single Page Application - React kết hợp RESTful API FastAPI). "
        "Hệ thống giải quyết triệt để các tồn đọng của phương thức quản lý thủ công truyền thống: loại bỏ sai sót tính toán tiền phòng, "
        "tự động hóa phát hiện công nợ và hạn hợp đồng, số hóa 100% quy trình thanh toán qua chuẩn VietQR Napas 24/7 "
        "và mang lại kênh tương tác khép kín giữa Cư dân và Ban quản lý."
    )

    add_h2(doc, "1.4. Bốn Tính năng Đột phá về Trí tuệ Nhân tạo (GenAI Features)")
    add_p(doc, 
        "Bám sát đề tài và các yêu cầu kỹ thuật, hệ thống tích hợp sâu 4 tính năng AI mạnh mẽ hỗ trợ tự động hóa thông minh:"
    )
    add_bullet(doc, "Ứng dụng mô hình ngôn ngữ lớn (Google Gemini LLM) phân tích sở thích, khả năng tài chính và thói quen sinh hoạt "
                    "của khách hàng qua khung chat tương tác tự nhiên, từ đó truy vấn và đề xuất căn hộ trống phù hợp nhất với tỷ lệ hài lòng cao.",
               bold_prefix="1. Trợ lý AI Room Matcher (Tư vấn tìm căn hộ thông minh): ")
    add_bullet(doc, "Tự động đọc hiểu toàn văn bản hợp đồng pháp lý nhiều trang và chiết xuất súc tích thành 5 điều khoản cốt lõi: "
                    "(1) Thời hạn hợp đồng, (2) Đơn giá thuê hàng tháng, (3) Số tiền cọc cam kết, (4) Nghĩa vụ thanh toán định kỳ, "
                    "(5) Điều kiện chấm dứt hợp đồng. Giúp khách thuê và nhân viên nắm bắt nhanh trong 10 giây mà không cần đọc văn bản dài dòng.",
               bold_prefix="2. AI Contract Summarizer Studio (Tóm tắt Hợp đồng thuê): ")
    add_bullet(doc, "Tích hợp công cụ quét tự động (Rule Engine) phối hợp LLM để tự động nhận diện các hóa đơn quá hạn nộp "
                    "và hợp đồng sắp kết thúc trong 30 ngày. AI tự động sinh dự thảo thông điệp nhắc nhở với lời lẽ nhã nhặn, chuẩn mực, "
                    "nêu chính xác số tiền nợ, số ngày chậm trễ và kèm hướng dẫn chuyển khoản VietQR chuẩn.",
               bold_prefix="3. AI Smart Dunning Assistant (Đôn đốc nợ & Nhắc hạn thông minh): ")
    add_bullet(doc, "Hệ thống RAG (Retrieval-Augmented Generation) kết hợp Vector Search (Cosine Similarity) cho phép cư dân "
                    "đặt bất kỳ câu hỏi nào về nội quy chung cư (giờ giấc mở cửa, quy định nuôi thú cưng, phân loại rác, biểu phí đỗ xe...). "
                    "AI phản hồi tức thì với văn phong thân thiện và dẫn chiếu chính xác điều khoản, trang quy định gốc.",
               bold_prefix="4. Trợ lý Chatbot AI RAG (Tra cứu Nội quy Tòa nhà 24/7): ")


    # ==================== PHẦN 2: CẤU HÌNH PHẦN CỨNG - PHẦN MỀM ====================
    add_h1(doc, "CẤU HÌNH PHẦN CỨNG - PHẦN MỀM")

    add_h2(doc, "Phần cứng")
    add_p(doc, 
        "Hệ thống Sunshine Homes được phát triển trên kiến trúc Web-based đám mây, cho phép người dùng cuối truy cập mượt mà "
        "thông qua mọi thiết bị cá nhân mà không đòi hỏi nâng cấp phần cứng chuyên biệt. Dưới đây là thông số phần cứng khuyến nghị:"
    )

    hw_headers = ["Thiết bị / Thành phần", "Cấu hình Tối thiểu", "Cấu hình Khuyến nghị", "Mục đích Sử dụng"]
    hw_data = [
        ["Máy chủ Ứng dụng & CSDL (Server)", "CPU 2 Cores, RAM 4GB, SSD 40GB", "CPU 4 Cores, RAM 8GB-16GB, SSD NVMe 100GB", "Triển khai Backend FastAPI, PostgreSQL và lưu trữ Vector RAG"],
        ["Máy tính Ban Quản lý / Kế toán (PC/Laptop)", "Intel Core i3 thế hệ 8 / AMD Ryzen 3, RAM 4GB", "Intel Core i5 / Apple M-series / AMD Ryzen 5, RAM 8GB-16GB", "Vận hành Dashboard KPI, quản lý hợp đồng, xuất báo cáo và đối soát VietQR"],
        ["Thiết bị Di động Cư dân & Khách thuê", "Smartphone / Tablet màn hình từ 5.5 inch, RAM 2GB", "Smartphone màn hình OLED 6.1+ inch, RAM 4GB+, kết nối 4G/5G/Wi-Fi", "Duyệt tìm căn hộ, quét mã VietQR qua app ngân hàng, chụp ảnh báo sự cố"],
        ["Mạng Internet", "Băng thông tối thiểu 10 Mbps", "Băng thông cáp quang từ 50 Mbps trở lên", "Đảm bảo tải ảnh căn hộ sắc nét và phản hồi AI thời gian thực dưới 2 giây"]
    ]
    create_styled_table(doc, hw_headers, hw_data, col_widths=[1.5, 1.8, 1.8, 1.6], header_bg="1F497D")

    add_h2(doc, "Phần mềm")
    add_p(doc, "Yêu cầu môi trường phần mềm hỗ trợ hệ thống hoạt động ổn định và tối ưu hiệu năng:")

    sw_headers = ["Thành phần Hệ thống", "Phiên bản / Nền tảng Hỗ trợ", "Ghi chú & Vai trò Kỹ thuật"]
    sw_data = [
        ["Hệ điều hành Máy khách (Client OS)", "Windows 10/11, macOS 12+, Ubuntu 20.04+, iOS 15+, Android 10+", "Tương thích đa nền tảng nhờ giao diện Web Responsive Design"],
        ["Trình duyệt Web (Web Browsers)", "Google Chrome v110+, Microsoft Edge v110+, Safari v16+, Firefox v110+", "Khuyến nghị sử dụng Chrome hoặc Edge để tối ưu hóa trải nghiệm đồ họa"],
        ["Nền tảng Backend", "Python 3.10 trở lên, FastAPI framework, Uvicorn ASGI Server", "Xử lý nghiệp vụ logic, xác thực JWT và kết nối AI Services"],
        ["Cơ sở Dữ liệu Quan hệ (RDBMS)", "PostgreSQL 16 (Hệ thống chính thức) / SQLite 3 (Môi trường cục bộ)", "Quản trị cơ sở dữ liệu quan hệ chuẩn 3NF với 18 thực thể nghiệp vụ"],
        ["Nền tảng Frontend", "Node.js 18+, React 18, TypeScript, Tailwind CSS, Vite Build Engine", "Giao diện người dùng hiện đại, bảo mật Type-safe và phản hồi tức thì"],
        ["Dịch vụ Trí tuệ Nhân tạo (GenAI)", "Google Gemini API (gemini-3.8-flash) & Gemini Embedding API", "Cung cấp động cơ ngôn ngữ lớn cho AI Summarizer, Room Matcher, Dunning và RAG"]
    ]
    create_styled_table(doc, sw_headers, sw_data, col_widths=[1.6, 2.2, 2.9], header_bg="1F497D")


    # ==================== PHẦN 3: CÁC CHỨC NĂNG CHÍNH ====================
    add_h1(doc, "CÁC CHỨC NĂNG CHÍNH")
    p_note = doc.add_paragraph()
    r_n = p_note.add_run("< Các chức năng chính được phân rã chi tiết theo danh sách các Tác nhân (Actors) chuẩn trong tài liệu SRS >")
    format_run(r_n, size_pt=11.5, italic=True, color_rgb=COLOR_PRIMARY)

    # 3.1. Admin
    add_h2(doc, "3.1. Chức năng của Quản lý / Chủ tòa nhà (Admin)")
    add_p(doc, 
        "Tác nhân Quản lý (Admin) là người nắm giữ quyền hạn tối cao trong hệ thống, chịu trách nhiệm giám sát "
        "toàn bộ hoạt động kinh doanh tòa nhà, quản lý danh mục tài sản, kiểm soát hợp đồng và phân quyền người dùng."
    )

    add_h3(doc, "3.1.1. Đăng nhập Hệ thống & Quản lý Phiên làm việc Bảo mật RBAC (UC009)")
    add_p(doc, "Quy trình thực hiện:")
    add_bullet(doc, "Truy cập đường dẫn `/login` trên trình duyệt web.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Nhập thông tin Tên đăng nhập (username: `admin`) và Mật khẩu (password: `admin123`). Hoặc người dùng kiểm thử "
                    "có thể nhấn nhanh nút 'Admin' trong cụm Quick Role Switcher để tự động điền.", bold_prefix="Bước 2: ")
    add_bullet(doc, "Nhấn nút 'Đăng nhập vào Hệ thống'. Hệ thống gửi yêu cầu xác thực tới API Backend, kiểm tra mã băm BCrypt "
                    "và sinh mã phiên JWT có hạn sử dụng 8 giờ. Hệ thống tự động chuyển hướng người dùng đến Trang chủ Dashboard Quản trị.",
               bold_prefix="Bước 3: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Đăng Nhập Hệ Thống Sunshine Homes - KTPM K23C.png",
               "Hình 3.1: Giao diện Đăng nhập Hệ thống & Xác thực Đa vai trò RBAC (UC009)", width=Inches(6.0))

    add_h3(doc, "3.1.2. Theo dõi Báo cáo Tổng quan & Dashboard KPI Điều hành (UC010)")
    add_p(doc, "Sau khi đăng nhập thành công, màn hình Dashboard hiển thị trực quan các chỉ số tài chính và vận hành thời gian thực:")
    add_bullet(doc, "Tỷ lệ phần trăm căn hộ đang có khách cư trú (OCCUPIED) trên tổng số căn hộ hiện có. Giúp ban quản lý "
                    "đánh giá tức thì hiệu suất khai thác tài sản.", bold_prefix="• Tỷ lệ Lấp đầy Phòng (Occupancy Rate): ")
    add_bullet(doc, "Tổng số tiền phòng và phí dịch vụ thực tế đã thu được trong tháng hiện hành.", bold_prefix="• Doanh thu Thực thu (Monthly Revenue): ")
    add_bullet(doc, "Tổng số tiền các hóa đơn đã quá hạn nộp tiền mà khách thuê chưa thanh toán đủ.", bold_prefix="• Công nợ Quá hạn (Overdue Debt): ")
    add_bullet(doc, "Số lượng yêu cầu báo hỏng đang ở trạng thái Chờ xử lý hoặc Đang sửa chữa cần đốc thúc kỹ thuật.", bold_prefix="• Sự cố Cần giải quyết: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Thống kê, Báo cáo & Dashboard (UC010) - Dwell Living.png",
               "Hình 3.2: Màn hình Báo cáo Thống kê, Doanh thu & Dashboard KPI Tổng quan (UC010)", width=Inches(6.0))

    add_h3(doc, "3.1.3. Quản lý Danh mục Tòa nhà, Căn hộ & Tiện ích (UC007)")
    add_p(doc, "Quản lý thiết lập và bảo trì cơ sở vật chất:")
    add_bullet(doc, "Nhấn 'Thêm Tòa nhà' trên thanh công cụ, nhập Mã tòa nhà, Tên tòa nhà, Địa chỉ và Số tầng -> Nhấn 'Lưu lại'.", bold_prefix="• Thêm Tòa nhà Mới: ")
    add_bullet(doc, "Chọn Tòa nhà tương ứng -> Nhấn 'Thêm Căn hộ'. Điền Số phòng (VD: P.302), Tầng, Diện tích (m2), Giá thuê tháng (VNĐ), "
                    "Tiền cọc mặc định, Số phòng ngủ, Phòng tắm và Danh sách tiện ích trang bị (Điều hòa, Tủ lạnh, Sofa, Bếp điện).",
               bold_prefix="• Khởi tạo Căn hộ & Tiện ích: ")
    add_bullet(doc, "Mỗi căn hộ được hiển thị huy hiệu trạng thái màu sắc trực quan: Xanh lá (AVAILABLE - Phòng trống), Vàng (RESERVED - Đang giữ chỗ), "
                    "Xanh dương (OCCUPIED - Đang thuê) và Đỏ (MAINTENANCE - Đang sửa chữa).", bold_prefix="• Theo dõi Trạng thái Phòng: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Quản lý Tòa nhà, Căn hộ & Tiện ích (UC007) - Dwell Living.png",
               "Hình 3.3: Giao diện Quản lý Danh mục Tòa nhà, Căn hộ & Trạng thái Phòng (UC007)", width=Inches(6.0))

    add_h3(doc, "3.1.4. Phê duyệt Hợp đồng Thuê & Giám sát Tóm tắt Điều khoản AI (UC001, UC002)")
    add_p(doc, "Quy trình kiểm soát tính pháp lý và phê duyệt hợp đồng:")
    add_bullet(doc, "Truy cập mục 'Quản lý Hợp đồng' (`/admin/contracts`). Danh sách hiển thị các hợp đồng ở trạng thái 'PENDING_APPROVAL' "
                    "do nhân viên lập dự thảo gửi lên.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Nhấn 'Xem Chi tiết & AI Summarizer'. Hệ thống mở khung hiển thị chi tiết thông tin khách thuê, tiền thuê, tiền cọc "
                    "và bản tóm tắt 5 điều khoản do AI tự động trích xuất.", bold_prefix="Bước 2: ")
    add_bullet(doc, "Quản lý đối soát thông tin, nếu hợp lệ nhấn nút 'Phê duyệt Hợp đồng'. Hợp đồng chuyển sang trạng thái kích hoạt, "
                    "đồng thời hệ thống tự động đổi trạng thái căn hộ liên kết sang OCCUPIED. Nếu phát hiện sai sót, quản lý nhập lý do "
                    "và nhấn 'Từ chối' để nhân viên chỉnh sửa lại.", bold_prefix="Bước 3: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Chi tiết Hợp đồng & AI Summarizer (UC001, UC002) - Dwell Living.png",
               "Hình 3.4: Giao diện Chi tiết Hợp đồng & Trợ lý AI Summarizer Tóm tắt Điều khoản (UC001, UC002)", width=Inches(6.0))


    # 3.2. Staff
    add_h2(doc, "3.2. Chức năng của Nhân viên Vận hành / Lễ tân (Staff)")
    add_p(doc, 
        "Tác nhân Nhân viên (Staff) đóng vai trò then chốt trong chu trình tương tác trực tiếp với khách thuê: "
        "tiếp nhận đặt phòng, lập hồ sơ khách, soạn hợp đồng và điều phối xử lý kỹ thuật."
    )

    add_h3(doc, "3.2.1. Tiếp nhận & Xử lý Yêu cầu Đặt phòng Trực tuyến (UC011)")
    add_p(doc, "Khi khách hàng gửi yêu cầu giữ chỗ qua cổng trực tuyến:")
    add_bullet(doc, "Nhân viên truy cập mục 'Quản lý Đặt phòng' (`/admin/bookings`). Hệ thống hiển thị các đơn Booking mới (PENDING) "
                    "kèm thông tin khách hàng, số điện thoại, căn hộ muốn thuê và ngày dự kiến chuyển vào.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Nhân viên liên hệ qua số điện thoại để tư vấn, xác nhận lịch hẹn xem phòng trực tiếp.", bold_prefix="Bước 2: ")
    add_bullet(doc, "Khi khách đồng ý thuê, nhân viên nhấn nút 'Duyệt & Tạo Hợp đồng'. Hệ thống tự động chuyển toàn bộ dữ liệu "
                    "từ đơn Booking sang biểu mẫu lập Hợp đồng mới, giảm thiểu 100% thời gian nhập liệu thủ công.", bold_prefix="Bước 3: ")

    add_h3(doc, "3.2.2. Quản lý Hồ sơ Khách thuê & Đăng ký Người ở cùng (UC008)")
    add_p(doc, "Quy trình lưu trữ hồ sơ cư dân theo quy định:")
    add_bullet(doc, "Truy cập mục 'Khách thuê' (`/admin/tenants`). Nhấn nút 'Thêm Khách thuê Mới'.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Nhập đầy đủ thông tin: Họ tên, Số CCCD (hệ thống kiểm tra tính duy nhất), Số điện thoại, Email và Quê quán.", bold_prefix="Bước 2: ")
    add_bullet(doc, "Tại tab 'Người ở cùng', nhấn 'Thêm người ở cùng' để khai báo CCCD và họ tên của các thành viên sống chung phòng.", bold_prefix="Bước 3: ")
    add_bullet(doc, "Tại tab 'Liên hệ khẩn cấp', khai báo thông tin người thân (bố mẹ, anh chị) kèm số điện thoại để liên lạc khi hữu sự.", bold_prefix="Bước 4: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Quản lý Hồ sơ Khách thuê & Người ở cùng (UC008) - Dwell Living.png",
               "Hình 3.5: Giao diện Quản lý Hồ sơ Khách thuê & Danh sách Người ở cùng phòng (UC008)", width=Inches(6.0))

    add_h3(doc, "3.2.3. Lập Hợp đồng Thuê Căn hộ Mới & Kích hoạt AI Summarizer (UC001)")
    add_p(doc, "Quy trình thiết lập hợp đồng mới:")
    add_bullet(doc, "Tại màn hình Hợp đồng (`/admin/contracts`), nhấn nút 'Lập Hợp đồng Mới'.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Chọn Căn hộ (hệ thống chỉ cho phép chọn các căn hộ đang AVAILABLE hoặc RESERVED của chính khách đó). "
                    "Hệ thống tự động kiểm tra chống xung đột lịch thuê theo thời gian thực (RB-01).", bold_prefix="Bước 2: ")
    add_bullet(doc, "Chọn Khách thuê đại diện, Ngày bắt đầu, Ngày kết thúc, Đơn giá thuê và Tiền cọc thỏa thuận.", bold_prefix="Bước 3: ")
    add_bullet(doc, "Nhấn 'Kích hoạt AI Tóm tắt'. AI đọc hiểu hợp đồng và sinh bản tóm tắt 5 mục rõ ràng. Nhấn 'Lưu Dự thảo & Gửi Duyệt'.", bold_prefix="Bước 4: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Lập hợp đồng thuê và Đặt cọc (UC001) - Dwell Living.png",
               "Hình 3.6: Biểu mẫu Lập Hợp đồng Thuê mới & Cấu hình Tiền cọc (UC001)", width=Inches(6.0))

    add_h3(doc, "3.2.4. Tiếp nhận Sự cố & Điều phối Kỹ thuật Viên Bảo trì (UC004)")
    add_p(doc, "Quy trình quản lý phiếu yêu cầu sửa chữa:")
    add_bullet(doc, "Truy cập mục 'Bảo trì Sự cố' (`/admin/maintenance`). Xem danh sách các yêu cầu do cư dân gửi lên hoặc nhân viên tự tạo.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Mở chi tiết phiếu để xem mô tả lỗi, hình ảnh hiện trường hư hỏng và mức độ ưu tiên. "
                    "Nếu sự cố thuộc mức Khẩn cấp (URGENT), nhân viên bật tính năng 'Khóa phòng sang MAINTENANCE'.", bold_prefix="Bước 2: ")
    add_bullet(doc, "Nhấn 'Phân công Kỹ thuật', chọn nhân viên kỹ thuật phụ trách sửa chữa và chuyển trạng thái phiếu sang IN_PROGRESS.", bold_prefix="Bước 3: ")
    add_bullet(doc, "Sau khi thợ hoàn thành công việc, nhân viên kiểm tra nghiệm thu thực tế, cập nhật chi phí sửa chữa (nếu có) "
                    "và nhấn 'Nghiệm thu Hoàn thành (COMPLETED)' để đóng phiếu.", bold_prefix="Bước 4: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Tiếp nhận & Nghiệm thu Bảo trì Sự cố (UC004) - Dwell Living.png",
               "Hình 3.7: Giao diện Tiếp nhận & Nghiệm thu Bảo trì Kỹ thuật Sự cố (UC004)", width=Inches(6.0))


    # 3.3. Accountant
    add_h2(doc, "3.3. Chức năng của Bộ phận Kế toán (Accountant)")
    add_p(doc, 
        "Bộ phận Kế toán chịu trách nhiệm vận hành toàn bộ phân hệ tài chính: ghi nhận cọc, lập hóa đơn thu phí định kỳ, "
        "đối soát thanh toán VietQR Napas, quản lý nợ đọng và sử dụng AI soạn tin đôn đốc nợ."
    )

    add_h3(doc, "3.3.1. Quản lý Tiền cọc Hợp đồng & Quyết toán Thanh lý (UC002)")
    add_p(doc, "Quy trình quản lý dòng tiền cọc (Deposits):")
    add_bullet(doc, "Khi khách ký hợp đồng, kế toán truy cập mục Tiền cọc, kiểm tra số tiền cần thu và nhấn 'Ghi nhận Thu cọc'. "
                    "Trạng thái cọc chuyển sang HELD (Đang giữ tiền cọc an toàn).", bold_prefix="• Thu Cọc Ban đầu: ")
    add_bullet(doc, "Khi hợp đồng kết thúc thanh lý: Kế toán mở phiếu quyết toán cọc. Nhập số tiền khấu trừ (deduction_amount) nếu có "
                    "hư hỏng đồ đạc kèm lý do giải trình. Hệ thống tự động tính số tiền hoàn trả cho khách (refund_amount = amount - deduction_amount) "
                    "và bảo đảm tuân thủ nguyên tắc bảo toàn tài chính (RB-03).", bold_prefix="• Quyết toán Hoàn trả / Khấu trừ: ")

    add_h3(doc, "3.3.2. Sinh Khoản thu Định kỳ & Quản lý Hóa đơn Hàng tháng (UC003)")
    add_p(doc, "Quy trình lập hóa đơn tiền phòng và dịch vụ định kỳ:")
    add_bullet(doc, "Vào ngày chốt sổ hàng tháng, kế toán truy cập mục 'Quản lý Tài chính' (`/admin/finance`).", bold_prefix="Bước 1: ")
    add_bullet(doc, "Nhấn nút 'Sinh Khoản thu Định kỳ Hàng loạt'. Chọn Kỳ thu (Tháng/Năm) và Hạn chót thanh toán (Due Date).", bold_prefix="Bước 2: ")
    add_bullet(doc, "Hệ thống tự động quét tất cả hợp đồng ACTIVE, sinh hóa đơn tương ứng với Tiền phòng thỏa thuận và Phí dịch vụ định kỳ. "
                    "Hóa đơn được gán trạng thái UNPAID và đồng thời gửi thông báo tới Cổng Cư dân.", bold_prefix="Bước 3: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Sinh khoản thu định kỳ và Ghi nhận thanh toán.png",
               "Hình 3.8: Biểu mẫu Sinh Khoản thu Định kỳ Hàng loạt & Ghi nhận Thanh toán (UC003)", width=Inches(6.0))

    add_h3(doc, "3.3.3. Ghi nhận Thanh toán Tiền mặt & Đối soát VietQR Napas (UC003)")
    add_p(doc, "Quy trình thu tiền và in biên lai điện tử:")
    add_bullet(doc, "Nếu khách nộp tiền mặt: Kế toán nhấn 'Ghi nhận Thu tiền' trên dòng hóa đơn tương ứng, chọn phương thức CASH, "
                    "nhập số tiền thực nộp -> Nhấn 'Lưu Thanh toán'.", bold_prefix="• Khách nộp Tiền mặt: ")
    add_bullet(doc, "Nếu khách chuyển khoản: Kế toán hiển thị mã VietQR động chứa sẵn số tiền và mã hóa đơn duy nhất. "
                    "Cư dân quét mã qua ứng dụng ngân hàng bất kỳ, hệ thống ghi nhận giao dịch tức thì và tự động chuyển hóa đơn sang trạng thái PAID.",
               bold_prefix="• Thanh toán Quét mã VietQR: ")
    add_bullet(doc, "Sau khi thanh toán thành công, nhấn 'Xem Biên lai' để hiển thị phiếu thu chuẩn nghiệp vụ và in phiếu gửi khách.", bold_prefix="• Xuất Biên lai Điện tử: ")

    add_h3(doc, "3.3.4. Quét Cảnh báo Tự động & AI Soạn tin Đôn đốc Nợ (UC005)")
    add_p(doc, "Quy trình tự động hóa nhắc nợ chuyên nghiệp bằng AI:")
    add_bullet(doc, "Truy cập mục 'Cảnh báo & AI Nhắc nợ' (`/admin/alerts`). Nhấn nút 'Quét Cảnh báo Tự động'.", bold_prefix="Bước 1: ")
    add_bullet(doc, "Rule Engine tự động rà soát toàn bộ cơ sở dữ liệu và liệt kê các trường hợp nợ quá hạn nộp. "
                    "Với mỗi bản ghi, Trí tuệ Nhân tạo GenAI tự động biên soạn nội dung thông điệp đôn đốc nợ mang văn phong lịch sự, "
                    "nêu rõ số tiền nợ, số ngày trễ hạn và đính kèm thông tin thanh toán VietQR.", bold_prefix="Bước 2: ")
    add_bullet(doc, "Kế toán kiểm duyệt nội dung do AI soạn thảo, chỉnh sửa nếu cần và nhấn nút 'Gửi Thông báo'. "
                    "Hệ thống gửi thông điệp trực tiếp qua Cổng Cư dân và đánh dấu trạng thái cảnh báo là ĐÃ GỬI.", bold_prefix="Bước 3: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Quét cảnh báo tự động & AI Soạn thông báo đôn đốc (UC005) - Dwell Living.png",
               "Hình 3.9: Giao diện Quét Cảnh báo Tự động & AI Soạn thảo Thông báo Đôn đốc Nợ (UC005)", width=Inches(6.0))


    # 3.4. Customer & Tenant
    add_h2(doc, "3.4. Chức năng của Khách hàng & Cư dân (Customer / Tenant)")
    add_p(doc, 
        "Hệ thống cung cấp trải nghiệm số hiện đại, tiện lợi vượt bậc cho khách tìm thuê và cư dân đang sinh sống, "
        "được chia thành 2 giai đoạn trải nghiệm:"
    )

    add_h3(doc, "3.4.1. Quy trình dành cho Khách Tìm thuê Phòng (Customer Experience)")
    add_p(doc, "Khách hàng truy cập tự do tại Cổng thông tin công khai:")
    add_bullet(doc, "Truy cập trang chủ `/explore`. Sử dụng bộ lọc theo Tòa nhà, Tầng, Mức giá (VD: 5-10 triệu) và Tiện ích mong muốn.", bold_prefix="1. Tìm kiếm Căn hộ: ")
    add_bullet(doc, "Nhấn vào biểu tượng Chatbot AI góc màn hình. Nhập nhu cầu (Ví dụ: 'Tôi cần tìm căn hộ 2 phòng ngủ, có ban công thoáng, "
                    "ngân sách tầm 8 triệu'). AI Room Matcher sẽ phân tích các phòng trống khả dụng và gợi ý chính xác căn hộ thích hợp nhất.",
               bold_prefix="2. Trợ lý AI Room Matcher: ")
    add_bullet(doc, "Khách bấm vào thẻ phòng để chuyển sang trang Chi tiết, xem album ảnh thực tế, tiện nghi nội thất và bản đồ vị trí.", bold_prefix="3. Xem Chi tiết Phòng: ")
    add_bullet(doc, "Nhấn 'Đặt phòng & Giữ chỗ ngay'. Khách điền Họ tên, Số điện thoại, Email, Số CCCD, Ngày dự kiến dọn vào và số tiền cọc dự kiến. "
                    "Sau khi nhấn gửi, hệ thống trả về Mã Booking và tự động khóa phòng sang RESERVED để tránh người khác đặt trùng.",
               bold_prefix="4. Đặt cọc & Giữ chỗ Trực tuyến: ")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Khám Phá & Tìm Kiếm Căn Hộ - Sunshine Homes.png",
               "Hình 3.10: Giao diện Khám phá & Tìm kiếm Căn hộ Trống Trực tuyến (Customer Portal)", width=Inches(6.0))

    add_h3(doc, "3.4.2. Quy trình dành cho Cư dân Đang thuê (Resident / Tenant Portal Experience)")
    add_p(doc, "Cư dân sử dụng tài khoản được cấp để đăng nhập vào Cổng Cư dân (`/tenant-portal`):")

    add_p(doc, "a. Quản lý Hợp đồng Điện tử & Xem AI Tóm tắt Điều khoản:", bold_prefix="• ")
    add_p(doc, "Cư dân truy cập tab 'Hợp đồng thuê'. Toàn bộ các mốc thời gian hiệu lực, giá thuê và tiền cọc được hiển thị minh bạch. "
               "Nhấn nút 'Xem AI Tóm tắt' để đọc nhanh 5 điều khoản trọng yếu bằng ngôn ngữ dễ hiểu, không cần lục tìm văn bản giấy tờ.")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Văn Phòng Hợp Đồng Số & AI Summarizer Studio - Sunshine Homes.png",
               "Hình 3.11: Giao diện Văn phòng Hợp đồng Số & AI Summarizer Studio cho Cư dân", width=Inches(6.0))

    add_p(doc, "b. Tra cứu Hóa đơn & Quét mã VietQR Thanh toán Tức thì:", bold_prefix="• ")
    add_p(doc, "Cư dân vào tab 'Hóa đơn dịch vụ', chọn hóa đơn cần thanh toán và nhấn 'Thanh toán VietQR'. Màn hình hiển thị mã QR động chuẩn Napas. "
               "Cư dân mở ứng dụng ngân hàng trên điện thoại (Vietcombank, MB, Techcombank, BIDV...), quét mã và xác nhận chuyển tiền. "
               "Hệ thống cập nhật 'ĐÃ THANH TOÁN' ngay lập tức và sinh phiếu thu điện tử có thể tải về máy.")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Hóa Đơn Tiện Ích Tháng 11 & Thanh Toán VietQR - Sunshine Homes.png",
               "Hình 3.12: Màn hình Tra cứu Hóa đơn Tiện ích Hàng tháng & Quét mã VietQR Napas Thanh toán", width=Inches(6.0))
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Sổ Cái Thanh Toán & Phiếu Thu Điện Tử - Sunshine Homes.png",
               "Hình 3.13: Sổ cái Thanh toán Cư dân & Bản hiển thị Phiếu thu Điện tử Hợp lệ", width=Inches(6.0))

    add_p(doc, "c. Báo cáo Sự cố Hư hỏng Trực tuyến kèm Ảnh Hiện trường & Đánh giá 5 Sao:", bold_prefix="• ")
    add_p(doc, "Khi phát hiện thiết bị trong phòng bị hỏng (máy lạnh không mát, vòi nước rò rỉ): Cư dân vào tab 'Bảo trì', nhấn 'Báo hỏng mới'. "
               "Nhập mô tả sự cố, chọn mức độ ưu tiên và chụp ảnh hiện trường đính kèm. Tiến độ xử lý của kỹ thuật viên được cập nhật trực tiếp. "
               "Khi sửa chữa xong, cư dân trực tiếp nghiệm thu và đánh giá chất lượng phục vụ 5 sao kèm phản hồi cải tiến.")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Báo Cáo Sự Cố & Theo Dõi Sửa Chữa Trực Tiếp - Sunshine Homes.png",
               "Hình 3.14: Giao diện Báo cáo Sự cố & Theo dõi Tiến độ Sửa chữa Trực tiếp của Cư dân", width=Inches(6.0))
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Khách hàng/Nghiệm Thu Sửa Chữa & Đánh Giá Dịch Vụ 5 Sao - Sunshine Homes.png",
               "Hình 3.15: Màn hình Nghiệm thu Sửa chữa & Đánh giá Chất lượng Dịch vụ 5 Sao", width=Inches(6.0))

    add_p(doc, "d. Tương tác 24/7 với Trợ lý Chatbot AI RAG Nội quy Tòa nhà:", bold_prefix="• ")
    add_p(doc, "Tại bất kỳ trang nào trên Cổng Cư dân, nhấn nút biểu tượng Chat AI nổi góc phải màn hình. Cư dân có thể đặt bất kỳ câu hỏi nào "
               "(Ví dụ: 'Chung cư có cho nuôi mèo không?', 'Quy định giờ giấc đóng cửa hầm xe là mấy giờ?', 'Phí dịch vụ gửi xe máy là bao nhiêu?'). "
               "Hệ thống RAG truy xuất chính xác tài liệu nội quy và phản hồi ngay lập tức kèm số điều khoản trích dẫn chuẩn xác.")
    add_figure(doc, "d:/Detai12_QLCH/Tailieu/giao dien/Quản trị/Chatbot RAG tra cứu nội quy tòa nhà (UC006) - Dwell Living.png",
               "Hình 3.16: Giao diện Tương tác với Trợ lý Chatbot AI RAG Tra cứu Nội quy Tòa nhà 24/7 (UC006)", width=Inches(6.0))


    # ==================== PHẦN 4: PHỤ LỤC & SỰ CỐ ====================
    add_h1(doc, "PHỤ LỤC & XỬ LÝ SỰ CỐ THƯỜNG GẶP (FAQS)")

    add_h2(doc, "4.1. Bảng Mã Lỗi Thường gặp & Quy trình Xử lý Nhanh")
    add_p(doc, "Bảng tổng hợp các tình huống lỗi phổ biến và biện pháp khắc phục tức thời:")

    err_headers = ["Mã Lỗi / Hiện tượng", "Nguyên nhân Phát sinh", "Giải pháp Khắc phục Đề xuất"]
    err_data = [
        ["ERR_AUTH_01 (401 Unauthorized)", "Sai tên đăng nhập hoặc mật khẩu; hoặc JWT Token đã hết hạn sau 8 giờ làm việc.", "Kiểm tra lại phím CapsLock; đăng nhập lại để nhận JWT Token phiên mới."],
        ["ERR_AUTH_02 (403 Forbidden)", "Người dùng truy cập vào trang không thuộc phạm vi quyền hạn theo phân quyền RBAC.", "Đăng nhập bằng tài khoản có vai trò phù hợp (Admin/Accountant/Staff)."],
        ["ERR_CONTRACT_CONFLICT (409 Conflict)", "Căn hộ đã có hợp đồng ACTIVE trùng khoảng thời gian thuê được chỉ định.", "Kiểm tra lại ngày bắt đầu/kết thúc hợp đồng hoặc chọn căn hộ khác."],
        ["ERR_VIETQR_TIMEOUT", "Mã QR đã quá thời gian hiệu lực phiên thanh toán hoặc ứng dụng ngân hàng đang bảo trì.", "Nhấn nút 'Làm mới mã VietQR' để sinh chuỗi thanh toán động mới nhất."],
        ["ERR_AI_RATE_LIMIT (429)", "Vượt quá định mức gọi API Google Gemini trong 1 phút.", "Đợi từ 10 - 20 giây và nhấn nút 'Thử lại' trên giao diện AI Assistant."]
    ]
    create_styled_table(doc, err_headers, err_data, col_widths=[1.8, 2.5, 2.8], header_bg="1F497D")

    add_h2(doc, "4.2. Câu hỏi Thường gặp khi Sử dụng Trí tuệ Nhân tạo (AI FAQs)")
    add_bullet(doc, "Bản tóm tắt do AI trích xuất từ văn bản hợp đồng nhằm mục đích tham khảo nhanh và nắm bắt các nghĩa vụ chính. "
                    "Giá trị pháp lý chính thức căn cứ trên bản hợp đồng gốc đã được hai bên ký tên và đóng dấu.",
               bold_prefix="1. Bản tóm tắt hợp đồng của AI có thay thế được hợp đồng pháp lý không? ")
    add_bullet(doc, "Hệ thống RAG sử dụng kỹ thuật trích xuất ngữ nghĩa (Retrieval-Augmented Generation) trực tiếp từ bộ tài liệu nội quy "
                    "nội bộ được Ban quản lý số hóa. Nếu nội dung câu hỏi không có trong nội quy tòa nhà, AI sẽ từ chối trả lời một cách lịch thiệp "
                    "thay vì suy đoán sai lệch.",
               bold_prefix="2. Chatbot AI RAG có thể bịa đặt thông tin ngoài phạm vi nội quy không? ")
    add_bullet(doc, "AI chỉ hỗ trợ soạn thảo văn bản dự thảo (Draft). Toàn bộ tin nhắn trước khi gửi đến khách thuê bắt buộc phải trải qua "
                    "bước kiểm duyệt và bấm nút xác nhận bởi Nhân viên hoặc Kế toán (Human-in-the-loop).",
               bold_prefix="3. AI Đôn đốc nợ có tự động gửi tin nhắn cho khách mà kế toán không biết không? ")

    add_h2(doc, "4.3. Kênh Liên hệ Hỗ trợ Kỹ thuật & Bảo hành Phần mềm")
    add_p(doc, "Trong quá trình vận hành, nếu quý khách hàng hoặc cán bộ nhân viên gặp bất kỳ vướng mắc nào, xin vui lòng liên hệ:")
    add_bullet(doc, "Phòng Kỹ thuật & Công nghệ - Nhóm 12 Phần mềm (KTPM K23C)", bold_prefix="• Đơn vị Phụ trách: ")
    add_bullet(doc, "Hotline hỗ trợ kỹ thuật: 1900 6868 (Thời gian hỗ trợ: 08:00 - 21:00 hàng ngày)", bold_prefix="• Đường dây Nóng: ")
    add_bullet(doc, "Email kỹ thuật: support@sunshinehomes.vn / contact@dwellliving.com", bold_prefix="• Hòm thư Điện tử: ")
    add_bullet(doc, "Thời gian bảo hành và nâng cấp phần mềm: 12 tháng kể từ ngày nghiệm thu bàn giao chính thức.", bold_prefix="• Chính sách Bảo hành: ")

    # Save document
    out_path = "d:/Detai12_QLCH/Tailieu/07_GenAI_SoftwareDevelopment_user-guide.docx"
    doc.save(out_path)
    print(f"Document 07 generated successfully at: {out_path}")
    print(f"Total paragraphs: {len(doc.paragraphs)}, Total tables: {len(doc.tables)}, Total inline shapes: {len(doc.inline_shapes)}")

if __name__ == "__main__":
    build_document_07()
