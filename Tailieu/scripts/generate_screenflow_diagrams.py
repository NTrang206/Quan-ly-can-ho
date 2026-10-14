import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT_DIR = "d:/Detai12_QLCH/Tailieu/scratch_imgs/flowcharts"
os.makedirs(OUT_DIR, exist_ok=True)

FONT_MAIN = "Segoe UI"

# Colors palette
C_NAVY = "#1F497D"
C_BLUE_BG = "#EBF3FA"
C_BLUE_BORDER = "#2B4C7E"

C_AMBER_BG = "#FFF3CD"
C_AMBER_BORDER = "#856404"

C_PURPLE_BG = "#F3E8FF"
C_PURPLE_BORDER = "#6B21A8"

C_GREEN_BG = "#D1E7DD"
C_GREEN_BORDER = "#0F5132"

C_RED_BG = "#F8D7DA"
C_RED_BORDER = "#842029"

C_GRAY_BG = "#F8F9FA"
C_GRAY_BORDER = "#6C757D"

def create_base_fig(width=10, height=3):
    fig, ax = plt.subplots(figsize=(width, height), dpi=200)
    ax.set_xlim(0, width)
    ax.set_ylim(0, height)
    ax.axis('off')
    return fig, ax

def draw_node(ax, x, y, w, h, title, subtitle="", bg=C_BLUE_BG, border=C_BLUE_BORDER, text_col="#1A202C", round_style="round,pad=0.2"):
    rect = FancyBboxPatch((x, y), w, h, boxstyle=round_style,
                          facecolor=bg, edgecolor=border, linewidth=1.5,
                          mutation_scale=1.0)
    ax.add_patch(rect)
    cx = x + w / 2.0
    cy = y + h / 2.0
    if subtitle:
        ax.text(cx, cy + h * 0.12, title, ha='center', va='center',
                fontsize=9.5, fontweight='bold', color=text_col, fontname=FONT_MAIN)
        ax.text(cx, cy - h * 0.22, subtitle, ha='center', va='center',
                fontsize=8.0, color="#4A5568", fontname=FONT_MAIN)
    else:
        ax.text(cx, cy, title, ha='center', va='center',
                fontsize=9.5, fontweight='bold', color=text_col, fontname=FONT_MAIN)

def draw_decision_node(ax, x, y, w, h, title, subtitle="", bg=C_AMBER_BG, border=C_AMBER_BORDER):
    cx = x + w / 2.0
    cy = y + h / 2.0
    # Diamond polygon
    pts = [[cx, y + h], [x + w, cy], [cx, y], [x, cy]]
    poly = patches.Polygon(pts, closed=True, facecolor=bg, edgecolor=border, linewidth=1.5)
    ax.add_patch(poly)
    if subtitle:
        ax.text(cx, cy + 0.1, title, ha='center', va='center',
                fontsize=8.5, fontweight='bold', color="#744210", fontname=FONT_MAIN)
        ax.text(cx, cy - 0.15, subtitle, ha='center', va='center',
                fontsize=7.5, color="#975A16", fontname=FONT_MAIN)
    else:
        ax.text(cx, cy, title, ha='center', va='center',
                fontsize=8.5, fontweight='bold', color="#744210", fontname=FONT_MAIN)

def draw_arrow(ax, p1, p2, label="", rad=0.0, color="#2D3748", text_offset=(0, 0.15)):
    arrow = FancyArrowPatch(p1, p2, arrowstyle='-|>,head_width=3.5,head_length=5.5',
                            connectionstyle=f'arc3,rad={rad}',
                            color=color, linewidth=1.3)
    ax.add_patch(arrow)
    if label:
        mx = (p1[0] + p2[0]) / 2.0 + text_offset[0]
        my = (p1[1] + p2[1]) / 2.0 + text_offset[1]
        ax.text(mx, my, label, ha='center', va='center',
                fontsize=7.5, fontweight='bold', color="#2B6CB0",
                fontname=FONT_MAIN,
                bbox=dict(boxstyle='square,pad=0.15', facecolor='white', edgecolor='none', alpha=0.85))

