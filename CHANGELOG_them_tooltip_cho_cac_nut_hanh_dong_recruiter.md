## [2026-05-11 20:44] Thêm Tooltip động cho các nút hành động Quản lý tin đăng tuyển dụng

### Đã làm gì?
- Cải tiến giao diện cột "Hành động" trong danh sách quản lý tin đăng của nhà tuyển dụng (`ManageJobs.tsx`).
- Thay thế các thuộc tính `title` cơ bản bằng các thẻ Tooltip CSS động dạng `group relative` có hiệu ứng chuyển động mượt mà (opacity, duration-200), tự động hiển thị mô tả rõ ràng khi hover chuột lên 3 nút:
  1. **Chỉnh sửa tin đăng** (màu sẫm tối)
  2. **Tạm dừng tin tuyển dụng** (màu vàng hổ phách)
  3. **Xóa tin tuyển dụng** (màu đỏ tươi)

### Tại sao làm vậy?
- Trước đó, các nút này chỉ có các icon nhỏ biểu tượng mà không có label chỉ dẫn rõ ràng. Điều này rất dễ gây nhầm lẫn hoặc bối rối cho Hội đồng phản biện và người sử dụng trong quá trình báo cáo đồ án.
- Tooltip CSS thế hệ mới xuất hiện nhanh lập tức khi hover chuột, mang lại hiệu ứng mượt mà, cao cấp hơn hẳn tooltip mặc định của trình duyệt.

### File bị ảnh hưởng
- `src/pages/recruiter/ManageJobs.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Các thẻ Tooltip được định vị tuyệt đối `absolute` và căn giữa thông minh, tự động điều chỉnh độ z-index thích hợp (`z-50`) để không bị che khuất bởi các thành phần bảng khác.
- Dự án đã được build thành công 100% không phát sinh bất cứ cảnh báo nào.
