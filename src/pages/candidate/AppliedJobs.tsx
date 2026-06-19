import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Search,
  ShieldCheck,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  applicationService,
  clearMyApplicationsCache,
  getCachedMyApplications,
  type CandidateApplication,
} from "@/services/application.service";
import { chatService } from "@/services/chat.service";
import { jobService } from "@/services/job.service";

type StatusDisplay = {
  label: string;
  className: string;
};

type StatusOption = {
  label: string;
  value: string;
};

type CounterCardInfo = {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
};

const applicationStatusOptions: StatusOption[] = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang chờ", value: "pending" },
  { label: "Đang xem", value: "reviewing" },
  { label: "Mời phỏng vấn", value: "interview" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Trúng tuyển", value: "hired" },
  { label: "Từ chối", value: "rejected" },
];

const applicationStatusDisplays: Record<string, StatusDisplay> = {
  pending: {
    label: "Đang chờ",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  reviewing: {
    label: "Đang xem",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  interview: {
    label: "Mời phỏng vấn",
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
  confirmed: {
    label: "Đã xác nhận",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  hired: {
    label: "Trúng tuyển",
    className:
      "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  },
  cancelled: {
    label: "Đã hủy",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

const tableHeadings = [
  "Vị trí ứng tuyển",
  "Công ty",
  "Ngày nộp",
  "CV đã gửi",
  "Trạng thái",
  "Thao tác",
];

function formatDate(value?: string) {
  if (!value) return "Không rõ";

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function getCompanyName(application: CandidateApplication) {
  return (
    application.jobPosting?.recruiter?.recruiterProfile?.companyName ||
    "Không rõ công ty"
  );
}

function getApplicationSkills(application: CandidateApplication) {
  return (
    application.jobPosting?.skills?.map((skill) => skill.skill.name).join(", ") ||
    "Không có kỹ năng"
  );
}

function getStatusDisplay(status: string) {
  return applicationStatusDisplays[status] || applicationStatusDisplays.pending;
}

function CounterCard({ item }: { item: CounterCardInfo }) {
  const Icon = item.icon;

  return (
    <div className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {item.value}
          </p>
          <p className="text-[11px] text-slate-400">{item.label}</p>
        </div>
      </div>
    </div>
  );
}

function CounterGrid({ counters }: { counters: CounterCardInfo[] }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-5">
      {counters.map((counter) => (
        <CounterCard key={counter.label} item={counter} />
      ))}
    </div>
  );
}

function FilterBar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm kiếm vị trí, công ty..."
          className="h-10 w-full border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
        />
      </div>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="h-10 border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
      >
        {applicationStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ApplicationsTable({
  applications,
  isLoading,
  error,
  onView,
  onChat,
  chatOpeningId,
}: {
  applications: CandidateApplication[];
  isLoading: boolean;
  error: string | null;
  onView: (application: CandidateApplication) => void;
  onChat: (application: CandidateApplication) => void;
  chatOpeningId: number | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            {tableHeadings.map((heading) => (
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
          <ApplicationsTableBody
            applications={applications}
            isLoading={isLoading}
            error={error}
            onView={onView}
            onChat={onChat}
            chatOpeningId={chatOpeningId}
          />
        </tbody>
      </table>
    </div>
  );
}

function ApplicationsTableBody({
  applications,
  isLoading,
  error,
  onView,
  onChat,
  chatOpeningId,
}: {
  applications: CandidateApplication[];
  isLoading: boolean;
  error: string | null;
  onView: (application: CandidateApplication) => void;
  onChat: (application: CandidateApplication) => void;
  chatOpeningId: number | null;
}) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
          Đang tải danh sách ứng tuyển...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-8 text-sm text-red-500">
          {error}
        </td>
      </tr>
    );
  }

  if (applications.length === 0) {
    return (
      <tr>
        <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
          Chưa có đơn ứng tuyển phù hợp.
        </td>
      </tr>
    );
  }

  return (
    <>
      {applications.map((application) => (
        <ApplicationRow
          key={application.id}
          application={application}
          onView={onView}
          onChat={onChat}
          isOpeningChat={chatOpeningId === application.id}
        />
      ))}
    </>
  );
}

function ApplicationRow({
  application,
  onView,
  onChat,
  isOpeningChat,
}: {
  application: CandidateApplication;
  onView: (application: CandidateApplication) => void;
  onChat: (application: CandidateApplication) => void;
  isOpeningChat: boolean;
}) {
  const status = getStatusDisplay(application.status);

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
      <td className="px-6 py-4">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
          {application.jobPosting?.title || "Không rõ vị trí"}
        </p>
        <p className="text-xs text-slate-400">
          {getApplicationSkills(application)}
        </p>
      </td>
      <td className="px-6 py-4 text-[13px] text-slate-600 dark:text-slate-300">
        {application.jobPosting ? (
          <Link
            to={`/candidate/companies/${application.jobPosting.recruiterId}`}
            className="font-semibold transition hover:text-blue-600 hover:underline dark:hover:text-indigo-400"
          >
            {getCompanyName(application)}
          </Link>
        ) : (
          getCompanyName(application)
        )}
      </td>
      <td className="px-6 py-4 text-[13px] text-slate-400">
        {formatDate(application.appliedAt)}
      </td>
      <td className="px-6 py-4 text-[13px] text-blue-600 dark:text-indigo-400">
        {application.cv?.title || `CV #${application.cvId}`}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-block rounded-sm px-2 py-1 text-[11px] font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onView(application)}
            className="border border-slate-200 px-3 py-1 text-[12px] text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Xem
          </button>
          <button
            type="button"
            onClick={() => onChat(application)}
            disabled={isOpeningChat}
            className="inline-flex items-center gap-1.5 border border-indigo-200 px-3 py-1 text-[12px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {isOpeningChat ? "Đang mở..." : "Nhắn tin"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function ApplicationDetailModal({
  application,
  onClose,
  onRefresh,
}: {
  application: CandidateApplication;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const status = getStatusDisplay(application.status);
  const feedbacks = application.feedbacks ?? [];
  const interview = application.interviews?.[0];
  const [confirming, setConfirming] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  const handleConfirm = async () => {
    setConfirming(true);
    setConfirmMsg("");
    try {
      await applicationService.confirmInterview(application.id);
      setConfirmMsg("Xác nhận phỏng vấn thành công!");
      clearMyApplicationsCache();
      onRefresh();
    } catch (err: any) {
      setConfirmMsg(err.response?.data?.message || "Không thể xác nhận phỏng vấn.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Chi tiết đơn ứng tuyển
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Vị trí
            </p>
            <h3 className="mt-2 font-bold text-slate-950 dark:text-white">
              {application.jobPosting?.title || "Không rõ vị trí"}
            </h3>
            {application.jobPosting ? (
              <Link
                to={`/candidate/companies/${application.jobPosting.recruiterId}`}
                className="mt-1 inline-block text-sm text-slate-500 transition hover:text-blue-600 hover:underline dark:hover:text-indigo-400"
              >
                {getCompanyName(application)}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                {getCompanyName(application)}
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Ngày nộp" value={formatDate(application.appliedAt)} />
            <DetailItem
              label="CV đã gửi"
              value={application.cv?.title || `CV #${application.cvId}`}
            />
            <DetailItem label="Kỹ năng yêu cầu" value={getApplicationSkills(application)} />
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                Trạng thái
              </p>
              <span
                className={`inline-block rounded-sm px-2 py-1 text-[11px] font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              Thư giới thiệu
            </p>
            <p className="min-h-16 whitespace-pre-line border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
              {application.coverLetter || "Bạn không gửi thư giới thiệu."}
            </p>
          </div>

          {interview && (application.status === "interview" || application.status === "confirmed") && (
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                Thông tin phỏng vấn
              </p>
              <div className="border border-violet-200 bg-violet-50 p-3 space-y-2 dark:border-violet-900/60 dark:bg-violet-950/30">
                <InterviewDetailRow
                  label="Thời gian"
                  value={new Date(interview.scheduledAt).toLocaleString("vi-VN", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                />
                <InterviewDetailRow
                  label="Hình thức"
                  value={interview.type === "online" ? "Online" : "Offline"}
                />
                <InterviewDetailRow
                  label={interview.type === "online" ? "Link" : "Địa chỉ"}
                  value={interview.location || "—"}
                  isLink={interview.type === "online"}
                />
                {interview.notes && (
                  <InterviewDetailRow label="Ghi chú" value={interview.notes} />
                )}
                {interview.status === "confirmed" && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    Bạn đã xác nhận tham gia phỏng vấn
                  </p>
                )}
              </div>

              {application.status === "interview" && (
                <div className="mt-3">
                  {confirmMsg && (
                    <p className={`mb-2 text-xs font-semibold ${confirmMsg.includes("thành công") ? "text-emerald-600" : "text-red-500"}`}>
                      {confirmMsg}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleConfirm()}
                    disabled={confirming}
                    className="h-9 bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {confirming ? "Đang xử lý..." : "Xác nhận tham gia phỏng vấn"}
                  </button>
                </div>
              )}
            </div>
          )}

          {(application.status === "hired" || application.status === "rejected") &&
            interview && (
              <div
                className={`flex items-start gap-3 border p-3 ${
                  application.status === "hired"
                    ? "border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/30"
                    : "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
                }`}
              >
                {application.status === "hired" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-300" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-300" />
                )}
                <div>
                  <p
                    className={`text-sm font-bold ${
                      application.status === "hired"
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-700 dark:text-red-200"
                    }`}
                  >
                    Kết quả phỏng vấn:{" "}
                    {application.status === "hired" ? "Trúng tuyển" : "Không phù hợp"}
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${
                      application.status === "hired"
                        ? "text-green-700/80 dark:text-green-300/80"
                        : "text-red-600/80 dark:text-red-300/80"
                    }`}
                  >
                    {application.status === "hired"
                      ? "Chúc mừng bạn! Xem chi tiết phản hồi của nhà tuyển dụng bên dưới."
                      : "Xem chi tiết phản hồi của nhà tuyển dụng bên dưới."}
                  </p>
                </div>
              </div>
            )}

          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              Phản hồi từ nhà tuyển dụng
            </p>
            {feedbacks.length > 0 ? (
              <div className="space-y-2">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300"
                  >
                    <p>{feedback.content}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(feedback.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="border border-slate-200 px-3 py-2 text-sm text-slate-500 dark:border-slate-800">
                Chưa có phản hồi.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InterviewDetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-semibold text-slate-600 dark:text-slate-400 min-w-20">{label}:</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
          {value}
        </a>
      ) : (
        <span className="text-slate-700 dark:text-slate-300">{value}</span>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  );
}

export default function AppliedJobs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const initialParams = { page: 1, limit: 50, status: undefined };
  const cachedApplications = getCachedMyApplications(initialParams);

  const [applications, setApplications] = useState<CandidateApplication[]>(
    cachedApplications?.data ?? [],
  );
  const [isLoading, setIsLoading] = useState(!cachedApplications);
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatOpeningId, setChatOpeningId] = useState<number | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<CandidateApplication | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      const params = {
        page: 1,
        limit: 50,
        status: status || undefined,
      };

      try {
        if (!getCachedMyApplications(params)) {
          setIsLoading(true);
        }
        setError(null);

        const response = await applicationService.getMyApplications(params);

        if (isMounted) {
          setApplications(response.data);
        }
      } catch {
        if (isMounted) {
          setError("Không thể tải danh sách ứng tuyển.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, [status, refreshTrigger]);

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return applications;

    return applications.filter((application) => {
      const title = application.jobPosting?.title?.toLowerCase() || "";
      const company = getCompanyName(application).toLowerCase();

      return title.includes(keyword) || company.includes(keyword);
    });
  }, [applications, search]);

  const handleOpenChat = async (application: CandidateApplication) => {
    setChatOpeningId(application.id);
    setChatError(null);

    try {
      let recruiterProfileId =
        application.jobPosting?.recruiter?.recruiterProfile?.id;

      if (!recruiterProfileId) {
        const jobResponse = await jobService.getJobById(application.jobPostingId);
        recruiterProfileId = jobResponse.data.recruiter?.recruiterProfile?.id;
      }

      if (!recruiterProfileId) {
        throw new Error("Khong tim thay ho so nha tuyen dung.");
      }

      const conversation = await chatService.createConversation({
        recruiterProfileId,
        jobPostingId: application.jobPostingId,
      });

      navigate(`/candidate/chat?conversationId=${conversation.id}`);
    } catch (chatError) {
      console.error("Khong the mo cuoc tro chuyen:", chatError);
      setChatError("Khong the mo cuoc tro chuyen voi nha tuyen dung luc nay.");
    } finally {
      setChatOpeningId(null);
    }
  };

  const counters: CounterCardInfo[] = useMemo(
    () => [
      {
        label: "Tổng số đã nộp",
        value: applications.length,
        icon: FileText,
        color:
          "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
      },
      {
        label: "Đang chờ",
        value: applications.filter((item) => item.status === "pending").length,
        icon: Clock,
        color:
          "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 dark:text-yellow-300",
      },
      {
        label: "Mời phỏng vấn",
        value: applications.filter((item) => item.status === "interview").length,
        icon: ShieldCheck,
        color:
          "text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300",
      },
      {
        label: "Trúng tuyển",
        value: applications.filter((item) => item.status === "hired").length,
        icon: CheckCircle2,
        color:
          "text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-300",
      },
      {
        label: "Từ chối",
        value: applications.filter((item) => item.status === "rejected").length,
        icon: XCircle,
        color:
          "text-red-500 bg-red-50 dark:bg-red-950/40 dark:text-red-300",
      },
    ],
    [applications],
  );

  return (
    <div>
      <CounterGrid counters={counters} />

      <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <FilterBar
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

        {chatError ? (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-950/60 dark:bg-red-950/20 dark:text-red-300">
            {chatError}
          </div>
        ) : null}

        <ApplicationsTable
          applications={filteredApplications}
          isLoading={isLoading}
          error={error}
          onView={setSelectedApplication}
          onChat={(application) => void handleOpenChat(application)}
          chatOpeningId={chatOpeningId}
        />
      </div>

      {selectedApplication ? (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onRefresh={() => setRefreshTrigger((n) => n + 1)}
        />
      ) : null}
    </div>
  );
}
