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
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface Channel {
  id: number;
  name: string;
  avatar: string;
  avatarColor: string;
  position: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  replies: string[];
}

interface Message {
  id: number;
  sender: "me" | "them"; // 'me' is recruiter, 'them' is candidate
  text: string;
  time: string;
}

const INITIAL_CHANNELS: Channel[] = [
  {
    id: 1,
    name: "Nguyễn Văn Thái",
    position: "Ứng tuyển Senior Frontend Engineer",
    avatar: "NT",
    avatarColor: "bg-indigo-600",
    lastMessage:
      "Dạ em chào anh/chị, em đã gửi đầy đủ portfolio rồi ạ. Rất mong được phản hồi từ công ty.",
    time: "10:15",
    unread: 1,
    online: true,
    replies: [
      "Vâng ạ, em rất sẵn sàng phỏng vấn trực tiếp hoặc qua Zoom vào bất cứ thời gian nào thuận tiện cho công ty.",
      "Dự án React lớn nhất em từng làm có quy mô hơn 100 màn hình và phục vụ khoảng 50,000 active users hàng ngày.",
      "Dạ, em cảm ơn anh/chị đã phản hồi nhanh chóng! Em sẽ chuẩn bị kỹ lưỡng cho buổi hẹn phỏng vấn.",
    ],
  },
  {
    id: 2,
    name: "Trần Thị Mai",
    position: "Ứng tuyển Product Manager",
    avatar: "TM",
    avatarColor: "bg-rose-500",
    lastMessage:
      "Chào anh/chị, em muốn hỏi một chút về lộ trình phát triển sản phẩm của team mình được không ạ?",
    time: "Hôm qua",
    unread: 0,
    online: false,
    replies: [
      "Dạ, em hiểu rồi ạ. Với kinh nghiệm quản lý 3 năm tại Fintech, em tự tin có thể đồng hành cùng định hướng sắp tới của công ty.",
      "Cảm ơn những chia sẻ rất chi tiết của anh/chị ạ! Lộ trình này thực sự rất tiềm năng.",
      "Dạ vâng, em sẽ chuẩn bị slide thuyết trình ngắn về định vị sản phẩm cho buổi trao đổi tiếp theo.",
    ],
  },
  {
    id: 3,
    name: "Lê Hoàng Hải",
    position: "Ứng tuyển Senior Frontend Engineer",
    avatar: "LH",
    avatarColor: "bg-blue-600",
    lastMessage:
      "Dạ em đã nhận được thư mời phỏng vấn kỹ thuật từ HR, hẹn gặp anh chị vào chiều mai.",
    time: "08/05",
    unread: 0,
    online: true,
    replies: [
      "Vâng ạ, em đã chuẩn bị môi trường code sẵn sàng rồi ạ. Gặp anh/chị vào chiều mai ạ!",
      "Em có quen thuộc với NestJS ở backend nên việc phối hợp với team backend để tối ưu API là lợi thế của em.",
    ],
  },
  {
    id: 4,
    name: "Phạm Phương Anh",
    position: "Ứng tuyển HR Specialist",
    avatar: "PA",
    avatarColor: "bg-pink-600",
    lastMessage:
      "Em cảm ơn công ty đã tạo cơ hội, em gửi lại mẫu khảo sát văn hóa doanh nghiệp ở đây ạ.",
    time: "05/05",
    unread: 0,
    online: false,
    replies: [
      "Dạ vâng ạ, em luôn chú trọng việc kết nối nhân sự và xây dựng văn hóa chia sẻ trong công ty.",
      "Em có thể bắt đầu nhận việc ngay từ đầu tháng tới nếu có cơ hội được gia nhập đội ngũ.",
    ],
  },
];