# ==================== 1. OVERALL ARCHITECTURE ====================
def generate_overall_arch():
    fig, ax = create_base_fig(width=11, height=6.0)
    
    # Header Title
    ax.text(5.5, 5.7, "SƠ ĐỒ HÌNH KHỐI KIẾN TRÚC PHÂN LUỒNG MÀN HÌNH TỔNG THỂ (SCREEN FLOW)",
            ha='center', va='center', fontsize=12, fontweight='bold', color=C_NAVY, fontname=FONT_MAIN)

    # Public branch (Top)
    draw_node(ax, 0.4, 4.3, 2.2, 0.9, "SCR-01: Khám Phá Phòng", "Route: / (Public Explore)", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 3.4, 4.3, 2.2, 0.9, "SCR-02: Chi Tiết Căn Hộ", "Route: /apartments/:id", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 6.4, 4.3, 2.0, 0.9, "MDL-02: Đặt Phòng", "Booking Modal", bg=C_GREEN_BG, border=C_GREEN_BORDER)
    draw_node(ax, 1.8, 3.0, 2.2, 0.8, "MDL-01: AI Matcher", "AI Gợi ý phòng", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)

    draw_arrow(ax, (2.6, 4.75), (3.4, 4.75), "Click Card")
    draw_arrow(ax, (5.6, 4.75), (6.4, 4.75), "Đặt phòng")
    draw_arrow(ax, (1.5, 4.3), (2.4, 3.8), "Chat AI", rad=0.1)
    draw_arrow(ax, (4.0, 3.4), (4.3, 4.3), "Chọn phòng", rad=0.1)

    # Auth & RBAC (Middle)
    draw_node(ax, 0.4, 1.7, 2.2, 0.9, "SCR-03: Đăng Nhập", "Route: /login (BCrypt)", bg="#E2E8F0", border="#4A5568")
    draw_decision_node(ax, 3.3, 1.6, 2.4, 1.1, "Xác Thực RBAC", "Kiểm tra Role JWT")
    draw_arrow(ax, (2.6, 2.15), (3.3, 2.15), "Submit Login")

    # Roles branches
    # Branch 1: Admin / Staff / Accountant (Top-Right of auth)
    draw_node(ax, 6.6, 2.4, 2.0, 0.8, "SCR-04: Dashboard", "Admin / Accountant", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 8.8, 2.4, 1.9, 0.8, "SCR-05: Tòa Nhà/Phòng", "Admin / Staff", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 6.6, 1.3, 2.0, 0.8, "SCR-08: Hợp Đồng & AI", "Lập & Tóm tắt HĐ", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 8.8, 1.3, 1.9, 0.8, "SCR-09: Tài Chính Phí", "VietQR & Sổ nợ", bg=C_BLUE_BG, border=C_BLUE_BORDER)

    draw_arrow(ax, (5.0, 2.5), (6.6, 2.8), "Admin/Accountant", rad=-0.1)
    draw_arrow(ax, (5.5, 2.15), (6.6, 1.7), "Staff / Lập HĐ", rad=0.1)

    # Branch 2: Tenant Portal (Bottom)
    draw_node(ax, 6.6, 0.2, 4.1, 0.8, "SCR-13: Cổng Cư Dân (Tenant Portal)", "Hợp đồng • Hóa đơn VietQR • Báo hỏng • Chatbot RAG", bg=C_GREEN_BG, border=C_GREEN_BORDER)
    draw_arrow(ax, (4.5, 1.6), (6.6, 0.6), "Role = TENANT", rad=0.2)

    # Unauthorized
    draw_node(ax, 0.4, 0.2, 2.2, 0.7, "SCR-14: Báo Lỗi", "403 Forbidden", bg=C_RED_BG, border=C_RED_BORDER)
    draw_arrow(ax, (3.8, 1.6), (2.6, 0.55), "Sai quyền", rad=-0.2)

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_overall_architecture.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 2. SF-01: BOOKING ====================
def generate_sf01():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.8, 1.0, "SCR-01: Khám Phá", "PublicExplorePage", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.9, 0.7, 1.9, 1.0, "SCR-02: Chi Tiết", "ApartmentDetailPage", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 5.5, 0.7, 1.8, 1.0, "MDL-02: Đặt Phòng", "BookingModal (Form)", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 7.9, 0.7, 1.4, 1.0, "Cấp Mã Booking", "Phòng -> RESERVED", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    # AI branch below
    draw_node(ax, 1.5, 0.05, 1.8, 0.5, "MDL-01: AI Matcher", "Gợi ý phòng trống", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)

    draw_arrow(ax, (2.1, 1.2), (2.9, 1.2), "Click Card")
    draw_arrow(ax, (4.8, 1.2), (5.5, 1.2), "Click 'Đặt phòng'")
    draw_arrow(ax, (7.3, 1.2), (7.9, 1.2), "Submit Form")
    draw_arrow(ax, (1.2, 0.7), (1.8, 0.55), "Chat nhu cầu", rad=0.2)
    draw_arrow(ax, (3.3, 0.35), (3.8, 0.7), "Chọn phòng", rad=0.2)

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf01_booking.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 3. SF-02: RBAC ====================
def generate_sf02():
    fig, ax = create_base_fig(width=9.5, height=2.5)
    draw_node(ax, 0.3, 0.7, 1.7, 1.1, "SCR-03: Đăng Nhập", "Username / Password", bg="#EDF2F7", border="#4A5568")
    draw_decision_node(ax, 2.7, 0.6, 2.3, 1.3, "Xác Thực JWT", "Kiểm tra Role")

    draw_node(ax, 5.8, 1.6, 1.8, 0.7, "SCR-04: Dashboard", "Role: Admin / Kế toán", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 5.8, 0.85, 1.8, 0.65, "SCR-05: Căn Hộ", "Role: Nhân viên", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 5.8, 0.1, 1.8, 0.65, "SCR-13: Cổng Cư Dân", "Role: Khách thuê", bg=C_GREEN_BG, border=C_GREEN_BORDER)
    draw_node(ax, 8.0, 0.6, 1.3, 0.8, "SCR-14: Lỗi", "403 Forbidden", bg=C_RED_BG, border=C_RED_BORDER)

    draw_arrow(ax, (2.0, 1.25), (2.7, 1.25), "Submit Login")
    draw_arrow(ax, (4.6, 1.6), (5.8, 1.95), "Admin/Accountant", rad=-0.1)
    draw_arrow(ax, (5.0, 1.25), (5.8, 1.15), "Staff", rad=0.0)
    draw_arrow(ax, (4.6, 0.8), (5.8, 0.4), "Tenant", rad=0.1)
    draw_arrow(ax, (7.6, 1.6), (8.0, 1.0), "Sai quyền", rad=0.1)

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf02_rbac.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 4. SF-03: CONTRACT & AI ====================
def generate_sf03():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.6, 1.0, "SCR-08: Hợp Đồng", "Danh sách contracts", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.5, 0.7, 1.7, 1.0, "MDL-05: Lập HĐ", "Chọn phòng & Thời hạn", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 4.8, 0.7, 1.8, 1.0, "DWR-01: AI Tóm Tắt", "Trích xuất 5 điều khoản", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)
    draw_node(ax, 7.2, 0.7, 2.0, 1.0, "Phê Duyệt Hợp Đồng", "Contract -> ACTIVE\nPhòng -> OCCUPIED", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (1.9, 1.2), (2.5, 1.2), "Click '+ Lập HĐ'")
    draw_arrow(ax, (4.2, 1.2), (4.8, 1.2), "Click 'AI Tóm tắt'")
    draw_arrow(ax, (6.6, 1.2), (7.2, 1.2), "Admin Phê duyệt")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf03_contract.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 5. SF-04: TENANT & ROOMMATE ====================
