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
  if (status === "pending") return [{ label: "Chuyển sang đang xem xét", value: "reviewing" as const }];
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
  return application.candidateProfile?.fullName || application.candidateProfile?.user?.email || "Ứng viên chưa cập nhật tên";
};

export function ManageCandidatesPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<RecruiterApplication | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return applications;

    return applications.filter((application) => {
      const name = getCandidateName(application).toLowerCase();
      const email = application.candidateProfile?.user?.email?.toLowerCase() ?? "";
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
      setError(err instanceof Error ? err.message : "Không tải được danh sách ứng viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Không tải được danh sách tin tuyển dụng");
    });
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [selectedJobId, statusFilter]);

  const openApplication = (application: RecruiterApplication) => {
    setSelectedApplication(application);
    setFeedback(application.feedbacks?.[0]?.content ?? "");
    setScore(application.evaluations?.[0]?.score ?? 3);
    setNotes(application.evaluations?.[0]?.notes ?? "");
  };

  const handleChangeStatus = async (nextStatus: "reviewing" | "accepted" | "rejected") => {
    if (!selectedApplication) return;
    setError("");
    setMessage("");

    try {
      await updateApplicationStatus(selectedApplication.id, nextStatus);
      setMessage("Cập nhật trạng thái ứng viên thành công");
      setSelectedApplication(null);
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái");
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Quản lý ứng viên</h1>
        <p className="text-[14px] text-slate-500 mt-1">Kết nối API applications dành cho recruiter.</p>
      </div>

      {(message || error) && (
        <div className={`mb-4 border px-4 py-3 text-[13px] ${error ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"}`}>
          {error || message}
        </div>
      )}

      <div className="bg-white border border-slate-200 p-5 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tin tuyển dụng</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : "")}
              className="w-full h-10 px-4 border border-slate-200 text-[13px] outline-none text-slate-600 bg-white"
            >
              <option value="">Chọn tin tuyển dụng</option>
              {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "")}
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tìm ứng viên</label>
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
                {["Ứng viên", "CV", "Ngày ứng tuyển", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-[13px] text-slate-400">Đang tải dữ liệu...</td></tr>}
              {!loading && filteredApplications.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-[13px] text-slate-400">Chưa có ứng viên cho tin này.</td></tr>}
              {!loading && filteredApplications.map((application) => (
                <tr key={application.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-6 py-5">
                    <p className="text-[14px] font-bold text-slate-900">{getCandidateName(application)}</p>
                    <p className="text-[12px] text-slate-400 mt-1">{application.candidateProfile?.user?.email || "Chưa có email"}</p>
                  </td>
                  <td className="px-6 py-5 text-[13px] text-slate-500">{application.cv?.title || "Chưa có CV"}</td>
                  <td className="px-6 py-5 text-[13px] text-slate-500">{formatDate(application.appliedAt)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-sm ${statusStyle[application.status]}`}>
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
            <div className="text-center text-[13px] text-slate-400 py-16">Chọn một ứng viên để xem chi tiết, phản hồi và đánh giá.</div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-[18px] font-bold text-slate-900">{getCandidateName(selectedApplication)}</h2>
                <p className="text-[13px] text-slate-500">{selectedApplication.candidateProfile?.phone || "Chưa có số điện thoại"}</p>
                {selectedApplication.cv?.pdfUrl && (
                  <a className="text-[13px] font-semibold text-blue-600 hover:underline" href={selectedApplication.cv.pdfUrl} target="_blank" rel="noreferrer">Xem CV PDF</a>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Chuyển trạng thái</label>
                <div className="flex gap-2 flex-wrap">
                  {nextStatusOptions(selectedApplication.status).length === 0 && <span className="text-[13px] text-slate-400">Không còn bước chuyển hợp lệ.</span>}
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Phản hồi cho ứng viên</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="w-full border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-slate-400 text-slate-700"
                />
                <button onClick={() => void handleSaveFeedback()} className="mt-2 h-8 px-3 border border-slate-300 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
                  Gửi phản hồi
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Đánh giá nội bộ</label>
                <select value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full h-9 border border-slate-200 px-3 text-[13px] mb-2">
                  {[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>{item} sao</option>)}
                </select>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-slate-400 text-slate-700"
                />
                <button onClick={() => void handleSaveEvaluation()} className="mt-2 h-8 px-3 border border-slate-300 text-[12px] font-semibold text-slate-700 hover:bg-slate-50">
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
