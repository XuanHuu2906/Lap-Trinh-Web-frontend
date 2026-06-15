import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  type CandidateCV,
  cvService,
  getCachedMyCVs,
  getUploadUrl,
} from "@/services/cv.service";
import { decodeMojibake } from "@/utils/encoding";

type CVActionHandlers = {
  onView: (cv: CandidateCV) => void;
  onEdit: (cv: CandidateCV) => void;
  onDownload: (cv: CandidateCV) => void;
  onDelete: (id: number) => void;
  onSetActive: (id: number) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCVTitle(cv: CandidateCV) {
  return decodeMojibake(cv.title);
}

function getCVSubtitle(cv: CandidateCV) {
  if (cv.cvType === "uploaded") return "Tài liệu PDF tải lên";
  if (cv.template?.name) return `Tạo từ mẫu ${cv.template.name}`;

  return "CV tạo bằng hệ thống";
}

function getPreviewText(cv: CandidateCV) {
  if (cv.cvType === "uploaded") return "PDF";

  return getCVTitle(cv).slice(0, 2).toUpperCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const response = isRecord(error) && isRecord(error.response)
    ? error.response
    : null;
  const data = response && isRecord(response.data) ? response.data : null;
  const status = typeof response?.status === "number" ? response.status : null;
  const backendMessage =
    typeof data?.message === "string" ? data.message : "";

  if (backendMessage) return backendMessage;
  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn hoặc bạn không có quyền thao tác CV này. Vui lòng đăng nhập lại.";
  }
  if (status === 500) {
    return "Backend đang lỗi khi xử lý yêu cầu này. Vui lòng kiểm tra log backend hoặc thử lại sau.";
  }

  return fallback;
}

function CVPreview({ cv }: { cv: CandidateCV }) {
  if (cv.cvType === "uploaded") {
    return (
      <div className="flex h-20 w-14 flex-col items-center justify-center gap-1 rounded border border-red-200 bg-red-50 text-red-500 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        <FileText size={24} />
        <span className="text-[9px] font-extrabold">PDF</span>
      </div>
    );
  }

  return (
    <div className="flex h-20 w-14 flex-col gap-1 rounded border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-100">
      <div className="h-2 w-10 rounded bg-slate-700" />
      <div className="h-1 w-7 rounded bg-slate-400" />
      <div className="mt-1 h-1 w-9 rounded bg-slate-300" />
      <div className="h-1 w-8 rounded bg-slate-300" />
      <div className="h-1 w-10 rounded bg-slate-300" />
      <div className="mt-auto text-center text-[10px] font-bold text-slate-500">
        {getPreviewText(cv)}
      </div>
    </div>
  );
}

function PageHeader({
  isUploading,
  fileInputRef,
  onUpload,
  onCreate,
}: {
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
          CV của tôi
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onUpload}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          Upload CV PDF
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus size={16} />
          Tạo CV mới
        </button>
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
      <AlertCircle size={16} />
      {message}
    </div>
  );
}

function CVListPanel({
  cvs,
  isLoading,
  deletingId,
  activatingId,
  handlers,
  onRefresh,
}: {
  cvs: CandidateCV[];
  isLoading: boolean;
  deletingId: number | null;
  activatingId: number | null;
  handlers: CVActionHandlers;
  onRefresh: () => void;
}) {
  return (
    <section className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Danh sách CV
          </h2>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          Tải lại
        </button>
      </div>

      <CVListContent
        cvs={cvs}
        isLoading={isLoading}
        deletingId={deletingId}
        activatingId={activatingId}
        handlers={handlers}
      />
    </section>
  );
}

