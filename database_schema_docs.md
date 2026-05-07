# Database Schema — Website Tìm Việc

> **Stack:** Microsoft SQL Server 2019+  
> **Collation:** `Vietnamese_CI_AS`  
> **Database:** `job_website`

---

## Mục lục

1. [Module 1 — Tài khoản & Phân quyền](#module-1--tài-khoản--phân-quyền)
2. [Module 2 — Template CV & CV](#module-2--template-cv--cv)
3. [Module 3 — Tin tuyển dụng](#module-3--tin-tuyển-dụng)
4. [Module 4 — Ứng tuyển](#module-4--ứng-tuyển)
5. [Module 5 — Thông báo](#module-5--thông-báo)
6. [Module 6 — Chat](#module-6--chat)
7. [Triggers](#triggers)
8. [Indexes tổng hợp](#indexes-tổng-hợp)
9. [Ghi chú thiết kế](#ghi-chú-thiết-kế)

---

## Module 1 — Tài khoản & Phân quyền

### `users`

Bảng trung tâm của hệ thống. Mỗi hàng đại diện cho một tài khoản, bất kể vai trò.

| Cột | Kiểu | Nullable | Mặc định | Ghi chú |
|-----|------|----------|----------|---------|
| `id` | `INT IDENTITY` | NO | — | PK |
| `email` | `NVARCHAR(255)` | NO | — | UNIQUE |
| `password_hash` | `NVARCHAR(255)` | NO | — | Bcrypt hash |
| `role` | `NVARCHAR(20)` | NO | — | `candidate` \| `recruiter` \| `admin` |
| `status` | `NVARCHAR(20)` | NO | `active` | `active` \| `inactive` \| `banned` |
| `deleted_at` | `DATETIME2` | YES | NULL | Soft delete — filter `WHERE deleted_at IS NULL` |
| `created_at` | `DATETIME2` | NO | `GETDATE()` | — |
| `updated_at` | `DATETIME2` | NO | `GETDATE()` | Set bởi backend khi UPDATE |

**Constraints:** `PK_users`, `UQ_users_email`  
**Indexes:** `idx_users_role`, `idx_users_status`, `idx_users_deleted_at`

---

### `candidate_profiles`

Hồ sơ chi tiết của ứng viên. Quan hệ 1-1 với `users`.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE, UNIQUE |
| `full_name` | `NVARCHAR(150)` | NO | — |
| `phone` | `NVARCHAR(20)` | YES | — |
| `address` | `NVARCHAR(300)` | YES | — |
| `date_of_birth` | `DATE` | YES | — |
| `avatar_url` | `NVARCHAR(500)` | YES | — |
| `bio` | `NVARCHAR(MAX)` | YES | — |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

---

### `recruiter_profiles`

Hồ sơ chi tiết của nhà tuyển dụng. Quan hệ 1-1 với `users`.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE, UNIQUE |
| `company_name` | `NVARCHAR(200)` | NO | — |
| `contact_name` | `NVARCHAR(150)` | YES | — |
| `phone` | `NVARCHAR(20)` | YES | — |
| `address` | `NVARCHAR(300)` | YES | — |
| `website` | `NVARCHAR(300)` | YES | — |
| `description` | `NVARCHAR(MAX)` | YES | — |
| `logo_url` | `NVARCHAR(500)` | YES | — |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

---

### `password_reset_tokens`

Lưu token đặt lại mật khẩu (UC-26). Token có thời hạn và chỉ dùng một lần.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE |
| `token` | `NVARCHAR(255)` | NO | UNIQUE — raw token gửi qua email |
| `expires_at` | `DATETIME2` | NO | Thời điểm hết hạn |
| `used_at` | `DATETIME2` | YES | NULL = chưa dùng |
| `created_at` | `DATETIME2` | NO | — |

**Indexes:** `idx_prt_token`, `idx_prt_user_id`

---

### `refresh_tokens`

Quản lý phiên đăng nhập. Hỗ trợ logout và invalidate token cũ khi đổi mật khẩu.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE |
| `token_hash` | `NVARCHAR(255)` | NO | UNIQUE — hash của token, không lưu raw |
| `device_info` | `NVARCHAR(300)` | YES | User-agent / tên thiết bị |
| `expires_at` | `DATETIME2` | NO | — |
| `revoked_at` | `DATETIME2` | YES | NULL = còn hiệu lực |
| `created_at` | `DATETIME2` | NO | — |

**Indexes:** `idx_rt_user_id`, `idx_rt_hash`

---

## Module 2 — Template CV & CV

### `cv_templates`

Danh sách template CV do admin tạo và quản lý (UC-19).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `name` | `NVARCHAR(150)` | NO | — |
| `description` | `NVARCHAR(MAX)` | YES | — |
| `thumbnail_url` | `NVARCHAR(500)` | YES | — |
| `layout_config` | `NVARCHAR(MAX)` | YES | JSON cấu hình layout |
| `is_active` | `BIT` | NO | `1` = hiển thị cho ứng viên |
| `created_by` | `INT` | NO | FK → `users(id)` |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

**Indexes:** `idx_cvt_active`

---

### `cvs`

CV của ứng viên. Hỗ trợ hai loại: tự tạo (`built`) và upload file PDF (`uploaded`).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE |
| `template_id` | `INT` | YES | FK → `cv_templates(id)` ON DELETE SET NULL |
| `title` | `NVARCHAR(200)` | NO | Mặc định `'CV của tôi'` |
| `status` | `NVARCHAR(10)` | NO | `draft` \| `active` |
| `cv_type` | `NVARCHAR(10)` | NO | `built` \| `uploaded` |
| `personal_info` | `NVARCHAR(MAX)` | YES | JSON — bắt buộc khi `cv_type = 'built'` |
| `education` | `NVARCHAR(MAX)` | YES | JSON array |
| `experience` | `NVARCHAR(MAX)` | YES | JSON array |
| `skills` | `NVARCHAR(MAX)` | YES | JSON array |
| `certifications` | `NVARCHAR(MAX)` | YES | JSON array |
| `projects` | `NVARCHAR(MAX)` | YES | JSON array |
| `pdf_url` | `NVARCHAR(500)` | YES | Bắt buộc khi `cv_type = 'uploaded'` |
| `deleted_at` | `DATETIME2` | YES | Soft delete |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

**Constraints toàn vẹn dữ liệu:**
```sql
CHK_cvs_built_data   -- cv_type = 'built'    → personal_info NOT NULL
CHK_cvs_uploaded_pdf -- cv_type = 'uploaded' → pdf_url NOT NULL
```

**Indexes:** `idx_cvs_user_id`, `idx_cvs_status`, `idx_cvs_deleted_at`

> **Ghi chú JSON:** Dùng `OPENJSON()` để query vào các cột JSON, ví dụ tìm CV có skill React:
> ```sql
> SELECT * FROM cvs
> WHERE EXISTS (
>     SELECT 1 FROM OPENJSON(skills)
>     WITH (skill_name NVARCHAR(100) '$.skill_name')
>     WHERE skill_name = N'React'
> )
> ```

---

## Module 3 — Tin tuyển dụng

### `job_categories`

Danh mục ngành nghề, hỗ trợ cấu trúc cha-con.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `parent_id` | `INT` | YES | FK → `job_categories(id)` — NULL = danh mục gốc |
| `name` | `NVARCHAR(100)` | NO | — |
| `slug` | `NVARCHAR(120)` | NO | UNIQUE — dùng cho URL |
| `created_at` | `DATETIME2` | NO | — |

**Ví dụ cấu trúc:**
```
Công nghệ thông tin
├── Lập trình Backend
├── Lập trình Frontend
├── Lập trình Mobile
├── DevOps & Cloud
├── AI & Data Science
└── QA & Testing
```

---

### `job_postings`

Tin tuyển dụng do nhà tuyển dụng đăng (UC-12, UC-13).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK — `PK_job_postings` (dùng cho Full-text Index) |
| `recruiter_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE |
| `category_id` | `INT` | YES | FK → `job_categories(id)` ON DELETE SET NULL |
| `title` | `NVARCHAR(200)` | NO | — |
| `description` | `NVARCHAR(MAX)` | NO | — |
| `requirements` | `NVARCHAR(MAX)` | YES | — |
| `benefits` | `NVARCHAR(MAX)` | YES | — |
| `location` | `NVARCHAR(200)` | YES | — |
| `salary_min` | `DECIMAL(15,2)` | YES | — |
| `salary_max` | `DECIMAL(15,2)` | YES | — |
| `salary_unit` | `NVARCHAR(20)` | YES | `month` \| `year` \| `hour` \| `negotiable` |
| `job_type` | `NVARCHAR(20)` | NO | `full_time` \| `part_time` \| `remote` \| `internship` \| `contract` |
| `experience_level` | `NVARCHAR(20)` | YES | `no_exp` \| `junior` \| `mid` \| `senior` \| `manager` |
| `status` | `NVARCHAR(20)` | NO | `draft` \| `active` \| `closed` \| `deleted` |
| `expires_at` | `DATE` | YES | — |
| `deleted_at` | `DATETIME2` | YES | Tự động set bởi trigger khi `status = 'deleted'` |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

**Constraints:**
```sql
CHK_jp_salary -- salary_min <= salary_max (khi cả hai không NULL)
```

**Full-text Search** trên `(title, description, requirements)`:
```sql
CREATE FULLTEXT CATALOG ft_catalog AS DEFAULT;
CREATE FULLTEXT INDEX ON job_postings (title, description, requirements)
    KEY INDEX PK_job_postings;
```

**Triggers:** `trg_jp_check_recruiter_role`, `trg_jp_soft_delete`  
**Indexes:** `idx_jp_recruiter`, `idx_jp_status`, `idx_jp_title`, `idx_jp_expires`, `idx_jp_deleted_at`

---

### `saved_jobs`

Ứng viên bookmark tin tuyển dụng (UC-09).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE |
| `job_posting_id` | `INT` | NO | FK → `job_postings(id)` ON DELETE CASCADE |
| `saved_at` | `DATETIME2` | NO | — |

**Constraints:** `UQ_saved_jobs (user_id, job_posting_id)` — mỗi user chỉ bookmark một tin một lần.

---

### `job_views`

Lượt xem tin tuyển dụng. Thay thế cho cột `view_count` đơn giản để tránh race condition.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `job_posting_id` | `INT` | NO | FK → `job_postings(id)` ON DELETE CASCADE |
| `viewer_id` | `INT` | YES | FK → `users(id)` — NULL nếu khách chưa đăng nhập |
| `viewer_ip` | `NVARCHAR(45)` | YES | IPv4 hoặc IPv6 |
| `viewed_at` | `DATETIME2` | NO | — |

**Truy vấn tổng lượt xem:**
```sql
SELECT COUNT(*) FROM job_views WHERE job_posting_id = @id;
```

**Indexes:** `idx_jv_job_posting`, `idx_jv_viewed_at`

---

### `job_skills`

Danh mục kỹ năng chuẩn hóa. Cho phép lọc tin tuyển dụng theo kỹ năng.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `name` | `NVARCHAR(100)` | NO | Tên hiển thị, VD: `React` |
| `slug` | `NVARCHAR(120)` | NO | UNIQUE, VD: `react` |
| `created_at` | `DATETIME2` | NO | — |

---

### `job_posting_skills`

Bảng junction giữa `job_postings` và `job_skills` (quan hệ N-N).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `job_posting_id` | `INT` | NO | PK + FK → `job_postings(id)` ON DELETE CASCADE |
| `skill_id` | `INT` | NO | PK + FK → `job_skills(id)` ON DELETE CASCADE |

---

## Module 4 — Ứng tuyển

### `applications`

Hồ sơ ứng tuyển của ứng viên vào một tin tuyển dụng (UC-07).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `candidate_profile_id` | `INT` | NO | FK → `candidate_profiles(id)` — enforce ứng viên phải có hồ sơ |
| `job_posting_id` | `INT` | NO | FK → `job_postings(id)` ON DELETE CASCADE |
| `cv_id` | `INT` | NO | FK → `cvs(id)` ON DELETE NO ACTION |
| `cover_letter` | `NVARCHAR(MAX)` | YES | — |
| `status` | `NVARCHAR(20)` | NO | `pending` \| `reviewing` \| `accepted` \| `rejected` \| `cancelled` |
| `deleted_at` | `DATETIME2` | YES | Soft delete |
| `applied_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

**Constraints:** `UQ_applications (candidate_profile_id, job_posting_id)` — mỗi ứng viên chỉ ứng tuyển một tin một lần.

> `status` là **nguồn sự thật duy nhất** cho kết quả ứng tuyển.

**Indexes:** `idx_app_candidate`, `idx_app_job_posting`, `idx_app_status`, `idx_app_deleted_at`

---

### `application_feedbacks`

Nhà tuyển dụng gửi phản hồi nội dung cho ứng viên (UC-15).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `application_id` | `INT` | NO | FK → `applications(id)` ON DELETE CASCADE |
| `recruiter_profile_id` | `INT` | NO | FK → `recruiter_profiles(id)` — tự enforce role recruiter |
| `content` | `NVARCHAR(MAX)` | NO | Nội dung phản hồi dạng text |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

> Kết quả chính thức (`accepted`/`rejected`) cập nhật qua `applications.status`, không lưu ở đây để tránh mâu thuẫn dữ liệu.

**Indexes:** `idx_af_application`

---

### `application_evaluations`

Nhà tuyển dụng chấm điểm ứng viên (UC-16). Mỗi đơn ứng tuyển có tối đa 1 đánh giá.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `application_id` | `INT` | NO | FK → `applications(id)` ON DELETE CASCADE, UNIQUE |
| `recruiter_profile_id` | `INT` | NO | FK → `recruiter_profiles(id)` — tự enforce role recruiter |
| `score` | `TINYINT` | YES | `0–10` |
| `notes` | `NVARCHAR(MAX)` | YES | Nhận xét nội bộ |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | — |

---

## Module 5 — Thông báo

### `notifications`

Thông báo in-app cho người dùng (UC-24).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | NO | FK → `users(id)` ON DELETE CASCADE |
| `type` | `NVARCHAR(50)` | NO | Xem bảng loại bên dưới |
| `title` | `NVARCHAR(200)` | NO | — |
| `message` | `NVARCHAR(MAX)` | NO | — |
| `related_type` | `NVARCHAR(50)` | YES | VD: `application`, `job_posting` |
| `related_id` | `INT` | YES | ID của bản ghi liên quan |
| `is_read` | `BIT` | NO | `0` = chưa đọc |
| `created_at` | `DATETIME2` | NO | — |

**Các loại thông báo (`type`):**

| Giá trị | Mô tả |
|---------|-------|
| `application_submitted` | Ứng viên gửi đơn ứng tuyển |
| `new_applicant` | Nhà tuyển dụng có ứng viên mới |
| `feedback_received` | Ứng viên nhận được phản hồi |
| `status_updated` | Trạng thái đơn thay đổi |
| `new_message` | Có tin nhắn mới trong chat |
| `system` | Thông báo hệ thống |

**Indexes:** `idx_notif_user_id`, `idx_notif_is_read`, `idx_notif_type`

---

### `email_queue`

Hàng đợi gửi email, hỗ trợ retry khi thất bại (UC-22).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `user_id` | `INT` | YES | FK → `users(id)` ON DELETE SET NULL |
| `to_email` | `NVARCHAR(255)` | NO | — |
| `subject` | `NVARCHAR(300)` | NO | — |
| `body_html` | `NVARCHAR(MAX)` | NO | Nội dung HTML |
| `status` | `NVARCHAR(20)` | NO | `pending` \| `sent` \| `failed` |
| `retry_count` | `TINYINT` | NO | `0` — tăng mỗi lần thử lại |
| `sent_at` | `DATETIME2` | YES | NULL = chưa gửi thành công |
| `error_msg` | `NVARCHAR(MAX)` | YES | Lưu lỗi nếu gửi thất bại |
| `created_at` | `DATETIME2` | NO | — |

**Indexes:** `idx_eq_status`, `idx_eq_created_at`

---

## Module 6 — Chat

### `conversations`

Cuộc hội thoại 1-1 giữa ứng viên và nhà tuyển dụng (UC-21).

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `candidate_profile_id` | `INT` | NO | FK → `candidate_profiles(id)` |
| `recruiter_profile_id` | `INT` | NO | FK → `recruiter_profiles(id)` |
| `job_posting_id` | `INT` | YES | FK → `job_postings(id)` ON DELETE SET NULL — NULL nếu chat ngoài ngữ cảnh ứng tuyển |
| `created_at` | `DATETIME2` | NO | — |
| `updated_at` | `DATETIME2` | NO | Tự động cập nhật khi có tin nhắn mới (trigger) |

**Constraints:** `UQ_conversations (candidate_profile_id, recruiter_profile_id, job_posting_id)` — tránh tạo nhiều conversation trùng nhau.

**Indexes:** `idx_conv_candidate`, `idx_conv_recruiter`

---

### `messages`

Từng tin nhắn trong một conversation.

| Cột | Kiểu | Nullable | Ghi chú |
|-----|------|----------|---------|
| `id` | `INT IDENTITY` | NO | PK |
| `conversation_id` | `INT` | NO | FK → `conversations(id)` ON DELETE CASCADE |
| `sender_id` | `INT` | NO | FK → `users(id)` — `user_id` của người gửi |
| `content` | `NVARCHAR(MAX)` | NO | — |
| `is_read` | `BIT` | NO | `0` = chưa đọc |
| `sent_at` | `DATETIME2` | NO | — |

> **Lưu ý backend:** DB không validate `sender_id` có thuộc `conversation` hay không (tránh chi phí trigger). Backend phải tự kiểm tra trước khi INSERT:
> ```sql
> SELECT 1 FROM conversations
> WHERE id = @conversation_id
>   AND (candidate_profile_id = @my_profile_id
>        OR recruiter_profile_id = @my_profile_id)
> ```

**Indexes:** `idx_msg_conversation`, `idx_msg_sender`, `idx_msg_sent_at`

---

## Triggers

| Trigger | Bảng | Sự kiện | Mô tả |
|---------|------|---------|-------|
| `trg_jp_check_recruiter_role` | `job_postings` | AFTER INSERT, UPDATE | Rollback nếu `recruiter_id` không phải user có `role = 'recruiter'` |
| `trg_jp_soft_delete` | `job_postings` | AFTER UPDATE | Tự set `deleted_at = GETDATE()` khi `status` đổi sang `'deleted'` |
| `trg_conv_updated_at` | `messages` | AFTER INSERT | Cập nhật `conversations.updated_at` khi có tin nhắn mới |

> **Không dùng trigger `updated_at` trên `users` và `applications`** vì có nguy cơ trigger chain. `updated_at` nên được backend set tường minh khi UPDATE.

---

## Indexes tổng hợp

| Index | Bảng | Cột |
|-------|------|-----|
| `idx_users_role` | `users` | `role` |
| `idx_users_status` | `users` | `status` |
| `idx_users_deleted_at` | `users` | `deleted_at` |
| `idx_prt_token` | `password_reset_tokens` | `token` |
| `idx_prt_user_id` | `password_reset_tokens` | `user_id` |
| `idx_rt_user_id` | `refresh_tokens` | `user_id` |
| `idx_rt_hash` | `refresh_tokens` | `token_hash` |
| `idx_cvt_active` | `cv_templates` | `is_active` |
| `idx_cvs_user_id` | `cvs` | `user_id` |
| `idx_cvs_status` | `cvs` | `status` |
| `idx_cvs_deleted_at` | `cvs` | `deleted_at` |
| `idx_jc_parent` | `job_categories` | `parent_id` |
| `idx_jp_recruiter` | `job_postings` | `recruiter_id` |
| `idx_jp_status` | `job_postings` | `status` |
| `idx_jp_title` | `job_postings` | `title` |
| `idx_jp_expires` | `job_postings` | `expires_at` |
| `idx_jp_deleted_at` | `job_postings` | `deleted_at` |
| `idx_jv_job_posting` | `job_views` | `job_posting_id` |
| `idx_jv_viewed_at` | `job_views` | `viewed_at` |
| `idx_app_candidate` | `applications` | `candidate_profile_id` |
| `idx_app_job_posting` | `applications` | `job_posting_id` |
| `idx_app_status` | `applications` | `status` |
| `idx_app_deleted_at` | `applications` | `deleted_at` |
| `idx_af_application` | `application_feedbacks` | `application_id` |
| `idx_notif_user_id` | `notifications` | `user_id` |
| `idx_notif_is_read` | `notifications` | `is_read` |
| `idx_notif_type` | `notifications` | `type` |
| `idx_eq_status` | `email_queue` | `status` |
| `idx_eq_created_at` | `email_queue` | `created_at` |
| `idx_conv_candidate` | `conversations` | `candidate_profile_id` |
| `idx_conv_recruiter` | `conversations` | `recruiter_profile_id` |
| `idx_msg_conversation` | `messages` | `conversation_id` |
| `idx_msg_sender` | `messages` | `sender_id` |
| `idx_msg_sent_at` | `messages` | `sent_at` |

---

## Ghi chú thiết kế

### Soft delete
Các bảng `users`, `cvs`, `applications`, `job_postings` đều có cột `deleted_at DATETIME2 NULL`. Mọi query active record phải thêm điều kiện `WHERE deleted_at IS NULL`. Trigger `trg_jp_soft_delete` tự động set `deleted_at` khi `job_postings.status` đổi thành `'deleted'`.

### Enforce role qua FK
Thay vì dùng trigger kiểm tra role ở từng bảng, các bảng `applications`, `application_feedbacks`, `application_evaluations`, `conversations` sử dụng `candidate_profile_id` và `recruiter_profile_id` làm FK trỏ thẳng đến bảng profile tương ứng. Điều này đảm bảo tính đúng vai trò ngay ở tầng schema mà không cần logic bổ sung.

### JSON trong CV
Các cột `personal_info`, `education`, `experience`, `skills`, `certifications`, `projects` lưu JSON string. Phù hợp với đồ án vì linh hoạt và dễ phát triển. Với hệ thống production cần analytics thì nên tách thành các bảng `cv_educations`, `cv_experiences`, `cv_skills`.

### view_count
Không dùng cột `view_count INT` trực tiếp trong `job_postings` vì dễ race condition khi nhiều request đồng thời. Thay bằng bảng `job_views` để log từng lượt xem riêng biệt.

### Email async
Bảng `email_queue` cho phép hệ thống ghi email cần gửi vào hàng đợi, một background worker riêng sẽ xử lý gửi thực tế và cập nhật `status`. Hỗ trợ retry khi gửi thất bại qua `retry_count` và `error_msg`.
