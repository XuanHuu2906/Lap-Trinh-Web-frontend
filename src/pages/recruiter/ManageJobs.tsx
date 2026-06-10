import { useEffect, useMemo, useState } from "react";
import {
  deleteJob,
  getMyJobs,
  updateJobStatus,
  type JobStatus,
  type PaginationMeta,
  type RecruiterJob,
} from "../../services/recruiter.service";

const statusLabel: Record<JobStatus, string> = {
  active: "ĐANG MỞ",
  closed: "ĐÃ ĐÓNG",
  draft: "NHÁP",
  deleted: "ĐÃ XÓA",
};

const statusStyle: Record<JobStatus, string> = {
  active: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-600",
  draft: "bg-yellow-100 text-yellow-700",
  deleted: "bg-slate-100 text-slate-500",
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("vi-VN");
};

export function ManageJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return jobs;
    return jobs.filter((job) => job.title.toLowerCase().includes(keyword));
  }, [jobs, search]);

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyJobs({
        page,
        limit: 10,
        status: statusFilter,
      });
      setJobs(response.data);
      setMeta(
        response.meta ?? {
          total: response.data.length,
          page,
          limit: 10,
          totalPages: 1,
        },
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách tin tuyển dụng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleToggleStatus = async (job: RecruiterJob) => {
    const nextStatus = job.status === "active" ? "closed" : "active";
    setMessage("");
    setError("");

    try {
      await updateJobStatus(job.id, nextStatus);
      setMessage("Cập nhật trạng thái tin thành công");
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không cập nhật được trạng thái",
      );
    }
  };

  const handleDelete = async (job: RecruiterJob) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa tin: ${job.title}?`);
    if (!ok) return;

    setMessage("");
    setError("");

    try {
      await deleteJob(job.id);
      setMessage("Xóa tin tuyển dụng thành công");
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không xóa được tin tuyển dụng",
      );
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
            Quản lý tin đăng
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Dữ liệu được lấy từ API /api/jobs/my của recruiter.
          </p>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`mb-4 border px-4 py-3 text-[13px] ${error ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}
        >
          {error || message}
        </div>
      )}

      <div className="bg-white border border-slate-200 p-5 mb-6">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Bộ lọc tìm kiếm
        </p>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-50">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tìm kiếm tin
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              className="w-full h-10 px-4 border border-slate-200 text-[13px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700"
            />
          </div>

          <div className="min-w-50">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value as JobStatus | "");
              }}
              className="w-full h-10 px-4 border border-slate-200 text-[13px] outline-none text-slate-600 bg-white cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang mở</option>
              <option value="closed">Đã đóng</option>
              <option value="draft">Nháp</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPage(1);
            }}
            className="h-10 px-4 border border-slate-200 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            XÓA LỌC
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                "Tiêu đề công việc",
                "Ngày đăng",
                "Hạn nộp",
                "Ứng viên",
                "Trạng thái",
                "Hành động",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-[13px] text-slate-400"
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-[13px] text-slate-400"
                >
                  Chưa có tin tuyển dụng nào.
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-5">
                    <p className="text-[14px] font-bold text-slate-900">
                      {job.title}
                    </p>
                    <p className="text-[12px] text-slate-400 mt-1">
                      {job.location || "Chưa cập nhật địa điểm"}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-[13px] text-slate-500">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-6 py-5 text-[13px] text-slate-500">
                    {formatDate(job.expiresAt)}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex w-9 h-9 rounded-full bg-blue-500 text-white text-[12px] font-bold items-center justify-center">
                      {job._count?.applications ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-1 rounded-sm tracking-wide ${statusStyle[job.status] ?? "bg-slate-100 text-slate-500"}`}
                    >
                      {statusLabel[job.status] ?? job.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {(job.status === "active" || job.status === "closed") && (
                        <button
                          onClick={() => void handleToggleStatus(job)}
                          className="h-8 px-3 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          {job.status === "active" ? "Đóng" : "Mở"}
                        </button>
                      )}
                      <button
                        onClick={() => void handleDelete(job)}
                        className="h-8 px-3 border border-red-200 text-[12px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-[13px] text-slate-400">
            Tổng: {meta.total} kết quả
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 border border-slate-200 text-[12px] disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-[13px] text-slate-500">
              Trang {meta.page} / {meta.totalPages || 1}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 border border-slate-200 text-[12px] disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
