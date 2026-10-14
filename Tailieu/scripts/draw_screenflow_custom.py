import os
import sys
import zlib
import base64
import urllib.parse

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Polygon

OUT_IMG = "d:/Detai12_QLCH/Tailieu/scratch_imgs/screenflow_standard_diagram.png"
OUT_DRAWIO = "d:/Detai12_QLCH/Tailieu/so_do_screen_flow.drawio"
OUT_DRAWIO_ALT = "d:/Detai12_QLCH/Tailieu/sơ đồ/so_do_screen_flow.drawio"

os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)
os.makedirs(os.path.dirname(OUT_DRAWIO_ALT), exist_ok=True)

FONT_FAMILY = "Segoe UI"

# Colors matching the user's provided sample image
COLOR_BLUE = "#2196F3"       # Hiển thị trang (Screen / Page display)
COLOR_YELLOW = "#FFF59D"     # Người dùng lựa chọn (User selection / Sticky note)
COLOR_ORANGE = "#FB8C00"     # Máy tính lựa chọn / Quyết định (Decision)
COLOR_WHITE = "#FFFFFF"      # Thông báo lỗi (Error circle)
COLOR_DARK = "#37474F"       # Kết thúc (End pill)
COLOR_GREEN_LINE = "#4CAF50" # Luồng hợp lệ / Đã đăng ký
COLOR_RED_LINE = "#E53935"   # Luồng rẽ nhánh / Chưa đăng ký / Lỗi
COLOR_BLACK_LINE = "#263238"

def draw_screen_box(ax, x, y, w, h, text):
    """Blue box for Screen Display"""
    rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.0",
                          facecolor=COLOR_BLUE, edgecolor="#1976D2", linewidth=1.2)
    ax.add_patch(rect)
    ax.text(x + w/2.0, y + h/2.0, text, ha='center', va='center',
            fontsize=8.5, fontweight='bold', color='white', fontname=FONT_FAMILY,
            multialignment='center')

def draw_user_action_box(ax, x, y, w, h, text):
    """Yellow sticky note for User Choice"""
    rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.0",
                          facecolor=COLOR_YELLOW, edgecolor="#FBC02D", linewidth=1.0)
    ax.add_patch(rect)
    ax.text(x + w/2.0, y + h/2.0, text, ha='center', va='center',
            fontsize=8.0, fontweight='bold', color="#37474F", fontname=FONT_FAMILY,
            multialignment='center')

def draw_decision_diamond(ax, x, y, w, h, text):
    """Orange diamond for System Decision"""
    cx = x + w/2.0
    cy = y + h/2.0
    pts = [[cx, y + h], [x + w, cy], [cx, y], [x, cy]]
    poly = patches.Polygon(pts, closed=True, facecolor=COLOR_ORANGE, edgecolor="#E65100", linewidth=1.2)
    ax.add_patch(poly)
    ax.text(cx, cy, text, ha='center', va='center',
            fontsize=8.0, fontweight='bold', color='white', fontname=FONT_FAMILY,
            multialignment='center')

def draw_error_circle(ax, cx, cy, r, text="Lỗi"):
    """White circle for Error Notification"""
    circ = Circle((cx, cy), r, facecolor=COLOR_WHITE, edgecolor="#757575", linewidth=1.2)
    ax.add_patch(circ)
    ax.text(cx, cy, text, ha='center', va='center',
            fontsize=7.5, color="#212121", fontname=FONT_FAMILY)

def draw_end_pill(ax, x, y, w, h, text="Kết thúc"):
    """Dark pill for End state"""
    rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.2",
                          facecolor=COLOR_DARK, edgecolor="#212121", linewidth=1.2)
    ax.add_patch(rect)
    ax.text(x + w/2.0, y + h/2.0, text, ha='center', va='center',
            fontsize=8.5, fontweight='bold', color='white', fontname=FONT_FAMILY)

