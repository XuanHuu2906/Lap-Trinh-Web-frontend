import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteJob,
  getMyJobDetail,
  updateJobStatus,
  type RecruiterJob,
} from "../../services/recruiter.service";
import {
  getJobStatusLabel,
  getJobStatusStyle,
  isActiveJobStatus,
  isDeletedJobStatus,
  isPendingReviewJobStatus,
  JOB_STATUS,
} from "../../utils/job-status";

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

const jobTypeLabels: Record<string, string> = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  remote: "Làm việc từ xa",
  hybrid: "Hybrid",
  freelance: "Freelance",
  internship: "Thực tập",
};

const experienceLevelLabels: Record<string, string> = {
  entry: "Mới tốt nghiệp",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  director: "Director",
};

const formatSalary = (
  min?: string | number | null,
  max?: string | number | null,
  unit?: string | null,
) => {
  const minNumber = min === null || min === undefined || min === "" ? null : Number(min);
  const maxNumber = max === null || max === undefined || max === "" ? null : Number(max);

  if (!minNumber && !maxNumber) return "Thỏa thuận";

  const formatter = new Intl.NumberFormat("vi-VN");
  const unitLabel = unit === "USD" ? " USD" : " VND";

  if (minNumber && maxNumber) {
    return `${formatter.format(minNumber)} - ${formatter.format(maxNumber)}${unitLabel}`;
  }

  if (minNumber) return `Từ ${formatter.format(minNumber)}${unitLabel}`;

  return `Đến ${formatter.format(maxNumber ?? 0)}${unitLabel}`;
};

export function RecruiterJobDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const jobId = id ? Number(id) : NaN;

  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJob = async () => {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      setError("ID tin tuyển dụng không hợp lệ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getMyJobDetail(jobId);
      setJob(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được tin tuyển dụng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleStatusChange = async (
    nextStatus: typeof JOB_STATUS.PENDING_REVIEW | typeof JOB_STATUS.CLOSED,
  ) => {
    if (!job) return;

    setError("");
    setMessage("");

    try {
      const response = await updateJobStatus(job.id, nextStatus);
      setJob(response.data);
      setMessage("Cập nhật trạng thái tin tuyển dụng thành công");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không cập nhật được trạng thái tin tuyển dụng",
      );
    }
  };

  const handleDelete = async () => {
    if (!job) return;

    const confirmed = window.confirm(
      job._count?.applications
        ? "Tin này đã có ứng viên. Bạn có chắc muốn xóa không?"
        : "Bạn có chắc muốn xóa tin tuyển dụng này không?",
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await deleteJob(job.id);
      navigate("/recruiter/manage-jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xóa được tin tuyển dụng");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/recruiter/manage-jobs"
            className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            ← Quay lại quản lý tin
          </Link>

          <h1 className="mt-3 text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
            {job?.title || "Chi tiết tin tuyển dụng"}
          </h1>

          <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-300">
            Xem đầy đủ nội dung tin trước khi chỉnh sửa hoặc xử lý ứng viên.
          </p>
        </div>

        {job && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/recruiter/manage-jobs/${job.id}/edit`}
              className="inline-flex h-10 items-center justify-center bg-[#0f1f3d] px-4 text-[13px] font-bold text-white hover:bg-[#1a2f52]"
            >
              Sửa tin
            </Link>

            <Link
              to={`/recruiter/candidates?jobId=${job.id}`}
              className="inline-flex h-10 items-center justify-center border border-slate-300 px-4 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Ứng viên
            </Link>
          </div>
        )}
      </div>

      {(message || error) && (
        <div
          className={`mb-4 border px-4 py-3 text-[13px] ${
            error
              ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              : "border-green-200 bg-green-50 text-green-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          }`}
        >
          {error || message}
        </div>
      )}

      {loading && (
        <div className="border border-slate-200 bg-white px-6 py-10 text-center text-[13px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-500">
          Đang tải tin tuyển dụng...
        </div>
      )}

      {!loading && job && (
        <div className="grid grid-cols-[1fr_300px] items-start gap-6">
          <div className="space-y-5">
            <section className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="mb-4 text-[15px] font-bold text-slate-900 dark:text-slate-50">
                Mô tả công việc
              </h2>
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-600 dark:text-slate-300">
                {job.description}
              </p>
            </section>

            <section className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="mb-4 text-[15px] font-bold text-slate-900 dark:text-slate-50">
                Yêu cầu ứng viên
              </h2>
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-600 dark:text-slate-300">
                {job.requirements || "Chưa cập nhật yêu cầu."}
              </p>
            </section>

            <section className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="mb-4 text-[15px] font-bold text-slate-900 dark:text-slate-50">
                Quyền lợi
              </h2>
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-600 dark:text-slate-300">
                {job.benefits || "Chưa cập nhật quyền lợi."}
              </p>
            </section>
          </div>

          <aside className="sticky top-6 space-y-4 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Trạng thái
              </p>
              <span
                className={`mt-2 inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${getJobStatusStyle(job.status)}`}
              >
                {getJobStatusLabel(job.status)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Loại công việc
              </p>
              <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                {jobTypeLabels[job.jobType] || job.jobType}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Danh mục
                </p>
                <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  {job.category?.name || "Chưa phân loại"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Ứng viên
                </p>
                <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  {job._count?.applications ?? 0}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Kinh nghiệm
              </p>
              <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                {job.experienceLevel
                  ? experienceLevelLabels[job.experienceLevel] || job.experienceLevel
                  : "Không yêu cầu"}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Mức lương
              </p>
              <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Địa điểm
              </p>
              <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                {job.location || "Chưa cập nhật"}
              </p>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Kỹ năng
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <span
                      key={s.skill.id}
                      className="inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {s.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Ngày đăng
                </p>
                <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(job.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Hết hạn
                </p>
                <p className="mt-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(job.expiresAt)}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {!isActiveJobStatus(job.status) &&
                !isPendingReviewJobStatus(job.status) &&
                !isDeletedJobStatus(job.status) && (
                <button
                  type="button"
                  onClick={() => void handleStatusChange(JOB_STATUS.PENDING_REVIEW)}
                  className="h-9 w-full border border-emerald-300 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                >
                  Gửi duyệt
                </button>
              )}

              {isActiveJobStatus(job.status) && (
                <button
                  type="button"
                  onClick={() => void handleStatusChange(JOB_STATUS.CLOSED)}
                  className="h-9 w-full border border-orange-300 text-[12px] font-semibold text-orange-700 hover:bg-orange-50 dark:border-orange-900/60 dark:text-orange-300 dark:hover:bg-orange-950/30"
                >
                  Đóng tin
                </button>
              )}

              {!isDeletedJobStatus(job.status) && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="h-9 w-full border border-red-200 text-[12px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  Xóa tin
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
