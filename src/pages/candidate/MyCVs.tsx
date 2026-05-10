import { useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Download,
  Trash2,
  Lightbulb,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const cvList = [
  {
    id: 1,
    name: "CV Kỹ sư phần mềm",
    subtitle: "Bản đầy đủ (Tiếng Anh)",
    updatedAt: "15 Tháng 10, 2023",
    bgClass: "bg-gradient-to-br from-blue-100 to-blue-50",
    lineColors: ["bg-gray-700", "bg-gray-400", "bg-gray-300"],
  },
  {
    id: 2,
    name: "CV Marketing Specialist",
    subtitle: "Bản tóm tắt (Tiếng Việt)",
    updatedAt: "02 Tháng 10, 2023",
    bgClass: "bg-gradient-to-br from-gray-100 to-gray-50",
    lineColors: ["bg-gray-700", "bg-gray-400", "bg-gray-300"],
  },
  {
    id: 3,
    name: "CV Senior Designer",
    subtitle: "Bản danh mục tác phẩm",
    updatedAt: "28 Tháng 09, 2023",
    bgClass: "bg-gradient-to-br from-slate-100 to-slate-50",
    lineColors: ["bg-gray-700", "bg-gray-400", "bg-gray-300"],
  },
];

const tips = [
  {
    icon: Lightbulb,
    title: "Mẹo nhỏ cho bạn",
    desc: "Cập nhật CV thường xuyên giúp hồ sơ của bạn nổi bật hơn trong mắt nhà tuyển dụng.",
    color: "text-yellow-500 bg-yellow-50",
  },
  {
    icon: BarChart2,
    title: "Lượt xem hồ sơ",
    desc: "Có 12 nhà tuyển dụng đã xem hồ sơ 'CV Kỹ sư phần mềm' trong tuần qua.",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: CheckCircle,
    title: "Hồ sơ hoàn thiện",
    desc: "Hồ sơ của bạn đạt mức độ hoàn thiện 90%. Thêm dự án để đạt 100%.",
    color: "text-green-500 bg-green-50",
    progress: 90,
  },
];

// Tiny SVG CV preview thumbnail
function CVThumbnail({
  bgClass,
  lineColors,
}: {
  bgClass: string;
  lineColors: string[];
}) {
  return (
    <div
      className={`w-full h-full ${bgClass} rounded-sm p-2 flex flex-col gap-1.5`}
    >
      <div className={`h-2 w-3/4 rounded-sm ${lineColors[0]}`} />
      <div className={`h-1 w-1/2 rounded-sm ${lineColors[1]}`} />
      <div className="flex-1 flex flex-col gap-1 mt-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-sm ${lineColors[2]}`}
            // eslint-disable-next-line react-hooks/purity
            style={{ width: `${70 + Math.random() * 25}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Circular progress SVG
function CircularProgress({ pct }: { pct: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-600">
        {pct}%
      </span>
    </div>
  );
}

export default function MyCVs() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState(cvList);

  const handleDelete = (id: number) => {
    setCvs((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý và tối ưu hóa hồ sơ năng lực chuyên nghiệp của bạn.
          </p>
        </div>
        <button
          onClick={() => navigate("/candidate/cv-builder")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Tạo CV mới
        </button>
      </div>

      {/* CV list table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">
                  Bản xem trước
                </th>
                <th className="px-5 py-3 text-left font-medium">Tên hồ sơ</th>
                <th className="px-5 py-3 text-left font-medium">
                  Cập nhật lần cuối
                </th>
                <th className="px-5 py-3 text-left font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cvs.map((cv) => (
                <tr
                  key={cv.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <td className="px-5 py-4 w-24">
                    <div className="w-14 h-20 rounded border border-gray-200 overflow-hidden shadow-sm">
                      <CVThumbnail
                        bgClass={cv.bgClass}
                        lineColors={cv.lineColors}
                      />
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{cv.name}</p>
                    <p className="text-xs text-gray-400">{cv.subtitle}</p>
                  </td>

                  <td className="px-5 py-4 text-gray-500">{cv.updatedAt}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/candidate/cv-builder?id=${cv.id}`)
                        }
                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                        title="Tải xuống"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cv.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cvs.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">
              Bạn chưa tạo CV nào. Hãy tạo CV đầu tiên!
            </p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Đang hiển thị {cvs.length} trên tổng số {cvList.length} hồ sơ
        </div>
      </div>

      {/* Tips & Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tips.map(({ icon: Icon, title, desc, color, progress }) => (
          <div
            key={title}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-start gap-3">
              {progress !== undefined ? (
                <CircularProgress pct={progress} />
              ) : (
                <div
                  className={`${color} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}
                >
                  <Icon size={18} />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
