from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.apartment import Apartment
from app.models.amenity import Amenity
from app.database import get_db

from app.models.document_chunk import (
    DocumentChunk
)

from app.models.system_alert import (
    SystemAlert
)

from app.models.user import User

from app.schemas.ai import (
    RagQuestionRequest,
    RagResponse,
    ApartmentRecommendRequest,
    ApartmentRecommendResponse
)

from app.dependencies.auth import (
    require_roles
)

from app.services.ai_service import (
    extract_document_text,
    split_into_chunks,
    create_embedding,
    summarize_contract_text,
    generate_alert_draft,
    generate_rag_answer,
    generate_text
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


# =========================================================
# UPLOAD KNOWLEDGE BASE
# =========================================================
@router.post("/knowledge/upload")
async def upload_knowledge_document(
    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File không hợp lệ"
        )

    existing = db.query(
        DocumentChunk
    ).filter(
        DocumentChunk.document_name
        == file.filename
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Tài liệu đã tồn tại"
        )

    file_bytes = await file.read()

    try:

        text = extract_document_text(
            file.filename,
            file_bytes
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Không đọc được nội dung tài liệu"
        )

    chunks = split_into_chunks(text)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Không tạo được chunk"
        )

    try:

        for index, chunk in enumerate(chunks):

            vector = create_embedding(
                chunk
            )

            item = DocumentChunk(
                document_name=file.filename,
                chunk_index=index,
                content=chunk,
                embedding_vector=vector
            )

            db.add(item)

        db.commit()

    except Exception as exc:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Lỗi AI: {str(exc)}"
        )

    return {
        "message": "Nạp tài liệu thành công",
        "document_name": file.filename,
        "total_chunks": len(chunks)
    }


# =========================================================
# DANH SÁCH KNOWLEDGE BASE
# =========================================================
@router.get("/knowledge")
def get_knowledge_documents(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    results = (
        db.query(
            DocumentChunk.document_name,

            func.count(
                DocumentChunk.id
            ).label(
                "total_chunks"
            )
        )
        .group_by(
            DocumentChunk.document_name
        )
        .all()
    )

    return [
        {
            "document_name":
                item.document_name,

            "total_chunks":
                item.total_chunks
        }

        for item in results
    ]


# =========================================================
# XÓA TÀI LIỆU
# =========================================================
@router.delete(
    "/knowledge/{document_name}"
)
def delete_knowledge_document(
    document_name: str,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles("ADMIN")
    )
):

    chunks = db.query(
        DocumentChunk
    ).filter(
        DocumentChunk.document_name
        == document_name
    ).all()

    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tài liệu"
        )

    for chunk in chunks:
        db.delete(chunk)

    db.commit()

    return {
        "message":
            "Đã xóa tài liệu khỏi Knowledge Base"
    }


# =========================================================
# CHATBOT RAG
# =========================================================
@router.post(
    "/chat",
    response_model=RagResponse
)
def rag_chat(
    data: RagQuestionRequest,
    db: Session = Depends(get_db)
):

    question = data.question.strip()

    if len(question) < 2:
        raise HTTPException(
            status_code=400,
            detail="Câu hỏi quá ngắn"
        )

    try:

        query_vector = create_embedding(
            question
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Lỗi embedding: {str(exc)}"
        )

    distance = (
        DocumentChunk
        .embedding_vector
        .cosine_distance(
            query_vector
        )
    )

    rows = (
        db.query(
            DocumentChunk,

            distance.label(
                "distance"
            )
        )
        .order_by(distance)
        .limit(data.top_k)
        .all()
    )

    contexts = []
    sources = []

    for chunk, chunk_distance in rows:

        similarity = (
            1
            - float(chunk_distance)
        )

        if similarity < 0.50:
         continue

        contexts.append({
            "document_name":
                chunk.document_name,

            "chunk_index":
                chunk.chunk_index,

            "content":
                chunk.content
        })

        sources.append({
            "document_name":
                chunk.document_name,

            "chunk_index":
                chunk.chunk_index,

            "similarity":
                round(similarity, 4)
        })

    # NO CONTEXT -> NO ANSWER
    if not contexts:

        return {
            "answer": (
                "Nội quy không đề cập đến vấn đề này. "
                "Vui lòng liên hệ nhân viên hỗ trợ."
            ),

            "sources": []
        }

    try:

        answer = generate_rag_answer(
            question,
            contexts
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Lỗi Gemini: {str(exc)}"
        )

    return {
        "answer": answer,
        "sources": sources
    }


# =========================================================
# TÓM TẮT HỢP ĐỒNG
# =========================================================
@router.post(
    "/contracts/summarize"
)
async def summarize_contract(
    file: UploadFile = File(...),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF"
        )
    )
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File không hợp lệ"
        )

    file_bytes = await file.read()

    try:

        text = extract_document_text(
            file.filename,
            file_bytes
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Không đọc được hợp đồng"
        )

    try:

        summary = summarize_contract_text(
            text
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Lỗi Gemini: {str(exc)}"
        )

    return {
        "document_name":
            file.filename,

        "summary":
            summary,

        "review_required":
            True
    }


