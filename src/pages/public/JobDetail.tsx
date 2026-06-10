import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { jobService } from "@/services/job.service";
import {
  applyToJobWithCandidateCv,
  savePendingApplyJob,
} from "@/services/job-application-flow";
import type { Job } from "@/types/job.type";

const formatSalary = (job: Job) => {
  if (job.salaryUnit === "negotiable") return "Thỏa thuận";
  if (!job.salaryMin && !job.salaryMax) return "Thỏa thuận";

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  if (job.salaryMin && job.salaryMax) {
    return `${formatter.format(Number(job.salaryMin))} - ${formatter.format(Number(job.salaryMax))}`;
  }

  if (job.salaryMin) return `Từ ${formatter.format(Number(job.salaryMin))}`;
  return `Đến ${formatter.format(Number(job.salaryMax))}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Không giới hạn";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

const getCompany = (job: Job) =>
  job.recruiter?.recruiterProfile?.companyName || "Nhà tuyển dụng";

const getTags = (job: Job) =>
  job.skills?.map((item) => item.skill.name).filter(Boolean) ?? [];

const splitLines = (value?: string | null) =>
  value
    ?.split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const isCandidateLayout = location.pathname.startsWith("/candidate");
  const backPath = isCandidateLayout ? "/candidate/job-search" : "/jobs";

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      const jobId = Number(id);
      if (!Number.isInteger(jobId) || jobId <= 0) {
        setError("ID việc làm không hợp lệ.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await jobService.getJobById(jobId);
        if (isMounted) setJob(response.data);
      } catch {
        if (isMounted) {
          setError("Không tìm thấy việc làm hoặc backend chưa sẵn sàng.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApply = async () => {
    if (!job) return;

    if (!isAuthenticated || !user) {
      savePendingApplyJob(job.id);
      navigate("/login");
      return;
    }

    if (user.role !== "candidate") {
      setApplyMessage("Chỉ tài khoản ứng viên mới có thể ứng tuyển.");
      return;
    }

    try {
      setIsApplying(true);
      setApplyMessage(null);
      await applyToJobWithCandidateCv(job.id);
      setApplyMessage("Ứng tuyển thành công. Đang chuyển đến mục Đã ứng tuyển...");
      navigate("/candidate/applied-jobs");
    } catch (applyError: any) {
      const message =
        applyError?.response?.data?.message ||
        "Không thể ứng tuyển vị trí này.";
      setApplyMessage(message);
    } finally {
      setIsApplying(false);
    }
  };

  const pageClass = isCandidateLayout
    ? "mx-auto max-w-6xl"
    : "mx-auto max-w-5xl px-4 py-10";

  const cardClass = isCandidateLayout
    ? "border border-slate-800 bg-slate-900 p-6"
    : "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm";

  const mutedText = isCandidateLayout ? "text-slate-400" : "text-gray-500";
  const headingText = isCandidateLayout ? "text-white" : "text-gray-900";

  if (isLoading) {
    return (
      <div className={`${pageClass} flex min-h-80 items-center justify-center gap-2 ${mutedText}`}>
        <Loader2 className="animate-spin" size={20} />
        Đang tải chi tiết việc làm...
      </div>
    );
  }

  if (!job) {
    return (
      <div className={`${pageClass} py-20 text-center`}>
        <BriefcaseBusiness className="mx-auto mb-4 text-slate-500" size={46} />
        <p className={`mb-2 text-2xl font-bold ${headingText}`}>
          Không tìm thấy việc làm
        </p>
        <p className={`mb-6 ${mutedText}`}>
          {error || "Vị trí này có thể đã hết hạn hoặc không tồn tại."}
        </p>
        <button
          onClick={() => navigate(backPath)}
          className="bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const company = getCompany(job);
  const tags = getTags(job);
  const requirements = splitLines(job.requirements);
  const benefits = splitLines(job.benefits);

  return (
    <div className={pageClass}>
      <button
        onClick={() => navigate(backPath)}
        className={`mb-6 inline-flex items-center gap-2 text-sm transition hover:text-blue-400 ${mutedText}`}
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={cardClass}>
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-blue-600 text-2xl font-bold text-white">
                {company.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${headingText}`}>
                  {job.title}
                </h1>
                <p className={`mt-1 ${mutedText}`}>
                  {company} / {job.location || "Chưa cập nhật"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-950/60 px-2.5 py-1 text-xs font-medium text-blue-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex w-full items-center justify-center gap-2 bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isApplying ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {isAuthenticated ? "Ứng tuyển ngay" : "Đăng nhập để ứng tuyển"}
            </button>

            {applyMessage && (
              <p className="mt-3 text-center text-sm text-emerald-400">
                {applyMessage}
              </p>
            )}
          </section>

          <section className={cardClass}>
            <h2 className={`mb-3 text-lg font-bold ${headingText}`}>
              Mô tả công việc
            </h2>
            <p className={`whitespace-pre-line text-sm leading-7 ${mutedText}`}>
              {job.description}
            </p>
          </section>

          <section className={cardClass}>
            <h2 className={`mb-3 text-lg font-bold ${headingText}`}>
              Yêu cầu ứng viên
            </h2>
            {requirements.length > 0 ? (
              <ul className="space-y-2">
                {requirements.map((item) => (
                  <li key={item} className={`flex gap-2 text-sm ${mutedText}`}>
                    <span className="text-blue-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${mutedText}`}>Chưa cập nhật.</p>
            )}
          </section>

          <section className={cardClass}>
            <h2 className={`mb-3 text-lg font-bold ${headingText}`}>Quyền lợi</h2>
            {benefits.length > 0 ? (
              <ul className="space-y-2">
                {benefits.map((item) => (
                  <li key={item} className={`flex gap-2 text-sm ${mutedText}`}>
                    <span className="text-green-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${mutedText}`}>Chưa cập nhật.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className={cardClass}>
            <h3 className={`mb-4 font-bold ${headingText}`}>Thông tin chung</h3>
            <div className="space-y-3">
              {[
                { label: "Mức lương", value: formatSalary(job) },
                { label: "Địa điểm", value: job.location || "Chưa cập nhật" },
                { label: "Hình thức", value: job.jobType },
                {
                  label: "Kinh nghiệm",
                  value: job.experienceLevel || "Chưa cập nhật",
                },
                {
                  label: "Ngành nghề",
                  value: job.category?.name || "Chưa cập nhật",
                },
                { label: "Hạn nộp", value: formatDate(job.expiresAt) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2 text-sm last:border-0 last:pb-0"
                >
                  <span className={mutedText}>{item.label}</span>
                  <span className={`text-right ${headingText}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section
            className={
              isCandidateLayout
                ? "border border-blue-900/50 bg-blue-950/40 p-5"
                : "rounded-2xl border border-blue-100 bg-blue-50 p-5"
            }
          >
            <p className="mb-1 text-sm font-semibold text-blue-400">
              Nhà tuyển dụng
            </p>
            <p className="text-xs leading-relaxed text-blue-300">
              {company}
              {job._count
                ? ` / ${job._count.applications} hồ sơ đã ứng tuyển`
                : ""}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
