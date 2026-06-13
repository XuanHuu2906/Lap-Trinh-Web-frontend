import {
  Banknote,
  Bookmark,
  BriefcaseBusiness,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { savePendingSaveJob } from "@/services/job-save-flow";
import { jobService } from "@/services/job.service";
import type { Job } from "@/types/job.type";
import { formatJobTypeLabel } from "@/utils/job-type-labels";

type FilterOption = {
  label: string;
  value: string;
};

type SalaryRange = {
  label: string;
  salaryMin?: number;
  salaryMax?: number;
};

const jobTypeOptions: FilterOption[] = [
  { label: "Tất cả", value: "" },
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Bán thời gian", value: "part_time" },
  { label: "Remote", value: "remote" },
  { label: "Thực tập", value: "internship" },
  { label: "Hợp đồng", value: "contract" },
];

const salaryRanges: SalaryRange[] = [
  { label: "Tất cả" },
  { label: "Dưới 15 triệu", salaryMax: 15000000 },
  { label: "15 - 25 triệu", salaryMin: 15000000, salaryMax: 25000000 },
  { label: "Trên 25 triệu", salaryMin: 25000000 },
];

const itemsPerPage = 6;

function formatSalary(job: Job) {
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
}

function formatDate(value?: string | null) {
  if (!value) return "Không giới hạn";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function getCompanyName(job: Job) {
  return job.recruiter?.recruiterProfile?.companyName || "Nhà tuyển dụng";
}

function getTags(job: Job) {
  return job.skills?.map((item) => item.skill.name).filter(Boolean).slice(0, 4) ?? [];
}

function PageHeader({ total }: { total: number }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
        HireArch / Việc làm
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            Danh sách việc làm
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {total} vị trí đang tuyển dụng từ các doanh nghiệp đã kiểm duyệt.
          </p>
        </div>
      </div>
    </div>
  );
}

function SearchBar({
  search,
  hasActiveFilter,
  showFilter,
  onSearch,
  onToggleFilter,
}: {
  search: string;
  hasActiveFilter: boolean;
  showFilter: boolean;
  onSearch: (value: string) => void;
  onToggleFilter: () => void;
}) {
  return (
    <div className="mb-3 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên công việc, công ty..."
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="h-12 w-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
        />
      </div>

      <button
        type="button"
        onClick={onToggleFilter}
        className={`inline-flex h-12 items-center gap-2 border px-4 text-sm font-semibold transition ${hasActiveFilter || showFilter
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          }`}
      >
        <SlidersHorizontal size={15} />
        Bộ lọc
        {hasActiveFilter ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-600">
            !
          </span>
        ) : null}
      </button>
    </div>
  );
}

