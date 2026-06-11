import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { type CandidateCV, cvService } from "@/services/cv.service";

type WorkExperience = {
  id: number;
  title: string;
  company: string;
  period: string;
  desc: string;
};

type Education = {
  id: number;
  degree: string;
  school: string;
  year: string;
};

type CVFormData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  summary: string;
  skills: string;
  workExp: WorkExperience[];
  education: Education[];
};

type OpenSections = Record<string, boolean>;

type EditorHandlers = {
  toggleSection: (key: string) => void;
  setField: (field: keyof CVFormData, value: string) => void;
  addWork: () => void;
  updateWork: (id: number, field: keyof WorkExperience, value: string) => void;
  removeWork: (id: number) => void;
  addEducation: () => void;
  updateEducation: (id: number, field: keyof Education, value: string) => void;
  removeEducation: (id: number) => void;
};

const emptyFormData: CVFormData = {
  name: "",
  title: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  summary: "",
  skills: "",
  workExp: [],
  education: [],
};

const initialOpenSections: OpenSections = {
  personal: true,
  summary: false,
  work: false,
  education: false,
  skills: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getApiErrorMessage(error: any, fallback: string) {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;

  if (backendMessage) return backendMessage;
  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập CV này. Vui lòng đăng nhập lại.";
  }
  if (status === 404) {
    return "Không tìm thấy CV này hoặc CV đã bị xóa.";
  }

  return fallback;
}

function mapCVToFormData(cv: CandidateCV): CVFormData {
  const personalInfo = isRecord(cv.personalInfo) ? cv.personalInfo : {};
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const skills = Array.isArray(cv.skills) ? cv.skills : [];

  return {
    name: getString(personalInfo.fullName),
    title: cv.title || "",
    email: getString(personalInfo.email),
    phone: getString(personalInfo.phone),
    address: getString(personalInfo.address),
    linkedin: getString(personalInfo.linkedin),
    summary: getString(personalInfo.summary),
    skills: skills
      .map((skill) => (isRecord(skill) ? getString(skill.name) : ""))
      .filter(Boolean)
      .join(", "),
    workExp: experience.map((item, index) => {
      const row = isRecord(item) ? item : {};

      return {
        id: Number(row.id) || Date.now() + index,
        title: getString(row.title),
        company: getString(row.company),
        period: getString(row.period),
        desc: getString(row.desc),
      };
    }),
    education: education.map((item, index) => {
      const row = isRecord(item) ? item : {};

      return {
        id: Number(row.id) || Date.now() + index,
        degree: getString(row.degree),
        school: getString(row.school),
        year: getString(row.year),
      };
    }),
  };
}