export function RecruiterChatPage() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState(1);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({
    1: [
      {
        id: 1,
        sender: "them",
        text: "Xin chào quý công ty, em là Nguyễn Văn Thái, vừa nộp hồ sơ vào vị trí Senior Frontend Engineer ạ.",
        time: "09:30",
      },
      {
        id: 2,
        sender: "me",
        text: "Chào Thái, anh đã nhận được hồ sơ của em từ hệ thống HireArch. CV của em rất ấn tượng với nhiều kinh nghiệm React và Tailwind.",
        time: "09:45",
      },
      {
        id: 3,
        sender: "them",
        text: "Dạ em chào anh/chị, em đã gửi đầy đủ portfolio rồi ạ. Rất mong được phản hồi từ công ty.",
        time: "10:15",
      },
    ],
    2: [
      {
        id: 1,
        sender: "them",
        text: "Em chào HR ạ, em vừa ứng tuyển vị trí Product Manager. Em có gửi kèm link Case Study em đã làm.",
        time: "15:30",
      },
      {
        id: 2,
        sender: "me",
        text: "Cảm ơn Mai đã gửi thông tin. HR đã chuyển bài Case Study của em cho ban sản phẩm đánh giá nhé.",
        time: "15:45",
      },
      {
        id: 3,
        sender: "them",
        text: "Chào anh/chị, em muốn hỏi một chút về lộ trình phát triển sản phẩm của team mình được không ạ?",
        time: "Hôm qua",
      },
    ],
    3: [
      {
        id: 1,
        sender: "me",
        text: "Chào Hải, kết quả bài test thuật toán của em đạt 90/100 điểm. Anh muốn lên lịch phỏng vấn Technical Interview 1-1.",
        time: "03/05",
      },
      {
        id: 2,
        sender: "them",
        text: "Dạ tuyệt vời quá ạ! Em có thể sắp xếp phỏng vấn vào các buổi chiều từ 14:00 trở đi.",
        time: "04/05",
      },
      {
        id: 3,
        sender: "me",
        text: "Ok em, anh đặt lịch phỏng vấn lúc 15:00 ngày mai nhé. Link Zoom sẽ được hệ thống gửi tự động.",
        time: "05/05",
      },
      {
        id: 4,
        sender: "them",
        text: "Dạ em đã nhận được thư mời phỏng vấn kỹ thuật từ HR, hẹn gặp anh chị vào chiều mai.",
        time: "08/05",
      },
    ],
    4: [
      {
        id: 1,
        sender: "me",
        text: "Chào Phương Anh, em vui lòng hoàn thành bản khảo sát hành vi văn hóa trước khi phỏng vấn vòng 2 nhé.",
        time: "04/05",
      },
      {
        id: 2,
        sender: "them",
        text: "Em cảm ơn công ty đã tạo cơ hội, em gửi lại mẫu khảo sát văn hóa doanh nghiệp ở đây ạ.",
        time: "05/05",
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

    // Cập nhật danh sách tin nhắn của kênh hiện tại
    const channelMsgs = messages[activeChannelId] || [];
    setMessages({
      ...messages,
      [activeChannelId]: [...channelMsgs, newMessage],
    });

    // Cập nhật tin nhắn cuối trong danh sách kênh
    setChannels((prev) =>
      prev.map((c) =>
        c.id === activeChannelId
          ? { ...c, lastMessage: inputMessage, time: "Vừa xong" }
          : c,
      ),
    );

    setInputMessage("");

    // Giả lập ứng viên gõ chữ phản hồi tự động sau 1.5 giây (UC-21)
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Lấy ngẫu nhiên câu phản hồi trong kho của ứng viên đó
      const autoReplies = activeChannel.replies;
      const responseText =
        autoReplies[Math.floor(Math.random() * autoReplies.length)] ||
        "Dạ vâng ạ, em đã ghi nhận thông tin và sẽ chuẩn bị kỹ càng.";

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

  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="font-sans flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-3xs transition-colors duration-150">
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* ── 1. Sidebar Trò chuyện (Danh sách ứng viên liên hệ) ── */}
        <div className="w-85 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Header tìm kiếm */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Tìm ứng viên, vị trí ứng tuyển..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 dark:text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-350 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* List Channels */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy ứng viên phù hợp
              </div>
            ) : (
              filteredChannels.map((chan) => {
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
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate uppercase mt-0.5 leading-none">
                        {chan.position}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1.5 leading-snug">
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
              })
            )}
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-none uppercase tracking-wider text-xs">
                  {activeChannel.position}
                </p>
              </div>
            </div>

            {/* Quick action icons */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed"
                title="Tính năng phỏng vấn thoại"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-not-allowed"
                title="Tính năng phỏng vấn Video"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Thông tin ứng tuyển"
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

            {/* Hiệu ứng ứng viên đang gõ phản hồi */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-3xs">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    {activeChannel.name} đang nhập tin nhắn
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
                placeholder={`Nhập nội dung tin nhắn trao đổi với ứng viên ${activeChannel.name}...`}
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
