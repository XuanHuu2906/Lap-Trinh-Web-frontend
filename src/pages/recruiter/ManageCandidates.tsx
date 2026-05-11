import { useState } from "react";
import {
  Star,
  Send,
  X,
  Phone,
  Mail,
  Calendar,
  FileText,
  Award,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";

interface Candidate {
  id: number;
  initials: string;
  color: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  date: string;
  status: string;
  statusStyle: string;
  score: number;
  internalNotes: string;
  feedbackMsg: string;
  feedbackDate: string;
}

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 1,
    initials: "NT",
    color: "#6366f1",
    name: "Nguyễn Văn Thái",
    email: "thai.nguyen@email.com",
    phone: "0912 345 678",
    position: "Senior Frontend Engineer",
    date: "24/10/2023",
    status: "Mới",
    statusStyle: "border border-blue-400 text-blue-600 bg-white",
    score: 0,
    internalNotes: "",
    feedbackMsg: "",
    feedbackDate: "",
  },
  {
    id: 2,
    initials: "TM",
    color: "#f43f5e",
    name: "Trần Thị Mai",
    email: "mai.tran@email.com",
    phone: "0988 777 666",
    position: "Product Manager",
    date: "23/10/2023",
    status: "Đang phỏng vấn",
    statusStyle: "border border-orange-400 text-orange-600 bg-white",
    score: 4,
    internalNotes:
      "Tư duy sản phẩm tốt, đã làm Fintech, khả năng giao tiếp ngoại ngữ xuất sắc.",
    feedbackMsg: "",
    feedbackDate: "",
  },
  {
    id: 3,
    initials: "LH",
    color: "#3b82f6",
    name: "Lê Hoàng Hải",
    email: "hai.le@email.com",
    phone: "0909 123 456",
    position: "Senior Frontend Engineer",
    date: "20/10/2023",
    status: "Đạt",
    statusStyle: "border border-emerald-400 text-emerald-600 bg-white",
    score: 5,
    internalNotes:
      "Kỹ thuật xuất sắc, giải quyết bài test nhanh, có kinh nghiệm triển khai CI/CD hệ thống lớn.",
    feedbackMsg:
      "Chúc mừng bạn Lê Hoàng Hải đã chính thức trúng tuyển vào vị trí Senior Frontend Engineer. Ban Nhân sự sẽ liên hệ trao đổi chi tiết về Offer Letter.",
    feedbackDate: "21/10/2023",
  },
  {
    id: 4,
    initials: "PA",
    color: "#ec4899",
    name: "Phạm Phương Anh",
    email: "anh.pham@email.com",
    phone: "0933 555 444",
    position: "HR Specialist",
    date: "18/10/2023",
    status: "Không phù hợp",
    statusStyle: "border border-red-400 text-red-600 bg-white",
    score: 2,
    internalNotes:
      "Kinh nghiệm tuyển dụng mảng Tech còn mỏng, chưa đáp ứng được nhu cầu mở rộng quy mô lớn hiện tại.",
    feedbackMsg:
      "Cảm ơn bạn đã quan tâm đến cơ hội tại HireArch. Rất tiếc thời điểm hiện tại định hướng của bạn chưa phù hợp hoàn toàn với vị trí này.",
    feedbackDate: "19/10/2023",
  },
];

