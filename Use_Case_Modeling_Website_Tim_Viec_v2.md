# HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
## KHOA CÔNG NGHỆ THÔNG TIN 1

**TÀI LIỆU USE CASE MODELING**

**Đề tài:** Xây dựng Website tìm việc

**Học phần:** Lập trình web

**Trình độ đào tạo:** Đại học

**Hình thức đào tạo:** Chính quy

---

## 1. Giới thiệu tài liệu

Tài liệu Use Case Modeling này mô tả các tác nhân, danh sách chức năng và đặc tả chi tiết các Use Case chính của hệ thống Website tìm việc. Tài liệu được xây dựng dựa trên yêu cầu đề tài "Xây dựng website tìm việc" và cấu trúc hướng dẫn lập tài liệu Use Case Modeling.

Mục tiêu của hệ thống là hỗ trợ ứng viên tìm kiếm việc làm, tạo CV và ứng tuyển; hỗ trợ nhà tuyển dụng đăng tin, quản lý ứng viên; đồng thời cung cấp công cụ quản trị để quản lý tài khoản, template CV và tin tuyển dụng.

---

## 2. Danh sách tác nhân

| **Tên Actor** | **Mô tả** |
| --- | --- |
| Ứng viên (Candidate) | Người tìm kiếm thông tin tuyển dụng, tạo CV, cá nhân hóa CV và gửi CV ứng tuyển vào các vị trí phù hợp. |
| Nhà tuyển dụng (Recruiter) | Cá nhân hoặc công ty đăng tin tuyển dụng, quản lý danh sách ứng viên, phản hồi và đánh giá ứng viên. |
| Quản trị viên (Admin) | Người đăng nhập vào khu vực quản trị để quản lý tài khoản, template CV và tin tuyển dụng trong hệ thống. |

---

## 3. Danh sách Use Case

| **Mã UC** | **Tên Use Case** | **Loại** |
| --- | --- | --- |
| UC-01 | Đăng ký tài khoản ứng viên | Use Case chính |
| UC-02 | Đăng nhập | Use Case chính |
| UC-03 | Tìm kiếm việc làm | Use Case chính |
| UC-04 | Xem chi tiết tin tuyển dụng | Use Case chính |
| UC-05 | Tạo CV | Use Case chính |
| UC-06 | Chỉnh sửa CV | Use Case chính |
| UC-07 | Gửi CV ứng tuyển | Use Case chính |
| UC-08 | Xem phản hồi ứng tuyển | Use Case chính |
| UC-09 | Bookmark Job | Use Case chính |
| UC-10 | Upload CV PDF | Use Case chính |
| UC-11 | Đăng ký tài khoản nhà tuyển dụng | Use Case chính |
| UC-12 | Đăng tin tuyển dụng | Use Case chính |
| UC-13 | Quản lý tin tuyển dụng | Use Case chính |
| UC-14 | Xem danh sách ứng viên | Use Case chính |
| UC-15 | Phản hồi ứng viên | Use Case chính |
| UC-16 | Đánh giá ứng viên | Use Case chính |
| UC-17 | Đăng nhập quản trị | Use Case chính |
| UC-18 | Quản lý tài khoản | Use Case chính |
| UC-19 | Quản lý template CV | Use Case chính |
| UC-20 | Quản lý tin tuyển dụng | Use Case chính |
| UC-21 | Chat với nhà tuyển dụng | Use Case chính |
| UC-22 | Email Notification | Use Case chính |
| UC-23 | Kiểm tra thông tin đăng nhập | \<\<include>> |
| UC-24 | Gửi thông báo | \<\<include>> |
| UC-25 | Kiểm tra dữ liệu hợp lệ | \<\<include>> |
| UC-26 | Quên mật khẩu | Use Case phụ |

---

## 4. Đặc tả chi tiết Use Case

Mỗi Use Case được mô tả theo các mục: tên Use Case, mô tả, tác nhân, tiền điều kiện, hậu điều kiện, kích hoạt, luồng chính, luồng thay thế, ngoại lệ và Use Case liên quan.

---

### UC-01: Đăng ký tài khoản ứng viên

