# Hướng dẫn cấu hình mẫu CV ở Admin (UC-19)

> Tài liệu mô tả luồng tạo / cập nhật / quản lý các **mẫu CV (CV Template)** trong khu vực Admin.
> Liên quan trực tiếp tới trang `src/pages/admin/AdminTemplates.tsx`.

---

## 1. Tổng quan tính năng

Admin có quyền quản lý kho mẫu CV mà **ứng viên** sẽ chọn khi vào trang `CV Builder`. Mỗi mẫu CV bao gồm:

- Thông tin mô tả (tên, mô tả, danh mục, đặc điểm nổi bật)
- Ảnh thumbnail / preview
- File cấu hình `layoutConfig` dạng JSON (chứa `category`, `features`, `defaultData`)
- Trạng thái `isActive` (hiện / ẩn với ứng viên)

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN (/admin/templates)                               │
│  - Xem danh sách mẫu CV                                 │
│  - Thêm mẫu mới (form modal)                            │
│  - Sửa thông tin / cấu hình mẫu                         │
│  - Bật / tắt hiển thị (toggle isActive)                 │
│  - Xóa mẫu                                              │
│  - Khởi tạo 4 mẫu mặc định (Executive, Modern,          │
│    Tech Minimalist, Corporate Leadership)               │
├─────────────────────────────────────────────────────────┤
│  CANDIDATE (/candidate/cv-template, /candidate/cv-      │
│  builder)                                               │
│  - Chỉ thấy các mẫu có isActive = true                  │
│  - Dữ liệu trong defaultData được dùng làm preview      │
│    và data khởi tạo khi ứng viên bắt đầu tạo CV         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Mô hình dữ liệu

### 2.1. Type `CVTemplate` (Frontend)

```ts
interface CVTemplate {
  id: number;
  name: string;
  category: "Đơn giản" | "Hiện đại" | "Chuyên nghiệp";
  description: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  layoutConfig?: string;   // JSON string
  isActive: boolean;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 2.2. Mapping FE ↔ BE

Backend lưu mẫu CV trong bảng `cv_templates`. Một số field như `category` và `features` **không có cột riêng** mà được gói trong JSON `layoutConfig` để tránh thay đổi schema mỗi khi thêm thuộc tính mới.

Hàm `mapApiTemplateToCVTemplate(t)` trong `AdminTemplates.tsx` parse `layoutConfig` để rút ra:

| Field FE     | Nguồn                                  |
|--------------|----------------------------------------|
| `category`   | `layoutConfig.category` (default: `"Đơn giản"`) |
| `features`   | `layoutConfig.features` (default: 2 mục mặc định) |
| `previewUrl` | `t.thumbnailUrl` (dùng chung)          |
| còn lại      | trả thẳng từ DB                        |

---

## 3. Luồng UC-19: Quản lý mẫu CV

### 3.1. Xem danh sách (luồng chính bước 1–2)

```
AdminTemplates.tsx
  → useEffect() → loadTemplates()
  → cvService.getAdminTemplates()
  → GET /cvs/templates?isActive=false  (Admin xem được cả mẫu đã ẩn)
  → mapApiTemplateToCVTemplate() cho từng item
  → render grid + filter theo selectedCategory / searchTerm
```

### 3.2. Thêm mẫu mới (luồng chính bước 3–5)

```
handleOpenAddModal() → setFormMode("add") → mở Modal form
  ↓
Admin nhập:
  - Tên mẫu (formName)
  - Danh mục (formCategory: Đơn giản | Hiện đại | Chuyên nghiệp)
  - Mô tả (formDescription)
  - Ảnh preview (formPreviewName)         ← upload file tên
  - File cấu hình JSON (formConfigContent) ← FileReader.readAsText
  - Danh sách đặc điểm nổi bật (formFeaturesList)
  - Trạng thái kích hoạt (formIsActive)
  ↓
Submit → cvService.createTemplate({
  name, description, thumbnailUrl, layoutConfig
})
  → POST /cvs/templates
  → loadTemplates() (refresh)
```

> ⚠ Lưu ý: `category` và `features` được **nhét vào** `layoutConfig` trước khi gửi. Khi sửa lại trong DB nhớ giữ nguyên cấu trúc này.

### 3.3. Cập nhật mẫu (luồng phụ "Sửa")

```
handleOpenEditModal(template)
  → fill form với dữ liệu cũ
  → formConfigName = "layout_config.json"
  → formConfigContent = template.layoutConfig
  ↓
Submit → cvService.updateTemplate(id, data)
  → PUT /cvs/templates/:id
```

### 3.4. Ẩn / hiện mẫu (luồng phụ "Ẩn CV")

Khi Admin nhấn ToggleLeft/ToggleRight trên một card mẫu:

```
handleToggleActive(id)
  → cvService.toggleTemplate(id)
  → PATCH /cvs/templates/:id/toggle
  → setTemplates(prev → cập nhật mẫu vừa toggle)