export function ManageCandidatesPage() {
  const [candidateList, setCandidateList] =
    useState<Candidate[]>(INITIAL_CANDIDATES);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);

  // Modal control states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Temporary evaluation inputs (UC-16)
  const [tempScore, setTempScore] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>("");

  // Temporary feedback inputs (UC-15)
  const [tempStatus, setTempStatus] = useState<string>("Mới");
  const [tempFeedbackMsg, setTempFeedbackMsg] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const toggleAll = () => {
    if (allChecked) {
      setSelected([]);
      setAllChecked(false);
    } else {
      setSelected(candidateList.map((_, i) => i));
      setAllChecked(true);
    }
  };

  const toggleRow = (i: number) => {
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  };

  const handleOpenModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setTempScore(candidate.score);
    setTempNotes(candidate.internalNotes);
    setTempStatus(candidate.status);
    setTempFeedbackMsg(candidate.feedbackMsg);
    setModalOpen(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Mới":
        return "border border-blue-400 text-blue-600 bg-white";
      case "Đang phỏng vấn":
        return "border border-orange-400 text-orange-600 bg-white";
      case "Đạt":
        return "border border-emerald-400 text-emerald-600 bg-white";
      case "Không phù hợp":
        return "border border-red-400 text-red-600 bg-white";
      default:
        return "border border-slate-300 text-slate-600 bg-white";
    }
  };

  // UC-16: Đánh giá ứng viên (Sao & Nhận xét nội bộ)
  const handleSaveEvaluation = () => {
    if (!selectedCandidate) return;

    setCandidateList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCandidate.id) {
          return {
            ...c,
            score: tempScore,
            internalNotes: tempNotes,
          };
        }
        return c;
      }),
    );

    // Update the local candidate reference in modal view as well
    setSelectedCandidate((prev) =>
      prev
        ? {
            ...prev,
            score: tempScore,
            internalNotes: tempNotes,
          }
        : null,
    );

    showToast(
      `Đã lưu kết quả đánh giá cho ứng viên ${selectedCandidate.name} thành công!`,
    );
  };

  // UC-15: Phản hồi ứng viên (Feedback chính thức & trạng thái)
  const handleSendFeedback = () => {
    if (!selectedCandidate) return;

    const feedbackDateStr = new Date().toLocaleDateString("vi-VN");

    setCandidateList((prev) =>
      prev.map((c) => {
        if (c.id === selectedCandidate.id) {
          return {
            ...c,
            status: tempStatus,
            statusStyle: getStatusStyle(tempStatus),
            feedbackMsg: tempFeedbackMsg,
            feedbackDate: feedbackDateStr,
          };
        }
        return c;
      }),
    );

    // Update the local candidate reference in modal view as well
    setSelectedCandidate((prev) =>
      prev
        ? {
            ...prev,
            status: tempStatus,
            statusStyle: getStatusStyle(tempStatus),
            feedbackMsg: tempFeedbackMsg,
            feedbackDate: feedbackDateStr,
          }
        : null,
    );

    showToast(
      `Đã gửi phản hồi chính thức & cập nhật trạng thái ứng tuyển thành công!`,
    );
  };

  // Load predefined template email response
  const loadTemplateFeedback = (status: string) => {
    if (!selectedCandidate) return;

    let template = "";
    const name = selectedCandidate.name;
    const pos = selectedCandidate.position;

    if (status === "Đang phỏng vấn") {
      template = `Kính gửi bạn ${name},\n\nCảm ơn bạn đã nộp hồ sơ ứng tuyển vị trí ${pos} tại công ty chúng tôi.\n\nQua quá trình xem xét ban đầu, chúng tôi rất ấn tượng với hồ sơ của bạn. Ban tuyển dụng muốn mời bạn tham gia một buổi phỏng vấn trực tiếp tại văn phòng công ty để trao đổi rõ hơn.\n\n- Thời gian: 14:00 Thứ Năm tuần tới\n- Địa điểm: Tầng 12, Tòa nhà công nghệ HireArch\n\nBạn vui lòng xác nhận khả năng tham dự bằng cách phản hồi lại email này trước 17:00 ngày mai.\n\nTrân trọng,\nĐội ngũ tuyển dụng HireArch.`;
    } else if (status === "Đạt") {
      template = `Kính gửi bạn ${name},\n\nChúng tôi rất vui mừng thông báo rằng bạn đã hoàn thành xuất sắc các vòng phỏng vấn cho vị trí ${pos}.\n\nĐại diện Ban Nhân Sự sẽ liên hệ trực tiếp với bạn qua số điện thoại ${selectedCandidate.phone} trong vòng 24 giờ tới để gửi thông tin chi tiết về Thư mời nhận việc (Offer Letter) và thảo luận về ngày bắt đầu làm việc.\n\nChào mừng bạn đến với HireArch!\n\nTrân trọng,\nĐội ngũ tuyển dụng HireArch.`;
    } else if (status === "Không phù hợp") {
      template = `Chào bạn ${name},\n\nCảm ơn bạn đã dành thời gian quan tâm và nộp hồ sơ ứng tuyển vị trí ${pos} tại công ty.\n\nHồ sơ của bạn có nhiều điểm sáng, tuy nhiên do nhu cầu hiện tại yêu cầu kỹ năng đặc thù hơn, chúng tôi rất tiếc chưa thể đồng hành cùng bạn trong đợt tuyển dụng này.\n\nHồ sơ của bạn sẽ được lưu giữ tại kho dữ liệu nhân sự của chúng tôi. Chúng tôi sẽ chủ động liên hệ ngay khi có vị trí khác phù hợp hơn với năng lực của bạn.\n\nChúc bạn luôn nhiều may mắn và thành công trên con đường sắp tới!\n\nTrân trọng,\nĐội ngũ tuyển dụng HireArch.`;
    } else {
      template = "";
    }

    setTempFeedbackMsg(template);
  };

  // Filtering candidates based on UI controls
  const filteredCandidates = candidateList.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter
      ? c.position === positionFilter
      : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Toast Alert System */}
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-slate-900 text-white border-l-4 border-indigo-500 px-5 py-4 shadow-xl z-50 flex items-center gap-3 rounded-r-md animate-slide-left max-w-md">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hệ thống thông báo
            </p>
            <p className="text-[12px] font-semibold text-slate-100 mt-0.5 leading-normal">
              {toastMessage}
            </p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
            Quản lý ứng viên
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Theo dõi, chấm điểm đánh giá và phản hồi hồ sơ ứng tuyển.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-0 bg-white border border-slate-200 border-b-0 px-5 py-4">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email, vị trí..."
            className="w-full h-9 pl-9 pr-4 border border-slate-200 text-[13px] outline-none focus:border-indigo-500 placeholder:text-slate-300 text-slate-700 rounded-sm"
          />
        </div>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="h-9 px-3 border border-slate-200 text-[13px] outline-none text-slate-500 bg-white appearance-none cursor-pointer min-w-42.5 rounded-sm"
        >
          <option value="">Tất cả vị trí</option>
          <option>Senior Frontend Engineer</option>
          <option>Product Manager</option>
          <option>HR Specialist</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 border border-slate-200 text-[13px] outline-none text-slate-500 bg-white appearance-none cursor-pointer min-w-42.5 rounded-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option>Mới</option>
          <option>Đang phỏng vấn</option>
          <option>Đạt</option>
          <option>Không phù hợp</option>
        </select>
        <div className="ml-auto">
          <button className="h-9 px-4 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors rounded-sm cursor-pointer">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Lọc nâng cao
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 border-t-0 rounded-b-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75">
              <th className="w-10 px-5 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="accent-indigo-600 cursor-pointer"
                />
              </th>
              {[
                "Ứng viên",
                "Vị trí ứng tuyển",
                "Ngày ứng tuyển",
                "Đánh giá nội bộ",
                "Trạng thái",
                "Thao tác",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-slate-400 text-xs font-semibold"
                >
                  Không tìm thấy ứng viên nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-slate-100 transition-colors ${selected.includes(i) ? "bg-indigo-50/30" : "hover:bg-slate-50/60"}`}
                >
                  <td className="w-10 px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(i)}
                      onChange={() => toggleRow(i)}
                      className="accent-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-3xs"
                        style={{ backgroundColor: c.color }}
                      >
                        <span className="text-white text-[11px] font-bold">
                          {c.initials}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800 leading-none">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-700 font-semibold">
                    {c.position}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500 font-medium">
                    {c.date}
                  </td>

                  {/* Internal Rating Stars columns (UC-16 visual indication) */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-0.5">
                      {c.score > 0 ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${idx < c.score ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold italic">
                          Chưa đánh giá
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm ${c.statusStyle}`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            c.status === "Mới"
                              ? "#3b82f6"
                              : c.status === "Đang phỏng vấn"
                                ? "#f97316"
                                : c.status === "Đạt"
                                  ? "#10b981"
                                  : "#ef4444",
                        }}
                      />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="text-[11px] text-indigo-600 font-bold border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 px-3.5 py-1.5 rounded-sm transition-all cursor-pointer"
                      >
                        Đánh giá & Phản hồi
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[13px] text-slate-400">
            Hiển thị {filteredCandidates.length} ứng viên trong danh sách
          </p>
          <div className="flex items-center gap-1">
            <button className="h-8 px-3 text-[13px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors rounded-sm">
              Trước
            </button>
            <button className="w-8 h-8 text-[13px] border bg-indigo-600 text-white border-indigo-600 rounded-sm">
              1
            </button>
            <button className="h-8 px-3 text-[13px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors rounded-sm">
              Sau
            </button>
          </div>
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
