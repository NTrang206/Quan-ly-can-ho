import sys
sys.stdout.reconfigure(encoding='utf-8')
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

doc_path = r"d:\Detai12_QLCH\Tailieu\05_GenAI_SoftwareDevelopment_functional-testing.docx"
doc = docx.Document(doc_path)

print("Paragraphs count:", len(doc.paragraphs))
for i, p in enumerate(doc.paragraphs):
    if p.text.strip():
        runs_info = [(r.text, r.font.name, r.font.size.pt if r.font.size else None, r.font.bold) for r in p.runs]
        print(f"P{i}: '{p.text[:60]}' | Style: {p.style.name} | Runs: {runs_info[:2]}")

print("\nTables count:", len(doc.tables))
for i, t in enumerate(doc.tables):
    print(f"\n--- Table {i} ({len(t.rows)} rows, {len(t.columns)} cols) ---")
    for r_idx in range(min(3, len(t.rows))):
        row = t.rows[r_idx]
        cell_texts = [c.text.strip().replace('\n', ' ') for c in row.cells]
        print(f"  Row {r_idx}: {cell_texts}")
        # inspect first cell runs formatting
        if row.cells[0].paragraphs and row.cells[0].paragraphs[0].runs:
            r = row.cells[0].paragraphs[0].runs[0]
            print(f"    Cell(0,0) font: {r.font.name}, {r.font.size.pt if r.font.size else 'None'}pt, bold={r.font.bold}")
