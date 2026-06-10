import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCheck,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  type ChatConversation,
  type ChatMessage,
  chatService,
} from "@/services/chat.service";

const getInitials = (value?: string | null) => {
  if (!value) return "HR";

  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "HR";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatTime = (value?: string) => {
  if (!value) return "";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRecruiterName = (conversation: ChatConversation) =>
  conversation.recruiterProfile?.contactName ||
  conversation.recruiterProfile?.companyName ||
  "Nhà tuyển dụng";

const getCompanyName = (conversation: ChatConversation) =>
  conversation.recruiterProfile?.companyName || "Chưa có tên công ty";

const getLastMessage = (conversation: ChatConversation) =>
  conversation.messages?.[0]?.content || "Chưa có tin nhắn.";

export default function Chat() {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      setErrorMessage(null);

      const response = await chatService.getConversations();
      setConversations(response.data);

      if (!activeConversationId && response.data.length > 0) {
        setActiveConversationId(response.data[0].id);
      }
    } catch {
      setErrorMessage("Không thể tải danh sách hội thoại.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        setErrorMessage(null);

        const response = await chatService.getMessages(activeConversationId);
        setMessages(response.data);
      } catch {
        setErrorMessage("Không thể tải tin nhắn của hội thoại này.");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conversation) => {
      const recruiterName = getRecruiterName(conversation).toLowerCase();
      const companyName = getCompanyName(conversation).toLowerCase();
      const jobTitle = conversation.jobPosting?.title?.toLowerCase() || "";
      return (
        recruiterName.includes(keyword) ||
        companyName.includes(keyword) ||
        jobTitle.includes(keyword)
      );
    });
  }, [conversations, searchTerm]);

  const activeConversation =
    conversations.find((item) => item.id === activeConversationId) || null;

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    const content = inputMessage.trim();
    if (!content || !activeConversationId) return;

    try {
      setIsSending(true);
      setErrorMessage(null);

      const response = await chatService.sendMessage(
        activeConversationId,
        content,
      );

      setMessages((currentMessages) => [...currentMessages, response.data]);
      setInputMessage("");
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                updatedAt: response.data.sentAt,
                messages: [response.data],
              }
            : conversation,
        ),
      );
    } catch {
      setErrorMessage("Không thể gửi tin nhắn.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-155 border border-slate-800 bg-slate-950">
      <aside className="flex w-88 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Trò chuyện</h1>
              <p className="mt-1 text-xs text-slate-500">
                Hội thoại thật từ database.
              </p>
            </div>

            <button
              type="button"
              onClick={loadConversations}
              disabled={isLoadingConversations}
              className="p-2 text-slate-500 transition hover:text-blue-400 disabled:opacity-50"
              title="Tải lại"
            >
              <RefreshCw
                size={17}
                className={isLoadingConversations ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="flex items-center border border-slate-800 bg-slate-950 px-3 py-2">
            <Search size={16} className="mr-2 text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm công ty, người tuyển dụng..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex h-40 items-center justify-center gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Đang tải...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <MessageCircle
                className="mx-auto mb-3 text-slate-700"
                size={36}
              />
              <p className="font-semibold text-white">Chưa có hội thoại.</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Khi bạn trao đổi với nhà tuyển dụng, conversation trong DB sẽ
                xuất hiện ở đây.
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const active = conversation.id === activeConversationId;
              const unread = conversation._count?.messages || 0;
              const recruiterName = getRecruiterName(conversation);

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`flex w-full gap-3 border-b border-slate-800 p-4 text-left transition ${
                    active
                      ? "bg-blue-950/30"
                      : "bg-transparent hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-blue-600 text-sm font-bold text-white">
                    {getInitials(recruiterName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {recruiterName}
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-600">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {getCompanyName(conversation)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                      {getLastMessage(conversation)}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-slate-950">
        {activeConversation ? (
          <>
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-blue-600 text-sm font-bold text-white">
                  {getInitials(getRecruiterName(activeConversation))}
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    {getRecruiterName(activeConversation)}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Building2 size={13} />
                    {getCompanyName(activeConversation)}
                    {activeConversation.jobPosting?.title
                      ? ` / ${activeConversation.jobPosting.title}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-4 flex items-center gap-2 border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center gap-2 text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageCircle className="mb-4 text-slate-700" size={44} />
                  <p className="font-semibold text-white">
                    Hội thoại này chưa có tin nhắn.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Gửi tin nhắn đầu tiên để tạo bản ghi Message trong DB.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMine = message.senderId === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 text-sm leading-6 ${
                            isMine
                              ? "bg-blue-600 text-white"
                              : "border border-slate-800 bg-slate-900 text-slate-200"
                          }`}
                        >
                          <p>{message.content}</p>
                          <div
                            className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${
                              isMine ? "text-blue-100" : "text-slate-600"
                            }`}
                          >
                            {formatTime(message.sentAt)}
                            {isMine && <CheckCheck size={13} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex shrink-0 items-center gap-3 border-t border-slate-800 p-5"
            >
              <input
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                placeholder="Nhập tin nhắn..."
                className="h-12 flex-1 border border-slate-800 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle className="mb-4 text-slate-700" size={52} />
            <p className="font-semibold text-white">Chưa chọn hội thoại.</p>
            <p className="mt-2 text-sm text-slate-500">
              Chọn một hội thoại bên trái để xem tin nhắn.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