| **Tên Use Case** | Đăng ký tài khoản ứng viên |
| --- | --- |
| **Mô tả** | Ứng viên tạo tài khoản để sử dụng các chức năng tìm việc, tạo CV và ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên chưa có tài khoản trong hệ thống. |
| **Hậu điều kiện** | Tài khoản ứng viên được tạo thành công và có thể sử dụng để đăng nhập. |
| **Kích hoạt** | Ứng viên chọn chức năng đăng ký tài khoản. |
| **Luồng chính** | 1. Ứng viên mở trang đăng ký. 2. Hệ thống hiển thị form đăng ký. 3. Ứng viên nhập tên và email. 4. Ứng viên nhấn nút đăng ký. 5. Hệ thống kiểm tra dữ liệu hợp lệ. 6. Hệ thống lưu thông tin tài khoản. 7. Hệ thống thông báo đăng ký thành công. |
| **Luồng thay thế** | Ứng viên hủy đăng ký và quay lại trang chủ. |
| **Ngoại lệ** | Email đã tồn tại hoặc dữ liệu không hợp lệ, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | \<\<include>> Kiểm tra dữ liệu hợp lệ |

---

### UC-02: Đăng nhập

| **Tên Use Case** | Đăng nhập |
| --- | --- |
| **Mô tả** | Người dùng xác thực tài khoản để truy cập hệ thống theo đúng quyền hạn. |
| **Tác nhân** | Ứng viên, Nhà tuyển dụng |
| **Tiền điều kiện** | Người dùng đã có tài khoản trong hệ thống. |
| **Hậu điều kiện** | Người dùng đăng nhập thành công và được chuyển đến giao diện phù hợp với vai trò. |
| **Kích hoạt** | Người dùng chọn chức năng đăng nhập. |
| **Luồng chính** | 1. Người dùng mở trang đăng nhập. 2. Hệ thống hiển thị form đăng nhập. 3. Người dùng nhập email và mật khẩu. 4. Người dùng nhấn nút đăng nhập. 5. Hệ thống kiểm tra thông tin đăng nhập. 6. Hệ thống xác định vai trò người dùng. 7. Hệ thống chuyển người dùng đến trang chức năng tương ứng. |
| **Luồng thay thế** | Người dùng chọn quên mật khẩu, hệ thống chuyển sang UC-22. |
| **Ngoại lệ** | Email hoặc mật khẩu không đúng, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | \<\<include>> Kiểm tra thông tin đăng nhập |

---

### UC-03: Tìm kiếm việc làm

| **Tên Use Case** | Tìm kiếm việc làm |
| --- | --- |
| **Mô tả** | Ứng viên tìm kiếm các tin tuyển dụng phù hợp với nhu cầu. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Hệ thống có danh sách tin tuyển dụng. |
| **Hậu điều kiện** | Danh sách việc làm phù hợp được hiển thị. |
| **Kích hoạt** | Ứng viên nhập từ khóa hoặc chọn bộ lọc tìm kiếm. |
| **Luồng chính** | 1. Ứng viên truy cập trang tìm việc. 2. Hệ thống hiển thị danh sách tin tuyển dụng. 3. Ứng viên nhập từ khóa tìm kiếm. 4. Ứng viên chọn bộ lọc nếu cần. 5. Hệ thống xử lý điều kiện tìm kiếm. 6. Hệ thống hiển thị danh sách việc làm phù hợp. |
| **Luồng thay thế** | Ứng viên xem tất cả tin tuyển dụng mà không nhập từ khóa. |
| **Ngoại lệ** | Không có kết quả phù hợp, hệ thống hiển thị thông báo không tìm thấy việc làm. |
| **UC liên quan** | Không có |

---

### UC-04: Xem chi tiết tin tuyển dụng

| **Tên Use Case** | Xem chi tiết tin tuyển dụng |
| --- | --- |
| **Mô tả** | Ứng viên xem thông tin chi tiết của một tin tuyển dụng trước khi ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Tin tuyển dụng tồn tại trong hệ thống. |
| **Hậu điều kiện** | Thông tin chi tiết tin tuyển dụng được hiển thị. |
| **Kích hoạt** | Ứng viên chọn một tin tuyển dụng trong danh sách. |
| **Luồng chính** | 1. Ứng viên chọn tin tuyển dụng muốn xem. 2. Hệ thống lấy thông tin chi tiết tin tuyển dụng. 3. Hệ thống hiển thị tiêu đề, mô tả, yêu cầu và thông tin nhà tuyển dụng. |
| **Luồng thay thế** | Ứng viên quay lại danh sách việc làm. |
| **Ngoại lệ** | Tin tuyển dụng đã bị xóa hoặc không còn tồn tại, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | Không có |