function mapFormDataToPayload(data: CVFormData, templateId?: number) {
  return {
    title: data.title || data.name || "CV của tôi",
    templateId,
    personalInfo: {
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      linkedin: data.linkedin,
      summary: data.summary,
    },
    experience: data.workExp,
    education: data.education,
    skills: data.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .map((name) => ({ name })),
  };
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:bg-slate-900/60 dark:hover:bg-slate-800"
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
        )}
      </button>

      {open ? (
        <div className="space-y-3 bg-white px-4 py-4 dark:bg-slate-900">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
}

function CVPreview({ data }: { data: CVFormData }) {
  const skills = data.skills
    .split(",")
    .map((skill) => skill.trim())
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
      <div className="mb-4 border-b-2 border-gray-800 pb-4">
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
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.address && <span>{data.address}</span>}
          {data.linkedin && <span>{data.linkedin}</span>}
        </div>
      </div>

      {data.summary && (
        <PreviewSection title="Tóm tắt sự nghiệp">
          <p style={{ fontSize: "10pt", lineHeight: "1.6", color: "#374151" }}>
            {data.summary}
          </p>
        </PreviewSection>
      )}

      {data.workExp.length > 0 && (
        <PreviewSection title="Kinh nghiệm làm việc">
          {data.workExp.map((work) => (
            <div key={work.id} className="mb-4">
              <div className="flex justify-between">
                <p style={{ fontWeight: "bold", fontSize: "10.5pt" }}>
                  {work.title || "Vị trí"}
                </p>
                <p style={{ fontSize: "9pt", color: "#6b7280" }}>
                  {work.period}
                </p>
              </div>
              <p
                style={{
                  fontSize: "9.5pt",
                  color: "#4b5563",
                  fontStyle: "italic",
                }}
              >
                {work.company}
              </p>
              {work.desc && (
                <p
                  style={{
                    fontSize: "9.5pt",
                    marginTop: "4px",
                    lineHeight: "1.5",
                    color: "#374151",
                  }}
                >
                  {work.desc}
                </p>
              )}
            </div>
          ))}
        </PreviewSection>
      )}

      {data.education.length > 0 && (
        <PreviewSection title="Học vấn">
          {data.education.map((education) => (
            <div key={education.id} className="mb-2 flex justify-between">
              <div>
                <p style={{ fontWeight: "bold", fontSize: "10pt" }}>
                  {education.degree}
                </p>
                <p style={{ fontSize: "9.5pt", color: "#4b5563" }}>
                  {education.school}
                </p>
              </div>
              <p style={{ fontSize: "9pt", color: "#6b7280" }}>
                {education.year}
              </p>
            </div>
          ))}
        </PreviewSection>
      )}

      {skills.length > 0 && (
        <PreviewSection title="Kỹ năng">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "9.5pt",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}
    </div>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
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
        {title}
      </h2>
      {children}
    </div>
  );
}

function BuilderTopBar({
  saving,
  onSave,
  onDownload,
}: {
  saving: boolean;
  onSave: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3 transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">
          Trình tạo hồ sơ
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Tạo và cập nhật CV từ dữ liệu thật trong database.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Save size={14} />
          {saving ? "Đang lưu..." : "Lưu nháp"}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Eye size={14} />
          Xem trước
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <Download size={14} />
          Tải PDF
        </button>
      </div>
    </div>
  );
}

function BuilderStatusBar({
  isLoading,
  errorMessage,
  lastSavedAt,
}: {
  isLoading: boolean;
  errorMessage: string | null;
  lastSavedAt: string | null;
}) {
  if (!isLoading && !errorMessage && !lastSavedAt) return null;

  return (
    <div className="border-b border-slate-800 bg-slate-950 px-6 py-3 text-sm">
      {isLoading && (
        <span className="text-slate-400">Đang tải CV từ database...</span>
      )}
      {errorMessage && <span className="text-red-300">{errorMessage}</span>}
      {!isLoading && !errorMessage && lastSavedAt && (
        <span className="text-green-300">
          Đã lưu vào database lúc{" "}
          {new Date(lastSavedAt).toLocaleString("vi-VN")}
        </span>
      )}
    </div>
  );
}

function EditorPanel({
  data,
  openSections,
  handlers,
}: {
  data: CVFormData;
  openSections: OpenSections;
  handlers: EditorHandlers;
}) {
  return (
    <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950 xl:w-96">
      <PersonalSection
        data={data}
        open={openSections.personal}
        handlers={handlers}
      />
      <SummarySection
        data={data}
        open={openSections.summary}
        handlers={handlers}
      />
      <WorkSection data={data} open={openSections.work} handlers={handlers} />
      <EducationSection
        data={data}
        open={openSections.education}
        handlers={handlers}
      />
      <SkillsSection
        data={data}
        open={openSections.skills}
        handlers={handlers}
      />
    </div>
  );
}

