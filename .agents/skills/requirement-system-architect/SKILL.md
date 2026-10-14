---
name: requirement-system-architect
description: >-
  Use this skill whenever analyzing requirements, planning new features, breaking down tasks,
  or assessing technical architecture and edge cases for the Dwell Living project based on the Agent system standard.
---

# Kỹ Năng Kỹ Nghệ Yêu Cầu & Kiến Trúc Hệ Thống (Requirement System Architect Skill)

Kỹ năng này đóng vai trò là **Senior Business Analyst (BA) kiêm Software System Architect** cho toàn bộ dự án Quản Lý Căn Hộ Dwell Living.

---

## 1. Khi Nào Kích Hoạt Kỹ Năng Này?
- Khi người dùng đưa ra một yêu cầu tính năng mới (ví dụ: *"Thêm chức năng ký hợp đồng online"*, *"Thêm tính năng ghi chỉ số điện nước"*).
- Khi chuẩn bị lập kế hoạch sprint, phân rã công việc hoặc tạo issue.
- Khi cần rà soát các trường hợp biên (edge cases), race conditions, hoặc lỗ hổng bảo mật trong luồng nghiệp vụ trước khi code.

---

## 2. Quy Trình Phân Tích Chuẩn 4 Bước

Mọi yêu cầu kỹ thuật PHẢI được xử lý tuần tự qua 4 bước:

### Bước 1: Tóm Tắt & Mục Tiêu Hệ Thống (Understanding & Core Intent)
1. Tóm tắt lại yêu cầu bằng ngôn ngữ kỹ thuật ngắn gọn, định lượng được.
2. Xác định rõ Actor chính:
   - `ADMIN`: Quản lý toàn bộ hệ thống, tòa nhà, tài khoản.
   - `STAFF`: Nhân viên vận hành tòa nhà, ghi số điện nước, xử lý bảo trì.
   - `ACCOUNTANT`: Kế toán phụ trách thu chi, hóa đơn, công nợ.
   - `TENANT`: Khách thuê căn hộ, xem hóa đơn, gửi yêu cầu sửa chữa.
3. Xác định phạm vi tác động (In-Scope & Out-of-Scope).

### Bước 2: Phát Hiện Điểm Mờ Thấu & Trường Hợp Biên (Ambiguities & Edge Cases)
Phân tích tối thiểu 3 - 5 khía cạnh trọng yếu:
- **Xử lý đồng thời (Concurrency & Race Condition)**: Nhiều người cùng thao tác đồng thời trên một bản ghi (2 khách cùng cọc 1 phòng ➔ Pessimistic Lock `SELECT ... FOR UPDATE`).
- **Toàn vẹn dữ liệu & Phục hồi lỗi (Data Integrity & Rollback)**: Trạng thái giao dịch dở dang, webhook thanh toán VietQR đến muộn ➔ Idempotency Key, Reconciliation.
- **Luồng ngoại lệ (Error Handling & Fallback)**: Mất mạng, timeout, chỉ số điện nước mới nhỏ hơn chỉ số cũ do lỗi nhập/OCR.
- **Bảo mật & Phân quyền (Security & IDOR)**: Kiểm tra chéo ID khách thuê, xác thực JWT Token, chặn truy cập hóa đơn phòng khác.
- **Trải nghiệm biên (UX Edge Cases)**: Chặn double click, loading skeleton, nén ảnh phía client trước khi upload.

### Bước 3: Đề Xuất Giải Pháp Kỹ Thuật (Proposed Solutions)
- Đưa ra giải pháp dứt khoát, cụ thể cho từng điểm mờ đã nêu ở Bước 2.

### Bước 4: Phân Rã Công Việc Kỹ Thuật (Task Decomposition Tree)
Bắt buộc phân rã theo 4 khối kỹ thuật tiêu chuẩn, ánh xạ trực tiếp vào mã nguồn:
- **[Backend / Database / API]**:
  - Router: `backend/app/routers/[feature].py`
  - Service: `backend/app/services/[feature]_service.py`
  - Model: `backend/app/models/[feature].py`
  - Schema: `backend/app/schemas/[feature].py`
- **[Frontend / UI / UX]**:
  - Trang hiển thị: `frontend/src/pages/[Feature]Page.tsx`
  - Components: `frontend/src/components/`
  - Store/API: `frontend/src/stores/`
  - Route: Cập nhật `frontend/src/App.tsx`
- **[Third-party Integration / Security]**: Cấu hình VietQR, JWT, Mail, OCR...
- **[Testing & Quality Assurance]**: Unit test nghiệp vụ và Integration test luồng ngoại lệ.
- **Mỗi task phải có Definition of Done (DoD) đo lường được**.

---

## 3. Cấu Trúc Báo Cáo Đầu Ra Tiêu Chuẩn

```markdown
### 1. Tóm tắt yêu cầu (Overview)
- **Mục tiêu cốt lõi:** [Mô tả ngắn gọn]
- **Đối tượng thụ hưởng:** [ADMIN / STAFF / ACCOUNTANT / TENANT]
- **Phạm vi tác động:** [Các module bị ảnh hưởng]

### 2. Điểm mờ thấu & Trường hợp biên (Ambiguities & Edge Cases)
* **[Vấn đề 1 - Tên khía cạnh]:**
  - *Điểm chưa rõ:* [Mô tả sự mơ hồ hoặc rủi ro]
  - *Đề xuất xử lý:* [Giải pháp kiến trúc/kỹ thuật]
* **[Vấn đề 2 - Tên khía cạnh]:**
  - *Điểm chưa rõ:* [Mô tả]
  - *Đề xuất xử lý:* [Giải pháp]

### 3. Phân rã công việc kỹ thuật (Task Decomposition Tree)
#### [Backend / Database / API]
- Task 1: [Tên task] - File: `backend/app/routers/...` - DoD: `...`
- Task 2: [Tên task] - File: `backend/app/services/...` - DoD: `...`

#### [Frontend / UI / UX]
- Task 3: [Tên task] - File: `frontend/src/pages/...` - DoD: `...`
- Task 4: [Tên task] - File: `frontend/src/components/...` - DoD: `...`

#### [Third-party / Security]
- Task 5: [Tên task] - DoD: `...`

#### [Testing & Quality Assurance]
- Task 6: [Tên task] - Kịch bản test: `...`
```

---

## 4. Công Cụ Hỗ Trợ Thực Thi
Có thể chạy script Engine điều phối trực tiếp từ dòng lệnh:
```bash
python .agents/skills/requirement-system-architect/scripts/agent_runner.py --req "Mô tả tính năng" --output ".agents/skills/requirement-system-architect/outputs/feature_spec.md"
```
hoặc chạy demo tính năng mẫu của dự án Dwell Living:
```bash
python .agents/skills/requirement-system-architect/scripts/agent_runner.py
```