---

### UC-05: Tạo CV

| **Tên Use Case** | Tạo CV |
| --- | --- |
| **Mô tả** | Ứng viên tạo CV cá nhân dựa trên các template CV có sẵn. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập và hệ thống có template CV. |
| **Hậu điều kiện** | CV của ứng viên được tạo và lưu vào hệ thống. |
| **Kích hoạt** | Ứng viên chọn chức năng tạo CV. |
| **Luồng chính** | 1. Ứng viên mở trang tạo CV. 2. Hệ thống hiển thị danh sách template CV. 3. Ứng viên chọn một template. 4. Hệ thống hiển thị form nhập thông tin CV. 5. Ứng viên nhập thông tin cá nhân, học vấn, kỹ năng và kinh nghiệm. 6. Ứng viên nhấn lưu CV. 7. Hệ thống kiểm tra dữ liệu hợp lệ. 8. Hệ thống lưu CV. |
| **Luồng thay thế** | Ứng viên xem trước CV trước khi lưu. |
| **Ngoại lệ** | Dữ liệu CV thiếu hoặc không hợp lệ, hệ thống yêu cầu nhập lại. |
| **UC liên quan** | \<\<include>> Kiểm tra dữ liệu hợp lệ |

---

### UC-06: Chỉnh sửa CV

| **Tên Use Case** | Chỉnh sửa CV |
| --- | --- |
| **Mô tả** | Ứng viên cập nhật nội dung CV đã tạo để cá nhân hóa hồ sơ ứng tuyển. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập và đã có ít nhất một CV trong hệ thống. |
| **Hậu điều kiện** | Thông tin CV được cập nhật thành công. |
| **Kích hoạt** | Ứng viên chọn chức năng chỉnh sửa CV. |
| **Luồng chính** | 1. Ứng viên mở danh sách CV cá nhân. 2. Hệ thống hiển thị các CV đã tạo. 3. Ứng viên chọn CV cần chỉnh sửa. 4. Hệ thống hiển thị nội dung CV hiện tại. 5. Ứng viên cập nhật thông tin cần thay đổi. 6. Ứng viên nhấn lưu thay đổi. 7. Hệ thống kiểm tra dữ liệu hợp lệ. 8. Hệ thống cập nhật CV. |
| **Luồng thay thế** | Ứng viên chọn xem trước CV trước khi lưu thay đổi. |
| **Ngoại lệ** | CV không tồn tại hoặc dữ liệu không hợp lệ, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | \<\<include>> Kiểm tra dữ liệu hợp lệ |

---

### UC-07: Gửi CV ứng tuyển

| **Tên Use Case** | Gửi CV ứng tuyển |
| --- | --- |
| **Mô tả** | Ứng viên gửi CV của mình cho nhà tuyển dụng để ứng tuyển vào vị trí tuyển dụng. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập, có CV và tin tuyển dụng đang hoạt động. |
| **Hậu điều kiện** | Hồ sơ ứng tuyển được lưu, nhà tuyển dụng nhận được thông báo. |
| **Kích hoạt** | Ứng viên nhấn nút ứng tuyển trong tin tuyển dụng. |
| **Luồng chính** | 1. Ứng viên mở chi tiết tin tuyển dụng. 2. Ứng viên nhấn nút ứng tuyển. 3. Hệ thống hiển thị danh sách CV của ứng viên. 4. Ứng viên chọn CV muốn gửi. 5. Ứng viên xác nhận ứng tuyển. 6. Hệ thống lưu hồ sơ ứng tuyển. 7. Hệ thống gửi thông báo đến nhà tuyển dụng. |
| **Luồng thay thế** | Ứng viên chưa có CV, hệ thống chuyển đến chức năng tạo CV. |
| **Ngoại lệ** | Tin tuyển dụng đã đóng hoặc CV không tồn tại, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | \<\<include>> Gửi thông báo |

---

### UC-08: Xem phản hồi ứng tuyển

