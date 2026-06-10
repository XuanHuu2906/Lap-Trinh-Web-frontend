import { useEffect, useMemo, useState } from "react";
import {
  createEvaluation,
  createFeedback,
  getApplicationsByJob,
  getMyJobs,
  updateApplicationStatus,
  type ApplicationStatus,
  type RecruiterApplication,
  type RecruiterJob,
} from "../../services/recruiter.service";
import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Mới",
  reviewing: "Đang xem xét",
  accepted: "Đạt",
  rejected: "Không phù hợp",
  cancelled: "Đã hủy",
};

const statusStyle: Record<ApplicationStatus, string> = {
  pending: "border border-blue-400 text-blue-600 bg-white",
  reviewing: "border border-orange-400 text-orange-600 bg-white",
  accepted: "border border-emerald-400 text-emerald-600 bg-white",
  rejected: "border border-red-400 text-red-600 bg-white",
  cancelled: "border border-slate-300 text-slate-500 bg-white",
};

const nextStatusOptions = (status: ApplicationStatus) => {
  if (status === "pending")
    return [{ label: "Chuyển sang đang xem xét", value: "reviewing" as const }];
  if (status === "reviewing") {
    return [
      { label: "Duyệt / đạt", value: "accepted" as const },
      { label: "Từ chối", value: "rejected" as const },
    ];
  }
  return [];
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("vi-VN");
};

const getCandidateName = (application: RecruiterApplication) => {
  return (
    application.candidateProfile?.fullName ||
    application.candidateProfile?.user?.email ||
    "Ứng viên chưa cập nhật tên"
  );
};