function PersonalSection({
  data,
  open,
  handlers,
}: {
  data: CVFormData;
  open: boolean;
  handlers: EditorHandlers;
}) {
  return (
    <Section
      title="Thông tin cá nhân"
      open={open}
      onToggle={() => handlers.toggleSection("personal")}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <TextInput
            label="Họ và tên"
            value={data.name}
            onChange={(value) => handlers.setField("name", value)}
            placeholder="Nguyễn Văn An"
          />
        </div>
        <div className="col-span-2">
          <TextInput
            label="Chức danh chuyên môn"
            value={data.title}
            onChange={(value) => handlers.setField("title", value)}
          />
        </div>
        <TextInput
          label="Email"
          value={data.email}
          onChange={(value) => handlers.setField("email", value)}
          type="email"
        />
        <TextInput
          label="Số điện thoại"
          value={data.phone}
          onChange={(value) => handlers.setField("phone", value)}
        />
        <div className="col-span-2">
          <TextInput
            label="Địa chỉ"
            value={data.address}
            onChange={(value) => handlers.setField("address", value)}
          />
        </div>
        <div className="col-span-2">
          <TextInput
            label="LinkedIn"
            value={data.linkedin}
            onChange={(value) => handlers.setField("linkedin", value)}
          />
        </div>
      </div>
    </Section>
  );
}

function SummarySection({
  data,
  open,
  handlers,
}: {
  data: CVFormData;
  open: boolean;
  handlers: EditorHandlers;
}) {
  return (
    <Section
      title="Tóm tắt sự nghiệp"
      open={open}
      onToggle={() => handlers.toggleSection("summary")}
    >
      <TextAreaInput
        label="Mô tả bản thân"
        value={data.summary}
        onChange={(value) => handlers.setField("summary", value)}
      />
    </Section>
  );
}

