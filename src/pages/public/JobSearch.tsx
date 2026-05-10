import { useState } from "react";
import {
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

const INDUSTRIES = [
  "Tất cả ngành nghề",
  "Công nghệ thông tin",
  "Marketing & Truyền thông",
  "Tài chính & Ngân hàng",
  "Thiết kế & Sáng tạo",
  "Kỹ thuật & Sản xuất",
  "Giáo dục & Đào tạo",
];

const SALARY_RANGES = [
  { label: "Tất cả mức lương", value: "all" },
  { label: "Dưới 15 triệu", value: "lt15" },
  { label: "15 – 30 triệu", value: "15-30" },
  { label: "Trên 30 triệu", value: "gt30" },
  { label: "Thỏa thuận", value: "negotiate" },
];

const LEVELS = [
  "Tất cả cấp bậc",
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
  "Manager",
  "Director",
];

const SORT_OPTIONS = ["Phù hợp nhất", "Mới nhất", "Lương cao nhất"];

const jobs = [
  {
    id: 1,
    title: "Senior Fullstack Engineer",
    company: "Technova Corporation",
    location: "Hồ Chí Minh",
    salary: "30 – 50 Tr VNĐ",
    type: "Toàn thời gian",
    posted: "Đăng 2 ngày trước",
    logo: "T",
    color: "bg-blue-600",
    saved: false,
  },
  {
    id: 2,
    title: "Chuyên viên Phân tích Dữ liệu",
    company: "Global Finance Bank",
    location: "Hà Nội",
    salary: "Thỏa thuận",
    type: "Toàn thời gian",
    posted: "Đăng 5 giờ trước",
    logo: "G",
    color: "bg-green-700",
    saved: true,
  },
  {
    id: 3,
    title: "Trưởng phòng Marketing",
    company: "Nexus Creative Agency",
    location: "Đà Nẵng",
    salary: "Lên đến 40 Tr",
    type: "Toàn thời gian",
    posted: "Đăng hôm qua",
    logo: "N",
    color: "bg-purple-600",
    saved: false,
  },
  {
    id: 4,
    title: "Kỹ sư Quản lý Chất lượng (QA/QC)",
    company: "Viet Manufacturing",
    location: "Bình Dương",
    salary: "15 – 22 Tr VNĐ",
    type: "Toàn thời gian",
    posted: "Đăng 8 ngày trước",
    logo: "V",
    color: "bg-orange-500",
    saved: false,
  },
  {
    id: 5,
    title: "Product Manager – Enterprise",
    company: "DataSolutions Inc.",
    location: "Hồ Chí Minh",
    salary: "45 – 80 Tr VNĐ",
    type: "Toàn thời gian",
    posted: "Đăng 1 tuần trước",
    logo: "D",
    color: "bg-cyan-600",
    saved: false,
  },
  {
    id: 6,
    title: "UX/UI Designer",
    company: "CreativeHub Studio",
    location: "Hồ Chí Minh",
    salary: "20 – 35 Tr VNĐ",
    type: "Bán thời gian",
    posted: "Đăng 3 ngày trước",
    logo: "C",
    color: "bg-pink-500",
    saved: true,
  },
];

export default function JobSearch() {
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("Tất cả ngành nghề");
  const [salary, setSalary] = useState("all");
  const [level, setLevel] = useState("Tất cả cấp bậc");
  const [sort, setSort] = useState("Phù hợp nhất");
  const [savedJobs, setSavedJobs] = useState<Set<number>>(
    new Set(jobs.filter((j) => j.saved).map((j) => j.id)),
  );
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const totalPages = 12;

  const toggleSave = (id: number) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = jobs.filter(
    (j) =>
      keyword === "" ||
      j.title.toLowerCase().includes(keyword.toLowerCase()) ||
      j.company.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tìm việc làm</h1>
        <p className="text-gray-500 text-sm mt-1">
          Khám phá các cơ hội nghề nghiệp phù hợp với kỹ năng của bạn.
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Filter sidebar */}
        <aside
          className={`
          w-56 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm p-5
          ${mobileFilterOpen ? "block" : "hidden"} lg:block
        `}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">
              Bộ lọc chi tiết
            </h2>
            <button className="text-blue-600 text-xs hover:underline">
              Xóa tất cả
            </button>
          </div>

          {/* Keyword */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Từ khóa
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên công việc, kỹ năng..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Industry */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Ngành nghề
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Mức lương
            </label>
            <div className="space-y-1.5">
              {SALARY_RANGES.map((s) => (
                <label
                  key={s.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="salary"
                    value={s.value}
                    checked={salary === s.value}
                    onChange={() => setSalary(s.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="mb-5">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              Kinh nghiệm
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg py-2 transition-colors">
            Áp dụng bộ lọc
          </button>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white"
              >
                <SlidersHorizontal size={14} /> Bộ lọc
              </button>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">
                  {filtered.length * 40}
                </span>{" "}
                việc làm phù hợp
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sắp xếp theo:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Job grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Company + save */}
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {job.company}
                  </p>
                  <button
                    onClick={() => toggleSave(job.id)}
                    className={`transition-colors ${savedJobs.has(job.id) ? "text-blue-600" : "text-gray-300 hover:text-gray-400"}`}
                  >
                    <Bookmark
                      size={16}
                      fill={savedJobs.has(job.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Logo + title */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`${job.color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {job.logo}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                    {job.title}
                  </h3>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 mb-4 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={11} /> {job.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <DollarSign size={11} /> {job.salary}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock size={11} /> {job.posted}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg py-2 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 border border-transparent hover:border-gray-200"
            >
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3, "...", 12].map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === "number" && setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors
                  ${p === page ? "bg-blue-600 text-white shadow-sm" : typeof p === "number" ? "hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent text-gray-600" : "text-gray-400 cursor-default"}
                `}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 border border-transparent hover:border-gray-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
