## [2026-05-11 20:53] Sửa tiêu đề trang Cài đặt để phù hợp với nội dung thông tin doanh nghiệp

### Đã làm gì?
- Thay đổi tiêu đề chính của trang Cài đặt (`Settings.tsx`) của nhà tuyển dụng từ *"Cài đặt hệ thống"* thành **"Hồ sơ & Cài đặt"**.

### Tại sao làm vậy?
- Tiêu đề *"Cài đặt hệ thống"* trước đó dễ gây nhầm lẫn với quyền quản trị hệ thống cấp cao của Admin (System Settings / Admin Panel), trong khi thực tế nội dung của trang này tập trung vào quản lý hồ sơ doanh nghiệp (Logo, tên công ty, quy mô, website), thông tin liên hệ và cài đặt tài khoản cá nhân của nhà tuyển dụng.
- Sự thay đổi này đồng bộ hóa hoàn hảo với menu "Hồ sơ công ty" trên thanh Sidebar, đem lại trải nghiệm giao diện chính xác và dễ hiểu hơn cho người dùng.

### File bị ảnh hưởng
- `src/pages/recruiter/Settings.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Dự án đã được build thành công 100% không phát sinh lỗi biên dịch.
