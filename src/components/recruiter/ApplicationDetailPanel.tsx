import { useState } from 'react';
import {
  Eye,
  Calendar,
  AlertCircle,
  XCircle,
  Loader2,
  X,
  MessageSquare,
} from 'lucide-react';
import {
  type RecruiterApplication,
  type ApplicationStatus,
} from '../../services/recruiter.service';

/**
 * Component panel chi tiết đơn ứng tuyển
 * 
 * Có 2 variant:
 *   - "card": dạng thẻ ở trang ManageCandidates (bên cạnh bảng)
 *   - "sidebar": dạng sidebar ở trang Chat (panel phải)
 * 
 * Hiển thị thông tin ứng viên và cho phép recruiter thao tác:
 * - Đánh dấu đã đọc (pending -> reviewing)
 * - Đặt lịch phỏng vấn (reviewing -> interview)
 * - Từ chối hồ sơ (reviewing -> rejected)
 * - Đánh giá nội bộ (confirmed status)
 * - Xem CV
 */

// ==================== TYPE & CONSTANT DEFINITIONS ====================

/** Trạng thái phản hồi: phỏng vấn hoặc từ chối */
export type FeedbackStatus = 'interview' | 'rejected';

/** Các trạng thái kế tiếp mà recruiter có thể chuyển đến */
export type NextApplicationStatus = 'reviewing' | 'interview' | 'rejected';

/** Nhãn hiển thị cho từng trạng thái đơn ứng tuyển (tiếng Việt) */
export const statusLabel: Record<ApplicationStatus, string> = {
  pending: 'Chưa xem',
  reviewing: 'Đã xem',
  interview: 'Mời phỏng vấn',
  confirmed: 'Đã xác nhận',
  rejected: 'Không phù hợp',
  cancelled: 'Đã hủy',
};

/** Style CSS cho từng trạng thái (màu border/background/text, hỗ trợ dark mode) */
export const statusStyle: Record<ApplicationStatus, string> = {
  pending:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300',
  reviewing:
    'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300',
  interview:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300',
  confirmed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
  rejected:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300',
  cancelled:
    'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

/**
 * Xác định trạng thái phản hồi mặc định dựa trên trạng thái hiện tại
 * - Nếu đã rejected/interview/confirmed: lấy trạng thái tương ứng
 * - Nếu không: mặc định là "interview"
 */
export const getFeedbackStatus = (status: ApplicationStatus): FeedbackStatus => {
  if (status === 'rejected' || status === 'interview' || status === 'confirmed') {
    return status === 'confirmed' ? 'interview' : status;
  }
  return 'interview';
};

/**
 * Danh sách các trạng thái kế tiếp hợp lệ dựa trên trạng thái hiện tại
 * 
 * pending    -> [reviewing, interview]
 * reviewing  -> [interview, rejected]
 * interview  -> [rejected]
 * confirmed  -> [rejected]
 * rejected   -> [] (không thể chuyển tiếp)
 */
export const nextStatusOptions = (status: ApplicationStatus) => {
  if (status === 'pending') {
    return [
      { label: 'Đánh dấu đã xem', value: 'reviewing' as const },
      { label: 'Mời phỏng vấn', value: 'interview' as const },
    ];
  }
  if (status === 'reviewing') {
    return [
      { label: 'Mời phỏng vấn', value: 'interview' as const },
      { label: 'Từ chối', value: 'rejected' as const },
    ];
  }
  if (status === 'interview' || status === 'confirmed') {
    return [{ label: 'Từ chối', value: 'rejected' as const }];
  }
  return [];
};

// ==================== HELPER FUNCTIONS ====================

/** Format ngày tháng theo locale vi-VN */
const formatApplicationDate = (value?: string | null) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('vi-VN');
};

/** Lấy tên ứng viên (ưu tiên fullName > email > fallback) */
const getCandidateName = (application: RecruiterApplication) =>
  application.candidateProfile?.fullName ||
  application.candidateProfile?.user?.email ||
  'Ứng viên chưa cập nhật tên';

// ==================== PROPS TYPE ====================

