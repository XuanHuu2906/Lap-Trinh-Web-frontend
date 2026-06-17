import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { savePendingSaveJob } from "@/services/job-save-flow";
import { jobService } from "@/services/job.service";
import type { Job, JobQuery } from "@/types/job.type";

type CategoryOption = {
  id: number;
  name: string;
  children?: Array<{ id: number; name: string }>;
};

type SearchFilters = {
  keyword: string;
  categoryId: string;
  experienceLevel: string;
  jobType: string;
  salary: string;
};

type JobSearchVariant = "public" | "candidate";

type JobSearchStyle = {
  page: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  layout: string;
  filterPanel: string;
  filterButton: string;
  inputWrap: string;
  input: string;
  select: string;
  cardGrid: string;
  jobCard: string;
  emptyState: string;
  skeletonCard: string;
};

const jobSearchStyles: Record<JobSearchVariant, JobSearchStyle> = {
  public: {
    page: "mx-auto w-full max-w-6xl px-4 py-10 text-slate-800 dark:text-slate-100",
    eyebrow:
      "text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400",
    title: "mt-2 text-3xl font-black text-slate-950 dark:text-white",
    subtitle: "mt-2 text-sm text-slate-500 dark:text-slate-400",
    layout: "flex items-start gap-5",
    filterPanel:
      "w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
    filterButton:
      "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden",
    inputWrap:
      "flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-950",
    input:
      "h-11 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600",
    select:
      "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
    cardGrid: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
    jobCard:
      "flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/70",
    emptyState:
      "flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center shadow-sm dark:border-slate-800 dark:bg-slate-900",
    skeletonCard:
      "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
  },
  candidate: {
    page: "mx-auto max-w-7xl text-slate-800 dark:text-slate-100",
    eyebrow:
      "text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500",
    title: "mt-2 text-3xl font-bold text-slate-950 dark:text-white",
    subtitle: "mt-2 text-sm text-slate-500 dark:text-slate-400",
    layout: "flex items-start gap-5",
    filterPanel:
      "w-64 shrink-0 border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
    filterButton:
      "inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden",
    inputWrap:
      "flex items-center border border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-950",
    input:
      "h-11 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600",
    select:
      "h-11 w-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
    cardGrid: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
    jobCard:
      "flex flex-col border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/70",
    emptyState:
      "flex min-h-80 flex-col items-center justify-center border border-slate-200 bg-white text-center shadow-sm dark:border-slate-800 dark:bg-slate-900",
    skeletonCard:
      "border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
  },
};

type JobSearchCacheData = {
  jobs: Job[];
  total: number;
  totalPages: number;
  loadedAt: number;
};

const JOB_SEARCH_CACHE_TTL = 5 * 60 * 1000;
const SAVED_JOBS_CACHE_TTL = 5 * 60 * 1000;

const DEFAULT_FILTERS: SearchFilters = {
  keyword: "",
  categoryId: "",
  experienceLevel: "",
  jobType: "",
  salary: "",
};

const jobSearchCache = new Map<string, JobSearchCacheData>();
let categoryCache: CategoryOption[] | null = null;
let savedJobIdsCache: { ids: Set<number>; loadedAt: number } | null = null;

const EXPERIENCE_OPTIONS = [
  { label: "Tất cả cấp bậc", value: "" },
  { label: "Chưa có kinh nghiệm", value: "no_exp" },
  { label: "Junior", value: "junior" },
  { label: "Middle", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Manager", value: "manager" },
];

const JOB_TYPE_OPTIONS = [
  { label: "Tất cả loại việc", value: "" },
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Bán thời gian", value: "part_time" },
  { label: "Remote", value: "remote" },
  { label: "Thực tập", value: "internship" },
  { label: "Hợp đồng", value: "contract" },
];

const SALARY_OPTIONS = [
  {
    label: "Tất cả mức lương",
    value: "",
    salaryMin: undefined,
    salaryMax: undefined,
  },
  {
    label: "Dưới 15 triệu",
    value: "lt15",
    salaryMin: undefined,
    salaryMax: 15000000,
  },
  {
    label: "15 - 30 triệu",
    value: "15-30",
    salaryMin: 15000000,
    salaryMax: 30000000,
  },
  {
    label: "Trên 30 triệu",
    value: "gt30",
    salaryMin: 30000000,
    salaryMax: undefined,
  },
];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Lương cao", value: "salary" },
];

const makeCacheKey = (page: number, filters: SearchFilters, sort: string) =>
  JSON.stringify({ page, filters, sort });

const getFreshJobCache = (key: string) => {
  const cached = jobSearchCache.get(key);
  if (!cached) return null;
  return Date.now() - cached.loadedAt < JOB_SEARCH_CACHE_TTL ? cached : null;
};

const getFreshSavedJobIds = () => {
  if (!savedJobIdsCache) return null;
  return Date.now() - savedJobIdsCache.loadedAt < SAVED_JOBS_CACHE_TTL
    ? savedJobIdsCache.ids
    : null;
};

const companyName = (job: Job) =>
  job.recruiter?.recruiterProfile?.companyName || "Không rõ công ty";

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

