# Luồng Đăng Tin Tuyển Dụng — Giải thích chi tiết

> Tài liệu giải thích sâu module đăng tin tuyển dụng theo kịch bản cụ thể, từ Frontend → Backend → Database → Response.

---

## Mục lục

1. [Database — 3 bảng chính](#1-database--3-bảng-chính)
2. [Kịch bản 1 — Mở form đăng tin mới](#kịch-bản-1--recruiter-vào-trang-recruiterpost-job)
3. [Kịch bản 2 — Điền form và bấm "Đăng tin ngay"](#kịch-bản-2--recruiter-điền-form-và-bấm-đăng-tin-ngay)
4. [Kịch bản 3 — Backend xử lý tạo job](#kịch-bản-3--backend-xử-lý-tạo-job)
5. [Kịch bản 4 — Frontend nhận kết quả](#kịch-bản-4--frontend-nhận-kết-quả)
6. [Kịch bản 5 — Chỉnh sửa tin](#kịch-bản-5--chỉnh-sửa-tin)
7. [Kịch bản 6 — Nhân bản tin](#kịch-bản-6--nhân-bản-tin)
8. [Diagram tổng quan](#tổng-kết-luồng-bằng-diagram)
9. [Các điểm cốt lõi](#các-điểm-cốt-lõi-để-nhớ)

---

## Nhân vật trong kịch bản

- **Recruiter A**: `userId=5`, `recruiterProfileId=3`
- **Job J**: Job mới được tạo với `id=42`

---

## 1. Database — 3 bảng chính

### Bảng `job_postings`

| Cột | Mô tả |
|-----|-------|
| `id` | PK, auto-increment |
| `recruiter_id` | FK → users.id (chủ tin) |
| `category_id` | FK → job_categories.id |
| `title` | Tiêu đề công việc |
| `description` | Mô tả chi tiết |
| `requirements` | Yêu cầu ứng viên |
| `benefits` | Quyền lợi |
| `location` | Địa điểm làm việc |
| `salary_min`, `salary_max` | Khoảng lương (`Decimal(15,2)`) |
| `salary_unit` | `VND` / `USD` |
| `job_type` | full-time, part-time, freelance, internship |
| `experience_level` | entry, junior, mid, senior, lead, director |
| `status` | `DRAFT` / `PENDING_REVIEW` / `ACTIVE` / `CLOSED` / `REJECTED` |
| `expires_at` | Hạn nộp hồ sơ (Date) |
| `deleted_at` | Soft delete timestamp |
| `created_at`, `updated_at` | Timestamps |

→ 1 job = 1 recruiter sở hữu, thuộc 1 category, có N kỹ năng (N:N), có N applications.

### Bảng `job_categories`

| Cột | Mô tả |
|-----|-------|
| `id` | PK |
| `name` | Tên danh mục (vd: "Công nghệ thông tin") |
| `parent_id` | FK tự tham chiếu (danh mục con) |

→ Cấu trúc cây: "CNTT / Phát triển phần mềm", "CNTT / An ninh mạng", ...

### Bảng `job_posting_skills` (N:N)

| Cột | Mô tả |
|-----|-------|
| `job_posting_id` | FK → job_postings.id |
| `skill_id` | FK → job_skills.id |

→ Composite PK (`job_posting_id`, `skill_id`). Mỗi job có thể gắn 0-N kỹ năng.

---

## Kịch bản 1 — Recruiter vào trang `/recruiter/post-job`

### Bước 1: User click vào nút "Đăng tin tuyển dụng"

Có nhiều điểm dẫn đến form:

| Vị trí | File | Dòng |
|--------|------|------|
| Sidebar trái | `RecruiterSidebar.tsx` | 50 |
| Nút "Đăng tin" ở ManageJobs | `ManageJobs.tsx` | 412 |
| Overview dashboard | `EmployerHome.tsx` | 49 |

### Bước 2: React Router match route

**File:** `App.tsx` lines 105, 108

```
/recruiter/post-job              → Route path="post-job"             → <PostJobPage />
/recruiter/manage-jobs/42/edit   → Route path="manage-jobs/:id/edit" → <PostJobPage />
/recruiter/post-job?duplicateFrom=42 → Route path="post-job"         → <PostJobPage />
```

Cả 3 đều render cùng component `PostJobPage` ở `PostJob.tsx:123`.

### Bước 3: Component mount — xác định chế độ

**File:** `PostJob.tsx` lines 124-143

```typescript
const { id } = useParams();                            // /manage-jobs/42/edit → id = 42
const [searchParams] = useSearchParams();
const duplicateFrom = searchParams.get("duplicateFrom"); // /post-job?duplicateFrom=42
const focusField = searchParams.get("focus");            // /edit?focus=expiresAt

const isEditing = Number.isInteger(parsedJobId) && parsedJobId > 0;       // true nếu có :id
const isDuplicating = !hasEditParam && Number.isInteger(parsedDuplicateJobId) && parsedDuplicateJobId > 0;
```

Component phân biệt 3 chế độ dựa trên URL params:

| Route | isEditing | isDuplicating | Hành vi |
|-------|-----------|---------------|---------|
| `/recruiter/post-job` | false | false | Form trống — tạo mới |
| `/recruiter/manage-jobs/42/edit` | true | false | Load job 42 → điền sẵn → submit = update |
| `/recruiter/post-job?duplicateFrom=42` | false | true | Load job 42 → thêm "(bản sao)" → submit = create mới |

### Bước 4: Load dữ liệu nền (categories + skills)

**File:** `PostJob.tsx` lines 186-215

```typescript
// useEffect #1 — load categories
const response = await jobService.getCategories();
setCategories(response.data ?? []);
// → GET /api/jobs/categories — trả về cấu trúc cây:
// [{ id: 1, name: "CNTT", children: [{ id: 10, name: "Phát triển phần mềm" }] }]

// Flatten để render dropdown:
const categoryOptions = flattenCategories(categories);
// → [{ id: 1, name: "CNTT", label: "CNTT" }, { id: 10, name: "Phát triển phần mềm", label: "CNTT / Phát triển phần mềm" }]

// useEffect #2 — load skills
const response = await jobService.getSkills();  
setSkills(response.data ?? []);
// → GET /api/jobs/skills
// → [{ id: 1, name: "React" }, { id: 2, name: "Node.js" }, ...]
```

Categories dạng cây được **flatten** (dòng 72-80):
```typescript
const flattenCategories = (categories: CategoryOption[]): FlatCategoryOption[] =>
  categories.flatMap((category) => [
    { id: category.id, name: category.name, label: category.name },
    ...(category.children || []).map((child) => ({
      id: child.id,
      name: child.name,
      label: `${category.name} / ${child.name}`,
    })),
  ]);
```

→ Mỗi danh mục con có label `"CNTT / Phát triển phần mềm"` → người dùng dễ hình dung.

### Bước 5: Render form layout

**File:** `PostJob.tsx` lines 458-873

Form chia 2 cột với CSS grid:

```
<form className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
  ├── CỘT TRÁI (1fr): 2 section
  │   ├── Section 1: Thông tin cơ bản (12 fields)
  │   │   ├── Tiêu đề công việc          → <input>        → state: title
  │   │   ├── Ngành nghề                  → <select>       → state: categoryId
  │   │   ├── Loại hình công việc         → <select>       → state: jobType
  │   │   │                                (disabled khi workMode=remote/hybrid)
  │   │   ├── Kinh nghiệm                 → <select>       → state: experienceLevel
  │   │   ├── Địa điểm                    → <input>        → state: location
  │   │   ├── Hình thức làm việc          → <select>       → state: workMode
  │   │   ├── Hạn nộp hồ sơ              → <input type="date"> → state: expiresAt
  │   │   ├── Lương thỏa thuận           → <input type="checkbox"> → state: salaryNegotiable
  │   │   ├── Lương tối thiểu            → <input type="number">  → state: salaryMin
  │   │   ├── Lương tối đa               → <input type="number">  → state: salaryMax
  │   │   ├── Đơn vị (VND/USD)           → <select>       → state: salaryUnit
  │   │   └── Kỹ năng yêu cầu            → button toggle  → state: selectedSkillIds
  │   │
  │   └── Section 2: Mô tả chi tiết (3 textareas)
  │       ├── Mô tả công việc            → <textarea rows={6}> → state: description
  │       ├── Yêu cầu                    → <textarea rows={4}> → state: requirements
  │       └── Quyền lợi                  → <textarea rows={4}> → state: benefits
  │
  └── CỘT PHẢI (280px): Nút hành động
      ├── "ĐĂNG TIN NGAY"   → type="submit"   → submitJob("active")
      ├── "LƯU NHÁP"         → type="button"   → submitJob("draft")   (chỉ khi tạo mới)
      └── "Quay lại"         → type="button"   → navigate()
```

Mỗi field là một **`useState` riêng** (dòng 156-172) — không dùng Formik hay React Hook Form:

```typescript
const [title, setTitle] = useState("");
const [categoryId, setCategoryId] = useState("");
const [jobType, setJobType] = useState<JobType | "">("");
const [description, setDescription] = useState("");
const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
// ... tổng cộng 17 state
```

Kỹ năng render dạng **button toggle** (dòng 721-748), không phải select:

```typescript
{skills.map((skill) => {
  const selected = selectedSkillIds.includes(skill.id);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => toggleSkill(skill.id)}
      className={selected ? "bg-[#0f1f3d] text-white" : "..."}
    >
      {skill.name}
    </button>
  );
})}
```

`toggleSkill` (dòng 320-326) thêm/xóa skillId khỏi mảng:

```typescript
const toggleSkill = (skillId: number) => {
  setSelectedSkillIds((current) =>
    current.includes(skillId)
      ? current.filter((id) => id !== skillId)
      : [...current, skillId],
  );
};
```

### Bước 6: Nếu edit/duplicate — load job cũ

**File:** `PostJob.tsx` lines 221-287

```typescript
useEffect(() => {
  const loadJob = async () => {
    const response = await getMyJobDetail(sourceJobId);
    const job = response.data;
    // → GET /api/jobs/:id/recruiter

    setTitle(isDuplicating ? `${job.title} (bản sao)` : job.title);
    setCategoryId(job.categoryId ? String(job.categoryId) : "");
    setJobType(job.jobType);
    setWorkMode(job.jobType === "remote" || job.jobType === "hybrid" ? job.jobType : "onsite");
    setExperienceLevel(job.experienceLevel || "");
    setLocation(job.location || "");
    setSalaryMin(job.salaryMin == null ? "" : String(job.salaryMin));
    setSalaryMax(job.salaryMax == null ? "" : String(job.salaryMax));
    setSalaryNegotiable(job.salaryMin == null && job.salaryMax == null);
    setSalaryUnit(job.salaryUnit || "VND");
    setExpiresAt(nextExpiresAt);         // Nếu duplicate và hạn cũ quá hạn → để trống
    setDescription(job.description);
    setRequirements(job.requirements || "");
    setBenefits(job.benefits || "");
    setSelectedSkillIds(job.skills?.map((item) => item.skill.id) ?? []);
  };
  void loadJob();
}, [isEditing, isDuplicating, ...]);
```

Tất cả 17 state được `set` từ response — form tự động điền đầy đủ.

---

## Kịch bản 2 — Recruiter điền form và bấm "Đăng tin ngay"

### Bước 7: User điền form

17 state fields được cập nhật qua `onChange` handler của từng input.

Logic đặc biệt với salary (dòng 297-304):

```typescript
const handleSalaryNegotiableChange = (checked: boolean) => {
  setSalaryNegotiable(checked);
  if (checked) {
    setSalaryMin("");     // Clear lương tối thiểu
    setSalaryMax("");     // Clear lương tối đa
  }
};
```

Khi checkbox "Lương thỏa thuận" được chọn → salaryMin/salaryMax bị disable + clear → gửi lên API là `null`.

Logic đặc biệt với workMode (dòng 307-317):

```typescript
const handleWorkModeChange = (nextWorkMode: WorkMode) => {
  setWorkMode(nextWorkMode);
  if (nextWorkMode === "remote" || nextWorkMode === "hybrid") {
    setJobType(nextWorkMode);     // Tự động set jobType = remote/hybrid
  } else if (jobType === "remote" || jobType === "hybrid") {
    setJobType("");               // Reset jobType về trống để user chọn
  }
};
```

→ Nếu chọn Remote/Hybrid thì `jobType` tự động được set, user không cần chọn loại hình riêng.

### Bước 8: User bấm "ĐĂNG TIN NGAY"

`type="submit"` → gọi `handleSubmit` (dòng 453-456):

```typescript
const handleSubmit = (event: FormEvent) => {
  event.preventDefault();         // Ngăn reload trang
  void submitJob("active");       // status = "active" (không phải draft)
};
```

### Bước 9: `submitJob("active")`

**File:** `PostJob.tsx` lines 409-450

```typescript
const submitJob = async (status: SubmitStatus) => {
  if (loading || initialLoading) return;          // Chống double-click

  const payload = buildPayload(status);            // Validate + build payload
  if (!payload) return;                            // Validate fail → dừng

  setLoading(true);
  setSubmitStatus(status);

  try {
    if (isEditing) {
      await updateJob(parsedJobId, payload);        // PUT /api/jobs/:id
      setMessage("Cập nhật tin tuyển dụng thành công");
      setTimeout(() => navigate(`/recruiter/manage-jobs/${parsedJobId}`), 600);
    } else {
      await createJob({ ...payload, status });      // POST /api/jobs
      setMessage("Đăng tin tuyển dụng thành công");
      setTimeout(() => navigate("/recruiter/manage-jobs"), 600);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Đăng tin thất bại");
  } finally {
    setLoading(false);
    setSubmitStatus("");
  }
};
```

**Chống double-click:** `if (loading || initialLoading) return` — nếu đang loading thì không submit tiếp.

**Delay 600ms:** `setTimeout(navigate, 600)` — để user kịp đọc message thành công trước khi chuyển trang.

### Bước 10: `buildPayload("active")` — Validate client

**File:** `PostJob.tsx` lines 331-403

```typescript
const buildPayload = (status: SubmitStatus): CreateJobPayload | null => {
  setError("");
  setMessage("");

  // 1. Tiêu đề
  if (!title.trim()) { setError("Vui lòng nhập tiêu đề công việc"); return null; }

  // 2. Ngành nghề
  if (categoryOptions.length > 0 && !categoryId) {
    setError("Vui lòng chọn ngành nghề"); return null;
  }

  // 3. Loại hình
  if (!jobType) { setError("Vui lòng chọn loại hình công việc"); return null; }

  // 4. Mô tả
  if (!description.trim()) { setError("Vui lòng nhập mô tả công việc"); return null; }

  // 5. Hạn nộp (chỉ bắt buộc khi active)
  if (status === "active" && !expiresAt) {
    setError("Vui lòng chọn hạn nộp hồ sơ trước khi đăng tin"); return null;
  }
  if (expiresAt && expiresAt < todayInputValue()) {
    setError("Hạn nộp hồ sơ không được ở quá khứ"); return null;
  }

  // 6. Parse lương
  const parsedSalaryMin = salaryNegotiable
    ? { value: null }
    : parseSalaryInput(salaryMin, "Lương tối thiểu");
  const parsedSalaryMax = salaryNegotiable
    ? { value: null }
    : parseSalaryInput(salaryMax, "Lương tối đa");

  if (parsedSalaryMin.error || parsedSalaryMax.error) {
    setError(parsedSalaryMin.error || parsedSalaryMax.error || ""); return null;
  }

  // 7. Kiểm tra min ≤ max
  if (parsedSalaryMin.value != null && parsedSalaryMax.value != null
      && parsedSalaryMin.value > parsedSalaryMax.value) {
    setError("Lương tối thiểu không được lớn hơn lương tối đa"); return null;
  }

  // OK → return payload
  return {
    title: title.trim(),
    description: description.trim(),
    requirements: requirements.trim() || null,
    benefits: benefits.trim() || null,
    location: location.trim() || null,
    salaryMin: parsedSalaryMin.value,
    salaryMax: parsedSalaryMax.value,
    salaryUnit,
    jobType,
    experienceLevel: experienceLevel || null,
    categoryId: categoryId ? Number(categoryId) : null,
    expiresAt: expiresAt || null,
    skillIds: selectedSkillIds,
  };
};
```

Tổng cộng **7 lớp validation**: tiêu đề → ngành nghề → loại hình → mô tả → hạn nộp → lương → min ≤ max.

`parseSalaryInput` (dòng 84-97):
```typescript
const parseSalaryInput = (value: string, label: string) => {
  if (!value.trim()) return { value: null };
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return { value: null, error: `${label} phải là số hợp lệ` };
  if (numberValue <= 0) return { value: null, error: `${label} phải là số dương` };
  return { value: numberValue };
};
```

### Bước 11: Gọi API thật

```typescript
await createJob({ ...payload, status });
```

**File:** `recruiter.service.ts` line 249

```typescript
export async function createJob(data: CreateJobPayload) {
  return requestApi<RecruiterJob>({ method: 'POST', url: '/jobs', data });
}
```

→ Axios gửi `POST /api/jobs` với body `CreateJobPayload` + header `Authorization: Bearer <token>`.

---

## Kịch bản 3 — Backend xử lý tạo job

### Bước 12: Route nhận request

**File:** `recruiter.routes.ts` line 71

```typescript
router.post('/',
  recruiterOnly,                         // [authenticate, authorize('recruiter')]
  validate(createJobSchema),             // Zod validation
  createJob,                             // Controller
);
```

**3 middleware chạy tuần tự:**

#### (a) `authenticate` — middleware/auth.ts
- Lấy `Bearer <token>` từ header.
- `jwt.verify(token, JWT_SECRET)` → decode ra `{ id: 5, email, role: 'recruiter' }`.
- Gán `req.user = { id: 5, email, role: 'recruiter' }`.
- Nếu token hỏng/hết hạn → trả 401.

#### (b) `authorize('recruiter')`
- Kiểm tra `req.user.role === 'recruiter'`.
- Nếu không phải → trả 403.

#### (c) `validate(createJobSchema)` — Zod schema

**File:** `recruiter.validation.ts`

```typescript
const jobBaseSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  requirements: z.string().max(5000).nullish(),
  benefits: z.string().max(5000).nullish(),
  location: z.string().max(255).nullish(),
  salaryMin: z.number().positive().nullish(),
  salaryMax: z.number().positive().nullish(),
  salaryUnit: z.enum(['VND', 'USD']).nullish(),
  jobType: z.string().min(1, "Loại hình công việc không được để trống"),
  experienceLevel: z.string().max(100).nullish(),
  categoryId: z.number().int().positive().nullish(),
  expiresAt: z.string().datetime().nullish(),
  skillIds: z.array(z.number().int().positive()).optional(),
});

export const createJobSchema = jobBaseSchema.extend({
  status: z.enum(['active', 'draft']).optional(),
}).refine((data) => {
  if (data.status !== 'draft' && !data.expiresAt) return false;
  return true;
}, { message: "Hạn nộp là bắt buộc khi đăng tin" });
```

Nếu body không hợp lệ → trả 400 với message lỗi chi tiết.

### Bước 13: Controller

**File:** `recruiter.controller.ts`

```typescript
export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await recruiterJobService.create(
      getCurrentUserId(req),        // userId = 5
      req.body,                     // CreateJobPayload
    );
    return res.status(201).json({
      success: true,
      data: job,
      message: 'Tạo tin tuyển dụng thành công',
    });
  } catch (error) {
    return next(error);
  }
};
```

Controller gọi service, trả `201 Created` + `{ success, data, message }`.

### Bước 14: Service.create() — 6 bước chi tiết

**File:** `recruiter.service.ts` lines 175-245

```typescript
async create(recruiterId: number, data: JobInput) {
```

#### Bước 14.1 — Xác định status (dòng 177-178)

```typescript
const status =
  data.status === JOB_STATUS.DRAFT ? JOB_STATUS.DRAFT : JOB_STATUS.PENDING_REVIEW;
const expiresAt = toDateOrNull(data.expiresAt);
```

| Status gửi từ FE | Status lưu DB | Ý nghĩa |
|------------------|--------------|---------|
| `"draft"` | `DRAFT` | Lưu nháp — không cần duyệt |
| `"active"` (hoặc undefined) | `PENDING_REVIEW` | Gửi duyệt — chờ admin approve |

#### Bước 14.2 — Kiểm tra hạn nộp (dòng 182)

```typescript
if (status !== JOB_STATUS.DRAFT) ensureActiveExpiry(expiresAt);
```

`ensureActiveExpiry` (dòng 91-98):
```typescript
const ensureActiveExpiry = (expiresAt: Date | null) => {
  if (!expiresAt) throw new AppError(400, 'Hạn nộp hồ sơ là bắt buộc với tin đang hoạt động');
  if (expiresAt < startOfToday()) throw new AppError(400, 'Hạn nộp hồ sơ không được ở quá khứ');
};
```

→ Nếu không phải draft: **bắt buộc** có hạn nộp, hạn nộp **không được** ở quá khứ.

#### Bước 14.3 — INSERT job vào DB (dòng 185-202)

```typescript
const job = await prisma.jobPosting.create({
  data: {
    recruiterId,
    title: data.title!,
    description: data.description!,
    requirements: data.requirements ?? null,
    benefits: data.benefits ?? null,
    location: data.location ?? null,
    salaryMin: data.salaryMin ?? null,
    salaryMax: data.salaryMax ?? null,
    salaryUnit: data.salaryUnit ?? null,
    jobType: data.jobType!,
    experienceLevel: data.experienceLevel ?? null,
    categoryId: data.categoryId ?? null,
    expiresAt,
    status,
  },
});
```

SQL tương đương:
```sql
INSERT INTO job_postings
  (recruiter_id, title, description, salary_min, salary_max, job_type, status, expires_at, ...)
VALUES
  (5, 'Frontend Developer', 'Mô tả...', 10000000, 20000000, 'full-time', 'CHO_DUYET', '2026-07-19', ...)
RETURNING *;
```

→ `job` = `{ id: 42, title: "Frontend Developer", status: "CHO_DUYET", ... }` (chỉ scalar fields, không có relations).

#### Bước 14.4 — Gắn kỹ năng (dòng 205-213)

```typescript
if (data.skillIds?.length) {
  await prisma.jobPostingSkill.createMany({
    data: data.skillIds.map((skillId) => ({
      jobPostingId: job.id,     // 42
      skillId,                  // 1 (React), 2 (Node.js)
    })),
    skipDuplicates: true,       // Bỏ qua nếu đã tồn tại
  });
}
```

SQL:
```sql
INSERT INTO job_posting_skills (job_posting_id, skill_id)
VALUES (42, 1), (42, 2)
ON CONFLICT DO NOTHING;
```

→ **Bảng riêng**: `job_posting_skills` là bảng N:N, insert riêng biệt với bước 3.

#### Bước 14.5 — Re-fetch job với relations (dòng 216-219)

```typescript
const createdJob = await prisma.jobPosting.findUnique({
  where: { id: job.id },                   // 42
  include: jobInclude,                      // { skills, category, _count }
});
```

`jobInclude` (dòng 45-49):
```typescript
const jobInclude = {
  skills: { include: { skill: true } },     // JOIN job_posting_skills → job_skills
  category: true,                            // JOIN job_categories
  _count: { select: { applications: true } }, // COUNT applications
};
```

**Tại sao cần bước này?**

Biến `job` từ bước 3 chỉ có scalar fields. Bước 4 thêm skills. `findUnique` với `include` lấy tất cả relations trong 1 query:

```typescript
// createdJob = {
//   id: 42,
//   title: "Frontend Developer",
//   status: "CHO_DUYET",
//   skills: [{ skill: { id: 1, name: "React" } }, { skill: { id: 2, name: "Node.js" } }],
//   category: { id: 3, name: "Công nghệ thông tin", parentId: null },
//   _count: { applications: 0 }
// }
```

SQL tương đương:
```sql
SELECT j.*,
  (SELECT JSON_AGG(json_build_object('skill', s.*))
   FROM job_posting_skills jps
   JOIN job_skills s ON jps.skill_id = s.id
   WHERE jps.job_posting_id = 42) AS skills,
  (SELECT row_to_json(jc.*) FROM job_categories jc WHERE jc.id = j.category_id) AS category,
  (SELECT COUNT(*) FROM applications WHERE job_posting_id = 42 AND deleted_at IS NULL) AS applications_count
FROM job_postings j WHERE j.id = 42;
```

#### Bước 14.6 — Thông báo admin (dòng 222-242)

```typescript
if (createdJob && createdJob.status === JOB_STATUS.PENDING_REVIEW) {
  try {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId: recruiterId },
      select: { companyName: true },
    });
    const companyName = recruiter?.companyName || 'Nhà tuyển dụng';
    await notifyAdmins(
      'job_pending_review',
      'Tin tuyển dụng cần phê duyệt',
      `Nhà tuyển dụng ${companyName} vừa đăng tin tuyển dụng "${createdJob.title}" và đang chờ phê duyệt.`,
      'job',
      createdJob.id,
    );
  } catch (err: any) {
    console.error('[Notification] Gửi thông báo thất bại:', err.message);
    // Không throw — lỗi notification không làm hỏng luồng chính
  }
}
```

→ Chỉ gửi khi status = `PENDING_REVIEW` (không gửi nếu là draft).
→ `try/catch` riêng — nếu gửi notification lỗi, job vẫn được tạo thành công.

### Bước 15: Response trả về Frontend

```json
{
  "success": true,
  "data": {
    "id": 42,
    "recruiterId": 5,
    "title": "Frontend Developer",
    "description": "Mô tả...",
    "status": "CHO_DUYET",
    "skills": [{ "skill": { "id": 1, "name": "React" } }, { "skill": { "id": 2, "name": "Node.js" } }],
    "category": { "id": 3, "name": "Công nghệ thông tin" },
    "_count": { "applications": 0 },
    "createdAt": "2026-06-20T10:00:00Z",
    "updatedAt": "2026-06-20T10:00:00Z"
  },
  "message": "Tạo tin tuyển dụng thành công"
}
```

Frontend nhận được đầy đủ: job info + skills + category + ứng viên count.

---

## Kịch bản 4 — Frontend nhận kết quả

### Bước 16: `submitJob()` nhận response

```typescript
setMessage("Đăng tin tuyển dụng thành công");
setTimeout(() => navigate("/recruiter/manage-jobs"), 600);
```

→ Set message xanh + chuyển về trang ManageJobs sau 600ms.

Tại ManageJobs, trang tự động load lại danh sách jobs qua `loadJobs()` (dòng 212-234) → job mới xuất hiện trong danh sách.

---

## Kịch bản 5 — Chỉnh sửa tin

### Bước 17: Recruiter bấm "Sửa" trên ManageJobs

```typescript
<Link to={`/recruiter/manage-jobs/${job.id}/edit`}>
```
`ManageJobs.tsx:740`

→ Route `/recruiter/manage-jobs/42/edit` → `<PostJobPage />` với `isEditing=true`.

### Bước 18: Load job cũ

```typescript
const response = await getMyJobDetail(sourceJobId);    // GET /api/jobs/42/recruiter
```

**Backend:** `recruiter.service.ts:302-316`

```typescript
async findById(id: number, recruiterId: number) {
  const job = await prisma.jobPosting.findFirst({
    where: { id, recruiterId, deletedAt: null },
    include: jobInclude,       // skills, category, _count
  });
  if (!job) throw new AppError(404, 'Tin tuyển dụng không tồn tại hoặc bạn không có quyền xem');
  return job;
}
```

→ Query có `recruiterId` trong WHERE — kiểm tra ownership.

### Bước 19: User sửa → bấm "CẬP NHẬT TIN"

```typescript
// submitJob("active")
// isEditing = true → gọi:
await updateJob(parsedJobId, payload);    // PUT /api/jobs/42
```

**Backend — `update()` (dòng 319-374):**

```typescript
async update(id: number, recruiterId: number, data: JobInput) {
  await ensureOwnJob(id, recruiterId);          // Kiểm tra ownership

  const jobData = buildJobData(data);            // Lọc field cần update
  const skillIds = data.skillIds;

  if (skillIds !== undefined) {
    // Transaction: xóa skill cũ → thêm skill mới → cập nhật job
    await prisma.$transaction(async (tx) => {
      await tx.jobPostingSkill.deleteMany({ where: { jobPostingId: id } });
      if (skillIds.length > 0) {
        await tx.jobPostingSkill.createMany({ data: skillIds.map(skillId => ({ jobPostingId: id, skillId })) });
      }
      if (Object.keys(jobData).length > 0) {
        await tx.jobPosting.update({ where: { id }, data: jobData });
      }
    });
  } else {
    // Không thay đổi skill → chỉ update job
    if (Object.keys(jobData).length > 0) {
      await prisma.jobPosting.update({ where: { id }, data: jobData });
    }
  }

  return this.findById(id, recruiterId);        // Re-fetch + return
}
```

**3 điểm khác biệt so với create:**

| Khía cạnh | Create | Update |
|-----------|--------|--------|
| Skills strategy | Thêm mới (`createMany`) | Xóa hết → thêm lại (transaction) |
| Kiểm tra status | Set PENDING_REVIEW/DRAFT | Giữ nguyên status cũ |
| Notification admin | Có (nếu PENDING_REVIEW) | Không |

---

## Kịch bản 6 — Nhân bản tin

### Bước 20: Recruiter bấm "Nhân bản"

```typescript
<Link to={`/recruiter/post-job?duplicateFrom=${job.id}`}>
```
`ManageJobs.tsx:760`

→ Route `/recruiter/post-job?duplicateFrom=42` → `<PostJobPage />` với `isDuplicating=true`.

### Bước 21: Load job cũ + modify

```typescript
const response = await getMyJobDetail(sourceJobId);
const job = response.data;

setTitle(`${job.title} (bản sao)`);          // Thêm "(bản sao)" vào title
setExpiresAt(isDuplicating && sourceExpiresAt < todayInputValue() ? "" : sourceExpiresAt);
// Nếu hạn cũ đã quá hạn → để trống
// Nếu còn hạn → giữ nguyên
```

Các field khác giống y hệt job cũ.

### Bước 22: Bấm "ĐĂNG TIN NGAY"

```typescript
// isDuplicating = false, isEditing = false → nhánh create
await createJob({ ...payload, status });    // POST /api/jobs — tạo job MỚI
```

→ Tạo job mới với status = PENDING_REVIEW, cần admin duyệt lại.

---

## Tổng kết luồng bằng diagram

```
┌─────────────────────────────────────────┐
│  Recruiter A                             │
│  Browser                                 │
└────────────────┬────────────────────────┘
                 │
                 │ 1. Vào /recruiter/post-job
                 │    → PostJobPage mount
                 │    → Load categories + skills
                 ▼
         Form hiển thị (17 state fields)
                 │
                 │ 2. Điền thông tin → bấm "ĐĂNG TIN NGAY"
                 │    handleSubmit
                 │    → submitJob("active")
                 │    → buildPayload("active")
                 │      (7 lớp validation)
                 ▼
         Payload OK → createJob(payload)
         POST /api/jobs
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │  Backend                                │
    │  Route: recruiter.routes.ts:71          │
    │    ├─ authenticate (JWT verify)         │
    │    ├─ authorize('recruiter')            │
    │    └─ validate(createJobSchema)         │
    │                                         │
    │  Controller: recruiter.controller.ts    │
    │    └─ gọi service.create(5, payload)     │
    │                                         │
    │  Service.create():                      │
    │  1. Xác định status                     │
    │     draft → DRAFT                       │
    │     active → PENDING_REVIEW             │
    │                                         │
    │  2. Kiểm tra hạn nộp                    │
    │     (nếu không phải draft)              │
    │                                         │
    │  3. INSERT job_postings                 │
    │     → job = { id: 42, title, status }   │
    │                                         │
    │  4. INSERT job_posting_skills           │
    │     → gắn React, Node.js vào job 42     │
    │                                         │
    │  5. SELECT job với relations            │
    │     → findUnique + include              │
    │     → skills, category, _count          │
    │                                         │
    │  6. Gửi thông báo admin                 │
    │     (nếu PENDING_REVIEW)                │
    │                                         │
    │  ← 201 { success, data, message }      │
    └────────────────┬───────────────────────┘
                     │
                     ◄── Response về Browser
                 │
                 │ setMessage("Đăng tin thành công")
                 │ setTimeout → navigate về manage-jobs
                 ▼
┌──────────────────────────────────────────┐
│  ManageJobs page reload                  │
│  → job mới (status=CHO_DUYET)            │
│    hiện trong danh sách                  │
└──────────────────────────────────────────┘

KẾT THÚC LUỒNG ĐĂNG TIN
```

---

## Các điểm cốt lõi để nhớ

1. **3 chế độ 1 component**: create/edit/duplicate — `PostJobPage` dùng `useParams` + `useSearchParams` để phân biệt, không cần 3 component riêng.

2. **17 state riêng lẻ**: không dùng Formik/React Hook Form, mỗi field một `useState`. Đủ dùng cho form không quá phức tạp.

3. **Client validation 7 lớp**: kiểm tra ngay trước khi gọi API → giảm request lỗi, UX tốt hơn.

4. **Kỹ năng dạng button toggle**: thay vì select multiple, dùng button với `aria-pressed` → trực quan, dễ toggle từng kỹ năng.

5. **Chống double-click**: `if (loading) return` trước khi gọi API.

6. **Soft delete**: không xóa record, chỉ set `deletedAt`. Các query luôn có `where: { deletedAt: null }`.

7. **Re-fetch với `include` ở bước 5**: vì `create` chỉ trả scalar fields, cần `findUnique` + `include` để lấy skills + category + _count.

8. **Notification admin không blocking**: `try/catch` riêng — nếu gửi thông báo lỗi, job vẫn được tạo.

9. **Transaction cho update skills**: xóa hết → thêm lại trong 1 transaction, đảm bảo atomic.

10. **Ownership check ở mọi endpoint**: không có endpoint nào cho phép recruiter A sửa/xóa job của recruiter B.

---

## Các file quan trọng

### Frontend (`Lap-Trinh-Web-frontend`)

| File | Vai trò |
|------|---------|
| `src/pages/recruiter/PostJob.tsx` | Form đăng/chỉnh sửa/nhân bản tin (874 dòng) |
| `src/pages/recruiter/ManageJobs.tsx` | Danh sách tin, chứa các link/nút dẫn đến PostJob |
| `src/services/recruiter.service.ts` | API client: `createJob`, `updateJob`, `getMyJobDetail` |
| `src/App.tsx` | Route definitions (dòng 105, 108) |

### Backend (`LTWeb-backend`)

| File | Vai trò |
|------|---------|
| `src/routes/jobs/recruiter.routes.ts` | Route definitions + validation |
| `src/controllers/jobs/recruiter.controller.ts` | Request handlers |
| `src/services/jobs/recruiter.service.ts` | Business logic (create, update, findById, delete) |
| `src/validations/jobs/recruiter.validation.ts` | Zod schemas |
| `prisma/schema.prisma` | Database schema (JobPosting, JobPostingSkill, JobCategory) |

---

## Điểm có thể cải thiện (nếu scale lớn hơn)

1. **Không có auto-save draft**: nếu user đang điền nửa chừng và F5, mất hết. Có thể auto-save vào localStorage hoặc gọi API lưu nháp tự động sau 30s.

2. **Không có preview**: user không xem trước tin sẽ trông thế nào trước khi đăng. Có thể thêm nút "Xem trước" render giống trang chi tiết job.

3. **Không validate kỹ năng trùng**: nếu skill list lớn, user có thể chọn React và React Native cùng lúc — không có cảnh báo.

4. **Không hỗ trợ rich text cho mô tả**: textarea thuần, không có bold/italic/list. Có thể thay bằng Markdown editor.
