# Auth System Overview — LTWeb (HireArch)

> Tài liệu tổng quan về hệ thống Authentication & Authorization
> Từ Frontend → Backend → Database

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript, Vite, port 5173)         │
│  - AuthContext (React Context) quản lý state            │
│  - Axios instance với interceptor tự động refresh token │
│  - ProtectedRoute component kiểm tra role               │
│  - 4 roles: candidate, recruiter, admin, pending        │
├─────────────────────────────────────────────────────────┤
│  BACKEND (Express.js 5 + TypeScript, port 3000)         │
│  - JWT access token (15 phút) + Refresh token (30 ngày)│
│  - Middleware: authenticate + authorize(roles)          │
│  - Zod validation                                       │
│  - Rate limiting (Redis) cho auth endpoints             │
├─────────────────────────────────────────────────────────┤
│  DATABASE (PostgreSQL + Prisma ORM)                     │
│  - users: thông tin tài khoản + role + status           │
│  - refresh_tokens: lưu hash của refresh token           │
│  - password_reset_tokens: lưu token reset password      │
│  - audit_logs: ghi lại mọi hành động của admin          │
│  - candidate_profiles / recruiter_profiles              │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Các Role trong hệ thống

| Role | Mô tả | Trang đăng nhập | Khu vực |
|------|-------|-----------------|---------|
| `candidate` | Ứng viên tìm việc | `/login` | `/candidate/*` |
| `recruiter` | Nhà tuyển dụng | `/login` | `/recruiter/*` |
| `admin` | Quản trị viên hệ thống | `/admin/login` (riêng biệt) | `/admin/*` |
| `pending` | Người dùng mới đăng ký qua Google, chưa chọn role | `/login` → redirect | `/auth/setup-profile` |

---

## 3. Luồng Authentication chi tiết

### 3.1. Đăng ký (Register)

```
Frontend                    Backend                     Database
RegisterCandidate.tsx  →   POST /api/auth/             INSERT INTO users
RegisterEnterprise.tsx      register-candidate          (role='candidate')
                            hoặc                        INSERT INTO candidate_profiles
                            register-recruiter          hoặc recruiter_profiles
                                                         → Gửi welcome email
```

### 3.2. Đăng nhập (Login)

```
Frontend                    Backend                     Database
Login.tsx              →   POST /api/auth/login   →    SELECT * FROM users
AdminLogin.tsx              - Verify bcrypt hash         WHERE email = ?
                            - Tạo JWT (15 phút)          INSERT INTO refresh_tokens
                            - Tạo refresh token          (token_hash, user_id, expires_at)
                      ←   { accessToken, refreshToken, user }
AuthContext:
- Lưu tokens vào localStorage
- Set user state
- Redirect theo role
```

### 3.3. Google OAuth Login

```
Frontend                    Backend                     Database
Login.tsx              →   Supabase Auth (Google)  →    GET /auth/v1/user (Supabase API)
(Supabase SDK)              ↓
                      ←   supabaseAccessToken
                      →   POST /api/auth/              SELECT/INSERT users
                          google-login                  (role='pending' nếu user mới)
                      ←   { accessToken, refreshToken, user }
AuthContext:
- Nếu role='pending' → redirect /auth/setup-profile
- Nếu role='candidate' → redirect /candidate
- Nếu role='recruiter' → redirect /recruiter
```

### 3.4. Token Refresh (tự động)

```
Frontend (Axios Interceptor)        Backend                    Database
Request bất kỳ với Bearer token →
                            ← 401 Unauthorized
POST /api/auth/refresh-token →    Verify refresh token   →   SELECT refresh_tokens
{ refreshToken }                   hash, check expiry         WHERE token_hash = ?
                                   Tạo cặp token mới          UPDATE revoked_at (cũ)
                              ←   { accessToken, refreshToken } INSERT token mới
Lưu token mới vào localStorage
Retry request gốc với token mới →
```

### 3.5. Logout