function WorkSection({
  data,
  open,
  handlers,
}: {
  data: CVFormData;
  open: boolean;
  handlers: EditorHandlers;
}) {
  return (
    <Section
      title="Kinh nghiệm làm việc"
      open={open}
      onToggle={() => handlers.toggleSection("work")}
    >
      {data.workExp.map((work) => (
        <div
          key={work.id}
          className="relative mb-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={() => handlers.removeWork(work.id)}
            className="absolute right-2 top-2 text-gray-300 transition-colors hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>

          <div className="space-y-2">
            <TextInput
              label="Vị trí"
              value={work.title}
              onChange={(value) => handlers.updateWork(work.id, "title", value)}
            />
            <TextInput
              label="Công ty"
              value={work.company}
              onChange={(value) =>
                handlers.updateWork(work.id, "company", value)
              }
            />
            <TextInput
              label="Thời gian"
              value={work.period}
              onChange={(value) =>
                handlers.updateWork(work.id, "period", value)
              }
              placeholder="01/2020 - Hiện tại"
            />
            <TextAreaInput
              label="Mô tả công việc"
              value={work.desc}
              onChange={(value) => handlers.updateWork(work.id, "desc", value)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handlers.addWork}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-indigo-400"
      >
        <Plus size={13} /> Thêm kinh nghiệm
      </button>
    </Section>
  );
}

function EducationSection({
  data,
  open,
  handlers,
}: {
  data: CVFormData;
  open: boolean;
  handlers: EditorHandlers;
}) {
  return (
    <Section
      title="Học vấn"
      open={open}
      onToggle={() => handlers.toggleSection("education")}
    >
      {data.education.map((education) => (
        <div
          key={education.id}
          className="relative mb-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={() => handlers.removeEducation(education.id)}
            className="absolute right-2 top-2 text-gray-300 hover:text-red-500"
          >
            <Trash2 size={13} />
          </button>

          <div className="space-y-2">
            <TextInput
              label="Bằng cấp / Chuyên ngành"
              value={education.degree}
              onChange={(value) =>
                handlers.updateEducation(education.id, "degree", value)
              }
            />
            <TextInput
              label="Trường"
              value={education.school}
              onChange={(value) =>
                handlers.updateEducation(education.id, "school", value)
              }
            />
            <TextInput
              label="Năm học"
              value={education.year}
              onChange={(value) =>
                handlers.updateEducation(education.id, "year", value)
              }
              placeholder="2018 - 2022"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handlers.addEducation}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-indigo-400"
      >
        <Plus size={13} /> Thêm học vấn
      </button>
    </Section>
  );
}

function SkillsSection({
  data,
  open,
  handlers,
}: {
  data: CVFormData;
  open: boolean;
  handlers: EditorHandlers;
}) {
  return (
    <Section
      title="Kỹ năng"
      open={open}
      onToggle={() => handlers.toggleSection("skills")}
    >
      <TextAreaInput
        label="Kỹ năng (phân cách bằng dấu phẩy)"
        value={data.skills}
        onChange={(value) => handlers.setField("skills", value)}
      />
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        Ví dụ: React, TypeScript, Node.js, SQL
      </p>
    </Section>
  );
}

function PreviewPanel({ data }: { data: CVFormData }) {
  return (
    <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-200 p-8 transition-colors dark:bg-slate-950/40">
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
  );
}

export default function CVBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = Number(searchParams.get("id")) || null;
  const templateId = Number(searchParams.get("templateId")) || undefined;

  const [currentCvId, setCurrentCvId] = useState<number | null>(editingId);
  const [data, setData] = useState<CVFormData>(emptyFormData);
  const [openSections, setOpenSections] =
    useState<OpenSections>(initialOpenSections);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(editingId));
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;

    const loadCV = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await cvService.getById(editingId);
        setData(mapCVToFormData(response.data));
        setCurrentCvId(response.data.id);
        setLastSavedAt(response.data.updatedAt);
      } catch (error: any) {
        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải CV từ database."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCV();
  }, [editingId]);

  const toggleSection = (key: string) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const setField = (field: keyof CVFormData, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const addWork = () => {
    setData((current) => ({
      ...current,
      workExp: [
        ...current.workExp,
        { id: Date.now(), title: "", company: "", period: "", desc: "" },
      ],
    }));
  };

  const updateWork = (
    id: number,
    field: keyof WorkExperience,
    value: string,
  ) => {
    setData((current) => ({
      ...current,
      workExp: current.workExp.map((work) =>
        work.id === id ? { ...work, [field]: value } : work,
      ),
    }));
  };

  const removeWork = (id: number) => {
    setData((current) => ({
      ...current,
      workExp: current.workExp.filter((work) => work.id !== id),
    }));
  };

  const addEducation = () => {
    setData((current) => ({
      ...current,
      education: [
        ...current.education,
        { id: Date.now(), degree: "", school: "", year: "" },
      ],
    }));
  };

  const updateEducation = (
    id: number,
    field: keyof Education,
    value: string,
  ) => {
    setData((current) => ({
      ...current,
      education: current.education.map((education) =>
        education.id === id ? { ...education, [field]: value } : education,
      ),
    }));
  };

  const removeEducation = (id: number) => {
    setData((current) => ({
      ...current,
      education: current.education.filter((education) => education.id !== id),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);

      const payload = mapFormDataToPayload(data, templateId);
      const response = currentCvId
        ? await cvService.update(currentCvId, payload)
        : await cvService.create(payload);

      setCurrentCvId(response.data.id);
      setLastSavedAt(response.data.updatedAt);

      if (!currentCvId) {
        navigate(`/candidate/cv-builder?id=${response.data.id}`, {
          replace: true,
        });
      }
    } catch (error: any) {
      setErrorMessage(
        getApiErrorMessage(error, "Không thể lưu CV vào database."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    alert(
      "Để tải PDF: cài html2canvas + jspdf, sau đó gọi html2canvas(document.getElementById('cv-preview')) rồi dùng jsPDF để xuất file.",
    );
  };

  const editorHandlers: EditorHandlers = {
    toggleSection,
    setField,
    addWork,
    updateWork,
    removeWork,
    addEducation,
    updateEducation,
    removeEducation,
  };

  return (
    <div className="-m-6 flex h-full flex-col bg-white transition-colors duration-150 dark:bg-slate-900">
      <BuilderTopBar
        saving={saving}
        onSave={handleSave}
        onDownload={handleDownload}
      />

      <BuilderStatusBar
        isLoading={isLoading}
        errorMessage={errorMessage}
        lastSavedAt={lastSavedAt}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorPanel
          data={data}
          openSections={openSections}
          handlers={editorHandlers}
        />

        <PreviewPanel data={data} />
      </div>
    </div>
  );
}
