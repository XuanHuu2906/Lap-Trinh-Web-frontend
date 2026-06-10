import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { WORK_LOCATION_OPTIONS } from "../../constants/locations";
import { createJob, type ExperienceLevel, type JobType } from "../../services/recruiter.service";

const jobTypeOptions: Array<{ label: string; value: JobType }> = [
  { label: "Toàn thời gian", value: "full-time" },
  { label: "Bán thời gian", value: "part-time" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Freelance", value: "freelance" },
  { label: "Thực tập", value: "internship" },
];

const experienceOptions: Array<{ label: string; value: ExperienceLevel }> = [
  { label: "Entry", value: "entry" },
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
  { label: "Director", value: "director" },
];

const toOptionalNumber = (value: string) => {
  if (!value.trim()) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export function PostJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState<JobType | "">("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryUnit, setSalaryUnit] = useState<"VND" | "USD">("VND");
  const [expiresAt, setExpiresAt] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!jobType) {
      setError("Vui lòng chọn loại hình công việc");
      return;
    }

    setLoading(true);

    try {
      await createJob({
        title,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        location: location || null,
        salaryMin: toOptionalNumber(salaryMin),
        salaryMax: toOptionalNumber(salaryMax),
        salaryUnit,
        jobType,
        experienceLevel: experienceLevel || null,
        expiresAt: expiresAt || null,
      });

      setMessage("Đăng tin tuyển dụng thành công");
      setTimeout(() => navigate("/recruiter/manage-jobs"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight text-slate-900">Đăng tin tuyển dụng</h1>
        <p className="text-[14px] text-slate-500 mt-1">Form này gọi API POST /api/jobs của recruiter.</p>
      </div>

      {(message || error) && (
        <div className={`mb-5 border px-4 py-3 text-[13px] ${error ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_280px] gap-6 items-start">
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-5">Thông tin cơ bản</h2>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tiêu đề công việc *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vd: Senior Frontend Engineer"
                className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Loại hình công việc *</label>
                <select
                  required
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType | "")}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none text-slate-600 bg-white"
                >
                  <option value="">Chọn loại hình...</option>
                  {jobTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Kinh nghiệm</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | "")}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none text-slate-600 bg-white"
                >
                  <option value="">Chọn kinh nghiệm...</option>
                  {experienceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Địa điểm</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700 bg-white cursor-pointer"
                >
                  <option value="">Chọn địa điểm...</option>
                  {WORK_LOCATION_OPTIONS.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Hạn nộp</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lương tối thiểu</label>
                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lương tối đa</label>
                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Đơn vị</label>
                <select
                  value={salaryUnit}
                  onChange={(e) => setSalaryUnit(e.target.value as "VND" | "USD")}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none text-slate-600 bg-white"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 space-y-5">
            <h2 className="text-[14px] font-bold text-slate-800">Mô tả chi tiết</h2>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mô tả công việc *</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-400 text-slate-700 resize-y"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Yêu cầu</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-400 text-slate-700 resize-y"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Quyền lợi</label>
              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-400 text-slate-700 resize-y"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 sticky top-6">
          <h2 className="text-[14px] font-bold text-slate-800 mb-3">Xuất bản</h2>
          <p className="text-[13px] text-slate-500 mb-5">Backend hiện tạo tin với trạng thái active theo đúng phân công.</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#0f1f3d] text-white text-[13px] font-bold hover:bg-[#1a2f52] disabled:opacity-60"
          >
            {loading ? "ĐANG ĐĂNG..." : "ĐĂNG TIN NGAY"}
          </button>
        </div>
      </form>
    </div>
  );
}
