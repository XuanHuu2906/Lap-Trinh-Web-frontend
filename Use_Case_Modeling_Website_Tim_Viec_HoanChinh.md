# HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
## KHOA CÔNG NGHỆ THÔNG TIN 1

**TÀI LIỆU USE CASE MODELING**

**Đề tài:** Xây dựng Website tìm việc

**Học phần:** Lập trình web

**Trình độ đào tạo:** Đại học

**Hình thức đào tạo:** Chính quy

---

## 1. Giới thiệu tài liệu

Tài liệu Use Case Modeling này mô tả các tác nhân, danh sách chức năng và đặc tả chi tiết các Use Case chính của hệ thống Website tìm việc. Tài liệu được xây dựng dựa trên yêu cầu đề tài "Xây dựng website tìm việc".

Mục tiêu của hệ thống là hỗ trợ ứng viên tìm kiếm việc làm, tạo CV và ứng tuyển; hỗ trợ nhà tuyển dụng đăng tin, quản lý ứng viên; đồng thời cung cấp công cụ quản trị để quản lý tài khoản, template CV và tin tuyển dụng.

---

## 2. Danh sách tác nhân

| **Tên Actor** | **Mô tả** |
| --- | --- |
| Ứng viên (Candidate) | Người tìm kiếm thông tin tuyển dụng, tạo CV, cá nhân hóa CV và gửi CV ứng tuyển vào các vị trí phù hợp. |
| Nhà tuyển dụng (Recruiter) | Cá nhân hoặc công ty đăng tin tuyển dụng, quản lý danh sách ứng viên, phản hồi và đánh giá ứng viên. |
| Quản trị viên (Admin) | Người đăng nhập vào khu vực quản trị để quản lý tài khoản, template CV và tin tuyển dụng trong hệ thống. |
| Hệ thống (System) | Thực hiện các tác vụ tự động như gửi thông báo, kiểm tra dữ liệu, xác thực người dùng. |

---

## 3. Danh sách Use Case

### 3.1 Use Case chính

| **Mã UC** | **Tên Use Case** | **Actor chính** | **Nhóm chức năng** |
| --- | --- | --- | --- |
| UC-01 | Đăng ký tài khoản ứng viên | Ứng viên | Tài khoản |
| UC-02 | Đăng nhập | Ứng viên, Nhà tuyển dụng | Tài khoản |
| UC-03 | Tìm kiếm việc làm | Ứng viên | Tìm việc |
| UC-04 | Xem chi tiết tin tuyển dụng | Ứng viên | Tìm việc |
| UC-05 | Tạo CV | Ứng viên | Quản lý CV |
| UC-06 | Chỉnh sửa CV | Ứng viên | Quản lý CV |
| UC-07 | Gửi CV ứng tuyển | Ứng viên | Ứng tuyển |
| UC-08 | Xem phản hồi ứng tuyển | Ứng viên | Ứng tuyển |
| UC-09 | Lưu việc làm yêu thích (Bookmark) | Ứng viên | Tìm việc |
| UC-10 | Upload CV từ file PDF | Ứng viên | Quản lý CV |
| UC-11 | Đăng ký tài khoản nhà tuyển dụng | Nhà tuyển dụng | Tài khoản |
| UC-12 | Đăng tin tuyển dụng | Nhà tuyển dụng | Tuyển dụng |
| UC-13 | Quản lý tin tuyển dụng | Nhà tuyển dụng | Tuyển dụng |
| UC-14 | Xem danh sách ứng viên | Nhà tuyển dụng | Tuyển dụng |
| UC-15 | Phản hồi ứng viên | Nhà tuyển dụng | Tuyển dụng |
| UC-16 | Đánh giá ứng viên | Nhà tuyển dụng | Tuyển dụng |
| UC-17 | Đăng nhập quản trị | Quản trị viên | Quản trị |
| UC-18 | Quản lý tài khoản | Quản trị viên | Quản trị |
| UC-19 | Quản lý template CV | Quản trị viên | Quản trị |
| UC-20 | Quản lý tin tuyển dụng (Admin) | Quản trị viên | Quản trị |
| UC-21 | Chat với nhà tuyển dụng | Ứng viên, Nhà tuyển dụng | Giao tiếp |
| UC-22 | Thông báo qua Email | Hệ thống | Thông báo |
| UC-26 | Quên mật khẩu | Ứng viên, Nhà tuyển dụng | Tài khoản |

### 3.2 Use Case hỗ trợ (<<include>> / <<extend>>)

| **Mã UC** | **Tên Use Case** | **Loại** | **Được dùng bởi** |
| --- | --- | --- | --- |
| UC-23 | Kiểm tra thông tin đăng nhập | <<include>> | UC-02, UC-17 |
| UC-24 | Gửi thông báo | <<include>> | UC-07, UC-15, UC-22 |
| UC-25 | Kiểm tra dữ liệu hợp lệ | <<include>> | UC-01, UC-05, UC-06, UC-11, UC-12, UC-19 |

---

## 4. Sơ đồ quan hệ Use Case

### 4.1 Bảng quan hệ <<include>> và <<extend>>

| **Use Case chính** | **Quan hệ** | **Use Case phụ** |
| --- | --- | --- |
| UC-02: Đăng nhập | <<include>> | UC-23: Kiểm tra thông tin đăng nhập |
| UC-17: Đăng nhập quản trị | <<include>> | UC-23: Kiểm tra thông tin đăng nhập |
| UC-01: Đăng ký tài khoản ứng viên | <<include>> | UC-25: Kiểm tra dữ liệu hợp lệ |
| UC-11: Đăng ký tài khoản nhà tuyển dụng | <<include>> | UC-25: Kiểm tra dữ liệu hợp lệ |
| UC-05: Tạo CV | <<include>> | UC-25: Kiểm tra dữ liệu hợp lệ |
| UC-06: Chỉnh sửa CV | <<include>> | UC-25: Kiểm tra dữ liệu hợp lệ |
| UC-12: Đăng tin tuyển dụng | <<include>> | UC-25: Kiểm tra dữ liệu hợp lệ |
| UC-19: Quản lý template CV | <<include>> | UC-25: Kiểm tra dữ liệu hợp lệ |
| UC-07: Gửi CV ứng tuyển | <<include>> | UC-24: Gửi thông báo |
| UC-15: Phản hồi ứng viên | <<include>> | UC-24: Gửi thông báo |
| UC-22: Thông báo qua Email | <<include>> | UC-24: Gửi thông báo |
| UC-02: Đăng nhập | <<extend>> | UC-26: Quên mật khẩu |

