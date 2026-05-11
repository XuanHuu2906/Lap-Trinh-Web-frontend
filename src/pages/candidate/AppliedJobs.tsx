import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  ChevronDown,
  FileText,
  Clock,
  CalendarDays,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

const STATUS_OPTIONS = [
  "Tất cả trạng thái",
  "Đang chờ duyệt",
  "Đã tiếp nhận",
  "Đang phỏng vấn",
  "Từ chối",
  "Đề nghị nhận việc",
];

const applications = [
  {
    position: "Senior Product Designer",
    skills: "UX/UI, Figma, Design System",
    company: "TechCorp VN",
    companyLogo: "T",
    companyColor: "bg-blue-600",
    date: "24/10/2023",
    cv: "NguyenVanA_CV_v2.pdf",
    status: "ĐANG CHỜ",
    statusColor: "bg-gray-100 text-gray-600",
    hasReply: false,
  },
  {
    position: "Enterprise Architect",
    skills: "Cloud, System Design",
    company: "GlobalBank",
    companyLogo: "G",
    companyColor: "bg-green-700",
    date: "20/10/2023",
    cv: "Architect_Resume.pdf",
    status: "ĐÃ XEM",
    statusColor: "bg-blue-100 text-blue-700",
    hasReply: false,
  },
  {
    position: "Frontend Lead Engineer",
    skills: "React, TypeScript, Performance",
    company: "StartupX",
    companyLogo: "S",
    companyColor: "bg-purple-600",
    date: "15/10/2023",
    cv: "LeadFE_Profile.pdf",
    status: "MỜI PHỎNG VẤN",
    statusColor: "bg-yellow-100 text-yellow-700",
    hasReply: true,
  },
  {
    position: "Data Scientist",
    skills: "Python, Machine Learning",
    company: "AI Solutions",
    companyLogo: "A",
    companyColor: "bg-orange-500",
    date: "05/10/2023",
    cv: "Data_CV.pdf",
    status: "TỪ CHỐI",
    statusColor: "bg-red-100 text-red-600",
    hasReply: true,
  },
];

const counters = [
  {
    label: "Tổng số đã nộp",
    value: 12,
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Đang chờ duyệt",
    value: 4,
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  {
    label: "Lịch phỏng vấn",
    value: 2,
    icon: CalendarDays,
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Chưa phù hợp",
    value: 6,
    icon: XCircle,
    color: "text-red-500 bg-red-50",
  },
];

export default function AppliedJobs() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 3;

  const filtered = applications.filter((a) => {
    const matchSearch =
      search === "" ||
      a.position.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      status === "Tất cả trạng thái" ||
      a.status.includes(status.toUpperCase().slice(0, 5));
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý ứng tuyển
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Theo dõi trạng thái và phản hồi từ các vị trí bạn đã nộp hồ sơ.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 text-sm rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-colors duration-150 cursor-pointer">
          Xuất báo cáo
        </Button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {counters.map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 shadow-sm transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <div
                className={`${color} dark:bg-slate-800 dark:text-indigo-400 w-9 h-9 rounded-lg flex items-center justify-center`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-150">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative flex-1 min-w-48">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm vị trí, công ty..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Lọc theo: {status} <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg z-20 w-52 py-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatus(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-slate-800 ${status === opt ? "text-blue-600 dark:text-indigo-400 font-semibold" : "text-gray-700 dark:text-slate-300"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 dark:border-slate-800">
                <th className="px-5 py-3 text-left font-medium">
                  Vị trí ứng tuyển
                </th>
                <th className="px-5 py-3 text-left font-medium">Công ty</th>
                <th className="px-5 py-3 text-left font-medium">Ngày nộp</th>
                <th className="px-5 py-3 text-left font-medium">CV đã gửi</th>
                <th className="px-5 py-3 text-left font-medium">Trạng thái</th>
                <th className="px-5 py-3 text-left font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {filtered.map((row) => (
                <tr
                  key={row.position}
                  className="hover:bg-gray-50/60 dark:hover:bg-slate-850/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {row.position}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{row.skills}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`${row.companyColor} w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {row.companyLogo}
                      </div>
                      <span className="text-gray-700 dark:text-slate-300">{row.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{row.date}</td>
                  <td className="px-5 py-4">
                    <a
                      href="#"
                      className="flex items-center gap-1 text-blue-600 dark:text-indigo-400 hover:underline text-xs"
                    >
                      <FileText size={12} /> {row.cv}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="secondary"
                      className={`${row.statusColor} text-[11px] font-semibold px-2.5 py-0.5 rounded-full dark:bg-opacity-20 lowercase first-letter:uppercase border-none`}
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-blue-600 dark:text-indigo-400 font-semibold hover:underline">
                        Chi tiết
                      </button>
                      {row.hasReply && (
                        <button className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400 font-semibold hover:underline">
                          <MessageSquare size={11} /> Phản hồi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-800 text-sm bg-white dark:bg-slate-900">
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Hiển thị 1–4 trên tổng số 12 ứng tuyển
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold ${p === page ? "bg-blue-600 dark:bg-indigo-600 text-white" : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400"}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