```
Frontend                    Backend                     Database
DashboardLayout.tsx   →   POST /api/auth/logout   →   UPDATE refresh_tokens
AuthContext.logout()                                    SET revoked_at = NOW()
- Xóa localStorage                                     WHERE token_hash = ?
- Redirect về /login
```

### 3.6. Quên / Reset mật khẩu

```
Frontend                    Backend                     Database
ForgotPassword.tsx     →   POST /api/auth/        →   INSERT password_reset_tokens
                           forgot-password              (token hash, expires_at = now+30ph)
                                                         → Gửi email chứa link reset
ResetPassword.tsx      →   POST /api/auth/        →   SELECT password_reset_tokens
{ token, newPassword }      reset-password              WHERE token = ? AND used_at IS NULL
                                                        UPDATE users SET password_hash = ?
                                                        UPDATE password_reset_tokens SET used_at = NOW()
```

---

## 4. Authorization (Phân quyền)

### Backend — Middleware

**File chính:** `src/middleware/auth.ts`

```typescript
// 1. Xác thực JWT
authenticate(req, res, next)
  → Lấy Bearer token từ header
  → jwt.verify(token, secret)
  → Gán req.user = { id, email, role }

// 2. Kiểm tra role
authorize(...roles)
  → Nếu req.user.role không nằm trong danh sách → 403

// 3. Xác thực tùy chọn (không bắt buộc)
optionalAuth(req, res, next)
  → Có token thì decode, không có thì vẫn cho qua
```

**Cách sử dụng trong routes:**

- Admin routes: `router.use(authenticate, authorize('admin'))`
- Recruiter routes: `router.use(authenticate, authorize('recruiter'))`
- Candidate routes: `router.use(authenticate, authorize('candidate'))`

### Frontend — Route Protection

**File chính:** `src/components/common/ProtectedRoute.tsx`

```typescript
// Logic kiểm tra:
// 1. isLoading → hiển thị spinner
// 2. !isAuthenticated → redirect /login
// 3. user.role === 'pending' nhưng route không cho pending → redirect /auth/setup-profile
// 4. user.role không nằm trong allowedRoles → redirect /login hoặc home theo role
// 5. OK → render <Outlet />
```

**Route groups trong App.tsx:**

| Nhóm | Path | Điều kiện |
|------|------|-----------|
| Public | `/`, `/jobs`, `/companies`, `/cv-templates` | Không cần auth |
| Auth Pages | `/login`, `/register`, `/forgot-password`, `/reset-password` | Không cần auth |
| Candidate | `/candidate/*` | `allowedRoles={["candidate"]}` |
| Recruiter | `/recruiter/*` | `allowedRoles={["recruiter"]}` |
| Admin | `/admin/*` | `allowedRoles={["admin"]}` |
| Pending | `/auth/setup-profile` | `allowedRoles={["pending"]}` |

---

## 5. Database Schema (Auth-related)

### Bảng `users`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Int (PK, auto) | Khóa chính |
| email | String (unique) | Email đăng nhập |
| password_hash | String | Mật khẩu đã hash (bcrypt, 10 rounds) |
| role | String | candidate / recruiter / admin / pending |
| status | String | active / inactive / banned |
| deleted_at | DateTime? | Soft delete |
| created_at | DateTime | |
| updated_at | DateTime | |

### Bảng `refresh_tokens`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Int (PK) | |
| user_id | Int (FK → users) | Liên kết user (cascade delete) |
| token_hash | String (unique) | SHA-256 của raw token |
| device_info | String? | Thông tin thiết bị |
| expires_at | DateTime | Hết hạn (mặc định 30 ngày) |
| revoked_at | DateTime? | Thời điểm thu hồi (logout/đổi mk/ban) |
| created_at | DateTime | |

### Bảng `password_reset_tokens`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Int (PK) | |
| user_id | Int (FK → users) | Liên kết user (cascade delete) |
| token | String (unique) | SHA-256 của raw token |
| expires_at | DateTime | Hết hạn (30 phút) |
| used_at | DateTime? | Đã sử dụng chưa |
| created_at | DateTime | |

