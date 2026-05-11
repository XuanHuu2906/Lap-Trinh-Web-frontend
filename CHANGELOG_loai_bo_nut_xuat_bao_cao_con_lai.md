## [2026-05-11 20:36] Loại bỏ nút Xuất báo cáo còn lại trong quản lý ứng tuyển của ứng viên

### Đã làm gì?
- Loại bỏ hoàn toàn nút **"Xuất báo cáo"** cùng các gói import liên quan (như `Button`) trong file giao diện quản lý ứng tuyển của ứng viên tại `src/pages/candidate/AppliedJobs.tsx`.
- Điều chỉnh lại cấu trúc thẻ `div` bao bọc vùng tiêu đề (header) của trang ứng tuyển bảo đảm tính toàn vẹn cú pháp HTML và layout chuẩn chỉ.

### Tại sao làm vậy?
- Thống nhất tinh gọn hóa, tránh dư thừa các tính năng báo cáo hoặc thống kê nâng cao nằm ngoài phạm vi phân hệ các Use Case được yêu cầu trong thuyết minh đề tài. Việc này giúp giảm thiểu tối đa các câu hỏi chất vấn không đáng có từ Hội đồng phản biện đồ án.

### File bị ảnh hưởng
- `src/pages/candidate/AppliedJobs.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Quá trình build và đóng gói sản phẩm thông qua Vite đã được kiểm tra nghiêm ngặt và đạt kết quả thành công tuyệt đối 100% không phát sinh lỗi.