function FilterPanel({
  jobType,
  salaryIndex,
  hasActiveFilter,
  onJobTypeChange,
  onSalaryChange,
  onReset,
}: {
  jobType: string;
  salaryIndex: number;
  hasActiveFilter: boolean;
  onJobTypeChange: (value: string) => void;
  onSalaryChange: (index: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="mb-5 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          Lọc nâng cao
        </span>
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
          >
            <X size={12} /> Xóa bộ lọc
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FilterChipGroup
          label="Loại hình"
          options={jobTypeOptions}
          activeValue={jobType}
          onChange={onJobTypeChange}
        />

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mức lương
          </label>
          <div className="flex flex-wrap gap-2">
            {salaryRanges.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onSalaryChange(index)}
                className={`border px-3 py-1.5 text-xs font-semibold transition ${salaryIndex === index
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChipGroup({
  label,
  options,
  activeValue,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onChange(item.value)}
            className={`border px-3 py-1.5 text-xs font-semibold transition ${activeValue === item.value
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function JobCard({
  job,
  isSaved,
  onOpen,
  onToggleSave,
}: {
  job: Job;
  isSaved: boolean;
  onOpen: () => void;
  onToggleSave: (event: React.MouseEvent) => void;
}) {
  const company = getCompanyName(job);
  const tags = getTags(job);
  const logo = company.slice(0, 1).toUpperCase();

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-blue-600 text-lg font-bold text-white">
            {logo}
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-950 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-400">
              {job.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {company}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
              <span className="bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                {formatJobTypeLabel(job.jobType)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={onToggleSave}
            title={isSaved ? "Bỏ lưu" : "Lưu việc làm"}
            className={`cursor-pointer p-1.5 transition-colors ${isSaved
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                : "text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              }`}
          >
            <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800 sm:grid-cols-3">
        <JobMeta icon={Banknote} value={formatSalary(job)} strong />
        <JobMeta icon={MapPin} value={job.location || "Không rõ địa điểm"} />
        <JobMeta icon={CalendarClock} value={`Hạn nộp: ${formatDate(job.expiresAt)}`} />
      </div>
    </article>
  );
}

function JobMeta({
  icon: Icon,
  value,
  strong,
}: {
  icon: typeof Banknote;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${strong
          ? "font-bold text-emerald-600 dark:text-emerald-400"
          : "text-slate-500 dark:text-slate-400"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-80 items-center justify-center gap-2 border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      Đang tải việc làm...
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
      <BriefcaseBusiness className="mb-4 text-slate-300 dark:text-slate-700" size={46} />
      <p className="font-semibold text-slate-950 dark:text-white">
        Không tìm thấy việc làm phù hợp
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Thử từ khóa hoặc bộ lọc khác.
      </p>
    </div>
  );
}

export default function JobList() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";
  const locationFromUrl = searchParams.get("location") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState(keywordFromUrl);
  const [location, setLocation] = useState(locationFromUrl);
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [jobType, setJobType] = useState("");
  const [salaryIndex, setSalaryIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasActiveFilter = jobType !== "" || salaryIndex !== 0;

  const query = useMemo(() => {
    const salaryRange = salaryRanges[salaryIndex];

    return {
      page,
      limit: itemsPerPage,
      keyword: search.trim() || undefined,
      location: location.trim() || undefined,
      jobType: jobType || undefined,
      salaryMin: salaryRange.salaryMin,
      salaryMax: salaryRange.salaryMax,
    };
  }, [jobType, location, page, salaryIndex, search]);

  useEffect(() => {
    setSearch(keywordFromUrl);
    setLocation(locationFromUrl);
    setPage(1);
  }, [keywordFromUrl, locationFromUrl]);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = query.keyword
          ? await jobService.searchJobs(query)
          : await jobService.getJobs(query);

        if (!isMounted) return;

        setJobs(response.data ?? []);
        setTotal(response.meta?.total ?? response.data?.length ?? 0);
        setTotalPages(response.meta?.totalPages || 1);
      } catch {
        if (!isMounted) return;
        setError("Không thể tải danh sách việc làm. Hãy kiểm tra backend đang chạy.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const toggleSave = async (event: React.MouseEvent, id: number) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      savePendingSaveJob(id);
      navigate("/login");
      return;
    }

    if (user?.role !== "candidate") {
      setError("Chỉ tài khoản ứng viên mới lưu được việc làm.");
      return;
    }

    const isSaved = savedJobs.has(id);
    setSavedJobs((current) => {
      const next = new Set(current);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isSaved) await jobService.unSaveJob(id);
      else await jobService.saveJob(id);
    } catch {
      setSavedJobs((current) => {
        const next = new Set(current);
        if (isSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const resetFilter = () => {
    setJobType("");
    setSalaryIndex(0);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <PageHeader total={total} />

      <SearchBar
        search={search}
        hasActiveFilter={hasActiveFilter}
        showFilter={showFilter}
        onSearch={handleSearch}
        onToggleFilter={() => setShowFilter((current) => !current)}
      />

      {showFilter ? (
        <FilterPanel
          jobType={jobType}
          salaryIndex={salaryIndex}
          hasActiveFilter={hasActiveFilter}
          onJobTypeChange={(value) => {
            setJobType(value);
            setPage(1);
          }}
          onSalaryChange={(index) => {
            setSalaryIndex(index);
            setPage(1);
          }}
          onReset={resetFilter}
        />
      ) : null}

      {error ? (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : jobs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedJobs.has(job.id)}
              onOpen={() => navigate(`/jobs/${job.id}`)}
              onToggleSave={(event) => toggleSave(event, job.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="border border-transparent p-2 text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-9 w-9 cursor-pointer border text-sm font-semibold transition-colors ${pageNumber === page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900"
                  }`}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="border border-transparent p-2 text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
