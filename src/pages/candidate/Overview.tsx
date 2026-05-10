import {
  RefreshCw,
  ArrowRight,
  FileText,
  BriefcaseBusiness,
  Bell,
  MapPin,
  DollarSign,
} from "lucide-react";

const stats = [
  {
    label: "CV đã tạo",
    value: "03",
    action: "Quản lý CV",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    link: "/candidate/my-cvs",
  },
  {
    label: "Công việc đã ứng tuyển",
    value: "12",
    note: "+2 trong tuần này",
    icon: BriefcaseBusiness,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    link: "/candidate/applied-jobs",
  },
  {
    label: "Phản hồi mới",
    value: "02",
    action: "Xem thông báo",
    icon: Bell,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    link: "/candidate/notifications",
  },
];

const recentActivity = [
  {
    position: "Senior Digital Marketer",
    company: "TechCorp VN",
    date: "12/10/2023",
    status: "ĐANG PHỎNG VẤN",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    position: "Marketing Manager",
    company: "Global Retail Group",
    date: "08/10/2023",
    status: "ĐÃ TIẾP NHẬN",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    position: "Content Strategist",
    company: "Creative Agency ABC",
    date: "01/10/2023",
    status: "TỪ CHỐI",
    statusColor: "bg-red-100 text-red-600",
  },
  {
    position: "SEO Specialist",
    company: "E-commerce Plus",
    date: "25/09/2023",
    status: "ĐỀ NGHỊ NHẬN VIỆC",
    statusColor: "bg-purple-100 text-purple-700",
  },
];

const suggestedJobs = [
  {
    title: "Trưởng phòng Marketing",
    company: "Alpha Tech Solutions",
    location: "HCM",
    salary: "Lên đến $2000",
    logo: "A",
    logoColor: "bg-orange-500",
  },
  {
    title: "Brand Manager",
    company: "Nova Consumer Group",
    location: "Hà Nội",
    salary: "Thỏa thuận",
    logo: "N",
    logoColor: "bg-blue-800",
  },
  {
    title: "Performance...",
    company: "Zenith E-com",
    location: "HCM",
    salary: "Toàn thời gian",
    logo: "Z",
    logoColor: "bg-gray-700",
  },
];

export default function Overview() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Chào mừng trở lại. Cập nhật tiến độ ứng tuyển của bạn hôm nay.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 p-5 flex items-start justify-between shadow-sm"
            >
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  {s.label}
                </p>
                <p className="text-4xl font-bold text-gray-900">{s.value}</p>
                {s.note && (
                  <p className="text-xs text-gray-400 mt-1">{s.note}</p>
                )}
                {s.action && (
                  <a
                    href={s.link}
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    {s.action} <ArrowRight size={11} />
                  </a>
                )}
              </div>
              <div
                className={`${s.iconBg} ${s.iconColor} w-10 h-10 rounded-lg flex items-center justify-center`}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">
              Hoạt động ứng tuyển gần đây
            </h2>
            <a
              href="/candidate/applied-jobs"
              className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={11} />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">
                    Vị trí ứng tuyển
                  </th>
                  <th className="px-5 py-3 text-left font-medium">Công ty</th>
                  <th className="px-5 py-3 text-left font-medium">Ngày nộp</th>
                  <th className="px-5 py-3 text-left font-medium">
                    Trạng thái
                  </th>
                  <th className="px-5 py-3 text-left font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((row) => (
                  <tr
                    key={row.position}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {row.position}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{row.company}</td>
                    <td className="px-5 py-3.5 text-gray-500">{row.date}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`${row.statusColor} text-[11px] font-semibold px-2 py-1 rounded-full`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs text-blue-600 font-semibold hover:underline">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suggested jobs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">
              Việc làm phù hợp
            </h2>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {suggestedJobs.map((job) => (
              <div
                key={job.title}
                className="px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`${job.logoColor} w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {job.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {job.title}
                    </p>
                    <p className="text-gray-500 text-xs">{job.company}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin size={10} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <DollarSign size={10} /> {job.salary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-gray-100">
            <a
              href="/jobs"
              className="text-blue-600 text-xs font-semibold hover:underline flex items-center justify-center gap-1"
            >
              Xem thêm đề xuất <ArrowRight size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
