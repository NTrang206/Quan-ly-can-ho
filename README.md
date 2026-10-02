# Đề Tài 12: Hệ Thống Quản Lý Thuê Căn Hộ Tích Hợp AI (Dwell Living)

Hệ thống quản lý chuỗi căn hộ dịch vụ và chung cư cao cấp khép kín, tích hợp Trí tuệ nhân tạo (GenAI & Hybrid RAG) hỗ trợ vận hành tòa nhà, tự động tóm tắt hợp đồng pháp lý, sinh thông báo đôn đốc công nợ đa kênh và trợ lý hỏi đáp nội quy 24/7.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
d:\Detai12_QLCH\
├── backend/              # Mã nguồn Backend (FastAPI, SQLAlchemy, PostgreSQL + pgvector, Gemini AI)
│   ├── app/              # Core config, models, schemas, routers, services, cron tasks
│   ├── tests/            # Bộ kiểm thử AI & billing
│   ├── requirements.txt  # Thư viện phụ thuộc Python
│   └── .env.example      # File mẫu cấu hình biến môi trường backend
├── frontend/             # Toàn bộ mã nguồn giao diện Frontend (React 19, TypeScript, Vite, Tailwind CSS)
│   ├── src/              # Các components, modules nghiệp vụ (11 Use Cases), pages, stores, hooks
│   ├── index.html        # Entry HTML
│   ├── package.json      # Dependencies & scripts
│   ├── tailwind.config.js# Cấu hình thiết kế & theme Sunshine Homes
│   └── vite.config.ts    # Cấu hình Vite 6
├── scratch_docs/         # Tài liệu mẫu phục vụ tính năng AI RAG Ingestion (Nội quy tòa nhà...)
├── Tailieu/              # Tài liệu đề tài, đặc tả hệ thống & bộ ảnh giao diện mẫu
├── .huh/                 # Kỹ năng phát triển & tiêu chuẩn mã nguồn
└── README.md             # Hướng dẫn tổng quan
```

---

## 🛠️ Hướng Dẫn Khởi Chạy Backend (FastAPI + PostgreSQL)

### 1. Chuẩn bị môi trường Python:
Mở terminal tại thư mục gốc dự án và di chuyển vào `backend`:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # Trên Windows PowerShell
# source venv/bin/activate    # Trên Linux/macOS
pip install -r requirements.txt
```

### 2. Cấu hình biến môi trường:
Tạo file `.env` bên trong thư mục `backend/` dựa trên mẫu `.env.example`:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_qlch
JWT_SECRET=super_secret_jwt_key_dwell_2026
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=8
VIETQR_BANK_ID=970422
VIETQR_ACCOUNT_NO=0123456789
VIETQR_ACCOUNT_NAME=DWELL LIVING APARTMENT
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_EMBED_MODEL=gemini-embedding-2
```

> [!NOTE]
> - Cần khởi chạy PostgreSQL và tạo cơ sở dữ liệu `db_qlch`.
> - Kích hoạt extension pgvector trong PostgreSQL: `CREATE EXTENSION IF NOT EXISTS vector;`

### 3. Khởi tạo dữ liệu mẫu (Seed Data):
```powershell
python -m app.seed
```
*Lệnh này sẽ tự động tạo bảng phân quyền (`ADMIN`, `STAFF`, `ACCOUNTANT`, `TENANT`) và tài khoản Quản trị viên mặc định (`username: admin`, `password: 123456`).*

### 4. Khởi chạy máy chủ Backend:
```powershell
uvicorn app.main:app --reload --port 8000
```
- Endpoint trang chủ: **`http://localhost:8000/`**
- Tài liệu API tương tác (Swagger UI): **`http://localhost:8000/docs`**

---

## 🚀 Hướng Dẫn Khởi Chạy Frontend (React + Vite)

Mở một cửa sổ terminal mới và di chuyển vào thư mục `frontend`:

```powershell
cd frontend
npm install   # Cài đặt thư viện nếu chưa có node_modules
npm run dev   # Khởi chạy dev server
```

Truy cập ứng dụng tại: **`http://localhost:5173/`**

### Kiểm Tra Biên Dịch Production:
```powershell
npm run build
```

---

## 🔑 Tài Khoản Đăng Nhập

### 1. Tài khoản thực tế từ CSDL Backend (sau khi chạy seed):
- **Username**: `admin`
- **Mật khẩu**: `123456`

### 2. Chế độ xem mẫu nhanh (1-Click Switch Role trên trang Login):
- **Admin (Quản trị viên)**: `admin@dwell.vn` / `admin123`
- **Staff (Quản lý tòa nhà)**: `staff@dwell.vn` / `staff123`
- **Accountant (Kế toán)**: `accountant@dwell.vn` / `acc123`
- **Tenant (Cư dân)**: `tenant@dwell.vn` / `tenant123`
- **Guest (Khách tìm thuê)**: `guest@dwell.vn` / `guest123`
