/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Chat.tsx — Trang Chat của Nhà Tuyển Dụng (Recruiter)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Cấu trúc 3 panel:
 *  [Trái]  Sidebar hội thoại    - danh sách ứng viên đang chat, có tìm kiếm
 *  [Giữa]  Khung chat           - tin nhắn realtime, gửi text/file
 *  [Phải]  Panel hồ sơ ứng tuyển - xem hồ sơ, feedback, đặt lịch PV, đánh giá
 *
 * Tích hợp:
 *  - Realtime Supabase: lắng nghe INSERT messages
 *  - ApplicationDetailPanel: quản lý trạng thái ứng tuyển, feedback, evaluation
 *  - CandidateCVModal: xem CV ứng viên
 *  - Đặt lịch phỏng vấn (scheduleInterview) + gửi mail tự động
 *  - Đánh giá nội bộ (createEvaluation) với thang điểm
 *
 * Flow chính:
 *  1. Load danh sách hội thoại → click chọn → load messages + load application panel
 *  2. Gửi tin nhắn → API → append vào local state (không dùng optimistic cho recruiter)
 *  3. Realtime: nhận tin nhắn mới từ candidate → re-fetch + mark read
 *  4. Panel phải: feedback → gửi mail (PV / từ chối), evaluation → lưu nội bộ
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Search,
  CheckCheck,
  Circle,
  Loader2,
  Paperclip,
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
  scheduleInterview,
  type RecruiterApplication,
} from "../../services/recruiter.service";
import { CandidateCVModal } from "../../components/cv/CandidateCVModal";
import {
  ApplicationDetailPanel,
  getFeedbackStatus,
  type FeedbackStatus,
  type NextApplicationStatus,
} from "../../components/recruiter/ApplicationDetailPanel";

/**
 * Decode tên file đính kèm bị lỗi encoding mojibake (tiếng Việt có dấu)
 */
const normalizeAttachmentName = (value: string | null) =>
  value ? decodeMojibakeInText(value) : value;

/**
 * Chuẩn hóa message: decode tên file đính kèm
 */
const normalizeMessage = (message: Message): Message => ({
  ...message,
  attachmentName: normalizeAttachmentName(message.attachmentName),
});

/**
 * Sắp xếp messages theo thời gian tăng dần, nếu cùng thời gian thì theo id tăng dần
 */
const sortMessagesByTime = <T extends Message>(items: T[]) =>
  [...items].sort((a, b) => {
    const timeDiff = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.id - b.id;
  });

/**
 * Chuẩn hóa danh sách messages: decode tên file + sắp xếp
 */
const normalizeMessages = (items: Message[]) =>
  sortMessagesByTime(items.map(normalizeMessage));

/**
 * ── Component Chat Recruiter chính ──
 *
 * State management được chia làm 2 nhóm:
 *  1. State chat: conversations, messages, inputMessage, loading, search
 *  2. State application panel: selectedApplication, feedback, evaluation, interview
 *
 * Sidebar phải (ApplicationDetailPanel) chỉ hiển thị khi isApplicationPanelOpen = true
 * Panel này cho phép recruiter:
 *  - Xem thông tin hồ sơ ứng tuyển
 *  - Chuyển đổi giữa các application của cùng ứng viên (dropdown)
 *  - Cập nhật trạng thái (reviewing / interview / rejected)
 *  - Gửi feedback / đặt lịch phỏng vấn (tự động gửi mail)
 *  - Đánh giá nội bộ (score + notes)
 *  - Xem CV (CandidateCVModal)
 */
