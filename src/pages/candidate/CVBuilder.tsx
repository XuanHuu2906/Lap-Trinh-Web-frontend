import { useState } from "react";
import {
  Save,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface WorkExp {
  id: number;
  title: string;
  company: string;
  period: string;
  desc: string;
}
interface Education {
  id: number;
  degree: string;
  school: string;
  year: string;
}
interface CVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  summary: string;
  skills: string;
  workExp: WorkExp[];
  education: Education[];
}

// ── Accordion Section ──────────────────────────────────────────────────────────
function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-slate-900/60 hover:bg-gray-100 dark:hover:bg-slate-850/80 transition-colors text-left cursor-pointer"
      >
        <span className="font-semibold text-gray-700 dark:text-slate-300 text-sm">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
        )}
      </button>
      {open && <div className="px-4 py-4 space-y-3 bg-white dark:bg-slate-900">{children}</div>}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
      />
    </div>
  );
}

// ── Live Preview A4 ────────────────────────────────────────────────────────────
function CVPreview({ data }: { data: CVData }) {
  const skills = data.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div
      id="cv-preview"
      className="bg-white text-gray-900 shadow-lg"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: "Georgia, serif",
        fontSize: "11pt",
        padding: "16mm",
      }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-4">
        <h1
          style={{
            fontSize: "22pt",
            fontWeight: "bold",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {data.name || "Họ và Tên"}
        </h1>
        <p style={{ fontSize: "12pt", color: "#4b5563", marginTop: "4px" }}>
          {data.title || "Chức danh chuyên môn"}
        </p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.address && <span>{data.address}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2
            style={{
              fontSize: "10pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "6px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "2px",
            }}
          >
            Tóm tắt sự nghiệp
          </h2>
          <p style={{ fontSize: "10pt", lineHeight: "1.6", color: "#374151" }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {data.workExp.length > 0 && (
        <div className="mb-4">
          <h2
            style={{
              fontSize: "10pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "2px",
            }}
          >
            Kinh nghiệm làm việc
          </h2>
          {data.workExp.map((w) => (
            <div key={w.id} className="mb-4">
              <div className="flex justify-between">
                <p style={{ fontWeight: "bold", fontSize: "10.5pt" }}>
                  {w.title || "Vị trí"}
                </p>
                <p style={{ fontSize: "9pt", color: "#6b7280" }}>{w.period}</p>
              </div>
              <p
                style={{
                  fontSize: "9.5pt",
                  color: "#4b5563",
                  fontStyle: "italic",
                }}
              >
                {w.company}
              </p>
              {w.desc && (
                <p
                  style={{
                    fontSize: "9.5pt",
                    marginTop: "4px",
                    lineHeight: "1.5",
                    color: "#374151",
                  }}
                >
                  {w.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2
            style={{
              fontSize: "10pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "2px",
            }}
          >
            Học vấn
          </h2>
          {data.education.map((e) => (
            <div key={e.id} className="flex justify-between mb-2">
              <div>
                <p style={{ fontWeight: "bold", fontSize: "10pt" }}>
                  {e.degree}
                </p>
                <p style={{ fontSize: "9.5pt", color: "#4b5563" }}>
                  {e.school}
                </p>
              </div>
              <p style={{ fontSize: "9pt", color: "#6b7280" }}>{e.year}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2
            style={{
              fontSize: "10pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "8px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "2px",
            }}
          >
            Kỹ năng
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "9.5pt",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
const INITIAL: CVData = {
  name: "Nguyễn Văn An",
  title: "Chuyên Viên Tuyển Dụng Cao Cấp",
  email: "nguyenan@example.com",
  phone: "090 123 4567",
  address: "Quận 1, TP. Hồ Chí Minh",
  linkedin: "linkedin.com/in/nguyenvanan",
  summary:
    "5 năm kinh nghiệm trong lĩnh vực quản trị nhân sự và tuyển dụng tại các công ty công nghệ đa quốc gia. Sở hữu mạng ứng viên rộng lớn và khả năng đánh giá năng lực xuất sắc.",
  skills: "Sourcing, Phỏng vấn, ATS, Workday, Bamboo HR, Jira, Confluence",
  workExp: [
    {
      id: 1,
      title: "Chuyên viên Tuyển dụng IT",
      company: "Nova Solutions Vietnam",
      period: "03/2021 – Hiện tại",
      desc: "Tuyển dụng thành công hơn 150 kỹ sư. Quản lý ngân sách tuyển dụng 50.000 USD/năm.",
    },
  ],
  education: [
    {
      id: 1,
      degree: "Quản trị Kinh doanh",
      school: "Đại học Kinh tế TP.HCM",
      year: "2014 – 2018",
    },
  ],
};

export default function CVBuilder() {
  const [data, setData] = useState<CVData>(INITIAL);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: false,
    work: false,
    edu: false,
    skills: false,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const setField = (field: keyof CVData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const addWork = () =>
    setData((prev) => ({
      ...prev,
      workExp: [
        ...prev.workExp,
        { id: Date.now(), title: "", company: "", period: "", desc: "" },
      ],
    }));

  const updateWork = (id: number, field: keyof WorkExp, value: string) =>
    setData((prev) => ({
      ...prev,
      workExp: prev.workExp.map((w) =>
        w.id === id ? { ...w, [field]: value } : w,
      ),
    }));

  const removeWork = (id: number) =>
    setData((prev) => ({
      ...prev,
      workExp: prev.workExp.filter((w) => w.id !== id),
    }));

  const addEdu = () =>
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now(), degree: "", school: "", year: "" },
      ],
    }));

  const updateEdu = (id: number, field: keyof Education, value: string) =>
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    }));

  const removeEdu = (id: number) =>
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  const handleDownload = () => {
    alert(
      "Để tải PDF: cài html2canvas + jspdf, sau đó gọi html2canvas(document.getElementById('cv-preview')) rồi dùng jsPDF để xuất file.",
    );
  };

  return (
    <div className="flex flex-col h-full -m-6 bg-white dark:bg-slate-900 transition-colors duration-150">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shrink-0 transition-colors">
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white">Trình Tạo Hồ Sơ</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Đã lưu lần cuối 2 phút trước</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-805 cursor-pointer"
          >
            <Save size={14} />
            {saving ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-805 cursor-pointer">
            <Eye size={14} />
            Xem trước
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            Tải PDF
          </button>
        </div>
      </div>

      {/* Split body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - editor */}
        <div className="w-80 xl:w-96 shrink-0 border-r border-gray-200 dark:border-slate-800 overflow-y-auto bg-gray-50 dark:bg-slate-950 p-4 transition-colors">
          {/* Personal */}
          <Section
            title="Thông tin cá nhân"
            open={openSections.personal}
            onToggle={() => toggle("personal")}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  label="Họ và tên"
                  value={data.name}
                  onChange={(v) => setField("name", v)}
                  placeholder="Nguyễn Văn An"
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Chức danh chuyên môn"
                  value={data.title}
                  onChange={(v) => setField("title", v)}
                />
              </div>
              <Input
                label="Email"
                value={data.email}
                onChange={(v) => setField("email", v)}
                type="email"
              />
              <Input
                label="Số điện thoại"
                value={data.phone}
                onChange={(v) => setField("phone", v)}
              />
              <div className="col-span-2">
                <Input
                  label="Địa chỉ"
                  value={data.address}
                  onChange={(v) => setField("address", v)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="LinkedIn"
                  value={data.linkedin}
                  onChange={(v) => setField("linkedin", v)}
                />
              </div>
            </div>
          </Section>

          {/* Summary */}
          <Section
            title="Tóm tắt sự nghiệp"
            open={openSections.summary}
            onToggle={() => toggle("summary")}
          >
            <Textarea
              label="Mô tả bản thân"
              value={data.summary}
              onChange={(v) => setField("summary", v)}
            />
          </Section>

          {/* Work */}
          <Section
            title="Kinh nghiệm làm việc"
            open={openSections.work}
            onToggle={() => toggle("work")}
          >
            {data.workExp.map((w) => (
              <div
                key={w.id}
                className="border border-gray-200 dark:border-slate-800 rounded-lg p-3 mb-3 relative bg-white dark:bg-slate-900"
              >
                <button
                  onClick={() => removeWork(w.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-450 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
                <div className="space-y-2">
                  <Input
                    label="Vị trí"
                    value={w.title}
                    onChange={(v) => updateWork(w.id, "title", v)}
                  />
                  <Input
                    label="Công ty"
                    value={w.company}
                    onChange={(v) => updateWork(w.id, "company", v)}
                  />
                  <Input
                    label="Thời gian"
                    value={w.period}
                    onChange={(v) => updateWork(w.id, "period", v)}
                    placeholder="01/2020 – Hiện tại"
                  />
                  <Textarea
                    label="Mô tả công việc"
                    value={w.desc}
                    onChange={(v) => updateWork(w.id, "desc", v)}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addWork}
              className="flex items-center gap-1.5 text-blue-600 dark:text-indigo-400 text-xs font-semibold hover:underline cursor-pointer"
            >
              <Plus size={13} /> Thêm kinh nghiệm
            </button>
          </Section>

          {/* Education */}
          <Section
            title="Học vấn"
            open={openSections.edu}
            onToggle={() => toggle("edu")}
          >
            {data.education.map((e) => (
              <div
                key={e.id}
                className="border border-gray-200 dark:border-slate-800 rounded-lg p-3 mb-3 relative bg-white dark:bg-slate-900"
              >
                <button
                  onClick={() => removeEdu(e.id)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-450 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
                <div className="space-y-2">
                  <Input
                    label="Bằng cấp / Chuyên ngành"
                    value={e.degree}
                    onChange={(v) => updateEdu(e.id, "degree", v)}
                  />
                  <Input
                    label="Trường"
                    value={e.school}
                    onChange={(v) => updateEdu(e.id, "school", v)}
                  />
                  <Input
                    label="Năm học"
                    value={e.year}
                    onChange={(v) => updateEdu(e.id, "year", v)}
                    placeholder="2018 – 2022"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addEdu}
              className="flex items-center gap-1.5 text-blue-600 dark:text-indigo-400 text-xs font-semibold hover:underline cursor-pointer"
            >
              <Plus size={13} /> Thêm học vấn
            </button>
          </Section>

          {/* Skills */}
          <Section
            title="Kỹ năng"
            open={openSections.skills}
            onToggle={() => toggle("skills")}
          >
            <Textarea
              label="Kỹ năng (phân cách bằng dấu phẩy)"
              value={data.skills}
              onChange={(v) => setField("skills", v)}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Ví dụ: React, TypeScript, Node.js, SQL
            </p>
          </Section>
        </div>

        {/* Right - A4 preview */}
        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-slate-950/40 p-8 flex items-start justify-center transition-colors">
          <div
            className="shadow-2xl"
            style={{
              transform: "scale(0.75)",
              transformOrigin: "top center",
              marginBottom: "-25%",
            }}
          >
            <CVPreview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
