import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { jobService } from "../../services/job.service";
import {
  createJob,
  getMyJobDetail,
  updateJob,
  type CreateJobPayload,
  type ExperienceLevel,
  type JobType,
} from "../../services/recruiter.service";

type CategoryOption = {
  id: number;
  name: string;
  children?: CategoryOption[];
};

type FlatCategoryOption = {
  id: number;
  name: string;
  label: string;
};

type SkillOption = {
  id: number;
  name: string;
};

type WorkMode = "onsite" | "remote" | "hybrid";

type SubmitStatus = "active" | "draft";

const employmentTypeOptions: Array<{ label: string; value: JobType }> = [
  { label: "Toàn thời gian", value: "full-time" },
  { label: "Bán thời gian", value: "part-time" },
  { label: "Freelance", value: "freelance" },
  { label: "Thực tập", value: "internship" },
];

const workModeOptions: Array<{ label: string; value: WorkMode }> = [
  { label: "Onsite", value: "onsite" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

const experienceOptions: Array<{ label: string; value: ExperienceLevel }> = [
  { label: "Entry", value: "entry" },
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
  { label: "Director", value: "director" },
];

const flattenCategories = (categories: CategoryOption[]): FlatCategoryOption[] =>
  categories.flatMap((category) => [
    { id: category.id, name: category.name, label: category.name },
    ...(category.children || []).map((child) => ({
      id: child.id,
      name: child.name,
      label: `${category.name} / ${child.name}`,
    })),
  ]);

const parseSalaryInput = (value: string, label: string) => {
  if (!value.trim()) return { value: null };

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return { value: null, error: `${label} phải là số hợp lệ` };
  }

  if (numberValue <= 0) {
    return { value: null, error: `${label} phải là số dương` };
  }

  return { value: numberValue };
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const todayInputValue = () => {
  const today = new Date();
  const timezoneOffsetMs = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
};

export function PostJobPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const parsedJobId = id ? Number(id) : NaN;
  const hasEditParam = id !== undefined;
  const isEditing = hasEditParam && Number.isInteger(parsedJobId) && parsedJobId > 0;
  const duplicateFromParam = searchParams.get("duplicateFrom");
  const parsedDuplicateJobId = duplicateFromParam ? Number(duplicateFromParam) : NaN;
  const isDuplicating =
    !hasEditParam &&
    Number.isInteger(parsedDuplicateJobId) &&
    parsedDuplicateJobId > 0;
  const focusField = searchParams.get("focus");
  const expiresAtInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [jobType, setJobType] = useState<JobType | "">("");
  const [experienceLevel, setExperienceLevel] = useState<
    ExperienceLevel | ""
  >("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryUnit, setSalaryUnit] = useState<"VND" | "USD">("VND");
  const [salaryNegotiable, setSalaryNegotiable] = useState(false);
  const [workMode, setWorkMode] = useState<WorkMode>("onsite");
  const [expiresAt, setExpiresAt] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | "">("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await jobService.getCategories();
        setCategories(response.data ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không tải được danh sách ngành nghề",
        );
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const response = await jobService.getSkills();
        setSkills(response.data ?? []);
      } catch (err) {
        console.error("Khong tai duoc danh sach ky nang:", err);
      }
    };

    void loadSkills();
  }, []);

  useEffect(() => {
    const loadJob = async () => {
      const sourceJobId = isEditing
        ? parsedJobId
        : isDuplicating
          ? parsedDuplicateJobId
          : NaN;

      if (!hasEditParam && !isDuplicating) return;

      if (!Number.isInteger(sourceJobId) || sourceJobId <= 0) {
        setError(
          isDuplicating
            ? "ID tin cần nhân bản không hợp lệ"
            : "ID tin tuyển dụng không hợp lệ",
        );
        return;
      }

      setInitialLoading(true);
      setError("");

      try {
        const response = await getMyJobDetail(sourceJobId);
        const job = response.data;
        const sourceExpiresAt = toDateInputValue(job.expiresAt);
        const nextExpiresAt =
          isDuplicating && sourceExpiresAt < todayInputValue() ? "" : sourceExpiresAt;

        setTitle(isDuplicating ? `${job.title} (bản sao)` : job.title);
        setCategoryId(job.categoryId ? String(job.categoryId) : "");
        setJobType(job.jobType);
        setWorkMode(job.jobType === "remote" || job.jobType === "hybrid" ? job.jobType : "onsite");
        setExperienceLevel(job.experienceLevel || "");
        setLocation(job.location || "");
        setSalaryMin(job.salaryMin == null ? "" : String(job.salaryMin));
        setSalaryMax(job.salaryMax == null ? "" : String(job.salaryMax));
        setSalaryNegotiable(job.salaryMin == null && job.salaryMax == null);
        setSalaryUnit(job.salaryUnit || "VND");
        setExpiresAt(nextExpiresAt);
        setDescription(job.description);
        setRequirements(job.requirements || "");
        setBenefits(job.benefits || "");
        setSelectedSkillIds(
          job.skills?.map((item) => item.skill.id).filter((skillId) => Number.isInteger(skillId)) ?? [],
        );
        setMessage(
          isDuplicating
            ? "Đã sao chép thông tin tin tuyển dụng. Kiểm tra lại hạn nộp trước khi đăng."
            : "",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được tin tuyển dụng");
      } finally {
        setInitialLoading(false);
      }
    };

    void loadJob();
  }, [
    hasEditParam,
    isDuplicating,
    isEditing,
    parsedDuplicateJobId,
    parsedJobId,
  ]);

  useEffect(() => {
    if (initialLoading || focusField !== "expiresAt") return;

    expiresAtInputRef.current?.focus();
  }, [focusField, initialLoading]);

  const handleSalaryNegotiableChange = (checked: boolean) => {
    setSalaryNegotiable(checked);

    if (checked) {
      setSalaryMin("");
      setSalaryMax("");
    }
  };

  const handleWorkModeChange = (nextWorkMode: WorkMode) => {
    setWorkMode(nextWorkMode);

    if (nextWorkMode === "remote" || nextWorkMode === "hybrid") {
      setJobType(nextWorkMode);
    } else if (jobType === "remote" || jobType === "hybrid") {
      setJobType("");
    }
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId],
    );
  };

  const buildPayload = (status: SubmitStatus): CreateJobPayload | null => {
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề công việc");
      return null;
    }

    if (categoryOptions.length > 0 && !categoryId) {
      setError("Vui lòng chọn ngành nghề");
      return null;
    }

    if (!jobType) {
      setError("Vui lòng chọn loại hình công việc");
      return null;
    }

    if (!description.trim()) {
      setError("Vui lòng nhập mô tả công việc");
      return null;
    }

    if (status === "active" && !expiresAt) {
      setError("Vui lòng chọn hạn nộp hồ sơ trước khi đăng tin");
      return null;
    }

    if (expiresAt && expiresAt < todayInputValue()) {
      setError("Hạn nộp hồ sơ không được ở quá khứ");
      return null;
    }

    const parsedSalaryMin = salaryNegotiable
      ? { value: null }
      : parseSalaryInput(salaryMin, "Lương tối thiểu");
    const parsedSalaryMax = salaryNegotiable
      ? { value: null }
      : parseSalaryInput(salaryMax, "Lương tối đa");

    if (parsedSalaryMin.error || parsedSalaryMax.error) {
      setError(parsedSalaryMin.error || parsedSalaryMax.error || "");
      return null;
    }

    if (
      parsedSalaryMin.value != null &&
      parsedSalaryMax.value != null &&
      parsedSalaryMin.value > parsedSalaryMax.value
    ) {
      setError("Lương tối thiểu không được lớn hơn lương tối đa");
      return null;
    }

    return {
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim() || null,
      benefits: benefits.trim() || null,
      location: location.trim() || null,
      salaryMin: parsedSalaryMin.value,
      salaryMax: parsedSalaryMax.value,
      salaryUnit,
      jobType,
      experienceLevel: experienceLevel || null,
      categoryId: categoryId ? Number(categoryId) : null,
      expiresAt: expiresAt || null,
      skillIds: selectedSkillIds,
    };
  };

  const submitJob = async (status: SubmitStatus) => {
    if (loading || initialLoading) return;

    const payload = buildPayload(status);
    if (!payload) return;

    setLoading(true);
    setSubmitStatus(status);

    try {
      if (isEditing) {
        await updateJob(parsedJobId, payload);
        setMessage("Cập nhật tin tuyển dụng thành công");

        setTimeout(() => {
          navigate(`/recruiter/manage-jobs/${parsedJobId}`);
        }, 600);
      } else {
        await createJob({ ...payload, status });
        setMessage(
          status === "draft"
            ? "Lưu nháp tin tuyển dụng thành công"
            : "Đăng tin tuyển dụng thành công",
        );

        setTimeout(() => {
          navigate("/recruiter/manage-jobs");
        }, 600);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Cập nhật tin thất bại"
            : "Đăng tin thất bại",
      );
    } finally {
      setLoading(false);
      setSubmitStatus("");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitJob("active");
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight text-slate-900 dark:text-white">
          {isEditing
            ? "Chỉnh sửa tin tuyển dụng"
            : isDuplicating
              ? "Nhân bản tin tuyển dụng"
              : "Đăng tin tuyển dụng"}
        </h1>

        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-300">
          {isEditing
            ? "Cập nhật thông tin vị trí, yêu cầu và quyền lợi trước khi hiển thị cho ứng viên."
            : isDuplicating
              ? "Tạo tin mới từ dữ liệu đã có, kiểm tra lại thông tin trước khi xuất bản."
            : "Tạo tin tuyển dụng mới với đầy đủ thông tin vị trí, yêu cầu và quyền lợi."}
        </p>
      </div>

      {(message || error) && (
        <div
          className={`mb-5 border px-4 py-3 text-[13px] ${
            error
              ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              : "border-green-200 bg-green-50 text-green-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          }`}
        >
          {error || message}
        </div>
      )}

      {initialLoading && (
        <div className="border border-slate-200 bg-white px-6 py-10 text-center text-[13px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-500">
          Đang tải tin tuyển dụng...
        </div>
      )}

      {!initialLoading && (
        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-6 lg:grid-cols-[1fr_280px]"
        >
          <div className="space-y-5">
            <div className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="mb-5 text-[14px] font-bold text-slate-800 dark:text-slate-50">
                Thông tin cơ bản
              </h2>

              <div className="mb-4">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Tiêu đề công việc *
                </label>

                <input
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Vd: Senior Frontend Engineer"
                  className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                />
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Ngành nghề *
                  </label>

                  <select
                    required={categoryOptions.length > 0}
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Chọn ngành nghề...</option>
                    {categoryOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Loại hình công việc *
                  </label>

                  <select
                    required={workMode === "onsite"}
                    disabled={workMode !== "onsite"}
                    value={workMode === "onsite" ? jobType : ""}
                    onChange={(event) =>
                      setJobType(event.target.value as JobType | "")
                    }
                    className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
                  >
                    <option value="">Chọn loại hình...</option>
                    {employmentTypeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Kinh nghiệm
                  </label>

                  <select
                    value={experienceLevel}
                    onChange={(event) =>
                      setExperienceLevel(
                        event.target.value as ExperienceLevel | "",
                      )
                    }
                    className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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

              <div className="mb-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Địa điểm
                  </label>

                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Vd: Hà Nội, TP.HCM hoặc Remote"
                    className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Hình thức làm việc *
                  </label>

                  <select
                    required
                    value={workMode}
                    onChange={(event) =>
                      handleWorkModeChange(event.target.value as WorkMode)
                    }
                    className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {workModeOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Hạn nộp
                  </label>

                  <input
                    type="date"
                    ref={expiresAtInputRef}
                    min={todayInputValue()}
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                  />
                </div>
              </div>

              <label className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={salaryNegotiable}
                  onChange={(event) =>
                    handleSalaryNegotiableChange(event.target.checked)
                  }
                  className="h-4 w-4 border-slate-300 text-[#0f1f3d] focus:ring-[#0f1f3d]"
                />
                Lương thỏa thuận
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Lương tối thiểu
                  </label>

                  <input
                    type="number"
                    min="1"
                    disabled={salaryNegotiable}
                    value={salaryMin}
                    onChange={(event) => setSalaryMin(event.target.value)}
                    placeholder="VD: 10000000"
                    className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Lương tối đa
                  </label>

                  <input
                    type="number"
                    min="1"
                    disabled={salaryNegotiable}
                    value={salaryMax}
                    onChange={(event) => setSalaryMax(event.target.value)}
                    placeholder="VD: 20000000"
                    className="h-11 w-full border border-slate-200 px-4 text-[14px] text-slate-700 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600 dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Đơn vị
                  </label>

                  <select
                    value={salaryUnit}
                    disabled={salaryNegotiable}
                    onChange={(event) =>
                      setSalaryUnit(event.target.value as "VND" | "USD")
                    }
                    className="h-11 w-full border border-slate-200 bg-white px-4 text-[14px] text-slate-600 outline-none disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-600"
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Kỹ năng yêu cầu
                </label>

                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const selected = selectedSkillIds.includes(skill.id);

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleSkill(skill.id)}
                          className={`border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                            selected
                              ? "border-[#0f1f3d] bg-[#0f1f3d] text-white"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    disabled
                    placeholder="React, Node.js, PostgreSQL, TypeScript"
                    className="h-11 w-full border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
                  />
                )}
              </div>
            </div>

            <div className="space-y-5 border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/80">
              <h2 className="text-[14px] font-bold text-slate-800 dark:text-slate-50">
                Mô tả chi tiết
              </h2>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Mô tả công việc *
                </label>

                <textarea
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  placeholder={[
                    "- Tham gia phát triển API cho hệ thống tuyển dụng",
                    "- Phối hợp với frontend để tích hợp chức năng",
                    "- Tối ưu hiệu năng truy vấn dữ liệu",
                  ].join("\n")}
                  className="w-full resize-y border border-slate-200 px-4 py-3 text-[14px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Yêu cầu
                </label>

                <textarea
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  rows={4}
                  placeholder={[
                    "- Có kinh nghiệm với React, Node.js hoặc hệ sinh thái liên quan",
                    "- Nắm vững TypeScript và thiết kế REST API",
                    "- Chủ động trao đổi, phối hợp tốt trong nhóm",
                  ].join("\n")}
                  className="w-full resize-y border border-slate-200 px-4 py-3 text-[14px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Quyền lợi
                </label>

                <textarea
                  value={benefits}
                  onChange={(event) => setBenefits(event.target.value)}
                  rows={4}
                  placeholder={[
                    "- Lương thưởng cạnh tranh theo năng lực",
                    "- Bảo hiểm và ngày nghỉ theo quy định",
                    "- Môi trường làm việc rõ ràng, hỗ trợ phát triển chuyên môn",
                  ].join("\n")}
                  className="w-full resize-y border border-slate-200 px-4 py-3 text-[14px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="sticky top-6 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="mb-3 text-[14px] font-bold text-slate-800 dark:text-slate-50">
              {isEditing ? "Cập nhật" : "Xuất bản"}
            </h2>

            <p className="mb-5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              Kiểm tra kỹ thông tin trước khi lưu để ứng viên hiểu rõ vị trí và yêu cầu công việc.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-[#0f1f3d] text-[13px] font-bold text-white hover:bg-[#1a2f52] disabled:opacity-60"
            >
              {loading && submitStatus === "active"
                ? isEditing
                  ? "ĐANG CẬP NHẬT..."
                  : "ĐANG ĐĂNG..."
                : isEditing
                  ? "CẬP NHẬT TIN"
                  : "ĐĂNG TIN NGAY"}
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => void submitJob("draft")}
                disabled={loading}
                className="mt-3 h-10 w-full border border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {loading && submitStatus === "draft" ? "ĐANG LƯU..." : "LƯU NHÁP"}
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  isEditing
                    ? `/recruiter/manage-jobs/${parsedJobId}`
                    : "/recruiter/manage-jobs",
                )
              }
              className="mt-3 h-10 w-full border border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Quay lại quản lý tin
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
