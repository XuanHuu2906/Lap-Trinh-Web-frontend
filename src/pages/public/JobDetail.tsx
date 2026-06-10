import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobService } from "@/services/job.service";
import type { Job } from "@/types/job.type";

const formatSalary = (job: Job) => {
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
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

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
        const response = await jobService.getJobById(jobId);
        if (!isMounted) return;
        setJob(response.data);
      } catch {
        if (!isMounted) return;
        setError("Không tìm thấy việc làm hoặc backend chưa sẵn sàng.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        Đang tải chi tiết việc làm...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-gray-700 mb-2">
          Không tìm thấy việc làm
        </p>
        <p className="text-gray-400 mb-6">
          {error || "Vị trí này có thể đã hết hạn hoặc không tồn tại."}
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-5 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          Xem tất cả việc làm
        </button>
      </div>
    );
  }

  const company = getCompany(job);
  const tags = getTags(job);
  const requirements = splitLines(job.requirements);
  const benefits = splitLines(job.benefits);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/jobs")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-700 text-white font-bold text-2xl flex items-center justify-center shrink-0">
                {company.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <p className="text-gray-500 mt-1">
                  {company} · {job.location || "Chưa cập nhật"}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setApplied(true)}
              disabled={applied}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all ${
                applied
                  ? "bg-green-600 cursor-default"
                  : "bg-blue-700 hover:bg-blue-800 active:scale-[0.99]"
              }`}
            >
              {applied ? "Đã ghi nhận nhu cầu ứng tuyển" : "Ứng tuyển ngay"}
            </button>
            {applied && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Chức năng nộp CV sẽ dùng endpoint /api/applications sau khi bạn đăng nhập.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Mô tả công việc
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Yêu cầu ứng viên
            </h2>
            {requirements.length > 0 ? (
              <ul className="space-y-2">
                {requirements.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Chưa cập nhật.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Quyền lợi</h2>
            {benefits.length > 0 ? (
              <ul className="space-y-2">
                {benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Chưa cập nhật.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Thông tin chung</h3>
            <div className="space-y-3">
              {[
                {
                  label: "Mức lương",
                  value: formatSalary(job),
                  color: "text-green-600 font-bold",
                },
                {
                  label: "Địa điểm",
                  value: job.location || "Chưa cập nhật",
                  color: "text-gray-700",
                },
                { label: "Hình thức", value: job.jobType, color: "text-gray-700" },
                {
                  label: "Kinh nghiệm",
                  value: job.experienceLevel || "Chưa cập nhật",
                  color: "text-gray-700",
                },
                {
                  label: "Ngành nghề",
                  value: job.category?.name || "Chưa cập nhật",
                  color: "text-gray-700",
                },
                {
                  label: "Hạn nộp",
                  value: formatDate(job.expiresAt),
                  color: "text-red-500",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex justify-between items-center gap-4 text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-gray-400">{label}</span>
                  <span className={`${color} text-right`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <p className="text-sm font-semibold text-blue-800 mb-1">
              Nhà tuyển dụng
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              {company}
              {job._count ? ` · ${job._count.applications} hồ sơ đã ứng tuyển` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
