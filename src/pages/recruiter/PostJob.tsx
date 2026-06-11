import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  createJob,
  type ExperienceLevel,
  type JobType,
} from "../../services/recruiter.service";

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
  const [experienceLevel, setExperienceLevel] = useState<
    ExperienceLevel | ""
  >("");
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

    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      setError("Lương tối thiểu không được lớn hơn lương tối đa");
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

      setTimeout(() => {
        navigate("/recruiter/manage-jobs");
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight text-slate-900 dark:text-white">
          Đăng tin tuyển dụng
        </h1>

        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-300">
          Tạo tin tuyển dụng mới với đầy đủ thông tin vị trí, yêu cầu và quyền lợi.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`mb-5 border px-4 py-3 text-[13px] ${
            error
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-[1fr_280px] items-start gap-6"
      >
        <div className="space-y-5">
          <div className="border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-[14px] font-bold text-slate-800">
              Thông tin cơ bản
            </h2>

            <div className="mb-4">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Tiêu đề công việc *
              </label>

              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Vd: Senior Frontend Engineer"
                className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Loại hình công việc *
                </label>

                <select
                  required
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType | "")}
                  className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none"
                >
                  <option value="">Chọn loại hình...</option>
                  {jobTypeOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Kinh nghiệm
                </label>

                <select
                  value={experienceLevel}
                  onChange={(e) =>
                    setExperienceLevel(e.target.value as ExperienceLevel | "")
                  }
                  className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none"
                >
                  <option value="">Chọn kinh nghiệm...</option>
                  {experienceOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Địa điểm
                </label>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Vd: Hà Nội, TP.HCM hoặc Remote"
                  className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Hạn nộp
                </label>

                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Lương tối thiểu
                </label>

                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="VD: 10000000"
                  className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Lương tối đa
                </label>

                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="VD: 20000000"
                  className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Đơn vị
                </label>

                <select
                  value={salaryUnit}
                  onChange={(e) =>
                    setSalaryUnit(e.target.value as "VND" | "USD")
                  }
                  className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-5 border border-slate-200 bg-white p-6">
            <h2 className="text-[14px] font-bold text-slate-800">
              Mô tả chi tiết
            </h2>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Mô tả công việc *
              </label>

              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Mô tả nhiệm vụ, trách nhiệm và mục tiêu của vị trí..."
                className="w-full resize-y border border-slate-200 px-4 py-3 text-[14px] text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Yêu cầu
              </label>

              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                placeholder="Nhập kỹ năng, kinh nghiệm, bằng cấp hoặc yêu cầu cần có..."
                className="w-full resize-y border border-slate-200 px-4 py-3 text-[14px] text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Quyền lợi
              </label>

              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                rows={4}
                placeholder="Nhập chế độ đãi ngộ, phúc lợi, môi trường làm việc..."
                className="w-full resize-y border border-slate-200 px-4 py-3 text-[14px] text-slate-700 outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="sticky top-6 border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-[14px] font-bold text-slate-800">
            Xuất bản
          </h2>

          <p className="mb-5 text-[13px] leading-relaxed text-slate-500">
            Kiểm tra kỹ thông tin trước khi đăng để ứng viên hiểu rõ vị trí và yêu cầu công việc.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-[#0f1f3d] text-[13px] font-bold text-white hover:bg-[#1a2f52] disabled:opacity-60"
          >
            {loading ? "ĐANG ĐĂNG..." : "ĐĂNG TIN NGAY"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/recruiter/manage-jobs")}
            className="mt-3 h-10 w-full border border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            Quay lại quản lý tin
          </button>
        </div>
      </form>
    </div>
  );
}