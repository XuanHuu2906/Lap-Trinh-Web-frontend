/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Chat.tsx — Trang Chat của Ứng Viên (Candidate)
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Chức năng:
 *  - Hiển thị danh sách hội thoại (sidebar trái) với tìm kiếm
 *  - Khung chat realtime (giữa): gửi tin nhắn văn bản, đính kèm file (hình ảnh/pdf/doc...)
 *  - Đánh dấu đã đọc, hiển thị trạng thái gửi (sending/error/delivered/read)
 *  - Lắng nghe sự kiện INSERT/UPDATE từ Supabase Realtime để cập nhật tin nhắn tức thì
 *  - Hỗ trợ optimistic UI: tin nhắn hiện lên ngay trước khi server xác nhận
 *  - Nhấn vào link "Xem tin tuyển dụng" để mở chi tiết job
 *  - URL param ?conversationId=xxx để điều hướng từ trang khác (Applied Jobs, Job Detail)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CheckCheck,
  Circle,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Paperclip,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../../contexts/AuthContext";
import {
  chatService,
  type Conversation,
  type Message,
} from "../../services/chat.service";
import { supabase } from "../../utils/supabase";
import { decodeMojibakeInText } from "../../utils/encoding";
import { Link, useSearchParams } from "react-router-dom";

/** Giới hạn kích thước file đính kèm: 20MB */
const maxAttachmentSize = 20 * 1024 * 1024;

/**
 * Mở rộng kiểu Message để thêm trạng thái gửi tạm thời ở local:
 *  - "sending": đang gửi lên server (optimistic)
 *  - "error": gửi thất bại, cho phép click để gửi lại
 *  - undefined: đã gửi thành công (trạng thái bình thường)
 */
type ChatMessage = Message & {
  deliveryStatus?: "sending" | "error";
};

/**
 * Decode tên file đính kèm bị lỗi encoding mojibake (tiếng Việt)
 * Khi upload file có dấu, multer có thể encode sai → cần decode lại
 */
const normalizeAttachmentName = (value: string | null) =>
  value ? decodeMojibakeInText(value) : value;

/**
 * Chuẩn hóa một message: decode tên file đính kèm
 */
const normalizeMessage = <T extends Message>(message: T): T =>
  ({
    ...message,
    attachmentName: normalizeAttachmentName(message.attachmentName),
  }) as T;

/**
 * Sắp xếp danh sách messages theo thời gian tăng dần
 * Nếu cùng thời gian thì sắp xếp theo id tăng dần
 */
const sortMessagesByTime = <T extends Message>(items: T[]) =>
  [...items].sort((a, b) => {
    const timeDiff = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.id - b.id;
  });

/**
 * Chuẩn hóa toàn bộ danh sách messages: decode tên file + sắp xếp theo thời gian
 */
const normalizeMessages = <T extends Message>(items: T[]) =>
  sortMessagesByTime(items.map(normalizeMessage));

/**
 * Danh sách các từ viết tắt phổ biến trong tên job title
 * Khi format job title, các từ này sẽ được giữ nguyên viết hoa
 */
const titleAcronyms = new Set([
  "AI",
  "API",
  "BA",
  "CEO",
  "CFO",
  "CTO",
  "HR",
  "IT",
  "QA",
  "QC",
  "SQL",
  "UI",
  "UX",
]);

/**
 * Lấy tên hiển thị của cuộc hội thoại (tên người liên hệ hoặc tên công ty)
 */
function getConversationName(conversation: Conversation) {
  return (
    conversation.recruiterProfile.contactName ||
    conversation.recruiterProfile.companyName
  );
}

/**
 * Lấy 2 ký tự đầu của tên công ty, viết hoa → dùng làm avatar mặc định
 */
function getConversationInitials(conversation: Conversation) {
  return conversation.recruiterProfile.companyName.substring(0, 2).toUpperCase();
}

/**
 * Lấy nội dung tin nhắn cuối cùng để hiển thị trong sidebar
 * - Nếu chưa có tin nhắn → "Chưa có tin nhắn"
 * - Nếu là file → "File: <tên file>"
 * - Nếu là text → hiển thị nội dung
 */
