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
# TÓM TẮT HỢP ĐỒNG (Bám sát đề tài 12 - Prompt mẫu chuẩn)
# =========================================================
def summarize_contract_text(
    contract_text: str
):
    prompt = f"""System: Bạn là trợ lý quản lý căn hộ. Chỉ tóm tắt điều khoản từ hợp đồng được cung cấp, không tư vấn pháp lý.
User: Hãy tóm tắt hợp đồng sau thành các mục: thời hạn, tiền thuê, tiền cọc, nghĩa vụ thanh toán, điều kiện chấm dứt.

Quy tắc:
1. Thời hạn hợp đồng: Nêu rõ ngày bắt đầu, ngày kết thúc và thời hạn báo trước khi gia hạn.
2. Tiền thuê: Nêu rõ mức giá thuê/tháng và phương thức thanh toán.
3. Tiền cọc: Nêu rõ số tiền đặt cọc bảo đảm.
4. Nghĩa vụ thanh toán: Nêu rõ kỳ hạn thanh toán định kỳ hàng tháng.
5. Điều kiện chấm dứt: Nêu rõ điều kiện thông báo trước và bàn giao phòng.
- Không tự suy đoán, không thêm điều khoản ngoài tài liệu.
- Không thay đổi số tiền hay ngày tháng.

Hợp đồng:
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


# =========================================================
# TRỢ LÝ AI TOÀN NĂNG (KHÔNG TRUY CẬP CƠ SỞ DỮ LIỆU)
# =========================================================
def generate_ai_chat_answer(question: str) -> str:
    prompt = f"""
Bạn là Trợ lý AI thông minh, tận tâm và chu đáo của hệ thống Dwell Living.

YÊU CẦU HOẠT ĐỘNG:
1. KHẢ NĂNG TRẢ LỜI ĐA DẠNG & TOÀN DIỆN:
   - Bạn có thể trả lời TẤT CẢ các câu hỏi của người dùng: từ nội quy chung cư, quy định sinh hoạt, giờ chuyển đồ thang máy, nuôi thú cưng, khoan đục sửa chữa, gửi xe, phòng cháy chữa cháy, thủ tục cư dân, cho đến các câu hỏi kiến thức đời sống, khoa học, tính toán, nấu ăn, công nghệ, tư vấn sinh hoạt thường ngày...
   - Luôn giải đáp rõ ràng, chi tiết, hữu ích, không từ chối các câu hỏi thông thường.

2. CÁC QUY CHUẨN THÔNG THƯỜNG TẠI CHUNG CƯ (DÙNG ĐỂ TƯ VẤN):
   - Giờ được phép chuyển đồ thang máy:
     + Khung giờ cho phép: Sáng từ 08:30 đến 11:30; Chiều từ 13:30 đến 17:00 (từ Thứ Hai đến Thứ Bảy).
     + Khung giờ hạn chế/cấm chuyển đồ cồng kềnh: Giờ cao điểm cư dân đi lại (07:00 - 08:30 và 17:30 - 19:30), giờ nghỉ trưa (11:30 - 13:30), và ban đêm sau 21:00. Vào Chủ Nhật và ngày lễ chỉ chuyển đồ nhẹ và cần tránh gây ồn ào.
     + Lưu ý cư dân: Cần liên hệ đăng ký trước với Ban Quản Lý hoặc Lễ tân để được bố trí thang máy hàng (thang tải hàng chuyên dụng) và bọc lót bảo vệ cabin thang máy chống va đập.
   - Thú cưng (Chó, mèo): Cho phép vật nuôi nhỏ dưới 10kg, tiêm chủng phòng dại đầy đủ, có dây xích/rọ mõm khi ra khỏi căn hộ đến sảnh hoặc thang máy.
   - Sửa chữa / Khoan đục tiếng ồn: Từ 08:00 - 11:30 và 13:30 - 17:00 ngày thường, cấm Chủ Nhật và các ngày nghỉ lễ.
   - Phí gửi xe tham khảo: Xe máy ~120.000đ/tháng, Ô tô ~1.200.000 - 1.500.000đ/tháng.

