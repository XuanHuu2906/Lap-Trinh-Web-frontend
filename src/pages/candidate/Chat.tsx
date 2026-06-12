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
  Smile,
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
import { Link, useSearchParams } from "react-router-dom";

const maxAttachmentSize = 20 * 1024 * 1024;

type ChatMessage = Message & {
  deliveryStatus?: "sending" | "error";
};

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

function getConversationName(conversation: Conversation) {
  return (
    conversation.recruiterProfile.contactName ||
    conversation.recruiterProfile.companyName
  );
}

function getConversationInitials(conversation: Conversation) {
  return conversation.recruiterProfile.companyName.substring(0, 2).toUpperCase();
}

function getLastMessageText(conversation: Conversation) {
  const lastMessage = conversation.messages[0];

  if (!lastMessage) return "Chưa có tin nhắn";

  if (lastMessage.messageType === "file") {
    return `File: ${lastMessage.attachmentName}`;
  }

  return lastMessage.content || "";
}

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

function formatConversationDate(value?: string) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("vi-VN");
}

function getDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

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

function formatFileSize(bytes: number | null) {
  if (!bytes) return "0 KB";

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;

  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(1)} MB`;
}

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
      className={`flex w-full gap-3 p-4 text-left transition-all ${
        isActive
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

function EmptyMessagesState() {
  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Chưa có tin nhắn. Hãy gửi lời chào đến nhà tuyển dụng.
      </div>
    </div>
  );
}

function MessageDateDivider({ value }: { value: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {formatMessageDate(value)}
      </span>
    </div>
  );
}

function getMessageDeliveryLabel(message: ChatMessage, isMine: boolean) {
  if (!isMine) return null;
  if (message.deliveryStatus === "sending") return "Đang gửi...";
  if (message.deliveryStatus === "error") return "Gửi lỗi - Thử lại";
  return message.isRead ? "Đã xem" : "Đã gửi";
}

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
        className={`flex max-w-[75%] items-end gap-2 ${
          isMine ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-3xs ${
            isMine
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
            className={`mt-1 flex items-center justify-end gap-1 text-right text-[9px] ${
              isMine
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

function FileMessage({ message }: { message: Message }) {
  const isImage = message.attachmentMime?.startsWith("image/");

  return (
    <div className="space-y-2">
      {isImage ? (
        <a href={message.attachmentUrl} target="_blank" rel="noreferrer">
          <img
            src={message.attachmentUrl}
            alt={message.attachmentName || "Ảnh"}
            className="max-h-37.5 max-w-50 cursor-zoom-in rounded-lg border bg-slate-50 object-contain"
          />
        </a>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200/50 bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <FileText className="h-8 w-8 shrink-0 text-indigo-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold" title={message.attachmentName || ""}>
              {message.attachmentName}
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
              download={message.attachmentName || ""}
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
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          title="Biểu cảm"
        >
          <Smile className="h-5 w-5" />
        </button>

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

export default function Chat() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConversationIdParam = Number(searchParams.get("conversationId"));
  const requestedConversationId =
    Number.isInteger(requestedConversationIdParam) &&
    requestedConversationIdParam > 0
      ? requestedConversationIdParam
      : null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );

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

  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      setIsLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);

      const requestedConversation = requestedConversationId
        ? data.find(
            (conversation) => conversation.id === requestedConversationId,
          )
        : null;

      if (requestedConversation) {
        setActiveConversationId(requestedConversation.id);
        return;
      }

      if (selectFirst && data.length > 0) {
        setActiveConversationId((current) => current ?? data[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [requestedConversationId]);

  const loadMessages = useCallback(
    async (conversationId: number) => {
      try {
        setIsLoadingMessages(true);
        const response = await chatService.getMessages(conversationId, 1, 100);
        setMessages(response.items);

        const unreadMessages = response.items.filter(
          (message) => !message.isRead && message.senderId !== user?.id,
        );

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map((message) =>
              chatService.markMessageRead(message.id),
            ),
          );
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

  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

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

          if (newMessage.sender_id === user?.id) return;

          try {
            const response = await chatService.getMessages(
              activeConversationId,
              1,
              100,
            );
            setMessages(response.items);

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
            const response = await chatService.getMessages(
              activeConversationId,
              1,
              100,
            );
            setMessages(response.items);
            loadConversations();
          } catch (error) {
            console.error("Lỗi cập nhật trạng thái tin nhắn realtime:", error);
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [activeConversationId, loadConversations, user?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (!inputMessage.trim() || !activeConversationId || !user?.id) return;

    const textToSend = inputMessage.trim();
    const optimisticId = -Date.now();
    setInputMessage("");
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
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId ? sentMessage : message,
        ),
      );
      loadConversations();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId
            ? { ...message, deliveryStatus: "error" }
            : message,
        ),
      );
    }
  };

  const handleRetryMessage = async (message: ChatMessage) => {
    const textToSend = message.content?.trim();
    if (!textToSend || !user?.id) return;

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
        current.map((item) => (item.id === message.id ? sentMessage : item)),
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
      setMessages((current) => [...current, sentMessage]);
      loadConversations();
    } catch (error) {
      console.error("Lỗi khi tải lên tệp đính kèm:", error);
      alert(
        "Tải lên file thất bại. Vui lòng kiểm tra lại định dạng file cho phép.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

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
