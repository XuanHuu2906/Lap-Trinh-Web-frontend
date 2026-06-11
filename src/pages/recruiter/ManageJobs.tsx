import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlock,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  deleteJob,
  getMyJobs,
  updateJobStatus,
  type PaginationMeta,
  type RecruiterJob,
} from "../../services/recruiter.service";

type JobStatusFilter = "" | "active" | "draft" | "closed";

const statusLabel: Record<string, string> = {
  active: "Đang mở",
  draft: "Bản nháp",
  closed: "Đã đóng",
  deleted: "Đã xóa",
};

const statusStyle: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  closed: "border-red-200 bg-red-50 text-red-600",
  deleted: "border-slate-200 bg-slate-100 text-slate-500",
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatSalary = (
  min?: string | number | null,
  max?: string | number | null,
) => {
  const minNumber = min === null || min === undefined || min === "" ? null : Number(min);
  const maxNumber = max === null || max === undefined || max === "" ? null : Number(max);

  if (!minNumber && !maxNumber) return "Thỏa thuận";

  const formatter = new Intl.NumberFormat("vi-VN");

  if (minNumber && maxNumber) {
    return `${formatter.format(minNumber)} - ${formatter.format(maxNumber)} VND`;
  }

  if (minNumber) {
    return `Từ ${formatter.format(minNumber)} VND`;
  }

  return `Đến ${formatter.format(maxNumber ?? 0)} VND`;
};

