import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { applicationService } from "@/services/application.service";
import { clearCandidateDashboardCache } from "@/services/candidate-dashboard-cache";
import { chatService } from "@/services/chat.service";
import { cvService, type CandidateCV } from "@/services/cv.service";
import { jobService } from "@/services/job.service";
import { savePendingApplyJob } from "@/services/job-application-flow";
import type { Job } from "@/types/job.type";
import { formatJobTypeLabel } from "@/utils/job-type-labels";

type LocationState = {
  openApplyForm?: boolean;
};

type ApplyFormState = {
  cvId: string;
  coverLetter: string;
};

type JobDetailVariant = "public" | "candidate";

type JobDetailStyle = {
  page: string;
  grid: string;
  card: string;
  heroCard: string;
  companyCard: string;
  heading: string;
  muted: string;
  backButton: string;
  tag: string;
  logo: string;
  primaryButton: string;
  modalPrimaryButton: string;
  modalPanel: string;
  modalSection: string;
  formControl: string;
  outlineButton: string;
  infoDivider: string;
};

const jobDetailStyles: Record<JobDetailVariant, JobDetailStyle> = {
  public: {
    page: "mx-auto w-full max-w-5xl px-4 py-10",
    grid: "grid grid-cols-1 gap-7 lg:grid-cols-[1fr_330px]",
    card:
      "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900",
    heroCard:
      "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900",
    companyCard:
      "rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30",
    heading: "text-slate-950 dark:text-white",
    muted: "text-slate-500 dark:text-slate-400",
    backButton:
      "mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300",
    tag: "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    logo:
      "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-sm",
    primaryButton:
      "flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70",
    modalPrimaryButton:
      "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60",
    modalPanel:
      "w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950",
    modalSection:
      "rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900",
    formControl:
      "w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white",
    outlineButton:
      "rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900",
    infoDivider:
      "border-b border-slate-200 pb-3 last:border-0 last:pb-0 dark:border-slate-800",
  },
  candidate: {
    page: "mx-auto w-full max-w-6xl",
    grid: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]",
    card:
      "border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900",
    heroCard:
      "border border-slate-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-xs dark:border-slate-800 dark:border-l-blue-500 dark:bg-slate-900",
    companyCard:
      "border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30",
    heading: "text-slate-950 dark:text-white",
    muted: "text-slate-500 dark:text-slate-400",
    backButton:
      "mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300",
    tag: "bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    logo:
      "flex h-16 w-16 shrink-0 items-center justify-center bg-blue-600 text-2xl font-bold text-white shadow-sm",
    primaryButton:
      "flex w-full items-center justify-center gap-2 bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70",
    modalPrimaryButton:
      "inline-flex items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60",
    modalPanel:
      "w-full max-w-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950",
    modalSection:
      "border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900",
    formControl:
      "w-full border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white",
    outlineButton:
      "border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900",
    infoDivider:
      "border-b border-slate-200 pb-3 last:border-0 last:pb-0 dark:border-slate-800",
  },
};

