import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteJob,
  getMyJobs,
  updateJobStatus,
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyJobs({
        page: 1,
        limit: 50,
        status: statusFilter,
      });

      setJobs(response.data ?? []);
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
  }, [statusFilter]);

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
          onClick={() => setStatusFilter("")}
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
          onClick={() => setStatusFilter("active")}
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
          onClick={() => setStatusFilter("draft")}
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
          onClick={() => setStatusFilter("closed")}
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
          onChange={(e) => setStatusFilter(e.target.value as JobStatusFilter)}
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
                  className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400"
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
              filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-50 transition-colors hover:bg-slate-50"
                >
                  <td className="px-5 py-5">
                    <p className="text-[14px] font-bold text-slate-900">
                      {job.title}
                    </p>

                    <p className="mt-1 text-[12px] text-slate-400">
                      {job.location || "Chưa cập nhật địa điểm"} •{" "}
                      {job.jobType || "Không rõ hình thức"}
                    </p>
                  </td>

                  <td className="px-5 py-5 text-[13px] text-slate-600">
                    {job.category?.name || "Chưa phân loại"}
                  </td>

                  <td className="px-5 py-5 text-[13px] text-slate-600">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${
                        statusStyle[job.status] ??
                        "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {statusLabel[job.status] ?? job.status}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-[13px] text-slate-500">
                    {formatDate(job.createdAt)}
                  </td>

                  <td className="px-5 py-5 text-[13px] text-slate-500">
                    {formatDate(job.expiresAt)}
                  </td>

                  <td className="px-5 py-5 text-[13px] font-semibold text-slate-700">
                    {job._count?.applications ?? 0}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {job.status !== "active" && job.status !== "deleted" && (
                        <button
                          type="button"
                          onClick={() => void handleUpdateStatus(job.id, "active")}
                          className="h-8 border border-emerald-300 px-3 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Mở
                        </button>
                      )}

                      {job.status === "active" && (
                        <button
                          type="button"
                          onClick={() => void handleUpdateStatus(job.id, "closed")}
                          className="h-8 border border-orange-300 px-3 text-[12px] font-semibold text-orange-700 hover:bg-orange-50"
                        >
                          Đóng
                        </button>
                      )}

                      <Link
                        to="/recruiter/candidates"
                        className="inline-flex h-8 items-center border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Ứng viên
                      </Link>

                      {job.status !== "deleted" && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteJob(job.id)}
                          className="h-8 border border-red-200 px-3 text-[12px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}