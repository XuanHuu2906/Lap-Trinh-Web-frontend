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
    deadline: "20/06/2026",
    tags: ["Python", "SQL", "Power BI"],
    field: "Data",
    type: "Toàn thời gian",
    experience: "2 - 5 năm",
    level: "Senior",
  },
];

export default function JobList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Danh sách việc làm
      </h1>
      <p className="text-gray-500 mb-6">
        {filtered.length} vị trí đang tuyển dụng
      </p>

      {/* Search */}
      <div className="relative mb-8">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Tìm theo tên công việc, công ty, kỹ năng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm"
        />
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Không tìm thấy việc làm phù hợp</p>
          <p className="text-sm mt-1">Thử từ khoá khác</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div
                    className={`w-12 h-12 rounded-xl ${job.logoColor} text-white font-bold text-lg flex items-center justify-center shrink-0`}
                  >
                    {job.logo}
                  </div>
                  <div>
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

                <div className="text-right shrink-0">
                  <p className="text-green-600 font-bold text-sm">
                    {job.salary}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{job.location}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    HSD: {job.deadline}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
