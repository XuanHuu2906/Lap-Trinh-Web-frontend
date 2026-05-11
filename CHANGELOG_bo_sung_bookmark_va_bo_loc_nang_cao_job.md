## [2026-05-11 20:34] Bổ sung bộ lọc nâng cao, nút ứng tuyển nhanh, bookmark lưu việc làm và tối ưu sidebar nhà tuyển dụng

### Đã làm gì?
- **Phân hệ ứng viên (Danh sách việc làm - JobList.tsx):**
  - Tích hợp **Bộ lọc nâng cao (Vị trí địa lý, Mức lương mong muốn, Loại hình làm việc)** giúp hỗ trợ hoàn hảo cho **UC-03 (Tìm kiếm việc làm)**.
  - Thêm **Icon Bookmark (Lưu việc làm yêu thích)** trên từng thẻ công việc tương thích trực tiếp với **UC-09 (Lưu việc làm yêu thích)**, có hiệu ứng đổi màu nổi bật khi lưu và thông báo Toast.
  - Thêm **Nút "Ứng tuyển ngay"** trực quan hỗ trợ **UC-07 (Gửi CV ứng tuyển)**, khi nhấp sẽ hiển thị **Hộp thoại biểu mẫu nộp CV** cho phép lựa chọn CV có sẵn trong hệ thống (như CV chính thức hoặc CV thiết kế từ CV Builder) kèm thư giới thiệu cá nhân hóa.
- **Phân hệ Nhà tuyển dụng (Recruiter Layout & Sidebar):**
  - Bỏ nút **"XUẤT BÁO CÁO"** và loại bỏ hoàn toàn banner **"Chiến dịch tuyển dụng"** trong `Overview.tsx` theo yêu cầu tối giản hóa, tránh làm loãng trải nghiệm người dùng bằng các tính năng ngoài Scope.
  - Đổi tên liên kết **"Cài đặt"** trên sidebar thành **"Hồ sơ công ty"** để tăng tính nhất quán và rõ ràng cho giao diện nhà tuyển dụng.
  - Bổ sung menu **"Thông báo"** sử dụng icon `Bell` vào thanh Sidebar liên kết trực tiếp tới trang **Notifications.tsx** để đáp ứng hoàn toàn yêu cầu nghiệp vụ **UC-22 (Nhận thông báo trong hệ thống)**.
  - Tạo mới trang **Notifications.tsx** giả lập trung tâm quản lý thông báo, hỗ trợ đọc, lọc và xóa các thông báo mới về hồ sơ ứng tuyển, tin nhắn, và gia hạn tuyển dụng.

### Tại sao làm vậy?
- Danh sách việc làm trước đây còn sơ sài, thiếu các điểm chạm tương tác cốt lõi của ứng viên như lưu tin yêu thích, ứng tuyển nhanh và lọc nâng cao, khiến các Use Case này bị thiếu hụt trên giao diện.
- Trải nghiệm sidebar và tổng quan của Nhà tuyển dụng chứa nhiều tính năng rác ngoài luồng đồ án, cần được dọn dẹp và bổ sung menu thông báo để đạt độ phủ nghiệp vụ hoàn mỹ.

### File bị ảnh hưởng
- `src/pages/JobList.tsx` (Thay đổi)
- `src/pages/recruiter/Overview.tsx` (Thay đổi)
- `src/components/Sidebar/RecruiterSidebar.tsx` (Thay đổi)
- `src/pages/recruiter/Notifications.tsx` (Mới)
- `src/App.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Tất cả các nút bấm tương tác (Bookmark, Ứng tuyển nhanh, Đọc thông báo) đều được thiết kế đầy đủ tính năng phản hồi trạng thái thông qua Toast Alert, đem lại cảm giác mượt mà và thực tế cho người dùng thử.
- Biên dịch bằng Vite thành công 100% không phát sinh bất kỳ lỗi khai báo dư thừa nào.
