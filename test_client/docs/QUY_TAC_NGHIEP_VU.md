# TÀI LIỆU QUY TẮC NGHIỆP VỤ & MA TRẬN TEST THEO PACKAGE (TEST CLIENT)
**Dự án:** Hệ Thống Quản Lý Bán Hàng & Kho Hàng (Sales & Warehouse Management System)  
**Môi trường:** Chạy cục bộ 100% bằng SQLite In-Memory (không làm bẩn database dev, không cần push git)

---

## I. CẤU TRÚC PHÂN CHIA PACKAGE (INCREMENTAL TESTING)

Thư mục `test_client` được chia thành 5 Package chuyên biệt giúp Dev và Tester kiểm thử từng phần riêng lẻ theo tiến độ (test dần) hoặc chạy toàn bộ:

```text
backend/test_client/
├── core/                               <-- Module dùng chung
│   ├── context.py                      <-- Dựng SQLite In-Memory & nạp tài khoản mẫu
│   └── reporter.py                     <-- Định dạng và in báo cáo Pass/Fail
├── suites/                             <-- Danh sách các Package kiểm thử
│   ├── suites/auth/test_validation.py             <-- Package 1: Ràng buộc đầu vào & Schema
│   ├── suites/auth/test_forgot_password.py        <-- Package 2: Quên & Đặt lại mật khẩu (SCRUM-200)
│   ├── suites/auth/test_login_lockout.py          <-- Package 3: Đăng nhập & Khóa tạm 15p (SCRUM-198)
│   ├── suites/auth/test_change_pwd.py     <-- Package 4: Đổi mật khẩu & Thu hồi phiên (SCRUM-201, 199)
│   └── suites/auth/test_rbac_security.py       <-- Package 5: Phân quyền vai trò & Giá vốn (SCRUM-202)
├── runner.py                      <-- Master Runner (chọn chạy từng package hoặc ALL)
├── chay_test.bat                       <-- Menu tương tác trên Windows (click đúp)
└── QUY_TAC_NGHIEP_VU.md                <-- Tài liệu đặc tả này
```

---

## II. ĐẶC TẢ CHI TIẾT CÁC QUY TẮC NGHIỆP VỤ THEO PACKAGE

### [Package 01] Ràng buộc Đầu vào (Input Validation & Constraints)
* **VAL-01:** Email rỗng `""` bị từ chối với `HTTP 400 Bad Request` ("Địa chỉ email không được để trống.").
* **VAL-02:** Email toàn khoảng trắng `"   "` bị từ chối với `HTTP 400 Bad Request`.
* **VAL-03:** Email sai định dạng (không có `@`) bị từ chối với `HTTP 400 Bad Request` ("Địa chỉ email không đúng định dạng.").
* **VAL-04:** Email sai định dạng domain (không có đuôi tên miền hợp lệ) bị từ chối với `HTTP 400 Bad Request`.
* **VAL-05:** Request thiếu trường `email` bị FastAPI Pydantic chặn với `HTTP 422 Unprocessable Entity`.
* **VAL-06:** Mật khẩu mới dưới 8 ký tự bị chặn với `HTTP 422`.
* **VAL-07:** Mật khẩu mới thiếu chữ số hoặc thiếu chữ cái bị chặn với `HTTP 422`.

---

### [Package 02] Quên & Đặt lại Mật khẩu qua Email (SCRUM-200)
* **FP-01 (Chống User Enumeration):** Gửi email lạ không tồn tại trong DB vẫn nhận được `HTTP 200` với thông điệp chung: *"Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn."* (tránh rò rỉ danh sách tài khoản).
* **FP-02 (Bảo mật Token):** Response JSON của API tuyệt đối không chứa token hay link nhạy cảm.
* **FP-03 (Vòng đời Token 30 phút):** Token sinh ngẫu nhiên an toàn 32 bytes urlsafe, lưu DB với `reset_password_expires_at = now + 30 phút`.
* **FP-04 (Đặt lại mật khẩu thành công):** Token hợp lệ đổi mật khẩu mới thành công, mật khẩu băm bcrypt an toàn.
* **FP-05 (Single-use Token):** Token chỉ dùng được 1 lần duy nhất, dùng lại lần 2 bị từ chối `HTTP 400`.
* **FP-06 (Token hết hạn):** Token quá 30 phút bị từ chối `HTTP 400` ("Liên kết đặt lại mật khẩu đã hết hạn...").
* **FP-07 (Token giả mạo):** Token không có trong DB bị từ chối `HTTP 400`.

