import {
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
  FileText,
  Info,
  Loader2,
  Paperclip,
  Phone,
  RefreshCw,
  Search,
  Send,
  Smile,
  Video,
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

const maxAttachmentSize = 20 * 1024 * 1024;

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

function formatConversationDate(value?: string) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("vi-VN");
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
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-100">
        Nhắn tin tuyển dụng
      </h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <Input
          type="text"
          placeholder="Tìm công ty, tin tuyển dụng..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
        />
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
        title="Tải lại cuộc trò chuyện"
      >
        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        Tải lại cuộc trò chuyện
      </button>
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
        <p className="mt-0.5 truncate text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400">
          {conversation.jobPosting?.title || "Mẫu tin tuyển dụng"}
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
}: {
  activeConversation: Conversation | undefined;
  messages: Message[];
  inputMessage: string;
  isLoadingMessages: boolean;
  isUploading: boolean;
  userId?: number;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSendMessage: (event: FormEvent) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600 shadow-3xs dark:bg-indigo-950/60 dark:text-indigo-400">
          {getConversationInitials(conversation)}
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold leading-none text-slate-800 dark:text-slate-100">
              {getConversationName(conversation)}
            </h3>
            <span className="flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500">
              <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500" />
              Đang online
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium leading-none text-slate-500 dark:text-slate-400">
            {conversation.jobPosting?.title}{" "}
            <strong className="text-indigo-600 dark:text-indigo-400">
              {conversation.recruiterProfile.companyName}
            </strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HeaderIconButton disabled title="Gọi thoại">
          <Phone className="h-4 w-4" />
        </HeaderIconButton>
        <HeaderIconButton disabled title="Gọi video">
          <Video className="h-4 w-4" />
        </HeaderIconButton>
        <HeaderIconButton title="Thông tin">
          <Info className="h-4 w-4" />
        </HeaderIconButton>
      </div>
    </div>
  );
}

function HeaderIconButton({
  children,
  title,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      {children}
    </button>
  );
}

function MessageTimeline({
  messages,
  isLoading,
  isUploading,
  userId,
  chatEndRef,
}: {
  messages: Message[];
  isLoading: boolean;
  isUploading: boolean;
  userId?: number;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="grow space-y-4 overflow-y-auto bg-slate-50/20 p-6 dark:bg-slate-950/10">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.senderId === userId}
          />
        ))
      )}

      {isUploading ? <UploadingBubble /> : null}

      <div ref={chatEndRef} />
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
}: {
  message: Message;
  isMine: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[70%] items-end gap-2 ${
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
              isMine ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <span>{formatMessageTime(message.sentAt)}</span>
            {isMine ? <CheckCheck className="h-3.5 w-3.5 text-indigo-200" /> : null}
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
      <form onSubmit={onSendMessage} className="flex items-center gap-3">
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
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

      if (selectFirst && data.length > 0) {
        setActiveConversationId((current) => current ?? data[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

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

    if (!inputMessage.trim() || !activeConversationId) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");

    try {
      const sentMessage = await chatService.sendMessage(
        activeConversationId,
        textToSend,
      );
      setMessages((current) => [...current, sentMessage]);
      loadConversations();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
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

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white font-sans shadow-3xs transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <ConversationSidebar
          conversations={filteredConversations}
          activeConversationId={activeConversationId}
          searchQuery={searchQuery}
          isLoading={isLoadingConversations}
          onSearchChange={setSearchQuery}
          onSelectConversation={setActiveConversationId}
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
        />
      </div>
    </div>
  );
}