def generate_sf04():
    fig, ax = create_base_fig(width=9.5, height=2.2)
    draw_node(ax, 0.3, 0.6, 1.8, 1.0, "SCR-07: Khách Thuê", "Quản lý danh sách", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.8, 0.6, 1.9, 1.0, "Modal Thêm Khách", "Họ tên, CCCD, SĐT", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 5.4, 0.6, 1.9, 1.0, "Tab Người Ở Cùng", "Khai báo nhân khẩu", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 7.8, 0.6, 1.5, 1.0, "Liên Hệ Khẩn Cấp", "Bảo lãnh thân nhân", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (2.1, 1.1), (2.8, 1.1), "Click '+ Thêm'")
    draw_arrow(ax, (4.7, 1.1), (5.4, 1.1), "Lưu hồ sơ")
    draw_arrow(ax, (7.3, 1.1), (7.8, 1.1), "Thêm thân nhân")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf04_tenant.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 6. SF-05: BILLING & VIETQR ====================
def generate_sf05():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.6, 1.0, "SCR-09: Tài Chính", "Danh sách hóa đơn", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.4, 0.7, 1.8, 1.0, "MDL-06: Sinh Khoản Thu", "Tự động quét HĐ ACTIVE", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 4.8, 0.7, 1.8, 1.0, "MDL-07: VietQR Napas", "Mã QR động 24/7", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)
    draw_node(ax, 7.1, 0.7, 2.1, 1.0, "Cập Nhật PAID & Sổ Nợ", "Status=PAID • Trừ debt\nIn biên lai điện tử", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (1.9, 1.2), (2.4, 1.2), "Sinh phí kỳ")
    draw_arrow(ax, (4.2, 1.2), (4.8, 1.2), "Quét VietQR")
    draw_arrow(ax, (6.6, 1.2), (7.1, 1.2), "Nhận tiền thành công")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf05_finance.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 7. SF-06: MAINTENANCE ====================