### Bảng `audit_logs`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Int (PK) | |
| admin_id | Int (FK → users) | Admin thực hiện hành động |
| action | String | delete_user, toggle_user_status, force_delete_job... |
| target_type | String | user, job_posting... |
| target_id | Int | ID của đối tượng bị tác động |
| details | String? | JSON chứa thông tin bổ sung |
| created_at | DateTime | |

### Bảng `candidate_profiles`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Int (PK) | |
| user_id | Int (FK → users, unique) | 1-1 với users |
| full_name | String | Họ tên |
| phone | String? | SĐT |
| address | String? | Địa chỉ |
| date_of_birth | DateTime? | Ngày sinh |
| avatar_url | String? | URL avatar |
| avatar_storage_path | String? | Path trên Supabase Storage |
| bio | String? | Giới thiệu |

### Bảng `recruiter_profiles`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| id | Int (PK) | |
| user_id | Int (FK → users, unique) | 1-1 với users |
| company_name | String | Tên công ty |
| contact_name | String? | Tên người liên hệ |
| phone | String? | SĐT |
| address | String? | Địa chỉ |
| website | String? | Website công ty |
| description | String? | Mô tả công ty |
| logo_url | String? | URL logo |
| logo_storage_path | String? | Path trên Supabase Storage |

---

## 6. Admin Capabilities (Quyền Admin)

Admin có các quyền đặc biệt sau:

### 6.1. Quản lý người dùng (`/admin/users`)
- Xem danh sách tất cả users (trừ admin khác)
- Ban/Unban user (revoke tất cả refresh tokens khi ban)
- Xóa user (không thể xóa admin khác)
- Không thể sửa admin khác

### 6.2. Quản lý job postings (`/admin/jobs`)
- Duyệt job (`CHO_DUYET` → `DANG_HOAT_DONG`)
- Từ chối job
- Xóa job

### 6.3. Quản lý CV Templates (`/admin/templates`)
- CRUD template CV cho toàn hệ thống

### 6.4. Xem Activity Logs (`/admin/activity-logs`)
- Audit trail ghi lại mọi hành động của admin
- Biết được ai đã làm gì, vào lúc nào

### 6.5. System Dashboard (`/admin/dashboard`)
- Thống kê tổng quan hệ thống (users, jobs, applications...)

### 6.6. Nhận thông báo
- Khi có recruiter mới đăng ký → admin nhận thông báo
- Các sự kiện hệ thống khác

---

## 7. Các file quan trọng cần nắm

### Frontend (`D:\LTWeb\LTWeb-frontend`)

| File | Vai trò |
|------|---------|
| `src/contexts/AuthContext.tsx` | Trung tâm quản lý auth state (login, logout, refresh, user) |
| `src/components/common/ProtectedRoute.tsx` | Route protection theo role |
| `src/App.tsx` | Cấu trúc route và phân quyền theo role |
| `src/lib/api.ts` | Axios instance + interceptor tự động refresh token |
| `src/pages/auth/Login.tsx` | Trang đăng nhập (email/password + Google OAuth) |
| `src/pages/admin/AdminLogin.tsx` | Trang đăng nhập riêng cho admin |
| `src/pages/auth/RegisterCandidate.tsx` | Trang đăng ký ứng viên |
| `src/pages/auth/RegisterEnterprise.tsx` | Trang đăng ký nhà tuyển dụng |
| `src/pages/auth/SetupProfile.tsx` | Trang onboarding cho user Google (chọn role) |
| `src/pages/auth/ForgotPassword.tsx` | Trang quên mật khẩu |
| `src/pages/auth/ResetPassword.tsx` | Trang reset mật khẩu |
| `src/types/user.type.ts` | Type definitions cho User, UserRole, UserStatus |
| `src/types/auth.type.ts` | Type definitions cho Auth request/response |
| `src/services/api-client.ts` | API client wrapper (get, post, put, patch, delete) |
| `src/utils/supabase.ts` | Supabase client cho Google OAuth |

