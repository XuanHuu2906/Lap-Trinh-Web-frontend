import {
  Search,
  Bookmark,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "FPT Software",
    logo: "F",
    logoColor: "bg-blue-500",
    location: "Hồ Chí Minh",
    salary: "15 - 20 triệu",
    salaryMin: 15,
    deadline: "30/05/2026",
    tags: ["React", "TypeScript", "Tailwind"],
    field: "IT / Software",
    type: "Toàn thời gian",
    experience: "1 - 3 năm",
    level: "Junior",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "VNG",
    logo: "V",
    logoColor: "bg-orange-500",
    location: "Hà Nội",
    salary: "20 - 30 triệu",
    salaryMin: 20,
    deadline: "15/06/2026",
    tags: ["NodeJS", "Express", "MongoDB"],
    field: "IT / Software",
    type: "Remote",
    experience: "2 năm",
    level: "Middle",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Momo",
    logo: "M",
    logoColor: "bg-pink-500",
    location: "Hồ Chí Minh",
    salary: "18 - 25 triệu",
    salaryMin: 18,
    deadline: "01/07/2026",
    tags: ["Figma", "Prototyping", "UX Research"],
    field: "Design",
    type: "Toàn thời gian",
    experience: "2 - 4 năm",
    level: "Middle",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Shopee",
    logo: "S",
    logoColor: "bg-orange-400",
    location: "Hà Nội",
    salary: "25 - 35 triệu",
    salaryMin: 25,
    deadline: "20/06/2026",
    tags: ["Python", "SQL", "Power BI"],
    field: "Data",
    type: "Toàn thời gian",
    experience: "2 - 5 năm",
    level: "Senior",
  },
];

const FIELDS = ["Tất cả", "IT / Software", "Design", "Data", "Marketing"];
const TYPES = ["Tất cả", "Toàn thời gian", "Remote", "Bán thời gian"];
const SALARY_RANGES = [
  { label: "Tất cả", value: "all" },
  { label: "Dưới 15 triệu", value: "lt15" },
  { label: "15 – 25 triệu", value: "15-25" },
  { label: "Trên 25 triệu", value: "gt25" },
];

const ITEMS_PER_PAGE = 3;

function matchSalary(salaryMin: number, range: string) {
  if (range === "all") return true;
  if (range === "lt15") return salaryMin < 15;
  if (range === "15-25") return salaryMin >= 15 && salaryMin <= 25;
  if (range === "gt25") return salaryMin > 25;
  return true;
}

export default function JobList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [field, setField] = useState("Tất cả");
  const [type, setType] = useState("Tất cả");
  const [salary, setSalary] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = JOBS.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchField = field === "Tất cả" || j.field === field;
    const matchType = type === "Tất cả" || j.type === type;
    const matchSal = matchSalary(j.salaryMin, salary);
    return matchSearch && matchField && matchType && matchSal;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const hasActiveFilter =
    field !== "Tất cả" || type !== "Tất cả" || salary !== "all";

  const toggleSave = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSavedJobs((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetFilter = () => {
    setField("Tất cả");
    setType("Tất cả");
    setSalary("all");
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Danh sách việc làm
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {filtered.length} vị trí đang tuyển dụng
      </p>

      {/* Search + Filter toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên công việc, công ty, kỹ năng..."
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

      {/* Filter panel */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Field */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Lĩnh vực
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FIELDS.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(setField, f)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      field === f
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Loại hình
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleFilterChange(setType, t)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      type === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Mức lương
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SALARY_RANGES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleFilterChange(setSalary, s.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      salary === s.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job list */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Không tìm thấy việc làm phù hợp</p>
          <p className="text-sm mt-1">Thử từ khoá hoặc bộ lọc khác</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl ${job.logoColor} text-white font-bold text-lg flex items-center justify-center shrink-0`}
                  >
                    {job.logo}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {job.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.company}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium">
                        {job.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {/* UC-09: Lưu việc làm yêu thích */}
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
                    {job.salary}
                  </p>
                  <p className="text-xs text-gray-400">{job.location}</p>
                  <p className="text-xs text-gray-400">HSD: {job.deadline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination — chỉ hiện khi > 1 trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent"
              }`}
            >
              {p}
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