def generate_sf06():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.6, 1.0, "Báo Hỏng Sự Cố", "Cư dân gửi kèm ảnh", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.4, 0.7, 1.8, 1.0, "SCR-10: Tiếp Nhận", "Phân loại: LOW -> URGENT", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 4.8, 0.7, 1.8, 1.0, "Phân Công Kỹ Thuật", "Phiếu -> IN_PROGRESS\n(Khóa phòng nếu URGENT)", bg="#FEF3C7", border="#D97706")
    draw_node(ax, 7.1, 0.7, 2.1, 1.0, "Nghiệm Thu & Đóng Phiếu", "Status=COMPLETED\nĐánh giá 5 sao cư dân", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (1.9, 1.2), (2.4, 1.2), "Gửi sự cố")
    draw_arrow(ax, (4.2, 1.2), (4.8, 1.2), "Điều phối thợ")
    draw_arrow(ax, (6.6, 1.2), (7.1, 1.2), "Sửa chữa xong")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf06_maintenance.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 8. SF-07: ALERT & AI DUNNING ====================
def generate_sf07():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.6, 1.0, "SCR-11: Cảnh Báo", "AlertsAIPage", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.4, 0.7, 1.8, 1.0, "Rule Engine Quét", "Tìm nợ quá hạn & HĐ hết hạn", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 4.8, 0.7, 1.9, 1.0, "DWR-02: AI Soạn Tin", "Google Gemini LLM Draft", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)
    draw_node(ax, 7.2, 0.7, 2.0, 1.0, "Kiểm Duyệt & Gửi", "Dispatch Zalo / SMS\nis_sent = True", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (1.9, 1.2), (2.4, 1.2), "Quét tự động")
    draw_arrow(ax, (4.2, 1.2), (4.8, 1.2), "AI Soạn thảo")
    draw_arrow(ax, (6.7, 1.2), (7.2, 1.2), "Duyệt gửi tin")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf07_dunning.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 9. SF-08: RAG CHATBOT ====================
def generate_sf08():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.6, 1.0, "Đặt Câu Hỏi", "Cư dân hỏi nội quy/phí", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.4, 0.7, 1.9, 1.0, "Vector Search (RAG)", "Cosine Similarity Top-K", bg=C_AMBER_BG, border=C_AMBER_BORDER)
    draw_node(ax, 4.8, 0.7, 1.9, 1.0, "LLM Synthesis", "Prompt Context Injection", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)
    draw_node(ax, 7.2, 0.7, 2.0, 1.0, "Câu Trả Lời Chuẩn Xác", "Kèm trích dẫn số trang/điều", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (1.9, 1.2), (2.4, 1.2), "Gửi câu hỏi")
    draw_arrow(ax, (4.3, 1.2), (4.8, 1.2), "Truy xuất chunks")
    draw_arrow(ax, (6.7, 1.2), (7.2, 1.2), "Tổng hợp phản hồi")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf08_rag.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 10. SF-09: DASHBOARD ====================