```

Mẫu đang `isActive = false` sẽ **không** xuất hiện ở trang `CVTemplatePage` của ứng viên.

### 3.5. Xóa mẫu (luồng phụ "Xóa CV")

```
Click Trash2 → setDeleteConfirm({ isOpen: true, templateId, templateName })
  → Modal xác nhận
  → cvService.deleteTemplate(id)
  → DELETE /cvs/templates/:id
  → loadTemplates() refresh
```

### 3.6. Khởi tạo 4 mẫu mặc định

Hữu ích khi DB rỗng. Bấm nút "Khởi tạo mặc định":

```
handleInitializeDefaultTemplates()
  → Lặp tạo 4 mẫu:
    1. Executive Standard      (Đơn giản)
    2. Modern Split Creative   (Hiện đại)
    3. Tech Minimalist Dark    (Hiện đại)
    4. Corporate Leadership    (Chuyên nghiệp)
  → for (item of defaults) await cvService.createTemplate(item)
  → loadTemplates()
```

Mỗi default kèm sẵn `layoutConfig` chứa `defaultData` đầy đủ (`personalInfo`, `education`, `experience`, `skills`) để ứng viên có dữ liệu preview ngay lập tức.

---

## 4. API endpoints (Admin)

| Method  | Endpoint                       | Mục đích                              |
|---------|--------------------------------|---------------------------------------|
| GET     | `/cvs/templates`               | Lấy mẫu CV đang `isActive = true`     |
| GET     | `/cvs/templates?isActive=false`| Admin lấy toàn bộ (cả ẩn lẫn hiện)    |
| POST    | `/cvs/templates`               | Tạo mẫu mới                           |
| PUT     | `/cvs/templates/:id`           | Cập nhật toàn bộ thông tin             |
| PATCH   | `/cvs/templates/:id/toggle`    | Bật / tắt `isActive`                   |
| DELETE  | `/cvs/templates/:id`           | Xóa vĩnh viễn                         |

Tất cả endpoint yêu cầu `authenticate` + `authorize(["admin"])` ở backend.

---

## 5. Component liên quan ở Frontend

| File                                            | Vai trò                                              |
|-------------------------------------------------|------------------------------------------------------|
| `src/pages/admin/AdminTemplates.tsx`            | Trang quản lý mẫu CV (UC-19)                         |
| `src/services/cv.service.ts`                    | Tầng gọi API CV / CV template                        |
| `src/pages/candidate/CVTemplatePage.tsx`        | Trang ứng viên chọn mẫu (chỉ render mẫu active)       |
| `src/pages/candidate/CVBuilder.tsx`             | Trang dựng CV theo template chọn                     |
| `INITIAL_TEMPLATES_MOCK` (trong AdminTemplates) | Mock fallback / tham chiếu khi DB trống              |
| `TemplateMockup` (trong AdminTemplates)         | Vẽ preview ASCII của 4 mẫu mặc định theo `id`        |

---

## 6. Quy tắc thiết kế khi thêm mẫu mới

1. **Luôn** đặt `category` và `features` bên trong `layoutConfig` — không tạo cột riêng trong DB.
2. `defaultData` nên có ít nhất 1 phần tử cho mỗi mảng (`education`, `experience`, `skills`) để preview không bị rỗng.
3. `thumbnailUrl` có thể là tên file (`executive_standard_v1.png`) — backend ghép `API_BASE_URL` qua `getUploadUrl()`.
4. Khi tạo mẫu mới có `id > 4`, `TemplateMockup` sẽ fallback về `default`; nếu muốn mockup riêng phải bổ sung `case` trong switch.
5. `isActive` mặc định nên `true` trừ khi mẫu đang ở giai đoạn nháp.

---

## 7. Các lỗi thường gặp

| Triệu chứng                                              | Nguyên nhân thường gặp                                                       |
|----------------------------------------------------------|------------------------------------------------------------------------------|
| Mẫu hiện ở Admin nhưng không xuất hiện ở Candidate       | `isActive = false` → bấm toggle để bật                                        |
| `category` về `"Đơn giản"` dù đã chọn khác                | `layoutConfig` không hợp lệ JSON → `mapApiTemplateToCVTemplate` fallback     |
| Khởi tạo mặc định lỗi 409                                | DB đã có mẫu trùng `name` → xóa hoặc đổi tên trong vòng lặp `defaults`        |
| Ảnh preview không hiển thị                               | `thumbnailUrl` rỗng hoặc backend chưa serve `/uploads` qua `API_BASE_URL`     |

---

## 8. Tham chiếu nhanh

- Cấu trúc JSON đầy đủ của `layoutConfig`: xem `docs/CV-Template-Config-Schema.md`
- Auth & phân quyền Admin: xem `docs/Auth-System-Overview.md`
