import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Video,
  CheckCircle,
  AlertTriangle,
  Building,
  Briefcase,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  applicationService,
  type CandidateApplication,
} from "../../services/application.service";

export function ConfirmInterviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationIdStr = searchParams.get("applicationId");
  const applicationId = applicationIdStr ? Number(applicationIdStr) : null;

  const [application, setApplication] = useState<CandidateApplication | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId || Number.isNaN(applicationId)) {
      setError("Mã đơn ứng tuyển không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res =
          await applicationService.getApplicationDetail(applicationId);
        if (res.success && res.data) {
          setApplication(res.data);
          // Nếu trạng thái của đơn tuyển đã là 'confirmed', hiển thị trạng thái thành công luôn
          if (res.data.status === "confirmed") {
            setSuccess(true);
          }
        } else {
          setError("Không thể tải thông tin chi tiết đơn ứng tuyển.");
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin ứng tuyển:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi kết nối tới máy chủ.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [applicationId]);

  const handleConfirm = async () => {
    if (!applicationId) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await applicationService.confirmInterview(applicationId);
      if (res.success) {
        setSuccess(true);
        if (application) {
          setApplication({
            ...application,
            status: "confirmed",
          });
        }
      } else {
        setError("Không thể xác nhận lịch phỏng vấn. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi xác nhận phỏng vấn:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gặp sự cố khi thực hiện yêu cầu xác nhận.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getLatestInterview = () => {
    if (!application?.interviews || application.interviews.length === 0)
      return null;
    return application.interviews[0];
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const interview = getLatestInterview();
  const companyName =
    application?.jobPosting?.recruiter?.recruiterProfile?.companyName ||
    "Công ty tuyển dụng";

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 transition-all duration-300">
        {/* Background decorative gradient */}
        <div className="absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 -z-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl"></div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative h-12 w-12 mb-3">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
              Đang tải chi tiết lịch phỏng vấn...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 animate-bounce">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
              Có lỗi xảy ra
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error}
            </p>
            <button
              onClick={() => navigate("/candidate/applied-jobs")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 h-10 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Về danh sách đơn ứng tuyển
            </button>
          </div>
        )}

        {!loading && !error && !interview && (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400">
              <Clock className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">
              Lịch phỏng vấn chưa được tạo
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy thông tin lịch phỏng vấn nào liên kết với đơn ứng
              tuyển này.
            </p>
            <button
              onClick={() => navigate("/candidate/applied-jobs")}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 h-10 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại danh sách
            </button>
          </div>
        )}

        {!loading && !error && interview && (
          <div>
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400 scale-100 transition-transform duration-500">
                  <CheckCircle className="h-10 w-10 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Xác nhận thành công!
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Bạn đã xác nhận tham gia phỏng vấn với{" "}
                  <strong>{companyName}</strong>.
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Nhà tuyển dụng sẽ nhận được phản hồi và liên hệ lại với bạn.
                </p>

                <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800/60 text-left max-w-sm mx-auto bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Thông tin tóm tắt
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{application?.jobPosting?.title}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{formatDateTime(interview.scheduledAt)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      {interview.type === "online" ? (
                        <Video className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate">
                        {interview.type === "online" ? "Online" : "Offline"} -{" "}
                        {interview.location}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/candidate/applied-jobs")}
                  className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 h-11 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  Về trang Đơn ứng tuyển của tôi
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 pb-4 dark:border-slate-800/60">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Thư mời & Lịch phỏng vấn
                  </h1>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Vui lòng xem lại thông tin phỏng vấn bên dưới và nhấp nút để
                    xác nhận tham gia.
                  </p>
                </div>

                {/* Job & Company Profile Overview */}
                <div className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {application?.jobPosting?.title}
                    </h3>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-350">
                      {companyName}
                    </p>
                  </div>
                </div>

                {/* Interview detailed cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Chi tiết cuộc phỏng vấn
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Time */}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3.5 dark:border-slate-800/40 bg-white dark:bg-slate-950/20">
                      <div className="mt-0.5 rounded-md bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Thời gian
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                          {formatDateTime(interview.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    {/* Format */}
                    <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-3.5 dark:border-slate-800/40 bg-white dark:bg-slate-950/20">
                      <div className="mt-0.5 rounded-md bg-violet-50 p-1.5 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400">
                        {interview.type === "online" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Hình thức phỏng vấn
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                          {interview.type === "online"
                            ? "Trực tuyến (Online)"
                            : "Trực tiếp (Offline)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location or URL */}
                  <div className="flex flex-col gap-1 rounded-lg border border-slate-100 p-4 dark:border-slate-800/40 bg-white dark:bg-slate-950/20">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      {interview.type === "online" ? (
                        <>
                          <Video className="h-3 w-3 text-slate-400" />
                          Đường dẫn phỏng vấn (Link)
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3 text-slate-400" />
                          Địa điểm phỏng vấn
                        </>
                      )}
                    </span>
                    <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100 break-all">
                      {interview.type === "online" ? (
                        <a
                          href={interview.location || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline dark:text-indigo-400 font-bold"
                        >
                          {interview.location || "Đang cập nhật..."}
                        </a>
                      ) : (
                        interview.location || "Đang cập nhật..."
                      )}
                    </p>
                  </div>

                  {/* Notes from Recruiter */}
                  {interview.notes && (
                    <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800/40 bg-white dark:bg-slate-950/20">
                      <div className="mt-0.5 rounded-md bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Ghi chú từ nhà tuyển dụng
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                          {interview.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submitting button action */}
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    onClick={() => void handleConfirm()}
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý xác nhận...</span>
                      </>
                    ) : (
                      "Xác nhận tham gia phỏng vấn"
                    )}
                  </button>

                  <button
                    onClick={() => navigate("/candidate/applied-jobs")}
                    disabled={submitting}
                    className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/60 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Quay lại danh sách ứng tuyển
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
