import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Calendar, MapPin, Video, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVisiblePolling } from "../../hooks/useVisiblePolling";
import { supabase } from "../../utils/supabase";
import {
  createEvaluation,
  createFeedback,
  getApplicationDetail,
  getApplicationsByJob,
  getMyJobs,
  scheduleInterview,
  updateApplicationStatus,
  type ApplicationStatus,
  type RecruiterApplication,
  type RecruiterJob,
} from "../../services/recruiter.service";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Chưa xem",
  reviewing: "Đã xem",
  interview: "Mời phỏng vấn",
  confirmed: "Đã xác nhận",
  rejected: "Không phù hợp",
  cancelled: "Đã hủy",
};

const statusStyle: Record<ApplicationStatus, string> = {
  pending: "border border-blue-400 text-blue-600 bg-white dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
  reviewing: "border border-orange-400 text-orange-600 bg-white dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
  interview: "border border-violet-400 text-violet-600 bg-white dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  confirmed: "border border-emerald-400 text-emerald-600 bg-white dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  rejected: "border border-red-400 text-red-600 bg-white dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  cancelled: "border border-slate-300 text-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

type FeedbackStatus = "interview" | "rejected";

const getStatusFilterFromParam = (value: string | null): ApplicationStatus | "" => {
  if (
    value === "pending" ||
    value === "reviewing" ||
    value === "interview" ||
    value === "rejected" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "";
};

const getFeedbackStatus = (status: ApplicationStatus): FeedbackStatus => {
  if (status === "rejected" || status === "interview" || status === "confirmed") {
    return status === "confirmed" ? "interview" : status;
  }

  return "interview";
};

const nextStatusOptions = (status: ApplicationStatus) => {
  if (status === "pending") {
    return [
      { label: "Đánh dấu đã xem", value: "reviewing" as const },
      { label: "Mời phỏng vấn", value: "interview" as const },
    ];
  }

  if (status === "reviewing") {
    return [
      { label: "Mời phỏng vấn", value: "interview" as const },
      { label: "Từ chối", value: "rejected" as const },
    ];
  }

  if (status === "interview" || status === "confirmed") {
    return [
      { label: "Từ chối", value: "rejected" as const },
    ];
  }

  return [];
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN");
};

const getCandidateName = (application: RecruiterApplication) => {
  return (
    application.candidateProfile?.fullName ||
    application.candidateProfile?.user?.email ||
    "Ứng viên chưa cập nhật tên"
  );
};

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

export function ManageCandidatesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const statusParam = getStatusFilterFromParam(searchParams.get("status"));
  const applicationIdParam = searchParams.get("applicationId");
  const hasDashboardTarget = Boolean(statusParam || applicationIdParam);

  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplication | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">(
    () => statusParam,
  );

  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>("interview");
  const [score, setScore] = useState(3);
  const [notes, setNotes] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState<"online" | "offline">("online");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const showJobColumn = selectedJobId === "";
  const tableColumnCount = showJobColumn ? 6 : 5;

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

  const loadApplications = async (
    options: { showLoading?: boolean; updateError?: boolean } = {},
  ) => {
    const { showLoading = true, updateError = true } = options;

    const jobIds = selectedJobId ? [selectedJobId] : jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      setApplications([]);
      setSelectedApplication(null);
      return;
    }

    if (showLoading) setLoading(true);
    if (updateError) setError("");

    try {
      const results = await Promise.allSettled(
        jobIds.map((jobId) =>
          getApplicationsByJob({
            jobId,
            page: 1,
            limit: 50,
            status: statusFilter,
          }),
        ),
      );

      const responseData = results.flatMap((result) => {
        if (result.status !== "fulfilled") return [];
        return result.value.data ?? [];
      });

      const uniqueApplications = Array.from(
        new Map(responseData.map((application) => [application.id, application])).values(),
      );

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
  };

  useEffect(() => {
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdParam, hasDashboardTarget]);

  useEffect(() => {
    setStatusFilter((current) => (current === statusParam ? current : statusParam));
  }, [statusParam]);

  useEffect(() => {
    void loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, statusFilter, jobs]);

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

  const hydrateApplicationForm = (application: RecruiterApplication) => {
    setSelectedApplication(application);
    setFeedback(application.feedbacks?.[0]?.content ?? "");
    setFeedbackStatus(getFeedbackStatus(application.status));
    setScore(application.evaluations?.[0]?.score ?? 3);
    setNotes(application.evaluations?.[0]?.notes ?? "");
    setInterviewTime("");
    setInterviewType("online");
    setInterviewLocation("");
    setInterviewNotes("");
    setShowScheduleForm(false);
    setShowRejectForm(false);
  };

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

  useEffect(() => {
    const requestedApplicationId = applicationIdParam ? Number(applicationIdParam) : null;
    if (
      !requestedApplicationId ||
      !Number.isInteger(requestedApplicationId) ||
      selectedApplication?.id === requestedApplicationId
    ) {
      return;
    }

    const application = applications.find((item) => item.id === requestedApplicationId);
    if (application) void openApplication(application);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationIdParam, applications, selectedApplication?.id]);

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

  const handleChangeStatus = async (
    nextStatus: "reviewing" | "interview" | "rejected",
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

  const handleSaveFeedback = async () => {
    if (!selectedApplication || !feedback.trim()) return;

    setError("");
    setMessage("");

    try {
      if (feedbackStatus === "interview") {
        if (!interviewTime.trim()) {
          setError("Vui lòng chọn thời gian phỏng vấn");
          return;
        }
        if (!interviewLocation.trim()) {
          setError(interviewType === "online" ? "Vui lòng nhập link phỏng vấn" : "Vui lòng nhập địa chỉ phỏng vấn");
          return;
        }
        await scheduleInterview(selectedApplication.id, {
          content: feedback.trim(),
          scheduledAt: new Date(interviewTime).toISOString(),
          type: interviewType,
          location: interviewLocation.trim(),
          notes: interviewNotes.trim() || undefined,
        });
        setInterviewTime("");
        setInterviewLocation("");
        setInterviewNotes("");
      } else {
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

  const handleOpenChat = () => {
    if (!selectedApplication) return;

    navigate(
      selectedApplication.conversation?.id
        ? `/recruiter/chat?conversationId=${selectedApplication.conversation.id}`
        : "/recruiter/chat",
    );
  };

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
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight text-slate-900 dark:text-white">
          Quản lý ứng viên
        </h1>
      </div>

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

      <div className="mb-6 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="grid grid-cols-3 gap-4">
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

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Trạng thái
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as ApplicationStatus | "")
              }
              className="h-10 w-full border border-slate-200 bg-white px-4 text-[13px] text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chưa xem</option>
              <option value="reviewing">Đã xem</option>
              <option value="interview">Mời phỏng vấn</option>
              <option value="rejected">Không phù hợp</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

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

      <div className="grid grid-cols-[1fr_380px] items-start gap-6">
        <div className="overflow-x-auto border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
          <table className={showJobColumn ? "w-full min-w-[900px]" : "w-full min-w-[760px]"}>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80">
                {[
                  "Ứng viên",
                  ...(showJobColumn ? ["Tin ứng tuyển"] : []),
                  "CV",
                  "Ngày ứng tuyển",
                  "Trạng thái",
                  "Hành động",
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

              {!loading &&
                filteredApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-6 py-5">
                      <p className="text-[14px] font-bold text-slate-900 dark:text-slate-50">
                        {getCandidateName(application)}
                      </p>

                      <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                        {application.candidateProfile?.user?.email ||
                          "Chưa có email"}
                      </p>
                    </td>

                    {showJobColumn && (
                      <td className="px-6 py-5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                        {getApplicationJobTitle(application, jobs)}
                      </td>
                    )}

                    <td className="px-6 py-5 text-[13px] text-slate-500 dark:text-slate-400">
                      {application.cv?.title || "Chưa có CV"}
                    </td>

                    <td className="px-6 py-5 text-[13px] text-slate-500 dark:text-slate-400">
                      {formatDate(application.appliedAt)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-block rounded-sm px-2 py-1 text-[10px] font-bold ${statusStyle[application.status]
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

                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => void openApplication(application)}
                        className="h-8 border border-slate-200 px-3 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Xử lý hồ sơ
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="min-h-80 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
          {!selectedApplication ? (
            <div className="py-16 text-center text-[13px] text-slate-400 dark:text-slate-500">
              Chọn một ứng viên để xem chi tiết, phản hồi và đánh giá.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-bold text-slate-900 dark:text-slate-50">
                  {getCandidateName(selectedApplication)}
                </h2>

                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  {selectedApplication.candidateProfile?.phone ||
                    "Chưa có số điện thoại"}
                </p>

                <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                  {selectedApplication.candidateProfile?.user?.email ||
                    "Chưa có email"}
                </p>

                {selectedApplication.cv?.pdfUrl && (
                  <a
                    className="mt-2 inline-block text-[13px] font-semibold text-blue-600 hover:underline dark:text-blue-300"
                    href={selectedApplication.cv.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem CV PDF
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="mt-3 inline-flex h-8 items-center gap-2 border border-indigo-200 px-3 text-[12px] font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Nhắn tin
                </button>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Thư xin việc
                </label>

                <p className="whitespace-pre-wrap border border-slate-100 bg-slate-50 px-3 py-2 text-[13px] leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  {selectedApplication.coverLetter?.trim() ||
                    "Ứng viên không gửi thư xin việc."}
                </p>
              </div>

              {/* Chi tiết lịch phỏng vấn đã xếp nếu ở trạng thái mời/đã xác nhận phỏng vấn */}
              {(selectedApplication.status === "interview" || selectedApplication.status === "confirmed") && selectedApplication.interviews && selectedApplication.interviews.length > 0 && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/20 p-4 dark:border-indigo-950/40 dark:bg-indigo-950/10">
                  <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-650" />
                    Chi tiết lịch phỏng vấn
                  </h3>
                  <div className="space-y-2 text-[13px] text-slate-600 dark:text-slate-300">
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-400">Thời gian:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {new Date(selectedApplication.interviews[0].scheduledAt).toLocaleString("vi-VN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="font-semibold text-slate-400">Hình thức:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {selectedApplication.interviews[0].type === "online" ? "Online" : "Offline"}
                      </span>
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-400">
                        {selectedApplication.interviews[0].type === "online" ? "Link phỏng vấn:" : "Địa điểm:"}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 break-all">
                        {selectedApplication.interviews[0].type === "online" ? (
                          <a
                            href={selectedApplication.interviews[0].location || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline dark:text-indigo-400 font-semibold"
                          >
                            {selectedApplication.interviews[0].location}
                          </a>
                        ) : (
                          selectedApplication.interviews[0].location
                        )}
                      </span>
                    </div>
                    {selectedApplication.interviews[0].notes && (
                      <div className="flex flex-col gap-0.5 border-t border-slate-100/50 pt-2 mt-2 dark:border-slate-800/50">
                        <span className="font-semibold text-slate-400">Ghi chú:</span>
                        <span className="text-slate-500 dark:text-slate-400 italic">
                          {selectedApplication.interviews[0].notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GIAO DIỆN TƯƠNG TÁC THEO TRẠNG THÁI */}
              {selectedApplication.status === "pending" && (
                <div className="border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => void handleChangeStatus("reviewing")}
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer rounded-sm"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
              )}

              {selectedApplication.status === "reviewing" && (
                <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduleForm(!showScheduleForm);
                        setShowRejectForm(false);
                        setFeedbackStatus("interview");
                        if (!feedback) setFeedback("Kính gửi ứng viên, chúng tôi rất ấn tượng với hồ sơ của bạn và muốn mời bạn tham gia buổi phỏng vấn trực tiếp trao đổi thêm về công việc.");
                      }}
                      className={`flex-1 h-9 font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border rounded-sm ${
                        showScheduleForm
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-300"
                          : "bg-white border-slate-200 text-slate-755 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Đặt lịch phỏng vấn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(!showRejectForm);
                        setShowScheduleForm(false);
                        setFeedbackStatus("rejected");
                        if (!feedback) setFeedback("Kính gửi ứng viên, rất tiếc hồ sơ của bạn chưa phù hợp với yêu cầu hiện tại của vị trí này. Cảm ơn bạn đã quan tâm đến công ty.");
                      }}
                      className={`h-9 px-4 font-bold text-[12px] transition-all flex items-center justify-center gap-1.5 cursor-pointer border rounded-sm ${
                        showRejectForm
                          ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300"
                          : "bg-white border-slate-200 text-red-600 hover:bg-red-50 dark:bg-slate-950 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/20"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Từ chối
                    </button>
                  </div>

                  {showScheduleForm && (
                    <div className="space-y-3 border border-indigo-100 bg-indigo-50/20 p-4 dark:border-indigo-950/40 dark:bg-indigo-950/10 rounded-md animate-fade-in">
                      <h3 className="text-[12px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                        Thông tin lịch hẹn phỏng vấn
                      </h3>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Thư mời phỏng vấn
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                          placeholder="Nhập thư mời gửi cho ứng viên..."
                          className="w-full border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Thời gian phỏng vấn
                        </label>
                        <input
                          type="datetime-local"
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          className="h-9 w-full border border-slate-200 px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Hình thức
                        </label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="interviewType"
                              value="online"
                              checked={interviewType === "online"}
                              onChange={() => setInterviewType("online")}
                              className="accent-indigo-600"
                            />
                            Online
                          </label>
                          <label className="flex items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name="interviewType"
                              value="offline"
                              checked={interviewType === "offline"}
                              onChange={() => setInterviewType("offline")}
                              className="accent-indigo-600"
                            />
                            Offline
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          {interviewType === "online" ? "Link phỏng vấn" : "Địa chỉ"}
                        </label>
                        <input
                          type={interviewType === "online" ? "url" : "text"}
                          value={interviewLocation}
                          onChange={(e) => setInterviewLocation(e.target.value)}
                          placeholder={interviewType === "online" ? "Link Google Meet / Zoom..." : "Địa chỉ phỏng vấn..."}
                          className="h-9 w-full border border-slate-200 px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Ghi chú (không bắt buộc)
                        </label>
                        <textarea
                          value={interviewNotes}
                          onChange={(e) => setInterviewNotes(e.target.value)}
                          rows={2}
                          placeholder="Ghi chú thêm cho ứng viên..."
                          className="w-full border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSaveFeedback()}
                        disabled={!feedback.trim() || !interviewTime.trim() || !interviewLocation.trim()}
                        className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[12px] transition-all cursor-pointer flex items-center justify-center rounded-sm"
                      >
                        Đặt lịch phỏng vấn & Gửi mail
                      </button>
                    </div>
                  )}

                  {showRejectForm && (
                    <div className="space-y-3 border border-red-100 bg-red-50/20 p-4 dark:border-red-950/40 dark:bg-red-950/10 rounded-md animate-fade-in">
                      <h3 className="text-[12px] font-bold text-red-900 dark:text-red-350 uppercase tracking-wider">
                        Từ chối hồ sơ ứng viên
                      </h3>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Lý do từ chối / Phản hồi
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                          placeholder="Nhập lý do gửi phản hồi cho ứng viên..."
                          className="w-full border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSaveFeedback()}
                        disabled={!feedback.trim()}
                        className="w-full h-9 bg-red-600 hover:bg-red-750 disabled:opacity-50 text-white font-bold text-[12px] transition-all cursor-pointer flex items-center justify-center rounded-sm"
                      >
                        Xác nhận từ chối & Gửi mail
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedApplication.status === "interview" && (
                <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-[13px] text-amber-800 dark:border-amber-950/40 dark:bg-amber-950/25 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                    <span>Đã gửi thư mời. Đang chờ ứng viên xác nhận tham gia phỏng vấn qua email.</span>
                  </div>
                </div>
              )}

              {selectedApplication.status === "confirmed" && (
                <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/60 animate-fade-in">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Đánh giá nội bộ
                    </label>

                    <select
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="mb-2 h-9 w-full border border-slate-200 px-3 text-[13px] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((item) => (
                        <option key={item} value={item}>
                          {item} sao
                        </option>
                      ))}
                    </select>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Ghi chú nhận xét đánh giá nội bộ..."
                      className="w-full border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                    />

                    <button
                      type="button"
                      onClick={() => void handleSaveEvaluation()}
                      className="mt-2 h-8 border border-slate-350 bg-slate-900 text-white hover:bg-slate-800 px-4 text-[12px] font-semibold transition-all rounded-sm flex items-center justify-center cursor-pointer"
                    >
                      Lưu đánh giá
                    </button>
                  </div>
                </div>
              )}

              {selectedApplication.status === "rejected" && (
                <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 rounded-lg border border-red-150 bg-red-50/50 p-3 text-[13px] text-red-800 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400">
                    <XCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span>Hồ sơ ứng viên đã bị từ chối.</span>
                  </div>
                </div>
              )}

              {selectedApplication.status === "cancelled" && (
                <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <AlertCircle className="w-5 h-5 shrink-0 text-slate-450" />
                    <span>Buổi phỏng vấn đã bị hủy hoặc ứng viên từ chối phỏng vấn.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
