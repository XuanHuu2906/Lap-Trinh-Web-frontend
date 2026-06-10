import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CheckCheck,
  Mail,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import {
  getCachedNotifications,
  notificationService,
  type NotificationItem,
} from "@/services/notification.service";

type Tab = "all" | "unread" | "system" | "recruitment";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc" },
  { key: "system", label: "Hệ thống" },
  { key: "recruitment", label: "Tuyển dụng" },
];

const getIcon = (type: string) => {
  if (type.includes("applicant") || type.includes("application")) {
    return BriefcaseBusiness;
  }
  if (type.includes("feedback")) return Mail;
  if (type.includes("system")) return ShieldCheck;
  return Megaphone;
};

const isRecruitmentType = (type: string) =>
  type.includes("applicant") ||
  type.includes("application") ||
  type.includes("feedback") ||
  type.includes("job");

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function Notifications() {
  const notificationParams = { page: 1, limit: 50 };
  const cachedNotifications = getCachedNotifications(notificationParams);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    cachedNotifications?.data ?? [],
  );
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isLoading, setIsLoading] = useState(!cachedNotifications);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        if (!getCachedNotifications(notificationParams)) {
          setIsLoading(true);
        }
        setError(null);

        const response =
          await notificationService.getNotifications(notificationParams);

        if (isMounted) {
          setNotifications(response.data);
        }
      } catch {
        if (isMounted) {
          setError("Không thể tải thông báo.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !item.isRead;
      if (activeTab === "system") return !isRecruitmentType(item.type);
      return isRecruitmentType(item.type);
    });
  }, [activeTab, notifications]);

  const markRead = async (id: number) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );

    try {
      await notificationService.markAsRead(id);
    } catch {
      setError("Không thể đánh dấu thông báo đã đọc.");
    }
  };

  const markAllRead = async () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );

    try {
      await notificationService.markAllAsRead();
    } catch {
      setError("Không thể đánh dấu tất cả thông báo đã đọc.");
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
            Thông báo
          </h1>
          <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">
            Cập nhật mới nhất về hồ sơ và quá trình ứng tuyển của bạn.
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="flex h-10 items-center gap-2 bg-[#0f1f3d] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a2f52] dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <CheckCheck className="h-4 w-4" />
            ĐÁNH DẤU ĐÃ ĐỌC
          </button>
        ) : null}
      </div>

      <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === key
                ? "border-blue-600 text-blue-600 dark:border-indigo-500 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {label}
            {key === "unread" && unreadCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="px-6 py-10 text-sm text-slate-500 dark:text-slate-400">
            Đang tải thông báo...
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-sm text-red-500">{error}</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Bell className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Không có thông báo nào.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const Icon = getIcon(item.type);
            const recruitment = isRecruitmentType(item.type);

            return (
              <button
                key={item.id}
                onClick={() => markRead(item.id)}
                className={`flex w-full gap-4 border-b border-slate-100 px-6 py-5 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${
                  !item.isRead ? "bg-blue-50/40 dark:bg-indigo-950/20" : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    recruitment
                      ? "bg-blue-50 text-blue-600 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm leading-snug ${
                        item.isRead
                          ? "font-semibold text-slate-700 dark:text-slate-200"
                          : "font-bold text-slate-950 dark:text-white"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                      {recruitment ? "Tuyển dụng" : "Hệ thống"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.message}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="whitespace-nowrap text-[11px] text-slate-400">
                    {formatTime(item.createdAt)}
                  </span>
                  {!item.isRead ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