---

## 5. Đặc tả chi tiết Use Case

---

### UC-01: Đăng ký tài khoản ứng viên

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Đăng ký tài khoản ứng viên |
| **Mã UC** | UC-01 |
| **Mô tả** | Ứng viên tạo tài khoản mới để sử dụng các chức năng tìm việc, tạo CV và ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên chưa có tài khoản trong hệ thống. |
| **Hậu điều kiện** | Tài khoản ứng viên được tạo thành công và có thể dùng để đăng nhập. |
| **Kích hoạt** | Ứng viên chọn chức năng "Đăng ký" trên trang chủ. |
| **Luồng chính** | 1. Ứng viên mở trang đăng ký. 2. Hệ thống hiển thị form đăng ký. 3. Ứng viên nhập Tên và Email. 4. Ứng viên đặt mật khẩu và xác nhận mật khẩu. 5. Ứng viên nhấn nút "Đăng ký". 6. Hệ thống thực hiện UC-25 (Kiểm tra dữ liệu hợp lệ). 7. Hệ thống lưu thông tin tài khoản. 8. Hệ thống gửi email xác nhận và thông báo đăng ký thành công. |
| **Luồng thay thế** | Ứng viên nhấn "Hủy" để quay lại trang chủ mà không tạo tài khoản. |
| **Ngoại lệ** | Email đã tồn tại trong hệ thống → hệ thống hiển thị thông báo lỗi, yêu cầu nhập email khác. Dữ liệu không hợp lệ (email sai định dạng, mật khẩu quá ngắn) → hệ thống hiển thị thông báo lỗi tương ứng. |
| **UC liên quan** | <<include>> UC-25: Kiểm tra dữ liệu hợp lệ |

---

### UC-02: Đăng nhập

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Đăng nhập |
| **Mã UC** | UC-02 |
| **Mô tả** | Người dùng xác thực tài khoản để truy cập hệ thống theo đúng quyền hạn. |
| **Tác nhân** | Ứng viên, Nhà tuyển dụng |
| **Tiền điều kiện** | Người dùng đã có tài khoản hợp lệ trong hệ thống. |
| **Hậu điều kiện** | Người dùng đăng nhập thành công và được chuyển đến giao diện phù hợp với vai trò. |
| **Kích hoạt** | Người dùng chọn chức năng "Đăng nhập". |
| **Luồng chính** | 1. Người dùng mở trang đăng nhập. 2. Hệ thống hiển thị form đăng nhập. 3. Người dùng nhập Email và mật khẩu. 4. Người dùng nhấn nút "Đăng nhập". 5. Hệ thống thực hiện UC-23 (Kiểm tra thông tin đăng nhập). 6. Hệ thống xác định vai trò người dùng (Ứng viên / Nhà tuyển dụng). 7. Hệ thống chuyển người dùng đến trang tương ứng với vai trò. |
| **Luồng thay thế** | Người dùng chọn "Quên mật khẩu" → hệ thống chuyển sang UC-26. |
| **Ngoại lệ** | Email hoặc mật khẩu không đúng → hệ thống hiển thị thông báo lỗi, không tiết lộ thông tin cụ thể. Tài khoản bị khóa → hệ thống hiển thị thông báo tài khoản không hoạt động. |
| **UC liên quan** | <<include>> UC-23: Kiểm tra thông tin đăng nhập; <<extend>> UC-26: Quên mật khẩu |

---

### UC-03: Tìm kiếm việc làm

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Tìm kiếm việc làm |
| **Mã UC** | UC-03 |
| **Mô tả** | Ứng viên tìm kiếm các tin tuyển dụng phù hợp theo từ khóa và bộ lọc. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Hệ thống có danh sách tin tuyển dụng đang hoạt động. |
| **Hậu điều kiện** | Danh sách việc làm phù hợp với điều kiện tìm kiếm được hiển thị. |
| **Kích hoạt** | Ứng viên nhập từ khóa hoặc chọn bộ lọc tìm kiếm. |
| **Luồng chính** | 1. Ứng viên truy cập trang tìm việc. 2. Hệ thống hiển thị danh sách tất cả tin tuyển dụng đang hoạt động. 3. Ứng viên nhập từ khóa (tên vị trí, công ty, kỹ năng). 4. Ứng viên chọn bộ lọc nếu cần (địa điểm, mức lương, ngành nghề, loại hình công việc). 5. Hệ thống xử lý các điều kiện tìm kiếm. 6. Hệ thống hiển thị danh sách việc làm phù hợp theo thứ tự liên quan. |
| **Luồng thay thế** | Ứng viên không nhập từ khóa → hệ thống hiển thị toàn bộ tin tuyển dụng. Ứng viên xóa bộ lọc → hệ thống hiển thị lại kết quả mặc định. |
| **Ngoại lệ** | Không có kết quả phù hợp → hệ thống hiển thị thông báo "Không tìm thấy việc làm phù hợp" và gợi ý mở rộng tìm kiếm. |
| **UC liên quan** | Không có |

---

### UC-04: Xem chi tiết tin tuyển dụng

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Xem chi tiết tin tuyển dụng |
| **Mã UC** | UC-04 |
| **Mô tả** | Ứng viên xem đầy đủ thông tin của một tin tuyển dụng trước khi quyết định ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Tin tuyển dụng tồn tại và đang hoạt động trong hệ thống. |
| **Hậu điều kiện** | Toàn bộ thông tin chi tiết của tin tuyển dụng được hiển thị cho ứng viên. |
| **Kích hoạt** | Ứng viên nhấn vào một tin tuyển dụng trong danh sách. |
| **Luồng chính** | 1. Ứng viên chọn tin tuyển dụng muốn xem. 2. Hệ thống lấy thông tin chi tiết của tin tuyển dụng. 3. Hệ thống hiển thị: tiêu đề, mô tả công việc, yêu cầu, mức lương, địa điểm, hạn nộp hồ sơ và thông tin nhà tuyển dụng. 4. Hệ thống hiển thị nút "Ứng tuyển ngay" và nút "Lưu việc làm". |
| **Luồng thay thế** | Ứng viên nhấn "Quay lại" → hệ thống trở về danh sách tìm kiếm. |
| **Ngoại lệ** | Tin tuyển dụng đã bị xóa hoặc hết hạn → hệ thống hiển thị thông báo "Tin tuyển dụng này không còn tồn tại". |
| **UC liên quan** | Không có |