const formatPostedAt = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Đăng hôm nay";
  if (days === 1) return "Đăng hôm qua";
  return `Đăng ${days} ngày trước`;
};

const flattenCategories = (categories: CategoryOption[]) =>
  categories.flatMap((category) => [
    { id: category.id, name: category.name },
    ...(category.children || []).map((child) => ({
      id: child.id,
      name: `- ${child.name}`,
    })),
  ]);

function JobCardSkeleton({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="mb-4 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
      <div className="mb-5 flex gap-3">
        <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="mt-5 h-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function JobSearch({
  variant = "public",
}: {
  variant?: JobSearchVariant;
}) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isCandidatePage = variant === "candidate";
  const styles = jobSearchStyles[variant];
  const initialCache = getFreshJobCache(
    makeCacheKey(1, DEFAULT_FILTERS, "newest"),
  );
  const initialSavedJobIds = getFreshSavedJobIds();

  const [keyword, setKeyword] = useState(DEFAULT_FILTERS.keyword);
  const [categoryId, setCategoryId] = useState(DEFAULT_FILTERS.categoryId);
  const [salary, setSalary] = useState(DEFAULT_FILTERS.salary);
  const [experienceLevel, setExperienceLevel] = useState(
    DEFAULT_FILTERS.experienceLevel,
  );
  const [jobType, setJobType] = useState(DEFAULT_FILTERS.jobType);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [jobs, setJobs] = useState<Job[]>(initialCache?.jobs ?? []);
  const [categories, setCategories] = useState<CategoryOption[]>(
    categoryCache ?? [],
  );
  const [savedJobs, setSavedJobs] = useState<Set<number>>(
    () => new Set(initialSavedJobIds ?? []),
  );
  const [isLoading, setIsLoading] = useState(!initialCache);
  const [isSavingId, setIsSavingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(initialCache?.total ?? 0);
  const [totalPages, setTotalPages] = useState(initialCache?.totalPages ?? 1);

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

  const currentFilters: SearchFilters = {
    keyword,
    categoryId,
    experienceLevel,
    jobType,
    salary,
  };

  const loadJobs = async (
    nextPage = page,
    filters = currentFilters,
    forceRefresh = false,
  ) => {
    try {
      setErrorMessage(null);
      const cacheKey = makeCacheKey(nextPage, filters, sort);
      const cached = getFreshJobCache(cacheKey);

      if (!forceRefresh && cached) {
        setJobs(cached.jobs);
        setTotal(cached.total);
        setTotalPages(cached.totalPages);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const selectedSalary = SALARY_OPTIONS.find(
        (item) => item.value === filters.salary,
      );
      const query: JobQuery = {
        page: nextPage,
        limit: 6,
        keyword: filters.keyword.trim() || undefined,
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        experienceLevel: filters.experienceLevel || undefined,
        jobType: filters.jobType || undefined,
        salaryMin: selectedSalary?.salaryMin,
        salaryMax: selectedSalary?.salaryMax,
      };

      const response = filters.keyword.trim()
        ? await jobService.searchJobs(query)
        : await jobService.getJobs(query);

      const sortedJobs = [...response.data].sort((a, b) => {
        if (sort === "salary") {
          return (
            (b.salaryMax || b.salaryMin || 0) -
            (a.salaryMax || a.salaryMin || 0)
          );
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      const nextTotal = response.meta?.total ?? response.data.length;
      const nextTotalPages = response.meta?.totalPages || 1;

      setJobs(sortedJobs);
      setTotal(nextTotal);
      setTotalPages(nextTotalPages);
      jobSearchCache.set(cacheKey, {
        jobs: sortedJobs,
        total: nextTotal,
        totalPages: nextTotalPages,
        loadedAt: Date.now(),
      });
    } catch {
      setErrorMessage("Không thể tải danh sách việc làm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        if (categoryCache) {
          setCategories(categoryCache);
          return;
        }

        const response = await jobService.getCategories();
        categoryCache = response.data;
        setCategories(response.data);
      } catch {
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    loadJobs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  useEffect(() => {
    const loadSavedJobs = async () => {
      if (!isCandidatePage || !isAuthenticated || user?.role !== "candidate") {
        return;
      }

      const cached = getFreshSavedJobIds();
      if (cached) {
        setSavedJobs(new Set(cached));
        return;
      }

      try {
        const response = await jobService.getSavedJobs({ page: 1, limit: 100 });
        const ids = new Set(response.data.map((item) => item.jobPostingId));
        savedJobIdsCache = { ids, loadedAt: Date.now() };
        setSavedJobs(new Set(ids));
      } catch {
        savedJobIdsCache = null;
      }
    };

    loadSavedJobs();
  }, [isAuthenticated, isCandidatePage, user?.role]);

  const handleApplyFilters = () => {
    if (page === 1) {
      loadJobs(1);
    } else {
      setPage(1);
    }
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setKeyword(resetFilters.keyword);
    setCategoryId(resetFilters.categoryId);
    setSalary(resetFilters.salary);
    setExperienceLevel(resetFilters.experienceLevel);
    setJobType(resetFilters.jobType);
    if (page === 1) {
      loadJobs(1, resetFilters, true);
    } else {
      setPage(1);
    }
  };

  const toggleSave = async (jobId: number) => {
    if (!isAuthenticated) {
      savePendingSaveJob(jobId);
      navigate("/login");
      return;
    }

    if (user?.role !== "candidate") {
      setErrorMessage("Chỉ tài khoản ứng viên mới lưu được việc làm.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsSavingId(jobId);

      if (savedJobs.has(jobId)) {
        await jobService.unSaveJob(jobId);
        setSavedJobs((current) => {
          const next = new Set(current);
          next.delete(jobId);
          savedJobIdsCache = { ids: new Set(next), loadedAt: Date.now() };
          return next;
        });
      } else {
        await jobService.saveJob(jobId);
        setSavedJobs((current) => {
          const next = new Set(current).add(jobId);
          savedJobIdsCache = { ids: new Set(next), loadedAt: Date.now() };
          return next;
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 409) {
        setSavedJobs((current) => {
          const next = new Set(current).add(jobId);
          savedJobIdsCache = { ids: new Set(next), loadedAt: Date.now() };
          return next;
        });
        setErrorMessage(null);
        return;
      }

      if (status === 401) {
        setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      setErrorMessage(message || "Không thể lưu việc làm lúc này.");
    } finally {
      setIsSavingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={styles.title}>Tìm việc làm</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Sắp xếp:
          </span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <div className={styles.layout}>
        <aside
          className={`${styles.filterPanel} ${
            mobileFilterOpen ? "block" : "hidden"
          } lg:block`}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950 dark:text-white">
              Bộ lọc chi tiết
            </h2>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-blue-700 hover:text-blue-600"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Từ khóa
              </label>
              <div className={styles.inputWrap}>
                <Search className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleApplyFilters();
                  }}
                  placeholder="Tên việc, công ty..."
                  className={styles.input}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ngành nghề
              </label>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={styles.select}
              >
                <option value="">Tất cả ngành nghề</option>
                {categoryOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Mức lương
              </label>
              <div className="space-y-2">
                {SALARY_OPTIONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="radio"
                      name="salary"
                      value={item.value}
                      checked={salary === item.value}
                      onChange={() => setSalary(item.value)}
                      className="accent-blue-600"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Kinh nghiệm
              </label>
              <select
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
                className={styles.select}
              >
                {EXPERIENCE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Loại việc
              </label>
              <select
                value={jobType}
                onChange={(event) => setJobType(event.target.value)}
                className={styles.select}
              >
                {JOB_TYPE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen((current) => !current)}
                className={styles.filterButton}
              >
                <SlidersHorizontal size={15} />
                Bộ lọc
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-950 dark:text-white">
                  {total}
                </span>{" "}
                việc làm phù hợp
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.cardGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} className={styles.skeletonCard} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <BriefcaseBusiness
                className="mb-4 text-slate-300 dark:text-slate-700"
                size={46}
              />
              <p className="font-semibold text-slate-950 dark:text-white">
                Không có việc làm phù hợp.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Thử xóa bớt bộ lọc hoặc đổi từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {jobs.map((job) => (
                <article key={job.id} className={styles.jobCard}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          isCandidatePage
                            ? `/candidate/companies/${job.recruiterId}`
                            : `/companies/${job.recruiterId}`,
                        )
                      }
                      className="group/company inline-flex max-w-[85%] items-center gap-1.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500 transition hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
                    >
                      <span className="line-clamp-1">{companyName(job)}</span>
                      <span className="text-blue-600 opacity-0 transition group-hover/company:opacity-100">
                        ↗
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(job.id)}
                      disabled={isSavingId === job.id}
                      className={`transition ${
                        savedJobs.has(job.id)
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300"
                      }`}
                      title="Lưu việc làm"
                    >
                      {isSavingId === job.id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Bookmark
                          size={17}
                          fill={savedJobs.has(job.id) ? "currentColor" : "none"}
                        />
                      )}
                    </button>
                  </div>

                  <div className="mb-4 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          isCandidatePage
                            ? `/candidate/companies/${job.recruiterId}`
                            : `/companies/${job.recruiterId}`,
                        )
                      }
                      title={`Xem hồ sơ ${companyName(job)}`}
                      className="group/logo rounded-xl shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-blue-400 dark:ring-slate-700"
                    >
                      <CompanyLogo
                        name={companyName(job)}
                        logoUrl={job.recruiter?.recruiterProfile?.logoUrl}
                        className="h-12 w-12 rounded-xl text-sm group-hover/logo:bg-blue-50"
                        imageClassName="p-1.5"
                      />
                    </button>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950 dark:text-white">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {job.category?.name || "Chưa phân loại"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 flex-1 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} />
                      <span>{job.location || "Không rõ địa điểm"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={13} />
                      <span>{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} />
                      <span>{formatPostedAt(job.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        isCandidatePage
                          ? `/candidate/jobs/${job.id}`
                          : `/jobs/${job.id}`,
                      )
                    }
                    className="w-full rounded-lg bg-blue-700 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800"
                  >
                    Xem chi tiết
                  </button>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Trang {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