export function ManageCandidatesPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplication | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Modal states for high-fidelity candidate modal (UC-15 & UC-16)
  const [modalOpen, setModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCandidate] = useState<any | null>(null);

  // Temp states used inside the modal
  const [tempScore, setTempScore] = useState(0);
  const [tempNotes, setTempNotes] = useState("");
  const [tempStatus, setTempStatus] = useState("Mới");
  const [tempFeedbackMsg, setTempFeedbackMsg] = useState("");

  // Minimal stubs for modal actions (these can be expanded later)
  const loadTemplateFeedback = (status: string) => {
    // populate tempFeedbackMsg based on status (stub)
    if (status === "Đạt") setTempFeedbackMsg("Xin chúc mừng, bạn đã được... ");
    else if (status === "Không phù hợp")
      setTempFeedbackMsg("Cảm ơn bạn đã ứng tuyển, tuy nhiên...");
    else setTempFeedbackMsg("");
  };

  const handleSendFeedback = async () => {
    // stub: integrate with real API when available
    setMessage("Gửi phản hồi (mô phỏng) thành công");
  };

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
    const response = await getMyJobs({ page: 1, limit: 50, status: "" });
    setJobs(response.data);

    if (!selectedJobId && response.data.length > 0) {
      setSelectedJobId(response.data[0].id);
    }
  };

  const loadApplications = async () => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getApplicationsByJob({
        jobId: selectedJobId,
        page: 1,
        limit: 50,
        status: statusFilter,
      });
      setApplications(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách ứng viên",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs().catch((err: unknown) => {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách tin tuyển dụng",
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, statusFilter]);

  const openApplication = (application: RecruiterApplication) => {
    setSelectedApplication(application);
    setFeedback(application.feedbacks?.[0]?.content ?? "");
    setScore(application.evaluations?.[0]?.score ?? 3);
    setNotes(application.evaluations?.[0]?.notes ?? "");
  };

  const handleChangeStatus = async (
    nextStatus: "reviewing" | "accepted" | "rejected",
  ) => {
    if (!selectedApplication) return;
    setError("");
    setMessage("");

    try {
      await updateApplicationStatus(selectedApplication.id, nextStatus);
      setMessage("Cập nhật trạng thái ứng viên thành công");
      setSelectedApplication(null);
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
      await createFeedback(selectedApplication.id, feedback.trim());
      setMessage("Gửi phản hồi cho ứng viên thành công");
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được phản hồi");
    }
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

  // Filtering handled via `filteredApplications` above

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
          Quản lý ứng viên
        </h1>
        <p className="text-[14px] text-slate-500 mt-1">
          Kết nối API applications dành cho recruiter.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`mb-4 border px-4 py-3 text-[13px] ${error ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}
        >
          {error || message}
        </div>
      )}

      <div className="bg-white border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tin tuyển dụng
            </label>
            <select
              value={selectedJobId}
              onChange={(e) =>
                setSelectedJobId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full h-10 px-4 border border-slate-200 text-[13px] outline-none text-slate-600 bg-white"
            >
              <option value="">Chọn tin tuyển dụng</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApplicationStatus | "")
              }
              className="w-full h-10 px-4 border border-slate-200 text-[13px] outline-none text-slate-600 bg-white"
            >
              <option value="">Tất cả</option>
              <option value="pending">Mới</option>
              <option value="reviewing">Đang xem xét</option>
              <option value="accepted">Đạt</option>
              <option value="rejected">Không phù hợp</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Tìm ứng viên
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên hoặc email ứng viên..."
              className="w-full h-10 px-4 border border-slate-200 text-[13px] outline-none focus:border-slate-400 text-slate-700"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6 items-start">
        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  "Ứng viên",
                  "CV",
                  "Ngày ứng tuyển",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[13px] text-slate-400"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
              {!loading && filteredApplications.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[13px] text-slate-400"
                  >
                    Chưa có ứng viên cho tin này.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <p className="text-[14px] font-bold text-slate-900">
                        {getCandidateName(application)}
                      </p>
                      <p className="text-[12px] text-slate-400 mt-1">
                        {application.candidateProfile?.user?.email ||
                          "Chưa có email"}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-500">
                      {application.cv?.title || "Chưa có CV"}
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-500">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-1 rounded-sm ${statusStyle[application.status]}`}
                      >
                        {statusLabel[application.status]}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => openApplication(application)}
                        className="h-8 px-3 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Xem / xử lý
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-200 p-5 min-h-80">
          {!selectedApplication ? (
            <div className="text-center text-[13px] text-slate-400 py-16">
              Chọn một ứng viên để xem chi tiết, phản hồi và đánh giá.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-bold text-slate-900">
                  {getCandidateName(selectedApplication)}
                </h2>
                <p className="text-[13px] text-slate-500">
                  {selectedApplication.candidateProfile?.phone ||
                    "Chưa có số điện thoại"}
                </p>
                {selectedApplication.cv?.pdfUrl && (
                  <a
                    className="text-[13px] font-semibold text-blue-600 hover:underline"
                    href={selectedApplication.cv.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Xem CV PDF
                  </a>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Chuyển trạng thái
                </label>
                <div className="flex gap-2 flex-wrap">
                  {nextStatusOptions(selectedApplication.status).length ===
                    0 && (
                    <span className="text-[13px] text-slate-400">
                      Không còn bước chuyển hợp lệ.
                    </span>
                  )}
                  {nextStatusOptions(selectedApplication.status).map((item) => (
                    <button
                      key={item.value}
                      onClick={() => void handleChangeStatus(item.value)}
                      className="h-8 px-3 bg-[#0f1f3d] text-white text-[12px] font-bold hover:bg-[#1a2f52]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Phản hồi cho ứng viên
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="w-full border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-slate-400 text-slate-700"
                />
                <button
                  onClick={() => void handleSaveFeedback()}
                  className="mt-2 h-8 px-3 border border-slate-300 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Gửi phản hồi
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Đánh giá nội bộ
                </label>
                <select
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-9 border border-slate-200 px-3 text-[13px] mb-2"
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
                  className="w-full border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-slate-400 text-slate-700"
                />
                <button
                  onClick={() => void handleSaveEvaluation()}
                  className="mt-2 h-8 px-3 border border-slate-300 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Lưu đánh giá
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── HIGH FIDELITY CANDIDATE MODAL FOR UC-15 & UC-16 ── */}
      {modalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-slate-100 dark:border-slate-800 animate-scale-up">
            {/* Left side: Candidate Portfolio Information */}
            <div className="w-full md:w-5/12 bg-slate-50 dark:bg-slate-950 p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                    Hồ sơ ứng viên
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-sm ${selectedCandidate.statusStyle}`}
                  >
                    {selectedCandidate.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md"
                    style={{ backgroundColor: selectedCandidate.color }}
                  >
                    {selectedCandidate.initials}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                      {selectedCandidate.name}
                    </h2>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1 uppercase tracking-wider">
                      {selectedCandidate.position}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-250 dark:border-slate-800 pt-5">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold">
                      {selectedCandidate.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold">
                      {selectedCandidate.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-350">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold">
                      Nộp ngày: {selectedCandidate.date}
                    </span>
                  </div>
                </div>

                {/* Simulated Interactive Resume Viewer */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-md mt-6 shadow-3xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-50 dark:bg-slate-800 text-indigo-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        CV_Nguyen_Van_A.pdf
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Bản chính thức • 2.4 MB
                      </p>
                    </div>
                  </div>
                  <div className="h-24 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-sm flex items-center justify-center text-slate-400 text-xs hover:text-indigo-600 hover:border-indigo-400 transition-colors cursor-pointer">
                    Click để mở xem trực tiếp CV trong tab mới
                  </div>
                </div>
              </div>

              {/* Status footer inside left pane */}
              <div className="mt-8 pt-4 border-t border-slate-250 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>ID Hồ sơ: HR-CAND-{selectedCandidate.id}092</span>
              </div>
            </div>

            {/* Right side: UC-15 Response Feedback Form & UC-16 Star Score Evaluation */}
            <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto">
              {/* Header Action */}
              <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-5">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                  Xử lý & Chấm Điểm Hồ Sơ
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1 pr-1">
                {/* 1. ĐÁNH GIÁ ỨNG VIÊN (SCORE STARS + INTERNAL NOTES) */}
                <div className="bg-indigo-50/20 dark:bg-slate-950/20 border border-indigo-100 dark:border-slate-800 p-5 rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Chấm Điểm & Nhận Xét Nội Bộ
                    </h4>
                  </div>

                  {/* Star selection */}
                  <div className="mb-4">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block mb-1.5">
                      Chấm điểm sao cho ứng viên
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTempScore(star)}
                          className="focus:outline-none transition-transform hover:scale-115 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= tempScore
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-750"
                            }`}
                          />
                        </button>
                      ))}
                      {tempScore > 0 && (
                        <span className="text-xs text-amber-500 font-bold ml-2">
                          ({tempScore} / 5 Sao)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes content */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block mb-1.5">
                      Ghi chú / Nhận xét nội bộ (Bộ phận Tuyển dụng)
                    </span>
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Điền ghi chú kỹ năng, kinh nghiệm phỏng vấn, thái độ của ứng viên..."
                      rows={3}
                      className="w-full text-xs p-3 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 rounded-sm bg-white dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {/* Action Save evaluation */}
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSaveEvaluation}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-4 py-2 rounded-sm transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Lưu đánh giá nội bộ
                    </button>
                  </div>
                </div>

                {/* 2. PHẢN HỒI ỨNG VIÊN (OFFICIAL FEEDBACK FORM & STATUS UPDATE) */}
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-5 rounded-md">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-slate-600 shrink-0" />
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Phản hồi chính thức cho Ứng viên
                    </h4>
                  </div>

                  {/* Select status */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase block mb-1.5">
                        Cập nhật trạng thái tuyển dụng
                      </span>
                      <select
                        value={tempStatus}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempStatus(val);
                          loadTemplateFeedback(val);
                        }}
                        className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 text-xs outline-none bg-white dark:bg-slate-950 dark:text-white rounded-sm cursor-pointer"
                      >
                        <option value="Mới">Mới (Nhận hồ sơ)</option>
                        <option value="Đang phỏng vấn">Hẹn phỏng vấn</option>
                        <option value="Đạt">Chấp nhận (Đạt tuyển dụng)</option>
                        <option value="Không phù hợp">
                          Từ chối (Không phù hợp)
                        </option>
                      </select>
                    </div>

                    {/* Auto-load templates indicators */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => loadTemplateFeedback(tempStatus)}
                        className="h-9 px-3.5 border border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-600 hover:text-indigo-700 text-[11px] font-bold transition-all rounded-sm bg-white dark:bg-slate-900 flex items-center justify-center gap-1.5 cursor-pointer w-full"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Tải
                        mẫu thư tự động
                      </button>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block mb-1.5">
                      Nội dung phản hồi (Sẽ gửi qua email/hệ thống cho ứng viên)
                    </span>
                    <textarea
                      value={tempFeedbackMsg}
                      onChange={(e) => setTempFeedbackMsg(e.target.value)}
                      placeholder="Nhập thư mời phỏng vấn, thư cảm ơn hoặc thông báo tuyển dụng chính thức..."
                      rows={5}
                      className="w-full text-xs p-3 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 rounded-sm bg-white dark:bg-slate-950 dark:text-white font-mono"
                    />
                  </div>

                  {/* Send Action */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleSendFeedback}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-[11px] px-4 py-2 rounded-sm transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Gửi phản hồi & Cập nhật
                      trạng thái
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-150 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-bold rounded-sm transition-all cursor-pointer"
                >
                  Đóng Modal xử lý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
