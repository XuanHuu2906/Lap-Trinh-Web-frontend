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
  X,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
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

function getApiErrorMessage(error: unknown, fallback: string) {
  const response =
    isRecord(error) && isRecord(error.response) ? error.response : null;
  const data = response && isRecord(response.data) ? response.data : null;
  const status = typeof response?.status === "number" ? response.status : null;
  const backendMessage = typeof data?.message === "string" ? data.message : "";

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

function getTemplateCategory(tmpl: any): string {
  if (!tmpl) return "Đơn giản";
  if (tmpl.layoutConfig) {
    try {
      const config = typeof tmpl.layoutConfig === "string" ? JSON.parse(tmpl.layoutConfig) : tmpl.layoutConfig;
      if (config && config.category) {
        return config.category;
      }
    } catch (e) {
      console.error("Lỗi parse template category:", e);
    }
  }
  return "Đơn giản";
}

function CVPreview({
  data,
  template,
  idSuffix = "",
}: {
  data: CVFormData;
  template: any;
  idSuffix?: string;
}) {
  const previewId = `cv-preview${idSuffix}`;
  const category = getTemplateCategory(template);
  const skills = data.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (category === "Hiện đại" || category === "Đon giản" && template?.name?.includes("Modern")) {
    return (
      <div
        id={previewId}
        className="bg-white text-gray-900 shadow-lg flex"
        style={{
          width: "210mm",
          minHeight: "297mm",
          fontFamily: "sans-serif",
          fontSize: "10pt",
        }}
      >
        {/* Left Sidebar */}
        <div className="w-[32%] bg-slate-900 text-white p-6 flex flex-col justify-between text-left font-sans">
          <div className="space-y-6">
            <div className="border-b border-slate-850 pb-4">
              <h2 className="text-lg font-black tracking-tight leading-snug text-white uppercase wrap-break-word">
                {data.name || "Họ và Tên"}
              </h2>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1.5 block">
                {data.title || "Chức danh chuyên môn"}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] font-black text-indigo-400 tracking-wider block uppercase">
                Liên hệ
              </span>
              <div className="text-[10px] text-slate-350 space-y-2 font-medium break-all">
                {data.email && <p>{data.email}</p>}
                {data.phone && <p>{data.phone}</p>}
                {data.address && <p>{data.address}</p>}
                {data.linkedin && <p>{data.linkedin}</p>}
              </div>
            </div>

            {skills.length > 0 && (
              <div className="space-y-3">
                <span className="text-[9px] font-black text-indigo-400 tracking-wider block uppercase">
                  Kỹ năng
                </span>
                <div className="space-y-2 text-[10px] text-slate-300 font-semibold">
                  {skills.map((skill) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{skill}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[85%]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Body */}
        <div className="flex-1 p-8 space-y-6 text-left font-sans">
          {data.summary && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                Giới thiệu bản thân
              </h4>
              <p className="text-[11px] text-slate-650 font-medium leading-relaxed">
                {data.summary}
              </p>
            </div>
          )}

          {data.workExp.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                Kinh nghiệm làm việc
              </h4>
              <div className="space-y-4">
                {data.workExp.map((work) => (
                  <div key={work.id}>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                      <span>{work.company} — {work.title}</span>
                      <span className="text-indigo-600 text-[10px] shrink-0 ml-2">
                        {work.period}
                      </span>
                    </div>
                    {work.desc && (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed whitespace-pre-line">
                        {work.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                Học vấn
              </h4>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between text-[11px] font-bold text-slate-900">
                    <span>{edu.school} — {edu.degree}</span>
                    <span className="text-slate-500 text-[10px] shrink-0 ml-2">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (category === "Chuyên nghiệp") {
    return (
      <div
        id={previewId}
        className="bg-white text-gray-900 shadow-lg text-left"
        style={{
          width: "210mm",
          minHeight: "297mm",
          fontFamily: "Georgia, serif",
          fontSize: "11pt",
          padding: "16mm",
        }}
      >
        {/* Header Professional Navy style banner */}
        <div className="bg-[#0f172a] text-white p-6 -mx-[16mm] -mt-[16mm] mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black tracking-wider uppercase">
              {data.name || "Họ và Tên"}
            </h2>
            <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase mt-1">
              {data.title || "Chức danh chuyên môn"}
            </p>
          </div>
          <div className="text-[10px] text-slate-350 font-medium text-right space-y-1">
            {data.email && <p>{data.email}</p>}
            {data.phone && <p>{data.phone}</p>}
            {data.address && <p>{data.address}</p>}
            {data.linkedin && <p>{data.linkedin}</p>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-[#0f172a] pb-1.5">
              TÓM TẮT CHUYÊN MÔN
            </h4>
            <p className="text-[11px] text-slate-650 font-medium leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {data.workExp.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-[#0f172a] pb-1.5">
              QUÁ TRÌNH CÔNG TÁC CHUYÊN NGHIỆP
            </h4>
            <div className="space-y-4">
              {data.workExp.map((work) => (
                <div key={work.id}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                    <span>
                      {work.company} — {work.title}
                    </span>
                    <span className="text-[#0f172a] font-black text-[10px] shrink-0 ml-2">
                      {work.period}
                    </span>
                  </div>
                  {work.desc && (
                    <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed whitespace-pre-line">
                      {work.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Skills & Education in columns */}
        <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-4">
          {skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wider">
                KỸ NĂNG CỐT LÕI
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-650 rounded-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wider">
                HỌC TRÌNH ĐÀO TẠO
              </h4>
              <ul className="text-[10px] font-semibold text-slate-600 space-y-2 list-disc list-inside">
                {data.education.map((edu) => (
                  <li key={edu.id}>
                    {edu.school} ({edu.year})
                    <span className="block text-slate-500 text-[9px] pl-4">{edu.degree}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Đơn giản (Minimal / Standard)
  return (
    <div
      id={previewId}
      className="bg-white text-gray-900 shadow-lg text-left"
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
                    whiteSpace: "pre-line",
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
  downloading,
  onSave,
  onPreview,
  onDownload,
}: {
  saving: boolean;
  downloading: boolean;
  onSave: () => void;
  onPreview: () => void;
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
          onClick={onPreview}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Eye size={14} />
          Xem trước
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <Download size={14} />
          {downloading ? "Đang tạo PDF..." : "Tải PDF"}
        </button>
      </div>
    </div>
  );
}

function BuilderStatusBar({
  isLoading,
  errorMessage,
}: {
  isLoading: boolean;
  errorMessage: string | null;
}) {
  if (!isLoading && !errorMessage) return null;

  return (
    <div className="border-b border-slate-800 bg-slate-950 px-6 py-3 text-sm">
      {isLoading && (
        <span className="text-slate-400">Đang tải CV từ database...</span>
      )}
      {errorMessage && <span className="text-red-300">{errorMessage}</span>}
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

function PreviewPanel({ data, template }: { data: CVFormData; template: any }) {
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
        <CVPreview data={data} template={template} idSuffix="-live" />
      </div>
    </div>
  );
}

function PreviewModal({
  data,
  template,
  downloading,
  onClose,
  onDownload,
}: {
  data: CVFormData;
  template: any;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
        <h2 className="text-sm font-semibold text-white">
          Xem trước CV ({data.name || "Chưa đặt tên"})
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Download size={14} />
            {downloading ? "Đang tạo PDF..." : "Tải PDF"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            <X size={14} />
            Đóng
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto bg-slate-800 p-8">
        <div className="shadow-2xl">
          <CVPreview data={data} template={template} />
        </div>
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
  const [template, setTemplate] = useState<any | null>(null);
  const [openSections, setOpenSections] =
    useState<OpenSections>(initialOpenSections);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(editingId) || Boolean(templateId));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (editingId) {
          const response = await cvService.getById(editingId);
          setData(mapCVToFormData(response.data));
          setCurrentCvId(response.data.id);

          if (response.data.templateId) {
            const templatesRes = await cvService.getTemplates();
            const tmpl = templatesRes.data.find(t => t.id === response.data.templateId);
            if (tmpl) {
              setTemplate(tmpl);
            }
          }
        } else if (templateId) {
          const templatesRes = await cvService.getTemplates();
          const tmpl = templatesRes.data.find(t => t.id === templateId);
          if (tmpl) {
            setTemplate(tmpl);
            if (tmpl.layoutConfig) {
              try {
                const config = typeof tmpl.layoutConfig === "string" ? JSON.parse(tmpl.layoutConfig) : tmpl.layoutConfig;
                if (config && config.defaultData) {
                  setData({
                    name: config.defaultData.personalInfo?.fullName || "",
                    title: tmpl.name || "",
                    email: config.defaultData.personalInfo?.email || "",
                    phone: config.defaultData.personalInfo?.phone || "",
                    address: config.defaultData.personalInfo?.address || "",
                    linkedin: config.defaultData.personalInfo?.linkedin || "",
                    summary: config.defaultData.personalInfo?.summary || "",
                    skills: (config.defaultData.skills || []).map((s: any) => s.name).join(", "),
                    workExp: (config.defaultData.experience || []).map((w: any, idx: number) => ({
                      id: w.id || Date.now() + idx,
                      title: w.title || "",
                      company: w.company || "",
                      period: w.period || "",
                      desc: w.desc || ""
                    })),
                    education: (config.defaultData.education || []).map((e: any, idx: number) => ({
                      id: e.id || Date.now() + idx,
                      degree: e.degree || "",
                      school: e.school || "",
                      year: e.year || ""
                    }))
                  });
                }
              } catch (e) {
                console.error("Lỗi parse layoutConfig của template:", e);
              }
            }
          }
        }
      } catch (error: unknown) {
        setErrorMessage(
          getApiErrorMessage(error, "Không thể tải dữ liệu CV từ database.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [editingId, templateId]);

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

      const targetTemplateId = templateId || template?.id;
      const payload = mapFormDataToPayload(data, targetTemplateId);
      const response = currentCvId
        ? await cvService.update(currentCvId, payload)
        : await cvService.create(payload);

      setCurrentCvId(response.data.id);

      if (!currentCvId) {
        navigate(`/candidate/cv-builder?id=${response.data.id}`, {
          replace: true,
        });
      }
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error, "Không thể lưu CV vào database."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setErrorMessage(null);

    const openedModalForCapture = !showPreviewModal;
    if (openedModalForCapture) {
      setShowPreviewModal(true);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }

    try {
      const target = document.getElementById("cv-preview");
      if (!target) {
        throw new Error(
          "Không tìm thấy phần xem trước CV. Vui lòng thử lại sau khi mở 'Xem trước'.",
        );
      }

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = (data.name || "untitled")
        .trim()
        .replace(/[\\/:*?"<>|]/g, "")
        .replace(/\s+/g, "_") || "untitled";
      pdf.save(`CV_${safeName}.pdf`);
    } catch (error: unknown) {
      console.error("[CVBuilder] PDF export error:", error);
      const detail = error instanceof Error ? error.message : String(error);
      setErrorMessage(`Không thể tạo file PDF: ${detail}`);
    } finally {
      if (openedModalForCapture) {
        setShowPreviewModal(false);
      }
      setDownloading(false);
    }
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
        downloading={downloading}
        onSave={handleSave}
        onPreview={() => setShowPreviewModal(true)}
        onDownload={handleDownload}
      />

      <BuilderStatusBar
        isLoading={isLoading}
        errorMessage={errorMessage}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorPanel
          data={data}
          openSections={openSections}
          handlers={editorHandlers}
        />

        <PreviewPanel data={data} template={template} />
      </div>

      {showPreviewModal && (
        <PreviewModal
          data={data}
          template={template}
          downloading={downloading}
          onClose={() => setShowPreviewModal(false)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
