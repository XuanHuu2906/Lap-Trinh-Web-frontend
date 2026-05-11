## [2026-05-11 20:41] Thêm trường Mức lương vào giao diện Đăng tin tuyển dụng

### Đã làm gì?
- Khai báo biến trạng thái `salary` và hàm cập nhật tương ứng `setSalary` bằng `useState` trong `PostJob.tsx`.
- Thêm trường giao diện nhập **"Mức lương tuyển dụng"** kèm nhãn và ghi chú bắt buộc (`*`), cùng ví dụ gợi ý trực quan (Vd: 15 - 20 triệu, Thỏa thuận, 1000 USD...) trong thẻ phần "Thông tin cơ bản".

### Tại sao làm vậy?
- Các tin tuyển dụng ở giao diện cộng đồng bên ngoài đều hiển thị mức lương nhưng trước đó form đăng tin tuyển dụng lại thiếu mất trường nhập liệu này, gây mâu thuẫn dữ liệu và trải nghiệm người dùng chưa hoàn chỉnh.

### File bị ảnh hưởng
- `src/pages/recruiter/PostJob.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Trường Mức lương đã được cấu hình các thuộc tính CSS đồng nhất với các ô nhập liệu khác (chiều cao 11, bo viền, màu chữ, hiệu ứng focus transition) để đảm bảo độ thẩm mỹ cao nhất.
- Đã build và chạy kiểm thử hoàn tất, ứng dụng hoạt động ổn định không có lỗi cú pháp.