| **Tên Use Case** | Xem phản hồi ứng tuyển |
| --- | --- |
| **Mô tả** | Ứng viên xem phản hồi, kết quả và đánh giá từ nhà tuyển dụng. |
| **Tác nhân** | Ứng viên |
| **Tiền điều kiện** | Ứng viên đã đăng nhập và đã gửi hồ sơ ứng tuyển. |
| **Hậu điều kiện** | Phản hồi ứng tuyển được hiển thị cho ứng viên. |
| **Kích hoạt** | Ứng viên mở trang quản lý ứng tuyển. |
| **Luồng chính** | 1. Ứng viên truy cập trang quản lý ứng tuyển. 2. Hệ thống hiển thị danh sách các hồ sơ đã ứng tuyển. 3. Ứng viên chọn một hồ sơ ứng tuyển. 4. Hệ thống hiển thị trạng thái, phản hồi và đánh giá từ nhà tuyển dụng. |
| **Luồng thay thế** | Ứng viên lọc hồ sơ theo trạng thái ứng tuyển. |
| **Ngoại lệ** | Chưa có phản hồi, hệ thống hiển thị trạng thái đang chờ xử lý. |
| **UC liên quan** | Không có |

---

### UC-09 (UC-11): Đăng ký tài khoản nhà tuyển dụng

| **Tên Use Case** | Đăng ký tài khoản nhà tuyển dụng |
| --- | --- |
| **Mô tả** | Nhà tuyển dụng tạo tài khoản để đăng tin và quản lý ứng viên. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng chưa có tài khoản trong hệ thống. |
| **Hậu điều kiện** | Tài khoản nhà tuyển dụng được tạo thành công. |
| **Kích hoạt** | Nhà tuyển dụng chọn chức năng đăng ký. |
| **Luồng chính** | 1. Nhà tuyển dụng mở trang đăng ký. 2. Hệ thống hiển thị form đăng ký. 3. Nhà tuyển dụng nhập tên công ty hoặc tên cá nhân, email và mật khẩu. 4. Nhà tuyển dụng nhấn nút đăng ký. 5. Hệ thống kiểm tra dữ liệu hợp lệ. 6. Hệ thống lưu tài khoản nhà tuyển dụng. 7. Hệ thống thông báo đăng ký thành công. |
| **Luồng thay thế** | Nhà tuyển dụng hủy đăng ký và quay lại trang chủ. |
| **Ngoại lệ** | Email đã tồn tại hoặc mật khẩu không hợp lệ, hệ thống hiển thị lỗi. |
| **UC liên quan** | \<\<include>> Kiểm tra dữ liệu hợp lệ |

---

### UC-10 (UC-12): Đăng tin tuyển dụng

| **Tên Use Case** | Đăng tin tuyển dụng |
| --- | --- |
| **Mô tả** | Nhà tuyển dụng tạo tin tuyển dụng để tìm kiếm ứng viên phù hợp. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập. |
| **Hậu điều kiện** | Tin tuyển dụng được lưu và hiển thị trên hệ thống. |
| **Kích hoạt** | Nhà tuyển dụng chọn chức năng đăng tin tuyển dụng. |
| **Luồng chính** | 1. Nhà tuyển dụng mở trang đăng tin. 2. Hệ thống hiển thị form nhập thông tin tuyển dụng. 3. Nhà tuyển dụng nhập tiêu đề, mô tả công việc, yêu cầu và thông tin liên quan. 4. Nhà tuyển dụng nhấn nút đăng tin. 5. Hệ thống kiểm tra dữ liệu hợp lệ. 6. Hệ thống lưu tin tuyển dụng. 7. Hệ thống hiển thị thông báo đăng tin thành công. |
| **Luồng thay thế** | Nhà tuyển dụng lưu nháp tin tuyển dụng. |
| **Ngoại lệ** | Thông tin bắt buộc bị thiếu, hệ thống yêu cầu nhập lại. |
| **UC liên quan** | \<\<include>> Kiểm tra dữ liệu hợp lệ |

---

### UC-11 (UC-13): Quản lý tin tuyển dụng (Nhà tuyển dụng)

| **Tên Use Case** | Quản lý tin tuyển dụng |
| --- | --- |
| **Mô tả** | Nhà tuyển dụng xem, cập nhật hoặc xóa các tin tuyển dụng đã đăng. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập và có tin tuyển dụng trong hệ thống. |
| **Hậu điều kiện** | Thông tin tin tuyển dụng được cập nhật hoặc xóa theo thao tác của nhà tuyển dụng. |
| **Kích hoạt** | Nhà tuyển dụng mở trang quản lý tin tuyển dụng. |
| **Luồng chính** | 1. Nhà tuyển dụng truy cập trang quản lý tin tuyển dụng. 2. Hệ thống hiển thị danh sách tin đã đăng. 3. Nhà tuyển dụng chọn tin cần thao tác. 4. Nhà tuyển dụng chọn sửa hoặc xóa tin. 5. Hệ thống thực hiện thao tác tương ứng. 6. Hệ thống cập nhật danh sách tin tuyển dụng. |
| **Luồng thay thế** | Nhà tuyển dụng xem chi tiết tin trước khi chỉnh sửa. |
| **Ngoại lệ** | Tin tuyển dụng không tồn tại hoặc không thuộc nhà tuyển dụng hiện tại, hệ thống từ chối thao tác. |
| **UC liên quan** | Không có |