---

### UC-05: Tạo CV

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Tạo CV |
| **Mã UC** | UC-05 |
| **Mô tả** | Ứng viên tạo CV cá nhân dựa trên các template CV có sẵn trong hệ thống. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập. Hệ thống có ít nhất một template CV. |
| **Hậu điều kiện** | CV của ứng viên được tạo và lưu vào hệ thống, sẵn sàng để gửi ứng tuyển. |
| **Kích hoạt** | Ứng viên chọn chức năng "Tạo CV mới". |
| **Luồng chính** | 1. Ứng viên mở trang tạo CV. 2. Hệ thống hiển thị danh sách template CV có sẵn (do Admin quản lý). 3. Ứng viên chọn một template phù hợp. 4. Hệ thống hiển thị form nhập thông tin CV theo template đã chọn. 5. Ứng viên nhập thông tin: thông tin cá nhân, mục tiêu nghề nghiệp, học vấn, kinh nghiệm làm việc, kỹ năng, chứng chỉ. 6. Ứng viên nhấn "Xem trước" để kiểm tra giao diện CV. 7. Ứng viên nhấn "Lưu CV". 8. Hệ thống thực hiện UC-25 (Kiểm tra dữ liệu hợp lệ). 9. Hệ thống lưu CV và thông báo thành công. |
| **Luồng thay thế** | Ứng viên muốn đổi template → hệ thống cho phép chọn lại template mà không mất dữ liệu đã nhập. Ứng viên nhấn "Lưu nháp" → hệ thống lưu trạng thái chưa hoàn chỉnh. |
| **Ngoại lệ** | Dữ liệu CV thiếu các trường bắt buộc → hệ thống hiển thị cảnh báo và yêu cầu nhập lại. Hết phiên đăng nhập trong quá trình tạo CV → hệ thống lưu nháp và yêu cầu đăng nhập lại. |
| **UC liên quan** | <<include>> UC-25: Kiểm tra dữ liệu hợp lệ |

---

### UC-06: Chỉnh sửa CV

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Chỉnh sửa CV |
| **Mã UC** | UC-06 |
| **Mô tả** | Ứng viên cập nhật nội dung CV đã tạo để cá nhân hóa và cập nhật hồ sơ ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập và có ít nhất một CV được lưu trong hệ thống. |
| **Hậu điều kiện** | Thông tin CV được cập nhật thành công. |
| **Kích hoạt** | Ứng viên chọn CV cần chỉnh sửa trong trang quản lý CV cá nhân. |
| **Luồng chính** | 1. Ứng viên mở trang quản lý CV cá nhân. 2. Hệ thống hiển thị danh sách các CV đã tạo. 3. Ứng viên chọn CV cần chỉnh sửa và nhấn "Chỉnh sửa". 4. Hệ thống hiển thị nội dung CV hiện tại theo dạng form chỉnh sửa. 5. Ứng viên cập nhật các thông tin cần thay đổi. 6. Ứng viên nhấn "Xem trước" nếu muốn kiểm tra giao diện. 7. Ứng viên nhấn "Lưu thay đổi". 8. Hệ thống thực hiện UC-25 (Kiểm tra dữ liệu hợp lệ). 9. Hệ thống cập nhật CV và thông báo thành công. |
| **Luồng thay thế** | Ứng viên nhấn "Hủy" → hệ thống hỏi xác nhận và quay lại danh sách CV mà không lưu thay đổi. |
| **Ngoại lệ** | CV không còn tồn tại → hệ thống thông báo lỗi và chuyển về danh sách CV. Dữ liệu không hợp lệ → hệ thống yêu cầu nhập lại các trường lỗi. |
| **UC liên quan** | <<include>> UC-25: Kiểm tra dữ liệu hợp lệ |

---

### UC-07: Gửi CV ứng tuyển

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Gửi CV ứng tuyển |
| **Mã UC** | UC-07 |
| **Mô tả** | Ứng viên gửi CV của mình cho nhà tuyển dụng để ứng tuyển vào vị trí tuyển dụng. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập. Ứng viên có ít nhất một CV. Tin tuyển dụng đang hoạt động và chưa hết hạn. |
| **Hậu điều kiện** | Hồ sơ ứng tuyển được lưu vào hệ thống. Nhà tuyển dụng nhận được thông báo có ứng viên mới. |
| **Kích hoạt** | Ứng viên nhấn nút "Ứng tuyển ngay" trong trang chi tiết tin tuyển dụng. |
| **Luồng chính** | 1. Ứng viên mở trang chi tiết tin tuyển dụng. 2. Ứng viên nhấn nút "Ứng tuyển ngay". 3. Hệ thống hiển thị danh sách CV của ứng viên để chọn. 4. Ứng viên chọn CV muốn gửi. 5. Ứng viên có thể nhập thêm thư xin việc (cover letter). 6. Ứng viên nhấn "Xác nhận ứng tuyển". 7. Hệ thống lưu hồ sơ ứng tuyển với trạng thái "Đang chờ xử lý". 8. Hệ thống thực hiện UC-24 (Gửi thông báo) đến nhà tuyển dụng. |
| **Luồng thay thế** | Ứng viên chưa có CV → hệ thống thông báo và chuyển đến UC-05 (Tạo CV). Ứng viên muốn upload CV mới → hệ thống chuyển đến UC-10. |
| **Ngoại lệ** | Ứng viên đã ứng tuyển vị trí này trước đó → hệ thống thông báo trùng lặp và từ chối. Tin tuyển dụng đã đóng hoặc hết hạn → hệ thống thông báo không thể ứng tuyển. |
| **UC liên quan** | <<include>> UC-24: Gửi thông báo |

---

