# BỘ CẨM NANG PROMPT KIỂM THỬ BACKEND TOÀN TẬP
*(Copy & Paste dùng ngay)*

Dưới đây là Bộ Cẩm Nang Prompt Toàn Tập (Copy & Paste dùng ngay) được chia theo từng trường hợp thực tế khi bạn làm việc:

---

### TRƯỜNG HỢP 1: Vừa pull code mới + Có file Excel nghiệp vụ (Trường hợp phổ biến nhất)
* **Mục đích:** Đọc file Excel bạn đưa, tự viết mã test cho các endpoint mới, test API thật với dữ liệu thật và tự điền kết quả vào file Excel trong `test_client`.
* **Prompt copy:**
```text
Tôi vừa pull code mới và có file mô tả nghiệp vụ tại @[đường_dẫn_file_excel].
Hãy tuân thủ quy trình TEST_SKILL.md:
1. Đọc danh sách Endpoint và dữ liệu đầu vào (Payload thật) từ file Excel trên.
2. Tự động tạo các file test theo chuẩn trong backend/test_client/suites/.
3. Bắt buộc test API thật: Bật server Backend và gửi request HTTP thật với dữ liệu thực tế để kiểm tra.
4. Tự động đổ kết quả (Actual Result, PASS/FAIL) vào file Excel trong test_client.
NGUYÊN TẮC: Chỉ kiểm thử độc lập, tuyệt đối không sửa code Backend!
```

---

### TRƯỜNG HỢP 2: Rà soát Endpoint còn thiếu ➔ Tự tạo file test ➔ Test luôn ➔ Điền Excel
* **Mục đích:** Quét toàn bộ mã nguồn Backend xem API nào chưa được viết bài test thì tự động tạo file test, chạy test và ghi tiếp vào bảng tính.
* **Prompt copy:**
```text
Hãy rà soát toàn bộ các endpoint trong backend/app/api/ xem những cái nào chưa có bài test trong backend/test_client/. Sau đó:
1. Tự động tạo file test mới theo chuẩn trong backend/test_client/suites/ cho các endpoint còn thiếu đó (đầy đủ ca Validation, Happy Path, RBAC).
2. Chạy test luôn trên API thật.
3. Tự động điền tiếp kết quả vào file Excel trong test_client.
NGUYÊN TẮC: Chỉ test độc lập, nếu có lỗi ghi vào Sheet Defect Log, không sửa code Backend!
```

---

### TRƯỜNG HỢP 3: Chỉ rà soát báo cáo độ phủ (Audit Only — Chưa tạo file)
* **Mục đích:** Kiểm tra xem dự án đã test được bao nhiêu %, còn sót những API nào để báo cáo tiến độ (chưa muốn sinh thêm code test).
* **Prompt copy:**
```text
Hãy rà soát toàn bộ các endpoint trong backend/app/api/ và đối chiếu với file Excel trong test_client. Hãy lập bảng báo cáo độ phủ:
1. Endpoint nào ĐÃ TEST (Kèm kết quả Pass/Fail).
2. Endpoint nào CHƯA TEST (Kèm Method, URL, file router).
3. Đề xuất các kịch bản test còn thiếu (chưa cần tạo file code).
```

---

### TRƯỜNG HỢP 4: Dev vừa sửa xong Bug ➔ Chạy lại để nghiệm thu lại vào Excel
* **Mục đích:** Khi lập trình viên báo đã sửa xong lỗi, bạn muốn chạy lại các ca test bị FAIL trước đó để xác nhận và chuyển trạng thái Bug thành RESOLVED trong Excel.
* **Prompt copy:**
```text
Dev vừa cập nhật code để sửa các lỗi ghi nhận trong Sheet Defect Log. Hãy chạy lại kiểm thử cho các ca test bị lỗi đó trên API thật:
1. Kiểm tra xem lỗi đã thực sự được khắc phục chưa.
2. Tự động cập nhật lại trạng thái thành PASS trong Sheet Test Cases và cập nhật trạng thái Bug trong Sheet Defect Log của file Excel trong test_client.
Tuyệt đối không can thiệp sửa code Backend.
```

---

### TRƯỜNG HỢP 5: Chỉ muốn test riêng 1 Phân hệ hoặc 1 Endpoint cụ thể
* **Mục đích:** Tiết kiệm thời gian, chỉ muốn kiểm tra sâu một tính năng cụ thể vừa code xong (ví dụ: Tạo đơn hàng hoặc Quản lý kho).
* **Prompt copy:**
```text
Hãy tập trung kiểm thử riêng phân hệ [Tên_Phân_Hệ_hoặc_URL_Endpoint, ví dụ: /api/v1/users]:
1. Tạo kịch bản kiểm thử chuyên sâu (Validation, Happy Path, Phân quyền vai trò).
2. Bắn request thật tới Live API để kiểm tra kết quả phản hồi.
3. Cập nhật kết quả của riêng phân hệ này vào file Excel trong test_client.
Không sửa code Backend!
```

---

### Bảng Tóm Tắt Tra Cứu Nhanh:

| Nhu cầu của bạn | Dùng Prompt số | Điểm cốt lõi trong lệnh |
| :--- | :---: | :--- |
| **Có file Excel yêu cầu nghiệp vụ mới** | **Prompt 1** | Đọc Excel ➔ Tạo test ➔ Test API thật ➔ Đổ Excel |
| **Muốn vét sạch các API chưa test** | **Prompt 2** | Quét router thiếu ➔ Tự tạo test ➔ Test luôn ➔ Đổ tiếp Excel |
| **Chỉ muốn xem báo cáo tiến độ** | **Prompt 3** | Quét độ phủ ➔ Xuất bảng thống kê (Không tạo file) |
| **Kiểm tra lại sau khi Dev sửa Bug** | **Prompt 4** | Retest các ca Fail ➔ Cập nhật trạng thái Bug trong Excel |
| **Chỉ test riêng 1 tính năng vừa làm** | **Prompt 5** | Test cục bộ 1 endpoint ➔ Cập nhật dòng tương ứng |
