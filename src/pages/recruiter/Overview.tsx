import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getApplicationsByJob,
  getMyJobs,
  updateJobStatus,
  type RecruiterApplication,
  type RecruiterJob,
} from "../../services/recruiter.service";

type UrgentTask = {
  text: string;
  deadline: string;
  actions?: Array<
    | { label: string; to: string }
    | { label: string; action: "closeJob"; jobId: number }
  >;
};

const getInitials = (name?: string | null) => {
  if (!name) return "UV";

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatTime = (value?: string | null) => {
  if (!value) return "Không rõ";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatDate = (value?: string | null) => {
  if (!value) return "Không rõ";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(date);
};

const getStatusLabel = (status: RecruiterApplication["status"]) => {
  switch (status) {
    case "pending":
      return "Chờ xử lý";
    case "reviewing":
      return "Đã xem";
    case "interview":
      return "Mời phỏng vấn";
    case "accepted":
      return "Phù hợp";
    case "rejected":
      return "Không phù hợp";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const getStatusColor = (status: RecruiterApplication["status"]) => {
  switch (status) {
    case "pending":
      return "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-300";
    case "reviewing":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300";
    case "interview":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300";
    case "accepted":
      return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300";
    case "rejected":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    case "cancelled":
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
};

export function RecruiterOverviewPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const jobsResponse = await getMyJobs({
        page: 1,
        limit: 50,
        status: "",
      });

      const myJobs = jobsResponse.data ?? [];
      setJobs(myJobs);

      const activeJobs = myJobs.filter((job) => job.status !== "deleted");

      const applicationResults = await Promise.allSettled(
        activeJobs.map((job) =>
          getApplicationsByJob({
            jobId: job.id,
            page: 1,
            limit: 20,
            status: "",
          }),
        ),
      );

      const allApplications = applicationResults.flatMap((result) => {
        if (result.status !== "fulfilled") return [];
        return result.value.data ?? [];
      });

      const uniqueApplicationMap = new Map<number, RecruiterApplication>();

      allApplications.forEach((application) => {
        uniqueApplicationMap.set(application.id, application);
      });

      setApplications(Array.from(uniqueApplicationMap.values()));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu tổng quan nhà tuyển dụng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const handleCloseJob = async (jobId: number) => {
    try {
      setError("");
      await updateJobStatus(jobId, "closed");
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đóng được tin tuyển dụng");
    }
  };

  const stats = useMemo(() => {
    const totalJobs = jobs.filter((job) => job.status !== "deleted").length;
    const activeJobs = jobs.filter((job) => job.status === "active").length;
    const newApplications = applications.filter(
      (application) => application.status === "pending",
    ).length;
    const pendingApplications = newApplications;
    const feedbackSent = applications.filter(
      (application) =>
        (application.feedbacks?.length ?? 0) > 0 ||
        application.status === "reviewing" ||
        application.status === "interview" ||
        application.status === "accepted" ||
        application.status === "rejected",
    ).length;

    return {
      totalJobs,
      activeJobs,
      newApplications,
      pendingApplications,
      feedbackSent,
    };
  }, [jobs, applications]);

  const jobTitleById = useMemo(() => {
    return new Map(jobs.map((job) => [job.id, job.title]));
  }, [jobs]);

  const recentApplicants = useMemo(() => {
    return [...applications]
      .filter((application) => application.status === "pending")
      .sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      )
      .slice(0, 5);
  }, [applications]);

  const getApplicationJobTitle = (application: RecruiterApplication) => {
    return (
      application.jobPosting?.title ||
      (application.jobPostingId ? jobTitleById.get(application.jobPostingId) : undefined) ||
      "Chưa xác định vị trí"
    );
  };

  const getApplicationDetailPath = (application: RecruiterApplication) => {
    const params = new URLSearchParams({
      status: "pending",
      applicationId: String(application.id),
    });

    if (application.jobPostingId) {
      params.set("jobId", String(application.jobPostingId));
    }

    return `/recruiter/candidates?${params.toString()}`;
  };

  const urgentTasks = useMemo(() => {
    const tasks: UrgentTask[] = [];

    const pendingCount = applications.filter(
      (application) => application.status === "pending",
    ).length;

    if (pendingCount > 0) {
      tasks.push({
        text: `Có ${pendingCount} hồ sơ đang chờ xử lý.`,
        deadline: "Cần xử lý sớm",
        actions: [{ label: "Xem hồ sơ", to: "/recruiter/candidates?status=pending" }],
      });
    }

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const expiringJobs = jobs.filter((job) => {
      if (!job.expiresAt || job.status !== "active") return false;
      const expiresAt = new Date(job.expiresAt);
      return expiresAt.getTime() <= sevenDaysLater.getTime();
    });

    expiringJobs.slice(0, 3).forEach((job) => {
      const actions: UrgentTask["actions"] = [
        { label: "Xem tin", to: `/recruiter/manage-jobs/${job.id}` },
        { label: "Đóng tin", action: "closeJob", jobId: job.id },
      ];
      tasks.push({
        text: `Tin "${job.title}" sắp hết hạn.`,
        deadline: `Hạn: ${formatDate(job.expiresAt)}`,
        actions,
      });
    });

    return tasks.slice(0, 5);
  }, [jobs, applications]);

  const insights = useMemo(() => {
    const result: Array<{ icon: string; text: string }> = [];

    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const expiringSoon = jobs.filter((job) => {
      if (!job.expiresAt || job.status !== "active") return false;
      const expiresAt = new Date(job.expiresAt);
      return expiresAt.getTime() <= threeDaysLater.getTime() && expiresAt.getTime() > now.getTime();
    });

    if (expiringSoon.length > 0) {
      result.push({
        icon: "⚠️",
        text: `${expiringSoon.length} tin sắp hết hạn trong 3 ngày tới.`,
      });
    }

    const pendingCount = applications.filter(
      (application) => application.status === "pending",
    ).length;

    if (pendingCount > 0) {
      result.push({
        icon: "📋",
        text: `${pendingCount} hồ sơ chờ xử lý, hãy xem xét và cập nhật trạng thái.`,
      });
    }

    const noSalaryJobs = jobs.filter(
      (job) => job.status === "active" && !job.salaryMin && !job.salaryMax,
    );

    if (noSalaryJobs.length > 0) {
      result.push({
        icon: "💰",
        text: `${noSalaryJobs.length} tin chưa có mức lương, thêm lương để thu hút ứng viên.`,
      });
    }

    const noApplicantJobs = jobs.filter((job) => {
      return job.status === "active" && (job._count?.applications ?? 0) === 0;
    });

    if (noApplicantJobs.length > 0) {
      result.push({
        icon: "📢",
        text: `${noApplicantJobs.length} tin chưa có ứng viên, hãy kiểm tra lại nội dung tin.`,
      });
    }

    if (stats.feedbackSent > 0) {
      result.push({
        icon: "✉️",
        text: `Đã gửi phản hồi cho ${stats.feedbackSent} hồ sơ ứng viên.`,
      });
    }

    return result;
  }, [jobs, applications, stats.feedbackSent]);

  return (
    <div className="flex-1 p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
            Tổng quan tuyển dụng
          </h1>

          <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-300">
            Theo dõi tin tuyển dụng, ứng viên mới và các tác vụ cần xử lý.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/post-job"
            className="flex h-10 items-center gap-2 bg-[#0f1f3d] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2f52]"
          >
            <span>+</span> ĐĂNG TIN MỚI
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
          Đang tải dữ liệu tổng quan...
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-4 gap-4">
            <Link
              to="/recruiter/manage-jobs"
              className="block border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Tổng số tin
                </p>

                <svg
                  className="h-5 w-5 text-slate-300 dark:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-[36px] font-black leading-none text-slate-900 dark:text-slate-50">
                  {stats.totalJobs}
                </span>
              </div>
            </Link>

            <Link
              to="/recruiter/manage-jobs?status=active"
              className="block border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Tin đang mở
                </p>

                <svg
                  className="h-5 w-5 text-slate-300 dark:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>

              <span className="text-[36px] font-black leading-none text-slate-900 dark:text-slate-50">
                {stats.activeJobs}
              </span>
            </Link>

            <Link
              to="/recruiter/candidates?status=pending"
              className="block border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Ứng viên mới
                </p>

                <svg
                  className="h-5 w-5 text-slate-300 dark:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-[36px] font-black leading-none text-slate-900 dark:text-slate-50">
                  {stats.newApplications}
                </span>
              </div>
            </Link>

            <Link
              to="/recruiter/candidates?status=pending"
              className="block border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Hồ sơ chờ xử lý
                </p>

                <svg
                  className="h-5 w-5 text-slate-300 dark:text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-[36px] font-black leading-none text-slate-900 dark:text-slate-50">
                  {stats.pendingApplications}
                </span>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-6">
            <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-50">
                  Danh sách ứng viên mới
                </h2>

                <Link
                  to="/recruiter/candidates?status=pending"
                  className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline dark:text-blue-300"
                >
                  XEM TẤT CẢ →
                </Link>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {[
                      "Họ tên",
                      "Vị trí ứng tuyển",
                      "Trạng thái",
                      "Ngày nộp",
                      "Thao tác",
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
                  {recentApplicants.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-[13px] text-slate-400 dark:text-slate-500"
                      >
                        Chưa có ứng viên mới.
                        <br />
                        <span className="text-[12px]">
                          Khi có ứng viên ứng tuyển, hồ sơ sẽ hiển thị tại đây.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    recentApplicants.map((application) => {
                      const candidateName =
                        application.candidateProfile?.fullName ||
                        application.candidateProfile?.user?.email ||
                        "Ứng viên";
                      const jobTitle = getApplicationJobTitle(application);
                      const detailPath = getApplicationDetailPath(application);
                      const chatPath = application.conversation?.id
                        ? `/recruiter/chat?conversationId=${application.conversation.id}`
                        : "/recruiter/chat";

                      return (
                        <tr
                          key={application.id}
                          className="border-b border-slate-50 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500">
                                <span className="text-[11px] font-bold text-white">
                                  {getInitials(candidateName)}
                                </span>
                              </div>

                              <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                                {candidateName}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-300">
                            {jobTitle}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-sm px-2 py-1 text-[11px] font-semibold ${getStatusColor(
                                application.status,
                              )}`}
                            >
                              {getStatusLabel(application.status)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-[13px] text-slate-400 dark:text-slate-500">
                            {formatTime(application.appliedAt)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={detailPath}
                                className="border border-slate-200 px-3 py-1 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                              >
                                Xem hồ sơ
                              </Link>

                              <Link
                                to={chatPath}
                                className="border border-indigo-200 px-3 py-1 text-[12px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
                              >
                                Chat
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex-1 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
                <h3 className="mb-4 text-[14px] font-bold text-slate-800 dark:text-slate-50">
                  Cần xử lý gấp
                </h3>

                <div className="space-y-4">
                  {urgentTasks.length === 0 ? (
                    <p className="text-[13px] leading-snug text-slate-500 dark:text-slate-400">
                      Không có tác vụ gấp cần xử lý.
                    </p>
                  ) : (
                    urgentTasks.map((task, index) => (
                      <div key={`${task.text}-${index}`} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                        <div>
                          <p className="text-[13px] leading-snug text-slate-700 dark:text-slate-300">
                            {task.text}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                            {task.deadline}
                          </p>

                          {task.actions && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {task.actions.map((action) =>
                                "to" in action ? (
                                  <Link
                                    key={`${task.text}-${action.label}`}
                                    to={action.to}
                                    className="text-[12px] font-semibold text-blue-600 hover:underline dark:text-blue-300"
                                  >
                                    {action.label}
                                  </Link>
                                ) : (
                                  <button
                                    key={`${task.text}-${action.label}`}
                                    type="button"
                                    onClick={() => void handleCloseJob(action.jobId)}
                                    className="text-[12px] font-semibold text-red-600 hover:underline dark:text-red-300"
                                  >
                                    {action.label}
                                  </button>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
                <h3 className="mb-3 text-[14px] font-bold text-slate-800 dark:text-slate-50">
                  Gợi ý nhanh
                </h3>

                {insights.length === 0 ? (
                  <div className="space-y-3 text-[13px] text-slate-500 dark:text-slate-400">
                    <p>
                      Không có insight cần chú ý lúc này.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-0.5 text-[13px]">{insight.icon}</span>
                        <p className="text-[13px] leading-snug text-slate-500 dark:text-slate-400">
                          {insight.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