### UC-08: Xem phản hồi ứng tuyển

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Xem phản hồi ứng tuyển |
| **Mã UC** | UC-08 |
| **Mô tả** | Ứng viên xem trạng thái, phản hồi, kết quả và đánh giá từ nhà tuyển dụng cho các hồ sơ đã ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập và đã gửi ít nhất một hồ sơ ứng tuyển. |
| **Hậu điều kiện** | Trạng thái và phản hồi ứng tuyển được hiển thị cho ứng viên. |
| **Kích hoạt** | Ứng viên mở trang "Quản lý ứng tuyển". |
| **Luồng chính** | 1. Ứng viên truy cập trang Quản lý ứng tuyển. 2. Hệ thống hiển thị danh sách tất cả hồ sơ đã ứng tuyển kèm trạng thái hiện tại (Đang chờ / Đã xem / Phù hợp / Không phù hợp). 3. Ứng viên chọn một hồ sơ ứng tuyển cụ thể. 4. Hệ thống hiển thị chi tiết: trạng thái, phản hồi nội dung và điểm đánh giá từ nhà tuyển dụng. |
| **Luồng thay thế** | Ứng viên lọc danh sách theo trạng thái ứng tuyển để dễ theo dõi. |
| **Ngoại lệ** | Hồ sơ chưa được nhà tuyển dụng xem → hệ thống hiển thị trạng thái "Đang chờ xử lý". |
| **UC liên quan** | Không có |

---

### UC-09: Lưu việc làm yêu thích (Bookmark)

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Lưu việc làm yêu thích (Bookmark) |
| **Mã UC** | UC-09 |
| **Mô tả** | Ứng viên lưu các tin tuyển dụng quan tâm vào danh sách yêu thích để xem lại sau. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập. Tin tuyển dụng tồn tại trong hệ thống. |
| **Hậu điều kiện** | Tin tuyển dụng được lưu vào danh sách yêu thích của ứng viên (hoặc bỏ lưu nếu đã lưu trước đó). |
| **Kích hoạt** | Ứng viên nhấn biểu tượng "Lưu" / "Bookmark" trên tin tuyển dụng. |
| **Luồng chính** | 1. Ứng viên xem tin tuyển dụng (trang danh sách hoặc trang chi tiết). 2. Ứng viên nhấn biểu tượng Bookmark. 3. Hệ thống lưu tin vào danh sách yêu thích. 4. Hệ thống cập nhật biểu tượng thành "đã lưu" và thông báo thành công. 5. Ứng viên có thể vào trang "Việc làm đã lưu" để xem lại toàn bộ danh sách. |
| **Luồng thay thế** | Ứng viên nhấn Bookmark trên tin đã lưu → hệ thống hỏi xác nhận và xóa khỏi danh sách yêu thích. |
| **Ngoại lệ** | Ứng viên chưa đăng nhập → hệ thống yêu cầu đăng nhập trước khi lưu. |
| **UC liên quan** | Không có |

---

### UC-10: Upload CV từ file PDF

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Upload CV từ file PDF |
| **Mã UC** | UC-10 |
| **Mô tả** | Ứng viên tải lên CV có sẵn dạng file PDF thay vì tạo CV qua template trực tuyến. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập. Ứng viên có file CV định dạng PDF trên thiết bị. |
| **Hậu điều kiện** | File CV PDF được lưu vào hệ thống và sẵn sàng để gửi ứng tuyển. |
| **Kích hoạt** | Ứng viên chọn "Upload CV từ file" trong trang quản lý CV. |
| **Luồng chính** | 1. Ứng viên mở trang quản lý CV cá nhân. 2. Ứng viên chọn chức năng "Upload CV từ file". 3. Hệ thống hiển thị giao diện chọn file. 4. Ứng viên chọn file PDF từ thiết bị. 5. Hệ thống kiểm tra định dạng (chỉ chấp nhận PDF) và kích thước file (tối đa 5MB). 6. Hệ thống upload và lưu file CV. 7. Ứng viên đặt tên cho CV vừa upload. 8. Hệ thống thông báo upload thành công, CV xuất hiện trong danh sách. |
| **Luồng thay thế** | Ứng viên kéo thả (drag & drop) file vào khu vực upload. |
| **Ngoại lệ** | File không đúng định dạng PDF → hệ thống từ chối và thông báo yêu cầu chọn file PDF. File vượt quá kích thước tối đa → hệ thống thông báo lỗi dung lượng. |
| **UC liên quan** | Không có |

---

### UC-11: Đăng ký tài khoản nhà tuyển dụng

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Đăng ký tài khoản nhà tuyển dụng |
| **Mã UC** | UC-11 |
| **Mô tả** | Nhà tuyển dụng tạo tài khoản để sử dụng chức năng đăng tin và quản lý ứng viên. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng chưa có tài khoản trong hệ thống. |
| **Hậu điều kiện** | Tài khoản nhà tuyển dụng được tạo thành công và có thể đăng nhập. |
| **Kích hoạt** | Nhà tuyển dụng chọn "Đăng ký tài khoản nhà tuyển dụng". |
| **Luồng chính** | 1. Nhà tuyển dụng mở trang đăng ký. 2. Hệ thống hiển thị form đăng ký dành cho nhà tuyển dụng. 3. Nhà tuyển dụng nhập: Tên công ty hoặc Tên cá nhân, Email, Mật khẩu và Xác nhận mật khẩu. 4. Nhà tuyển dụng có thể nhập thêm: Số điện thoại, Website công ty, Mô tả công ty. 5. Nhà tuyển dụng nhấn nút "Đăng ký". 6. Hệ thống thực hiện UC-25 (Kiểm tra dữ liệu hợp lệ). 7. Hệ thống lưu tài khoản nhà tuyển dụng. 8. Hệ thống gửi email xác nhận và thông báo đăng ký thành công. |
| **Luồng thay thế** | Nhà tuyển dụng nhấn "Hủy" → quay lại trang chủ. |
| **Ngoại lệ** | Email đã tồn tại → hệ thống thông báo lỗi và yêu cầu dùng email khác. Mật khẩu không đúng định dạng yêu cầu → hệ thống hiển thị cảnh báo. |
| **UC liên quan** | <<include>> UC-25: Kiểm tra dữ liệu hợp lệ |

---