3. TUYỆT ĐỐI KHÔNG TRUY CẬP CƠ SỞ DỮ LIỆU (CSDL):
   - Bạn KHÔNG có quyền và KHÔNG được phép truy cập vào cơ sở dữ liệu (CSDL) nội bộ của hệ thống (CSDL cư dân, danh sách tài khoản, mật khẩu, hợp đồng riêng tư, số dư tài chính cá nhân trong CSDL).
   - Nếu người dùng yêu cầu truy cập, trích xuất dữ liệu nhạy cảm hoặc can thiệp CSDL nội bộ, hãy lịch sự từ chối: "Vì lý do an toàn bảo mật và bảo vệ quyền riêng tư, Trợ lý AI không được phép truy cập vào cơ sở dữ liệu (CSDL) nội bộ của hệ thống. Bạn vui lòng kiểm tra tại tài khoản cá nhân trên cổng cư dân hoặc liên hệ trực tiếp Ban Quản Lý nhé!"

4. PHONG CÁCH TRẢ LỜI:
   - Thân thiện, lịch sự, sử dụng Markdown (in đậm, danh sách gạch đầu dòng) để câu trả lời sáng rõ, dễ đọc.

CÂU HỎI CỦA NGƯỜI DÙNG:
{question}
"""
    try:
        return generate_text(prompt)
    except Exception:
        q_lower = question.lower()
        if any(k in q_lower for k in ["chuyển đồ", "thang máy", "chuyen do", "thang may"]):
            return (
                "**Quy định về thời gian chuyển đồ bằng thang máy:**\n\n"
                "- **Khung giờ được phép chuyển đồ:**\n"
                "  + **Buổi sáng:** Từ **08:30** đến **11:30**\n"
                "  + **Buổi chiều:** Từ **13:30** đến **17:00**\n"
                "  *(Áp dụng từ Thứ Hai đến Thứ Bảy)*\n\n"
                "- **Khung giờ không được chuyển đồ cồng kềnh:** Giờ cao điểm (07:00 - 08:30 và 17:30 - 19:30), giờ nghỉ trưa (11:30 - 13:30), và ban đêm sau 21:00.\n"
                "- **Lưu ý quan trọng:** Cư dân cần đăng ký trước với Ban Quản Lý hoặc Lễ tân để được bố trí bọc lót bảo vệ thang máy tải hàng và hỗ trợ mở khóa thẻ kỹ thuật."
            )
        elif any(k in q_lower for k in ["chó", "mèo", "thú cưng", "pet", "thu cung"]):
            return (
                "**Quy định về việc nuôi thú cưng (Chó, Mèo):**\n\n"
                "- Tòa nhà cho phép nuôi thú cưng nhỏ dưới **10kg**, phải được tiêm phòng dại định kỳ đầy đủ và có giấy chứng nhận.\n"
                "- Khi ra khỏi căn hộ đến khu vực công cộng (hành lang, sảnh, thang máy), bắt buộc phải có dây xích, rọ mõm hoặc để trong túi vận chuyển chuyên dụng.\n"
                "- Giữ gìn vệ sinh chung, không để thú cưng phóng uế bừa bãi tại khuôn viên tòa nhà."
            )
        elif any(k in q_lower for k in ["khoan", "sửa chữa", "ồn", "thi công"]):
            return (
                "**Quy định về thi công sửa chữa, khoan đục:**\n\n"
                "- Thời gian cho phép gây ồn: Từ **08:00 - 11:30** và **13:30 - 17:00** (Thứ Hai đến Thứ Sáu).\n"
                "- Nghiêm cấm mọi hoạt động khoan đục gây tiếng ồn vào buổi trưa (11:30 - 13:30), ban đêm và toàn bộ ngày Chủ Nhật, ngày Lễ.\n"
                "- Cần gửi phiếu đăng ký sửa chữa cho Ban Quản Lý phê duyệt trước khi thi công."
            )
        elif any(k in q_lower for k in ["csdl", "cơ sở dữ liệu", "database", "mật khẩu", "password", "bảng "]):
            return "Vì lý do an toàn bảo mật và bảo vệ quyền riêng tư, Trợ lý AI không được phép truy cập vào cơ sở dữ liệu (CSDL) nội bộ của hệ thống. Bạn vui lòng kiểm tra tại tài khoản cá nhân trên cổng cư dân hoặc liên hệ trực tiếp Ban Quản Lý nhé!"
        else:
            return f"Cảm ơn bạn đã đặt câu hỏi. Đối với vấn đề: \"{question}\", Trợ lý AI luôn sẵn sàng hỗ trợ thông tin đời sống và sinh hoạt chung cư. Nếu bạn cần các thủ tục cụ thể tại tòa nhà, bạn có thể gửi yêu cầu hỗ trợ hoặc liên hệ trực tiếp Ban Quản Lý qua hotline 1900 8888."