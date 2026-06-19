import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useVisiblePolling } from "../../hooks/useVisiblePolling";
import { supabase } from "../../utils/supabase";
import {
  createEvaluation,
  createFeedback,
  getApplicationDetail,
  getRecruiterApplications,
  getMyJobs,
  scheduleInterview,
  updateApplicationStatus,
  type ApplicationStatus,
  type RecruiterApplication,
  type RecruiterJob,
} from "../../services/recruiter.service";
import { CandidateCVModal } from "../../components/cv/CandidateCVModal";
import {
  ApplicationDetailPanel,
  statusLabel,
  statusStyle,
  getFeedbackStatus,
  type NextApplicationStatus,
} from "../../components/recruiter/ApplicationDetailPanel";

// === TRANG QUẢN LÝ ỨNG VIÊN ===
// Hiển thị danh sách ứng viên đã ứng tuyển vào các tin của recruiter
// Cho phép lọc theo job, trạng thái, tìm kiếm tên/email
// Panel chi tiết bên cạnh cho phép: xem CV, gửi feedback, đặt lịch PV, đánh giá
// Polling realtime qua Supabase để cập nhật danh sách tự động

// Kiểu dữ liệu cho trạng thái feedback: interview (mời PV), hired (trúng tuyển) hoặc rejected (từ chối)
type FeedbackStatus = "interview" | "hired" | "rejected";

// Chuyển đổi URL param "status" thành ApplicationStatus filter
// Trả về "" nếu không khớp với bất kỳ trạng thái nào
const getStatusFilterFromParam = (
  value: string | null,
): ApplicationStatus | "" => {
  if (
    value === "pending" ||
    value === "reviewing" ||
    value === "interview" ||
    value === "confirmed" ||
    value === "hired" ||
    value === "rejected" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "";
};

// Format ngày tháng theo locale vi-VN
const formatDate = (value?: string | null) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN");
};

// Lấy tên ứng viên từ application: ưu tiên fullName, fallback email
const getCandidateName = (application: RecruiterApplication) => {
  return (
    application.candidateProfile?.fullName ||
    application.candidateProfile?.user?.email ||
    "Ứng viên chưa cập nhật tên"
  );
};

// Lấy tên job cho application: ưu tiên jobPosting.title, fallback tìm trong jobs list
const getApplicationJobTitle = (
  application: RecruiterApplication,
  jobs: RecruiterJob[],
) => {
  return (
    application.jobPosting?.title ||
    jobs.find((job) => job.id === application.jobPostingId)?.title ||
    "Chưa rõ tin ứng tuyển"
  );
};

/**
 * Component quản lý ứng viên
 * - Lọc theo job, trạng thái
 * - Tìm kiếm theo tên/email
 * - Chọn ứng viên để xem chi tiết trong panel bên cạnh
 * - Polling realtime mỗi 2 phút và qua Supabase subscription
 */
