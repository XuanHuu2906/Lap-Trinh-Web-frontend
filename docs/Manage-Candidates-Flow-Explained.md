# Luồng Quản Lý Ứng Viên — Giải thích chi tiết

> Tài liệu giải thích sâu module quản lý ứng viên: danh sách ứng viên, xem CV, phản hồi, phỏng vấn, đánh giá.

---

## Mục lục

1. [Kịch bản 1 — Xem danh sách ứng viên](#kịch-bản-1--recruiter-vào-trang-quản-lý-ứng-viên)
2. [Kịch bản 2 — Chọn ứng viên xem chi tiết](#kịch-bản-2--recruiter-chọn-ứng-viên-xem-chi-tiết)
3. [Kịch bản 3 — Đánh dấu đã xem (reviewing)](#kịch-bản-3--đánh-dấu-đã-xem)
4. [Kịch bản 4 — Gửi lời mời phỏng vấn](#kịch-bản-4--gửi-lời-mời-phỏng-vấn)
5. [Kịch bản 5 — Từ chối ứng viên](#kịch-bản-5--từ-chối-ứng-viên)
6. [Kịch bản 6 — Đánh giá nội bộ (evaluation)](#kịch-bản-6--đánh-giá-nội-bộ-sau-khi-trúng-tuyển)
7. [Kịch bản 7 — Realtime cập nhật](#kịch-bản-7--realtime-cập-nhật)
8. [Diagram tổng quan](#tổng-kết-luồng-bằng-diagram)
9. [Các điểm cốt lõi](#các-điểm-cốt-lõi-để-nhớ)

---

## Nhân vật trong kịch bản

- **Recruiter A**: `userId=5`, `recruiterProfileId=3`, công ty "HireArch"
- **Candidate B**: `userId=10`, `candidateProfileId=7`
- **Job J**: `jobPostingId=42` — "Frontend Developer" (do Recruiter A đăng)
- **Application**: `applicationId=100`

---

## Kịch bản 1 — Recruiter vào trang Quản lý ứng viên

### Bước 1: Route match

**File:** `App.tsx:109`

```typescript
<Route path="candidates" element={<ManageCandidatesPage />} />
```

→ Render `<ManageCandidatesPage />` — component từ `ManageCandidates.tsx`.

### Bước 2: Component mount — load jobs + applications

**File:** `ManageCandidates.tsx` lines 158-232

```typescript
// Load danh sách jobs của recruiter (cho dropdown filter)
const loadJobs = async () => {
  const response = await getMyJobs({ page: 1, limit: 100 });
  setJobs(response.data);
};

// Load danh sách ứng viên
const loadApplications = async () => {
  const response = await getRecruiterApplications({
    jobId: jobFilter || undefined,
    page,
    limit: 10,
    status: statusFilter || undefined,
  });
  setApplications(response.data);
  setMeta(response.meta);
};

useEffect(() => { loadJobs(); }, []);
useEffect(() => { loadApplications(); }, [loadApplications, page, jobFilter, statusFilter]);
```

### Bước 3: Backend xử lý GET /api/applications/recruiter

**Route:**

```
GET /api/applications/recruiter → recruiterOnly → findApplications (controller)
```

**Service — `recruiter.service.ts:222-291`:**

```typescript
async findApplications(userId: number, filters: ApplicationFilter, pagination: Pagination) {
  const where: Prisma.ApplicationWhereInput = {
    deletedAt: null,
    jobPosting: { recruiterId: userId },     // ← CHỈ lấy ứng viên của job do recruiter này đăng
  };

  if (filters.jobId) where.jobPostingId = filters.jobId;       // Filter theo job
  if (filters.status) where.status = filters.status;            // Filter theo trạng thái

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        candidateProfile: { include: { user: { select: { fullName, email } } } },
        cv: true,
        jobPosting: { select: { title } },
        feedbacks: { orderBy: { createdAt: 'desc' }, take: 1 },
        evaluations: true,
        interviews: { orderBy: { scheduledAt: 'desc' }, take: 1 },
        conversation: { select: { id } },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.application.count({ where }),
  ]);

  // Sinh signed URL cho CV (hết hạn 600s)
  const mappedApplications = await Promise.all(
    applications.map(async (app) => {
      if (app.cv?.storagePath) {
        app.cv.url = await storageService.getSignedUrl(app.cv.storagePath, 600);
      }
      return app;
    })
  );

  return { items: mappedApplications, meta: toPaginationMeta(total, pagination) };
}
```

**Key point**: `jobPosting: { recruiterId: userId }` — WHERE qua relation, đảm bảo recruiter chỉ xem được ứng viên của job mình, không xem được của recruiter khác.

Each application includes 6 relations:
- `candidateProfile.user` — tên + email ứng viên
- `cv` — thông tin CV (storagePath để sinh signed URL)
- `jobPosting` — tên job
- `feedbacks` — phản hồi gần nhất
- `evaluations` — đánh giá nội bộ
- `interviews` — lịch phỏng vấn gần nhất
- `conversation` — ID chat để link

### Bước 4: Render danh sách

Mỗi ứng viên hiển thị:
- Avatar + tên
- Tên job ứng tuyển
- Trạng thái (PENDING / REVIEWING / INTERVIEW / CONFIRMED / REJECTED)
- Ngày ứng tuyển
- Nút "Xem chi tiết" → mở `ApplicationDetailPanel`

---

## Kịch bản 2 — Recruiter chọn ứng viên xem chi tiết

### Bước 5: Click vào ứng viên → mở ApplicationDetailPanel

**File:** `ManageCandidates.tsx`

```typescript
<ApplicationDetailPanel
  application={selectedApplication}
  onChangeStatus={(status) => void handleChangeStatus(status)}
  onSaveFeedback={(interviewData) => void handleSaveFeedback(interviewData)}
  onSaveEvaluation={(score, notes) => void handleSaveEvaluation(score, notes)}
/>
```

`ApplicationDetailPanel` (file: `ApplicationDetailPanel.tsx` — 800 dòng) render 4 section tùy trạng thái:

| Status | Panel hiển thị | Hành động có thể |
|--------|---------------|-----------------|
| `PENDING` | Thông tin CV + nút "Đánh dấu đã đọc" | → `onChangeStatus('reviewing')` |
| `REVIEWING` | Form feedback (phản hồi / từ chối) + Form lịch PV | → gửi feedback / schedule interview / reject |
| `INTERVIEW` | Alert "Đã gửi thư mời" + thông tin lịch | — |
| `CONFIRMED` | Form đánh giá nội bộ (score 1-5 + notes) | → `onSaveEvaluation(score, notes)` |
| `REJECTED` | Alert "Đã từ chối" + lý do | — |

### Bước 6: Xem CV — Signed URL

Khi ApplicationDetailPanel hiển thị, nó render file CV. CV được lưu trên **Supabase Storage bucket private** → cần signed URL để truy cập:

```typescript
// Trong findApplications service
if (app.cv?.storagePath) {
  app.cv.url = await storageService.getSignedUrl(app.cv.storagePath, 600);
  // Tạo URL có chữ ký, hết hạn sau 600s (10 phút)
}
```

URL mẫu:
```
https://xxxx.supabase.co/storage/v1/object/signed/cvs/user-10/cv.pdf?token=xxx&expires=1718780400
```

→ CV chỉ xem được trong 10 phút. Hết hạn → re-fetch ứng viên để có URL mới.

---

## Kịch bản 3 — Đánh dấu đã xem

### Bước 7: Recruiter bấm "Đánh dấu đã xem" trên PENDING

```typescript
// ApplicationDetailPanel gọi:
onChangeStatus('reviewing')
```

### Bước 8: Frontend gọi API

**File:** `ManageCandidates.tsx:382-401`

```typescript
const handleChangeStatus = async (nextStatus: NextApplicationStatus) => {
  if (!selectedApplication) return;
  try {
    await updateApplicationStatus(selectedApplication.id, nextStatus);
    // PUT /api/applications/:id/status  body: { status: 'reviewing' }
    setMessage("Cập nhật trạng thái ứng viên thành công");

    // Refresh detail + reload danh sách
    const response = await getApplicationDetail(selectedApplication.id);
    hydrateApplicationForm(response.data);
    await loadApplications();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái");
  }
};
```

### Bước 9: Backend xử lý

**Route:**

```
PUT /api/applications/:id/status
  → authenticate + authorize('recruiter')
  → validate(updateApplicationStatusSchema)  // { status: 'reviewing' | 'interview' | 'rejected' | 'hired' }
  → updateApplicationStatus (controller)
```

**Service:**

```typescript
async updateApplicationStatus(applicationId: number, recruiterUserId: number, status: string) {
  // Kiểm tra application thuộc job của recruiter
  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobPosting: { recruiterId: recruiterUserId } },
  });
  if (!application) throw new AppError(404, 'Không tìm thấy ứng viên');

  // Update status
  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: { ... },
  });
  return updated;
}
```

---

## Kịch bản 4 — Gửi lời mời phỏng vấn

### Bước 10: Recruiter điền form phỏng vấn

ApplicationDetailPanel hiển thị form:
- Nội dung phản hồi (textarea)
- Ngày giờ phỏng vấn (datetime-local)
- Loại phỏng vấn (online/offline)
- Địa điểm / link meeting

### Bước 11: Bấm "Gửi thư mời"

```typescript
const handleSaveFeedback = async (interviewData?: InterviewData) => {
  if (feedbackStatus === 'interview' && interviewData) {
    await scheduleInterview(applicationId, {        // POST /api/applications/:id/interview
      content: feedbackContent,
      scheduledAt: interviewData.scheduledAt,
      type: interviewData.type,
      location: interviewData.location,
      meetingLink: interviewData.meetingLink,
    });
    // Refresh
    const response = await getApplicationDetail(applicationId);
    hydrateApplicationForm(response.data);
    await loadApplications();
  }
};
```

### Bước 12: Backend — Transaction 3 bước

**Service — `recruiter.service.ts:609-703`:**

```typescript
async scheduleInterview(applicationId: number, recruiterUserId: number, data: InterviewInput) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobPosting: { recruiterId: recruiterUserId } },
    include: { candidateProfile: { include: { user: true } }, jobPosting: true },
  });
  if (!application) throw new AppError(404, 'Không tìm thấy ứng viên');
  if (application.status !== 'reviewing') throw new AppError(400, 'Trạng thái không hợp lệ');

  // TRANSACTION: 3 bước atomic
  const result = await prisma.$transaction(async (tx) => {
    // Bước 1: Tạo feedback
    const feedback = await tx.applicationFeedback.create({
      data: {
        applicationId,
        content: data.content,
        status: 'interview',
      },
    });

    // Bước 2: Cập nhật application status → INTERVIEW
    await tx.application.update({
      where: { id: applicationId },
      data: { status: 'interview' },
    });

    // Bước 3: Tạo interview record
    const interview = await tx.interview.create({
      data: {
        applicationId,
        scheduledAt: new Date(data.scheduledAt),
        type: data.type,
        location: data.location ?? null,
        meetingLink: data.meetingLink ?? null,
        notes: data.notes ?? null,
        status: 'scheduled',
      },
    });

    return { feedback, interview };
  });

  // Ngoài transaction: gửi email (non-blocking)
  try {
    await sendInterviewEmail(application.candidateProfile.user.email, {
      jobTitle: application.jobPosting.title,
      scheduledAt: data.scheduledAt,
      type: data.type,
      meetingLink: data.meetingLink,
    });
  } catch (err) { console.error('Gửi email thất bại:', err); }

  // Tạo notification cho candidate
  await notifyCandidate(
    application.candidateProfile.userId,
    'interview_invitation',
    'Thư mời phỏng vấn',
    `Bạn có lịch phỏng vấn vị trí ${application.jobPosting.title}`,
  );

  return result;
}
```

**Tại sao dùng transaction?** Cả 3 bước phải cùng thành công hoặc cùng thất bại:
1. Tạo feedback
2. Update application status
3. Tạo interview record

Nếu bước 3 fail → bước 1+2 tự động rollback.

**Gửi email + notification**: riêng biệt, không blocking — nếu fail không ảnh hưởng luồng chính.

---

## Kịch bản 5 — Từ chối ứng viên

### Bước 13: Recruiter bấm "Từ chối"

```typescript
const handleSaveFeedback = async () => {
  if (feedbackStatus === 'rejected') {
    await createFeedback(applicationId, {           // POST /api/applications/:id/feedback
      content: feedbackContent,
      status: 'rejected',
    });
    // + update status:
    await updateApplicationStatus(applicationId, 'rejected');
  }
};
```

→ Gọi 2 API: tạo feedback + update status.

**Backend — `createFeedback`:**

```typescript
async createFeedback(applicationId, recruiterUserId, data) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobPosting: { recruiterId: recruiterUserId } },
  });
  if (!application) throw new AppError(404, 'Không tìm thấy ứng viên');

  // Tạo feedback
  const feedback = await prisma.applicationFeedback.create({
    data: {
      applicationId,
      content: data.content,
      status: data.status,     // 'rejected'
    },
  });

  // Update status application
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'rejected' },
  });

  return feedback;
}
```

→ Ứng viên thấy trạng thái "Đã từ chối" + lý do từ recruiter.

---

## Kịch bản 6 — Đánh giá nội bộ (sau khi trúng tuyển)

### Bước 14: Application ở trạng thái CONFIRMED

Recruiter thấy form đánh giá nội bộ (score 1-5 + notes). Đây là đánh giá **nội bộ**, ứng viên không thấy.

### Bước 15: Bấm "Lưu đánh giá"

```typescript
const handleSaveEvaluation = async (score: number, notes: string) => {
  await createEvaluation(applicationId, score, notes || null);
  // POST /api/applications/:id/evaluate
};
```

### Bước 16: Backend — Upsert

**Service — `recruiter.service.ts:537-556`:**

```typescript
async createEvaluation(applicationId: number, recruiterUserId: number, score: number, notes?: string) {
  // Kiểm tra application
  const application = await prisma.application.findFirst({
    where: { id: applicationId, jobPosting: { recruiterId: recruiterUserId } },
  });
  if (!application) throw new AppError(404, 'Không tìm thấy ứng viên');

  // Upsert: mỗi application chỉ có 1 evaluation
  return prisma.applicationEvaluation.upsert({
    where: { applicationId },                    // unique constraint
    create: {
      applicationId,
      recruiterProfileId: application.recruiterProfileId,
      score,
      notes,
    },
    update: { score, notes },                    // Nếu đã có → update
  });
}
```

**Dùng `upsert` thay vì `create`**: vì mỗi application chỉ có **1 evaluation** duy nhất. Nếu đã tạo rồi mà gọi lại → cập nhật, không tạo mới trùng.

---

## Kịch bản 7 — Realtime cập nhật

### Bước 17: Subscribe Supabase

**File:** `ManageCandidates.tsx` lines 268-295

```typescript
useEffect(() => {
  const channel = supabase
    .channel('applications-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'applications',
      filter: `jobPosting_recruiterId=eq.${user?.id}`, // Chỉ ứng viên của recruiter này
    }, () => {
      loadApplications();   // Có thay đổi → reload
      if (selectedApplication) {
        getApplicationDetail(selectedApplication.id).then(...);
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [selectedApplication, user?.id, loadApplications]);
```

→ Khi có ứng viên mới apply, hoặc trạng thái thay đổi (bởi candidate confirm interview, v.v.) → **tự động reload** danh sách + detail panel.

---

## Tổng kết luồng bằng diagram

```
┌──────────────────────────────────────────────────────────┐
│  ManageCandidates.tsx                                     │
│                                                            │
│  loadJobs() → GET /api/jobs/my                            │
│  loadApplications() → GET /api/applications/recruiter     │
│      ↓                                                    │
│  Render danh sách ứng viên (table/card)                   │
│      ↓                                                    │
│  Click vào ứng viên → setSelectedApplication              │
│      ↓                                                    │
│  ┌──────────────────────────────────────────────────┐     │
│  │  ApplicationDetailPanel                          │     │
│  │                                                   │     │
│  │  ├── PENDING:                                     │     │
│  │  │   Xem CV (signed URL 10 phút)                  │     │
│  │  │   [Đánh dấu đã đọc] → PUT /:id/status         │     │
│  │  │                      { status: 'reviewing' }   │     │
│  │  │                                                   │     │
│  │  ├── REVIEWING:                                    │     │
│  │  │   Feedback form (nội dung + lý do)              │     │
│  │  │   [Gửi phản hồi] → POST /:id/feedback          │     │
│  │  │   [Mời phỏng vấn] → POST /:id/interview        │     │
│  │  │                      (transaction 3 bước)       │     │
│  │  │   [Từ chối] → POST /:id/feedback + PUT status  │     │
│  │  │                                                   │     │
│  │  ├── INTERVIEW:                                     │     │
│  │  │   Alert "Đã gửi thư mời" + thông tin lịch       │     │
│  │  │                                                   │     │
│  │  ├── CONFIRMED:                                     │     │
│  │  │   Evaluation form (score 1-5 + notes)            │     │
│  │  │   [Lưu đánh giá] → POST /:id/evaluate (upsert)  │     │
│  │  │                                                   │     │
│  │  └── REJECTED:                                      │     │
│  │      Alert "Đã từ chối" + lý do                     │     │
│  └──────────────────────────────────────────────────┘     │
│                                                            │
│  Realtime: supabase channel → auto reload                 │
└──────────────────────────────────────────────────────────┘
```

---

## Các điểm cốt lõi để nhớ

1. **Authorization qua relation**: `jobPosting: { recruiterId: userId }` — recruiter chỉ xem được ứng viên của job mình.

2. **6 relations trong 1 query**: candidateProfile + cv + jobPosting + feedbacks + evaluations + interviews — giảm N+1 query.

3. **Signed URL cho CV**: CV lưu trong bucket private, backend sinh URL có chữ ký hết hạn 600s. Không ai xem được CV nếu không qua backend.

4. **Transaction 3 bước cho interview**: feedback + update status + interview record — atomic, không lo inconsistent data.

5. **Upsert cho evaluation**: mỗi application chỉ 1 evaluation, dùng upsert để tránh duplicate.

6. **Gửi email + notification không blocking**: nếu email fail, interview vẫn được tạo thành công.

7. **Realtime**: subscribe bảng `applications` — khi có ứng viên mới apply hoặc trạng thái thay đổi, UI tự động cập nhật.

8. **Status machine**: PENDING → REVIEWING → INTERVIEW → CONFIRMED / REJECTED. Không nhảy cóc.

9. **ApplicationDetailPanel**: component 800 dòng xử lý mọi trạng thái — render khác nhau tùy status, không cần nhiều component riêng.

---

## Các file quan trọng

### Frontend

| File | Vai trò |
|------|---------|
| `src/pages/recruiter/ManageCandidates.tsx` | Danh sách ứng viên + filter (697 dòng) |
| `src/components/recruiter/ApplicationDetailPanel.tsx` | Panel chi tiết: CV, feedback, interview, evaluation (800 dòng) |
| `src/services/recruiter.service.ts` | API client: `getRecruiterApplications`, `updateApplicationStatus`, `createFeedback`, `scheduleInterview`, `createEvaluation` |
| `src/services/application.service.ts` | API client cho candidate apply |

### Backend

| File | Vai trò |
|------|---------|
| `src/routes/applications/recruiter.routes.ts` | Route definitions |
| `src/controllers/applications/recruiter.controller.ts` | Request handlers |
| `src/services/applications/recruiter.service.ts` | `findApplications`, `scheduleInterview`, `createEvaluation`, `createFeedback` |
| `prisma/schema.prisma` | Application, ApplicationFeedback, ApplicationEvaluation, Interview models |
