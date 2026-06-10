import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  CheckCheck,
  Smile,
  Phone,
  Video,
  Info,
  Circle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Channel {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  company: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  replies: string[];
}

interface Message {
  id: number;
  sender: "me" | "them";
  text: string;
  time: string;
}

const INITIAL_CHANNELS: Channel[] = [
  {
    id: 1,
    name: "Lê Minh Tuấn",
    company: "TechNova Solutions",
    role: "HR Lead / Tech Recruiter",
    avatar: "LT",
    avatarColor: "bg-indigo-600",
    lastMessage:
      "Chào bạn, hồ sơ của bạn rất ấn tượng! Bạn có thể phỏng vấn lúc 14:00 ngày mai không?",
    time: "10:15",
    unread: 1,
    online: true,
    replies: [
      "Vâng, tôi đã nhận được thông tin. Tôi sẽ gửi cho ban công nghệ đánh giá thêm.",
      "Tuyệt vời! Tôi đã lên lịch hẹn phỏng vấn trực tuyến qua Zoom cho bạn vào lúc 14:00 ngày mai. Link Zoom sẽ gửi qua email nhé.",
      "Cảm ơn bạn! Chúc bạn một ngày tốt lành và hẹn gặp lại bạn ngày mai.",
    ],
  },
  {
    id: 2,
    name: "Phan Ánh Dương",
    company: "VNG Corporation",
    role: "Talent Acquisition Specialist",
    avatar: "AD",
    avatarColor: "bg-orange-500",
    lastMessage:
      "Cảm ơn bạn đã nộp hồ sơ, chúng tôi sẽ phản hồi kết quả trong vòng 3 ngày làm việc.",
    time: "Hôm qua",
    unread: 0,
    online: false,
    replies: [
      "Chào bạn, kết quả đánh giá bài test chuyên môn của bạn rất xuất sắc. Chúng tôi rất mong muốn trao đổi chi tiết hơn.",
      "Dự án này sử dụng React và Node.js, quy mô team hiện tại là 12 người.",
      "Được chứ, chúng tôi rất linh hoạt về thời gian làm việc.",
    ],
  },
  {
    id: 3,
    name: "Nguyễn Hương Giang",
    company: "MoMo Fintech",
    role: "HR Partner",
    avatar: "HG",
    avatarColor: "bg-pink-600",
    lastMessage:
      "Bạn có tiện gửi lại bản thiết kế portfolio định dạng Figma link không?",
    time: "08/05",
    unread: 0,
    online: true,
    replies: [
      "Cảm ơn bạn đã gửi link Figma. Đội ngũ UI/UX đang đánh giá thiết kế của bạn.",
      "Chúng tôi thấy phong cách thiết kế của bạn rất hiện đại, rất khớp với định hướng sản phẩm của MoMo.",
    ],
  },
];