function getLastMessageText(conversation: Conversation) {
  const lastMessage = conversation.messages[0];

  if (!lastMessage) return "Chưa có tin nhắn";

  if (lastMessage.messageType === "file") {
    return `File: ${normalizeAttachmentName(lastMessage.attachmentName) || "Tệp đính kèm"}`;
  }

  return lastMessage.content || "";
}

/**
 * Format job title: capitalize từng từ nhưng giữ nguyên viết hoa cho từ viết tắt
 * Nếu title đã viết hoa toàn bộ → tự động chuyển về dạng capitalize thông minh
 * Nếu title không viết hoa → giữ nguyên
 */
function formatJobTitle(title?: string | null) {
  const normalized = title?.trim().replace(/\s+/g, " ");
  if (!normalized) return "Tin tuyển dụng";
  if (normalized !== normalized.toUpperCase()) return normalized;

  return normalized
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const uppercaseWord = word.toUpperCase();
      if (titleAcronyms.has(uppercaseWord)) return uppercaseWord;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Format ngày tháng theo locale vi-VN (VD: "19/06/2026")
 */
function formatConversationDate(value?: string) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("vi-VN");
}

/**
 * Trả về key ngày dạng "YYYY-MM-DD" để so sánh ngày giữa các message
 * Dùng để quyết định có hiển thị Date Divider hay không
 */
function getDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * Format ngày hiển thị trên Date Divider:
 *  - Cùng ngày → "Hôm nay"
 *  - Hôm qua → "Hôm qua"
 *  - Khác → định dạng locale vi-VN
 */
function formatMessageDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (getDateKey(value) === getDateKey(today.toISOString())) return "Hôm nay";
  if (getDateKey(value) === getDateKey(yesterday.toISOString())) return "Hôm qua";

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

/**
 * Format giờ gửi tin nhắn dạng HH:mm (theo locale vi-VN)
 */
