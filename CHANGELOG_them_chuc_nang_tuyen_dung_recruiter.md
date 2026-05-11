## [2026-05-11 20:25] Hoàn thiện 3 chức năng tuyển dụng còn thiếu cho Nhà tuyển dụng (UC-15, UC-16, UC-21)

### Đã làm gì?
- **UC-21 (Chat với ứng viên):**
  - Tạo mới trang `Chat.tsx` cho Nhà tuyển dụng tại `src/pages/recruiter/Chat.tsx`, giả lập kênh chat thời gian thực với các ứng viên đang ứng tuyển (Nguyễn Văn Thái, Trần Thị Mai, Lê Hoàng Hải, v.v.). Có tính năng tự động gõ chữ và phản hồi (typing effect) của ứng viên sau 1.5s dựa trên mảng câu trả lời đặc thù theo từng vị trí.
  - Cập nhật file routing `src/App.tsx` để liên kết `/recruiter/chat` với trang `RecruiterChatPage`.
  - Cập nhật thanh Sidebar nhà tuyển dụng `src/components/Sidebar/RecruiterSidebar.tsx`, thêm nút điều hướng "Trò chuyện" sử dụng icon `MessageSquare` từ `lucide-react`.
- **UC-16 (Đánh giá ứng viên) & UC-15 (Phản hồi ứng viên):**
  - Refactor toàn bộ trang `src/pages/recruiter/ManageCandidates.tsx`: chuyển mảng tĩnh ứng viên thành React state `candidateList` động.
  - Tích hợp **Modal Đánh giá & Phản hồi** chi tiết khi nhấn nút "Xem" (Đánh giá & Phản hồi) trên từng dòng ứng viên.
  - Thực hiện **UC-16**: Tạo hệ thống chấm điểm sao tương tác (clickable star rating từ 1-5 sao) cùng khung nhận xét/ghi chú nội bộ (internal notes) dành riêng cho bộ phận tuyển dụng, có nút lưu trữ cập nhật trực tiếp danh sách.
  - Thực hiện **UC-15**: Thiết kế biểu mẫu phản hồi chính thức cho ứng viên với nút chọn trạng thái tuyển dụng ("Mới", "Đang phỏng vấn", "Đạt", "Không phù hợp"). Có tính năng **Tải mẫu thư tự động** thông minh để nạp sẵn nội dung thư mời phỏng vấn, thư trúng tuyển hoặc thư từ chối tương ứng một cách chuyên nghiệp. Khi gửi phản hồi, trạng thái của ứng viên trên bảng danh sách sẽ tự động đổi màu và đồng bộ ngay lập tức.
- **Tối ưu hóa mã nguồn & Sửa cảnh báo biên dịch:**
  - Loại bỏ các gói import chưa sử dụng như `Link` trong `AdminDashboard.tsx` và `ThumbsUp` trong `ManageCandidates.tsx` để đảm bảo lệnh build `npm run build` chạy thành công với **0 lỗi và 0 cảnh báo**.

### Tại sao làm vậy?
- Theo tài liệu Use Case đánh giá chất lượng đồ án, Phân hệ Nhà tuyển dụng bị thiếu 3 Use Case cực kỳ quan trọng là phản hồi ứng viên (UC-15), chấm điểm nội bộ (UC-16), và liên lạc trò chuyện trực tiếp (UC-21).
- Việc đưa các tính năng này vào các vị trí trực quan giúp nâng cao tính hoàn thiện thực tế của ứng dụng, giúp sinh viên ghi điểm tuyệt đối trong khâu bảo vệ Use Case.

### File bị ảnh hưởng
- `src/pages/recruiter/Chat.tsx` (Mới)
- `src/pages/recruiter/ManageCandidates.tsx` (Thay đổi)
- `src/components/Sidebar/RecruiterSidebar.tsx` (Thay đổi)
- `src/App.tsx` (Thay đổi)
- `src/pages/admin/AdminDashboard.tsx` (Thay đổi)

### Lưu ý / Cẩn thận
- Khi chạy thử trang `ManageCandidates.tsx`, toàn bộ các thay đổi về điểm sao, nhận xét nội bộ hoặc trạng thái phản hồi đều được đồng bộ hóa tức thời trên bộ nhớ React state cục bộ (local state), giúp giảng viên dễ dàng kiểm thử trực tiếp mà không cần cài đặt backend phức tạp.
- File build sản phẩm đã được kiểm tra chạy lệnh `npm run build` hoàn tất thành công 100%.
