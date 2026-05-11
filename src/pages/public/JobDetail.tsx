import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    field: "IT / Software",
    type: "Toàn thời gian",
    experience: "1 - 3 năm",
    level: "Junior",
    tags: ["React", "TypeScript", "Tailwind"],
    description:
      "Xây dựng và phát triển giao diện người dùng cho các sản phẩm web quy mô lớn. Làm việc cùng team Design và Backend để tích hợp API, tối ưu hiệu suất và đảm bảo trải nghiệm người dùng tốt nhất.",
    requirements: [
      "Có kinh nghiệm với ReactJS và TypeScript",
      "Thành thạo HTML, CSS, TailwindCSS",
      "Hiểu biết về RESTful API và async/await",
      "Có tư duy UI/UX tốt",
      "Ưu tiên ứng viên có portfolio cá nhân",
    ],
    benefits: [
      "Lương tháng 13 + thưởng hiệu suất",
      "Remote 2 ngày/tuần",
      "Du lịch team hàng năm",
      "Bảo hiểm sức khỏe cao cấp",
      "Môi trường làm việc trẻ, năng động",
    ],
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
    field: "IT / Software",
    type: "Remote",
    experience: "2 năm",
    level: "Middle",
    tags: ["NodeJS", "Express", "MongoDB"],
    description:
      "Thiết kế và xây dựng các hệ thống backend có khả năng mở rộng cao, phục vụ hàng triệu người dùng. Tham gia vào toàn bộ vòng đời phát triển sản phẩm từ thiết kế kiến trúc đến triển khai.",
    requirements: [
      "Thành thạo NodeJS và Express",
      "Kinh nghiệm với MongoDB hoặc PostgreSQL",
      "Hiểu biết về microservices và Docker",
      "Có kinh nghiệm với Redis, message queue",
    ],
    benefits: [
      "Remote 100%",
      "Lương cạnh tranh theo năng lực",
      "Stock option sau 1 năm",
      "Ngân sách học tập 10 triệu/năm",
    ],
  },
];

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);

  const job = JOBS.find((j) => j.id === Number(id));

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-gray-700 mb-2">
          Không tìm thấy việc làm
        </p>
        <p className="text-gray-400 mb-6">
          Vị trí này có thể đã hết hạn hoặc không tồn tại.
        </p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-5 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
        >
          Xem tất cả việc làm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => navigate("/jobs")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`w-16 h-16 rounded-2xl ${job.logoColor} text-white font-bold text-2xl flex items-center justify-center shrink-0`}
              >
                {job.logo}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <p className="text-gray-500 mt-1">
                  {job.company} · {job.location}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setApplied(true)}
              disabled={applied}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm transition-all ${
                applied
                  ? "bg-green-600 cursor-default"
                  : "bg-blue-700 hover:bg-blue-800 active:scale-[0.99]"
              }`}
            >
              {applied ? "✓ Đã nộp đơn ứng tuyển" : "Ứng tuyển ngay"}
            </button>
          </div>

          {/* Mô tả */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Mô tả công việc
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              {job.description}
            </p>
          </div>

          {/* Yêu cầu */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Yêu cầu ứng viên
            </h2>
            <ul className="space-y-2">
              {job.requirements.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Quyền lợi */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Quyền lợi</h2>
            <ul className="space-y-2">
              {job.benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Thông tin chung</h3>
            <div className="space-y-3">
              {[
                {
                  label: "Mức lương",
                  value: job.salary,
                  color: "text-green-600 font-bold",
                },
                {
                  label: "Địa điểm",
                  value: job.location,
                  color: "text-gray-700",
                },
                { label: "Hình thức", value: job.type, color: "text-gray-700" },
                {
                  label: "Kinh nghiệm",
                  value: job.experience,
                  color: "text-gray-700",
                },
                { label: "Cấp bậc", value: job.level, color: "text-gray-700" },
                {
                  label: "Hạn nộp",
                  value: job.deadline,
                  color: "text-red-500",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-gray-400">{label}</span>
                  <span className={color}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <p className="text-sm font-semibold text-blue-800 mb-1">
              Còn chần chừ?
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Hàng trăm ứng viên đã nộp đơn. Đừng bỏ lỡ cơ hội này!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
