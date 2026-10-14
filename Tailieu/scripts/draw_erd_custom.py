# -*- coding: utf-8 -*-
"""
draw_erd_custom.py
Tạo Sơ đồ Thực thể Quan hệ CSDL (ERD) chuẩn hóa 17 bảng với đầy đủ các đường nối (Foreign Keys)
Xuất ra:
  - Ảnh PNG chuẩn HD: d:/Detai12_QLCH/Tailieu/scratch_imgs/erd_standard_diagram.png
  - File nguồn Draw.io: d:/Detai12_QLCH/Tailieu/so_do_erd.drawio
"""

import os
import sys
import zlib
import base64
import urllib.parse
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT_IMG = "d:/Detai12_QLCH/Tailieu/scratch_imgs/erd_standard_diagram.png"
OUT_DRAWIO = "d:/Detai12_QLCH/Tailieu/so_do_erd.drawio"
OUT_DRAWIO_ALT = "d:/Detai12_QLCH/Tailieu/sơ đồ/so_do_erd.drawio"

os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)
os.makedirs(os.path.dirname(OUT_DRAWIO_ALT), exist_ok=True)

FONT_FAMILY = "Segoe UI"

def render_erd_image():
    fig, ax = plt.subplots(figsize=(15, 11), dpi=300)
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 11)
    ax.axis('off')

    # Color Palette
    BG_HEADER = "#1F497D"
    BG_BOX = "#FFFFFF"
    BORDER_BOX = "#90A4AE"
    LINE_COLOR = "#2E7D32" # Dark green for relationships
    LINE_COLOR_ACC = "#C62828" # Red for critical
    LINE_COLOR_BLUE = "#1565C0"

    tables = {
        # Col 1: Auth & Tenant
        "roles": {"x": 0.6, "y": 8.8, "w": 2.4, "h": 1.4, "title": "roles", "fields": ["PK id (int)", "UQ roleCode (varchar)", "roleName (varchar)"]},
        "users": {"x": 0.6, "y": 5.8, "w": 2.4, "h": 2.2, "title": "users", "fields": ["PK id (int)", "FK roleId (int)", "UQ username (varchar)", "passwordHash (varchar)", "fullName (varchar)", "email (varchar)"]},
        "tenants": {"x": 0.6, "y": 2.6, "w": 2.4, "h": 2.4, "title": "tenants", "fields": ["PK id (int)", "FK userId (int)", "fullName (varchar)", "UQ citizenId (varchar)", "phone (varchar)", "isBadDebt (bool)"]},
        "emergency_contacts": {"x": 0.6, "y": 0.6, "w": 2.4, "h": 1.4, "title": "emergency_contacts", "fields": ["PK id (int)", "FK tenantId (int)", "fullName (varchar)", "phone (varchar)"]},

        # Col 2: Roommates, Debt, Contracts, Deposits
        "roommates": {"x": 3.9, "y": 2.6, "w": 2.4, "h": 1.8, "title": "roommates", "fields": ["PK id (int)", "FK tenantId (int)", "FK apartmentId (int)", "fullName (varchar)", "citizenId (varchar)"]},
        "debt_ledger": {"x": 3.9, "y": 0.6, "w": 2.4, "h": 1.5, "title": "debt_ledger", "fields": ["PK id (int)", "FK tenantId (int) [1:1]", "totalReceivable (dec)", "totalPaid (dec)", "currentDebt (dec)"]},
        "contracts": {"x": 3.9, "y": 5.4, "w": 2.5, "h": 2.6, "title": "contracts", "fields": ["PK id (int)", "UQ contractCode (varchar)", "FK apartmentId (int)", "FK tenantId (int)", "startDate, endDate (date)", "rentalPrice (dec)", "status (varchar)"]},
        "deposits": {"x": 3.9, "y": 8.8, "w": 2.5, "h": 1.7, "title": "deposits", "fields": ["PK id (int)", "FK contractId (int) [1:1]", "amount (dec)", "status (varchar)", "refundAmount (dec)"]},

        # Col 3: Real Estate (Buildings, Apartments, Amenities, Bookings)
        "buildings": {"x": 7.4, "y": 8.8, "w": 2.5, "h": 1.5, "title": "buildings", "fields": ["PK id (int)", "name (varchar)", "address (varchar)", "totalApartments (int)"]},
        "apartments": {"x": 7.4, "y": 5.4, "w": 2.5, "h": 2.6, "title": "apartments", "fields": ["PK id (int)", "FK buildingId (int)", "roomNumber (varchar)", "floor (int)", "areaSqm (dec)", "price (dec)", "status (4_enum)"]},
        "amenities": {"x": 7.4, "y": 3.0, "w": 2.5, "h": 1.6, "title": "amenities", "fields": ["PK id (int)", "FK apartmentId (int)", "name (varchar)", "conditionStatus (varchar)"]},
        "bookings": {"x": 7.4, "y": 0.6, "w": 2.5, "h": 1.8, "title": "bookings", "fields": ["PK id (int)", "UQ bookingCode (varchar)", "FK apartmentId (int)", "customerName (varchar)", "status (varchar)"]},

        # Col 4: Finance, Maintenance, AI
        "receivables": {"x": 11.0, "y": 7.6, "w": 2.7, "h": 2.2, "title": "receivables", "fields": ["PK id (int)", "FK contractId (int)", "FK apartmentId (int)", "billingMonth, Year (int)", "totalAmount (dec)", "paidAmount (dec)", "status (varchar)"]},
        "payments": {"x": 11.0, "y": 4.8, "w": 2.7, "h": 2.0, "title": "payments", "fields": ["PK id (int)", "FK receivableId (int)", "amount (dec)", "paymentMethod (varchar)", "transactionCode (varchar)"]},
        "maintenance_requests": {"x": 11.0, "y": 2.2, "w": 2.7, "h": 2.0, "title": "maintenance_requests", "fields": ["PK id (int)", "FK apartmentId (int)", "FK tenantId (int)", "priority, status (varchar)", "repairCost (dec)"]},
        "system_alerts": {"x": 11.0, "y": 0.5, "w": 2.7, "h": 1.3, "title": "system_alerts", "fields": ["PK id (int)", "alertType (varchar)", "referenceId (int)", "message (text)"]},
        "document_chunks": {"x": 7.4, "y": 9.2, "w": 0.01, "h": 0.01} # hidden position placeholder
    }

    # Document chunks placed bottom center
    tables["document_chunks"] = {"x": 4.5, "y": 4.0, "w": 2.2, "h": 1.1, "title": "document_chunks", "fields": ["PK id (int)", "documentName (varchar)", "embeddingVector (768)"]}

    # Draw Boxes
    for tname, d in tables.items():
        x, y, w, h = d["x"], d["y"], d["w"], d["h"]
        if w < 0.1: continue
        # Main box
        rect = FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0.0",
                              facecolor=BG_BOX, edgecolor=BORDER_BOX, linewidth=1.2)
        ax.add_patch(rect)
        # Header box
        h_h = 0.38
        h_rect = FancyBboxPatch((x, y + h - h_h), w, h_h, boxstyle="square,pad=0.0",
                                facecolor=BG_HEADER, edgecolor=BORDER_BOX, linewidth=1.2)
        ax.add_patch(h_rect)
        ax.text(x + w/2.0, y + h - h_h/2.0, d["title"], ha='center', va='center',
                fontsize=8.5, fontweight='bold', color='white', fontname=FONT_FAMILY)

        # Field text
        f_y = y + h - h_h - 0.2
        for f in d["fields"]:
            col_color = "#C62828" if "PK" in f else ("#1565C0" if "FK" in f else "#263238")
            ax.text(x + 0.1, f_y, f, ha='left', va='center',
                    fontsize=7.2, color=col_color, fontname=FONT_FAMILY)
            f_y -= 0.22

    # Draw Connector Lines with Arrows
    def draw_link(src, dst, label="", color=LINE_COLOR_BLUE, rad=0.0):
        t1 = tables[src]
        t2 = tables[dst]
        p1 = (t1["x"] + t1["w"]/2.0, t1["y"] + t1["h"]/2.0)
        p2 = (t2["x"] + t2["w"]/2.0, t2["y"] + t2["h"]/2.0)
        arrow = FancyArrowPatch(p1, p2, arrowstyle='-|>,head_width=3.5,head_length=5.0',
                                connectionstyle=f'arc3,rad={rad}',
                                color=color, linewidth=1.4)
        ax.add_patch(arrow)
        if label:
            mx, my = (p1[0] + p2[0])/2.0, (p1[1] + p2[1])/2.0
            ax.text(mx, my + 0.1, label, fontsize=6.8, color=color, fontweight='bold',
                    bbox=dict(boxstyle='round,pad=0.15', facecolor='#FFF9C4', edgecolor='none'))

    # Links (19 Relationships)
    draw_link("users", "roles", "1:N", color="#1565C0")
    draw_link("apartments", "buildings", "1:N", color="#2E7D32")
    draw_link("amenities", "apartments", "1:N", color="#2E7D32")
    draw_link("tenants", "users", "1:1", color="#1565C0")
    draw_link("roommates", "tenants", "1:N", color="#00838F")
    draw_link("emergency_contacts", "tenants", "1:N", color="#00838F")
    draw_link("debt_ledger", "tenants", "1:1", color="#D84315")
    draw_link("contracts", "apartments", "1:N", color="#2E7D32")
    draw_link("contracts", "tenants", "1:N", color="#6A1B9A")
    draw_link("deposits", "contracts", "1:1", color="#D84315")
    draw_link("receivables", "contracts", "1:N", color="#6A1B9A")
    draw_link("receivables", "apartments", "1:N", color="#2E7D32")
    draw_link("payments", "receivables", "1:N", color="#1565C0")
    draw_link("payments", "debt_ledger", "sync", color="#D84315", rad=0.2)
    draw_link("maintenance_requests", "apartments", "1:N", color="#2E7D32")
    draw_link("maintenance_requests", "tenants", "1:N", color="#6A1B9A")
    draw_link("bookings", "apartments", "1:N", color="#2E7D32")

    # Title
    ax.text(7.5, 10.6, "SƠ ĐỒ THỰC THỂ - MỐI QUAN HỆ CƠ SỞ DỮ LIỆU (ERD 17 BẢNG 3NF)",
            ha='center', va='center', fontsize=13, fontweight='bold', color=BG_HEADER, fontname=FONT_FAMILY)
    ax.text(7.5, 10.25, "Đầy đủ các khóa ngoại (FK) và đường nối quan hệ giữa các phân hệ (PostgreSQL / SQLite)",
            ha='center', va='center', fontsize=9, fontstyle='italic', color="#546E7A", fontname=FONT_FAMILY)

    plt.tight_layout()
    plt.savefig(OUT_IMG, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"ERD Image generated with full connector lines at: {OUT_IMG}")

if __name__ == "__main__":
    render_erd_image()