### UC-12: Đăng tin tuyển dụng

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Đăng tin tuyển dụng |
| **Mã UC** | UC-12 |
| **Mô tả** | Nhà tuyển dụng tạo và đăng tin tuyển dụng để tìm kiếm ứng viên phù hợp. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập. |
| **Hậu điều kiện** | Tin tuyển dụng được lưu và hiển thị trên hệ thống cho ứng viên tìm thấy. |
| **Kích hoạt** | Nhà tuyển dụng chọn "Đăng tin tuyển dụng mới". |
| **Luồng chính** | 1. Nhà tuyển dụng mở trang đăng tin. 2. Hệ thống hiển thị form nhập thông tin tuyển dụng. 3. Nhà tuyển dụng nhập: Tiêu đề vị trí, Mô tả công việc, Yêu cầu ứng viên, Quyền lợi, Mức lương, Địa điểm làm việc, Hạn nộp hồ sơ, Ngành nghề. 4. Nhà tuyển dụng nhấn nút "Đăng tin". 5. Hệ thống thực hiện UC-25 (Kiểm tra dữ liệu hợp lệ). 6. Hệ thống lưu tin tuyển dụng với trạng thái "Đang hoạt động". 7. Hệ thống thông báo đăng tin thành công. |
| **Luồng thay thế** | Nhà tuyển dụng nhấn "Lưu nháp" → hệ thống lưu tin ở trạng thái "Nháp", chưa hiển thị công khai. |
| **Ngoại lệ** | Thiếu các trường thông tin bắt buộc → hệ thống highlight và yêu cầu điền đầy đủ. |
| **UC liên quan** | <<include>> UC-25: Kiểm tra dữ liệu hợp lệ |

---

### UC-13: Quản lý tin tuyển dụng (Nhà tuyển dụng)

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Quản lý tin tuyển dụng |
| **Mã UC** | UC-13 |
| **Mô tả** | Nhà tuyển dụng xem, cập nhật, đóng hoặc xóa các tin tuyển dụng đã đăng. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập và có ít nhất một tin tuyển dụng. |
| **Hậu điều kiện** | Tin tuyển dụng được cập nhật, đóng hoặc xóa theo thao tác của nhà tuyển dụng. |
| **Kích hoạt** | Nhà tuyển dụng mở trang "Quản lý tin tuyển dụng". |
| **Luồng chính** | 1. Nhà tuyển dụng truy cập trang quản lý tin tuyển dụng. 2. Hệ thống hiển thị danh sách tất cả tin đã đăng kèm trạng thái (Nháp / Đang hoạt động / Đã đóng). 3. Nhà tuyển dụng chọn tin cần thao tác. 4. Nhà tuyển dụng chọn hành động: Sửa tin, Đóng tin hoặc Xóa tin. 5. Hệ thống thực hiện thao tác tương ứng. 6. Hệ thống cập nhật danh sách và thông báo kết quả. |
| **Luồng thay thế** | Nhà tuyển dụng xem chi tiết tin trước khi chỉnh sửa. Nhà tuyển dụng lọc tin theo trạng thái. |
| **Ngoại lệ** | Tin tuyển dụng đang có ứng viên đang xử lý → hệ thống cảnh báo trước khi cho phép xóa. Thao tác không thuộc tài khoản hiện tại → hệ thống từ chối. |
| **UC liên quan** | Không có |

---

### UC-14: Xem danh sách ứng viên

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Xem danh sách ứng viên |
| **Mã UC** | UC-14 |
| **Mô tả** | Nhà tuyển dụng xem danh sách ứng viên đã ứng tuyển vào từng tin tuyển dụng. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập và có tin tuyển dụng với ứng viên đã ứng tuyển. |
| **Hậu điều kiện** | Danh sách ứng viên và thông tin hồ sơ được hiển thị. |
| **Kích hoạt** | Nhà tuyển dụng chọn một tin tuyển dụng để xem danh sách ứng viên. |
| **Luồng chính** | 1. Nhà tuyển dụng mở trang quản lý tin tuyển dụng. 2. Nhà tuyển dụng chọn tin cần xem ứng viên. 3. Hệ thống lấy danh sách tất cả hồ sơ ứng tuyển cho tin này. 4. Hệ thống hiển thị: tên ứng viên, ngày ứng tuyển, trạng thái xử lý, và CV đã gửi. 5. Nhà tuyển dụng có thể nhấn vào từng ứng viên để xem chi tiết CV và thư xin việc. |
| **Luồng thay thế** | Nhà tuyển dụng lọc ứng viên theo trạng thái xử lý (Chưa xem / Đã xem / Phù hợp / Không phù hợp). |
| **Ngoại lệ** | Chưa có ứng viên ứng tuyển → hệ thống hiển thị danh sách trống và thông báo phù hợp. |
| **UC liên quan** | Không có |

---

### UC-15: Phản hồi ứng viên

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Phản hồi ứng viên |
| **Mã UC** | UC-15 |
| **Mô tả** | Nhà tuyển dụng gửi phản hồi về kết quả ứng tuyển đến ứng viên. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập. Ứng viên đã gửi hồ sơ ứng tuyển. |
| **Hậu điều kiện** | Phản hồi được lưu. Ứng viên nhận được thông báo về kết quả. |
| **Kích hoạt** | Nhà tuyển dụng chọn hồ sơ ứng viên và nhấn "Phản hồi". |
| **Luồng chính** | 1. Nhà tuyển dụng mở danh sách ứng viên (UC-14). 2. Nhà tuyển dụng chọn một ứng viên để phản hồi. 3. Hệ thống hiển thị thông tin ứng viên và CV đã gửi. 4. Nhà tuyển dụng chọn kết quả: Phù hợp / Không phù hợp / Mời phỏng vấn. 5. Nhà tuyển dụng nhập nội dung phản hồi chi tiết. 6. Nhà tuyển dụng nhấn "Gửi phản hồi". 7. Hệ thống lưu phản hồi và cập nhật trạng thái hồ sơ. 8. Hệ thống thực hiện UC-24 (Gửi thông báo) đến ứng viên. |
| **Luồng thay thế** | Nhà tuyển dụng lưu nháp phản hồi để gửi sau. |
| **Ngoại lệ** | Nội dung phản hồi để trống → hệ thống yêu cầu nhập nội dung trước khi gửi. |
| **UC liên quan** | <<include>> UC-24: Gửi thông báo |

---

