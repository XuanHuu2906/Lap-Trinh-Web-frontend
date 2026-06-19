# Schema cấu hình mẫu CV (`layoutConfig`)

> Tài liệu kỹ thuật chi tiết về cấu trúc JSON mà Admin upload vào trường `layoutConfig` khi tạo / sửa mẫu CV (UC-19).
> Đi kèm trang `src/pages/admin/AdminTemplates.tsx` và service `cvService.createTemplate` / `cvService.updateTemplate`.

---

## 1. Tổng quan

`layoutConfig` là **một chuỗi JSON** lưu trong DB ở cột `layout_config` (text). Frontend `JSON.parse` để rút ra metadata + dữ liệu mẫu hiển thị cho ứng viên.

Cấu trúc tổng quát:

```jsonc
{
  "category": "Đơn giản" | "Hiện đại" | "Chuyên nghiệp",
  "features": ["...", "...", "..."],
  "defaultData": {
    "personalInfo": { ... },
    "education":    [ ... ],
    "experience":   [ ... ],
    "skills":       [ ... ]
  }
}
```

---

## 2. Các field cấp 1

### 2.1. `category` (string, bắt buộc)

Một trong ba giá trị enum:

| Giá trị           | Mô tả                                                   |
|-------------------|---------------------------------------------------------|
| `"Đơn giản"`      | ATS-friendly, 1 cột, tối giản                           |
| `"Hiện đại"`      | 2 cột, phối màu nổi, phù hợp creative / tech            |
| `"Chuyên nghiệp"` | Tone trầm, dành cho leadership / managerial             |

> Nếu thiếu hoặc sai enum → `mapApiTemplateToCVTemplate` fallback `"Đơn giản"`.

### 2.2. `features` (string[])

Mảng đặc điểm nổi bật, hiển thị dưới dạng badge ở card mẫu. Khuyến nghị 2–4 mục, mỗi mục ≤ 40 ký tự.

```json
"features": [
  "Bố cục 2 cột cá tính",
  "Thang đo kỹ năng trực quan",
  "Không gian chèn ảnh chân dung sang trọng"
]
```

### 2.3. `defaultData` (object, khuyến nghị)

Dữ liệu mẫu để preview & khởi tạo CV cho ứng viên. Tất cả sub-field đều **optional** nhưng nên có ít nhất 1 phần tử mỗi mảng.

---

## 3. `defaultData.personalInfo`

| Field      | Type   | Mô tả                                           |
|------------|--------|-------------------------------------------------|
| `fullName` | string | Tên đầy đủ (viết hoa toàn bộ trông gọn hơn)     |
| `email`    | string | Email liên hệ                                   |
| `phone`    | string | SĐT định dạng `0xxx xxx xxx`                    |
| `address`  | string | Địa chỉ — thành phố, quốc gia                   |
| `linkedin` | string | URL/handle LinkedIn (không cần `https://`)      |
| `summary`  | string | Đoạn giới thiệu 2–4 câu                         |

Ví dụ:

```json
"personalInfo": {
  "fullName": "NGUYỄN VĂN A",
  "email": "anv@gmail.com",
  "phone": "0987 654 321",
  "address": "Hà Nội, Việt Nam",
  "linkedin": "linkedin.com/in/anv",
  "summary": "Hơn 3 năm kinh nghiệm trong phát triển hệ thống web quy mô lớn..."
}
```

---

## 4. `defaultData.education` (array)

```ts
type EducationItem = {
  school: string;   // Tên trường (viết hoa)
  degree: string;   // Bằng cấp + GPA nếu có
  year:   string;   // Định dạng "YYYY - YYYY" hoặc "YYYY - Hiện tại"
};
```

Ví dụ:

```json
"education": [
  {
    "school": "ĐẠI HỌC CÔNG NGHỆ THÔNG TIN",
    "degree": "Cử nhân CNTT (GPA: 3.4/4)",
    "year":   "2020 - 2024"
  }
]
```

---

## 5. `defaultData.experience` (array)

```ts
type ExperienceItem = {
  company: string;  // Tên công ty (viết hoa)
  title:   string;  // Chức danh
  period:  string;  // "T6/2024 - Hiện tại" hoặc "2023 - 2024"
  desc:    string;  // 1–2 câu mô tả thành quả, có số liệu càng tốt
};
```

Ví dụ:

```json
"experience": [
  {
    "company": "CÔNG TY CÔNG NGHỆ ABC",
    "title":   "Lập trình viên ReactJS",
    "period":  "T6/2024 - Hiện tại",
    "desc":    "Xây dựng và tối ưu giao diện dashboard quản lý thông tin doanh nghiệp, nâng tốc độ tải trang lên 35%."
  }
]
```

> ✅ Khuyến nghị: dùng động từ chủ động + chỉ số đo lường (35%, 2.5M USD, 24 kỹ sư…).