export function ManageCandidatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // jobIdParam: ID job từ URL, dùng để chọn sẵn job trong dropdown
  const jobIdParam = searchParams.get("jobId");
  // statusParam: trạng thái lọc từ URL
  const statusParam = getStatusFilterFromParam(searchParams.get("status"));
  // applicationIdParam: ID application từ URL (dùng khi điều hướng từ overview)
  const applicationIdParam = searchParams.get("applicationId");
  const hasDashboardTarget = Boolean(statusParam || applicationIdParam);

  // jobs: danh sách tin tuyển dụng của recruiter (để fill dropdown)
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  // selectedJobId: job đang được chọn trong dropdown ("" = tất cả)
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  // applications: danh sách đơn ứng tuyển từ API
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  // selectedApplication: application đang được xem trong panel chi tiết
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplication | null>(null);
  // previewApplication: application được chọn để xem CV (modal)
  const [previewApplication, setPreviewApplication] =
    useState<RecruiterApplication | null>(null);

  // search: từ khóa tìm kiếm ứng viên (lọc client theo tên/email)
  const [search, setSearch] = useState("");
  // statusFilter: bộ lọc trạng thái, khởi tạo từ URL param
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">(
    () => statusParam,
  );

  // State cho form trong ApplicationDetailPanel
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>("interview");
  const [score, setScore] = useState(3);
  const [notes, setNotes] = useState("");

  // loading: trạng thái tải danh sách applications
  const [loading, setLoading] = useState(false);
  // jobsLoading: trạng thái tải danh sách jobs
  const [jobsLoading, setJobsLoading] = useState(false);
  // message / error: thông báo kết quả
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // showJobColumn: có hiển thị cột "Tin ứng tuyển" trong bảng không
  const showJobColumn = selectedJobId === "";
  const tableColumnCount = showJobColumn ? 5 : 4;

  // Lọc applications theo từ khóa tìm kiếm (client-side)
  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return applications;

    return applications.filter((application) => {
      const name = getCandidateName(application).toLowerCase();
      const email =
        application.candidateProfile?.user?.email?.toLowerCase() ?? "";

      return name.includes(keyword) || email.includes(keyword);
    });
  }, [applications, search]);

  // Tải danh sách jobs và xác định selectedJobId từ URL param
  // Nếu jobIdParam khớp với một job có thật thì chọn job đó
  const loadJobs = async () => {
    setJobsLoading(true);
    setError("");

    try {
      const response = await getMyJobs({ page: 1, limit: 50, status: "" });
      const myJobs = response.data ?? [];
      const requestedJobId = jobIdParam ? Number(jobIdParam) : null;

      setJobs(myJobs);

      if (
        requestedJobId &&
        Number.isInteger(requestedJobId) &&
        myJobs.some((job) => job.id === requestedJobId)
      ) {
        setSelectedJobId(requestedJobId);
      } else if (hasDashboardTarget) {
        setSelectedJobId("");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách tin tuyển dụng",
      );
    } finally {
      setJobsLoading(false);
    }
  };

  // Tải danh sách applications từ API
  // options.showLoading: có hiển thị loading không (tắt khi polling)
  // options.updateError: có cập nhật error không (tắt khi polling)
  // Sau khi tải, refresh selectedApplication nếu đang được chọn
  const loadApplications = useCallback(async (
    options: { showLoading?: boolean; updateError?: boolean } = {},
  ) => {
    const { showLoading = true, updateError = true } = options;

    if (showLoading) setLoading(true);
    if (updateError) setError("");

    try {
      const response = await getRecruiterApplications({
        jobId: selectedJobId || undefined,
        page: 1,
        limit: 100,
        status: statusFilter,
      });

      const uniqueApplications = response.data ?? [];
      setApplications(uniqueApplications);

      if (selectedApplication) {
        const refreshed = uniqueApplications.find(
          (item) => item.id === selectedApplication.id,
        );

        setSelectedApplication(refreshed ?? null);
      }
    } catch (err) {
      if (updateError) {
        setError(
          err instanceof Error
            ? err.message
            : "Không tải được danh sách ứng viên",
        );
      } else {
        console.error("Loi polling danh sach ung vien:", err);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [selectedJobId, statusFilter, selectedApplication]);

  // useEffect: load jobs khi component mount hoặc jobIdParam thay đổi
  useEffect(() => {
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdParam, hasDashboardTarget]);

  // useEffect: đồng bộ statusFilter từ URL param
  useEffect(() => {
    setStatusFilter((current) =>
      current === statusParam ? current : statusParam,
    );
  }, [statusParam]);

  // useEffect: reload applications khi selectedJobId, statusFilter, hoặc jobs thay đổi
  useEffect(() => {
    void loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, statusFilter, jobs]);

  // Polling 2 phút khi có job được chọn (chỉ polling khi cần)
  useVisiblePolling(
    () =>
      loadApplications({
        showLoading: false,
        updateError: false,
      }),
    {
      enabled: Boolean(selectedJobId),
      intervalMs: 120_000,
    },
  );

  // Realtime subscription qua Supabase: cập nhật khi có thay đổi trong bảng applications
  // Lọc theo job_posting_id
  useEffect(() => {
    const client = supabase;
    if (!selectedJobId || !client) return;

    const channel = client
      .channel(`applications-job-${selectedJobId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `job_posting_id=eq.${selectedJobId}`,
        },
        () => {
          void loadApplications({
            showLoading: false,
            updateError: false,
          });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, statusFilter]);

  // Điền dữ liệu application vào form của panel chi tiết
  const hydrateApplicationForm = (application: RecruiterApplication) => {
    setSelectedApplication(application);
    setFeedback(application.feedbacks?.[0]?.content ?? "");
    setFeedbackStatus(getFeedbackStatus(application.status));
    setScore(application.evaluations?.[0]?.score ?? 3);
    setNotes(application.evaluations?.[0]?.notes ?? "");
  };

  // Mở chi tiết application: hydrate form + gọi API lấy detail
  const openApplication = async (application: RecruiterApplication) => {
    hydrateApplicationForm(application);
    setMessage("");
    setError("");

    try {
      const response = await getApplicationDetail(application.id);
      hydrateApplicationForm(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được chi tiết hồ sơ ứng viên",
      );
    }
  };

  // useEffect: tự động mở application nếu có applicationId từ URL param
  // Dùng khi điều hướng từ trang overview hoặc manage-jobs
  useEffect(() => {
    const requestedApplicationId = applicationIdParam
      ? Number(applicationIdParam)
      : null;
    if (
      !requestedApplicationId ||
      !Number.isInteger(requestedApplicationId) ||
      selectedApplication?.id === requestedApplicationId
    ) {
      return;
    }

    const application = applications.find(
      (item) => item.id === requestedApplicationId,
    );
    if (application) void openApplication(application);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationIdParam, applications, selectedApplication?.id]);

  // Xử lý chọn job trong dropdown: cập nhật URL params
  const handleSelectJob = (value: string) => {
    const nextJobId = value ? Number(value) : "";
    setSelectedJobId(nextJobId);
    setSelectedApplication(null);

    const nextParams = new URLSearchParams(searchParams);
    if (nextJobId) {
      nextParams.set("jobId", String(nextJobId));
    } else {
      nextParams.delete("jobId");
    }
    nextParams.delete("applicationId");

    setSearchParams(nextParams, { replace: true });
  };

  // Xử lý thay đổi bộ lọc trạng thái: cập nhật URL params
  const handleStatusFilterChange = (nextStatus: ApplicationStatus | "") => {
    setStatusFilter(nextStatus);
    setSelectedApplication(null);

    const nextParams = new URLSearchParams(searchParams);
    if (nextStatus) {
      nextParams.set("status", nextStatus);
    } else {
      nextParams.delete("status");
    }
    nextParams.delete("applicationId");

    setSearchParams(nextParams, { replace: true });
  };

  // Xử lý thay đổi trạng thái application (từ panel chi tiết)
  // Sau khi thành công: refresh detail + reload danh sách
  const handleChangeStatus = async (
    nextStatus: NextApplicationStatus,
  ) => {
    if (!selectedApplication) return;

    setError("");
    setMessage("");

    try {
      await updateApplicationStatus(selectedApplication.id, nextStatus);
      setMessage("Cập nhật trạng thái ứng viên thành công");
      const response = await getApplicationDetail(selectedApplication.id);
      hydrateApplicationForm(response.data);
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không cập nhật được trạng thái",
      );
    }
  };

  // Xử lý lưu feedback: gửi interview (có lịch PV) hoặc reject
  // interviewData chỉ có khi feedbackStatus === "interview" và có đủ thông tin lịch
  const handleSaveFeedback = async (interviewData?: {
    scheduledAt: string;
    type: "online" | "offline";
    location: string;
    notes?: string;
  }) => {
    if (!selectedApplication || !feedback.trim()) return;

    setError("");
    setMessage("");

    try {
      if (feedbackStatus === "interview" && interviewData) {
        // Gửi lời mời phỏng vấn (kèm feedback + lịch)
        await scheduleInterview(selectedApplication.id, {
          content: feedback.trim(),
          ...interviewData,
        });
      } else {
        // Gửi feedback từ chối hoặc phản hồi thông thường
        await createFeedback(selectedApplication.id, feedback.trim(), feedbackStatus);
      }
      setMessage("Gửi phản hồi cho ứng viên thành công");
      const response = await getApplicationDetail(selectedApplication.id);
      hydrateApplicationForm(response.data);
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được phản hồi");
    }
  };

  // Mở trang chat với ứng viên
  const handleOpenChat = () => {
    if (!selectedApplication) return;

    navigate(
      selectedApplication.conversation?.id
        ? `/recruiter/chat?conversationId=${selectedApplication.conversation.id}`
        : "/recruiter/chat",
    );
  };

  // Xử lý lưu đánh giá nội bộ
  const handleSaveEvaluation = async () => {
    if (!selectedApplication) return;

    setError("");
    setMessage("");

    try {
      await createEvaluation(selectedApplication.id, score, notes);
      setMessage("Lưu đánh giá nội bộ thành công");
      const response = await getApplicationDetail(selectedApplication.id);
      hydrateApplicationForm(response.data);
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được đánh giá");
    }
  };

  return (
    <div className="p-8">
      {/* Thông báo kết quả */}
      {(message || error) && (
        <div
          className={`mb-4 border px-4 py-3 text-[13px] ${error
            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
            : "border-green-200 bg-green-50 text-green-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
            }`}
        >
          {error || message}
        </div>
      )}

      {/* Filter bar: dropdown job + status + search */}
      <div className="mb-6 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="grid grid-cols-3 gap-4">
          {/* Chọn tin tuyển dụng */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Tin tuyển dụng
            </label>

            <select
              value={selectedJobId}
              disabled={jobsLoading}
              onChange={(e) => handleSelectJob(e.target.value)}
              className="h-10 w-full border border-slate-200 bg-white px-4 text-[13px] text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">
                {jobsLoading ? "Đang tải..." : "Tất cả tin tuyển dụng"}
              </option>

              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc trạng thái */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Trạng thái
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(
                  e.target.value as ApplicationStatus | "",
                )
              }
              className="h-10 w-full border border-slate-200 bg-white px-4 text-[13px] text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chưa xem</option>
              <option value="reviewing">Đã xem</option>
              <option value="interview">Mời phỏng vấn</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="hired">Trúng tuyển</option>
              <option value="rejected">Không phù hợp</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Tìm kiếm ứng viên */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Tìm ứng viên
            </label>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên hoặc email ứng viên..."
              className="h-10 w-full border border-slate-200 px-4 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Grid: bảng danh sách (trái) + panel chi tiết (phải) */}
      <div className="grid grid-cols-[1fr_380px] items-start gap-6">
        {/* Bảng danh sách ứng viên */}
        <div className="overflow-x-auto border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
          <table
            className={showJobColumn ? "w-full min-w-225" : "w-full min-w-190"}
          >
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80">
                {[
                  "Ứng viên",
                  ...(showJobColumn ? ["Tin ứng tuyển"] : []),
                  "CV",
                  "Ngày ứng tuyển",
                  "Trạng thái",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Loading state */}
              {loading && (
                <tr>
                  <td
                    colSpan={tableColumnCount}
                    className="px-6 py-8 text-center text-[13px] text-slate-400 dark:text-slate-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!loading && filteredApplications.length === 0 && (
                <tr>
                  <td
                    colSpan={tableColumnCount}
                    className="px-6 py-8 text-center text-[13px] text-slate-400 dark:text-slate-500"
                  >
                    Chưa có ứng viên cho tin này.
                  </td>
                </tr>
              )}

              {/* Danh sách ứng viên */}
              {!loading &&
                filteredApplications.map((application) => (
                  <tr
                    key={application.id}
                    onClick={() => void openApplication(application)}
                    className={`cursor-pointer border-b border-slate-50 transition-colors dark:border-slate-800 ${
                      selectedApplication?.id === application.id
                        ? "bg-indigo-50 dark:bg-indigo-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {/* Tên + email */}
                    <td className="px-6 py-5">
                      <p className="text-[14px] font-bold text-slate-900 dark:text-slate-50">
                        {getCandidateName(application)}
                      </p>

                      <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                        {application.candidateProfile?.user?.email ||
                          "Chưa có email"}
                      </p>
                    </td>

                    {/* Tên job (chỉ hiện nếu đang xem tất cả jobs) */}
                    {showJobColumn && (
                      <td className="px-6 py-5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                        {getApplicationJobTitle(application, jobs)}
                      </td>
                    )}

                    {/* Tên CV */}
                    <td className="px-6 py-5 text-[13px] text-slate-500 dark:text-slate-400">
                      {application.cv?.title || "Chưa có CV"}
                    </td>

                    {/* Ngày ứng tuyển */}
                    <td className="px-6 py-5 text-[13px] text-slate-500 dark:text-slate-400">
                      {formatDate(application.appliedAt)}
                    </td>

                    {/* Badge trạng thái + đã phản hồi */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block rounded-sm px-2 py-1 text-[10px] font-bold ${
                          statusStyle[application.status]
                        }`}
                      >
                        {statusLabel[application.status]}
                      </span>
                      {(application.feedbacks?.length ?? 0) > 0 && (
                        <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                          Đã phản hồi
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Panel chi tiết ứng viên (bên phải) */}
        <ApplicationDetailPanel
          key={selectedApplication?.id}
          variant="card"
          selectedApplication={selectedApplication}
          isLoading={loading}
          isSaving={false}
          error={error}
          message={message}
          feedback={feedback}
          feedbackStatus={feedbackStatus}
          score={score}
          notes={notes}
          onChangeStatus={(status) => void handleChangeStatus(status)}
          onFeedbackChange={setFeedback}
          onFeedbackStatusChange={setFeedbackStatus}
          onScoreChange={setScore}
          onNotesChange={setNotes}
          onSaveFeedback={(interviewData) => void handleSaveFeedback(interviewData)}
          onSaveEvaluation={() => void handleSaveEvaluation()}
          onViewCV={() => setPreviewApplication(selectedApplication)}
          onOpenChat={handleOpenChat}
        />
      </div>

      {/* Modal xem CV */}
      <CandidateCVModal
        isOpen={!!previewApplication}
        onClose={() => setPreviewApplication(null)}
        application={previewApplication}
      />
    </div>
  );
}
