import time
from io import BytesIO

from google import genai
from google.genai import types

from pypdf import PdfReader
from docx import Document


from app.core.config import settings


def get_gemini_client():

    if not settings.gemini_api_key:
        raise RuntimeError(
            "Chưa cấu hình GEMINI_API_KEY trong .env"
        )

    return genai.Client(
        api_key=settings.gemini_api_key
    )


# =========================================================
# SINH TEXT
# =========================================================
def generate_text(
    prompt: str
):

    client = get_gemini_client()

    models = [
        settings.gemini_model,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite"
    ]

    last_error = None

    for model_name in models:

        for attempt in range(2):

            try:

                response = (
                    client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                )

                if (
                    response.text
                    and response.text.strip()
                ):
                    return response.text.strip()

            except Exception as exc:

                last_error = exc

                error_text = str(exc)

                if (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                    or "high demand" in error_text
                ):
                    time.sleep(
                        attempt + 1
                    )
                    continue

                break

    raise RuntimeError(
        f"Gemini tạm thời không khả dụng: "
        f"{last_error}"
    )

# =========================================================
# EMBEDDING 768 CHIỀU
# =========================================================
def create_embedding(
    text: str
):

    client = get_gemini_client()

    response = client.models.embed_content(
        model=settings.gemini_embed_model,

        contents=text,

        config=types.EmbedContentConfig(
            output_dimensionality=768
        )
    )

    if not response.embeddings:
        raise RuntimeError(
            "Gemini không trả về embedding"
        )

    vector = response.embeddings[0].values

    if vector is None:
        raise RuntimeError(
            "Embedding không hợp lệ"
        )

    if len(vector) != 768:
        raise RuntimeError(
            f"Embedding có {len(vector)} chiều, "
            f"yêu cầu 768 chiều"
        )

    return list(vector)


# =========================================================
# ĐỌC FILE
# =========================================================
def extract_document_text(
    filename: str,
    file_bytes: bytes
):

    filename_lower = filename.lower()

    # PDF
    if filename_lower.endswith(".pdf"):

        reader = PdfReader(
            BytesIO(file_bytes)
        )

        pages = []

        for page in reader.pages:

            text = page.extract_text() or ""

            if text.strip():
                pages.append(text)

        return "\n".join(pages).strip()

    # DOCX
    if filename_lower.endswith(".docx"):

        document = Document(
            BytesIO(file_bytes)
        )

        paragraphs = []

        for paragraph in document.paragraphs:

            text = paragraph.text.strip()

            if text:
                paragraphs.append(text)

        return "\n".join(
            paragraphs
        ).strip()

    # TXT
    if filename_lower.endswith(".txt"):

        return file_bytes.decode(
            "utf-8",
            errors="ignore"
        ).strip()

    raise ValueError(
        "Chỉ hỗ trợ PDF, DOCX hoặc TXT"
    )


# =========================================================
# CHIA CHUNK
# =========================================================
def split_into_chunks(
    text: str,
    words_per_chunk: int = 350,
    overlap_words: int = 50
):

    words = text.split()

    if not words:
        return []

    chunks = []

    start = 0

    while start < len(words):

        end = min(
            start + words_per_chunk,
            len(words)
        )

        chunk = " ".join(
            words[start:end]
        ).strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(words):
            break

        start = max(
            end - overlap_words,
            start + 1
        )

    return chunks


# =========================================================
# TÓM TẮT HỢP ĐỒNG
# =========================================================
def summarize_contract_text(
    contract_text: str
):

    prompt = f"""
Bạn là trợ lý AI của hệ thống quản lý thuê căn hộ.

Chỉ sử dụng nội dung hợp đồng được cung cấp.

Hãy tóm tắt chính xác 5 mục:

1. Thời hạn hợp đồng
2. Tiền thuê
3. Tiền cọc
4. Nghĩa vụ thanh toán
5. Điều kiện chấm dứt hợp đồng

Quy tắc:
- Không tự suy đoán.
- Không thêm điều khoản.
- Không sửa số tiền hoặc ngày tháng.
- Nếu không tìm thấy thông tin,
  ghi "Không tìm thấy trong tài liệu".
- Đây chỉ là bản nháp để người dùng kiểm duyệt.

NỘI DUNG HỢP ĐỒNG:

{contract_text}
"""

    return generate_text(
        prompt
    )


# =========================================================
# SOẠN THÔNG BÁO
# =========================================================
def generate_alert_draft(
    alert_message: str
):

    prompt = f"""
Bạn là trợ lý AI của hệ thống quản lý thuê căn hộ.

Hãy soạn một tin nhắn tiếng Việt ngắn gọn,
lịch sự dựa đúng vào cảnh báo sau:

{alert_message}

Quy tắc:
- Không thay đổi số tiền.
- Không thay đổi ngày tháng.
- Không bịa dữ liệu.
- Đây chỉ là bản nháp.
- Không tuyên bố rằng tin nhắn đã được gửi.
"""

    return generate_text(
        prompt
    )


# =========================================================
# RAG
# =========================================================
def generate_rag_answer(
    question: str,
    contexts: list[dict]
):

    context_text = ""

    for context in contexts:

        context_text += (
            "\n--------------------\n"
            f"Nguồn: {context['document_name']}\n"
            f"Đoạn: {context['chunk_index']}\n"
            f"{context['content']}\n"
        )

    prompt = f"""
Bạn là chatbot tra cứu nội quy tòa nhà.

QUY TẮC:

1. Chỉ trả lời dựa trên NGỮ CẢNH.
2. Không sử dụng kiến thức bên ngoài.
3. Không suy đoán.
4. Không bịa đặt.
5. Nếu ngữ cảnh không đủ, trả lời:

"Nội quy không đề cập đến vấn đề này.
Vui lòng liên hệ nhân viên hỗ trợ."

6. Khi trả lời phải nêu nguồn tài liệu
và đoạn được sử dụng.

NGỮ CẢNH:

{context_text}

CÂU HỎI:

{question}
"""

    return generate_text(
        prompt
    )