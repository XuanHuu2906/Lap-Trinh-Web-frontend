import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  FileText,
  MapPin,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import {
  applicationService,
  type CandidateApplication,
} from "@/services/application.service";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  getCandidateDashboardCache,
  setCandidateDashboardCache,
  type CandidateDashboardCacheData,
} from "@/services/candidate-dashboard-cache";
import { cvService } from "@/services/cv.service";
import { jobService } from "@/services/job.service";
import { notificationService } from "@/services/notification.service";
import type { Job } from "@/types/job.type";

type StatusDisplay = {
  label: string;
  className: string;
};

type StatCardInfo = {
  label: string;
  value: string;
  note: string;
  action: string;
  link: string;
  icon: LucideIcon;
};

const statusDisplays: Record<string, StatusDisplay> = {
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

const emptyDashboardData: CandidateDashboardCacheData = {
  applications: [],
  applicationTotal: 0,
  suggestedJobs: [],
  cvCount: 0,
  unreadNotificationCount: 0,
  loadedAt: 0,
};

function formatDate(value?: string) {
  if (!value) return "Không rõ";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatStatNumber(value: number) {
  return String(value).padStart(2, "0");
}

function getCompanyName(job?: Job) {
  return job?.recruiter?.recruiterProfile?.companyName || "Không rõ công ty";
}

function formatSalary(job: Job) {
  if (job.salaryUnit === "negotiable") {
    return "Thỏa thuận";
  }

  if (!job.salaryMin && !job.salaryMax) {
    return "Thỏa thuận";
  }

  if (job.salaryMin && job.salaryMax) {
    return `${formatNumber(job.salaryMin)} - ${formatNumber(job.salaryMax)}`;
  }

  if (job.salaryMin) {
    return `Từ ${formatNumber(job.salaryMin)}`;
  }

  return `Đến ${formatNumber(job.salaryMax || 0)}`;
}

function getStatusDisplay(status: string) {
  return statusDisplays[status] || statusDisplays.pending;
}

function PageHeader() {
  return (
    <div className="mb-8 flex items-start justify-end gap-4">
      <Link
        to="/candidate/job-search"
        className="flex h-10 shrink-0 items-center gap-2 bg-[#0f1f3d] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2f52] dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        TÌM VIỆC NGAY <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="mb-5 border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}

function StatCard({
  item,
  isLoading,
}: {
  item: StatCardInfo;
  isLoading: boolean;
}) {
  const Icon = item.icon;

  return (
    <div className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
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
      </div>

      <Link
        to={item.link}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:underline dark:text-indigo-400"
      >
        {item.action} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function StatsGrid({
  stats,
  isLoading,
}: {
  stats: StatCardInfo[];
  isLoading: boolean;
}) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <StatCard key={item.label} item={item} isLoading={isLoading} />
      ))}
    </div>
  );
}

