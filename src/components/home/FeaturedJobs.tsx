import { ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import type { Job } from "@/types/job.type";
import { formatJobTypeLabel } from "@/utils/job-type-labels";

interface FeaturedJobsProps {
  jobs: Job[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onViewAll?: () => void;
  onSelectJob?: (job: Job) => void;
}

const experienceLabels: Record<string, string> = {
  no_exp: "Không yêu cầu kinh nghiệm",
  junior: "Junior",
  mid: "Middle",
  senior: "Senior",
  manager: "Quản lý",
};

function getCompanyName(job: Job) {
  return job.recruiter?.recruiterProfile?.companyName || "Đang cập nhật";
}

function getLogoText(job: Job) {
  return getCompanyName(job).trim().charAt(0).toUpperCase() || "J";
}

function formatMoney(value?: number | null) {
  if (!value) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatCount(value?: number) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function getApplicationCount(job: Job) {
  return job._count?.applications ?? 0;
}

function formatSalary(job: Job) {
  if (job.salaryUnit === "negotiable") return "Thương lượng";
  if (!job.salaryMin && !job.salaryMax) return "Thương lượng";

  const unit =
    job.salaryUnit === "year"
      ? "/năm"
      : job.salaryUnit === "hour"
        ? "/giờ"
        : "/tháng";

  if (job.salaryMin && job.salaryMax) {
    return `${formatMoney(job.salaryMin)} - ${formatMoney(job.salaryMax)} ${unit}`;
  }

  if (job.salaryMin) return `Từ ${formatMoney(job.salaryMin)} ${unit}`;
  return `Đến ${formatMoney(job.salaryMax)} ${unit}`;
}

function getTags(job: Job) {
  return [
    formatJobTypeLabel(job.jobType),
    job.experienceLevel
      ? experienceLabels[job.experienceLevel] || job.experienceLevel
      : null,
    job.category?.name,
  ].filter((tag): tag is string => Boolean(tag));
}

function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full bg-gray-100 px-2.5 text-xs font-medium text-gray-700">
      {children}
    </span>
  );
}

function JobCard({
  job,
  onSelect,
}: {
  job: Job;
  onSelect?: (job: Job) => void;
}) {
  const tags = getTags(job);
  const applicationCount = getApplicationCount(job);

  return (
    <article
      onClick={() => onSelect?.(job)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
    >
      <div className="h-1 bg-linear-to-r from-blue-600 via-cyan-400 to-green-400" />
      <div className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20">
            {getLogoText(job)}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-blue-700">
              {job.title}
            </h3>
            <p className="mt-1 truncate text-xs text-gray-500">
              {getCompanyName(job)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex min-h-6 flex-wrap gap-1.5">
          {tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag}>{tag}</TagBadge>
          ))}
          <span className="inline-flex min-h-6 items-center rounded-full bg-blue-50 px-2.5 text-xs font-semibold text-blue-700">
            {applicationCount > 0
              ? `${formatCount(applicationCount)} ứng tuyển`
              : "Mới đăng"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {job.location || "Không rõ địa điểm"}
            </span>
          </span>
          <span className="shrink-0 font-semibold text-green-600">
            {formatSalary(job)}
          </span>
        </div>
      </div>
    </article>
  );
}

function FeaturedJobSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="h-11 w-11 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <div className="h-6 w-24 rounded-full bg-gray-100" />
        <div className="h-6 w-20 rounded-full bg-gray-100" />
      </div>
      <div className="border-t border-gray-100 pt-3">
        <div className="h-4 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function FeaturedJobs({
  jobs,
  isLoading = false,
  errorMessage,
  onViewAll,
  onSelectJob,
}: FeaturedJobsProps) {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Cơ hội đang tuyển
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              Việc làm nổi bật
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Những vị trí mới, rõ thông tin và dễ ứng tuyển trong hôm nay
            </p>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 rounded-lg p-2 text-sm font-semibold text-blue-700 transition-all hover:scale-105 hover:bg-blue-50"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <FeaturedJobSkeleton key={index} />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-center">
            <BriefcaseBusiness className="mb-3 h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-center">
            <BriefcaseBusiness className="mb-3 h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Chưa có việc làm nổi bật.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
