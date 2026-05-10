import { useState } from "react";
import {
  BriefcaseBusiness,
  Mail,
  Megaphone,
  Eye,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";

type NotifType = "recruitment" | "system";
type Tab = "all" | "unread" | "system" | "recruitment";

interface Notification {
  id: number;
  icon: React.ElementType;
  title: string;
  body: string;
  type: NotifType;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  {
    id: 1,
    icon: BriefcaseBusiness,
    title: "Cập nhật trạng thái ứng tuyển",
    body: "Hồ sơ ứng tuyển vị trí 'Senior Frontend Developer' của bạn tại TechCorp đã chuyển sang vòng Phỏng vấn kỹ thuật.",
    type: "recruitment",
    time: "10 phút trước",
    read: false,
  },
  {
    id: 2,
    icon: Mail,
    title: "Tin nhắn mới từ Nhà tuyển dụng",
    body: "Xin chào, chúng tôi muốn sắp xếp một buổi trao đổi ngắn vào chiều mai. Vui lòng xác nhận thời gian phù hợp.",
    type: "recruitment",
    time: "2 giờ trước",
    read: false,
  },
  {
    id: 3,
    icon: Megaphone,
    title: "Bảo trì hệ thống định kỳ",
    body: "Hệ thống sẽ tạm ngưng hoạt động từ 00:00 đến 04:00 Chủ Nhật tuần này để nâng cấp hiệu suất.",
    type: "system",
    time: "Hôm qua",
    read: false,
  },
  {
    id: 4,
    icon: Eye,
    title: "Nhà tuyển dụng đã xem hồ sơ",
    body: "GlobalTech Inc. vừa xem hồ sơ trực tuyến của bạn.",
    type: "recruitment",
    time: "2 ngày trước",
    read: true,
  },
  {
    id: 5,
    icon: ShieldCheck,
    title: "Xác thực tài khoản thành công",
    body: "Cảm ơn bạn đã xác minh địa chỉ email. Tài khoản của bạn hiện đã được kích hoạt đầy đủ tính năng.",
    type: "system",
    time: "1 tuần trước",
    read: true,
  },
];

const ICON_BG: Record<NotifType, string> = {
  recruitment: "bg-blue-100 text-blue-600",
  system: "bg-gray-100 text-gray-500",
};

const TYPE_BADGE: Record<NotifType, { label: string; cls: string }> = {
  recruitment: { label: "TUYỂN DỤNG", cls: "bg-blue-100 text-blue-600" },
  system: { label: "HỆ THỐNG", cls: "bg-gray-100 text-gray-500" },
};

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "system", label: "Hệ thống" },
  { key: "recruitment", label: "Tuyển dụng" },
];

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const filtered = notifs.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cập nhật mới nhất về hồ sơ và quy trình tuyển dụng của bạn.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline"
          >
            <CheckCheck size={15} />
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            {label}
            {key === "unread" && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            Không có thông báo nào.
          </div>
        )}
        {filtered.map((n) => {
          const Icon = n.icon;
          const badge = TYPE_BADGE[n.type];
          const iconCls = ICON_BG[n.type];
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50/70 ${!n.read ? "bg-blue-50/30" : ""}`}
            >
              {/* Icon circle */}
              <div
                className={`${iconCls} w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Icon size={18} />
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug mb-0.5 ${!n.read ? "font-semibold text-gray-900" : "font-medium text-gray-800"}`}
                >
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">
                  {n.body}
                </p>
                <span
                  className={`${badge.cls} text-[10px] font-bold px-2 py-0.5 rounded-full`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Time + unread dot */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-[11px] text-gray-400 whitespace-nowrap">
                  {n.time}
                </p>
                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
