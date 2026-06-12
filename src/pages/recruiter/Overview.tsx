import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getApplicationsByJob,
  getMyJobs,
  type RecruiterApplication,
  type RecruiterJob,
} from "../../services/recruiter.service";

function Sparkline({ data }: { data: number[] }) {
  const safeData = data.length > 1 ? data : [0, data[0] ?? 0];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const w = 64;
  const h = 32;
  const range = max - min || 1;

  const points = safeData
    .map((v, i) => {
      const x = (i / (safeData.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      return "Chưa xem";
    case "reviewing":
      return "Đang đánh giá";
    case "interview":
      return "Mời phỏng vấn";
    case "accepted":
      return "Đã duyệt";
    case "rejected":
      return "Từ chối";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
};

const getStatusColor = (status: RecruiterApplication["status"]) => {
  switch (status) {
    case "pending":
      return "bg-red-100 text-red-600";
    case "reviewing":
      return "bg-yellow-100 text-yellow-700";
    case "interview":
      return "bg-violet-100 text-violet-700";
    case "accepted":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-slate-100 text-slate-600";
    case "cancelled":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-600";
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

  const stats = useMemo(() => {
    const totalJobs = jobs.filter((job) => job.status !== "deleted").length;
    const activeJobs = jobs.filter((job) => job.status === "active").length;
    const newApplications = applications.filter(
      (application) => application.status === "pending",
    ).length;
    const feedbackSent = applications.filter(
      (application) => (application.feedbacks?.length ?? 0) > 0,
    ).length;

    return {
      totalJobs,
      activeJobs,
      newApplications,
      totalApplications: applications.length,
      feedbackSent,
    };
  }, [jobs, applications]);

  const sparklineData = useMemo(() => {
    const countsByDay = new Map<string, number>();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      countsByDay.set(date.toISOString().slice(0, 10), 0);
    }

    jobs.forEach((job) => {
      const key = new Date(job.createdAt).toISOString().slice(0, 10);

      if (countsByDay.has(key)) {
        countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
      }
    });

    return Array.from(countsByDay.values());
  }, [jobs]);

  const recentApplicants = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      )
      .slice(0, 5);
  }, [applications]);

  const urgentTasks = useMemo(() => {
    const tasks: Array<{ text: string; deadline: string }> = [];

    const pendingCount = applications.filter(
      (application) => application.status === "pending",
    ).length;

    const reviewingCount = applications.filter(
      (application) => application.status === "reviewing",
    ).length;

    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const expiringJobs = jobs.filter((job) => {
      if (!job.expiresAt || job.status !== "active") return false;

      const expiresAt = new Date(job.expiresAt);
      return expiresAt.getTime() <= sevenDaysLater.getTime();
    });

    if (pendingCount > 0) {
      tasks.push({
        text: `Có ${pendingCount} ứng viên mới đang chờ xem xét.`,
        deadline: "Cần xử lý sớm",
      });
    }

    if (reviewingCount > 0) {
      tasks.push({
        text: `Có ${reviewingCount} hồ sơ đang trong trạng thái đánh giá.`,
        deadline: "Theo dõi tiến độ",
      });
    }

    expiringJobs.slice(0, 3).forEach((job) => {
      tasks.push({
        text: `Tin tuyển dụng "${job.title}" sắp hết hạn.`,
        deadline: `Hạn: ${formatDate(job.expiresAt)}`,
      });
    });

    if (tasks.length === 0) {
      tasks.push({
        text: "Hiện chưa có tác vụ tuyển dụng cần xử lý gấp.",
        deadline: "Mọi thứ đang ổn định",
      });
    }

    return tasks.slice(0, 5);
  }, [jobs, applications]);

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
          <button
            type="button"
            onClick={() => void loadOverview()}
            disabled={loading}
            className="h-10 border border-slate-200 px-5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            LÀM MỚI
          </button>

          <Link
            to="/recruiter/post-job"
            className="flex h-10 items-center gap-2 bg-[#0f1f3d] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2f52]"
          >
            <span>+</span> ĐĂNG TIN MỚI
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">
          Đang tải dữ liệu tổng quan...
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-4 gap-4">
            <div className="border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Tổng số tin
                </p>

                <svg
                  className="h-5 w-5 text-slate-300"
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
                <span className="text-[36px] font-black leading-none text-slate-900">
                  {stats.totalJobs}
                </span>

                <div className="mb-1 flex flex-col items-start">
                  <div className="h-8 w-16">
                    <Sparkline data={sparklineData} />
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600">
                    7 ngày gần đây
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Tin đang mở
                </p>

                <svg
                  className="h-5 w-5 text-slate-300"
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

              <span className="text-[36px] font-black leading-none text-slate-900">
                {stats.activeJobs}
              </span>
            </div>

            <div className="border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Ứng viên mới
                </p>

                <svg
                  className="h-5 w-5 text-slate-300"
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
                <span className="text-[36px] font-black leading-none text-slate-900">
                  {stats.newApplications}
                </span>

                <span className="mb-1 text-[11px] font-semibold text-emerald-600">
                  / {stats.totalApplications} tổng hồ sơ
                </span>
              </div>
            </div>

            <div className="border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Phản hồi đã gửi
                </p>

                <svg
                  className="h-5 w-5 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-[36px] font-black leading-none text-slate-900">
                  {stats.feedbackSent}
                </span>

                <span className="mb-1 text-[11px] font-semibold text-slate-400">
                  hồ sơ đã phản hồi
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-6">
            <div className="border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="text-[15px] font-bold text-slate-800">
                  Danh sách ứng viên mới
                </h2>

                <Link
                  to="/recruiter/candidates"
                  className="flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:underline"
                >
                  XEM TẤT CẢ →
                </Link>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[
                      "Họ tên",
                      "Vị trí ứng tuyển",
                      "Trạng thái",
                      "Ngày nộp",
                      "Thao tác",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400"
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
                        className="px-6 py-10 text-center text-[13px] text-slate-400"
                      >
                        Chưa có ứng viên nào ứng tuyển vào các tin của bạn.
                      </td>
                    </tr>
                  ) : (
                    recentApplicants.map((application) => {
                      const candidateName =
                        application.candidateProfile?.fullName ||
                        application.candidateProfile?.user?.email ||
                        "Ứng viên";

                      return (
                        <tr
                          key={application.id}
                          className="border-b border-slate-50 transition-colors hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500">
                                <span className="text-[11px] font-bold text-white">
                                  {getInitials(candidateName)}
                                </span>
                              </div>

                              <span className="text-[13px] font-semibold text-slate-800">
                                {candidateName}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-[13px] text-slate-600">
                            {application.jobPosting?.title || "Không rõ"}
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

                          <td className="px-6 py-4 text-[13px] text-slate-400">
                            {formatTime(application.appliedAt)}
                          </td>

                          <td className="px-6 py-4">
                            <Link
                              to="/recruiter/candidates"
                              className="border border-slate-200 px-3 py-1 text-[12px] text-slate-500 transition-colors hover:bg-slate-100"
                            >
                              Xem
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex-1 border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-[14px] font-bold text-slate-800">
                  Cần xử lý gấp
                </h3>

                <div className="space-y-4">
                  {urgentTasks.map((task, index) => (
                    <div key={`${task.text}-${index}`} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                      <div>
                        <p className="text-[13px] leading-snug text-slate-700">
                          {task.text}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {task.deadline}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-[14px] font-bold text-slate-800">
                  Gợi ý nhanh
                </h3>

                <div className="space-y-3 text-[13px] text-slate-500">
                  <p>
                    Thường xuyên cập nhật trạng thái hồ sơ để ứng viên nhận được phản hồi kịp thời.
                  </p>

                  <p>
                    Tin tuyển dụng có mô tả rõ ràng sẽ giúp tăng tỷ lệ ứng tuyển phù hợp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
