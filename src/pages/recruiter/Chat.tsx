import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Search,
  CheckCheck,
  Smile,
  Info,
  Circle,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import {
  chatService,
  type Conversation,
  type Message,
} from "../../services/chat.service";
import { supabase } from "../../utils/supabase";
import { decodeMojibakeInText } from "../../utils/encoding";
import {
  createEvaluation,
  createFeedback,
  getApplicationDetail,
  updateApplicationStatus,
  type ApplicationStatus,
  type RecruiterApplication,
} from "../../services/recruiter.service";

type FeedbackStatus = "interview" | "accepted" | "rejected";

const statusLabel: Record<ApplicationStatus, string> = {
  pending: "Chờ xử lý",
  reviewing: "Đã xem",
  interview: "Mời phỏng vấn",
  accepted: "Phù hợp",
  rejected: "Không phù hợp",
  cancelled: "Đã hủy",
};

const statusStyle: Record<ApplicationStatus, string> = {
  pending: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
  reviewing: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-300",
  interview: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  rejected: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
  cancelled: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300",
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

const formatApplicationDate = (value?: string | null) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("vi-VN");
};

const normalizeAttachmentName = (value: string | null) =>
  value ? decodeMojibakeInText(value) : value;

const normalizeMessage = (message: Message): Message => ({
  ...message,
  attachmentName: normalizeAttachmentName(message.attachmentName),
});

const sortMessagesByTime = <T extends Message>(items: T[]) =>
  [...items].sort((a, b) => {
    const timeDiff = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.id - b.id;
  });

const normalizeMessages = (items: Message[]) =>
  sortMessagesByTime(items.map(normalizeMessage));

const getCandidateName = (application: RecruiterApplication) =>
  application.candidateProfile?.fullName ||
  application.candidateProfile?.user?.email ||
  "Ứng viên chưa cập nhật tên";

type NextApplicationStatus = "reviewing" | "interview" | "accepted" | "rejected";

