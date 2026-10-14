# QUY CHUẨN PHÁT TRIỂN PHẦN MỀM & KỸ NGHỆ YÊU CẦU (DWELL LIVING AGENT STANDARD)

Tài liệu này là quy chuẩn bắt buộc (Always-on Rules) áp dụng cho mọi tương tác lập trình, phân tích tính năng và tái cấu trúc mã nguồn trong hệ thống **Quản Lý Căn Hộ Tích Hợp AI (Dwell Living)**.

---

## 1. NGUYÊN TẮC CỐT LÕI: TƯ DUY TRƯỚC KHI GÕ CODE
Mỗi khi lập trình viên hoặc AI trợ lý tiếp nhận bất kỳ yêu cầu phát triển tính năng mới nào, **BẮT BUỘC PHẢI THỰC HIỆN PHÂN TÍCH 4 BƯỚC** theo tiêu chuẩn của Senior Business Analyst & Software System Architect trước khi sinh code:

### Bước 1: Thấu Hiểu Yêu Cầu & Mục Tiêu (Understanding & Core Intent)
- Tóm tắt lại yêu cầu bằng ngôn ngữ kỹ thuật chuẩn xác.
- Xác định rõ Actor thụ hưởng: `ADMIN`, `STAFF`, `ACCOUNTANT`, hoặc `TENANT`.
- Xác định ranh giới phạm vi (In-scope) và các thành phần không thuộc phạm vi (Out-of-scope).

### Bước 2: Bóc Tách Điểm Mờ & Trường Hợp Biên (Ambiguities & Edge Cases)
Bắt buộc quét tìm tối thiểu 3 - 5 khía cạnh rủi ro tiềm ẩn:
1. **Xử lý đồng thời (Concurrency & Race Condition)**: Tranh chấp dữ liệu (ví dụ: hai khách cùng đặt cọc một phòng cùng lúc; nhân viên cập nhật chỉ số đồng thời). Bắt buộc chỉ định cơ chế khóa (Pessimistic Lock `SELECT ... FOR UPDATE` hoặc Redis Lock).
2. **Toàn vẹn dữ liệu & Phục hồi (Data Integrity & Rollback)**: Trạng thái giao dịch dở dang (ví dụ: webhook thanh toán VietQR gửi chậm, trừ tiền nhưng tạo hợp đồng lỗi). Bắt buộc có cơ chế Idempotency Key và đối soát.
3. **Luồng ngoại lệ & Timeout (Error Handling & Fallbacks)**: Mất kết nối internet, API bên thứ ba timeout, chỉ số điện nước mới nhỏ hơn chỉ số cũ do lỗi nhập/OCR.
4. **Bảo mật & Phân quyền (Security & RBAC)**: Chống vượt quyền xem chéo hợp đồng/hóa đơn phòng khác (IDOR), xác thực JWT Token và Rate limiting.
5. **Trải nghiệm người dùng biên (UX Edge Cases)**: Chặn bấm nút nhiều lần (Double click), hỗ trợ trạng thái tải chậm (Loading skeleton), mạng chập chờn khi upload ảnh.

### Bước 3: Đề Xuất Giải Pháp Kỹ Thuật (Proposed Solutions)
- Đưa ra giải pháp dứt khoát, cụ thể cho từng điểm mờ đã chỉ ra ở Bước 2.

### Bước 4: Phân Rã Cây Công Việc Cụ Thể (Task Decomposition Tree)
Phân rã thành 4 khối công việc bắt buộc, ánh xạ 100% vào cấu trúc mã nguồn thực tế của dự án:
- **[Backend / Database / API]**: Chỉ định rõ file trong `backend/app/` (Router, Service, Model, Schema).
- **[Frontend / UI / UX]**: Chỉ định rõ file trong `frontend/src/` (Page, Component, Store, Route).
- **[Third-party Integration / Security]**: Cấu hình VietQR, JWT, Mail, OCR/Gemini.
- **[Testing & Quality Assurance]**: Kịch bản kiểm thử luồng đúng (Happy path) và luồng lỗi (Edge cases).
- Mọi task phải có **Definition of Done (DoD)** rõ ràng.

---

## 2. QUY CHUẨN MÃ NGUỒN THỰC TẾ CỦA DỰ ÁN DWELL LIVING

### 2.1. Backend (Python 3.11+ / FastAPI / SQLAlchemy / PostgreSQL)
- **Tầng Routing (`backend/app/routers/[feature].py`)**:
  - Chỉ làm nhiệm vụ kiểm tra sơ bộ định dạng dữ liệu đầu vào, phân quyền vai trò (`Depends(require_roles([...]))`), gọi service và trả về Response.
  - Tuyệt đối không viết logic nghiệp vụ phức tạp trực tiếp trong router.
- **Tầng Service (`backend/app/services/[feature]_service.py`)**:
  - Nơi tập trung toàn bộ nghiệp vụ, tính toán tiền tệ, xử lý transaction CSDL và tương tác dịch vụ AI/bên thứ ba.
- **Tầng Model (`backend/app/models/[feature].py`)**:
  - Định nghĩa SQLAlchemy declarative models, kế thừa `Base` từ `app.database`. Bắt buộc có timestamp (`created_at`, `updated_at`).
  - Các bảng chính: `buildings`, `apartments`, `tenants`, `contracts`, `deposits`, `receivables`, `payments`, `debt_ledgers`, `maintenance_requests`, `system_alerts`, `document_chunks`.
- **Tầng Schema (`backend/app/schemas/[feature].py`)**:
  - Khai báo Pydantic schemas tách biệt: `[Feature]Base`, `[Feature]Create`, `[Feature]Update`, `[Feature]Response`.

### 2.2. Frontend (React 19 / TypeScript / Vite / Tailwind CSS)
- **Cấu trúc tệp**:
  - `frontend/src/pages/[Feature]Page.tsx`: Màn hình giao diện nghiệp vụ chính.
  - `frontend/src/components/`: Component giao diện tái sử dụng.
  - `frontend/src/stores/`: Quản lý state toàn cục và API calls (Redux Toolkit / RTK Query).
  - `frontend/src/App.tsx`: Khai báo routing và bảo vệ đường dẫn bằng PrivateRoute / PublicRoute.
- **Quy tắc lập trình**:
  - Tên component: **PascalCase** (`ApartmentDetailPage.tsx`, `ContractTable.tsx`).
  - Không hardcode màu sắc; dùng Tailwind tokens và Lucide React icons.
  - Form validation: Rõ ràng, thông báo lỗi bằng tiếng Việt thân thiện.
  - Luôn xử lý các trạng thái: `isLoading`, `isError`, và dữ liệu rỗng (Empty state).

---

## 3. CHECKLIST KIỂM THỬ TRƯỚC KHI HOÀN TẤT BẤT KỲ FILE CODE NÀO
- [ ] Tính năng đã qua bước phân tích điểm mờ và ngoại lệ chưa?
- [ ] Mã nguồn có map đúng cấu trúc thư mục `backend/app/` và `frontend/src/` không?
- [ ] Có phát sinh lỗ hổng bảo mật IDOR hay rò rỉ token không?
- [ ] Đã có xử lý ngoại lệ mạng, timeout và lỗi CSDL chưa?
- [ ] Đã kiểm tra tính tương thích TypeScript không có lỗi cú pháp chưa?
