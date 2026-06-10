import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CheckCheck,
  Smile,
  Phone,
  Video,
  Info,
  Circle,
  Paperclip,
  FileText,
  Download,
  Loader2,
  Search,
  Send,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import {
  chatService,
  type Conversation,
  type Message,
} from "../../services/chat.service";
import { supabase } from "../../utils/supabase";

export default function Chat() {
  const { user } = useAuth();
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

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  // 1. Tải danh sách các cuộc hội thoại
  const loadConversations = useCallback(async (selectFirst = false) => {
    try {
      setIsLoadingConversations(true);
      const data = await chatService.getConversations();
      setConversations(data);
      if (selectFirst && data.length > 0) {
        setActiveConversationId((current) => current ?? data[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách hội thoại:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // 2. Tải tin nhắn của cuộc hội thoại đang chọn
  const loadMessages = useCallback(
    async (conversationId: number) => {
      try {
        setIsLoadingMessages(true);
        const res = await chatService.getMessages(conversationId, 1, 100);
        setMessages(res.items);

        // Đánh dấu đã đọc cho các tin nhắn chưa đọc từ người kia gửi
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
            setMessages(res.items);

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
      setMessages((prev) => [...prev, sentMsg]);
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
      setMessages((prev) => [...prev, sentMsg]);
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
      c.recruiterProfile.companyName.toLowerCase().includes(query) ||
      c.recruiterProfile.contactName?.toLowerCase().includes(query) ||
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
              Nhắn tin tuyển dụng
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Tìm công ty, tin tuyển dụng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            <button
              type="button"
              onClick={() => loadConversations()}
              disabled={isLoadingConversations}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 transition-colors"
              title="Tải lại cuộc trò chuyện"
            >
              <RefreshCw
                size={14}
                className={isLoadingConversations ? "animate-spin" : ""}
              />
              Tải lại cuộc trò chuyện
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {isLoadingConversations ? (
              <div className="p-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                Đang tải danh sách...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có cuộc hội thoại nào. Cuộc chat sẽ hiển thị ở đây sau khi
                bạn nộp đơn ứng tuyển và bắt đầu trò chuyện.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const active = c.id === activeConversationId;
                const initials = c.recruiterProfile.companyName
                  .substring(0, 2)
                  .toUpperCase();
                const unreadCount = c._count?.messages || 0;
                const lastMsgObj = c.messages[0];
                let lastMsgText = "Chưa có tin nhắn";
                if (lastMsgObj) {
                  lastMsgText =
                    lastMsgObj.messageType === "file"
                      ? `📎 File: ${lastMsgObj.attachmentName}`
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
                          {c.recruiterProfile.contactName ||
                            c.recruiterProfile.companyName}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-550 font-medium whitespace-nowrap">
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
                    {activeConversation.recruiterProfile.companyName
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {activeConversation.recruiterProfile.contactName ||
                          activeConversation.recruiterProfile.companyName}
                      </h3>
                      <span className="flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500">
                        <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
                        Đang online
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-none">
                      {activeConversation.jobPosting?.title} •{" "}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {activeConversation.recruiterProfile.companyName}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
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
                                      className="max-w-50 max-h-37.5 rounded-lg border object-contain cursor-zoom-in bg-slate-50"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200/50">
                                    <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
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
                                        className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:text-indigo-500 rounded-md transition-colors shrink-0"
                                      >
                                        <Download className="w-3.5 h-3.5" />
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
                                  : "text-slate-400 dark:text-slate-550"
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

                  <label className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <Paperclip className="w-5 h-5" />
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    />
                  </label>

                  <Input
                    type="text"
                    placeholder="Nhập nội dung trao đổi với nhà tuyển dụng tại đây..."
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
      </div>
    </div>
  );
}