# =========================================================
# AI SOẠN THÔNG BÁO
# =========================================================
@router.post(
    "/alerts/{alert_id}/draft"
)
def create_alert_draft(
    alert_id: int,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "STAFF",
            "ACCOUNTANT"
        )
    )
):

    alert = db.query(
        SystemAlert
    ).filter(
        SystemAlert.id == alert_id
    ).first()

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy cảnh báo"
        )

    try:

        draft = generate_alert_draft(
            alert.message
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Lỗi Gemini: {str(exc)}"
        )

    return {
        "alert_id":
            alert.id,

        "alert_type":
            alert.alert_type,

        "original_message":
            alert.message,

        "ai_draft":
            draft,

        "review_required":
            True
    }
@router.post(
    "/apartments/recommend",
    response_model=list[ApartmentRecommendResponse]
)
def recommend_apartments(
    data: ApartmentRecommendRequest,
    db: Session = Depends(get_db)
):

    # ==========================================
    # 1. Kiểm tra dữ liệu đầu vào
    # ==========================================
    if data.max_budget <= 0:
        raise HTTPException(
            status_code=400,
            detail="Ngân sách phải lớn hơn 0"
        )

    if data.occupants <= 0:
        raise HTTPException(
            status_code=400,
            detail="Số người phải lớn hơn 0"
        )

    if (
        data.min_area is not None
        and data.min_area < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Diện tích không hợp lệ"
        )

    # ==========================================
    # 2. Backend lọc căn hộ thật trong DB
    # ==========================================
    query = db.query(
        Apartment
    ).filter(
        Apartment.status == "AVAILABLE",
        Apartment.price <= data.max_budget,
        Apartment.max_occupants >= data.occupants
    )

    if data.min_area is not None:
        query = query.filter(
            Apartment.area_sqm >= data.min_area
        )

    if data.building_id is not None:
        query = query.filter(
            Apartment.building_id
            == data.building_id
        )

    apartments = (
        query
        .order_by(
            Apartment.price.asc(),
            Apartment.area_sqm.desc()
        )
        .all()
    )

    # ==========================================
    # 3. Chuẩn hóa tiện ích khách yêu cầu
    # ==========================================
    required_amenities = {
        item.strip().lower()
        for item in data.amenities
        if item.strip()
    }

    candidates = []

    for apartment in apartments:

        amenity_rows = (
            db.query(Amenity)
            .filter(
                Amenity.apartment_id
                == apartment.id
            )
            .all()
        )

        amenity_names = [
            item.name
            for item in amenity_rows
        ]

        apartment_amenities = {
            item.lower()
            for item in amenity_names
        }

        # Nếu khách yêu cầu tiện ích,
        # căn hộ phải có đủ
        if (
            required_amenities
            and not required_amenities.issubset(
                apartment_amenities
            )
        ):
            continue

        candidates.append({
            "apartment": apartment,
            "amenities": amenity_names
        })

    # Không có căn phù hợp
    if not candidates:
        return []

    # Chỉ tư vấn tối đa 5 căn
    candidates = candidates[:5]

    result = []

    # ==========================================
    # 4. AI chỉ giải thích vì sao phù hợp
    # ==========================================
    for item in candidates:

        apartment = item["apartment"]
        amenity_names = item["amenities"]

        prompt = f"""
Bạn là trợ lý tư vấn thuê căn hộ.

Hãy giải thích ngắn gọn tại sao căn hộ dưới đây
phù hợp với nhu cầu của khách hàng.

Nhu cầu khách:
- Ngân sách tối đa: {data.max_budget} VNĐ/tháng
- Diện tích tối thiểu: {data.min_area}
- Số người ở: {data.occupants}
- Tòa nhà mong muốn: {data.building_id}
- Tiện ích yêu cầu: {data.amenities}

Thông tin căn hộ:
- Mã căn hộ: {apartment.id}
- Phòng: {apartment.room_number}
- Giá: {apartment.price} VNĐ/tháng
- Diện tích: {apartment.area_sqm} m2
- Số người tối đa: {apartment.max_occupants}
- Tiện ích: {amenity_names}

Quy tắc:
- Chỉ sử dụng dữ liệu được cung cấp.
- Không tự tạo căn hộ mới.
- Không bịa tiện ích.
- Không bịa số phòng ngủ.
- Không bịa hình ảnh.
- Trả lời tối đa 3 câu.
"""

        try:
            reason = generate_text(
                prompt
            )

        except Exception:
            # Gemini lỗi thì hệ thống vẫn sử dụng được
            reason = (
                "Căn hộ đáp ứng điều kiện "
                "ngân sách và nhu cầu đã chọn."
            )

        result.append({
            "apartment_id":
                apartment.id,

            "building_id":
                apartment.building_id,

            "room_number":
                apartment.room_number,

            "price":
                apartment.price,

            "area_sqm":
                apartment.area_sqm,

            "max_occupants":
                apartment.max_occupants,

            "amenities":
                amenity_names,

            "reason":
                reason
        })

    return result