### Backend (`D:\LTWeb\LTWeb-backend`)

| File | Vai trò |
|------|---------|
| `src/middleware/auth.ts` | authenticate + authorize + optionalAuth middleware |
| `src/services/auth/auth.service.ts` | Toàn bộ business logic auth (login, register, refresh, reset...) |
| `src/controllers/auth/auth.controller.ts` | Request handlers cho auth endpoints |
| `src/routes/auth/auth.routes.ts` | Route definitions + rate limiting (authLimiter) |
| `src/validations/auth/auth.validation.ts` | Zod schemas cho validation |
| `src/types/enums.ts` | USER_ROLES, UserRole, UserStatus constants |
| `src/middleware/validate.ts` | Middleware validate request body bằng Zod |
| `src/config/env.ts` | Biến môi trường (JWT_SECRET, CLIENT_URL, SUPABASE...) |
| `prisma/schema.prisma` | Database schema (users, refresh_tokens, audit_logs...) |
| `prisma/seed.ts` | Seed data (5 users mặc định, jobs, skills...) |

---

## 8. Seed Data — Tài khoản mặc định

| Email | Password | Role | Profile |
|-------|----------|------|---------|
| admin@hirearch.com | admin123 | admin | (không có profile) |
| candidate@hirearch.com | candidate123 | candidate | Nguyễn Văn Candidate |
| recruiter@hirearch.com | recruiter123 | recruiter | HireArch Technology |
| nova.recruiter@hirearch.com | recruiter123 | recruiter | Nova Software |
| retail.recruiter@hirearch.com | recruiter123 | recruiter | Global Retail Group |

---

## 9. API Endpoints — Auth

Tất cả endpoint đều có prefix `/api/auth`

| Method | Path | Auth Required | Rate Limit | Mô tả |
|--------|------|---------------|------------|-------|
| POST | `/register-candidate` | Không | 5/15min | Đăng ký ứng viên |
| POST | `/register-recruiter` | Không | 5/15min | Đăng ký nhà tuyển dụng |
| POST | `/login` | Không | 5/15min | Đăng nhập email/password |
| POST | `/google-login` | Không | 5/15min | Đăng nhập qua Google |
| POST | `/refresh-token` | Không | Không | Làm mới cặp token |
| POST | `/forgot-password` | Không | 5/15min | Gửi email reset password |
| POST | `/reset-password` | Không | Không | Đặt lại mật khẩu |
| POST | `/complete-onboarding` | Có (authenticate) | Không | Hoàn tất onboarding (pending → candidate/recruiter) |
| POST | `/logout` | Có (authenticate) | Không | Đăng xuất (revoke refresh token) |
| GET | `/me` | Có (authenticate) | Không | Lấy thông tin user hiện tại |
| PUT | `/change-password` | Có (authenticate) | Không | Đổi mật khẩu |

---

## 10. Token Flow Summary

```
ĐĂNG NHẬP
  Client → POST /auth/login { email, password }
  Server → Verify bcrypt → Tạo JWT (15ph) + RefreshToken (30d) → Lưu hash vào DB
  Client ← { accessToken, refreshToken, user }
  Client → Lưu vào localStorage

REQUEST CÓ AUTH
  Client → Axios gắn header: Authorization: Bearer <accessToken>
  Server → authenticate middleware: jwt.verify → gán req.user
  Server → authorize middleware: check req.user.role

TOKEN HẾT HẠN (401)
  Client ← 401
  Axios Interceptor → POST /auth/refresh-token { refreshToken }
  Server → Verify hash, check expiry/revoked → Tạo cặp mới → Revoke cũ
  Client ← { accessToken, refreshToken }
  Client → Lưu mới → Retry request gốc

LOGOUT
  Client → POST /auth/logout { refreshToken }
  Server → UPDATE refresh_tokens SET revoked_at = NOW()
  Client → Xóa localStorage → Redirect /login
```
