import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVisiblePolling } from "../../hooks/useVisiblePolling";
import { supabase } from "../../utils/supabase";
import {
  createEvaluation,
  createFeedback,
  getApplicationDetail,
  getApplicationsByJob,
  getMyJobs,
  updateApplicationStatus,
  type ApplicationStatus,
  type RecruiterApplication,
  type RecruiterJob,
} from "../../services/recruiter.service";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Chưa xem",
  reviewing: "Đã xem",
  interview: "Mời phỏng vấn",
  accepted: "Phù hợp",
  rejected: "Không phù hợp",
  cancelled: "Đã hủy",
};

const statusStyle: Record<ApplicationStatus, string> = {
  pending: "border border-blue-400 text-blue-600 bg-white dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
  reviewing: "border border-orange-400 text-orange-600 bg-white dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
  interview: "border border-violet-400 text-violet-600 bg-white dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  accepted: "border border-emerald-400 text-emerald-600 bg-white dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  rejected: "border border-red-400 text-red-600 bg-white dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  cancelled: "border border-slate-300 text-slate-500 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

type FeedbackStatus = "interview" | "accepted" | "rejected";

const getStatusFilterFromParam = (value: string | null): ApplicationStatus | "" => {
  if (
    value === "pending" ||
    value === "reviewing" ||
    value === "interview" ||
    value === "accepted" ||
    value === "rejected" ||
    value === "cancelled"
  ) {
    return value;
  }

  return "";
};

const getFeedbackStatus = (status: ApplicationStatus): FeedbackStatus => {
  if (status === "accepted" || status === "rejected" || status === "interview") {
    return status;
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
      { label: "Phù hợp", value: "accepted" as const },
      { label: "Từ chối", value: "rejected" as const },
    ];
  }

  if (status === "interview") {
    return [
      { label: "Phù hợp", value: "accepted" as const },
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
      } else if (!selectedJobId && myJobs.length > 0) {
        setSelectedJobId(myJobs[0].id);
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
    nextStatus: "reviewing" | "interview" | "accepted" | "rejected",
  ) => {
    if (!selectedApplication) return;

    setError("");
    setMessage("");

    try {
      await updateApplicationStatus(selectedApplication.id, nextStatus);
      setMessage("Cập nhật trạng thái ứng viên thành công");
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
      await createFeedback(selectedApplication.id, feedback.trim(), feedbackStatus);
      setMessage("Gửi phản hồi cho ứng viên thành công");
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
              <option value="accepted">Phù hợp</option>
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

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Chuyển trạng thái
                </label>

                <div className="flex flex-wrap gap-2">
                  {nextStatusOptions(selectedApplication.status).length ===
                    0 && (
                      <span className="text-[13px] text-slate-400 dark:text-slate-500">
                        Không còn bước chuyển hợp lệ.
                      </span>
                    )}

                  {nextStatusOptions(selectedApplication.status).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => void handleChangeStatus(item.value)}
                      className="h-8 bg-[#0f1f3d] px-3 text-[12px] font-bold text-white hover:bg-[#1a2f52]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Phản hồi cho ứng viên
                </label>

                <select
                  value={feedbackStatus}
                  onChange={(e) => setFeedbackStatus(e.target.value as FeedbackStatus)}
                  className="mb-2 h-9 w-full border border-slate-200 px-3 text-[13px] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="interview">Mời phỏng vấn</option>
                  <option value="accepted">Phù hợp</option>
                  <option value="rejected">Không phù hợp</option>
                </select>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  placeholder="Nhập nội dung phản hồi gửi cho ứng viên..."
                  className="w-full border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                />

                <button
                  type="button"
                  onClick={() => void handleSaveFeedback()}
                  disabled={!feedback.trim()}
                  className="mt-2 h-8 border border-slate-300 px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Gửi phản hồi và cập nhật kết quả
                </button>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Đánh giá nội bộ
                </label>

                <select
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="mb-2 h-9 w-full border border-slate-200 px-3 text-[13px] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
                  placeholder="Ghi chú nội bộ về ứng viên..."
                  className="w-full border border-slate-200 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-600"
                />

                <button
                  type="button"
                  onClick={() => void handleSaveEvaluation()}
                  className="mt-2 h-8 border border-slate-300 px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Lưu đánh giá
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
