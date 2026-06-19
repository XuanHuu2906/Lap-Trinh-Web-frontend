import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useVisiblePolling } from "@/hooks/useVisiblePolling";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";

// === TRANG THÔNG BÁO CỦA NHÀ TUYỂN DỤNG ===
// Hiển thị danh sách thông báo hệ thống (ứng viên mới, tin nhắn, đánh giá...)
// Hỗ trợ lọc: tất cả / chưa đọc / đã đọc
// Cho phép: đánh dấu đã đọc (từng cái hoặc tất cả), ẩn thông báo
// Polling + Realtime qua Supabase để cập nhật tự động

// Các bộ lọc hiển thị: all = tất cả, unread = chưa đọc, read = đã đọc
type FilterType = "all" | "unread" | "read";

// Tham số phân trang cho API thông báo (luôn lấy 50 bản ghi mới nhất)
const notificationParams = { page: 1, limit: 50 };

// Format thời gian tương đối bằng tiếng Việt
// Hiển thị "Vừa xong" nếu dưới 1 phút, "X phút trước", "X giờ trước", "X ngày trước"
// Trên 7 ngày thì hiển thị ngày tháng đầy đủ theo locale vi-VN
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

// Phân loại thông báo dựa trên nội dung type string
// Dùng keyword-matching để xác định loại: apply (ứng tuyển), message (tin nhắn), eval (đánh giá), system (hệ thống)
// Mỗi loại sẽ có icon tương ứng khi hiển thị
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

/**
 * Component trang thông báo
 * Hiển thị danh sách thông báo realtime, cho phép lọc và thao tác
 */
