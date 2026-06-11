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

function TemplatePreview({ template }: { template: CandidateCVTemplate }) {
  const thumbnailUrl = getUploadUrl(template.thumbnailUrl);

  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={template.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-between bg-white p-4 text-slate-400">
      <div>
        <div className="mb-4 h-3 w-20 rounded bg-slate-800" />
        <div className="mb-2 h-2 w-28 rounded bg-slate-300" />
        <div className="h-2 w-24 rounded bg-slate-200" />
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full rounded bg-slate-200" />
        <div className="h-2 w-10/12 rounded bg-slate-200" />
        <div className="h-2 w-8/12 rounded bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="h-2 rounded bg-slate-200" />
        <div className="h-2 rounded bg-slate-200" />
      </div>
    </div>
  );
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          HireArch / Cổng ứng viên
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Mẫu CV</h1>
        <p className="mt-2 text-sm text-slate-400">
          Danh sách này lấy từ bảng CVTemplate trong database.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-blue-500 disabled:opacity-50"
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
    <div className="mb-6 flex items-center border border-slate-800 bg-slate-950 px-4 py-3">
      <Search size={18} className="mr-3 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm theo tên hoặc mô tả mẫu..."
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
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
      <div className="flex min-h-64 items-center justify-center gap-2 border border-slate-800 bg-slate-900 text-slate-400">
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
    <div className="flex min-h-72 flex-col items-center justify-center border border-slate-800 bg-slate-900 px-4 text-center">
      <FileText className="mb-4 text-slate-600" size={48} />
      <p className="font-semibold text-white">Chưa có mẫu CV nào.</p>
      <p className="mt-2 max-w-md text-sm text-slate-500">
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
    <article className="border border-slate-800 bg-slate-900 transition hover:border-blue-500/70">
      <div className="aspect-3/4 border-b border-slate-800 bg-slate-950 p-8">
        <TemplatePreview template={template} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">{template.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
              {template.description || "Mẫu CV chưa có mô tả."}
            </p>
          </div>

          <span className="shrink-0 bg-green-950 px-2 py-1 text-[11px] font-semibold text-green-300">
            Active
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="inline-flex items-center justify-center gap-2 border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-500 hover:text-blue-300"
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
      <div className="w-full max-w-3xl border border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {template.description || "Mẫu CV chưa có mô tả."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-400 hover:text-white"
          >
            Đóng
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[260px_1fr]">
          <div className="aspect-3/4 border border-slate-800 bg-slate-900 p-6">
            <TemplatePreview template={template} />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Template #{template.id}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Đây là dữ liệu template thật trả về từ API
                <span className="font-mono text-blue-300">
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