function CVListContent({
  cvs,
  isLoading,
  deletingId,
  activatingId,
  handlers,
}: {
  cvs: CandidateCV[];
  isLoading: boolean;
  deletingId: number | null;
  activatingId: number | null;
  handlers: CVActionHandlers;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
        <Loader2 className="animate-spin" size={20} />
        Đang tải CV...
      </div>
    );
  }

  if (cvs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Bản xem trước</th>
            <th className="px-5 py-3 font-semibold">Tên hồ sơ</th>
            <th className="px-5 py-3 font-semibold">Trạng thái</th>
            <th className="px-5 py-3 font-semibold">Cập nhật</th>
            <th className="px-5 py-3 font-semibold">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {cvs.map((cv) => (
            <CVTableRow
              key={cv.id}
              cv={cv}
              deletingId={deletingId}
              activatingId={activatingId}
              handlers={handlers}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border-t border-slate-200 px-4 text-center dark:border-slate-800">
      <FileText className="mb-4 text-slate-300 dark:text-slate-600" size={44} />
      <p className="font-semibold text-slate-900 dark:text-white">
        Bạn chưa có CV nào.
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Khi bạn tạo CV mới hoặc upload PDF, dữ liệu sẽ được lưu vào database và
        xuất hiện ở đây.
      </p>
    </div>
  );
}

function CVTableRow({
  cv,
  deletingId,
  activatingId,
  handlers,
}: {
  cv: CandidateCV;
  deletingId: number | null;
  activatingId: number | null;
  handlers: CVActionHandlers;
}) {
  return (
    <tr className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <td className="px-5 py-4">
        <CVPreview cv={cv} />
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-950 dark:text-white">
            {getCVTitle(cv)}
          </p>
          {cv.cvType === "uploaded" && (
            <span className="bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:bg-red-950 dark:text-red-300">
              PDF
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {getCVSubtitle(cv)}
        </p>
      </td>

      <td className="px-5 py-4">
        <CVStatusButton
          cv={cv}
          activatingId={activatingId}
          onSetActive={handlers.onSetActive}
        />
      </td>

      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
        {formatDate(cv.updatedAt)}
      </td>

      <td className="px-5 py-4">
        <CVActionButtons
          cv={cv}
          deletingId={deletingId}
          handlers={handlers}
        />
      </td>
    </tr>
  );
}

function CVStatusButton({
  cv,
  activatingId,
  onSetActive,
}: {
  cv: CandidateCV;
  activatingId: number | null;
  onSetActive: (id: number) => void;
}) {
  if (cv.status === "active") {
    return (
      <span className="inline-flex items-center gap-1 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
        <CheckCircle size={13} />
        Đang dùng
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSetActive(cv.id)}
      disabled={activatingId === cv.id}
      className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-300"
    >
      {activatingId === cv.id ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Star size={13} />
      )}
      Đặt chính
    </button>
  );
}

function CVActionButtons({
  cv,
  deletingId,
  handlers,
}: {
  cv: CandidateCV;
  deletingId: number | null;
  handlers: CVActionHandlers;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <button
        type="button"
        onClick={() => handlers.onView(cv)}
        className="p-1.5 transition hover:text-blue-500"
        title="Xem"
      >
        <Eye size={16} />
      </button>

      <button
        type="button"
        onClick={() => handlers.onEdit(cv)}
        className="p-1.5 transition hover:text-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
        title="Sửa"
        disabled={cv.cvType === "uploaded"}
      >
        <Pencil size={16} />
      </button>

      <button
        type="button"
        onClick={() => handlers.onDownload(cv)}
        className="p-1.5 transition hover:text-green-500 disabled:cursor-not-allowed disabled:opacity-40"
        title="Tải xuống"
        disabled={!cv.pdfUrl}
      >
        <Download size={16} />
      </button>

      <button
        type="button"
        onClick={() => handlers.onDelete(cv.id)}
        disabled={deletingId === cv.id}
        className="p-1.5 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        title="Xóa"
      >
        {deletingId === cv.id ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );
}

export default function MyCVs() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cachedCVs = getCachedMyCVs();
  const [cvs, setCvs] = useState<CandidateCV[]>(cachedCVs?.data ?? []);
  const [isLoading, setIsLoading] = useState(!cachedCVs);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const loadCVs = async (forceRefresh = false) => {
    try {
      if (!getCachedMyCVs() || forceRefresh) setIsLoading(true);
      setErrorMessage(null);

      const response = await cvService.getMyCVs(forceRefresh);
      setCvs(response.data);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, "Không thể tải danh sách CV."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCVs();
  }, []);

  const handleUploadPDF = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Vui lòng chọn đúng file PDF.");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);

      const response = await cvService.uploadPdf(file);
      setCvs((currentCVs) => [response.data, ...currentCVs]);
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error, "Không thể upload CV. Vui lòng thử lại."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = (cv: CandidateCV) => {
    if (cv.cvType === "uploaded") {
      const url = getUploadUrl(cv.pdfUrl);

      if (!url) {
        setErrorMessage("CV PDF này chưa có đường dẫn file.");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(`/candidate/cv-builder?id=${cv.id}`);
  };

  const handleEdit = (cv: CandidateCV) => {
    if (cv.cvType === "uploaded") {
      setErrorMessage("CV PDF tải lên không thể sửa bằng trình tạo CV.");
      return;
    }

    navigate(`/candidate/cv-builder?id=${cv.id}`);
  };

  const handleDownload = (cv: CandidateCV) => {
    const url = getUploadUrl(cv.pdfUrl);

    if (!url) {
      setErrorMessage("CV này chưa có file PDF để tải xuống.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (id: number) => {
    const shouldDelete = window.confirm("Bạn chắc chắn muốn xóa CV này?");
    if (!shouldDelete) return;

    try {
      setDeletingId(id);
      setErrorMessage(null);

      await cvService.delete(id);
      setCvs((currentCVs) => currentCVs.filter((cv) => cv.id !== id));
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, "Không thể xóa CV."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      setActivatingId(id);
      setErrorMessage(null);

      const response = await cvService.setStatus(id, "active");
      setCvs((currentCVs) =>
        currentCVs.map((cv) =>
          cv.id === id
            ? response.data
            : { ...cv, status: cv.status === "active" ? "draft" : cv.status },
        ),
      );
    } catch (error: unknown) {
      setErrorMessage(
        getApiErrorMessage(error, "Không thể đặt CV làm hồ sơ chính."),
      );
    } finally {
      setActivatingId(null);
    }
  };

  const handlers: CVActionHandlers = {
    onView: handleView,
    onEdit: handleEdit,
    onDownload: handleDownload,
    onDelete: handleDelete,
    onSetActive: handleSetActive,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onUpload={handleUploadPDF}
        onCreate={() => navigate("/candidate/cv-builder")}
      />

      {errorMessage && <ErrorAlert message={errorMessage} />}

      <CVListPanel
        cvs={cvs}
        isLoading={isLoading}
        deletingId={deletingId}
        activatingId={activatingId}
        handlers={handlers}
        onRefresh={() => loadCVs(true)}
      />
    </div>
  );
}