export function RecruiterNotificationsPage() {
  const { user } = useAuth();

  // Lấy dữ liệu cache từ service (nếu có) để hiển thị ngay lập tức tránh loading giật
  const cachedNotifications = getCachedNotifications(notificationParams);

  // notifications: danh sách thông báo gốc từ API (chưa lọc, chưa ẩn)
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    cachedNotifications?.data ?? [],
  );
  // filter: bộ lọc hiện tại (all / unread / read)
  const [filter, setFilter] = useState<FilterType>("all");
  // loading: trạng thái đang tải dữ liệu từ API lần đầu
  const [loading, setLoading] = useState(!cachedNotifications);
  // error: thông báo lỗi khi gọi API
  const [error, setError] = useState("");
  // hiddenIds: danh sách ID thông báo đã bị người dùng ẩn (soft-delete ở local)
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);

  // Hàm tải danh sách thông báo từ API
  // forceRefresh: bỏ qua cache và gọi API mới
  // options.showLoading: có hiển thị loading state không (tắt khi polling để tránh giật UI)
  // options.updateError: có cập nhật error state không (tắt khi polling)
  const loadNotifications = useCallback(async (
    forceRefresh = false,
    options: { showLoading?: boolean; updateError?: boolean } = {},
  ) => {
    const { showLoading = true, updateError = true } = options;

    try {
      if (showLoading) setLoading(true);
      if (updateError) setError("");

      const response = await notificationService.getNotifications(
        notificationParams,
        forceRefresh,
      );

      setNotifications(response.data);
    } catch (err) {
      if (updateError) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách thông báo",
        );
      } else {
        console.error("Loi polling thong bao:", err);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // useEffect: tải danh sách thông báo lần đầu khi component mount
  useEffect(() => {
    void loadNotifications(false);
  }, [loadNotifications]);

  // Polling định kỳ (2 phút / lần) khi tab đang active
  // Không hiển thị loading hay error trong quá trình polling để tránh giật UI
  useVisiblePolling(
    () =>
      loadNotifications(true, {
        showLoading: false,
        updateError: false,
      }),
    { intervalMs: 120_000 },
  );

  // Realtime subscription qua Supabase: cập nhật ngay lập tức khi có thay đổi trong DB
  // Chỉ active khi user là recruiter, lắng nghe bảng notifications theo user_id
  // Cleanup channel khi component unmount
  useEffect(() => {
    const client = supabase;
    if (user?.role !== "recruiter" || !user.id || !client) return;

    const channel = client
      .channel(`notifications-page-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void loadNotifications(true, {
            showLoading: false,
            updateError: false,
          });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [loadNotifications, user?.id, user?.role]);

  // visibleNotifications: danh sách thông báo đã loại bỏ các item bị ẩn (soft-delete)
  const visibleNotifications = useMemo(() => {
    return notifications.filter((item) => !hiddenIds.includes(item.id));
  }, [notifications, hiddenIds]);

  // filtered: danh sách thông báo đã qua bộ lọc (theo filter state)
  const filtered = useMemo(() => {
    return visibleNotifications.filter((item) => {
      if (filter === "unread") return !item.isRead;
      if (filter === "read") return item.isRead;
      return true;
    });
  }, [visibleNotifications, filter]);

  // unreadCount: số thông báo chưa đọc trong danh sách hiện tại (đã trừ các item ẩn)
  const unreadCount = visibleNotifications.filter((item) => !item.isRead).length;

  // Đánh dấu một thông báo là đã đọc
  // Optimistic update: cập nhật UI ngay, rollback nếu API thất bại
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

  // Đánh dấu tất cả thông báo là đã đọc
  // Optimistic update tương tự handleMarkAsRead
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

  // Ẩn một thông báo khỏi danh sách (soft-delete local, không gọi API xóa)
  const handleDeleteNotification = (id: number) => {
    setHiddenIds((prev) => [...prev, id]);
  };

  // Ẩn tất cả thông báo hiện có
  const handleClearAll = () => {
    setHiddenIds(visibleNotifications.map((item) => item.id));
  };

  // Chọn icon tương ứng với loại thông báo
  // apply = UserPlus (xanh), message = MessageSquare (tím), eval = Star (vàng), system = AlertCircle (xám)
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
      {/* Header: tiêu đề + nút "Đã đọc tất cả" và "Xóa tất cả" */}
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

        {/* Nút hàng loạt: chỉ hiện khi có thông báo */}
        {visibleNotifications.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={loading || unreadCount === 0}
              className="flex cursor-pointer items-center gap-1.5 rounded-sm border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Check className="h-4 w-4 text-emerald-500" />
              Đã đọc tất cả
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={loading}
              className="flex cursor-pointer items-center gap-1.5 rounded-sm border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Bộ lọc: Tất cả / Chưa đọc / Đã đọc + nút làm mới */}
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filter === "all"
            ? "bg-indigo-600 text-white shadow-3xs"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
        >
          Tất cả ({visibleNotifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filter === "unread"
            ? "bg-indigo-600 text-white shadow-3xs"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
        >
          Chưa đọc ({unreadCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter("read")}
          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filter === "read"
            ? "bg-indigo-600 text-white shadow-3xs"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
        >
          Đã đọc ({visibleNotifications.length - unreadCount})
        </button>

        {/* Nút làm mới thủ công */}
        <button
          type="button"
          onClick={() => void loadNotifications(true)}
          disabled={loading}
          className="ml-auto cursor-pointer rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Làm mới
        </button>
      </div>

      {/* Trạng thái loading */}
      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-3xs dark:border-slate-800 dark:bg-slate-900/80">
          <Bell className="mx-auto mb-3 h-10 w-10 animate-pulse text-slate-300" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Đang tải thông báo...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        // Empty state: không có thông báo nào
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-3xs dark:border-slate-800 dark:bg-slate-900/80">
          <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Không có thông báo nào
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Các thông báo mới về ứng tuyển và hội thoại sẽ được hiển thị tại đây.
          </p>
        </div>
      ) : (
        // Danh sách thông báo
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              // Click vào thẻ thông báo sẽ đánh dấu đã đọc (nếu chưa đọc)
              onClick={() => {
                if (!item.isRead) void handleMarkAsRead(item.id);
              }}
              className={`relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${item.isRead
                ? "border-slate-150 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
                : "border-indigo-150 bg-indigo-50/20 font-semibold text-slate-900 shadow-3xs dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-slate-100"
                }`}
            >
              {/* Dot pulse cho thông báo chưa đọc */}
              {!item.isRead && (
                <span className="absolute right-4 top-4 h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
              )}

              {/* Icon loại thông báo */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                {getIcon(item.type)}
              </div>

              {/* Nội dung thông báo: tiêu đề, thời gian, message */}
              <div className="flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight">
                    {item.title}
                  </h3>

                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {formatTime(item.createdAt)}
                  </span>

                  {/* Badge "Mới" cho thông báo chưa đọc */}
                  {!item.isRead && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                      <CheckCheck className="h-3 w-3" />
                      Mới
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.message}
                </p>
              </div>

              {/* Nút ẩn thông báo (xóa local) */}
              <div className="flex shrink-0 items-center self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(item.id);
                  }}
                  className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-950/30 dark:hover:text-red-300"
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