export interface ApplicationDetailPanelProps {
  variant: 'sidebar' | 'card';
  selectedApplication: RecruiterApplication | null;
  relatedApplications?: RecruiterApplication[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  message: string;
  feedback: string;
  feedbackStatus: FeedbackStatus;
  score: number;
  notes: string;
  onClose?: () => void;
  onSelectApplication?: (applicationId: number) => void;
  onChangeStatus: (status: NextApplicationStatus) => void;
  onFeedbackChange: (value: string) => void;
  onFeedbackStatusChange: (value: FeedbackStatus) => void;
  onScoreChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onSaveFeedback: (interviewData?: {
    scheduledAt: string;
    type: 'online' | 'offline';
    location: string;
    notes?: string;
  }) => void;
  onSaveEvaluation: () => void;
  onViewCV: () => void;
  onOpenChat?: () => void;
  candidateNameFallback?: string;
  jobTitleFallback?: string;
}

// ==================== MAIN COMPONENT ====================

/**
 * Component panel chi tiết đơn ứng tuyển
 * 
 * Chức năng theo trạng thái:
 * - PENDING   : nút "Đánh dấu đã đọc" -> chuyển sang REVIEWING
 * - REVIEWING : 2 lựa chọn (Đặt lịch PV / Từ chối) kèm form tương ứng
 * - INTERVIEW : thông báo "đã gửi thư mời, chờ xác nhận"
 * - CONFIRMED : form đánh giá nội bộ (score 1-5 + notes)
 * - REJECTED  : thông báo "đã từ chối"
 * - CANCELLED : thông báo "đã hủy"
 */
export function ApplicationDetailPanel({
  variant,
  selectedApplication,
  relatedApplications = [],
  isLoading,
  isSaving,
  error,
  message,
  feedback,
  feedbackStatus,
  score,
  notes,
  onClose,
  onSelectApplication,
  onChangeStatus,
  onFeedbackChange,
  onFeedbackStatusChange,
  onScoreChange,
  onNotesChange,
  onSaveFeedback,
  onSaveEvaluation,
  onViewCV,
  onOpenChat,
  candidateNameFallback,
  jobTitleFallback,
}: ApplicationDetailPanelProps) {
  // Nếu là card variant và chưa chọn ứng viên -> hiển thị hướng dẫn
  if (variant === 'card' && !selectedApplication && !isLoading) {
    return (
      <div className="min-h-80 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="py-16 text-center text-[13px] text-slate-400 dark:text-slate-500">
          Chọn một ứng viên để xem chi tiết, phản hồi và đánh giá.
        </div>
      </div>
    );
  }

  const candidateName = selectedApplication
    ? getCandidateName(selectedApplication)
    : candidateNameFallback || 'Đang tải...';
  const jobTitle =
    selectedApplication?.jobPosting?.title ||
    jobTitleFallback ||
    'Tin ứng tuyển';
  const status = selectedApplication?.status;

  // State local cho form đặt lịch phỏng vấn
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState<'online' | 'offline'>('online');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [localError, setLocalError] = useState('');

  /**
   * Xử lý lưu feedback local:
   * - Nếu feedbackStatus === 'interview': validate form PV trước khi gửi
   * - Nếu feedbackStatus === 'rejected': gửi luôn
   */
  const handleSaveFeedbackLocal = () => {
    setLocalError('');

    if (feedbackStatus === 'interview') {
      // Validate thời gian PV
      if (!interviewTime.trim()) {
        setLocalError('Vui lòng chọn thời gian phỏng vấn');
        return;
      }
      // Validate địa điểm PV
      if (!interviewLocation.trim()) {
        setLocalError(
          interviewType === 'online'
            ? 'Vui lòng nhập link phỏng vấn'
            : 'Vui lòng nhập địa chỉ phỏng vấn',
        );
        return;
      }
      onSaveFeedback({
        scheduledAt: new Date(interviewTime).toISOString(),
        type: interviewType,
        location: interviewLocation.trim(),
        notes: interviewNotes.trim() || undefined,
      });
    } else {
      onSaveFeedback();
    }
  };

  /** Render nội dung chính của panel */
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-40 items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          Đang tải hồ sơ...
        </div>
      );
    }

    if (!selectedApplication) return null;

    return (
      <div className="space-y-5">
        {/* Error & Message banners */}
        {error && (
          <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}
        {localError && (
          <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {localError}
          </div>
        )}
        {message && (
          <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            {message}
          </div>
        )}

        {/* ─── THÔNG TIN ỨNG VIÊN ─── */}
        <section className="space-y-3">
          <div>
            {/* Tên ứng viên */}
            <h4
              className={`${
                variant === 'card' ? 'text-[18px]' : 'text-[16px]'
              } font-bold text-slate-900 dark:text-slate-50`}
            >
              {candidateName}
            </h4>
            {/* Số điện thoại */}
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
              {selectedApplication?.candidateProfile?.phone ||
                'Chưa có số điện thoại'}
            </p>
            {/* Email */}
            <p className="text-[12px] text-slate-450 dark:text-slate-500">
              {selectedApplication?.candidateProfile?.user?.email ||
                'Chưa có email'}
            </p>

            {/* Nút hành động: Xem CV + Nhắn tin */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedApplication?.cv && (
                <button
                  type="button"
                  onClick={onViewCV}
                  className={`inline-flex h-8 items-center gap-1.5 border border-slate-200 px-3 font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer rounded-sm ${
                    variant === 'card' ? 'text-[12px]' : 'text-[11px]'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Xem chi tiết CV
                </button>
              )}

              {variant === 'card' && onOpenChat && (
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="inline-flex h-8 items-center gap-2 border border-indigo-200 px-3 text-[12px] font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30 cursor-pointer rounded-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Nhắn tin
                </button>
              )}
            </div>
          </div>

          {/* Tin ứng tuyển */}
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tin ứng tuyển
            </p>
            <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {jobTitle}
            </p>
          </div>

          {/* Ngày ứng tuyển + Trạng thái */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Ngày ứng tuyển
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                {formatApplicationDate(selectedApplication?.appliedAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Trạng thái
              </p>
              {status ? (
                <span
                  className={`mt-1 inline-flex border px-2 py-1 text-[11px] font-bold ${statusStyle[status]}`}
                >
                  {statusLabel[status]}
                </span>
              ) : (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Chưa xác định
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ─── THƯ XIN VIỆC ─── */}
        <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Thư xin việc
          </p>
          <p className="mt-2 whitespace-pre-wrap border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {selectedApplication?.coverLetter?.trim() || 'Ứng viên không gửi thư xin việc.'}
          </p>
        </section>

        {/* ─── CHI TIẾT LỊCH PHỎNG VẤN (nếu đã gửi thư mời) ─── */}
        {(status === 'interview' || status === 'confirmed') &&
          selectedApplication?.interviews &&
          selectedApplication.interviews.length > 0 && (
            <section className="rounded-lg border border-indigo-100 bg-indigo-50/20 p-4 dark:border-indigo-950/40 dark:bg-indigo-950/10">
              <h3 className="mb-3 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                <Calendar className="h-4 w-4 text-indigo-650" />
                Chi tiết lịch phỏng vấn
              </h3>
              <div className="space-y-2 text-[13px] text-slate-600 dark:text-slate-300">
                {/* Thời gian */}
                <p className="flex justify-between">
                  <span className="font-semibold text-slate-400">Thời gian:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {new Date(
                      selectedApplication.interviews[0].scheduledAt,
                    ).toLocaleString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </p>
                {/* Hình thức */}
                <p className="flex justify-between">
                  <span className="font-semibold text-slate-400">Hình thức:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedApplication.interviews[0].type === 'online'
                      ? 'Online'
                      : 'Offline'}
                  </span>
                </p>
                {/* Địa điểm/Link */}
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-slate-400">
                    {selectedApplication.interviews[0].type === 'online'
                      ? 'Link phỏng vấn:'
                      : 'Địa điểm:'}
                  </span>
                  <span className="break-all font-medium text-slate-800 dark:text-slate-200">
                    {selectedApplication.interviews[0].type === 'online' ? (
                      <a
                        href={selectedApplication.interviews[0].location || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {selectedApplication.interviews[0].location}
                      </a>
                    ) : (
                      selectedApplication.interviews[0].location
                    )}
                  </span>
                </div>
                {/* Ghi chú */}
                {selectedApplication.interviews[0].notes && (
                  <div className="mt-2 flex flex-col gap-0.5 border-t border-slate-100/50 pt-2 dark:border-slate-800/50">
                    <span className="font-semibold text-slate-400">Ghi chú:</span>
                    <span className="italic text-slate-500 dark:text-slate-400">
                      {selectedApplication.interviews[0].notes}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

        {/* ─── GIAO DIỆN TƯƠNG TÁC THEO TRẠNG THÁI ─── */}

        {/* PENDING: Chỉ có nút "Đánh dấu đã đọc" */}
        {status === 'pending' && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onChangeStatus('reviewing')}
              disabled={isSaving}
              className="flex h-10 w-full cursor-pointer items-center justify-center rounded-sm bg-indigo-600 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              Đánh dấu đã đọc
            </button>
          </section>
        )}

        {/* REVIEWING: 2 lựa chọn - Đặt lịch PV hoặc Từ chối */}
        {status === 'reviewing' && (
          <section className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            {/* 2 nút lựa chọn */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowScheduleForm(!showScheduleForm);
                  setShowRejectForm(false);
                  onFeedbackStatusChange('interview');
                  if (!feedback) {
                    onFeedbackChange(
                      'Kính gửi ứng viên, chúng tôi rất ấn tượng với hồ sơ của bạn và muốn mời bạn tham gia buổi phỏng vấn trực tiếp trao đổi thêm về công việc.',
                    );
                  }
                }}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 border text-[12px] font-bold transition-all h-9 rounded-sm ${
                  showScheduleForm
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Đặt lịch phỏng vấn
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRejectForm(!showRejectForm);
                  setShowScheduleForm(false);
                  onFeedbackStatusChange('rejected');
                  if (!feedback) {
                    onFeedbackChange(
                      'Kính gửi ứng viên, rất tiếc hồ sơ của bạn chưa phù hợp với yêu cầu hiện tại của vị trí này. Cảm ơn bạn đã quan tâm đến công ty.',
                    );
                  }
                }}
                className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 border px-4 text-[12px] font-bold transition-all rounded-sm ${
                  showRejectForm
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
                    : 'border-slate-200 bg-white text-red-600 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-950/20'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Từ chối
              </button>
            </div>

            {/* Form đặt lịch phỏng vấn */}
            {showScheduleForm && (
              <div className="animate-fade-in space-y-3 rounded-md border border-indigo-100 bg-indigo-50/20 p-4 dark:border-indigo-950/40 dark:bg-indigo-950/10">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Thông tin lịch hẹn phỏng vấn
                </h3>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Thư mời phỏng vấn
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    rows={3}
                    placeholder="Nhập thư mời gửi cho ứng viên..."
                    className="w-full border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
                    className="h-9 w-full border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Hình thức
                  </label>
                  <div className="mt-1 flex gap-4">
                    <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="interviewType"
                        value="online"
                        checked={interviewType === 'online'}
                        onChange={() => setInterviewType('online')}
                        className="accent-indigo-600"
                      />
                      Online
                    </label>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="interviewType"
                        value="offline"
                        checked={interviewType === 'offline'}
                        onChange={() => setInterviewType('offline')}
                        className="accent-indigo-600"
                      />
                      Offline
                    </label>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {interviewType === 'online' ? 'Link phỏng vấn' : 'Địa chỉ'}
                  </label>
                  <input
                    type={interviewType === 'online' ? 'url' : 'text'}
                    value={interviewLocation}
                    onChange={(e) => setInterviewLocation(e.target.value)}
                    placeholder={
                      interviewType === 'online'
                        ? 'Link Google Meet / Zoom...'
                        : 'Địa chỉ phỏng vấn...'
                    }
                    className="h-9 w-full border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
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
                    className="w-full border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-955 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveFeedbackLocal}
                  disabled={
                    isSaving ||
                    !feedback.trim() ||
                    !interviewTime.trim() ||
                    !interviewLocation.trim()
                  }
                  className="flex h-9 w-full cursor-pointer items-center justify-center rounded-sm bg-indigo-600 text-[12px] font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  Đặt lịch phỏng vấn & Gửi mail
                </button>
              </div>
            )}

            {/* Form từ chối ứng viên */}
            {showRejectForm && (
              <div className="animate-fade-in space-y-3 rounded-md border border-red-100 bg-red-50/20 p-4 dark:border-red-950/40 dark:bg-red-950/10">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-red-900 dark:text-red-350">
                  Từ chối hồ sơ ứng viên
                </h3>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Lý do từ chối / Phản hồi
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => onFeedbackChange(e.target.value)}
                    rows={4}
                    placeholder="Nhập lý do gửi phản hồi cho ứng viên..."
                    className="w-full border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-955 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveFeedbackLocal}
                  disabled={isSaving || !feedback.trim()}
                  className="flex h-9 w-full cursor-pointer items-center justify-center rounded-sm bg-red-600 text-[12px] font-bold text-white transition-all hover:bg-red-750 disabled:opacity-50"
                >
                  Xác nhận từ chối & Gửi mail
                </button>
              </div>
            )}
          </section>
        )}

        {/* INTERVIEW: Đã gửi thư mời, chờ ứng viên xác nhận */}
        {status === 'interview' && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-[12px] text-amber-800 dark:border-amber-950/40 dark:bg-amber-950/25 dark:text-amber-400">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <span>
                Đã gửi thư mời. Đang chờ ứng viên xác nhận tham gia phỏng vấn qua email.
              </span>
            </div>
          </section>
        )}

        {/* CONFIRMED: Ứng viên đã xác nhận -> cho phép đánh giá nội bộ */}
        {status === 'confirmed' && (
          <section className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Đánh giá nội bộ
              </label>
              {/* Chọn điểm (1-5 sao) */}
              <select
                value={score}
                onChange={(e) => onScoreChange(Number(e.target.value))}
                className="mb-2 h-9 w-full border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-955 dark:text-slate-100"
              >
                {[1, 2, 3, 4, 5].map((item) => (
                  <option key={item} value={item}>
                    {item} sao
                  </option>
                ))}
              </select>
              {/* Ghi chú đánh giá */}
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={4}
                placeholder="Ghi chú nhận xét đánh giá nội bộ..."
                className="w-full border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={onSaveEvaluation}
                disabled={isSaving || !selectedApplication}
                className="mt-2 flex h-8 cursor-pointer items-center justify-center rounded-sm border border-slate-350 bg-slate-900 px-4 text-[11px] font-semibold text-white transition-all hover:bg-slate-800"
              >
                Lưu đánh giá
              </button>
            </div>
          </section>
        )}

        {/* REJECTED: Thông báo đã từ chối */}
        {status === 'rejected' && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-2 rounded-lg border border-red-150 bg-red-50/50 p-3 text-[12px] text-red-800 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400">
              <XCircle className="h-5 w-5 shrink-0 text-red-500" />
              <span>Hồ sơ ứng viên đã bị từ chối.</span>
            </div>
          </section>
        )}

        {/* CANCELLED: Buổi phỏng vấn đã bị hủy */}
        {status === 'cancelled' && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <AlertCircle className="h-5 w-5 shrink-0 text-slate-450" />
              <span>Buổi phỏng vấn đã bị hủy hoặc ứng viên từ chối phỏng vấn.</span>
            </div>
          </section>
        )}

        {/* Danh sách các tin ứng tuyển khác của cùng ứng viên (chỉ ở variant sidebar) */}
        {variant === 'sidebar' && relatedApplications.length > 1 && (
          <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Các tin ứng tuyển của ứng viên này tại công ty bạn
            </p>
            <div className="mt-2 space-y-2">
              {relatedApplications.map((application) => (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => onSelectApplication?.(application.id)}
                  className={`w-full border px-3 py-2 text-left transition-colors ${
                    selectedApplication?.id === application.id
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30'
                      : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {application.jobPosting?.title || 'Tin tuyển dụng'}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Trạng thái: {statusLabel[application.status]}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  // Render theo variant
  if (variant === 'sidebar') {
    return (
      <aside className="w-96 max-w-[42vw] min-w-80 shrink-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Header sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
              Hồ sơ ứng tuyển
            </h3>
            <p className="mt-1 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {candidateName}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Đóng hồ sơ ứng tuyển"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nội dung cuộn */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-5">
          {renderContent()}
        </div>
      </aside>
    );
  }

  // variant === 'card': card trong ManageCandidates
  return (
    <div className="min-h-80 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
      {renderContent()}
    </div>
  );
}