---

### [Package 03] Đăng nhập & Xử lý Khóa tạm 15 phút (SCRUM-198 / SCRUM-287)
* **LOG-01 & LOG-02:** Cho phép đăng nhập linh hoạt bằng cả **Username** hoặc **Email**.
* **LOG-03:** Sai thông tin hiển thị thông báo chung: *"Tên đăng nhập hoặc mật khẩu không chính xác."* (HTTP 401).
* **LOG-04:** Nhập sai liên tiếp 5 lần kích hoạt khóa tài khoản tạm thời trong **15 phút** (`HTTP 403 Forbidden`).
* **LOG-05:** Trong thời gian đang bị khóa 15 phút, người dùng nhập đúng mật khẩu vẫn bị từ chối (`HTTP 403`).
* **LOG-06:** Sau khi hết thời gian 15 phút, tài khoản tự động mở lại và đăng nhập bình thường.

---

### [Package 04] Đổi Mật khẩu & Thu hồi Phiên (SCRUM-201 / SCRUM-199)
* **PWD-01:** Đổi mật khẩu bắt buộc kiểm tra mật khẩu hiện tại (sai pass cũ -> `HTTP 400`).
* **PWD-02:** Không cho phép đặt mật khẩu mới trùng mật khẩu cũ (`HTTP 400`).
* **PWD-03 & PWD-04:** Đổi mật khẩu thành công tự động tăng `token_version` trong DB -> Toàn bộ JWT token cũ ở các thiết bị khác lập tức bị thu hồi (`HTTP 401`).
* **PWD-05:** Đăng nhập lại với mật khẩu mới thành công.
* **PWD-06 (SCRUM-199):** Đăng xuất an toàn (`POST /api/v1/auth/logout`) làm mất hiệu lực phiên ngay lập tức phía server.

---

### [Package 05] Phân quyền Vai trò RBAC & Bảo vệ Giá vốn (SCRUM-202 / SCRUM-310)
* **RBAC-01:** Mọi chức năng đều kiểm quyền ở tầng Server, mặc định từ chối khi không có token (Deny by default - `HTTP 401`).
* **RBAC-02 & RBAC-03:** Dữ liệu Báo cáo Giá vốn & Biên lợi nhuận (`/api/v1/auth/financial/cost-and-margin`) **CHỈ CHO PHÉP** vai trò **Sales Manager** (hoặc Admin); Khách hàng hoặc Nhân viên kho truy cập bị chặn `HTTP 403 Forbidden`.
* **RBAC-04:** Các Guard tầng endpoint tự động bảo vệ đúng vai trò nghiệp vụ.

---

## III. HƯỚNG DẪN THỰC THI KIỂM THỬ DẦN TỪNG PACKAGE

### Cách 1: Chạy trực tiếp qua dòng lệnh (Command Line)
Đứng tại thư mục `backend/`:

* **Chỉ test Package 1 (Validation):**
  ```powershell
  py test_client/runner.py 1
  ```
* **Chỉ test Package 2 (Forgot Password):**
  ```powershell
  py test_client/runner.py 2
  ```
* **Chỉ test Package 3 (Login & Lockout):**
  ```powershell
  py test_client/runner.py 3
  ```
* **Chỉ test Package 4 (Change Password & Session):**
  ```powershell
  py test_client/runner.py 4
  ```
* **Chỉ test Package 5 (RBAC & Phân quyền):**
  ```powershell
  py test_client/runner.py 5
  ```
* **Chạy toàn bộ 30 Test Cases (Regression Test):**
  ```powershell
  py test_client/runner.py all
  ```

### Cách 2: Chạy qua Menu tương tác trên Windows
* Mở thư mục `backend/test_client/`
* Click đúp vào file **`chay_test.bat`**
* Nhập số `1`, `2`, `3`, `4`, `5` để test dần từng gói hoặc bấm `0` để chạy toàn bộ.
