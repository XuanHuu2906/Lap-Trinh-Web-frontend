import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  UserPlus,
  MessageSquare,
  AlertCircle,
  Star,
  CheckCheck,
} from "lucide-react";
import {
  getCachedNotifications,
  notificationService,
  type NotificationItem,
} from "@/services/notification.service";

type FilterType = "all" | "unread" | "read";

const notificationParams = { page: 1, limit: 50 };

const formatTime = (value: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getNotificationType = (
  type: string,
): "apply" | "message" | "system" | "eval" => {
  const lowerType = type.toLowerCase();

  if (
    lowerType.includes("application") ||
    lowerType.includes("applicant") ||
    lowerType.includes("apply") ||
    lowerType.includes("job")
  ) {
    return "apply";
  }

  if (
    lowerType.includes("message") ||
    lowerType.includes("chat") ||
    lowerType.includes("conversation")
  ) {
    return "message";
  }

  if (
    lowerType.includes("evaluation") ||
    lowerType.includes("evaluate") ||
    lowerType.includes("feedback") ||
    lowerType.includes("rating")
  ) {
    return "eval";
  }

  return "system";
};

export function RecruiterNotificationsPage() {
  const cachedNotifications = getCachedNotifications(notificationParams);

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    cachedNotifications?.data ?? [],
  );
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(!cachedNotifications);
  const [error, setError] = useState("");
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);

  const loadNotifications = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getNotifications(
        notificationParams,
        forceRefresh,
      );

      setNotifications(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách thông báo",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications(false);
  }, []);

  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => !hiddenIds.includes(item.id));
  }, [notifications, hiddenIds]);

  const filtered = useMemo(() => {
    return visibleNotifications.filter((item) => {
      if (filter === "unread") return !item.isRead;
      if (filter === "read") return item.isRead;
      return true;
    });
  }, [visibleNotifications, filter]);

  const unreadCount = visibleNotifications.filter((item) => !item.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    const oldNotifications = notifications;

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      setNotifications(oldNotifications);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đánh dấu thông báo đã đọc",
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const oldNotifications = notifications;

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true })),
    );

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      setNotifications(oldNotifications);
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đánh dấu tất cả thông báo đã đọc",
      );
    }
  };

  const handleDeleteNotification = (id: number) => {
    setHiddenIds((prev) => [...prev, id]);
  };

  const handleClearAll = () => {
    setHiddenIds(visibleNotifications.map((item) => item.id));
  };

  const getIcon = (type: string) => {
    switch (getNotificationType(type)) {
      case "apply":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case "eval":
        return <Star className="h-4 w-4 fill-amber-500 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8 text-left">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2.5 text-[26px] font-bold leading-tight text-slate-900 dark:text-white">
            <Bell className="h-7 w-7 text-indigo-600" />
            Thông báo hệ thống
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Theo dõi các cập nhật mới về ứng viên, tin nhắn và hoạt động tuyển dụng.
          </p>
        </div>

        {visibleNotifications.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={loading || unreadCount === 0}
              className="flex cursor-pointer items-center gap-1.5 rounded-sm border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4 text-emerald-500" />
              Đã đọc tất cả
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={loading}
              className="flex cursor-pointer items-center gap-1.5 rounded-sm border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Xóa khỏi màn hình
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-indigo-600 text-white shadow-3xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả ({visibleNotifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "unread"
              ? "bg-indigo-600 text-white shadow-3xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("read")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            filter === "read"
              ? "bg-indigo-600 text-white shadow-3xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Đã đọc ({visibleNotifications.length - unreadCount})
        </button>

        <button
          type="button"
          onClick={() => void loadNotifications(true)}
          disabled={loading}
          className="ml-auto cursor-pointer rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-3xs">
          <Bell className="mx-auto mb-3 h-10 w-10 animate-pulse text-slate-300" />
          <p className="text-sm font-bold text-slate-800">
            Đang tải thông báo...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-3xs">
          <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-800">
            Không có thông báo nào
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Các thông báo mới về ứng tuyển và hội thoại sẽ được hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) void handleMarkAsRead(item.id);
              }}
              className={`relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
                item.isRead
                  ? "border-slate-150 bg-white text-slate-700"
                  : "border-indigo-150 bg-indigo-50/20 font-semibold text-slate-900 shadow-3xs"
              }`}
            >
              {!item.isRead && (
                <span className="absolute right-4 top-4 h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
              )}

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-800">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight">
                    {item.title}
                  </h3>

                  <span className="text-[10px] font-medium text-slate-400">
                    {formatTime(item.createdAt)}
                  </span>

                  {!item.isRead && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                      <CheckCheck className="h-3 w-3" />
                      Mới
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {item.message}
                </p>
              </div>

              <div className="flex shrink-0 items-center self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(item.id);
                  }}
                  className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Ẩn thông báo khỏi màn hình"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}