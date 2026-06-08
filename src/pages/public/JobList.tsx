import {
  Search,
  Bookmark,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobService } from "@/services/job.service";
import type { Job } from "@/types/job.type";

const JOB_TYPES = [
  { label: "Tất cả", value: "" },
  { label: "Toàn thời gian", value: "full_time" },
  { label: "Bán thời gian", value: "part_time" },
  { label: "Remote", value: "remote" },
  { label: "Thực tập", value: "internship" },
  { label: "Hợp đồng", value: "contract" },
];

const SALARY_RANGES = [
  { label: "Tất cả", salaryMin: undefined, salaryMax: undefined },
  { label: "Dưới 15 triệu", salaryMin: undefined, salaryMax: 15000000 },
  { label: "15 - 25 triệu", salaryMin: 15000000, salaryMax: 25000000 },
  { label: "Trên 25 triệu", salaryMin: 25000000, salaryMax: undefined },
];

const ITEMS_PER_PAGE = 6;

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
  job.skills?.map((item) => item.skill.name).filter(Boolean).slice(0, 4) ?? [];

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
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
    const salaryRange = SALARY_RANGES[salaryIndex];
    return {
      page,
      limit: ITEMS_PER_PAGE,
      keyword: search.trim() || undefined,
      jobType: jobType || undefined,
      salaryMin: salaryRange.salaryMin,
      salaryMax: salaryRange.salaryMax,
    };
  }, [jobType, page, salaryIndex, search]);

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

  const toggleSave = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    const isSaved = savedJobs.has(id);
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isSaved) await jobService.unSaveJob(id);
      else await jobService.saveJob(id);
    } catch {
      setSavedJobs((prev) => {
        const next = new Set(prev);
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
    <div className="max-w-6xl mx-auto w-full px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Danh sách việc làm
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {total} vị trí đang tuyển dụng
      </p>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên công việc, công ty..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${
            hasActiveFilter
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          <SlidersHorizontal size={15} />
          Bộ lọc
          {hasActiveFilter && (
            <span className="bg-white text-blue-600 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {showFilter && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Lọc nâng cao
            </span>
            {hasActiveFilter && (
              <button
                onClick={resetFilter}
                className="flex items-center gap-1 text-xs text-red-500 hover:underline"
              >
                <X size={12} /> Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Loại hình
              </label>
              <div className="flex flex-wrap gap-1.5">
                {JOB_TYPES.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setJobType(item.value);
                      setPage(1);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      jobType === item.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Mức lương
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SALARY_RANGES.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSalaryIndex(index);
                      setPage(1);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      salaryIndex === index
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Đang tải việc làm...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Không tìm thấy việc làm phù hợp</p>
          <p className="text-sm mt-1">Thử từ khóa hoặc bộ lọc khác</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const company = getCompany(job);
            const tags = getTags(job);
            const logo = company.slice(0, 1).toUpperCase();

            return (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                      {logo}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {job.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">{company}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">
                          {job.jobType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={(e) => toggleSave(e, job.id)}
                      title={savedJobs.has(job.id) ? "Bỏ lưu" : "Lưu việc làm"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        savedJobs.has(job.id)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-300 hover:text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <Bookmark
                        size={16}
                        fill={savedJobs.has(job.id) ? "currentColor" : "none"}
                      />
                    </button>
                    <p className="text-green-600 font-bold text-sm">
                      {formatSalary(job)}
                    </p>
                    <p className="text-xs text-gray-400">{job.location}</p>
                    <p className="text-xs text-gray-400">
                      HSD: {formatDate(job.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                pageNumber === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