export default function Chat() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState(1);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({
    1: [
      {
        id: 1,
        sender: "them",
        text: "Xin chào Nguyễn Văn A, tôi là Tuấn đại diện tuyển dụng từ TechNova Solutions.",
        time: "10:00",
      },
      {
        id: 2,
        sender: "me",
        text: "Chào anh Tuấn, rất vui được kết nối với anh. Cảm ơn anh đã quan tâm đến hồ sơ của em.",
        time: "10:02",
      },
      {
        id: 3,
        sender: "them",
        text: "Chào bạn, hồ sơ của bạn rất ấn tượng! Bạn có thể phỏng vấn lúc 14:00 ngày mai không?",
        time: "10:15",
      },
    ],
    2: [
      {
        id: 1,
        sender: "me",
        text: "Dạ em chào anh/chị, em đã gửi hồ sơ ứng tuyển vị trí Fullstack Developer ạ.",
        time: "15:30",
      },
      {
        id: 2,
        sender: "them",
        text: "Cảm ơn bạn đã nộp hồ sơ, chúng tôi sẽ phản hồi kết quả trong vòng 3 ngày làm việc.",
        time: "15:45",
      },
    ],
    3: [
      {
        id: 1,
        sender: "them",
        text: "Chào Giang, mình thấy portfolio của bạn có nhiều thiết kế Mobile App rất đẹp.",
        time: "Hôm kia",
      },
      {
        id: 2,
        sender: "me",
        text: "Dạ em cảm ơn chị Giang nhiều ạ! Em có thể gửi thêm link Figma dự án thực tế cho chị xem nhé.",
        time: "Hôm kia",
      },
      {
        id: 3,
        sender: "them",
        text: "Bạn có tiện gửi lại bản thiết kế portfolio định dạng Figma link không?",
        time: "Hôm qua",
      },
    ],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeChannel = channels.find((c) => c.id === activeChannelId)!;

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannelId, isTyping]);

  // Đánh dấu đã đọc khi chọn kênh
  const handleSelectChannel = (id: number) => {
    setActiveChannelId(id);
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  // Gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "me",
      text: inputMessage,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Update messages
    const channelMsgs = messages[activeChannelId] || [];
    setMessages({
      ...messages,
      [activeChannelId]: [...channelMsgs, newMessage],
    });

    // Update last message in channel list
    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? { ...c, lastMessage: inputMessage, time: "Vừa xong" }
          : c,
      ),
    );

    setInputMessage("");

    // Giả lập HR gõ chữ phản hồi tự động sau 1.5 giây (UC-21)
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Lấy ngẫu nhiên câu phản hồi trong kho của kênh đó
      const autoReplies = activeChannel.replies;
      const responseText =
        autoReplies[Math.floor(Math.random() * autoReplies.length)] ||
        "Cảm ơn bạn đã phản hồi, tôi sẽ kiểm tra lại.";

      const replyMessage: Message = {
        id: Date.now() + 1,
        sender: "them",
        text: responseText,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prevMsgs) => ({
        ...prevMsgs,
        [activeChannelId]: [...(prevMsgs[activeChannelId] || []), replyMessage],
      }));

      setChannels((prev) =>
        prev.map((c) =>
          c.id === activeChannelId
            ? { ...c, lastMessage: responseText, time: "Vừa xong" }
            : c,
        ),
      );
    }, 1500);
  };

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-3xs transition-colors duration-150">
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* ── 1. Sidebar Trò chuyện (Danh sách liên hệ) ── */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Header tìm kiếm */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              Nhắn tin tuyển dụng (UC-21)
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Tìm người tuyển dụng, công ty..."
                className="w-full h-9 pl-9 pr-4 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* List Channels */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {channels.map((chan) => {
              const active = chan.id === activeChannelId;
              return (
                <div
                  key={chan.id}
                  onClick={() => handleSelectChannel(chan.id)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all ${
                    active
                      ? "bg-white dark:bg-slate-950 border-l-4 border-indigo-500 font-medium shadow-3xs"
                      : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-xl ${chan.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-3xs`}
                    >
                      {chan.avatar}
                    </div>
                    {chan.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    )}
                  </div>

                  {/* Info preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {chan.name}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        {chan.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate uppercase mt-0.5">
                      {chan.company}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 leading-snug">
                      {chan.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {chan.unread > 0 && (
                    <div className="shrink-0 flex items-center">
                      <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full border-none">
                        {chan.unread}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. Khu vực khung Chat (Màn hình tin nhắn) ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {/* Header của Khung chat đang mở */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 shadow-3xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${activeChannel.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-3xs`}
              >
                {activeChannel.avatar}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                    {activeChannel.name}
                  </h3>
                  <span className="flex items-center gap-0.5 text-[9px] text-slate-400 dark:text-slate-500">
                    <Circle
                      className={`w-1.5 h-1.5 ${activeChannel.online ? "fill-emerald-500 text-emerald-500" : "fill-slate-300 text-slate-300 dark:fill-slate-700 dark:text-slate-700"}`}
                    />
                    {activeChannel.online ? "Đang online" : "Offline"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-none">
                  {activeChannel.role} •{" "}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {activeChannel.company}
                  </strong>
                </p>
              </div>
            </div>

            {/* Quick action icons */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed"
                title="Tính năng nâng cao"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed"
                title="Tính năng nâng cao"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Thông tin chi tiết"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="grow overflow-y-auto p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
            {messages[activeChannelId]?.map((msg) => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[70%] ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {/* Bong bóng tin nhắn */}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs font-medium shadow-3xs leading-relaxed ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-550"}`}
                      >
                        <span>{msg.time}</span>
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hiệu ứng HR đang gõ phản hồi */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-3xs">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Nhà tuyển dụng đang nhập tin nhắn
                  </span>
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ô nhập tin nhắn */}
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
        </div>
      </div>
    </div>
  );
}
