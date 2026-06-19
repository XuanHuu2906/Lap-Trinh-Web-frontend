# Luồng Quản Lý Tin Tuyển Dụng — Giải thích chi tiết

> Tài liệu giải thích sâu module quản lý tin tuyển dụng, từ danh sách tin đến các thao tác: gửi duyệt, đóng tin, xóa.

---

## Mục lục

1. [Kịch bản 1 — Xem danh sách tin](#kịch-bản-1--recruiter-vào-trang-quản-lý-tin)
2. [Kịch bản 2 — Lọc và tìm kiếm](#kịch-bản-2--lọc-và-tìm-kiếm-tin)
3. [Kịch bản 3 — Gửi duyệt](#kịch-bản-3--recruiter-bấm-gửi-duyệt)
4. [Kịch bản 4 — Đóng tin](#kịch-bản-4--đóng-tin-tuyển-dụng)
5. [Kịch bản 5 — Xóa tin](#kịch-bản-5--xóa-tin)
6. [Kịch bản 6 — Các link điều hướng](#kịch-bản-6--sửa-gia-hạn-nhân-bản)
7. [Diagram tổng quan](#tổng-kết-luồng-bằng-diagram)
8. [Các điểm cốt lõi](#các-điểm-cốt-lõi-để-nhớ)

---

## Kịch bản 1 — Recruiter vào trang Quản lý tin

### Bước 1: Route match

**File:** `App.tsx:106`

```typescript
<Route path="manage-jobs" element={<ManageJobsPage />} />
```

→ Render `<ManageJobsPage />` — component từ `ManageJobs.tsx`.

### Bước 2: Component mount — load danh sách

**File:** `ManageJobs.tsx` lines 212-234

```typescript
const loadJobs = async () => {
  try {
    const response = await getMyJobs({ page, limit: 10, status: statusFilter });
    // GET /api/jobs/my?page=1&limit=10&status=
    setJobs(response.data);
    setMeta(response.meta);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Không tải được danh sách tin");
  } finally {
    setInitialLoading(false);
  }
};

useEffect(() => {
  loadJobs();
}, [loadJobs, page, statusFilter]);
```

### Bước 3: Backend xử lý GET /api/jobs/my

**Route:** `recruiter.routes.ts:45`

```
GET /api/jobs/my?page=1&limit=10&status= → recruiterOnly → getMyJobs (controller)
```

**Controller — `recruiter.controller.ts`:**

```typescript
export const getMyJobs = async (req, res, next) => {
  const userId = getCurrentUserId(req);          // 5
  const { page, limit, status } = req.query;     // page=1, limit=10, status=undefined
  const pagination = getPagination({ page, limit }); // { page: 1, limit: 10, skip: 0, take: 10 }

  const result = await recruiterJobService.findMyJobs(
    userId, pagination, status as string | undefined
  );
  // { items: [...], meta: { total, page, limit, totalPages } }

  res.json({ success: true, data: result.items, meta: result.meta });
};
```

**Service — `recruiter.service.ts:260-284`:**

```typescript
async findMyJobs(recruiterId: number, pagination: Pagination, statusFilter?: string) {
  const where: Prisma.JobPostingWhereInput = {
    recruiterId,                        // WHERE recruiter_id = 5
    deletedAt: null,                    // AND deleted_at IS NULL (soft-delete)
  };
  if (statusFilter) where.status = statusFilter;   // Nếu có filter status

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      include: {
        _count: { select: { applications: true } },  // Đếm ứng viên
        category: { select: { name: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: 'desc' },     // Mới nhất trước
      skip: pagination.skip,              // 0
      take: pagination.take,              // 10
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return { items: jobs, total, ... };
}
```

SQL tương đương:
```sql
SELECT j.*,
  (SELECT COUNT(*) FROM applications WHERE job_posting_id = j.id AND deleted_at IS NULL) AS applications_count,
  (SELECT row_to_json(c.*) FROM job_categories c WHERE c.id = j.category_id) AS category,
  (SELECT json_agg(json_build_object('skill', s.*))
   FROM job_posting_skills jps JOIN job_skills s ON jps.skill_id = s.id
   WHERE jps.job_posting_id = j.id) AS skills
FROM job_postings j
WHERE j.recruiter_id = 5 AND j.deleted_at IS NULL
ORDER BY j.created_at DESC
LIMIT 10 OFFSET 0;
```

→ Trả về mảng jobs với sẵn: số ứng viên, tên danh mục, danh sách kỹ năng.

### Bước 4: Render danh sách

**File:** `ManageJobs.tsx` lines 456-697

Mỗi job được render trong card/Dropdown với:

| Thông tin hiển thị | Data source |
|-------------------|-------------|
| Tiêu đề + trạng thái | `job.title`, `job.status` |
| Số lượng ứng viên | `job._count.applications` |
| Danh mục | `job.category?.name` |
| Kỹ năng | `job.skills` (map render tag) |
| Hạn nộp | `job.expiresAt` |
| Ngày đăng | `job.createdAt` |

Trạng thái tin được hiển thị bằng badge màu:

| Status | Label | Màu |
|--------|-------|-----|
| `DRAFT` | Nháp | Xám |
| `PENDING_REVIEW` | Chờ duyệt | Vàng |
| `ACTIVE` | Đã duyệt | Xanh lá |
| `CLOSED` | Đã đóng | Đỏ |
| `REJECTED` | Từ chối | Đỏ đậm |

---

## Kịch bản 2 — Lọc và tìm kiếm tin

### Bước 5: Filter client-side

**File:** `ManageJobs.tsx` lines 304-341

```typescript
const filteredJobs = useMemo(() => {
  let result = jobs;

  // Lọc theo keyword (title, location, category)
  if (keyword.trim()) {
    const kw = keyword.toLowerCase();
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(kw) ||
        job.location?.toLowerCase().includes(kw) ||
        job.category?.name?.toLowerCase().includes(kw)
    );
  }

  // Lọc theo category
  if (categoryFilter) {
    result = result.filter((job) => job.categoryId === Number(categoryFilter));
  }

  // Sort
  switch (sortFilter) {
    case "newest":
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "deadline":
      result.sort((a, b) => new Date(a.expiresAt ?? 0).getTime() - new Date(b.expiresAt ?? 0).getTime());
      break;
    case "applications":
      result.sort((a, b) => (b._count?.applications ?? 0) - (a._count?.applications ?? 0));
      break;
  }

  return result;
}, [jobs, keyword, categoryFilter, sortFilter]);
```

→ **Server-side**: chỉ filter theo status. **Client-side**: keyword, category, sort. Vì API trả về tối đa 10 job/page nên filter client là đủ.

---

## Kịch bản 3 — Recruiter bấm "Gửi duyệt"

### Bước 6: Dropdown → "Gửi duyệt"

**File:** `ManageJobs.tsx` lines 733-823

```typescript
<button onClick={() => handleUpdateStatus(job.id, 'CHO_DUYET')}>
  Gửi duyệt
</button>
```

```typescript
const handleUpdateStatus = async (id: number, newStatus: string) => {
  try {
    const response = await updateJobStatus(id, newStatus);
    // PATCH /api/jobs/:id/status  body: { status: "CHO_DUYET" }
    setMessage("Cập nhật trạng thái thành công");
    await loadJobs();           // Refresh danh sách
  } catch (err) {
    setError(err instanceof Error ? err.message : "Cập nhật thất bại");
  }
};
```

### Bước 7: Backend xử lý

**Route:** `recruiter.routes.ts:90-95`

```
PATCH /api/jobs/:id/status
  → recruiterOnly
  → validate(updateJobStatusSchema)  // { status: 'active' | 'pending_review' | 'closed' }
  → updateJobStatus (controller)
```

**Controller — `recruiter.controller.ts:236-255`:**

```typescript
export const updateJobStatus = async (req, res, next) => {
  const job = await recruiterJobService.updateStatus(
    parseId(req.params.id),       // job id
    getCurrentUserId(req),        // recruiter id (5)
    req.body.status,              // "CHO_DUYET"
  );
  res.json({ success: true, data: job, message: 'Cập nhật trạng thái thành công' });
};
```

**Service — `recruiter.service.ts:424-491`:**

```typescript
async updateStatus(id: number, recruiterId: number, status: string) {
  // 1. Kiểm tra ownership + tồn tại
  const job = await ensureOwnJob(id, recruiterId);

  // 2. Xử lý tương thích ngược: 'active' → PENDING_REVIEW
  const legacySubmitForReview = status === 'active';
  const nextStatus = legacySubmitForReview || status === JOB_STATUS.PENDING_REVIEW
    ? JOB_STATUS.PENDING_REVIEW
    : status === JOB_STATUS.CLOSED
      ? JOB_STATUS.CLOSED
      : null;

  if (!nextStatus) throw new AppError(400, 'Trạng thái không hợp lệ');

  // 3. Kiểm tra trạng thái hiện tại có được phép chuyển không
  if (!recruiterManagedStatuses.includes(job.status)) {
    throw new AppError(400, 'Trạng thái tin tuyển dụng không hợp lệ');
  }

  // 4. Nếu tin đã active → bỏ qua
  if (legacySubmitForReview && job.status === JOB_STATUS.ACTIVE) {
    return this.findById(id, recruiterId);
  }

  // 5. Kiểm tra hạn nộp khi gửi duyệt
  if (nextStatus === JOB_STATUS.PENDING_REVIEW) {
    if (job.status === JOB_STATUS.ACTIVE) {
      throw new AppError(400, 'Tin đã được duyệt, không thể chuyển về chờ duyệt');
    }
    ensureActiveExpiry(job.expiresAt);  // Hạn nộp không được ở quá khứ
  }

  // 6. UPDATE status
  const updatedJob = await prisma.jobPosting.update({
    where: { id },
    data: { status: nextStatus },
    include: jobInclude,
  });

  // 7. Gửi thông báo admin khi gửi duyệt
  if (nextStatus === JOB_STATUS.PENDING_REVIEW) {
    await notifyAdmins('job_pending_review', ...);
  }

  return updatedJob;
}
```

**Sơ đồ chuyển trạng thái:**

```
DRAFT ─────────────► PENDING_REVIEW ────► ACTIVE (bởi admin)
  │                      │                     │
  │                      ▼                     ▼
  └──────────────► CLOSED ◄───────────────────┘
                     (bất kỳ lúc nào)
```

Từ `DRAFT` → gửi duyệt → `PENDING_REVIEW`. Admin duyệt → `ACTIVE`. Recruiter có thể đóng tin (`CLOSED`) bất kỳ lúc nào. Không thể quay ngược.

---

## Kịch bản 4 — Đóng tin tuyển dụng

### Bước 8: Dropdown → "Đóng tin"

```typescript
<button onClick={() => handleUpdateStatus(job.id, 'closed')}>
  Đóng tin
</button>
```

→ Gọi `PATCH /api/jobs/:id/status` với `{ status: "closed" }`.

Luồng tương tự gửi duyệt nhưng:
- `nextStatus = CLOSED`
- **Không** kiểm tra hạn nộp
- **Không** gửi thông báo admin

Service chỉ đơn giản:
```typescript
const updatedJob = await prisma.jobPosting.update({
  where: { id },
  data: { status: JOB_STATUS.CLOSED },
});
```

→ Tin chuyển sang trạng thái "Đã đóng", ứng viên không thể apply thêm.

---

## Kịch bản 5 — Xóa tin

### Bước 9: Dropdown → "Xóa" → confirm dialog

**File:** `ManageJobs.tsx`

```typescript
const handleDeleteJob = async (job: RecruiterJob) => {
  // Hiển thị confirm dialog
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa tin "${job.title}"? Hành động này không thể hoàn tác.`
  );
  if (!confirmed) return;

  try {
    await deleteRecruiterJob(job.id);   // DELETE /api/jobs/:id
    setMessage(`Đã xóa tin "${job.title}"`);
    await loadJobs();                   // Refresh danh sách
  } catch (err) {
    setError(err instanceof Error ? err.message : "Xóa tin thất bại");
  }
};
```

→ Gọi `DELETE /api/jobs/:id`.

### Bước 10: Backend xử lý

**Route:** `recruiter.routes.ts:105`

```
DELETE /api/jobs/:id → recruiterOnly → deleteJob (controller)
```

**Controller — `recruiter.controller.ts:210-224`:**

```typescript
export const deleteJob = async (req, res, next) => {
  await recruiterJobService.softDelete(parseId(req.params.id), getCurrentUserId(req));
  res.json({ success: true, message: 'Xóa tin thành công' });
};
```

**Service — `recruiter.service.ts:387-407`:**

```typescript
async softDelete(id: number, recruiterId: number) {
  // 1. Kiểm tra ownership
  await ensureOwnJob(id, recruiterId);

  // 2. Kiểm tra còn ứng viên pending không
  const pendingApplications = await prisma.application.count({
    where: { jobPostingId: id, status: 'pending', deletedAt: null },
  });

  if (pendingApplications > 0) {
    throw new AppError(
      400,
      'Tin đang có ứng viên pending, vui lòng xử lý trước khi xóa',
    );
  }

  // 3. Soft delete
  await prisma.jobPosting.update({
    where: { id },
    data: { deletedAt: new Date(), status: JOB_STATUS.CLOSED },
  });
}
```

**Soft delete**: không xóa record khỏi database, chỉ set `deletedAt = now()` + chuyển status `CLOSED`. Các query sau luôn có `where: { deletedAt: null }` để ẩn tin đã xóa.

**Guard**: không cho xóa nếu còn ứng viên `pending` — recruiter phải xử lý (review/interview/reject) hết ứng viên trước.

---

## Kịch bản 6 — Sửa / Gia hạn / Nhân bản

### Bước 11: Các link điều hướng

Tất cả đều là `<Link>` từ React Router — không gọi API trực tiếp:

| Thao tác | Link | Route đích |
|----------|------|-----------|
| Sửa | `/recruiter/manage-jobs/${id}/edit` | `manage-jobs/:id/edit` → PostJobPage |
| Gia hạn | `/recruiter/manage-jobs/${id}/edit?focus=expiresAt` | `manage-jobs/:id/edit` → PostJobPage |
| Nhân bản | `/recruiter/post-job?duplicateFrom=${id}` | `post-job` → PostJobPage |

**File:** `ManageJobs.tsx` lines 740, 750, 760

```typescript
// Sửa (dòng 740)
<Link to={`/recruiter/manage-jobs/${job.id}/edit`}>Sửa</Link>

// Gia hạn (dòng 750) — focus vào input hạn nộp
<Link to={`/recruiter/manage-jobs/${job.id}/edit?focus=expiresAt`}>Gia hạn</Link>

// Nhân bản (dòng 760)
<Link to={`/recruiter/post-job?duplicateFrom=${job.id}`}>Nhân bản</Link>
```

Trong `PostJobPage`, `useSearchParams().get("focus") === "expiresAt"` → `expiresAtInputRef.current?.focus()` (dòng 289-294) — auto focus vào trường hạn nộp khi user chọn "Gia hạn".

---

## Tổng kết luồng bằng diagram

```
┌──────────────────────────────────────────────┐
│ ManageJobs.tsx                                │
│                                                │
│  loadJobs() → GET /api/jobs/my?page=1&limit=10│
│      ↓                                        │
│  Render danh sách job cards                    │
│      ↓                                        │
│  User chọn thao tác từ dropdown:               │
│                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  SỬA     │ │ GIA HẠN │ │ NHÂN BẢN │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │            │            │              │
│    Link to     Link to      Link to           │
│    /edit       /edit?focus  /post-job?        │
│                 =expiresAt  duplicateFrom=    │
│       │            │            │              │
│       ▼            ▼            ▼              │
│  ┌──────────────────────────────────────┐      │
│  │        PostJobPage                   │      │
│  │  (isEditing / isDuplicating)        │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  ┌──────────┐    ┌──────────┐  ┌──────────┐   │
│  │GỬI DUYỆT │    │ ĐÓNG TIN │  │   XÓA    │   │
│  └────┬─────┘    └────┬─────┘  └────┬─────┘   │
│       │               │             │          │
│    PATCH /:id/    PATCH /:id/   DELETE /:id/  │
│    status          status                     │
│    {status:       {status:       confirm dialog│
│     "CHO_DUYET"}   "closed"}     → OK         │
│       │               │             │          │
│       ▼               ▼             ▼          │
│  ┌────────────────────────────────────────┐    │
│  │       Backend: recruiter.service.ts    │    │
│  │                                        │    │
│  │ updateStatus():                        │    │
│  │  • ensureOwnJob (ownership check)      │    │
│  │  • validate status transition          │    │
│  │  • ensureActiveExpiry (nếu gửi duyệt)  │    │
│  │  • UPDATE job_postings SET status      │    │
│  │  • notifyAdmins (nếu gửi duyệt)        │    │
│  │                                        │    │
│  │ softDelete():                          │    │
│  │  • ensureOwnJob                        │    │
│  │  • check pending applications          │    │
│  │  • UPDATE SET deletedAt, status=CLOSED │    │
│  └────────────────┬───────────────────────┘    │
│                   │                            │
│                   ◄── Response                 │
│                   │                            │
│               loadJobs() // refresh lại        │
│                                                │
└──────────────────────────────────────────────────┘
```

---

## Các điểm cốt lõi để nhớ

1. **Phân trang server-side**: API trả về `items + meta ({ total, page, limit, totalPages })` — FE render thanh pagination.

2. **Filter client-side**: keyword, category, sort đều xử lý trên FE vì mỗi lần chỉ load 10 job, filter rất nhanh.

3. **Status machine**: Draft → Pending Review → Active (bởi admin). Recruiter có thể đóng/xóa bất kỳ lúc nào. Không thể quay ngược trạng thái.

4. **Guard khi gửi duyệt**: kiểm tra hạn nộp không được ở quá khứ.

5. **Guard khi xóa**: kiểm tra không còn ứng viên pending — bắt recruiter xử lý hết trước.

6. **Soft delete**: set `deletedAt` thay vì xóa thật. Query luôn có `deletedAt: null`.

7. **Ownership check mọi endpoint**: `ensureOwnJob(id, recruiterId)` — không cho recruiter A thao tác job của recruiter B.

8. **Dropdown 6 thao tác**: sửa (link), gia hạn (link), nhân bản (link), gửi duyệt (API), đóng (API), xóa (API confirm).

---

## Các file quan trọng

### Frontend

| File | Vai trò |
|------|---------|
| `src/pages/recruiter/ManageJobs.tsx` | Danh sách tin + dropdown thao tác (867 dòng) |
| `src/services/recruiter.service.ts` | API client: `getMyJobs`, `updateJobStatus`, `deleteRecruiterJob` |

### Backend

| File | Vai trò |
|------|---------|
| `src/routes/jobs/recruiter.routes.ts` | Route definitions |
| `src/controllers/jobs/recruiter.controller.ts` | Request handlers |
| `src/services/jobs/recruiter.service.ts` | `findMyJobs`, `updateStatus`, `softDelete` |
| `src/validations/jobs/recruiter.validation.ts` | `updateJobStatusSchema` |
