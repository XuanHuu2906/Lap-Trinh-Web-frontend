import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  FileText,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  applicationService,
  type CandidateApplication,
} from "@/services/application.service";
import {
  getCandidateDashboardCache,
  setCandidateDashboardCache,
  type CandidateDashboardCacheData,
} from "@/services/candidate-dashboard-cache";
import { cvService } from "@/services/cv.service";
import { jobService } from "@/services/job.service";
import { notificationService } from "@/services/notification.service";
import type { Job } from "@/types/job.type";

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Đang chờ",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  reviewing: {
    label: "Đang xem",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  accepted: {
    label: "Đã tiếp nhận",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  },
  cancelled: {
    label: "Đã hủy",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

const formatDate = (value?: string) => {
  if (!value) return "Không rõ";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
};

const companyName = (job?: Job) =>
  job?.recruiter?.recruiterProfile?.companyName || "Không rõ công ty";

const logoText = (job?: Job) => companyName(job).charAt(0).toUpperCase() || "H";

const formatSalary = (job: Job) => {
  if (job.salaryUnit === "negotiable") return "Thỏa thuận";
  if (!job.salaryMin && !job.salaryMax) return "Thỏa thuận";

  const format = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value);

  if (job.salaryMin && job.salaryMax) {
    return `${format(job.salaryMin)} - ${format(job.salaryMax)}`;
  }

  if (job.salaryMin) return `Từ ${format(job.salaryMin)}`;
  return `Đến ${format(job.salaryMax || 0)}`;
};

export default function Overview() {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [applicationTotal, setApplicationTotal] = useState(0);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [cvCount, setCvCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyDashboardData = (data: CandidateDashboardCacheData) => {
    setApplications(data.applications);
    setApplicationTotal(data.applicationTotal);
    setSuggestedJobs(data.suggestedJobs);
    setCvCount(data.cvCount);
    setUnreadNotificationCount(data.unreadNotificationCount);
  };

  const loadDashboard = async (forceRefresh = false) => {
    const cachedDashboard = forceRefresh ? null : getCandidateDashboardCache();

    if (cachedDashboard) {
      applyDashboardData(cachedDashboard);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [applicationResponse, jobResponse, cvResponse, unreadResponse] =
        await Promise.all([
          applicationService.getMyApplications({ page: 1, limit: 4 }),
          jobService.getFeaturedJobs(3),
          cvService.getMyCVs(),
          notificationService.getUnreadCount(),
        ]);

      const nextCache: CandidateDashboardCacheData = {
        applications: applicationResponse.data,
        applicationTotal:
          applicationResponse.meta?.total ?? applicationResponse.data.length,
        suggestedJobs: jobResponse.data,
        cvCount: cvResponse.data.length,
        unreadNotificationCount: unreadResponse.data.count,
        loadedAt: Date.now(),
      };

      setCandidateDashboardCache(nextCache);
      applyDashboardData(nextCache);
    } catch {
      setErrorMessage("Không thể tải dữ liệu tổng quan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "CV đã tạo",
        value: String(cvCount).padStart(2, "0"),
        note: "Từ API CV",
        action: "Quản lý CV",
        icon: FileText,
        link: "/candidate/my-cvs",
      },
      {
        label: "Công việc đã ứng tuyển",
        value: String(applicationTotal).padStart(2, "0"),
        note: "Từ API ứng tuyển",
        action: "Xem danh sách",
        icon: BriefcaseBusiness,
        link: "/candidate/applied-jobs",
      },
      {
        label: "Phản hồi mới",
        value: String(unreadNotificationCount).padStart(2, "0"),
        note: "Từ API thông báo",
        action: "Xem thông báo",
        icon: Bell,
        link: "/candidate/notifications",
      },
    ],
    [applicationTotal, cvCount, unreadNotificationCount],
  );

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
            Tổng quan ứng viên
          </h1>
          <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
            Theo dõi hồ sơ, tiến độ ứng tuyển và các cơ hội phù hợp với bạn.
          </p>
        </div>

        <a
          href="/candidate/job-search"
          className="flex h-10 items-center gap-2 bg-[#0f1f3d] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2f52] dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          TÌM VIỆC NGAY <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {errorMessage && (
        <div className="mb-5 border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <Icon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
              </div>

              <div className="flex items-end gap-3">
                <span className="text-[36px] font-black leading-none text-slate-900 dark:text-white">
                  {isLoading ? "--" : item.value}
                </span>
                <span className="mb-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {item.note}
                </span>
              </div>

              <a
                href={item.link}
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline dark:text-indigo-400"
              >
                {item.action} <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">
              Hoạt động ứng tuyển gần đây
            </h2>
            <a
              href="/candidate/applied-jobs"
              className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline dark:text-indigo-400"
            >
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {[
                  "Vị trí ứng tuyển",
                  "Công ty",
                  "Ngày nộp",
                  "Trạng thái",
                  "Thao tác",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                    Đang tải dữ liệu ứng tuyển...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                    Bạn chưa có đơn ứng tuyển nào.
                  </td>
                </tr>
              ) : (
                applications.map((row) => {
                  const status =
                    statusLabels[row.status] || statusLabels.pending;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-slate-50 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                        {row.jobPosting?.title || "Không rõ vị trí"}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-300">
                        {companyName(row.jobPosting)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-400">
                        {formatDate(row.appliedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-sm px-2 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="border border-slate-200 px-3 py-1 text-[12px] text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">
              Việc làm phù hợp
            </h2>
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-indigo-400"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div>
            {suggestedJobs.map((job) => (
              <a
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block border-b border-slate-100 px-6 py-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {logoText(job)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-slate-800 dark:text-slate-100">
                      {job.title}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400">
                      {companyName(job)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location || "Không rõ"}
                      </span>
                      <span>{formatSalary(job)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="px-6 py-3 text-center">
            <a
              href="/candidate/job-search"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline dark:text-indigo-400"
            >
              Xem thêm đề xuất <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
