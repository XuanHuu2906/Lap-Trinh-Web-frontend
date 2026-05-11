## [2026-05-11 20:49] Tinh gọn giao diện Quản lý ứng viên và xóa bỏ ghi chú dev (Mã Use Case)

### Đã làm gì?
- **Loại bỏ nút "+ Thêm ứng viên":** Do nhà tuyển dụng không có quyền thêm thủ công hồ sơ ứng viên (ứng viên tự ứng tuyển), nút bấm này đã được xóa bỏ để bảo đảm tính logic tuyệt đối của luồng nghiệp vụ.
- **Xóa bỏ các ghi chú kỹ thuật (Dev annotations):**
  - Xóa bỏ ký hiệu ký tự `(UC-15)` và `(UC-16)` trong dòng phụ đề tiêu đề trang.
  - Xóa bỏ tiền tố `UC-16:` trong phần tiêu đề *"Chấm Điểm & Nhận Xét Nội Bộ"* bên trong Modal đánh giá.
  - Xóa bỏ tiền tố `UC-15:` trong phần tiêu đề *"Phản hồi chính thức cho Ứng viên"* bên trong Modal phản hồi.
- **Dọn dẹp import:** Gỡ bỏ gói import biểu tượng `Plus` không còn sử dụng để bảo vệ tính toàn vẹn và sạch sẽ của mã nguồn.

### Tại sao làm vậy?
- Việc giữ lại nút tự thêm tay và các mã hiệu kỹ thuật (UC) trên giao diện trực quan rất dễ gây bối rối, làm mất đi tính tự nhiên của sản phẩm và dễ bị đặt câu hỏi chất vấn bởi Hội đồng phản biện đồ án trong quá trình báo cáo thực tế.

### File bị ảnh hưởng
- `src/pages/recruiter/ManageCandidates.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Toàn bộ giao diện hiện tại đã đạt độ hoàn thiện cao cấp tuyệt đối, sẵn sàng 100% cho việc thuyết trình và bàn giao.
- Quá trình build dự án hoàn toàn thành công không gặp lỗi TypeScript.