def generate_sf09():
    fig, ax = create_base_fig(width=9.5, height=2.4)
    draw_node(ax, 0.3, 0.7, 1.8, 1.0, "SCR-04: Dashboard", "Occupancy, Doanh thu, Nợ", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.7, 1.3, 1.8, 0.8, "SCR-05: Căn Hộ", "Xem phòng trống", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.7, 0.1, 1.8, 0.8, "SCR-09: Tài Chính", "Theo dõi nợ quá hạn", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 5.2, 0.7, 1.8, 1.0, "SCR-10: Bảo Trì", "Điều phối sự cố tồn", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 7.5, 0.7, 1.7, 1.0, "Xuất Báo Cáo KPI", "Export Excel / PDF", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (2.1, 1.4), (2.7, 1.7), "Lấp đầy")
    draw_arrow(ax, (2.1, 1.0), (2.7, 0.5), "Nợ nần")
    draw_arrow(ax, (2.1, 1.2), (5.2, 1.2), "Sự cố mở")
    draw_arrow(ax, (7.0, 1.2), (7.5, 1.2), "Kết xuất số liệu")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf09_dashboard.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

# ==================== 11. SF-10: TENANT PORTAL ====================
def generate_sf10():
    fig, ax = create_base_fig(width=9.5, height=2.5)
    draw_node(ax, 0.3, 0.7, 1.8, 1.1, "SCR-13: Cổng Cư Dân", "Tenant Portal Menu", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_node(ax, 2.8, 1.7, 1.9, 0.65, "Tab 1: Tổng Quan", "Phòng đang thuê & Lịch phí", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 2.8, 0.9, 1.9, 0.65, "Tab 2: Hợp Đồng & AI", "DWR-01: AI Summarizer", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)
    draw_node(ax, 2.8, 0.1, 1.9, 0.65, "Tab 3: Hóa Đơn Phí", "MDL-07: VietQR Napas", bg=C_AMBER_BG, border=C_AMBER_BORDER)

    draw_node(ax, 5.4, 1.3, 2.0, 0.8, "Tab 4: Báo Sự Cố", "MDL-10: Báo hỏng + Ảnh", bg=C_BLUE_BG, border=C_BLUE_BORDER)
    draw_node(ax, 5.4, 0.3, 2.0, 0.8, "Widget: Chat AI RAG", "Hỏi đáp nội quy 24/7", bg=C_PURPLE_BG, border=C_PURPLE_BORDER)
    draw_node(ax, 7.8, 0.8, 1.4, 0.9, "Nghiệm Thu\n& Đánh Giá", "5 Sao Dịch vụ", bg=C_GREEN_BG, border=C_GREEN_BORDER)

    draw_arrow(ax, (2.1, 1.5), (2.8, 1.95), "Tab 1")
    draw_arrow(ax, (2.1, 1.25), (2.8, 1.2), "Tab 2")
    draw_arrow(ax, (2.1, 1.0), (2.8, 0.45), "Tab 3")
    draw_arrow(ax, (4.7, 1.7), (5.4, 1.7), "Báo hỏng")
    draw_arrow(ax, (4.7, 0.7), (5.4, 0.7), "Tra cứu")
    draw_arrow(ax, (7.4, 1.7), (7.8, 1.35), "Hoàn thành")

    plt.tight_layout()
    path = os.path.join(OUT_DIR, "diagram_sf10_portal.png")
    plt.savefig(path, dpi=200, bbox_inches='tight')
    plt.close()
    print("Saved:", path)

def generate_all_diagrams():
    generate_overall_arch()
    generate_sf01()
    generate_sf02()
    generate_sf03()
    generate_sf04()
    generate_sf05()
    generate_sf06()
    generate_sf07()
    generate_sf08()
    generate_sf09()
    generate_sf10()
    print("All 11 Screen Flow Block Diagrams generated successfully!")

if __name__ == "__main__":
    generate_all_diagrams()