function formatSalary(job: Job) {
  if (job.salaryUnit === "negotiable") return "Thỏa thuận";
  if (!job.salaryMin && !job.salaryMax) return "Thỏa thuận";

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  if (job.salaryMin && job.salaryMax) {
    return `${formatter.format(Number(job.salaryMin))} - ${formatter.format(Number(job.salaryMax))}`;
  }

  if (job.salaryMin) return `Từ ${formatter.format(Number(job.salaryMin))}`;

  return `Đến ${formatter.format(Number(job.salaryMax))}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Không giới hạn";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function getCompanyName(job: Job) {
  return job.recruiter?.recruiterProfile?.companyName || "Nhà tuyển dụng";
}

function getTags(job: Job) {
  return job.skills?.map((item) => item.skill.name).filter(Boolean) ?? [];
}

function splitLines(value?: string | null) {
  return (
    value
      ?.split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

function getDefaultCvId(cvs: CandidateCV[]) {
  const activeCv = cvs.find((cv) => cv.status === "active");

  return String(activeCv?.id || cvs[0]?.id || "");
}

function getCvLabel(cv: CandidateCV) {
  const typeLabel =
    cv.cvType === "uploaded" ? "PDF tải lên" : "CV tạo trong hệ thống";
  const statusLabel = cv.status === "active" ? " - hồ sơ chính" : "";

  return `${cv.title} (${typeLabel}${statusLabel})`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
      };
    };
  };
  const status = apiError.response?.status;
  const backendMessage = apiError.response?.data?.message;

  if (backendMessage) return backendMessage;
  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại rồi thử ứng tuyển.";
  }
  if (status === 403) {
    return "Tài khoản của bạn không có quyền thực hiện thao tác này.";
  }
  if (status === 500) {
    return "Backend đang lỗi khi xử lý yêu cầu. Hãy kiểm tra log backend để biết nguyên nhân thật.";
  }

  return fallback;
}

function ApplyConfirmationModal({
  job,
  cvs,
  formState,
  isLoadingCVs,
  isApplying,
  applyMessage,
  onChange,
  onClose,
  onSubmit,
  onCreateCV,
  styles,
}: {
  job: Job;
  cvs: CandidateCV[];
  formState: ApplyFormState;
  isLoadingCVs: boolean;
  isApplying: boolean;
  applyMessage: string | null;
  onChange: (nextState: ApplyFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  onCreateCV: () => void;
  styles: JobDetailStyle;
}) {
  const companyName = getCompanyName(job);
  const selectedCv = cvs.find((cv) => String(cv.id) === formState.cvId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className={styles.modalPanel}>
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Xác nhận ứng tuyển
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Kiểm tra thông tin trước khi gửi hồ sơ cho nhà tuyển dụng.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className={styles.modalSection}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Vị trí sẽ ứng tuyển
            </p>
            <h3 className="mt-2 font-bold text-slate-950 dark:text-white">
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {companyName} / {job.location || "Chưa cập nhật địa điểm"}
            </p>
          </section>

          {isLoadingCVs ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách CV...
            </div>
          ) : cvs.length === 0 ? (
            <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-950 dark:bg-amber-950/30 dark:text-amber-300">
              Bạn chưa có CV nào. Hãy tạo hoặc upload CV trước khi ứng tuyển.
            </div>
          ) : (
            <>
              <label>
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Chọn CV gửi cho nhà tuyển dụng
                </span>
                <select
                  value={formState.cvId}
                  onChange={(event) =>
                    onChange({ ...formState, cvId: event.target.value })
                  }
                  className={`h-11 ${styles.formControl}`}
                >
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {getCvLabel(cv)}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCv ? (
                <div className="flex items-start gap-3 border border-slate-200 p-3 dark:border-slate-800">
                  <FileText className="mt-0.5 h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {selectedCv.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Loại CV:{" "}
                      {selectedCv.cvType === "uploaded"
                        ? "PDF tải lên"
                        : "CV tạo trong hệ thống"}
                      {selectedCv.status === "active" ? " / Hồ sơ chính" : ""}
                    </p>
                  </div>
                </div>
              ) : null}

              <label>
                <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Thư giới thiệu ngắn
                </span>
                <textarea
                  value={formState.coverLetter}
                  onChange={(event) =>
                    onChange({ ...formState, coverLetter: event.target.value })
                  }
                  rows={5}
                  placeholder="Viết vài dòng giới thiệu lý do bạn phù hợp với vị trí này..."
                  className={`resize-none py-2 ${styles.formControl}`}
                />
              </label>
            </>
          )}

          {applyMessage ? (
            <p className="text-sm text-red-500">{applyMessage}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={styles.outlineButton}
          >
            Hủy
          </button>

          {cvs.length === 0 && !isLoadingCVs ? (
            <button
              type="button"
              onClick={onCreateCV}
              className={styles.modalPrimaryButton}
            >
              Tạo CV
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isApplying || !formState.cvId || isLoadingCVs}
              className={styles.modalPrimaryButton}
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Đồng ý gửi hồ sơ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobDetail({
  variant = "public",
}: {
  variant?: JobDetailVariant;
}) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const locationState = (location.state || {}) as LocationState;
  const isCandidateLayout = variant === "candidate";
  const backPath = isCandidateLayout ? "/candidate/job-search" : "/jobs";

  const [job, setJob] = useState<Job | null>(null);
  const [candidateCVs, setCandidateCVs] = useState<CandidateCV[]>([]);
  const [applyForm, setApplyForm] = useState<ApplyFormState>({
    cvId: "",
    coverLetter: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCVs, setIsLoadingCVs] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      const jobId = Number(id);
      if (!Number.isInteger(jobId) || jobId <= 0) {
        setError("ID việc làm không hợp lệ.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await jobService.getJobById(jobId);
        if (isMounted) setJob(response.data);
      } catch {
        if (isMounted) {
          setError("Không tìm thấy việc làm hoặc backend chưa sẵn sàng.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!locationState.openApplyForm || !job) return;

    if (!isAuthenticated || !user) {
      savePendingApplyJob(job.id);
      navigate("/login", { replace: true });
      return;
    }

    if (user.role === "candidate") {
      setIsApplyModalOpen(true);
      navigate(location.pathname, { replace: true });
      return;
    }

    setApplyMessage("Chá»‰ tĂ i khoáº£n á»©ng viĂªn má»›i cĂ³ thá»ƒ á»©ng tuyá»ƒn.");
    navigate(location.pathname, { replace: true });
  }, [
    isAuthenticated,
    job,
    location.pathname,
    locationState.openApplyForm,
    navigate,
    user,
    user?.role,
  ]);

  useEffect(() => {
    if (!isApplyModalOpen || user?.role !== "candidate") return;

    let isMounted = true;

    const loadCandidateCVs = async () => {
      try {
        setIsLoadingCVs(true);
        setApplyMessage(null);

        const response = await cvService.getMyCVs(true);

        if (isMounted) {
          setCandidateCVs(response.data);
          setApplyForm((current) => ({
            ...current,
            cvId: current.cvId || getDefaultCvId(response.data),
          }));
        }
      } catch (loadError) {
        if (isMounted) {
          setApplyMessage(
            getApiErrorMessage(loadError, "Không thể tải danh sách CV của bạn."),
          );
        }
      } finally {
        if (isMounted) setIsLoadingCVs(false);
      }
    };

    loadCandidateCVs();

    return () => {
      isMounted = false;
    };
  }, [isApplyModalOpen, user?.role]);

  const handleOpenApplyModal = () => {
    if (!job) return;

    if (!isAuthenticated || !user) {
      savePendingApplyJob(job.id);
      navigate("/login");
      return;
    }

    if (user.role !== "candidate") {
      setApplyMessage("Chỉ tài khoản ứng viên mới có thể ứng tuyển.");
      return;
    }

    setApplyMessage(null);
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!job || !applyForm.cvId) return;

    try {
      setIsApplying(true);
      setApplyMessage(null);

      await applicationService.applyToJob({
        jobPostingId: job.id,
        cvId: Number(applyForm.cvId),
        coverLetter: applyForm.coverLetter.trim() || null,
      });

      clearCandidateDashboardCache();
      setIsApplyModalOpen(false);

      const recruiterProfileId = job.recruiter?.recruiterProfile?.id;
      if (recruiterProfileId) {
        try {
          const conversation = await chatService.createConversation({
            recruiterProfileId,
            jobPostingId: job.id,
          });
          navigate(`/candidate/chat?conversationId=${conversation.id}`);
          return;
        } catch (chatError) {
          console.error("Khong the mo cuoc tro chuyen sau khi ung tuyen:", chatError);
        }
      }

      navigate("/candidate/applied-jobs");
    } catch (applyError) {
      setApplyMessage(
        getApiErrorMessage(applyError, "Không thể ứng tuyển vị trí này."),
      );
    } finally {
      setIsApplying(false);
    }
  };

  const styles = jobDetailStyles[variant];

  const jobInfoItems = useMemo(() => {
    if (!job) return [];

    return [
      { label: "Mức lương", value: formatSalary(job) },
      { label: "Địa điểm", value: job.location || "Chưa cập nhật" },
      { label: "Hình thức", value: formatJobTypeLabel(job.jobType) },
      {
        label: "Kinh nghiệm",
        value: job.experienceLevel || "Chưa cập nhật",
      },
      {
        label: "Ngành nghề",
        value: job.category?.name || "Chưa cập nhật",
      },
      { label: "Hạn nộp", value: formatDate(job.expiresAt) },
    ];
  }, [job]);

  if (isLoading) {
    return (
      <div
        className={`${styles.page} flex min-h-80 items-center justify-center gap-2 ${styles.muted}`}
      >
        <Loader2 className="animate-spin" size={20} />
        Đang tải chi tiết việc làm...
      </div>
    );
  }

  if (!job) {
    return (
      <div className={`${styles.page} py-20 text-center`}>
        <BriefcaseBusiness className="mx-auto mb-4 text-slate-500" size={46} />
        <p className={`mb-2 text-2xl font-bold ${styles.heading}`}>
          Không tìm thấy việc làm
        </p>
        <p className={`mb-6 ${styles.muted}`}>
          {error || "Vị trí này có thể đã hết hạn hoặc không tồn tại."}
        </p>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const companyName = getCompanyName(job);
  const companyPath = isCandidateLayout
    ? `/candidate/companies/${job.recruiterId}`
    : `/companies/${job.recruiterId}`;
  const tags = getTags(job);
  const requirements = splitLines(job.requirements);
  const benefits = splitLines(job.benefits);

  return (
    <div className={styles.page}>
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className={styles.backButton}
      >
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <div className={styles.grid}>
        <div className="space-y-5">
          <section className={styles.heroCard}>
            <div className="mb-5 flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate(companyPath)}
                title={`Xem hồ sơ ${companyName}`}
                className="group/logo shrink-0 rounded-2xl shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-blue-400 dark:ring-slate-700"
              >
                <CompanyLogo
                  name={companyName}
                  logoUrl={job.recruiter?.recruiterProfile?.logoUrl}
                  className="h-16 w-16 rounded-2xl text-2xl group-hover/logo:bg-blue-50"
                  imageClassName="p-2"
                />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${styles.heading}`}>
                  {job.title}
                </h1>
                <div className={`mt-1 ${styles.muted}`}>
                  <button
                    type="button"
                    onClick={() => navigate(companyPath)}
                    className="group/company inline-flex items-center gap-1.5 font-semibold transition hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    {companyName}
                    <span className="text-xs opacity-0 transition group-hover/company:opacity-100">
                      ↗
                    </span>
                  </button>
                  {" / "}
                  {job.location || "Chưa cập nhật"}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={styles.tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenApplyModal}
              disabled={isApplying}
              className={styles.primaryButton}
            >
              <CheckCircle2 size={18} />
              {isAuthenticated ? "Ứng tuyển" : "Đăng nhập để ứng tuyển"}
            </button>

            {applyMessage && !isApplyModalOpen ? (
              <p className="mt-3 text-center text-sm text-red-500">
                {applyMessage}
              </p>
            ) : null}
          </section>

          <section className={styles.card}>
            <h2 className={`mb-3 text-lg font-bold ${styles.heading}`}>
              Mô tả công việc
            </h2>
            <p className={`whitespace-pre-line text-sm leading-7 ${styles.muted}`}>
              {job.description}
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={`mb-3 text-lg font-bold ${styles.heading}`}>
              Yêu cầu ứng viên
            </h2>
            {requirements.length > 0 ? (
              <ul className="space-y-2">
                {requirements.map((item) => (
                  <li
                    key={item}
                    className={`flex gap-2 text-sm leading-6 ${styles.muted}`}
                  >
                    <span className="text-blue-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${styles.muted}`}>Chưa cập nhật.</p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={`mb-3 text-lg font-bold ${styles.heading}`}>
              Quyền lợi
            </h2>
            {benefits.length > 0 ? (
              <ul className="space-y-2">
                {benefits.map((item) => (
                  <li
                    key={item}
                    className={`flex gap-2 text-sm leading-6 ${styles.muted}`}
                  >
                    <span className="text-green-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm ${styles.muted}`}>Chưa cập nhật.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className={styles.card}>
            <h3 className={`mb-4 font-bold ${styles.heading}`}>Thông tin chung</h3>
            <div className="space-y-3">
              {jobInfoItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between gap-4 text-sm ${styles.infoDivider}`}
                >
                  <span className={styles.muted}>{item.label}</span>
                  <span
                    className={`max-w-48 text-right font-semibold ${styles.heading}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => navigate(companyPath)}
            className={`${styles.companyCard} group block w-full overflow-hidden text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-md dark:hover:border-blue-700 dark:hover:bg-blue-950/50`}
          >
            <div className="flex items-center gap-3">
              <CompanyLogo
                name={companyName}
                logoUrl={job.recruiter?.recruiterProfile?.logoUrl}
                className="h-12 w-12 rounded-xl text-base shadow-sm ring-1 ring-blue-100 dark:ring-blue-900"
                imageClassName="p-1.5"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  Nhà tuyển dụng
                </p>
                <p className="mt-0.5 truncate font-bold text-blue-900 dark:text-blue-100">
                  {companyName}
                </p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
                  {job._count
                    ? `${job._count.applications} hồ sơ đã ứng tuyển`
                    : "Xem thông tin doanh nghiệp"}
                </p>
              </div>
              <span className="text-lg text-blue-600 transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </button>
        </aside>
      </div>

      {isApplyModalOpen ? (
        <ApplyConfirmationModal
          job={job}
          cvs={candidateCVs}
          formState={applyForm}
          isLoadingCVs={isLoadingCVs}
          isApplying={isApplying}
          applyMessage={applyMessage}
          onChange={setApplyForm}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={handleSubmitApplication}
          onCreateCV={() => navigate("/candidate/cv-templates")}
          styles={styles}
        />
      ) : null}
    </div>
  );
}