### UC-16: Đánh giá ứng viên

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Đánh giá ứng viên |
| **Mã UC** | UC-16 |
| **Mô tả** | Nhà tuyển dụng ghi chú đánh giá nội bộ về ứng viên dựa trên CV và hồ sơ ứng tuyển. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập. Ứng viên đã gửi CV ứng tuyển. |
| **Hậu điều kiện** | Đánh giá ứng viên được lưu vào hệ thống (nội bộ, ứng viên không thấy trực tiếp). |
| **Kích hoạt** | Nhà tuyển dụng chọn chức năng "Đánh giá" trên hồ sơ ứng viên. |
| **Luồng chính** | 1. Nhà tuyển dụng mở hồ sơ ứng viên. 2. Hệ thống hiển thị CV và thông tin ứng tuyển. 3. Nhà tuyển dụng nhập nhận xét nội bộ. 4. Nhà tuyển dụng chọn mức đánh giá (ví dụ: 1–5 sao hoặc Xuất sắc / Tốt / Trung bình / Không phù hợp). 5. Nhà tuyển dụng nhấn "Lưu đánh giá". 6. Hệ thống lưu đánh giá vào hồ sơ ứng viên. |
| **Luồng thay thế** | Nhà tuyển dụng chỉnh sửa đánh giá đã lưu trước đó. |
| **Ngoại lệ** | Dữ liệu đánh giá không hợp lệ (không chọn mức đánh giá) → hệ thống yêu cầu hoàn thiện trước khi lưu. |
| **UC liên quan** | Không có |

---

### UC-17: Đăng nhập quản trị

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Đăng nhập quản trị |
| **Mã UC** | UC-17 |
| **Mô tả** | Quản trị viên xác thực danh tính để truy cập khu vực quản lý hệ thống. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên có tài khoản Admin hợp lệ trong hệ thống. |
| **Hậu điều kiện** | Quản trị viên truy cập thành công vào Dashboard quản trị. |
| **Kích hoạt** | Quản trị viên mở trang đăng nhập quản trị. |
| **Luồng chính** | 
1. Quản trị viên truy cập trang đăng nhập quản trị (URL riêng /admin). 
2. Hệ thống hiển thị form đăng nhập. 
3. Quản trị viên nhập Email và Mật khẩu. 
4. Quản trị viên nhấn "Đăng nhập". 
5. Hệ thống thực hiện UC-23 (Kiểm tra thông tin đăng nhập). 
6. Hệ thống xác nhận tài khoản có quyền Admin. 
7. Hệ thống chuyển Quản trị viên đến Dashboard quản trị. |
| **Luồng thay thế** | Không có. |
| **Ngoại lệ** | Sai thông tin đăng nhập → hệ thống thông báo lỗi chung (không tiết lộ trường sai cụ thể). Tài khoản không có quyền Admin → hệ thống từ chối truy cập và ghi log bảo mật. |
| **UC liên quan** | <<include>> UC-23: Kiểm tra thông tin đăng nhập |

---

### UC-18: Quản lý tài khoản

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Quản lý tài khoản |
| **Mã UC** | UC-18 |
| **Mô tả** | Quản trị viên xem, chỉnh sửa thông tin hoặc xóa tài khoản ứng viên và nhà tuyển dụng trong hệ thống. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập vào khu vực quản trị. |
| **Hậu điều kiện** | Thông tin tài khoản được cập nhật hoặc xóa khỏi hệ thống. |
| **Kích hoạt** | Quản trị viên chọn chức năng "Quản lý tài khoản" trên Dashboard. |
| **Luồng chính** | 
1. Quản trị viên mở trang quản lý tài khoản. 
2. Hệ thống hiển thị danh sách tất cả tài khoản (ứng viên và nhà tuyển dụng) kèm thông tin cơ bản và trạng thái. 
3. Quản trị viên có thể tìm kiếm theo tên hoặc email. 
4. Quản trị viên chọn tài khoản cần thao tác. 
5. Quản trị viên chọn hành động: Xem chi tiết, Sửa thông tin, Khóa tài khoản hoặc Xóa tài khoản. 
6. Hệ thống thực hiện thao tác tương ứng. 
7. Hệ thống cập nhật danh sách và ghi log hành động. |
| **Luồng thay thế** | Quản trị viên lọc tài khoản theo loại (Ứng viên / Nhà tuyển dụng) hoặc theo trạng thái (Hoạt động / Bị khóa). |
| **Ngoại lệ** | Tài khoản không tồn tại → hệ thống thông báo lỗi. Xóa tài khoản đang có dữ liệu liên quan → hệ thống yêu cầu xác nhận và cảnh báo trước khi thực hiện. |
| **UC liên quan** | Không có |

---

### UC-19: Quản lý template CV

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Quản lý template CV |
| **Mã UC** | UC-19 |
| **Mô tả** | Quản trị viên thêm, chỉnh sửa hoặc xóa các template CV có sẵn mà ứng viên dùng để tạo CV. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập vào khu vực quản trị. |
| **Hậu điều kiện** | Danh sách template CV trong hệ thống được cập nhật theo thao tác của Admin. |
| **Kích hoạt** | Quản trị viên chọn chức năng "Quản lý template CV". |
| **Luồng chính** | 
1. Quản trị viên mở trang quản lý template CV. 
2. Hệ thống hiển thị danh sách template CV hiện có (tên, hình ảnh xem trước, trạng thái). 
3. Quản trị viên chọn thao tác: Thêm mới, Sửa hoặc Xóa template. 
4. Nếu Thêm/Sửa: Quản trị viên nhập tên template, upload file thiết kế và cấu hình các trường thông tin. 
5. Quản trị viên nhấn "Xem trước" để kiểm tra giao diện template. 
6. Quản trị viên nhấn "Lưu". 
7. Hệ thống thực hiện UC-25 (Kiểm tra dữ liệu hợp lệ) và lưu thay đổi. |
| **Luồng thay thế** | Quản trị viên ẩn template (không xóa) → ứng viên không thấy template nhưng CV đã tạo từ template này vẫn giữ nguyên. |
| **Ngoại lệ** | Xóa template đang được dùng bởi ứng viên → hệ thống cảnh báo và từ chối xóa. Dữ liệu template không hợp lệ → hệ thống hiển thị lỗi tương ứng. |
| **UC liên quan** | <<include>> UC-25: Kiểm tra dữ liệu hợp lệ |

---