def draw_connector(ax, p1, p2, color=COLOR_BLACK_LINE, rad=0.0):
    """Arrow connector"""
    arrow = FancyArrowPatch(p1, p2, arrowstyle='-|>,head_width=3.5,head_length=5.5',
                            connectionstyle=f'arc3,rad={rad}',
                            color=color, linewidth=1.3)
    ax.add_patch(arrow)

def render_screenflow_image():
    # Setup Figure (Width 12 inches, Height 8.5 inches)
    fig, ax = plt.subplots(figsize=(12, 8.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # ==================== ROW 1 (Y: 6.8 - 7.6) ====================
    # Trang chủ
    draw_screen_box(ax, 0.6, 7.0, 1.4, 0.7, "Trang chủ\n(Khám phá)")
    draw_connector(ax, (2.0, 7.35), (2.6, 7.35), color=COLOR_BLACK_LINE)

    # Đăng ký / Đăng nhập
    draw_screen_box(ax, 2.6, 7.0, 1.4, 0.7, "Đăng ký /\nĐăng nhập")
    draw_connector(ax, (4.0, 7.35), (4.6, 7.35), color=COLOR_GREEN_LINE)

    # Người dùng chọn đăng nhập
    draw_user_action_box(ax, 4.6, 6.95, 1.5, 0.8, "Người dùng\nchọn đăng nhập")
    draw_connector(ax, (6.1, 7.35), (6.7, 7.35), color=COLOR_GREEN_LINE)

    # Màn hình Đăng nhập
    draw_screen_box(ax, 6.7, 7.0, 1.4, 0.7, "Màn hình\nĐăng nhập")
    draw_connector(ax, (8.1, 7.35), (8.7, 7.35), color=COLOR_GREEN_LINE)

    # Xác thực (Diamond)
    draw_decision_diamond(ax, 8.7, 6.9, 1.4, 0.9, "Xác thực\n(JWT)")

    # Error Loop for Row 1
    draw_error_circle(ax, 8.2, 8.05, 0.22, "Lỗi")
    draw_connector(ax, (9.4, 7.8), (8.45, 8.05), color=COLOR_GREEN_LINE, rad=-0.1)
    draw_connector(ax, (7.95, 8.05), (7.4, 7.7), color=COLOR_GREEN_LINE, rad=-0.1)

    # ==================== ROW 2 (Y: 5.2 - 6.0) ====================
    # Arrow from [Đăng ký / Đăng nhập] down to [Người dùng chọn đặt phòng/đăng ký]
    draw_connector(ax, (3.3, 7.0), (3.3, 6.15), color=COLOR_RED_LINE)

    # Người dùng chọn Đặt phòng / Đăng ký
    draw_user_action_box(ax, 2.6, 5.35, 1.5, 0.8, "Người dùng\nchọn Đặt phòng\n(Booking)")
    draw_connector(ax, (4.1, 5.75), (4.7, 5.75), color=COLOR_RED_LINE)

    # Hiển thị trang chọn phòng và điền Form
    draw_screen_box(ax, 4.7, 5.4, 1.5, 0.7, "Hiển thị trang\nchọn phòng và\nnhấn Submit")
    draw_connector(ax, (6.2, 5.75), (6.7, 5.75), color=COLOR_RED_LINE)

    # Trang Đặt phòng (Booking Modal)
    draw_screen_box(ax, 6.7, 5.4, 1.4, 0.7, "Trang Đặt cọc\n(Booking Modal)")
    draw_connector(ax, (8.1, 5.75), (8.7, 5.75), color=COLOR_RED_LINE)

    # Kiểm tra phòng trống (Diamond)
    draw_decision_diamond(ax, 8.7, 5.3, 1.4, 0.9, "Phòng trống\nhợp lệ?")

    # Error Loop for Row 2
    draw_error_circle(ax, 8.2, 4.65, 0.22, "Lỗi")
    draw_connector(ax, (9.4, 5.3), (8.45, 4.65), color=COLOR_RED_LINE, rad=0.1)
    draw_connector(ax, (7.95, 4.65), (7.4, 5.4), color=COLOR_RED_LINE, rad=0.1)

    # ==================== ROW 3 (Y: 3.5 - 4.3) ====================
    # Success branch from Row 1 & Row 2 down to [Trang chủ / Dashboard]
    draw_connector(ax, (10.1, 7.35), (10.5, 7.35), color=COLOR_GREEN_LINE)
    draw_connector(ax, (10.5, 7.35), (10.5, 3.85), color=COLOR_GREEN_LINE)
    draw_connector(ax, (10.5, 3.85), (10.0, 3.85), color=COLOR_GREEN_LINE)

    draw_connector(ax, (10.1, 5.75), (10.3, 5.75), color=COLOR_RED_LINE)
    draw_connector(ax, (10.3, 5.75), (10.3, 3.85), color=COLOR_RED_LINE)

    # Trang chủ / Dashboard
    draw_screen_box(ax, 8.6, 3.5, 1.4, 0.7, "Trang chủ /\nDashboard")
    draw_connector(ax, (8.6, 3.85), (7.9, 3.85), color=COLOR_GREEN_LINE)

    # Người dùng chọn Lọc từ Nav
    draw_user_action_box(ax, 6.4, 3.45, 1.5, 0.8, "Người dùng\nchọn 'Lọc / Tìm'\ntừ Navbar")
    draw_connector(ax, (6.4, 3.85), (5.7, 3.85), color=COLOR_GREEN_LINE)

    # Hiển thị trang Lọc & AI Matcher
    draw_screen_box(ax, 4.3, 3.5, 1.4, 0.7, "Hiển thị trang\nLọc & AI Matcher")
    draw_connector(ax, (4.3, 3.85), (3.6, 3.85), color=COLOR_GREEN_LINE)

    # Người dùng lọc phòng / Chat AI
    draw_user_action_box(ax, 2.1, 3.45, 1.5, 0.8, "Người dùng\nlọc căn hộ /\nChat AI Matcher")
    draw_connector(ax, (2.1, 3.85), (1.4, 3.85), color=COLOR_GREEN_LINE)

    # Hiển thị trang kết quả lọc
    draw_screen_box(ax, 0.0, 3.5, 1.4, 0.7, "Hiển thị trang\nkết quả lọc phòng")

    # ==================== ROW 4 (Y: 1.8 - 2.6) ====================
    # Arrow from [Hiển thị trang kết quả lọc] down to [Người dùng chọn căn hộ]
    draw_connector(ax, (0.7, 3.5), (0.7, 2.65), color=COLOR_GREEN_LINE)
    draw_connector(ax, (0.7, 2.65), (2.1, 2.65), color=COLOR_GREEN_LINE)

    # From Row 2 Booking -> Row 4
    draw_connector(ax, (9.4, 4.3), (9.2, 2.85), color=COLOR_RED_LINE, rad=0.2)
    draw_connector(ax, (9.2, 2.85), (3.6, 2.85), color=COLOR_RED_LINE)
    draw_connector(ax, (3.6, 2.85), (3.0, 2.65), color=COLOR_RED_LINE)

    # Người dùng chọn căn hộ
    draw_user_action_box(ax, 2.1, 2.25, 1.5, 0.8, "Người dùng\nchọn căn hộ\nưng ý")
    draw_connector(ax, (3.6, 2.65), (4.2, 2.65), color=COLOR_GREEN_LINE)

    # Hiển thị trang chi tiết căn hộ
    draw_screen_box(ax, 4.2, 2.3, 1.4, 0.7, "Hiển thị trang\nChi tiết Căn hộ\n(P.302)")
    draw_connector(ax, (5.6, 2.65), (6.2, 2.65), color=COLOR_GREEN_LINE)

    # Người dùng xem Hợp đồng / Thoát trang
    draw_user_action_box(ax, 6.2, 2.25, 1.5, 0.8, "Người dùng xem\nHĐ / Thanh toán\nhoặc thoát trang")
    draw_connector(ax, (7.7, 2.65), (8.5, 2.65), color=COLOR_GREEN_LINE)

    # Nút Kết thúc
    draw_end_pill(ax, 8.5, 2.35, 1.3, 0.6, "Kết thúc")

    # ==================== KEY / CHÚ THÍCH (Y: 0.2 - 1.2) ====================
    ax.text(0.6, 1.3, "KEY (CHÚ THÍCH KÝ HIỆU SƠ ĐỒ):", fontsize=9.0, fontweight='bold', color="#263238", fontname=FONT_FAMILY)

    # Key Item 1: Blue box
    draw_screen_box(ax, 0.6, 0.65, 1.2, 0.5, "")
    ax.text(1.2, 0.35, "Hiển thị trang", ha='center', fontsize=7.5, color="#37474F", fontname=FONT_FAMILY)

    # Key Item 2: Yellow box
    draw_user_action_box(ax, 2.3, 0.65, 1.2, 0.5, "")
    ax.text(2.9, 0.35, "Người dùng lựa chọn", ha='center', fontsize=7.5, color="#37474F", fontname=FONT_FAMILY)

    # Key Item 3: Orange diamond
    draw_decision_diamond(ax, 4.0, 0.65, 1.2, 0.5, "")
    ax.text(4.6, 0.35, "Máy tính / Hệ thống lựa chọn", ha='center', fontsize=7.5, color="#37474F", fontname=FONT_FAMILY)

    # Key Item 4: White circle
    draw_error_circle(ax, 6.1, 0.9, 0.22, "")
    ax.text(6.1, 0.35, "Thông báo lỗi", ha='center', fontsize=7.5, color="#37474F", fontname=FONT_FAMILY)

    # Key Item 5: Green arrow
    draw_connector(ax, (7.0, 0.9), (8.0, 0.9), color=COLOR_GREEN_LINE)
    ax.text(7.5, 0.35, "Luồng đi của người dùng\nđã đăng ký / Hợp lệ", ha='center', fontsize=7.0, color="#37474F", fontname=FONT_FAMILY)

    # Key Item 6: Red arrow
    draw_connector(ax, (8.7, 0.9), (9.7, 0.9), color=COLOR_RED_LINE)
    ax.text(9.2, 0.35, "Luồng đi của người dùng\nchưa đăng ký / Rẽ nhánh", ha='center', fontsize=7.0, color="#37474F", fontname=FONT_FAMILY)

    # Key Item 7: Dark pill
    draw_end_pill(ax, 10.3, 0.65, 1.1, 0.5, "")
    ax.text(10.85, 0.35, "Kết thúc luồng", ha='center', fontsize=7.5, color="#37474F", fontname=FONT_FAMILY)

    plt.tight_layout()
    plt.savefig(OUT_IMG, dpi=300, bbox_inches='tight')
    plt.close()
    print("Screen Flow Image rendered at:", OUT_IMG)

def build_drawio_xml():
    import build_multipage_drawio
    xml_content = build_multipage_drawio.build_full_xml()
    with open(OUT_DRAWIO, "w", encoding="utf-8") as f:
        f.write(xml_content)
    with open(OUT_DRAWIO_ALT, "w", encoding="utf-8") as f:
        f.write(xml_content)
    print("Draw.io XML saved at:", OUT_DRAWIO)
    print("Draw.io XML saved at:", OUT_DRAWIO_ALT)
    return xml_content

def generate_drawio_url(xml_str):
    deflated = zlib.compress(xml_str.encode('utf-8'))[2:-4]
    b64 = base64.b64encode(deflated).decode('ascii')
    url = f"https://app.diagrams.net/#R{urllib.parse.quote(b64)}"
    return url

if __name__ == "__main__":
    render_screenflow_image()
    xml = build_drawio_xml()
    url = generate_drawio_url(xml)
    print("DRAWIO_URL_START")
    print(url)
    print("DRAWIO_URL_END")