function ApplicationPanel({
  conversation,
  selectedApplication,
  relatedApplications,
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
}: {
  conversation: Conversation;
  selectedApplication: RecruiterApplication | null;
  relatedApplications: RecruiterApplication[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  message: string;
  feedback: string;
  feedbackStatus: FeedbackStatus;
  score: number;
  notes: string;
  onClose: () => void;
  onSelectApplication: (applicationId: number) => void;
  onChangeStatus: (status: NextApplicationStatus) => void;
  onFeedbackChange: (value: string) => void;
  onFeedbackStatusChange: (value: FeedbackStatus) => void;
  onScoreChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  onSaveFeedback: () => void;
  onSaveEvaluation: () => void;
}) {
  const candidateName = selectedApplication
    ? getCandidateName(selectedApplication)
    : conversation.candidateProfile.fullName;
  const jobTitle =
    selectedApplication?.jobPosting?.title ||
    conversation.jobPosting?.title ||
    "Tin ứng tuyển";
  const cvTitle = selectedApplication?.cv?.title || "Chưa có CV";
  const cvUrl = selectedApplication?.cv?.pdfUrl;
  const status = selectedApplication?.status;
  const transitions = status ? nextStatusOptions(status) : [];

  return (
    <aside className="w-96 max-w-[42vw] min-w-80 shrink-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            Hồ sơ ứng tuyển
          </h3>
          <p className="mt-1 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {candidateName}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Đóng hồ sơ ứng tuyển"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[calc(100%-4rem)] overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            Đang tải hồ sơ...
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}
            {message && (
              <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                {message}
              </div>
            )}

            <section className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Ứng viên
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {candidateName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Tin ứng tuyển
                </p>
                <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {jobTitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                      className={`mt-1 inline-flex border px-2 py-1 text-[11px] font-bold ${
                        statusStyle[status]
                      }`}
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

            <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                CV đã gửi
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {cvTitle}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    {selectedApplication?.cv?.cvType || "Không rõ loại CV"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {cvUrl ? (
                    <>
                      <a
                        href={cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Xem CV
                      </a>
                      <a
                        href={cvUrl}
                        download={cvTitle}
                        className="inline-flex h-8 items-center gap-1.5 border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Tải CV
                      </a>
                    </>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      Chưa có file
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Cover letter
              </p>
              <p className="mt-2 whitespace-pre-wrap border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                {selectedApplication?.coverLetter?.trim() ||
                  "Ứng viên không gửi cover letter."}
              </p>
            </section>

            <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Chuyển trạng thái
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {transitions.length === 0 ? (
                  <span className="text-xs font-medium text-slate-400">
                    Không còn bước chuyển hợp lệ.
                  </span>
                ) : (
                  transitions.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onChangeStatus(item.value)}
                      disabled={isSaving}
                      className="h-8 bg-slate-900 px-3 text-[11px] font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      {item.label}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Phản hồi ứng viên
              </p>
              <select
                value={feedbackStatus}
                onChange={(event) =>
                  onFeedbackStatusChange(event.target.value as FeedbackStatus)
                }
                className="mt-2 h-9 w-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="interview">Mời phỏng vấn</option>
                <option value="accepted">Phù hợp</option>
                <option value="rejected">Không phù hợp</option>
              </select>
              <textarea
                value={feedback}
                onChange={(event) => onFeedbackChange(event.target.value)}
                rows={4}
                placeholder="Nhập phản hồi gửi cho ứng viên..."
                className="mt-2 w-full border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={onSaveFeedback}
                disabled={!feedback.trim() || isSaving || !selectedApplication}
                className="mt-2 h-8 border border-indigo-200 px-3 text-[11px] font-bold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
              >
                Phản hồi ứng viên
              </button>
            </section>

            <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Đánh giá ứng viên
              </p>
              <select
                value={score}
                onChange={(event) => onScoreChange(Number(event.target.value))}
                className="mt-2 h-9 w-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {[1, 2, 3, 4, 5].map((item) => (
                  <option key={item} value={item}>
                    {item} sao
                  </option>
                ))}
              </select>
              <textarea
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
                rows={3}
                placeholder="Ghi chú nội bộ về ứng viên..."
                className="mt-2 w-full border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={onSaveEvaluation}
                disabled={isSaving || !selectedApplication}
                className="mt-2 h-8 border border-slate-300 px-3 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Đánh giá ứng viên
              </button>
            </section>

            {relatedApplications.length > 1 && (
              <section className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Các tin ứng tuyển của ứng viên này tại công ty bạn
                </p>
                <div className="mt-2 space-y-2">
                  {relatedApplications.map((application) => (
                    <button
                      key={application.id}
                      type="button"
                      onClick={() => onSelectApplication(application.id)}
                      className={`w-full border px-3 py-2 text-left transition-colors ${
                        selectedApplication?.id === application.id
                          ? "border-indigo-300 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                      }`}
                    >
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {application.jobPosting?.title || "Tin tuyển dụng"}
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
        )}
      </div>
    </aside>
  );
}

export function RecruiterChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedConversationId = Number(searchParams.get("conversationId"));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isApplicationPanelOpen, setIsApplicationPanelOpen] = useState(false);
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplication | null>(null);
  const [relatedApplications, setRelatedApplications] = useState<
    RecruiterApplication[]
  >([]);
  const [applicationError, setApplicationError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>("interview");
  const [score, setScore] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSavingApplication, setIsSavingApplication] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const hydrateApplicationForm = useCallback((application: RecruiterApplication) => {
    setSelectedApplication(application);
    setFeedback(application.feedbacks?.[0]?.content ?? "");
    setFeedbackStatus(getFeedbackStatus(application.status));
    setScore(application.evaluations?.[0]?.score ?? 3);
    setNotes(application.evaluations?.[0]?.notes ?? "");
  }, []);

  const loadApplicationPanel = useCallback(
    async (preferredApplicationId?: number) => {
      if (!activeConversation) return;

      setIsLoadingApplication(true);
      setApplicationError("");
      setApplicationMessage("");

      try {
        const applications = await chatService.getConversationApplications(
          activeConversation.id,
        );
        setRelatedApplications(applications);

        const currentApplicationId =
          preferredApplicationId ??
          activeConversation.application?.id ??
          applications.find(
            (application) =>
              application.jobPostingId === activeConversation.jobPostingId,
          )?.id ??
          applications[0]?.id;

        if (!currentApplicationId) {
          setSelectedApplication(null);
          setApplicationError("Không tìm thấy hồ sơ ứng tuyển cho cuộc trò chuyện này.");
          return;
        }

        const response = await getApplicationDetail(currentApplicationId);
        hydrateApplicationForm(response.data);
      } catch (err) {
        setSelectedApplication(null);
        setRelatedApplications([]);
        setApplicationError(
          err instanceof Error
            ? err.message
            : "Không tải được hồ sơ ứng tuyển",
        );
      } finally {
        setIsLoadingApplication(false);
      }
    },
    [activeConversation, hydrateApplicationForm],
  );

  // 1. Tải danh sách các cuộc hội thoại
  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      setIsLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);
      const requestedConversation = data.find(
        (conversation) => conversation.id === requestedConversationId,
      );
      if (requestedConversation) {
        setActiveConversationId(requestedConversation.id);
        return;
      }

      if (selectFirst && data.length > 0) {
        setActiveConversationId((current) => current ?? data[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách hội thoại:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [requestedConversationId]);

  const refreshSelectedApplication = useCallback(
    async (applicationId: number) => {
      const response = await getApplicationDetail(applicationId);
      hydrateApplicationForm(response.data);
      setRelatedApplications((current) =>
        current.map((application) =>
          application.id === response.data.id ? response.data : application,
        ),
      );
      await loadConversations();
    },
    [hydrateApplicationForm, loadConversations],
  );

  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // 2. Tải tin nhắn của cuộc hội thoại đang chọn
  const loadMessages = useCallback(
    async (conversationId: number) => {
      try {
        setIsLoadingMessages(true);
        const res = await chatService.getMessages(conversationId, 1, 100);
        setMessages(normalizeMessages(res.items));

        // Đánh dấu đã đọc cho các tin nhắn chưa đọc từ candidate gửi
        const unreadMsgs = res.items.filter(
          (m) => !m.isRead && m.senderId !== user?.id,
        );
        if (unreadMsgs.length > 0) {
          await Promise.all(
            unreadMsgs.map((m) => chatService.markMessageRead(m.id)),
          );
          // Cập nhật lại số chưa đọc ở sidebar
          loadConversations();
        }
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [loadConversations, user?.id],
  );

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  // 3. Đăng ký Realtime tin nhắn từ Supabase
  useEffect(() => {
    const client = supabase;
    if (!activeConversationId || !client) return;

    const channel = client
      .channel(`conversation-${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as { sender_id?: number };

          // Tránh duplicate tin nhắn do mình gửi (đã được add qua API REST)
          if (newMsg.sender_id === user?.id) return;

          // Re-fetch tin nhắn để tự động cập nhật cả signed URLs cho file đính kèm
          try {
            const res = await chatService.getMessages(
              activeConversationId,
              1,
              100,
            );
            setMessages(normalizeMessages(res.items));

            // Đánh dấu đã đọc các tin nhắn mới
            const unreadNewMsgs = res.items.filter(
              (m) => !m.isRead && m.senderId !== user?.id,
            );
            if (unreadNewMsgs.length > 0) {
              await Promise.all(
                unreadNewMsgs.map((m) => chatService.markMessageRead(m.id)),
              );
            }

            // Reload sidebar để cập nhật lastMessage
            loadConversations();
          } catch (err) {
            console.error("Lỗi cập nhật tin nhắn realtime:", err);
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [activeConversationId, loadConversations, user?.id]);

  // Cuộn xuống cuối tin nhắn
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setSelectedApplication(null);
    setRelatedApplications([]);
    setApplicationError("");
    setApplicationMessage("");

    if (isApplicationPanelOpen && activeConversation) {
      void loadApplicationPanel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // Gửi tin nhắn văn bản
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversationId) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");

    try {
      const sentMsg = await chatService.sendMessage(
        activeConversationId,
        textToSend,
      );
      // Append tin nhắn mới gửi thành công
      setMessages((prev) =>
        sortMessagesByTime([...prev, normalizeMessage(sentMsg)]),
      );
      // Cập nhật lại sidebar
      loadConversations();
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
    }
  };

  // Gửi tệp đính kèm
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    // Giới hạn kích thước file 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Kích thước tệp đính kèm không được vượt quá 20MB");
      return;
    }

    try {
      setIsUploading(true);
      const sentMsg = await chatService.uploadAttachment(
        activeConversationId,
        file,
      );
      setMessages((prev) =>
        sortMessagesByTime([...prev, normalizeMessage(sentMsg)]),
      );
      loadConversations();
    } catch (err) {
      console.error("Lỗi khi tải lên tệp đính kèm:", err);
      alert(
        "Tải lên file thất bại. Vui lòng kiểm tra lại định dạng file cho phép.",
      );
    } finally {
      setIsUploading(false);
      // Reset input file
      e.target.value = "";
    }
  };

  const handleOpenApplicationPanel = () => {
    setIsApplicationPanelOpen(true);
    void loadApplicationPanel();
  };

  const handleSelectApplication = (applicationId: number) => {
    void loadApplicationPanel(applicationId);
  };

  const handleChangeStatus = async (
    nextStatus: "reviewing" | "interview" | "accepted" | "rejected",
  ) => {
    if (!selectedApplication) return;

    setIsSavingApplication(true);
    setApplicationError("");
    setApplicationMessage("");

    try {
      await updateApplicationStatus(selectedApplication.id, nextStatus);
      await refreshSelectedApplication(selectedApplication.id);
      setApplicationMessage("Đã cập nhật trạng thái hồ sơ.");
    } catch (err) {
      setApplicationError(
        err instanceof Error ? err.message : "Không cập nhật được trạng thái",
      );
    } finally {
      setIsSavingApplication(false);
    }
  };

  const handleSaveFeedback = async () => {
    if (!selectedApplication || !feedback.trim()) return;

    setIsSavingApplication(true);
    setApplicationError("");
    setApplicationMessage("");

    try {
      await createFeedback(
        selectedApplication.id,
        feedback.trim(),
        feedbackStatus,
      );
      await refreshSelectedApplication(selectedApplication.id);
      setApplicationMessage("Đã gửi phản hồi cho ứng viên.");
    } catch (err) {
      setApplicationError(
        err instanceof Error ? err.message : "Không gửi được phản hồi",
      );
    } finally {
      setIsSavingApplication(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedApplication) return;

    setIsSavingApplication(true);
    setApplicationError("");
    setApplicationMessage("");

    try {
      await createEvaluation(selectedApplication.id, score, notes);
      await refreshSelectedApplication(selectedApplication.id);
      setApplicationMessage("Đã lưu đánh giá nội bộ.");
    } catch (err) {
      setApplicationError(
        err instanceof Error ? err.message : "Không lưu được đánh giá",
      );
    } finally {
      setIsSavingApplication(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.candidateProfile.fullName.toLowerCase().includes(query) ||
      c.jobPosting?.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-3xs transition-colors duration-150">
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* ── 1. Sidebar Trò chuyện ── */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              Trò chuyện tuyển dụng
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Tìm ứng viên, tin tuyển dụng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                Đang tải danh sách...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có ứng viên nào liên hệ trò chuyện.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const active = c.id === activeConversationId;
                const initials = c.candidateProfile.fullName
                  .substring(0, 2)
                  .toUpperCase();
                const unreadCount = c._count?.messages || 0;
                const lastMsgObj = c.messages[0];
                let lastMsgText = "Chưa có tin nhắn";
                if (lastMsgObj) {
                  lastMsgText =
                    lastMsgObj.messageType === "file"
                      ? `File: ${normalizeAttachmentName(lastMsgObj.attachmentName) || "Tệp đính kèm"}`
                      : lastMsgObj.content || "";
                }

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={`p-4 flex gap-3 cursor-pointer transition-all ${
                      active
                        ? "bg-white dark:bg-slate-950 border-l-4 border-indigo-500 font-medium shadow-3xs"
                        : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-3xs">
                        {initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {c.candidateProfile.fullName}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                          {c.updatedAt
                            ? new Date(c.updatedAt).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </div>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate uppercase mt-0.5">
                        {c.jobPosting?.title || "Mẫu tin tuyển dụng"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 leading-snug">
                        {lastMsgText}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <div className="shrink-0 flex items-center">
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full border-none">
                          {unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── 2. Khu vực khung Chat ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 shadow-3xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-3xs">
                    {activeConversation.candidateProfile.fullName
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {activeConversation.candidateProfile.fullName}
                      </h3>
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500">
                        <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
                        Đang online
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-none">
                      Ứng tuyển:{" "}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {activeConversation.jobPosting?.title}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenApplicationPanel}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
                  >
                    <span className="hidden sm:inline">Xem hồ sơ ứng tuyển</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenApplicationPanel}
                    title="Xem hồ sơ ứng tuyển"
                    aria-label="Xem hồ sơ ứng tuyển"
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages timeline */}
              <div className="grow overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
                {isLoadingMessages ? (
                  <div className="h-full flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const isFile = msg.messageType === "file";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs font-medium shadow-3xs leading-relaxed ${
                              isMe
                                ? "bg-indigo-600 text-white rounded-br-none"
                                : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                            }`}
                          >
                            {/* File Rendering */}
                            {isFile ? (
                              <div className="space-y-2">
                                {msg.attachmentMime?.startsWith("image/") ? (
                                  <a
                                    href={msg.attachmentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <img
                                      src={msg.attachmentUrl}
                                      alt={msg.attachmentName || "Ảnh"}
                                      className="max-w-50 max-h-37.5 rounded-lg border object-contain cursor-zoom-in bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200/50">
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className="font-bold truncate text-[11px]"
                                        title={msg.attachmentName || ""}
                                      >
                                        {msg.attachmentName}
                                      </p>
                                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                        {formatFileSize(msg.attachmentSize)}
                                      </p>
                                    </div>
                                    {msg.attachmentUrl && (
                                      <a
                                        href={msg.attachmentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={msg.attachmentName || ""}
                                        className="h-7 px-2 inline-flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-500 rounded-md transition-colors shrink-0"
                                      >
                                        Tải xuống
                                      </a>
                                    )}
                                  </div>
                                )}
                                {msg.content && (
                                  <p className="mt-1.5">{msg.content}</p>
                                )}
                              </div>
                            ) : (
                              <p>{msg.content}</p>
                            )}

                            <div
                              className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                                isMe
                                  ? "text-indigo-200"
                                  : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              <span>{formatMessageTime(msg.sentAt)}</span>
                              {isMe && (
                                <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {isUploading && (
                  <div className="flex justify-end animate-fade-in">
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl px-4 py-2.5 shadow-3xs">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        Đang tải lên tệp đính kèm...
                      </span>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3"
                >
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    title="Biểu cảm"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <label className="h-9 px-3 inline-flex items-center text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    Đính kèm
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    />
                  </label>

                  <Input
                    type="text"
                    placeholder={`Nhập nội dung trao đổi với ứng viên ${activeConversation.candidateProfile.fullName}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="grow h-11 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                  />
                  <Button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-[0.96] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-3xs cursor-pointer p-0 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <Circle className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
              <p className="text-sm font-bold">
                Hãy chọn một cuộc hội thoại từ danh sách để bắt đầu trò chuyện
              </p>
            </div>
          )}
        </div>

        {isApplicationPanelOpen && activeConversation ? (
          <ApplicationPanel
            conversation={activeConversation}
            selectedApplication={selectedApplication}
            relatedApplications={relatedApplications}
            isLoading={isLoadingApplication}
            isSaving={isSavingApplication}
            error={applicationError}
            message={applicationMessage}
            feedback={feedback}
            feedbackStatus={feedbackStatus}
            score={score}
            notes={notes}
            onClose={() => setIsApplicationPanelOpen(false)}
            onSelectApplication={handleSelectApplication}
            onChangeStatus={(status) => void handleChangeStatus(status)}
            onFeedbackChange={setFeedback}
            onFeedbackStatusChange={setFeedbackStatus}
            onScoreChange={setScore}
            onNotesChange={setNotes}
            onSaveFeedback={() => void handleSaveFeedback()}
            onSaveEvaluation={() => void handleSaveEvaluation()}
          />
        ) : null}
      </div>
    </div>
  );
}
