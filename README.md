# Đề Tài 12: Hệ Thống Quản Lý Thuê Căn Hộ Tích Hợp AI (Sunshine Homes)

Hệ thống quản lý chuỗi căn hộ dịch vụ và chung cư cao cấp khép kín, tích hợp Trí tuệ nhân tạo (GenAI & Hybrid RAG) hỗ trợ vận hành tòa nhà, tự động tóm tắt hợp đồng pháp lý, sinh thông báo đôn đốc công nợ đa kênh và trợ lý hỏi đáp nội quy 24/7.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
d:\Detai12_QLCH\
├── frontend/             # Toàn bộ mã nguồn giao diện Frontend (React 19, TypeScript, Vite, Tailwind CSS)
│   ├── src/              # Các components, modules nghiệp vụ (11 Use Cases), pages, stores, hooks
│   ├── index.html        # Entry HTML
│   ├── package.json      # Dependencies & scripts
│   ├── tailwind.config.js# Cấu hình thiết kế & theme Sunshine Homes
│   └── vite.config.ts    # Cấu hình Vite 6
├── Tailieu/              # Tài liệu đề tài, đặc tả hệ thống & bộ ảnh giao diện mẫu (giao dien/)
├── .huh/                 # Kỹ năng phát triển & tiêu chuẩn mã nguồn (FE_SKILL.md)
└── README.md             # Hướng dẫn tổng quan
```

---

## 🚀 Hướng Dẫn Khởi Chạy Frontend

Di chuyển vào thư mục `frontend`:

```bash
cd frontend
npm install   # Nếu chưa cài node_modules
npm run dev   # Khởi chạy máy chủ phát triển
```

Truy cập ứng dụng: **`http://localhost:5173/`**

### Kiểm Tra Biên Dịch Production:
```bash
cd frontend
npm run build
```

---

## 🔑 Tài Khoản Demo Sẵn Có (1-Click Switch Role)

- **Admin**: `admin@dwell.vn` / `admin123`
- **Staff (Quản lý tòa nhà)**: `staff@dwell.vn` / `staff123`
- **Accountant (Kế toán)**: `accountant@dwell.vn` / `acc123`
- **Tenant (Cư dân)**: `tenant@dwell.vn` / `tenant123`
- **Guest (Khách tìm thuê)**: `guest@dwell.vn` / `guest123`