---

### UC-12 (UC-14): Xem danh sách ứng viên

| **Tên Use Case** | Xem danh sách ứng viên |
| --- | --- |
| **Mô tả** | Nhà tuyển dụng xem danh sách ứng viên đã ứng tuyển vào tin tuyển dụng của mình. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập và có tin tuyển dụng có ứng viên ứng tuyển. |
| **Hậu điều kiện** | Danh sách ứng viên được hiển thị. |
| **Kích hoạt** | Nhà tuyển dụng chọn một tin tuyển dụng để xem ứng viên. |
| **Luồng chính** | 1. Nhà tuyển dụng mở danh sách tin tuyển dụng. 2. Nhà tuyển dụng chọn tin cần xem ứng viên. 3. Hệ thống lấy danh sách hồ sơ ứng tuyển. 4. Hệ thống hiển thị thông tin ứng viên và CV đã gửi. |
| **Luồng thay thế** | Nhà tuyển dụng lọc ứng viên theo trạng thái xử lý. |
| **Ngoại lệ** | Chưa có ứng viên ứng tuyển, hệ thống hiển thị danh sách trống. |
| **UC liên quan** | Không có |

---

### UC-13 (UC-15): Phản hồi ứng viên

| **Tên Use Case** | Phản hồi ứng viên |
| --- | --- |
| **Mô tả** | Nhà tuyển dụng gửi phản hồi về kết quả ứng tuyển cho ứng viên. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập và có hồ sơ ứng tuyển. |
| **Hậu điều kiện** | Phản hồi được lưu và ứng viên nhận được thông báo. |
| **Kích hoạt** | Nhà tuyển dụng chọn hồ sơ ứng viên cần phản hồi. |
| **Luồng chính** | 1. Nhà tuyển dụng mở danh sách ứng viên. 2. Nhà tuyển dụng chọn một ứng viên. 3. Hệ thống hiển thị thông tin ứng viên và CV. 4. Nhà tuyển dụng nhập nội dung phản hồi hoặc chọn kết quả. 5. Nhà tuyển dụng xác nhận gửi phản hồi. 6. Hệ thống lưu phản hồi. 7. Hệ thống gửi thông báo đến ứng viên. |
| **Luồng thay thế** | Nhà tuyển dụng lưu phản hồi nháp. |
| **Ngoại lệ** | Nội dung phản hồi bị trống, hệ thống yêu cầu nhập lại. |
| **UC liên quan** | \<\<include>> Gửi thông báo |

---

### UC-14 (UC-16): Đánh giá ứng viên

| **Tên Use Case** | Đánh giá ứng viên |
| --- | --- |
| **Mô tả** | Nhà tuyển dụng đánh giá ứng viên dựa trên CV và thông tin ứng tuyển. |
| **Tác nhân** | Nhà tuyển dụng |
| **Tiền điều kiện** | Nhà tuyển dụng đã đăng nhập và ứng viên đã gửi CV ứng tuyển. |
| **Hậu điều kiện** | Đánh giá ứng viên được lưu vào hệ thống. |
| **Kích hoạt** | Nhà tuyển dụng chọn chức năng đánh giá ứng viên. |
| **Luồng chính** | 1. Nhà tuyển dụng mở hồ sơ ứng viên. 2. Hệ thống hiển thị CV và thông tin ứng tuyển. 3. Nhà tuyển dụng nhập nhận xét hoặc điểm đánh giá. 4. Nhà tuyển dụng nhấn lưu đánh giá. 5. Hệ thống lưu đánh giá. |
| **Luồng thay thế** | Nhà tuyển dụng chỉnh sửa đánh giá đã lưu. |
| **Ngoại lệ** | Dữ liệu đánh giá không hợp lệ, hệ thống hiển thị lỗi. |
| **UC liên quan** | Không có |

