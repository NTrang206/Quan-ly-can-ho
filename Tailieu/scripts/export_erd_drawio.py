# -*- coding: utf-8 -*-
"""
export_erd_drawio.py
Tạo tệp nguồn so_do_erd.drawio chuẩn XML 100% bằng xml.etree.ElementTree
Đảm bảo mở trên Draw.io (Diagrams.net) không bao giờ bị lỗi cú pháp!
"""
import os
import sys
import json
import zlib
import base64
import urllib.parse
import xml.etree.ElementTree as ET

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def generate_erd_drawio():
    schema_path = r"d:\Detai12_QLCH\Tailieu\scripts\doc4_schema.json"
    with open(schema_path, "r", encoding="utf-8") as f:
        db_schema = json.load(f)

    layout = {
        'roles': (60, 90, 220, 130),
        'users': (60, 280, 220, 220),
        'tenants': (60, 560, 220, 210),
        'emergency_contacts': (60, 820, 220, 130),

        'deposits': (360, 90, 230, 170),
        'contracts': (360, 310, 230, 230),
        'roommates': (360, 590, 230, 160),
        'debt_ledger': (360, 800, 230, 140),

        'buildings': (670, 90, 230, 140),
        'apartments': (670, 290, 230, 240),
        'amenities': (670, 580, 230, 150),
        'bookings': (670, 780, 230, 180),

        'receivables': (980, 100, 240, 220),
        'payments': (980, 370, 240, 180),
        'maintenance_requests': (980, 600, 240, 210),
        'system_alerts': (980, 860, 240, 140),

        'document_chunks': (520, 990, 260, 130)
    }

    edges = [
        ('users', 'roles', 'N..1 (roleId)', '#1565C0'),
        ('apartments', 'buildings', 'N..1 (buildingId)', '#2E7D32'),
        ('amenities', 'apartments', 'N..1 (apartmentId)', '#2E7D32'),
        ('tenants', 'users', '1..1 (userId)', '#1565C0'),
        ('roommates', 'tenants', 'N..1 (tenantId)', '#00838F'),
        ('emergency_contacts', 'tenants', 'N..1 (tenantId)', '#00838F'),
        ('contracts', 'apartments', 'N..1 (apartmentId)', '#2E7D32'),
        ('contracts', 'tenants', 'N..1 (tenantId)', '#6A1B9A'),
        ('contracts', 'bookings', '1..1 (bookingId)', '#EF6C00'),
        ('deposits', 'contracts', '1..1 (contractId)', '#D84315'),
        ('receivables', 'contracts', 'N..1 (contractId)', '#6A1B9A'),
        ('receivables', 'apartments', 'N..1 (apartmentId)', '#2E7D32'),
        ('payments', 'receivables', 'N..1 (receivableId)', '#1565C0'),
        ('debt_ledger', 'tenants', '1..1 (tenantId)', '#D84315'),
        ('maintenance_requests', 'apartments', 'N..1 (apartmentId)', '#2E7D32'),
        ('maintenance_requests', 'tenants', 'N..1 (tenantId)', '#6A1B9A'),
        ('bookings', 'apartments', 'N..1 (apartmentId)', '#2E7D32'),
    ]

    # Build XML with ElementTree
    root = ET.Element('mxfile', {
        'host': 'app.diagrams.net',
        'modified': '2026-10-03T11:00:00.000Z',
        'agent': '5.0',
        'version': '21.0.0',
        'type': 'device'
    })

    diagram = ET.SubElement(root, 'diagram', {
        'id': 'erd_17_tables',
        'name': 'ERD_PostgreSQL_17Tables'
    })

    model = ET.SubElement(diagram, 'mxGraphModel', {
        'dx': '1600',
        'dy': '1100',
        'grid': '1',
        'gridSize': '10',
        'guides': '1',
        'tooltips': '1',
        'connect': '1',
        'arrows': '1',
        'fold': '1',
        'page': '1',
        'pageScale': '1',
        'pageWidth': '1654',
        'pageHeight': '1169',
        'math': '0',
        'shadow': '0'
    })

    root_cell = ET.SubElement(model, 'root')
    ET.SubElement(root_cell, 'mxCell', {'id': '0'})
    ET.SubElement(root_cell, 'mxCell', {'id': '1', 'parent': '0'})

    # Title Box
    title_cell = ET.SubElement(root_cell, 'mxCell', {
        'id': 'title_box',
        'value': 'SƠ ĐỒ THỰC THỂ - MỐI QUAN HỆ CƠ SỞ DỮ LIỆU (ERD 17 BẢNG 3NF)\nHệ thống Quản lý thuê Căn hộ có tích hợp AI — CSDL PostgreSQL 16 (qlch_db)',
        'style': 'text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=15;fontStyle=1;fontColor=#1F497D;fontFamily=Segoe UI;',
        'vertex': '1',
        'parent': '1'
    })
    ET.SubElement(title_cell, 'mxGeometry', {
        'x': '300', 'y': '15', 'width': '700', 'height': '45', 'as': 'geometry'
    })

    # Add 17 Tables
    for tname, (x, y, w, h) in layout.items():
        fields = db_schema.get(tname, [])
        header_line = f"<b>{tname}</b><hr/>"
        field_lines = []
        for f in fields:
            fname = f['name']
            ftype = f['type']
            fconst = f['constraint']
            if 'PK' in fconst:
                prefix = "[PK] "
            elif 'FK' in fconst:
                prefix = "[FK] "
            elif 'UQ' in fconst:
                prefix = "[UQ] "
            else:
                prefix = "  "
            field_lines.append(f"{prefix}{fname}: {ftype}")

        val_content = header_line + "<br/>".join(field_lines)

        tbl_node = ET.SubElement(root_cell, 'mxCell', {
            'id': f"tbl_{tname}",
            'value': val_content,
            'style': 'rounded=1;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=8;spacingTop=6;fillColor=#FFFFFF;strokeColor=#1F497D;strokeWidth=1.5;shadow=1;fontFamily=Segoe UI;fontSize=10;',
            'vertex': '1',
            'parent': '1'
        })
        ET.SubElement(tbl_node, 'mxGeometry', {
            'x': str(x), 'y': str(y), 'width': str(w), 'height': str(h), 'as': 'geometry'
        })

    # Add 17 Edges (Connecting Lines)
    for idx, (src, dst, lbl, col) in enumerate(edges, 1):
        edge_style = (
            f"edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;"
            f"strokeColor={col};strokeWidth=1.5;endArrow=classic;endFill=1;"
            f"labelBackgroundColor=#FFF9C4;fontColor={col};fontSize=9;fontStyle=1;fontFamily=Segoe UI;"
        )
        edge_cell = ET.SubElement(root_cell, 'mxCell', {
            'id': f"edge_{idx}",
            'value': lbl,
            'style': edge_style,
            'edge': '1',
            'parent': '1',
            'source': f"tbl_{src}",
            'target': f"tbl_{dst}"
        })
        ET.SubElement(edge_cell, 'mxGeometry', {'relative': '1', 'as': 'geometry'})

    # Generate XML String
    xml_bytes = ET.tostring(root, encoding='utf-8', xml_declaration=True)
    xml_str = xml_bytes.decode('utf-8')

    out_file1 = r"d:\Detai12_QLCH\Tailieu\so_do_erd.drawio"
    out_file2 = r"d:\Detai12_QLCH\Tailieu\sơ đồ\so_do_erd.drawio"

    with open(out_file1, "wb") as f:
        f.write(xml_bytes)

    os.makedirs(os.path.dirname(out_file2), exist_ok=True)
    with open(out_file2, "wb") as f:
        f.write(xml_bytes)

    # Generate Draw.io URL
    deflated = zlib.compress(xml_bytes)[2:-4]
    b64 = base64.b64encode(deflated).decode('ascii')
    url = f"https://app.diagrams.net/#R{urllib.parse.quote(b64)}"

    with open(r"d:\Detai12_QLCH\Tailieu\scripts\drawio_erd_url.txt", "w", encoding="utf-8") as f:
        f.write(url)

    # Validate generated XML by parsing back
    ET.fromstring(xml_bytes)
    print("SUCCESS: Validated 100% well-formed XML for Draw.io!")
    print(f"File 1: {out_file1}")
    print(f"File 2: {out_file2}")
    print("URL Length:", len(url))

if __name__ == "__main__":
    generate_erd_drawio()