function ApplicationsTable({
  applications,
  isLoading,
}: {
  applications: CandidateApplication[];
  isLoading: boolean;
}) {
  return (
    <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">
          Hoạt động ứng tuyển gần đây
        </h2>
        <Link
          to="/candidate/applied-jobs"
          className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline dark:text-indigo-400"
        >
          Xem tất cả <ArrowRight className="h-3 w-3" />
        </Link>
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
            applications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ApplicationRow({
  application,
}: {
  application: CandidateApplication;
}) {
  const status = getStatusDisplay(application.status);

  return (
    <tr className="border-b border-slate-50 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <td className="px-6 py-4 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
        {application.jobPosting?.title || "Không rõ vị trí"}
      </td>
      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-300">
        {application.jobPosting ? (
          <Link
            to={`/candidate/companies/${application.jobPosting.recruiterId}`}
            className="font-semibold transition hover:text-blue-600 hover:underline dark:hover:text-indigo-400"
          >
            {getCompanyName(application.jobPosting)}
          </Link>
        ) : (
          getCompanyName(application.jobPosting)
        )}
      </td>
      <td className="px-6 py-4 text-[13px] text-slate-400">
        {formatDate(application.appliedAt)}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-block rounded-sm px-2 py-1 text-[11px] font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <Link
          to="/candidate/applied-jobs"
          className="inline-block border border-slate-200 px-3 py-1 text-[12px] text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Xem
        </Link>
      </td>
    </tr>
  );
}

function SuggestedJobsPanel({
  jobs,
  isLoading,
  onRefresh,
}: {
  jobs: Job[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">
          Việc làm phù hợp
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          className="text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-indigo-400"
          aria-label="Tải lại việc làm phù hợp"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div>
        {isLoading ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            Đang tải việc làm phù hợp...
          </p>
        ) : jobs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            Chưa có việc làm đề xuất.
          </p>
        ) : (
          jobs.map((job) => <SuggestedJobItem key={job.id} job={job} />)
        )}
      </div>

      <div className="px-6 py-3 text-center">
        <Link
          to="/candidate/job-search"
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline dark:text-indigo-400"
        >
          Xem thêm đề xuất <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function SuggestedJobItem({ job }: { job: Job }) {
  return (
    <div className="border-b border-slate-100 px-6 py-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <div className="flex items-start gap-3">
        <Link
          to={`/candidate/companies/${job.recruiterId}`}
          title={`Xem hồ sơ ${getCompanyName(job)}`}
          className="rounded-xl shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-blue-400 dark:ring-slate-700"
        >
          <CompanyLogo
            name={getCompanyName(job)}
            logoUrl={job.recruiter?.recruiterProfile?.logoUrl}
            className="h-10 w-10 rounded-xl text-sm"
            imageClassName="p-1"
          />
        </Link>

        <div className="min-w-0">
          <Link
            to={`/candidate/jobs/${job.id}`}
            className="block truncate text-[13px] font-bold text-slate-800 transition hover:text-blue-600 dark:text-slate-100 dark:hover:text-indigo-400"
          >
            {job.title}
          </Link>
          <Link
            to={`/candidate/companies/${job.recruiterId}`}
            className="text-[12px] text-slate-500 transition hover:text-blue-600 hover:underline dark:text-slate-400 dark:hover:text-indigo-400"
          >
            {getCompanyName(job)}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location || "Không rõ"}
            </span>
            <span>{formatSalary(job)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const [dashboardData, setDashboardData] =
    useState<CandidateDashboardCacheData>(emptyDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = async (forceRefresh = false) => {
    const cachedDashboard = forceRefresh ? null : getCandidateDashboardCache();

    if (cachedDashboard) {
      setDashboardData(cachedDashboard);
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

      const nextDashboardData: CandidateDashboardCacheData = {
        applications: applicationResponse.data,
        applicationTotal:
          applicationResponse.meta?.total ?? applicationResponse.data.length,
        suggestedJobs: jobResponse.data,
        cvCount: cvResponse.data.length,
        unreadNotificationCount: unreadResponse.data.count,
        loadedAt: Date.now(),
      };

      setCandidateDashboardCache(nextDashboardData);
      setDashboardData(nextDashboardData);
    } catch {
      setErrorMessage("Không thể tải dữ liệu tổng quan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats: StatCardInfo[] = useMemo(
    () => [
      {
        label: "CV đã tạo",
        value: formatStatNumber(dashboardData.cvCount),
        note: "Từ API CV",
        action: "Quản lý CV",
        icon: FileText,
        link: "/candidate/my-cvs",
      },
      {
        label: "Công việc đã ứng tuyển",
        value: formatStatNumber(dashboardData.applicationTotal),
        note: "Từ API ứng tuyển",
        action: "Xem danh sách",
        icon: BriefcaseBusiness,
        link: "/candidate/applied-jobs",
      },
      {
        label: "Phản hồi mới",
        value: formatStatNumber(dashboardData.unreadNotificationCount),
        note: "Từ API thông báo",
        action: "Xem thông báo",
        icon: Bell,
        link: "/candidate/notifications",
      },
    ],
    [
      dashboardData.applicationTotal,
      dashboardData.cvCount,
      dashboardData.unreadNotificationCount,
    ],
  );

  return (
    <div>
      <PageHeader />

      {errorMessage && <ErrorAlert message={errorMessage} />}

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ApplicationsTable
          applications={dashboardData.applications}
          isLoading={isLoading}
        />

        <SuggestedJobsPanel
          jobs={dashboardData.suggestedJobs}
          isLoading={isLoading}
          onRefresh={() => loadDashboard(true)}
        />
      </div>
    </div>
  );
}
