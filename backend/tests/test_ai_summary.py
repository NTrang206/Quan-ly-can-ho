from app.services import ai_service


def test_ai_summary_five_mandatory_clauses():
    """Kiểm tra yêu cầu bắt buộc tóm tắt đúng 5 điều khoản cốt lõi theo Đề tài 12"""
    required_clauses = [
        "thời hạn",
        "tiền thuê",
        "tiền cọc",
        "nghĩa vụ thanh toán",
        "điều kiện chấm dứt",
    ]
    
    sample_contract = """
    HỢP ĐỒNG THUÊ CĂN HỘ P101
    1. Thời hạn thuê: 12 tháng từ ngày 01/01/2026 đến 31/12/2026.
    2. Giá thuê: 12.000.000 VNĐ/tháng.
    3. Tiền đặt cọc: 24.000.000 VNĐ.
    4. Nghĩa vụ thanh toán: Thanh toán trước ngày 10 hàng tháng qua VietQR.
    5. Điều kiện chấm dứt: Báo trước 30 ngày bằng văn bản.
    """
    
    captured = {}
    def mock_generate(prompt):
        captured["prompt"] = prompt
        return "Bản tóm tắt 5 điều khoản hợp lệ"
    
    original_fn = ai_service.generate_text
    ai_service.generate_text = mock_generate
    
    try:
        res = ai_service.summarize_contract_text(sample_contract)
        assert res == "Bản tóm tắt 5 điều khoản hợp lệ"
        
        # Kiểm tra prompt tuân thủ nghiêm ngặt prompt mẫu của Đề tài 12
        prompt = captured["prompt"]
        assert "không tư vấn pháp lý" in prompt
        assert "thời hạn, tiền thuê, tiền cọc, nghĩa vụ thanh toán, điều kiện chấm dứt" in prompt
        assert "Không tự suy đoán" in prompt
        assert "Hợp đồng:" in prompt
    finally:
        ai_service.generate_text = original_fn


def test_ai_dunning_draft_generation():
    """Kiểm tra AI sinh thông báo nhắc nợ/nhắc hạn không thay đổi số liệu"""
    alert_msg = "Căn hộ P202 quá hạn 12 ngày. Số nợ cần thu: 21,100,000 VNĐ."
    
    captured = {}
    def mock_generate(prompt):
        captured["prompt"] = prompt
        return "Kính gửi quý cư dân căn P202, số nợ quá hạn 12 ngày là 21,100,000 VNĐ..."
    
    original_fn = ai_service.generate_text
    ai_service.generate_text = mock_generate
    
    try:
        draft = ai_service.generate_alert_draft(alert_msg)
        assert "21,100,000 VNĐ" in draft
        prompt = captured["prompt"]
        assert "Không thay đổi số tiền" in prompt
        assert "Không thay đổi ngày tháng" in prompt
    finally:
        ai_service.generate_text = original_fn