---

### UC-15 (UC-17): Đăng nhập quản trị

| **Tên Use Case** | Đăng nhập quản trị |
| --- | --- |
| **Mô tả** | Quản trị viên đăng nhập để truy cập khu vực quản lý hệ thống. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên có tài khoản hợp lệ. |
| **Hậu điều kiện** | Quản trị viên truy cập được trang quản trị. |
| **Kích hoạt** | Quản trị viên mở trang đăng nhập quản trị. |
| **Luồng chính** | 1. Quản trị viên mở trang đăng nhập. 2. Hệ thống hiển thị form đăng nhập. 3. Quản trị viên nhập email và mật khẩu. 4. Quản trị viên nhấn đăng nhập. 5. Hệ thống kiểm tra thông tin đăng nhập. 6. Hệ thống xác nhận quyền quản trị. 7. Hệ thống chuyển đến dashboard quản trị. |
| **Luồng thay thế** | Không có. |
| **Ngoại lệ** | Sai thông tin đăng nhập hoặc tài khoản không có quyền admin, hệ thống từ chối truy cập. |
| **UC liên quan** | \<\<include>> Kiểm tra thông tin đăng nhập |

---

### UC-16 (UC-18): Quản lý tài khoản

| **Tên Use Case** | Quản lý tài khoản |
| --- | --- |
| **Mô tả** | Quản trị viên xem, sửa hoặc xóa tài khoản ứng viên và nhà tuyển dụng. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập. |
| **Hậu điều kiện** | Thông tin tài khoản được cập nhật hoặc xóa khỏi hệ thống. |
| **Kích hoạt** | Quản trị viên mở chức năng quản lý tài khoản. |
| **Luồng chính** | 1. Quản trị viên mở trang quản lý tài khoản. 2. Hệ thống hiển thị danh sách tài khoản. 3. Quản trị viên chọn tài khoản cần thao tác. 4. Quản trị viên chọn sửa hoặc xóa. 5. Hệ thống thực hiện thao tác. 6. Hệ thống cập nhật danh sách tài khoản. |
| **Luồng thay thế** | Quản trị viên tìm kiếm tài khoản theo tên hoặc email. |
| **Ngoại lệ** | Tài khoản không tồn tại, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | Không có |

---

### UC-17 (UC-19): Quản lý template CV

| **Tên Use Case** | Quản lý template CV |
| --- | --- |
| **Mô tả** | Quản trị viên thêm, sửa hoặc xóa các template CV có sẵn trong hệ thống. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập. |
| **Hậu điều kiện** | Danh sách template CV được cập nhật. |
| **Kích hoạt** | Quản trị viên chọn chức năng quản lý template CV. |
| **Luồng chính** | 1. Quản trị viên mở trang quản lý template CV. 2. Hệ thống hiển thị danh sách template CV. 3. Quản trị viên chọn thêm, sửa hoặc xóa template. 4. Quản trị viên nhập hoặc cập nhật thông tin template. 5. Hệ thống kiểm tra dữ liệu hợp lệ. 6. Hệ thống lưu thay đổi. |
| **Luồng thay thế** | Quản trị viên xem trước template CV trước khi lưu. |
| **Ngoại lệ** | Template đang được sử dụng hoặc dữ liệu không hợp lệ, hệ thống hiển thị lỗi. |
| **UC liên quan** | \<\<include>> Kiểm tra dữ liệu hợp lệ |

---

### UC-18 (UC-20): Quản lý tin tuyển dụng (Admin)

| **Tên Use Case** | Quản lý tin tuyển dụng |
| --- | --- |
| **Mô tả** | Quản trị viên kiểm tra, sửa hoặc xóa các tin tuyển dụng của nhà tuyển dụng. |
| **Tác nhân** | Quản trị viên |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập. |
| **Hậu điều kiện** | Danh sách tin tuyển dụng được cập nhật. |
| **Kích hoạt** | Quản trị viên mở chức năng quản lý tin tuyển dụng. |
| **Luồng chính** | 1. Quản trị viên mở trang quản lý tin tuyển dụng. 2. Hệ thống hiển thị danh sách tin tuyển dụng. 3. Quản trị viên chọn tin cần thao tác. 4. Quản trị viên sửa hoặc xóa tin tuyển dụng. 5. Hệ thống lưu thay đổi. 6. Hệ thống cập nhật danh sách tin tuyển dụng. |
| **Luồng thay thế** | Quản trị viên tìm kiếm tin tuyển dụng theo nhà tuyển dụng hoặc tiêu đề. |
| **Ngoại lệ** | Tin tuyển dụng không tồn tại, hệ thống hiển thị thông báo lỗi. |
| **UC liên quan** | Không có |