export function ManageJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [openMenuJobId, setOpenMenuJobId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyJobs({
        page,
        limit: 10,
        status: statusFilter,
      });

      setJobs(response.data ?? []);
      setMeta(response.meta ?? null);
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
  }, [statusFilter, page]);

  useEffect(() => {
    const closeMenu = () => setOpenMenuJobId(null);
    const closeMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  const handleStatusFilterChange = (nextStatus: JobStatusFilter) => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return jobs;

    return jobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(keyword) ||
        job.location?.toLowerCase().includes(keyword) ||
        job.category?.name?.toLowerCase().includes(keyword)
      );
    });
  }, [jobs, search]);

  const totalJobs = jobs.filter((job) => job.status !== "deleted").length;
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const draftJobs = jobs.filter((job) => job.status === "draft").length;
  const closedJobs = jobs.filter((job) => job.status === "closed").length;

  const handleUpdateStatus = async (
    jobId: number,
    nextStatus: "active" | "closed",
  ) => {
    setError("");
    setMessage("");

    try {
      await updateJobStatus(jobId, nextStatus);
      setMessage("Cập nhật trạng thái tin tuyển dụng thành công");
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không cập nhật được trạng thái tin tuyển dụng",
      );
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa tin tuyển dụng này không?",
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteJob(jobId);
      setMessage("Xóa tin tuyển dụng thành công");
      await loadJobs();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không xóa được tin tuyển dụng",
      );
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
            Quản lý tin đăng
          </h1>

          <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-300">
            Quản lý các tin tuyển dụng đã đăng, trạng thái hiển thị và số lượng ứng viên.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="inline-flex h-10 items-center justify-center bg-[#0f1f3d] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2f52]"
        >
          + Đăng tin mới
        </Link>
      </div>

      {(message || error) && (
        <div
          className={`mb-4 border px-4 py-3 text-[13px] ${
            error
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => handleStatusFilterChange("")}
          className={`border p-4 text-left transition-colors ${
            statusFilter === ""
              ? "border-indigo-300 bg-indigo-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Tổng tin
          </p>
          <p className="mt-2 text-[28px] font-black text-slate-900">
            {totalJobs}
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange("active")}
          className={`border p-4 text-left transition-colors ${
            statusFilter === "active"
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Đang mở
          </p>
          <p className="mt-2 text-[28px] font-black text-slate-900">
            {activeJobs}
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange("draft")}
          className={`border p-4 text-left transition-colors ${
            statusFilter === "draft"
              ? "border-slate-300 bg-slate-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Bản nháp
          </p>
          <p className="mt-2 text-[28px] font-black text-slate-900">
            {draftJobs}
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleStatusFilterChange("closed")}
          className={`border p-4 text-left transition-colors ${
            statusFilter === "closed"
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Đã đóng
          </p>
          <p className="mt-2 text-[28px] font-black text-slate-900">
            {closedJobs}
          </p>
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3 border border-slate-200 bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tiêu đề, địa điểm hoặc danh mục..."
          className="h-10 flex-1 border border-slate-200 px-4 text-[13px] text-slate-700 outline-none focus:border-slate-400"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            handleStatusFilterChange(e.target.value as JobStatusFilter)
          }
          className="h-10 w-48 border border-slate-200 bg-white px-4 text-[13px] text-slate-600 outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang mở</option>
          <option value="draft">Bản nháp</option>
          <option value="closed">Đã đóng</option>
        </select>

        <button
          type="button"
          onClick={() => void loadJobs()}
          disabled={loading}
          className="h-10 border border-slate-300 px-5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Làm mới
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {[
                "Tin tuyển dụng",
                "Danh mục",
                "Mức lương",
                "Trạng thái",
                "Ngày đăng",
                "Hết hạn",
                "Ứng viên",
                "Thao tác",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-left text-[12px] font-semibold text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-[13px] text-slate-400"
                >
                  Đang tải danh sách tin tuyển dụng...
                </td>
              </tr>
            )}

            {!loading && filteredJobs.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-[13px] text-slate-400"
                >
                  Chưa có tin tuyển dụng nào phù hợp.
                </td>
              </tr>
            )}

            {!loading &&
              filteredJobs.map((job) => {
                const applicationCount = job._count?.applications ?? 0;
                const menuOpen = openMenuJobId === job.id;

                return (
                  <tr
                    key={job.id}
                    className="border-b border-slate-50 transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-[14px] font-bold text-slate-900">
                        {job.title}
                      </p>

                      <p className="mt-1 text-[12px] text-slate-400">
                        {job.location || "Chưa cập nhật địa điểm"} •{" "}
                        {job.jobType || "Không rõ hình thức"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[13px] text-slate-600">
                      {job.category?.name || "Chưa phân loại"}
                    </td>

                    <td className="px-5 py-4 text-[13px] text-slate-600">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${
                          statusStyle[job.status] ??
                          "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {statusLabel[job.status] ?? job.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[13px] text-slate-500">
                      {formatDate(job.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-[13px] text-slate-500">
                      {formatDate(job.expiresAt)}
                    </td>

                    <td className="px-5 py-4 text-[13px] font-semibold text-slate-700">
                      <Link
                        to={`/recruiter/candidates?jobId=${job.id}`}
                        className="hover:text-indigo-600 hover:underline"
                      >
                        {applicationCount} ứng viên
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/recruiter/manage-jobs/${job.id}`}
                          className="inline-flex h-8 items-center gap-1.5 border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem
                        </Link>

                        <Link
                          to={`/recruiter/candidates?jobId=${job.id}`}
                          className="inline-flex h-8 items-center gap-1.5 border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          <UsersRound className="h-3.5 w-3.5" />
                          Ứng viên
                        </Link>

                        <div
                          className="relative"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuJobId(menuOpen ? null : job.id)
                            }
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            className="inline-flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {menuOpen && (
                            <div
                              role="menu"
                              className="absolute right-0 top-9 z-20 w-40 border border-slate-200 bg-white py-1 shadow-lg"
                            >
                              <Link
                                to={`/recruiter/manage-jobs/${job.id}/edit`}
                                role="menuitem"
                                className="flex h-9 items-center gap-2 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Sửa tin
                              </Link>

                              {job.status !== "active" &&
                                job.status !== "deleted" && (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setOpenMenuJobId(null);
                                      void handleUpdateStatus(job.id, "active");
                                    }}
                                    className="flex h-9 w-full items-center gap-2 px-3 text-left text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <Unlock className="h-3.5 w-3.5" />
                                    Mở tin
                                  </button>
                                )}

                              {job.status === "active" && (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenMenuJobId(null);
                                    void handleUpdateStatus(job.id, "closed");
                                  }}
                                  className="flex h-9 w-full items-center gap-2 px-3 text-left text-[12px] font-semibold text-orange-700 hover:bg-orange-50"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                  Đóng tin
                                </button>
                              )}

                              {job.status !== "deleted" && (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenMenuJobId(null);
                                    void handleDeleteJob(job.id);
                                  }}
                                  className="flex h-9 w-full items-center gap-2 px-3 text-left text-[12px] font-semibold text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Xóa tin
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border border-slate-200 bg-white px-4 py-3">
          <p className="text-[13px] text-slate-500">
            Trang {meta.page}/{meta.totalPages} • {meta.total} tin
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="h-9 border border-slate-300 px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Trước
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(meta.totalPages, current + 1),
                )
              }
              disabled={page >= meta.totalPages || loading}
              className="h-9 border border-slate-300 px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