---

## 6. `defaultData.skills` (array)

Hiện tại schema tối giản — chỉ có `name`.

```ts
type SkillItem = {
  name: string;
};
```

Ví dụ:

```json
"skills": [
  { "name": "React" },
  { "name": "Node.js" },
  { "name": "TypeScript" }
]
```

> ⚠ Khi mở rộng (`level`, `years`) cần đồng bộ với `CVBuilder.tsx` để không vỡ render.

---

## 7. Ví dụ đầy đủ — mẫu "Executive Standard"

```json
{
  "category": "Đơn giản",
  "features": [
    "Chuẩn hóa ATS tuyệt đối",
    "Bố cục 1 cột tối ưu cho robot",
    "Cực kỳ tinh gọn chuyên nghiệp"
  ],
  "defaultData": {
    "personalInfo": {
      "fullName": "NGUYỄN VĂN A",
      "email": "anv@gmail.com",
      "phone": "0987 654 321",
      "address": "Hà Nội, Việt Nam",
      "linkedin": "linkedin.com/in/anv",
      "summary": "Hơn 3 năm kinh nghiệm trong phát triển hệ thống web quy mô lớn. Mong muốn mang kiến thức về React, Node.js và kiến trúc microservices đóng góp cho sự phát triển của công ty."
    },
    "education": [
      {
        "school": "ĐẠI HỌC CÔNG NGHỆ THÔNG TIN",
        "degree": "Cử nhân CNTT (GPA: 3.4/4)",
        "year":   "2020 - 2024"
      }
    ],
    "experience": [
      {
        "company": "CÔNG TY CÔNG NGHỆ ABC",
        "title":   "Lập trình viên ReactJS",
        "period":  "T6/2024 - Hiện tại",
        "desc":    "Xây dựng và tối ưu giao diện dashboard quản lý thông tin doanh nghiệp, nâng tốc độ tải trang lên 35%."
      },
      {
        "company": "TẬP ĐOÀN XYZ",
        "title":   "Lập trình viên Backend",
        "period":  "T9/2023 - T5/2024",
        "desc":    "Phát triển hệ thống APIs cho mobile app dịch vụ thương mại điện tử sử dụng Express và MongoDB."
      }
    ],
    "skills": [
      { "name": "React" },
      { "name": "Node.js" },
      { "name": "TypeScript" }
    ]
  }
}
```

---

## 8. Payload gửi lên API

`cvService.createTemplate` chỉ nhận 4 field — `layoutConfig` được **stringify** trước khi gửi:

```ts
await cvService.createTemplate({
  name:         "Executive Standard",
  description:  "Bố cục truyền thống, đơn giản...",
  thumbnailUrl: "executive_standard_v1.png",
  layoutConfig: JSON.stringify({
    category: "Đơn giản",
    features: [...],
    defaultData: {...}
  })
});
```

Tương ứng request:

```http
POST /cvs/templates
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "Executive Standard",
  "description": "Bố cục truyền thống, đơn giản...",
  "thumbnailUrl": "executive_standard_v1.png",
  "layoutConfig": "{\"category\":\"Đơn giản\",\"features\":[...],\"defaultData\":{...}}"
}
```

---

## 9. Validation rules đề xuất

| Field                         | Rule                                            |
|-------------------------------|-------------------------------------------------|
| `name`                        | required, 3–80 ký tự, unique                    |
| `description`                 | required, 20–500 ký tự                          |
| `thumbnailUrl`                | optional, đuôi `.png/.jpg/.webp`                |
| `layoutConfig` (raw string)   | required, parse được bằng `JSON.parse`          |
| `layoutConfig.category`       | required, ∈ enum 3 giá trị                      |
| `layoutConfig.features`       | required, length 1–6                            |
| `layoutConfig.defaultData.*`  | optional nhưng nên có 1 phần tử / nhóm          |
| `isActive`                    | boolean, default `true`                         |

Frontend hiện chưa enforce schema chặt — khi backend bổ sung `zod` validator thì áp các rule trên.

---

## 10. Quy ước version & migration

- Khi đổi cấu trúc `defaultData` (vd: `skills` có thêm `level`), cân nhắc thêm field `version` cấp 1:

  ```json
  { "version": 2, "category": "...", ... }
  ```

- `mapApiTemplateToCVTemplate` cần `switch (config.version)` để parse đúng — không xóa code parse phiên bản cũ trong ít nhất 1 release để các mẫu cũ trong DB còn hoạt động.

---

## 11. Tham chiếu

- Hướng dẫn dùng UI Admin: `docs/CV-Template-Admin-Guide.md`
- Code mẫu khởi tạo 4 default: `AdminTemplates.tsx` → `handleInitializeDefaultTemplates`
- Type ứng viên dùng để render: `CandidateCV`, `CandidateCVTemplate` trong `src/services/cv.service.ts`