---

### UC-22 (UC-26): Quên mật khẩu

| **Tên Use Case** | Quên mật khẩu |
| --- | --- |
| **Mô tả** | Người dùng (ứng viên hoặc nhà tuyển dụng) yêu cầu đặt lại mật khẩu thông qua email đã đăng ký khi quên mật khẩu của mình. |
| **Tác nhân** | Ứng viên, Nhà tuyển dụng |
| **Tiền điều kiện** | Người dùng có tài khoản hợp lệ trong hệ thống và đang ở trang đăng nhập. |
| **Hậu điều kiện** | Mật khẩu của người dùng được cập nhật thành công và người dùng có thể đăng nhập bằng mật khẩu mới. |
| **Kích hoạt** | Người dùng nhấn vào liên kết "Quên mật khẩu" trên trang đăng nhập. |
| **Luồng chính** | 1. Người dùng nhấn "Quên mật khẩu" trên trang đăng nhập. 2. Hệ thống hiển thị form nhập email. 3. Người dùng nhập địa chỉ email đã đăng ký. 4. Người dùng nhấn "Gửi yêu cầu". 5. Hệ thống kiểm tra email có tồn tại trong hệ thống hay không. 6. Hệ thống gửi email chứa link đặt lại mật khẩu đến địa chỉ email của người dùng. 7. Người dùng mở email và nhấn vào link đặt lại mật khẩu. 8. Hệ thống hiển thị form nhập mật khẩu mới. 9. Người dùng nhập mật khẩu mới và xác nhận mật khẩu. 10. Hệ thống cập nhật mật khẩu mới và thông báo thành công. |
| **Luồng thay thế** | Người dùng chưa nhận được email, nhấn "Gửi lại" để yêu cầu gửi email xác nhận mới. |
| **Ngoại lệ** | Email không tồn tại trong hệ thống: hệ thống hiển thị thông báo lỗi phù hợp. Link đặt lại mật khẩu đã hết hạn: hệ thống yêu cầu người dùng gửi lại yêu cầu mới. Hai mật khẩu nhập vào không khớp: hệ thống yêu cầu nhập lại. |
| **UC liên quan** | UC-02: Đăng nhập (luồng thay thế) |

---

## 5. Gợi ý quan hệ Use Case

| **Use Case chính** | **Quan hệ** | **Use Case phụ** |
| --- | --- | --- |
| Đăng nhập | \<\<include>> | Kiểm tra thông tin đăng nhập |
| Đăng nhập quản trị | \<\<include>> | Kiểm tra thông tin đăng nhập |
| Đăng ký tài khoản ứng viên | \<\<include>> | Kiểm tra dữ liệu hợp lệ |
| Đăng ký tài khoản nhà tuyển dụng | \<\<include>> | Kiểm tra dữ liệu hợp lệ |
| Tạo CV | \<\<include>> | Kiểm tra dữ liệu hợp lệ |
| Chỉnh sửa CV | \<\<include>> | Kiểm tra dữ liệu hợp lệ |
| Đăng tin tuyển dụng | \<\<include>> | Kiểm tra dữ liệu hợp lệ |
| Gửi CV ứng tuyển | \<\<include>> | Gửi thông báo |
| Phản hồi ứng viên | \<\<include>> | Gửi thông báo |
| Đăng nhập | \<\<extend>> | Quên mật khẩu (UC-22) |

---

## 6. Ghi chú triển khai

Các Use Case nên được triển khai theo cơ chế phân quyền Role-Based Access Control gồm: Candidate, Recruiter và Admin.

Các chức năng thêm, sửa, xóa dữ liệu cần kiểm tra quyền truy cập trước khi thực hiện.

Các chức năng nhập liệu như đăng ký, tạo CV, đăng tin tuyển dụng và phản hồi ứng viên cần validate dữ liệu ở cả frontend và backend.

Use Case "Gửi CV ứng tuyển" là chức năng trung tâm vì kết nối trực tiếp giữa Ứng viên, Tin tuyển dụng và Nhà tuyển dụng.

---

*Use Case Modeling - Website tìm việc*
