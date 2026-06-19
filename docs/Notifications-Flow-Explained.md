# Luồng Thông Báo — Giải thích chi tiết

> Tài liệu giải thích sâu module thông báo: nhận thông báo realtime, đánh dấu đã đọc, cache phía client.

---

## Mục lục

1. [Database — Bảng notifications](#1-database--bảng-notifications)
2. [Kịch bản 1 — Nhận thông báo khi có ứng viên mới](#kịch-bản-1--ứng-viên-apply--recruiter-nhận-thông-báo)
3. [Kịch bản 2 — Mở trang thông báo](#kịch-bản-2--recruiter-mở-trang-thông-báo)
4. [Kịch bản 3 — Đánh dấu đã đọc](#kịch-bản-3--recruiter-đọc-thông-báo)
5. [Kịch bản 4 — Đánh dấu tất cả đã đọc](#kịch-bản-4--recruiter-đánh-dấu-tất-cả-đã-đọc)
6. [Kịch bản 5 — Realtime nhận thông báo mới](#kịch-bản-5--realtime-nhận-thông-báo-mới)
7. [Cơ chế Cache](#kịch-bản-6--cơ-chế-cache-phía-client)
8. [Diagram tổng quan](#tổng-kết-luồng-bằng-diagram)
9. [Các điểm cốt lõi](#các-điểm-cốt-lõi-để-nhớ)

---

## 1. Database — Bảng notifications

```
Model Notification {
  id           Int       @id @default(autoincrement())
  userId       Int       @map("user_id")      // Ai nhận thông báo
  type         String                         // 'new_applicant' | 'new_message' | 'job_pending_review' | ...
  title        String                         // "Có ứng viên mới"
  message      String                         // "Một ứng viên vừa ứng tuyển vị trí Frontend Developer"
  relatedType  String?   @map("related_type") // 'application' | 'job' | 'conversation' | ...
  relatedId    Int?      @map("related_id")   // ID của bản ghi liên quan
  isRead       Boolean   @default(false) @map("is_read")
  createdAt    DateTime  @default(now()) @map("created_at")
}
```

## Kịch bản 1 — Ứng viên apply → Recruiter nhận thông báo

### Bước 1: Candidate apply job

**File:** `candidate-application.service.ts:47-62`

Khi candidate nộp đơn, service `candidateApplicationService.create()` chạy:

```typescript
// Sau khi tạo application thành công:
const application = await prisma.application.create({ data: { ... } });
// -> application.id = 100, jobPostingId = 42

// Lấy recruiterId từ job
const job = await prisma.jobPosting.findUnique({
  where: { id: application.jobPostingId },
  select: { recruiterId: true, title: true },
});
// -> job = { recruiterId: 5, title: "Frontend Developer" }

// Tạo notification
await createRecruiterNotification(job.recruiterId, application.id, job.title);
```

### Bước 2: Hàm tạo notification

**File:** `candidate-application.service.ts:47-62`

```typescript
const createRecruiterNotification = async (
  recruiterId: number,
  applicationId: number,
  jobTitle: string,
) => {
  await prisma.notification.create({
    data: {
      userId: recruiterId,                        // 5 (recruiter)
      type: "new_applicant",
      title: "Có ứng viên mới",
      message: `Một ứng viên vừa ứng tuyển vị trí ${jobTitle}`,
      relatedType: "application",
      relatedId: applicationId,                    // 100
    },
  });
};
```

SQL:
```sql
INSERT INTO notifications (user_id, type, title, message, related_type, related_id)
VALUES (5, 'new_applicant', 'Có ứng viên mới', 'Một ứng viên vừa ứng tuyển vị trí Frontend Developer', 'application', 100);
```

### Bước 3: Các nguồn tạo notification khác

Ngoài "có ứng viên mới", còn có:

| Sự kiện | type | Gọi từ |
|---------|------|--------|
| Candidate apply | `new_applicant` | `candidate-application.service.ts:47-62` |
| Tin nhắn mới | `new_message` | `chat.service.ts:80` (createMessageNotification) |
| Job cần duyệt | `job_pending_review` | `recruiter.service.ts:229` (notifyAdmins) |
| Recruiter mới đăng ký | `new_recruiter` | `auth.service.ts` (notifyAdmins) |

---

## Kịch bản 2 — Recruiter mở trang thông báo

### Bước 4: Route match

**File:** `App.tsx:111`

```typescript
<Route path="notifications" element={<RecruiterNotificationsPage />} />
```

→ Render component từ `Notifications.tsx`.

### Bước 5: Load danh sách thông báo

**File:** `Notifications.tsx` lines 122-151

```typescript
const loadNotifications = async (pageNum = page) => {
  const response = await notificationService.getNotifications({
    page: pageNum,
    limit: 20,
  });
  setNotifications(response.data);
  setMeta(response.meta);
};

useEffect(() => {
  loadNotifications();
}, [page]);
```

### Bước 6: Frontend Notification Service — Cache

**File:** `notification.service.ts:33-73`

```typescript
class NotificationService {
  private cache = new Map<string, NotificationListResponse>();

  async getNotifications(params: NotificationParams): Promise<NotificationListResponse> {
    const cacheKey = JSON.stringify(params);

    // Nếu có cache → trả luôn, không gọi API
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const response = await requestApi<NotificationListResponse>({
      method: 'GET',
      url: '/notifications',
      params,
    });

    this.cache.set(cacheKey, response);
    return response;
  }
}
```

→ Dùng `Map<string, Response>` làm cache. Key = stringify của params `{ page, limit }`. Cùng params → cache hit.

### Bước 7: Backend xử lý GET /api/notifications

**Route:** `notification.routes.ts`

```
GET /api/notifications?page=1&limit=20&type=
  → authenticate
  → getNotifications (controller)
```

**Controller — `notification.controller.ts`:**

```typescript
export const getNotifications = async (req, res) => {
  const userId = req.user!.id;                          // 5
  const { page, limit, type } = req.query;
  const pagination = getPagination({ page, limit });    // { page:1, limit:20, skip:0, take:20 }
  const filters = { type: type as string | undefined };

  const { notifications, total } = await notificationService.findAll(
    userId, filters, pagination
  );
  // → Promise.all([findMany, count])

  res.json(paginatedResponse(notifications, { page, limit, total }));
};
```

**Service — `notification.service.ts`:**

```typescript
async findAll(userId: number, filters: { type?: string }, pagination: { skip: number; take: number }) {
  const where: any = { userId };           // WHERE user_id = 5
  if (filters.type) where.type = filters.type;  // AND type = 'new_applicant' (nếu có)

  // Chạy song song findMany + count
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },      // Mới nhất trước
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
}
```

SQL:
```sql
SELECT * FROM notifications
WHERE user_id = 5
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

SELECT COUNT(*) FROM notifications WHERE user_id = 5;
```

### Bước 8: Render danh sách

Mỗi notification render:
- Icon theo type (`new_applicant` → user icon, `new_message` → chat icon)
- Title + message
- Thời gian (relative: "2 phút trước", "1 giờ trước")
- Badge đỏ nếu `isRead === false`
- Click → navigate đến `relatedType`/`relatedId`

### Bước 9: Unread count (header badge)

**File:** `Notifications.tsx` — polling mỗi 2 phút

```typescript
useVisiblePolling(async () => {
  const unreadData = await notificationService.getUnreadCount();
  setUnreadCount(unreadData.count);
}, 120000);
```

Backend:
```typescript
async getUnreadCount(userId: number) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
```

→ Header hiển thị badge đỏ với số thông báo chưa đọc.

---

## Kịch bản 3 — Recruiter đọc thông báo

### Bước 10: Click vào thông báo

```typescript
const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    await notificationService.markAsRead(notification.id);
    // PUT /api/notifications/:id/read
  }
  // Navigate đến trang liên quan
  if (notification.relatedType === 'application') {
    navigate(`/recruiter/candidates?applicationId=${notification.relatedId}`);
  }
};
```

### Bước 11: Frontend — Optimistic update + Clear cache

**File:** `notification.service.ts`:

```typescript
async markAsRead(id: number): Promise<void> {
  // Optimistic: cập nhật state ngay
  this.notifications = this.notifications.map(n =>
    n.id === id ? { ...n, isRead: true } : n
  );

  // Clear cache để lần sau load sẽ lấy data mới
  this.cache.clear();

  // Gọi API thật
  await requestApi({ method: 'PUT', url: `/notifications/${id}/read` });
}
```

### Bước 12: Backend

```typescript
async markAsRead(id: number, userId: number) {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },     // Chỉ chủ sở hữu mới đánh dấu được
  });
  if (!notification) throw new AppError(404, 'Thông báo không tồn tại');

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}
```

→ SQL: `UPDATE notifications SET is_read = true WHERE id = X AND user_id = 5`.

---

## Kịch bản 4 — Recruiter đánh dấu tất cả đã đọc

### Bước 13: Bấm "Đánh dấu tất cả đã đọc"

```typescript
const handleMarkAllAsRead = async () => {
  await notificationService.markAllAsRead();
  setUnreadCount(0);
  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  loadNotifications();    // Refresh danh sách
};
```

### Bước 14: Backend

```typescript
async markAllAsRead(userId: number) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
```

→ SQL: `UPDATE notifications SET is_read = true WHERE user_id = 5 AND is_read = false`.

---

## Kịch bản 5 — Realtime nhận thông báo mới

### Bước 15: Subscribe Supabase

**File:** `Notifications.tsx` lines 172-198

```typescript
useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`,     // Chỉ thông báo của mình
    }, async (payload) => {
      const newNotification = payload.new as Notification;
      // Thêm vào đầu danh sách
      setNotifications(prev => [newNotification, ...prev]);
      // Tăng unread count
      setUnreadCount(prev => prev + 1);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user?.id]);
```

### Bước 16: Cơ chế Realtime

```
1. INSERT vào bảng notifications (Postgres)
2. WAL (Write-Ahead Log) ghi lại
3. Supabase Realtime service đọc WAL
4. Match filter: user_id = 5
5. Push qua WebSocket đến client
6. Client handler chạy → append notification vào đầu list + tăng unread
```

### Bước 17: Polling fallback

Ngoài Realtime, còn có polling định kỳ (dùng `useVisiblePolling`):

```typescript
useVisiblePolling(async () => {
  await loadNotifications();
}, 120000);    // 2 phút
```

→ Fallback nếu kết nối WebSocket bị mất.

---

## Kịch bản 6 — Cơ chế Cache phía Client

### Bước 18: Cache Map

**File:** `notification.service.ts:33-73`

```typescript
class NotificationService {
  private cache = new Map<string, NotificationListResponse>();

  async getNotifications(params) {
    const cacheKey = JSON.stringify(params);

    // Cache hit → return
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Cache miss → gọi API → lưu cache
    const response = await requestApi({ method: 'GET', url: '/notifications', params });
    this.cache.set(cacheKey, response);
    return response;
  }

  async getUnreadCount() {
    // Tương tự: cache theo userId
  }

  // Mutation → clear cache
  async markAsRead(id: number) {
    this.cache.clear();         // Clear toàn bộ cache
    await requestApi({ method: 'PUT', url: `/notifications/${id}/read` });
  }

  async markAllAsRead() {
    this.cache.clear();
    await requestApi({ method: 'PUT', url: '/notifications/read-all' });
  }
}
```

**Cache strategy:**
- **Get**: cache theo params (page, limit)
- **Mutation** (markAsRead, markAllAsRead): clear toàn bộ cache → lần get sau sẽ gọi API mới
- Không có TTL — cache sống đến khi có mutation

---

## Tổng kết luồng bằng diagram

```
┌─────────────────────────────────────────────────────────────┐
│  SỰ KIỆN: Ứng viên apply job                               │
│                                                             │
│  candidate-application.service.ts                           │
│  ├── Tạo application                                        │
│  ├── Lấy recruiterId từ job                                 │
│  └── createRecruiterNotification(recruiterId, appId, title) │
│       └── prisma.notification.create({ ... })                │
│            → INSERT INTO notifications                      │
│                 ↓                                           │
│            Postgres WAL ← ghi lại INSERT                   │
│                 ↓                                           │
│            Supabase Realtime ← đọc WAL, match filter       │
│                 ↓                                           │
│            WebSocket push đến Recruiter Browser            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Recruiter Browser                                          │
│                                                             │
│  Notifications.tsx                                          │
│                                                             │
│  ├── Realtime handler:                                      │
│  │   Payload.new → setNotifications(prev => [new, ...prev]) │
│  │              → setUnreadCount(prev => prev + 1)         │
│  │                                                          │
│  ├── Polling fallback (2 phút):                             │
│  │   getUnreadCount() → setUnreadCount(count)              │
│  │                                                          │
│  └── User click notification:                               │
│       ├── markAsRead(id) → PUT /api/notifications/:id/read │
│       ├── optimistic: set isRead = true (UI ngay)          │
│       ├── cache.clear()                                     │
│       └── navigate(relatedType/relatedId)                   │
│                                                             │
│  Header badge:                                              │
│  ┌─────────────────────────────────┐                        │
│  │  🔔 Thông báo (3)              │ ← unreadCount         │
│  └─────────────────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Các điểm cốt lõi để nhớ

1. **Notification được tạo INLINE trong service khác**: không có "notification service" riêng gọi khi có sự kiện — mỗi service tự gọi `prisma.notification.create()` tại chỗ cần.

2. **Cache Map phía client**: tránh gọi API trùng khi chuyển tab qua lại. Clear cache khi mutation (markAsRead/markAllAsRead).

3. **Optimistic update**: khi markAsRead, UI cập nhật ngay lập tức, không chờ API response. Nếu API fail → có thể rollback.

4. **Realtime + Polling dual**: Realtime (Supabase channel) cho UX tức thì. Polling 2 phút làm fallback nếu WebSocket mất kết nối.

5. **Filter theo userId**: cả Realtime subscription và API query đều lọc theo `user_id` — đảm bảo mỗi user chỉ thấy thông báo của mình.

6. **Authorization khi markAsRead**: `findFirst({ where: { id, userId } })` — không cho đánh dấu thông báo của người khác.

7. **`updateMany` cho markAllAsRead**: 1 câu SQL cập nhật tất cả, không cần loop.

8. **Notification types**: `new_applicant`, `new_message`, `job_pending_review`, `new_recruiter` — mỗi type có icon riêng trên FE.

---

## Các file quan trọng

### Frontend

| File | Vai trò |
|------|---------|
| `src/pages/recruiter/Notifications.tsx` | Trang thông báo (list + realtime) |
| `src/services/notification.service.ts` | API client + cache Map |
| `src/hooks/useVisiblePolling.ts` | Hook polling khi tab visible |

### Backend

| File | Vai trò |
|------|---------|
| `src/routes/notification.routes.ts` | Route definitions |
| `src/controllers/notification.controller.ts` | Request handlers |
| `src/services/notifications/notification.service.ts` | `findAll`, `create`, `markAsRead`, `markAllAsRead`, `getUnreadCount` |
| `src/validations/notifications/notification.validation.ts` | Zod schemas |
| `prisma/schema.prisma` | Notification model |
