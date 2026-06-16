import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";
import { useVisiblePolling } from "../../hooks/useVisiblePolling";
import { notificationService, type NotificationItem } from "../../services/notification.service";

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

const getPriority = (type: string): "high" | "normal" => {
  const lower = type.toLowerCase();
  if (
    lower.includes("alert") ||
    lower.includes("report") ||
    lower.includes("warn") ||
    lower.includes("reject") ||
    lower.includes("banned")
  ) {
    return "high";
  }
  return "normal";
};

const getNotificationPath = (
  relatedType: string | null,
  relatedId: number | null,
  type: string
): string => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("job")) return "/admin/jobs";
  if (lowerType.includes("user") || lowerType.includes("account")) return "/admin/system";
  if (lowerType.includes("template")) return "/admin/templates";
  if (relatedType === "job") return "/admin/jobs";
  if (relatedType === "cv") return "/admin/templates";
  if (relatedType === "application") return "/admin/jobs";
  return "/admin/dashboard";
};

const getNotificationIcon = (type: string) => {
  const lower = type.toLowerCase();
  if (lower.includes("job")) return Briefcase;
  if (lower.includes("user") || lower.includes("account")) return Users;
  if (lower.includes("template")) return FileText;
  return AlertTriangle;
};

export const AdminNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 5;

  const loadNotifications = useCallback(async (
    forceRefresh = false,
    options: { showLoading?: boolean; updateError?: boolean } = {},
  ) => {
    const { showLoading = true, updateError = true } = options;

    try {
      if (showLoading) setLoading(true);
      if (updateError) setError("");

      const response = await notificationService.getNotifications(
        { page: 1, limit: 100 },
        forceRefresh,
      );

      setNotifications(response.data);
    } catch (err) {
      if (updateError) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách thông báo"
        );
      } else {
        console.error("Lỗi tự động tải thông báo:", err);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications(false);
  }, [loadNotifications]);

  useVisiblePolling(
    () =>
      loadNotifications(true, {
        showLoading: false,
        updateError: false,
      }),
    { intervalMs: 120_000 }
  );

  useEffect(() => {
    const client = supabase;
    if (user?.role !== "admin" || !user.id || !client) return;

    const channel = client
      .channel(`admin-notifications-page-${user.id}`)
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

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.isRead).length;
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    return filter === "unread"
      ? notifications.filter((item) => !item.isRead)
      : notifications;
  }, [notifications, filter]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(visibleNotifications.length / pageSize));
  }, [visibleNotifications, pageSize]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNotifications = useMemo(() => {
    return visibleNotifications.slice(startIndex, startIndex + pageSize);
  }, [visibleNotifications, startIndex, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleMarkAsRead = async (id: number) => {
    const old = notifications;
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error(err);
      setNotifications(old);
      setError("Không thể đánh dấu thông báo đã đọc.");
    }
  };

  const handleMarkAllAsRead = async () => {
    const old = notifications;
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error(err);
      setNotifications(old);
      setError("Không thể đánh dấu tất cả thông báo đã đọc.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-pointer border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                THÔNG BÁO QUẢN TRỊ
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5 ml-11">
            Chỉ hiển thị thông tin quan trọng hoặc cần quản trị viên xử lý.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={unreadCount > 0 ? "warning" : "secondary"}>
            {unreadCount} chưa đọc
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
            className="h-8 text-[11px] font-bold cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-650 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600"
                  : "bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600"
                  : "bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Chưa đọc
            </button>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {visibleNotifications.length} thông báo
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="py-14 text-center">
              <div className="relative h-10 w-10 mx-auto mb-3">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Đang tải danh sách thông báo...
              </p>
            </div>
          ) : visibleNotifications.length > 0 ? (
            paginatedNotifications.map((item) => {
              const Icon = getNotificationIcon(item.type);
              const priority = getPriority(item.type);

              return (
                <div
                  key={item.id}
                  className={`p-5 transition-colors ${
                    !item.isRead ? "bg-indigo-50/40 dark:bg-indigo-950/20" : "bg-white dark:bg-transparent"
                  } hover:bg-slate-50 dark:hover:bg-slate-800/50`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 ${
                          priority === "high"
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60 text-amber-600 dark:text-amber-300"
                            : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                            {item.title}
                          </h2>
                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-indigo-650 animate-pulse" />
                          )}
                          {priority === "high" && (
                            <Badge variant="warning">Cần xử lý</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-2">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(item.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:pt-1">
                      {!item.isRead && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleMarkAsRead(item.id)}
                          className="h-8 text-[11px] font-bold cursor-pointer"
                        >
                          Đã đọc
                        </Button>
                      )}
                      <Link
                        to={getNotificationPath(item.relatedType, item.relatedId, item.type)}
                        onClick={() => {
                          if (!item.isRead) void handleMarkAsRead(item.id);
                        }}
                      >
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Mở trang
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-14 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Không có thông báo chưa đọc
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Các thông báo quan trọng đã được xử lý.
              </p>
            </div>
          )}
        </div>

        {!loading && visibleNotifications.length > pageSize && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Hiển thị {startIndex + 1}-
              {Math.min(startIndex + pageSize, visibleNotifications.length)} trên{" "}
              {visibleNotifications.length} thông báo
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7 border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-7 w-7 text-[10px] font-bold cursor-pointer ${
                      currentPage === pageNumber
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-650"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="h-7 w-7 border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