### UC-20: Quản lý tin tuyển dụng (Admin)

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Quản lý tin tuyển dụng (Admin) |
| **Mã UC** | UC-20 |
| **Mô tả** | Quản trị viên kiểm duyệt, chỉnh sửa hoặc gỡ bỏ các tin tuyển dụng của nhà tuyển dụng trên toàn hệ thống. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập vào khu vực quản trị. |
| **Hậu điều kiện** | Danh sách tin tuyển dụng được kiểm duyệt và cập nhật. |
| **Kích hoạt** | Quản trị viên chọn chức năng "Quản lý tin tuyển dụng" trên Dashboard. |
| **Luồng chính** | 
1. Quản trị viên mở trang quản lý tin tuyển dụng. 
2. Hệ thống hiển thị toàn bộ tin tuyển dụng của tất cả nhà tuyển dụng kèm trạng thái và thông tin cơ bản. 
3. Quản trị viên có thể tìm kiếm theo tiêu đề hoặc theo nhà tuyển dụng. 
4. Quản trị viên chọn tin cần thao tác. 
5. Quản trị viên chọn: Xem chi tiết, Xóa tin. 
6. Hệ thống thực hiện thao tác và cập nhật danh sách. |
| **Luồng thay thế** | Quản trị viên lọc tin theo trạng thái (Đang hoạt động / Nháp / Đã đóng). |
| **Ngoại lệ** | Tin tuyển dụng không tồn tại → hệ thống thông báo lỗi. |
| **UC liên quan** | Không có |

---

### UC-21: Chat với nhà tuyển dụng

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Chat với nhà tuyển dụng |
| **Mã UC** | UC-21 |
| **Mô tả** | Ứng viên và nhà tuyển dụng trao đổi trực tiếp qua hệ thống nhắn tin nội bộ của website. |
| **Tác nhân** | Ứng viên, Nhà tuyển dụng |
| **Tiền điều kiện** | Cả hai bên đã đăng nhập. Ứng viên đã ứng tuyển vào ít nhất một tin tuyển dụng của nhà tuyển dụng (để mở kênh chat). |
| **Hậu điều kiện** | Tin nhắn được gửi và lưu trong lịch sử hội thoại. Bên nhận được thông báo có tin nhắn mới. |
| **Kích hoạt** | Ứng viên hoặc nhà tuyển dụng nhấn nút "Nhắn tin" trong giao diện của mình. |
| **Luồng chính** | 1. Người dùng mở trang Chat / Hộp thư. 2. Hệ thống hiển thị danh sách các hội thoại hiện có. 3. Người dùng chọn hoặc mở hội thoại mới với đối tác. 4. Hệ thống hiển thị lịch sử tin nhắn của hội thoại đó. 5. Người dùng nhập nội dung tin nhắn và nhấn "Gửi". 6. Hệ thống lưu tin nhắn và cập nhật giao diện chat theo thời gian thực. 7. Hệ thống gửi thông báo đến bên nhận nếu họ không đang trong hội thoại. |
| **Luồng thay thế** | Người dùng có thể đính kèm file (CV, tài liệu) vào tin nhắn. Người dùng tìm kiếm lịch sử hội thoại theo tên đối tác. |
| **Ngoại lệ** | Mất kết nối internet → hệ thống thông báo lỗi kết nối, tin nhắn chưa gửi được lưu nháp. Người dùng bị chặn → hệ thống thông báo không thể gửi tin nhắn. |
| **UC liên quan** | Không có |

---

### UC-22: Thông báo qua Email

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Thông báo qua Email |
| **Mã UC** | UC-22 |
| **Mô tả** | Hệ thống tự động gửi email thông báo đến người dùng khi có sự kiện liên quan (ứng tuyển mới, phản hồi, kết quả). |
| **Tác nhân** | Hệ thống (System), Ứng viên (nhận), Nhà tuyển dụng (nhận) |
| **Tiền điều kiện** | Người dùng đã đăng ký tài khoản với email hợp lệ. Một sự kiện kích hoạt thông báo xảy ra trong hệ thống. |
| **Hậu điều kiện** | Email thông báo được gửi thành công đến người dùng liên quan. |
| **Kích hoạt** | Được kích hoạt tự động bởi các sự kiện: ứng viên gửi CV (UC-07), nhà tuyển dụng phản hồi (UC-15), tài khoản đăng ký thành công (UC-01, UC-11), yêu cầu đặt lại mật khẩu (UC-26). |
| **Luồng chính** | 1. Hệ thống phát hiện sự kiện kích hoạt thông báo. 2. Hệ thống xác định người nhận và loại thông báo cần gửi. 3. Hệ thống tạo nội dung email dựa trên template email tương ứng (đăng ký, ứng tuyển, phản hồi, kết quả). 4. Hệ thống thực hiện UC-24 (Gửi thông báo) để gửi email. 5. Hệ thống ghi log kết quả gửi email (thành công / thất bại). |
| **Luồng thay thế** | Người dùng có thể cấu hình bật/tắt từng loại thông báo email trong phần Cài đặt tài khoản. |
| **Ngoại lệ** | Địa chỉ email không tồn tại hoặc hộp thư đầy → hệ thống ghi log lỗi và có thể thử lại sau một khoảng thời gian. Dịch vụ email bị gián đoạn → hệ thống đưa vào hàng đợi và gửi lại khi dịch vụ phục hồi. |
| **UC liên quan** | <<include>> UC-24: Gửi thông báo |

---

### UC-23: Kiểm tra thông tin đăng nhập *(Use Case hỗ trợ)*

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Kiểm tra thông tin đăng nhập |
| **Mã UC** | UC-23 |
| **Mô tả** | Hệ thống xác thực email và mật khẩu của người dùng khi đăng nhập. |
| **Tác nhân** | Hệ thống |
| **Tiền điều kiện** | Người dùng đã cung cấp email và mật khẩu. |
| **Hậu điều kiện** | Kết quả xác thực (thành công / thất bại) được trả về cho Use Case gọi. |
| **Kích hoạt** | Được gọi bởi UC-02 (Đăng nhập) và UC-17 (Đăng nhập quản trị). |
| **Luồng chính** | 1. Hệ thống nhận email và mật khẩu. 2. Hệ thống kiểm tra email có tồn tại trong CSDL. 3. Hệ thống so sánh mật khẩu đã mã hóa. 4. Hệ thống trả về kết quả xác thực thành công kèm thông tin vai trò người dùng. |
| **Ngoại lệ** | Email không tồn tại hoặc mật khẩu sai → trả về lỗi xác thực. Tài khoản bị khóa → trả về lỗi trạng thái tài khoản. |
| **UC liên quan** | <<include>> bởi UC-02, UC-17 |

---

