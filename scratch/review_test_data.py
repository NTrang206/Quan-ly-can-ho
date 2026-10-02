import sys
import json
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open(r'd:\Detai12_QLCH\scratch\test_results.json', encoding='utf-8'))
print(f"Total test cases: {len(data)}\n")

for i, tc in enumerate(data):
    print(f"{i+1:02d}. [{tc['test_id']}] [{tc['feature']}]")
    print(f"    Mô tả: {tc['description']}")
    print(f"    Tiền điều kiện: {tc['precondition']}")
    print(f"    Dữ liệu test: {tc['test_data']}")
    print(f"    Kỳ vọng: {tc['expected']}")
    print(f"    Thực tế: {tc['actual']} -> {tc['passed']} (Mức độ: {tc['severity']})")
    print(f"    Ghi chú: {tc['note']}")
    print("-" * 60)
