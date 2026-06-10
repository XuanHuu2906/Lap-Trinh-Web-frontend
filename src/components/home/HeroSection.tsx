import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { WORK_LOCATION_OPTIONS } from "../../constants/locations";
import type { SystemStats } from "../../services/home.service";
import type { Job } from "../../types/job.type";

interface HeroSectionProps {
  onSearch?: (keyword: string, location: string) => void;
  featuredJobs?: Job[];
  isLoadingFeaturedJobs?: boolean;
  systemStats?: SystemStats | null;
}

const POPULAR_SEARCHES = [
  "Frontend Developer",
  "Marketing Manager",
  "Data Analyst",
  "Product Manager",
];

function getCompanyName(job?: Job) {
  return job?.recruiter?.recruiterProfile?.companyName || "Đang cập nhật";
}

function getLogoText(job?: Job) {
  return getCompanyName(job).trim().charAt(0).toUpperCase() || "H";
}

function getLogoUrl(job?: Job) {
  const logoUrl = job?.recruiter?.recruiterProfile?.logoUrl;
  if (!logoUrl) return null;
  if (logoUrl.startsWith("http") || logoUrl.startsWith("/")) return logoUrl;
  return `/${logoUrl.replaceAll("\\", "/")}`;
}

function formatMoney(value?: number | null) {
  if (!value) return "";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatCount(value?: number) {
  if (value === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatSalary(job?: Job) {
  if (!job || job.salaryUnit === "negotiable") return "Thương lượng";
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

function CompanyLogo({ job }: { job?: Job }) {
  const logoUrl = getLogoUrl(job);

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span>{getLogoText(job)}</span>
      )}
    </div>
  );
}

function JobPreviewCard({ job, featured = false }: { job: Job; featured?: boolean }) {
  return (
    <article
      className={`rounded-2xl ${
        featured ? "bg-white p-5 text-slate-950" : "bg-white/10 p-4 text-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo job={job} />
        <div className="min-w-0 flex-1">
          <h3
            className={`line-clamp-1 text-sm font-bold ${
              featured ? "text-slate-950" : "text-white"
            }`}
          >
            {job.title}
          </h3>
          <p
            className={`mt-1 line-clamp-1 text-xs ${
              featured ? "text-slate-500" : "text-slate-300"
            }`}
          >
            {getCompanyName(job)} · {job.location || "Chưa rõ địa điểm"}
          </p>
          {featured ? (
            <p className="mt-3 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
              {formatSalary(job)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function HeroSection({
  onSearch,
  featuredJobs = [],
  isLoadingFeaturedJobs = false,
  systemStats,
}: HeroSectionProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const primaryJob = featuredJobs[0];
  const secondaryJobs = featuredJobs.slice(1, 4);
  const stats = [
    { num: formatCount(systemStats?.activeJobs), label: "việc đang tuyển" },
    { num: formatCount(systemStats?.recruiters), label: "nhà tuyển dụng" },
    { num: formatCount(systemStats?.candidates), label: "ứng viên đăng ký" },
  ];

  const handleSearch = () => {
    onSearch?.(keyword, location);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="bg-[#eef4ff]">
      <div className="mx-auto grid min-h-[640px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Dữ liệu việc làm được lấy trực tiếp từ hệ thống
          </span>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Tìm công việc phù hợp với cách bạn muốn phát triển
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Khám phá cơ hội từ các doanh nghiệp đã có trong hệ thống, lọc nhanh
            theo vị trí và địa điểm, rồi ứng tuyển với hồ sơ rõ ràng hơn.
          </p>

          <div className="mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-900/10">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_230px_150px]">
              <div className="flex h-14 min-w-0 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Chức danh, từ khóa hoặc công ty"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <label className="flex h-14 min-w-0 items-center gap-3 border-t border-slate-100 px-4 md:border-l md:border-t-0">
                <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-sm font-medium text-slate-700 outline-none"
                  aria-label="Địa điểm"
                >
                  <option value="">Tất cả địa điểm</option>
                  {WORK_LOCATION_OPTIONS.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleSearch}
                className="mt-2 inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 md:mt-0"
              >
                Tìm kiếm
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Tìm kiếm phổ biến:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setKeyword(term);
                  onSearch?.(term, location);
                }}
                className="cursor-pointer rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-slate-950">{stat.num}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl bg-slate-950 p-5 text-white shadow-2xl shadow-blue-900/20 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
                Việc làm nổi bật
              </p>
              <h2 className="mt-2 text-xl font-bold">Đang tuyển từ hệ thống</h2>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              Dữ liệu thật
            </div>
          </div>

          {isLoadingFeaturedJobs ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 rounded-2xl bg-white/10" />
              ))}
            </div>
          ) : primaryJob ? (
            <div className="space-y-3">
              <JobPreviewCard job={primaryJob} featured />
              {secondaryJobs.map((job) => (
                <JobPreviewCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/10 p-5 text-sm leading-6 text-slate-300">
              Chưa có việc làm nổi bật. Hãy chạy seed backend hoặc đăng tin
              tuyển dụng để dữ liệu xuất hiện tại đây.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
