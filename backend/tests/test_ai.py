from app.services import ai_service


def test_split_into_chunks_preserves_content():
    chunks = ai_service.split_into_chunks(
        "một hai ba bốn năm sáu bảy tám",
        words_per_chunk=4,
        overlap_words=1
    )

    assert chunks[0] == "một hai ba bốn"
    assert chunks[1] == "bốn năm sáu bảy"
    assert chunks[-1].endswith("tám")


def test_contract_summary_prompt_is_reviewable(monkeypatch):
    captured = {}

    def fake_generate_text(prompt):
        captured["prompt"] = prompt
        return "Bản nháp tóm tắt"

    monkeypatch.setattr(
        ai_service,
        "generate_text",
        fake_generate_text
    )

    result = ai_service.summarize_contract_text(
        "Tiền thuê 10 triệu, tiền cọc 20 triệu."
    )

    assert result == "Bản nháp tóm tắt"
    assert "Không tự suy đoán" in captured["prompt"]
    assert "NỘI DUNG HỢP ĐỒNG" in captured["prompt"]


def test_rag_answer_prompt_is_context_bound(monkeypatch):
    captured = {}

    def fake_generate_text(prompt):
        captured["prompt"] = prompt
        return "Câu trả lời"

    monkeypatch.setattr(
        ai_service,
        "generate_text",
        fake_generate_text
    )

    result = ai_service.generate_rag_answer(
        "Giờ đổ rác?",
        [{
            "document_name": "noi-quy.txt",
            "chunk_index": 2,
            "content": "Đổ rác từ 18:00 đến 20:00."
        }]
    )

    assert result == "Câu trả lời"
    assert "Chỉ trả lời dựa trên NGỮ CẢNH" in captured["prompt"]
    assert "Đổ rác từ 18:00 đến 20:00" in captured["prompt"]