### UC-24: Gửi thông báo *(Use Case hỗ trợ)*

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Gửi thông báo |
| **Mã UC** | UC-24 |
| **Mô tả** | Hệ thống gửi thông báo đến người dùng liên quan qua email và/hoặc thông báo trong ứng dụng. |
| **Tác nhân** | Hệ thống |
| **Tiền điều kiện** | Có sự kiện phát sinh cần gửi thông báo. Người nhận có tài khoản hợp lệ trong hệ thống. |
| **Hậu điều kiện** | Thông báo được gửi đến người dùng qua kênh phù hợp (email, in-app). |
| **Kích hoạt** | Được gọi bởi UC-07, UC-15, UC-22. |
| **Luồng chính** | 1. Hệ thống nhận thông tin sự kiện và người nhận. 2. Hệ thống tạo nội dung thông báo phù hợp. 3. Hệ thống gửi thông báo in-app (hiển thị trong website). 4. Hệ thống gọi dịch vụ email để gửi email thông báo. 5. Hệ thống lưu log kết quả gửi thông báo. |
| **Ngoại lệ** | Gửi email thất bại → hệ thống vẫn gửi thông báo in-app và ghi nhận lỗi email. |
| **UC liên quan** | <<include>> bởi UC-07, UC-15, UC-22 |

---

### UC-25: Kiểm tra dữ liệu hợp lệ *(Use Case hỗ trợ)*

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Kiểm tra dữ liệu hợp lệ |
| **Mã UC** | UC-25 |
| **Mô tả** | Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào từ người dùng trước khi thực hiện lưu trữ. |
| **Tác nhân** | Hệ thống |
| **Tiền điều kiện** | Người dùng đã nhập dữ liệu vào form. |
| **Hậu điều kiện** | Kết quả kiểm tra (hợp lệ / không hợp lệ) được trả về kèm thông báo lỗi cụ thể nếu có. |
| **Kích hoạt** | Được gọi bởi UC-01, UC-05, UC-06, UC-11, UC-12, UC-19. |
| **Luồng chính** | 1. Hệ thống nhận dữ liệu đầu vào. 2. Hệ thống kiểm tra các trường bắt buộc không được để trống. 3. Hệ thống kiểm tra định dạng (email, số điện thoại, URL...). 4. Hệ thống kiểm tra ràng buộc nghiệp vụ (email chưa tồn tại, mật khẩu đủ độ dài...). 5. Nếu hợp lệ → trả về kết quả thành công. |
| **Ngoại lệ** | Phát hiện dữ liệu không hợp lệ → trả về danh sách lỗi kèm trường lỗi cụ thể để hiển thị trên form. |
| **UC liên quan** | <<include>> bởi UC-01, UC-05, UC-06, UC-11, UC-12, UC-19 |

---

### UC-26: Quên mật khẩu

| **Trường** | **Nội dung** |
| --- | --- |
| **Tên Use Case** | Quên mật khẩu |
| **Mã UC** | UC-26 |
| **Mô tả** | Người dùng yêu cầu đặt lại mật khẩu thông qua email đã đăng ký khi quên mật khẩu. |
| **Tác nhân** | Ứng viên, Nhà tuyển dụng |
| **Tiền điều kiện** | Người dùng có tài khoản hợp lệ trong hệ thống. Người dùng đang ở trang đăng nhập. |
| **Hậu điều kiện** | Mật khẩu của người dùng được cập nhật thành công. Người dùng có thể đăng nhập bằng mật khẩu mới. |
| **Kích hoạt** | Người dùng nhấn liên kết "Quên mật khẩu?" trên trang đăng nhập. |
| **Luồng chính** | 1. Người dùng nhấn "Quên mật khẩu?" trên trang đăng nhập. 2. Hệ thống hiển thị form nhập email. 3. Người dùng nhập địa chỉ email đã đăng ký. 4. Người dùng nhấn "Gửi yêu cầu". 5. Hệ thống kiểm tra email có tồn tại trong hệ thống. 6. Hệ thống tạo link đặt lại mật khẩu có thời hạn (30 phút) và gửi đến email của người dùng. 7. Người dùng mở email và nhấn vào link đặt lại mật khẩu. 8. Hệ thống xác thực link còn hiệu lực và hiển thị form nhập mật khẩu mới. 9. Người dùng nhập mật khẩu mới và xác nhận mật khẩu. 10. Hệ thống cập nhật mật khẩu mới, vô hiệu hóa link cũ và thông báo thành công. |
| **Luồng thay thế** | Người dùng chưa nhận được email → nhấn "Gửi lại" để yêu cầu gửi email mới. |
| **Ngoại lệ** | Email không tồn tại trong hệ thống → hệ thống hiển thị thông báo (dùng ngôn ngữ trung tính để bảo mật). Link đặt lại mật khẩu đã hết hạn → hệ thống yêu cầu gửi lại yêu cầu mới. Hai mật khẩu nhập vào không khớp → hệ thống yêu cầu nhập lại. |
| **UC liên quan** | <<extend>> UC-02: Đăng nhập |

---

## 6. Bảng quan hệ Actor – Use Case

| **Actor** | **Use Case** |
| --- | --- |
| **Ứng viên** | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-21, UC-26 |
| **Nhà tuyển dụng** | UC-02, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-21, UC-26 |
| **Quản trị viên** | UC-17, UC-18, UC-19, UC-20 |
| **Hệ thống** | UC-22, UC-23, UC-24, UC-25 |

---

## 7. Ghi chú triển khai

Hệ thống áp dụng cơ chế phân quyền **Role-Based Access Control (RBAC)** với 3 vai trò: Candidate, Recruiter và Admin. Mỗi vai trò chỉ được truy cập đúng nhóm chức năng tương ứng.

Tất cả các chức năng có nhập liệu (đăng ký, tạo CV, đăng tin, phản hồi) đều phải kiểm tra dữ liệu ở cả **frontend và backend**.

Use Case **UC-07 (Gửi CV ứng tuyển)** là chức năng trung tâm vì nó kết nối trực tiếp giữa Ứng viên, Tin tuyển dụng và Nhà tuyển dụng.

Các Use Case hỗ trợ **UC-23, UC-24, UC-25** được thiết kế để tái sử dụng tối đa, tránh lặp logic trong hệ thống.

---

*Use Case Modeling – Website Tìm Việc | Phiên bản hoàn chỉnh*