function formatMessageTime(value: string) {
  try {
    return new Date(value).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Format dung lượng file: nếu < 1MB → hiển thị KB, nếu >= 1MB → hiển thị MB
 */
function formatFileSize(bytes: number | null) {
  if (!bytes) return "0 KB";

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;

  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(1)} MB`;
}

/**
 * Tạo một message tạm thời (optimistic) để hiển thị ngay trên UI
 * trước khi server xác nhận. deliveryStatus = "sending"
 * Khi server trả về kết quả, message này sẽ được thay thế bởi message thật.
 * Nếu lỗi, deliveryStatus chuyển thành "error" để cho phép gửi lại.
 */
function createOptimisticTextMessage({
  id,
  conversationId,
  senderId,
  content,
}: {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
}): ChatMessage {
  return {
    id,
    conversationId,
    senderId,
    content,
    messageType: "text",
    attachmentPath: null,
    attachmentName: null,
    attachmentMime: null,
    attachmentSize: null,
    isRead: false,
    sentAt: new Date().toISOString(),
    sender: {
      id: senderId,
      role: "candidate",
    },
    deliveryStatus: "sending",
  };
}

/**
 * ── Sidebar danh sách hội thoại (bên trái) ──
 * Gồm header (tiêu đề + nút refresh + ô tìm kiếm) và danh sách các cuộc trò chuyện
 */
function ConversationSidebar({
  conversations,
  activeConversationId,
  searchQuery,
  isLoading,
  onSearchChange,
  onSelectConversation,
  onRefresh,
}: {
  conversations: Conversation[];
  activeConversationId: number | null;
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
      <ConversationSidebarHeader
        searchQuery={searchQuery}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onRefresh={onRefresh}
      />

      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
}

/**
 * ── Header của Sidebar (tiêu đề + nút làm mới + ô tìm kiếm) ──
 * - Nút refresh: tải lại danh sách hội thoại (xoay khi đang tải)
 * - Ô tìm kiếm: lọc hội thoại theo tên công ty / tên người liên hệ / tên job
 */
function ConversationSidebarHeader({
  searchQuery,
  isLoading,
  onSearchChange,
  onRefresh,
}: {
  searchQuery: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
          Nhắn tin tuyển dụng
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Tải lại cuộc trò chuyện"
          aria-label="Tải lại cuộc trò chuyện"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <Input
          type="text"
          placeholder="Tìm công ty, vị trí..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}

/**
 * ── Danh sách các cuộc hội thoại ──
 * Hiển thị loading spinner nếu đang tải
 * Hiển thị empty state nếu chưa có hội thoại nào
 * Mỗi item là một ConversationItem
 */
function ConversationList({
  conversations,
  activeConversationId,
  isLoading,
  onSelectConversation,
}: {
  conversations: Conversation[];
  activeConversationId: number | null;
  isLoading: boolean;
  onSelectConversation: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-center text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        Đang tải danh sách...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Chưa có cuộc hội thoại nào. Cuộc chat sẽ hiển thị ở đây sau khi bạn nộp
        đơn ứng tuyển và bắt đầu trò chuyện.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeConversationId}
          onSelect={() => onSelectConversation(conversation.id)}
        />
      ))}
    </div>
  );
}

/**
 * ── Một item hội thoại trong sidebar ──
 * Hiển thị:
 *  - Avatar (2 ký tự đầu tên công ty)
 *  - Tên người liên hệ / công ty
 *  - Job title
 *  - Tin nhắn cuối cùng
 *  - Badge số tin nhắn chưa đọc
 *  - Dấu hiệu online (chấm xanh)
 * Khi active: border trái màu indigo
 */
function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) {
  const unreadCount = conversation._count?.messages || 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full gap-3 p-4 text-left transition-all ${isActive
          ? "border-l-4 border-indigo-500 bg-white font-medium shadow-3xs dark:bg-slate-950"
          : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
        }`}
    >
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600 shadow-3xs dark:bg-indigo-950/60 dark:text-indigo-400">
          {getConversationInitials(conversation)}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
            {getConversationName(conversation)}
          </p>
          <span className="whitespace-nowrap text-[10px] font-medium text-slate-400 dark:text-slate-500">
            {formatConversationDate(conversation.updatedAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
          {formatJobTitle(conversation.jobPosting?.title)}
        </p>
        <p className="mt-1 truncate text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {getLastMessageText(conversation)}
        </p>
      </div>

      {unreadCount > 0 ? (
        <div className="flex shrink-0 items-center">
          <Badge className="rounded-full border-none bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-indigo-700">
            {unreadCount}
          </Badge>
        </div>
      ) : null}
    </button>
  );
}

/**
 * ── Panel chat chính (bên phải sidebar) ──
 * Bao gồm 3 phần:
 *  1. ChatHeader: avatar, tên, job title, nút xem tin tuyển dụng
 *  2. MessageTimeline: danh sách tin nhắn, date divider, file preview, upload indicator
 *  3. ChatInput: ô nhập text + nút đính kèm + nút gửi
 * Nếu chưa chọn hội thoại → hiển thị EmptyChatState
 */
function ChatPanel({
  activeConversation,
  messages,
  inputMessage,
  isLoadingMessages,
  isUploading,
  userId,
  chatEndRef,
  onInputChange,
  onSendMessage,
  onFileUpload,
  onRetryMessage,
}: {
  activeConversation: Conversation | undefined;
  messages: ChatMessage[];
  inputMessage: string;
  isLoadingMessages: boolean;
  isUploading: boolean;
  userId?: number;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSendMessage: (event: FormEvent) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRetryMessage: (message: ChatMessage) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-900">
      {activeConversation ? (
        <>
          <ChatHeader conversation={activeConversation} />

          <MessageTimeline
            messages={messages}
            isLoading={isLoadingMessages}
            isUploading={isUploading}
            userId={userId}
            chatEndRef={chatEndRef}
            onRetryMessage={onRetryMessage}
          />

          <ChatInput
            inputMessage={inputMessage}
            onInputChange={onInputChange}
            onSendMessage={onSendMessage}
            onFileUpload={onFileUpload}
          />
        </>
      ) : (
        <EmptyChatState />
      )}
    </div>
  );
}

/**
 * ── Header của khung chat ──
 * Hiển thị avatar (initials), tên người liên hệ, job title + tên công ty
 * Nếu có jobPostingId → hiển thị nút "Xem tin tuyển dụng" (link đến trang chi tiết job)
 */
function ChatHeader({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-3xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600 shadow-3xs dark:bg-indigo-950/60 dark:text-indigo-400">
          {getConversationInitials(conversation)}
        </div>
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-bold leading-none text-slate-800 dark:text-slate-100">
              {getConversationName(conversation)}
            </h3>
          </div>
          <p className="mt-1 truncate text-[11px] font-medium leading-none text-slate-500 dark:text-slate-400">
            {formatJobTitle(conversation.jobPosting?.title)}{" "}
            <strong className="text-indigo-600 dark:text-indigo-400">
              · {conversation.recruiterProfile.companyName}
            </strong>
          </p>
        </div>
      </div>

      {conversation.jobPostingId ? (
        <Link
          to={`/candidate/jobs/${conversation.jobPostingId}`}
          title="Xem tin tuyển dụng"
          className="ml-4 inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Xem tin tuyển dụng</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * ── Timeline tin nhắn ──
 * Hiển thị danh sách các tin nhắn, tự động chèn Date Divider giữa các ngày khác nhau
 * Hỗ trợ: loading spinner, empty state, upload indicator, auto-scroll xuống cuối
 * Mỗi tin nhắn được render bởi MessageBubble
 */
function MessageTimeline({
  messages,
  isLoading,
  isUploading,
  userId,
  chatEndRef,
  onRetryMessage,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  isUploading: boolean;
  userId?: number;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onRetryMessage: (message: ChatMessage) => void;
}) {
  return (
    <div className="grow overflow-y-auto bg-slate-50/20 p-6 dark:bg-slate-950/10">
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col space-y-4">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyMessagesState />
        ) : (
          messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            const shouldShowDate =
              !previousMessage ||
              getDateKey(previousMessage.sentAt) !== getDateKey(message.sentAt);

            return (
              <Fragment key={message.id}>
                {shouldShowDate ? (
                  <MessageDateDivider value={message.sentAt} />
                ) : null}
                <MessageBubble
                  message={message}
                  isMine={message.senderId === userId}
                  onRetryMessage={onRetryMessage}
                />
              </Fragment>
            );
          })
        )}

        {isUploading ? <UploadingBubble /> : null}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}

/**
 * Trạng thái empty: hiển thị khi chưa có tin nhắn nào trong hội thoại
 */
function EmptyMessagesState() {
  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Chưa có tin nhắn. Hãy gửi lời chào đến nhà tuyển dụng.
      </div>
    </div>
  );
}

/**
 * Divider ngày: hiển thị giữa các tin nhắn thuộc các ngày khác nhau
 * Format: "Hôm nay", "Hôm qua", hoặc ngày cụ thể
 */
function MessageDateDivider({ value }: { value: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {formatMessageDate(value)}
      </span>
    </div>
  );
}

/**
 * Lấy nhãn trạng thái gửi tin nhắn (chỉ hiển thị cho tin nhắn của mình):
 *  - "Đang gửi..."   → đang chờ server phản hồi (optimistic)
 *  - "Gửi lỗi - Thử lại" → gửi thất bại, có thể click để gửi lại
 *  - "Đã xem"        → người nhận đã đọc
 *  - "Đã gửi"        → đã gửi thành công nhưng chưa đọc
 *  - null            → không phải tin nhắn của mình
 */
function getMessageDeliveryLabel(message: ChatMessage, isMine: boolean) {
  if (!isMine) return null;
  if (message.deliveryStatus === "sending") return "Đang gửi...";
  if (message.deliveryStatus === "error") return "Gửi lỗi - Thử lại";
  return message.isRead ? "Đã xem" : "Đã gửi";
}

/**
 * ── Bubble tin nhắn ──
 * - isMine = true  → căn phải, nền indigo, rounded-br-none
 * - isMine = false → căn trái, nền trắng (border), rounded-bl-none
 * - Nếu messageType === "file" → render FileMessage component
 * - Nếu là text → hiển thị nội dung
 * - Footer: giờ gửi + trạng thái delivery (sending/error/read/delivered)
 * - Nếu deliveryStatus === "error" → hiển thị nút "Thử lại" (gọi onRetryMessage)
 * - Icon: spinner khi sending, CheckCheck khi đã gửi
 */
function MessageBubble({
  message,
  isMine,
  onRetryMessage,
}: {
  message: ChatMessage;
  isMine: boolean;
  onRetryMessage: (message: ChatMessage) => void;
}) {
  const deliveryLabel = getMessageDeliveryLabel(message, isMine);

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[75%] items-end gap-2 ${isMine ? "flex-row-reverse" : ""
          }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-3xs ${isMine
              ? "rounded-br-none bg-indigo-600 text-white"
              : "rounded-bl-none border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            }`}
        >
          {message.messageType === "file" ? (
            <FileMessage message={message} />
          ) : (
            <p>{message.content}</p>
          )}

          <div
            className={`mt-1 flex items-center justify-end gap-1 text-right text-[9px] ${isMine
                ? message.deliveryStatus === "error"
                  ? "text-red-100"
                  : "text-indigo-200"
                : "text-slate-400 dark:text-slate-500"
              }`}
          >
            <span>{formatMessageTime(message.sentAt)}</span>
            {deliveryLabel ? (
              message.deliveryStatus === "error" ? (
                <button
                  type="button"
                  onClick={() => onRetryMessage(message)}
                  className="font-semibold underline-offset-2 hover:underline"
                >
                  {deliveryLabel}
                </button>
              ) : (
                <span>{deliveryLabel}</span>
              )
            ) : null}
            {isMine && message.deliveryStatus === "sending" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-200" />
            ) : isMine && message.deliveryStatus !== "error" ? (
              <CheckCheck className="h-3.5 w-3.5 text-indigo-200" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ── Hiển thị tin nhắn dạng file đính kèm ──
 * - Nếu là ảnh (image/*) → hiển thị preview ảnh (click để zoom)
 * - Nếu là file khác (pdf, doc...) → hiển thị icon + tên file + dung lượng + nút tải xuống
 * - Nếu có kèm nội dung text → hiển thị bên dưới file
 * attachmentUrl là Signed URL từ backend (có thời hạn)
 */
function FileMessage({ message }: { message: Message }) {
  const isImage = message.attachmentMime?.startsWith("image/");
  const attachmentName = normalizeAttachmentName(message.attachmentName);

  return (
    <div className="space-y-2">
      {isImage ? (
        <a href={message.attachmentUrl} target="_blank" rel="noreferrer">
          <img
            src={message.attachmentUrl}
            alt={attachmentName || "Ảnh"}
            className="max-h-37.5 max-w-50 cursor-zoom-in rounded-lg border bg-slate-50 object-contain"
          />
        </a>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200/50 bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <FileText className="h-8 w-8 shrink-0 text-indigo-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold" title={attachmentName || ""}>
              {attachmentName}
            </p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
              {formatFileSize(message.attachmentSize)}
            </p>
          </div>
          {message.attachmentUrl ? (
            <a
              href={message.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              download={attachmentName || ""}
              className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:text-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      )}

      {message.content ? <p className="mt-1.5">{message.content}</p> : null}
    </div>
  );
}

/**
 * Bubble "đang tải lên file đính kèm" (xuất hiện tạm thời trong khi upload)
 * Hiển thị ở bên phải (căn phải) với spinner + text
 */
function UploadingBubble() {
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 shadow-3xs dark:border-indigo-900/60 dark:bg-indigo-950/30">
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
          Đang tải lên tệp đính kèm...
        </span>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
      </div>
    </div>
  );
}

/**
 * ── Ô nhập tin nhắn + nút gửi + nút đính kèm file ──
 * - Input text: placeholder hướng dẫn, trim khi gửi
 * - Nút Paperclip: chọn file (chấp nhận .jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx)
 * - Nút Send: gửi tin nhắn (disabled khi input rỗng)
 * - File input ẩn trong label để tùy chỉnh style
 */
function ChatInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  onFileUpload,
}: {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSendMessage: (event: FormEvent) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <form
        onSubmit={onSendMessage}
        className="mx-auto flex w-full max-w-4xl items-center gap-3"
      >
        <label className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
          <Paperclip className="h-5 w-5" />
          <input
            type="file"
            onChange={onFileUpload}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
          />
        </label>

        <Input
          type="text"
          placeholder="Nhập nội dung trao đổi với nhà tuyển dụng tại đây..."
          value={inputMessage}
          onChange={(event) => onInputChange(event.target.value)}
          className="h-11 grow rounded-xl border border-slate-200 bg-white px-4 text-xs text-slate-800 outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
        <Button
          type="submit"
          disabled={!inputMessage.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 p-0 text-white shadow-3xs transition-all hover:bg-indigo-700 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

/**
 * Trạng thái empty khi chưa chọn hội thoại nào
 * Hiển thị icon circle + text hướng dẫn
 */
function EmptyChatState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-400">
      <Circle className="mb-2 h-12 w-12 text-slate-300" />
      <p className="text-sm font-bold">
        Hãy chọn một cuộc hội thoại từ danh sách để bắt đầu trò chuyện
      </p>
    </div>
  );
}

/**
 * ── Component Chat chính (Candidate) ──
 *
 * State management:
 *  - conversations: danh sách hội thoại từ API
 *  - activeConversationId: ID hội thoại đang chọn (lưu vào URL param)
 *  - messages: danh sách tin nhắn của hội thoại đang chọn
 *  - inputMessage: nội dung đang soạn
 *  - searchQuery: từ khóa tìm kiếm hội thoại
 *
 * Flow:
 *  1. Load conversations khi mount
 *  2. Khi chọn conversation → load messages
 *  3. Đăng ký Supabase Realtime lắng nghe INSERT/UPDATE
 *  4. Gửi tin nhắn: optimistic UI → API → replace message thật
 *  5. Upload file: FormData → API → append message
 *  6. Auto-scroll xuống cuối khi messages thay đổi
 *  7. Đánh dấu đã đọc cho tin nhắn đến
 */
export default function Chat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // Lấy conversationId từ URL param (khi điều hướng từ Applied Jobs / Job Detail)
  const requestedConversationIdParam = Number(searchParams.get("conversationId"));
  const requestedConversationId =
    Number.isInteger(requestedConversationIdParam) &&
      requestedConversationIdParam > 0
      ? requestedConversationIdParam
      : null;
  // State danh sách hội thoại
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // State ID hội thoại đang active
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null,
  );
  // State danh sách tin nhắn
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State input message
  const [inputMessage, setInputMessage] = useState("");
  // Loading states
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // Ref để auto-scroll xuống cuối
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hội thoại đang active
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );

  /**
   * Lọc danh sách hội thoại theo từ khóa tìm kiếm
   * Tìm kiếm theo: tên công ty, tên người liên hệ, tiêu đề job
   */
  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) => {
      return (
        conversation.recruiterProfile.companyName
          .toLowerCase()
          .includes(query) ||
        conversation.recruiterProfile.contactName
          ?.toLowerCase()
          .includes(query) ||
        conversation.jobPosting?.title.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery]);

  /**
   * Tải danh sách các cuộc hội thoại từ API
   * - Nếu có requestedConversationId từ URL → tự động chọn hội thoại đó
   * - selectFirst: nếu chưa có hội thoại nào được chọn, chọn hội thoại đầu tiên
   */
  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      setIsLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);

      // Ưu tiên chọn hội thoại theo URL param (từ trang Applied Jobs / Job Detail)
      const requestedConversation = requestedConversationId
        ? data.find(
          (conversation) => conversation.id === requestedConversationId,
        )
        : null;

      if (requestedConversation) {
        setActiveConversationId(requestedConversation.id);
        return;
      }

      // Nếu không có requested, chọn hội thoại đầu tiên (nếu selectFirst)
      if (selectFirst && data.length > 0) {
        setActiveConversationId((current) => current ?? data[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [requestedConversationId]);

  /**
   * Tải tin nhắn của một hội thoại cụ thể
   * Sau khi tải, tự động đánh dấu đã đọc các tin nhắn chưa đọc từ recruiter
   * và cập nhật lại danh sách hội thoại (để cập nhật badge)
   */
  const loadMessages = useCallback(
    async (conversationId: number) => {
      try {
        setIsLoadingMessages(true);
        const response = await chatService.getMessages(conversationId, 1, 100);
        setMessages(normalizeMessages(response.items));

        // Đánh dấu đã đọc cho tin nhắn chưa đọc (từ recruiter gửi đến)
        const unreadMessages = response.items.filter(
          (message) => !message.isRead && message.senderId !== user?.id,
        );

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map((message) =>
              chatService.markMessageRead(message.id),
            ),
          );
          // Reload conversations để cập nhật số chưa đọc
          loadConversations();
        }
      } catch (error) {
        console.error("Lỗi khi tải tin nhắn:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [loadConversations, user?.id],
  );

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Load messages khi activeConversationId thay đổi
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  /**
   * ── Đăng ký Realtime qua Supabase ──
   * Lắng nghe sự kiện INSERT trên bảng "messages" để nhận tin nhắn mới tức thì
   * Lắng nghe sự kiện UPDATE để cập nhật trạng thái isRead
   * Bỏ qua tin nhắn do chính user gửi (đã được thêm qua optimistic UI hoặc API response)
   * Khi nhận được tin nhắn mới: re-fetch messages, đánh dấu đã đọc, reload sidebar
   * Cleanup: unsubscribe channel khi component unmount hoặc activeConversationId thay đổi
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
          const newMessage = payload.new as { sender_id?: number };

          // Bỏ qua tin nhắn do mình gửi (đã được thêm bởi API response)
          if (newMessage.sender_id === user?.id) return;

          try {
            // Re-fetch để lấy signed URLs mới cho file đính kèm
            const response = await chatService.getMessages(
              activeConversationId,
              1,
              100,
            );
            setMessages(normalizeMessages(response.items));

            // Đánh dấu đã đọc tin nhắn mới từ recruiter
            const unreadNewMessages = response.items.filter(
              (message) => !message.isRead && message.senderId !== user?.id,
            );

            if (unreadNewMessages.length > 0) {
              await Promise.all(
                unreadNewMessages.map((message) =>
                  chatService.markMessageRead(message.id),
                ),
              );
            }

            // Reload sidebar để cập nhật lastMessage + badge
            loadConversations();
          } catch (error) {
            console.error("Lỗi cập nhật tin nhắn realtime:", error);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        async () => {
          try {
            // Cập nhật messages khi có thay đổi trạng thái (isRead)
            const response = await chatService.getMessages(
              activeConversationId,
              1,
              100,
            );
            setMessages(normalizeMessages(response.items));
            loadConversations();
          } catch (error) {
            console.error("Lỗi cập nhật trạng thái tin nhắn realtime:", error);
          }
        },
      )
      .subscribe();

    // Cleanup: hủy đăng ký channel khi unmount hoặc đổi conversation
    return () => {
      client.removeChannel(channel);
    };
  }, [activeConversationId, loadConversations, user?.id]);

  /**
   * Auto-scroll xuống cuối khung chat mỗi khi messages thay đổi
   */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Gửi tin nhắn văn bản với optimistic UI:
   * 1. Tạo message tạm (deliveryStatus = "sending") và append vào local state ngay
   * 2. Gọi API sendMessage
   * 3. Thành công → replace message tạm bằng message thật từ server
   * 4. Thất bại → đánh dấu deliveryStatus = "error" (cho phép gửi lại)
   */
  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (!inputMessage.trim() || !activeConversationId || !user?.id) return;

    const textToSend = inputMessage.trim();
    const optimisticId = -Date.now(); // ID âm để tránh trùng với ID thật từ DB
    setInputMessage("");
    // Thêm message tạm với trạng thái "sending"
    setMessages((current) => [
      ...current,
      createOptimisticTextMessage({
        id: optimisticId,
        conversationId: activeConversationId,
        senderId: user.id,
        content: textToSend,
      }),
    ]);

    try {
      const sentMessage = await chatService.sendMessage(
        activeConversationId,
        textToSend,
      );
      // Thay thế message tạm bằng message thật từ server
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId ? normalizeMessage(sentMessage) : message,
        ),
      );
      // Cập nhật sidebar (lastMessage)
      loadConversations();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      // Đánh dấu lỗi để user có thể thử lại
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId
            ? { ...message, deliveryStatus: "error" }
            : message,
        ),
      );
    }
  };

  /**
   * Gửi lại tin nhắn bị lỗi (retry)
   * Đặt lại deliveryStatus = "sending", gọi API sendMessage
   * Thành công → replace bằng message thật
   * Thất bại → giữ nguyên deliveryStatus = "error"
   */
  const handleRetryMessage = async (message: ChatMessage) => {
    const textToSend = message.content?.trim();
    if (!textToSend || !user?.id) return;

    // Reset trạng thái về "sending"
    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
            ...item,
            sentAt: new Date().toISOString(),
            deliveryStatus: "sending",
          }
          : item,
      ),
    );

    try {
      const sentMessage = await chatService.sendMessage(
        message.conversationId,
        textToSend,
      );
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id ? normalizeMessage(sentMessage) : item,
        ),
      );
      loadConversations();
    } catch (error) {
      console.error("Lỗi khi gửi lại tin nhắn:", error);
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? { ...item, deliveryStatus: "error" }
            : item,
        ),
      );
    }
  };

  /**
   * Upload file đính kèm
   * Giới hạn kích thước 20MB
   * Gửi FormData qua API → nhận message với attachmentUrl (signed URL)
   * Append message vào danh sách
   */
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeConversationId) return;

    if (file.size > maxAttachmentSize) {
      alert("Kích thước tệp đính kèm không được vượt quá 20MB");
      return;
    }

    try {
      setIsUploading(true);
      const sentMessage = await chatService.uploadAttachment(
        activeConversationId,
        file,
      );
      setMessages((current) =>
        sortMessagesByTime([...current, normalizeMessage(sentMessage)]),
      );
      loadConversations();
    } catch (error) {
      console.error("Lỗi khi tải lên tệp đính kèm:", error);
      alert(
        "Tải lên file thất bại. Vui lòng kiểm tra lại định dạng file cho phép.",
      );
    } finally {
      setIsUploading(false);
      // Reset input file để cho phép chọn lại file giống tên
      event.target.value = "";
    }
  };

  /**
   * Chọn một hội thoại từ sidebar
   * Cập nhật URL param "conversationId" để có thể share link
   */
  const handleSelectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
    setSearchParams({ conversationId: String(conversationId) }, { replace: true });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white font-sans shadow-3xs transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <ConversationSidebar
          conversations={filteredConversations}
          activeConversationId={activeConversationId}
          searchQuery={searchQuery}
          isLoading={isLoadingConversations}
          onSearchChange={setSearchQuery}
          onSelectConversation={handleSelectConversation}
          onRefresh={() => loadConversations()}
        />

        <ChatPanel
          activeConversation={activeConversation}
          messages={messages}
          inputMessage={inputMessage}
          isLoadingMessages={isLoadingMessages}
          isUploading={isUploading}
          userId={user?.id}
          chatEndRef={chatEndRef}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onRetryMessage={(message) => void handleRetryMessage(message)}
        />
      </div>
    </div>
  );
}