export function RecruiterChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  /**
   * requestedConversationId: ID hội thoại từ URL param ?conversationId=
   * Dùng khi điều hướng từ trang candidates/overview/manage-candidates
   */
  const requestedConversationId = Number(searchParams.get("conversationId"));

  // ── State cho danh sách hội thoại ──
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // ID hội thoại đang được chọn
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  // Danh sách tin nhắn của hội thoại đang chọn
  const [messages, setMessages] = useState<Message[]>([]);
  // Nội dung tin nhắn đang soạn
  const [inputMessage, setInputMessage] = useState("");
  // Đang tải danh sách hội thoại
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  // Đang tải tin nhắn
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  // Đang upload file đính kèm
  const [isUploading, setIsUploading] = useState(false);
  // Từ khóa tìm kiếm hội thoại
  const [searchQuery, setSearchQuery] = useState("");

  // ── State cho panel hồ sơ ứng tuyển (sidebar phải) ──
  const [isApplicationPanelOpen, setIsApplicationPanelOpen] = useState(false);
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);
  // Application đang được chọn/xem
  const [selectedApplication, setSelectedApplication] =
    useState<RecruiterApplication | null>(null);
  // Danh sách applications liên quan (cùng candidate, cùng recruiter)
  const [relatedApplications, setRelatedApplications] = useState<
    RecruiterApplication[]
  >([]);
  const [applicationError, setApplicationError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  // Feedback content đang soạn
  const [feedback, setFeedback] = useState("");
  // Trạng thái feedback: "reviewing" | "interview" | "rejected"
  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>("interview");
  // Điểm đánh giá nội bộ (1-5)
  const [score, setScore] = useState(3);
  // Ghi chú đánh giá nội bộ
  const [notes, setNotes] = useState("");
  // Đang lưu dữ liệu (status, feedback, evaluation)
  const [isSavingApplication, setIsSavingApplication] = useState(false);
  // Application được chọn để xem CV (mở modal)
  const [previewApplication, setPreviewApplication] =
    useState<RecruiterApplication | null>(null);

  // Ref để auto-scroll xuống cuối khung chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hội thoại đang active (tìm từ danh sách conversations)
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  /**
   * Điền dữ liệu application vào form panel (feedback, status, score, notes)
   * Được gọi khi chọn application mới hoặc refresh dữ liệu
   */
  const hydrateApplicationForm = useCallback((application: RecruiterApplication) => {
    setSelectedApplication(application);
    setFeedback(application.feedbacks?.[0]?.content ?? "");
    setFeedbackStatus(getFeedbackStatus(application.status));
    setScore(application.evaluations?.[0]?.score ?? 3);
    setNotes(application.evaluations?.[0]?.notes ?? "");
  }, []);

  /**
   * Tải hồ sơ ứng tuyển cho hội thoại đang chọn
   * preferredApplicationId: truyền ID cụ thể (khi đổi application trong dropdown)
   * Nếu không có preferred → tự động tìm:
   *   1. conversation.application (application gốc của conversation)
   *   2. Application có cùng jobPostingId với conversation
   *   3. Application đầu tiên trong danh sách
   */
  const loadApplicationPanel = useCallback(
    async (preferredApplicationId?: number) => {
      if (!activeConversation) return;

      setIsLoadingApplication(true);
      setApplicationError("");
      setApplicationMessage("");

      try {
        // Lấy danh sách applications của ứng viên trong hội thoại này
        const applications = await chatService.getConversationApplications(
          activeConversation.id,
        );
        setRelatedApplications(applications);

        // Ưu tiên preferredApplicationId → conversation.application → cùng jobPostingId → đầu tiên
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

  /**
   * Tải danh sách các cuộc hội thoại của recruiter
   * Nếu có requestedConversationId từ URL param → tự động chọn hội thoại đó
   * selectFirst: nếu chưa có conversation nào được chọn, chọn cái đầu tiên
   */
  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      setIsLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);
      // Ưu tiên chọn hội thoại từ URL param (khi điều hướng từ candidates/overview)
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

  /**
   * Refresh dữ liệu application sau khi thao tác (feedback, status, evaluation)
   * Cập nhật: selectedApplication form + relatedApplications list + reload conversations
   */
  const refreshSelectedApplication = useCallback(
    async (applicationId: number) => {
      const response = await getApplicationDetail(applicationId);
      hydrateApplicationForm(response.data);
      setRelatedApplications((current) =>
        current.map((application) =>
          application.id === response.data.id ? response.data : application,
        ),
      );
      // Reload conversations để cập nhật dữ liệu mới nhất
      await loadConversations();
    },
    [hydrateApplicationForm, loadConversations],
  );

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  /**
   * Tải tin nhắn của cuộc hội thoại đang chọn
   * Sau khi tải, tự động đánh dấu đã đọc các tin nhắn chưa đọc từ candidate
   * và cập nhật lại sidebar (để cập nhật badge số chưa đọc)
   */
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

  // Load messages khi activeConversationId thay đổi
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  /**
   * Đăng ký Realtime tin nhắn từ Supabase
   * Lắng nghe sự kiện INSERT trên bảng messages (lọc theo conversation_id)
   * Bỏ qua tin nhắn do chính recruiter gửi (đã được append qua API REST response)
   * Khi nhận được tin nhắn mới từ candidate:
   *   1. Re-fetch messages để lấy signed URLs mới cho file đính kèm
   *   2. Đánh dấu đã đọc các tin nhắn mới
   *   3. Reload sidebar để cập nhật lastMessage
   * Cleanup: unsubscribe channel khi unmount hoặc đổi conversation
   */
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

          // Re-fetch tin nhắn để tự động cập nhật signed URLs cho file đính kèm
          try {
            const res = await chatService.getMessages(
              activeConversationId,
              1,
              100,
            );
            setMessages(normalizeMessages(res.items));

            // Đánh dấu đã đọc các tin nhắn mới từ candidate
            const unreadNewMsgs = res.items.filter(
              (m) => !m.isRead && m.senderId !== user?.id,
            );
            if (unreadNewMsgs.length > 0) {
              await Promise.all(
                unreadNewMsgs.map((m) => chatService.markMessageRead(m.id)),
              );
            }

            // Reload sidebar để cập nhật lastMessage + badge
            loadConversations();
          } catch (err) {
            console.error("Lỗi cập nhật tin nhắn realtime:", err);
          }
        },
      )
      .subscribe();

    // Cleanup: hủy đăng ký channel khi unmount hoặc đổi conversation
    return () => {
      client.removeChannel(channel);
    };
  }, [activeConversationId, loadConversations, user?.id]);

  // Cuộn xuống cuối tin nhắn mỗi khi messages thay đổi
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Reset panel application khi chuyển conversation:
   * - Xóa dữ liệu application cũ
   * - Nếu panel đang mở → tự động load application mới
   */
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

  /**
   * Gửi tin nhắn văn bản
   * (Recruiter KHÔNG dùng optimistic UI - đợi API thành công mới append)
   * Sau khi gửi thành công: append message vào local state + reload sidebar
   */
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
      // Cập nhật lại sidebar (lastMessage)
      loadConversations();
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
    }
  };

  /**
   * Gửi tệp đính kèm (hình ảnh / pdf / doc...)
   * Giới hạn: 20MB
   * Định dạng cho phép: jpg, jpeg, png, gif, webp, pdf, doc, docx
   * Upload qua FormData → API tạo message với attachmentUrl (signed URL)
   */
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
      // Reset input file để cho phép chọn lại file giống tên
      e.target.value = "";
    }
  };

  /**
   * Mở panel hồ sơ ứng tuyển bên phải
   * Tự động load application data của hội thoại đang chọn
   */
  const handleOpenApplicationPanel = () => {
    setIsApplicationPanelOpen(true);
    void loadApplicationPanel();
  };

  /**
   * Chọn application khác từ dropdown trong panel
   * Load lại dữ liệu application mới
   */
  const handleSelectApplication = (applicationId: number) => {
    void loadApplicationPanel(applicationId);
  };

  /**
   * Xử lý thay đổi trạng thái application từ panel
   * Các trạng thái: "reviewing" (đang xem xét) | "interview" (hẹn PV) | "rejected" (từ chối)
   * Sau khi cập nhật → refresh lại dữ liệu application
   */
  const handleChangeStatus = async (
    nextStatus: NextApplicationStatus,
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

  /**
   * Xử lý lưu feedback:
   *  - Nếu feedbackStatus === "interview" và có interviewData
   *    → Gọi scheduleInterview (tạo lịch PV + gửi mail)
   *  - Nếu không → Gọi createFeedback (gửi phản hồi text)
   * Sau đó refresh lại dữ liệu application
   */
  const handleSaveFeedback = async (interviewData?: {
    scheduledAt: string;
    type: "online" | "offline";
    location: string;
    notes?: string;
  }) => {
    if (!selectedApplication || !feedback.trim()) return;

    setIsSavingApplication(true);
    setApplicationError("");
    setApplicationMessage("");

    try {
      if (feedbackStatus === "interview" && interviewData) {
        // Mời phỏng vấn: tạo lịch + gửi mail cho ứng viên
        await scheduleInterview(selectedApplication.id, {
          content: feedback.trim(),
          ...interviewData,
        });
        setApplicationMessage("Đã đặt lịch phỏng vấn và gửi mail cho ứng viên.");
      } else {
        // Gửi phản hồi text (reviewing / rejected)
        await createFeedback(
          selectedApplication.id,
          feedback.trim(),
          feedbackStatus,
        );
        setApplicationMessage(
          feedbackStatus === "rejected"
            ? "Đã gửi phản hồi từ chối hồ sơ ứng viên."
            : "Đã gửi phản hồi cho ứng viên.",
        );
      }
      await refreshSelectedApplication(selectedApplication.id);
    } catch (err) {
      setApplicationError(
        err instanceof Error ? err.message : "Không gửi được phản hồi",
      );
    } finally {
      setIsSavingApplication(false);
    }
  };

  /**
   * Xử lý lưu đánh giá nội bộ (evaluation)
   * Thang điểm score (1-5) + ghi chú notes
   * Chỉ hiển thị nội bộ cho recruiter, không gửi cho ứng viên
   */
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

  /**
   * Format giờ gửi tin nhắn (HH:mm)
   */
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

  /**
   * Format dung lượng file: nếu < 1MB → KB, nếu >= 1MB → MB
   */
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  /**
   * Lọc danh sách hội thoại theo từ khóa tìm kiếm
   * Tìm kiếm theo: tên ứng viên (fullName) hoặc tên job (title)
   */
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
        {/**
         * ── Panel trái: Sidebar danh sách hội thoại ──
         * Hiển thị danh sách các ứng viên đang chat
         * Có ô tìm kiếm để lọc theo tên ứng viên / tên job
         * Mỗi item: avatar initials + tên + job title + tin nhắn cuối + badge chưa đọc
         */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Header sidebar: tiêu đề + ô tìm kiếm */}
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

          {/* Danh sách hội thoại: loading / empty / danh sách */}
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
                    className={`p-4 flex gap-3 cursor-pointer transition-all ${active
                      ? "bg-white dark:bg-slate-950 border-l-4 border-indigo-500 font-medium shadow-3xs"
                      : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                      }`}
                  >
                    {/* Avatar initials (2 ký tự đầu tên) + chấm xanh online */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-3xs">
                        {initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </div>

                    {/* Thông tin: tên, job, tin nhắn cuối */}
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

                    {/* Badge số tin nhắn chưa đọc */}
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

        {/**
         * ── Panel giữa: Khung Chat ──
         * Hiển thị header (avatar + tên + job + nút mở hồ sơ)
         * Timeline tin nhắn (bên trái/phải tùy sender)
         * Input để gửi tin nhắn + đính kèm file
         */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {activeConversation ? (
            <>
              {/* Header chat: avatar + tên ứng viên + job title + nút mở panel hồ sơ */}
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

                {/* Nút mở panel hồ sơ */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenApplicationPanel}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
                  >
                    <span className="hidden sm:inline">Xem hồ sơ ứng tuyển</span>
                  </button>
                </div>
              </div>

              {/* Messages timeline: loading / danh sách bubble + upload indicator + auto-scroll */}
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
                          {/* Bubble content */}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs font-medium shadow-3xs leading-relaxed ${isMe
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                              }`}
                          >
                            {/* File Rendering: ảnh → preview inline, file khác → icon + tên + nút tải xuống */}
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

                            {/* Time + icon đã đọc (check kép) cho tin nhắn của recruiter */}
                            <div
                              className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${isMe
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
                {/* Upload indicator */}
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

              {/* Chat Input: ô nhập text + nút đính kèm (Paperclip) + nút gửi (Send) */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3"
                >
                  <label
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    title="Đính kèm"
                    aria-label="Đính kèm"
                  >
                    <Paperclip className="h-5 w-5" />
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
            // Empty state khi chưa chọn hội thoại
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <Circle className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
              <p className="text-sm font-bold">
                Hãy chọn một cuộc hội thoại từ danh sách để bắt đầu trò chuyện
              </p>
            </div>
          )}
        </div>

        {/**
         * ── Panel phải: Hồ sơ ứng tuyển (ApplicationDetailPanel) ──
         * Cho phép recruiter:
         *  - Xem thông tin ứng tuyển của ứng viên
         *  - Chuyển đổi giữa các application (dropdown)
         *  - Cập nhật trạng thái (reviewing / interview / rejected)
         *  - Gửi feedback / đặt lịch phỏng vấn (gửi mail)
         *  - Đánh giá nội bộ (score + notes)
         *  - Xem CV (mở modal CandidateCVModal)
         */}
        {isApplicationPanelOpen && activeConversation ? (
          <ApplicationDetailPanel
            key={selectedApplication?.id}
            variant="sidebar"
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
            onSaveFeedback={(interviewData) => void handleSaveFeedback(interviewData)}
            onSaveEvaluation={() => void handleSaveEvaluation()}
            onViewCV={() => setPreviewApplication(selectedApplication)}
            candidateNameFallback={activeConversation.candidateProfile.fullName}
            jobTitleFallback={activeConversation.jobPosting?.title}
          />
        ) : null}
      </div>

      {/* Modal xem CV của ứng viên (CandidateCVModal) */}
      <CandidateCVModal
        isOpen={!!previewApplication}
        onClose={() => setPreviewApplication(null)}
        application={previewApplication}
      />
    </div>
  );
}
