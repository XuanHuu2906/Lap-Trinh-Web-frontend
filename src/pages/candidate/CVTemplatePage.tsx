import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  type CandidateCVTemplate,
  cvService,
  getCachedCVTemplates,
  getUploadUrl,
} from "@/services/cv.service";

function getMockupKey(id: number, name: string): 1 | 2 | 3 | 4 | null {
  const normName = name.toLowerCase().replace(/\s+/g, "");
  if (id === 1 || normName.includes("executivestandard")) return 1;
  if (id === 2 || normName.includes("modernsplitcreative") || normName.includes("modernsplit")) return 2;
  if (id === 3 || normName.includes("techminimalistdark") || normName.includes("techminimalist")) return 3;
  if (id === 4 || normName.includes("corporateleadership")) return 4;
  return null;
}

function TemplateMockup({ id, name }: { id: number; name: string }) {
  const key = getMockupKey(id, name);
  switch (key) {
    case 1: // executive-standard
      return (
        <div className="w-full h-full bg-white p-4 flex flex-col justify-between text-[4px] leading-1.5 text-slate-400 select-none">
          <div>
            {/* Header */}
            <div className="border-b border-slate-100 pb-2 mb-3">
              <div className="font-extrabold text-slate-800 text-[10px] leading-none mb-1 font-sans">
                CV
              </div>
              <div className="w-12 h-1 bg-slate-350 rounded-sm mb-1"></div>
              <div className="w-20 h-1 bg-slate-200 rounded-sm"></div>
            </div>
            {/* Section 1 */}
            <div className="mb-3">
              <div className="w-8 h-1 bg-slate-400 rounded-sm mb-1.5 font-bold"></div>
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
                <div className="w-4/5 h-0.5 bg-slate-100 rounded-sm"></div>
              </div>
            </div>
            {/* Section 2 */}
            <div className="mb-3">
              <div className="w-12 h-1 bg-slate-400 rounded-sm mb-1.5 font-bold"></div>
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
              </div>
            </div>
          </div>
          {/* Footer mockup */}
          <div className="flex justify-between items-center text-[3px] border-t border-slate-50 pt-2 text-slate-300">
            <span>ATS Friendly</span>
            <span>1 Page</span>
          </div>
        </div>
      );
    case 2: // corporate-split
      return (
        <div className="w-full h-full bg-white p-4 flex text-[4px] leading-1.5 text-slate-400 select-none">
          {/* Left Sidebar */}
          <div className="w-[32%] border-r border-slate-100 pr-1.5 mr-1.5 flex flex-col justify-between">
            <div>
              <div className="w-6 h-6 rounded-full bg-slate-255 mb-2 mx-auto bg-slate-200"></div>
              <div className="w-10 h-0.5 bg-slate-400 rounded-sm mb-2 mx-auto"></div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="w-6 h-0.5 bg-slate-150 bg-slate-200"></div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="w-8 h-0.5 bg-slate-150 bg-slate-200"></div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <div className="w-5 h-0.5 bg-slate-150 bg-slate-200"></div>
                </div>
              </div>
            </div>
            <div className="text-[3px] text-slate-300 tracking-wider">
              SAM BASE WORK
            </div>
          </div>
          {/* Right Main Body */}
          <div className="w-[68%] flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-1.5 mb-2">
                <div className="w-16 h-1 bg-slate-500 rounded-sm mb-1"></div>
                <div className="w-24 h-0.5 bg-slate-200 rounded-sm"></div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="w-10 h-1 bg-slate-400 rounded-sm mb-1"></div>
                  <div className="space-y-1">
                    <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                    <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
                  </div>
                </div>
                <div>
                  <div className="w-12 h-1 bg-slate-400 rounded-sm mb-1"></div>
                  <div className="space-y-1">
                    <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                    <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 3: // tech-minimal
      return (
        <div className="w-full h-full bg-[#1F242D] p-4 flex flex-col justify-between text-[4px] leading-1.5 text-slate-300 select-none">
          <div>
            {/* Header */}
            <div className="border-b border-slate-700 pb-2 mb-3">
              <div className="font-extrabold text-[#D5A153] text-[12px] leading-none mb-1 font-serif">
                CV
              </div>
              <div className="w-12 h-1 bg-slate-400 rounded-sm mb-1"></div>
              <div className="w-20 h-0.5 bg-slate-500 rounded-sm"></div>
            </div>
            {/* Section 1 */}
            <div className="mb-3">
              <div className="w-12 h-1 text-[#D5A153] rounded-sm mb-1.5 font-bold font-mono">
                EXPERIENCE
              </div>
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-slate-600 rounded-sm"></div>
                <div className="w-5/6 h-0.5 bg-slate-600 rounded-sm"></div>
                <div className="w-4/5 h-0.5 bg-slate-600 rounded-sm"></div>
              </div>
            </div>
            {/* Yellow Button Highlight */}
            <div className="my-2 py-0.5 bg-[#D5A153] text-[#1F242D] text-[3px] text-center rounded-[1px] font-bold tracking-wider">
              PORTFOLIO
            </div>
            {/* Section 2 */}
            <div>
              <div className="w-10 h-1 text-[#D5A153] rounded-sm mb-1.5 font-bold font-mono">
                SKILLS
              </div>
              <div className="space-y-1">
                <div className="w-11/12 h-0.5 bg-slate-600 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      );
    case 4: // consultant-pro
      return (
        <div className="w-full h-full bg-white p-4 flex flex-col justify-between text-[4px] leading-1.5 text-slate-400 select-none">
          <div>
            {/* Header */}
            <div className="mb-3">
              <div className="font-serif text-[11px] font-bold text-slate-900 leading-none mb-1">
                CVM
              </div>
              <div className="w-16 h-[1.5px] bg-slate-800 rounded-sm mb-1"></div>
              <div className="w-24 h-0.5 bg-slate-300 rounded-sm"></div>
            </div>
            {/* Split layout simulation */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 space-y-1.5 border-r-[0.5px] border-slate-100 pr-1">
                <div className="w-8 h-1 bg-slate-500 rounded-sm font-bold">
                  CONTACT
                </div>
                <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
              </div>
              <div className="col-span-2 space-y-2">
                <div>
                  <div className="w-12 h-1 bg-slate-500 rounded-sm mb-1 font-bold">
                    EDUCATION
                  </div>
                  <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                  <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
                </div>
                <div>
                  <div className="w-14 h-1 bg-slate-500 rounded-sm mb-1 font-bold">
                    PROJECTS
                  </div>
                  <div className="w-11/12 h-0.5 bg-slate-100 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer with dark banner mock */}
          <div className="bg-[#0F172A] text-white text-[3px] py-0.5 text-center font-bold tracking-widest rounded-sm">
            SAFE SI WORK
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-white p-4 flex flex-col justify-between text-[4px] leading-1.5 text-slate-400 select-none">
          <div>
            {/* Header */}
            <div className="border-b border-slate-150 pb-2 mb-3">
              <div className="font-extrabold text-slate-800 text-[10px] leading-none mb-1">
                CV
              </div>
              <div className="w-16 h-1 bg-indigo-500 rounded-sm mb-1"></div>
              <div className="w-24 h-0.5 bg-slate-200 rounded-sm"></div>
            </div>
            {/* Dummy lines */}
            <div className="space-y-2">
              <div className="w-12 h-1 bg-slate-350 rounded-sm"></div>
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                <div className="w-5/6 h-0.5 bg-slate-100 rounded-sm"></div>
              </div>
              <div className="w-12 h-1 bg-slate-350 rounded-sm"></div>
              <div className="space-y-1">
                <div className="w-full h-0.5 bg-slate-100 rounded-sm"></div>
                <div className="w-4/5 h-0.5 bg-slate-100 rounded-sm"></div>
              </div>
            </div>
          </div>
          <div className="text-[5px] text-indigo-600 font-bold text-center uppercase tracking-widest pt-2 border-t border-slate-100">
            {name}
          </div>
        </div>
      );
  }
}

function TemplatePreview({ template }: { template: CandidateCVTemplate }) {
  const [hasError, setHasError] = useState(false);
  const thumbnailUrl = getUploadUrl(template.thumbnailUrl);

  const isDefaultMockImage = !!(
    template.thumbnailUrl &&
    (template.thumbnailUrl.includes("executive_standard") ||
      template.thumbnailUrl.includes("modern_split") ||
      template.thumbnailUrl.includes("tech_minimalist") ||
      template.thumbnailUrl.includes("corporate_navy"))
  );

  if (thumbnailUrl && !hasError && !isDefaultMockImage) {
    return (
      <img
        src={thumbnailUrl}
        alt={template.name}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    );
  }

  return <TemplateMockup id={template.id} name={template.name} />;
}

function PageHeader({
  isLoading,
  onRefresh,
}: {
  isLoading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Mẫu CV</h1>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        Tải lại
      </button>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-6 flex items-center border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <Search size={18} className="mr-3 text-slate-400 dark:text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm theo tên hoặc mô tả mẫu..."
        className="w-full bg-transparent text-sm text-slate-850 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
      />
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
      <AlertCircle size={16} />
      {message}
    </div>
  );
}

function TemplatesContent({
  templates,
  isLoading,
  onPreview,
  onUseTemplate,
}: {
  templates: CandidateCVTemplate[];
  isLoading: boolean;
  onPreview: (template: CandidateCVTemplate) => void;
  onUseTemplate: (template: CandidateCVTemplate) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <Loader2 size={20} className="animate-spin" />
        Đang tải mẫu CV...
      </div>
    );
  }

  if (templates.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onPreview={onPreview}
          onUseTemplate={onUseTemplate}
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 text-center">
      <FileText className="mb-4 text-slate-450 dark:text-slate-600" size={48} />
      <p className="font-semibold text-slate-900 dark:text-white">Chưa có mẫu CV nào.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Nếu bảng CVTemplate đang trống, frontend sẽ không hiển thị dữ liệu giả
        nữa. Hãy thêm template ở backend/admin để candidate dùng.
      </p>
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
  onUseTemplate,
}: {
  template: CandidateCVTemplate;
  onPreview: (template: CandidateCVTemplate) => void;
  onUseTemplate: (template: CandidateCVTemplate) => void;
}) {
  return (
    <article className="border border-slate-200 bg-white transition hover:border-blue-500/70 dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-3/4 border-b border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-950">
        <TemplatePreview template={template} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{template.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {template.description || "Mẫu CV chưa có mô tả."}
            </p>
          </div>

          <span className="shrink-0 bg-green-50 text-green-750 dark:bg-green-950 px-2 py-1 text-[11px] font-semibold text-green-700 dark:text-green-300">
            Active
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="inline-flex items-center justify-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-650 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:text-blue-300"
          >
            <Eye size={14} />
            Xem trước
          </button>

          <button
            type="button"
            onClick={() => onUseTemplate(template)}
            className="bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
          >
            Sử dụng
          </button>
        </div>
      </div>
    </article>
  );
}

function PreviewModal({
  template,
  onClose,
  onUseTemplate,
}: {
  template: CandidateCVTemplate;
  onClose: () => void;
  onUseTemplate: (template: CandidateCVTemplate) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="mr-8">
            <h2 className="font-semibold text-slate-900 dark:text-white">{template.name}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {template.description || "Mẫu CV chưa có mô tả."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white shrink-0"
          >
            Đóng
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
          <div className="aspect-3/4 border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <TemplatePreview template={template} />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-450 dark:text-slate-500">
                Template #{template.id}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-650 dark:text-slate-350">
                Đây là dữ liệu template thật trả về từ API
                <span className="font-mono text-blue-650 dark:text-blue-300 font-semibold">
                  {" "}
                  /api/cvs/templates
                </span>
                . Khi bấm sử dụng, frontend chuyển sang CV Builder kèm
                templateId này.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onUseTemplate(template)}
              className="mt-6 bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Sử dụng mẫu này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CVTemplatePage() {
  const navigate = useNavigate();
  const cachedTemplates = getCachedCVTemplates();

  const [templates, setTemplates] = useState<CandidateCVTemplate[]>(
    cachedTemplates?.data ?? [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] =
    useState<CandidateCVTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedTemplates);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTemplates = async (forceRefresh = false) => {
    try {
      if (!getCachedCVTemplates() || forceRefresh) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const response = await cvService.getTemplates(forceRefresh);
      setTemplates(response.data);
    } catch {
      setErrorMessage("Không thể tải mẫu CV từ database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return templates;

    return templates.filter((template) => {
      const name = template.name.toLowerCase();
      const description = template.description?.toLowerCase() ?? "";

      return name.includes(keyword) || description.includes(keyword);
    });
  }, [searchTerm, templates]);

  const handleUseTemplate = (template: CandidateCVTemplate) => {
    navigate(`/candidate/cv-builder?templateId=${template.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        isLoading={isLoading}
        onRefresh={() => loadTemplates(true)}
      />

      <SearchBox value={searchTerm} onChange={setSearchTerm} />

      {errorMessage && <ErrorAlert message={errorMessage} />}

      <TemplatesContent
        templates={filteredTemplates}
        isLoading={isLoading}
        onPreview={setPreviewTemplate}
        onUseTemplate={handleUseTemplate}
      />

      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </div>
  );
}
