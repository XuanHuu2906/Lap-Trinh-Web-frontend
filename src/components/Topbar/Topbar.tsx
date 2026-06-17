import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useVisiblePolling } from "../../hooks/useVisiblePolling";
import {
  notificationService,
  type NotificationItem,
} from "../../services/notification.service";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";

type DashboardRole = "candidate" | "recruiter" | "admin";

type TopbarUser = {
  name: string;
  roleLabel: string;
  initials: string;
  email: string;
  profilePath: string;
  avatarUrl?: string | null;
};

type TopbarNotification = {
  id: string;
  rawId: number;
  type: string;
  title: string;
  message: string;
  timeLabel: string;
  isRead: boolean;
  relatedType?: string | null;
  relatedId?: number | null;
};

interface TopbarProps {
  role: DashboardRole;
  pathname: string;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  user?: TopbarUser;
  isSidebarCollapsed?: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  "/candidate": "Tổng quan",
  "/candidate/overview": "Tổng quan",
  "/candidate/find-jobs": "Tìm việc làm",
  "/candidate/job-search": "Tìm việc làm",
  "/candidate/jobs": "Chi tiết việc làm",
  "/candidate/companies": "Hồ sơ doanh nghiệp",
  "/candidate/applied-jobs": "Đã ứng tuyển",
  "/candidate/saved-jobs": "Việc đã lưu",
  "/candidate/chat": "Trò chuyện",
  "/candidate/cv-templates": "Mẫu CV",
  "/candidate/cv-builder": "Tạo CV",
  "/candidate/my-cvs": "CV của tôi",
  "/candidate/notifications": "Thông báo",
  "/candidate/settings": "Hồ sơ cá nhân",

  "/recruiter": "Tổng quan",
  "/recruiter/overview": "Tổng quan",
  "/recruiter/post-job": "Đăng tin tuyển dụng",
  "/recruiter/manage-jobs": "Quản lý tin tuyển dụng",
  "/recruiter/candidates": "Quản lý ứng viên",
  "/recruiter/chat": "Trò chuyện",
  "/recruiter/notifications": "Thông báo",
  "/recruiter/settings": "Cài đặt hệ thống",

  "/admin": "Tổng quan hệ thống",
  "/admin/dashboard": "Tổng quan hệ thống",
  "/admin/jobs": "Quản lý tuyển dụng",
  "/admin/templates": "Quản lý mẫu CV",
  "/admin/system": "Quản lý tài khoản",
  "/admin/activity-logs": "Nhật ký hệ thống",
  "/admin/notifications": "Thông báo quản trị",
};

const BREADCRUMBS: Record<DashboardRole, string> = {
  candidate: "HireArch / Cổng ứng viên",
  recruiter: "HireArch / Nhà tuyển dụng",
  admin: "HireArch / Quản trị viên",
};

const fallbackUsers: Record<DashboardRole, TopbarUser> = {
  candidate: {
    name: "Ứng viên",
    roleLabel: "Ứng viên",
    initials: "UV",
    email: "",
    profilePath: "/candidate/settings",
  },
  recruiter: {
    name: "Nhà tuyển dụng",
    roleLabel: "HR Manager",
    initials: "NTD",
    email: "recruiter@hirearch.com",
    profilePath: "/recruiter/settings",
  },
  admin: {
    name: "Admin",
    roleLabel: "Super Admin",
    initials: "AD",
    email: "admin@hirearch.com",
    profilePath: "/admin/system",
  },
};

const formatNotificationTime = (value: string) => {
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
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const mapTopbarNotifications = (
  items: NotificationItem[],
): TopbarNotification[] =>
  items.map((item) => ({
    id: String(item.id),
    rawId: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    timeLabel: formatNotificationTime(item.createdAt),
    isRead: item.isRead,
    relatedType: item.relatedType,
    relatedId: item.relatedId,
  }));

const resolveNotificationLink = (
  role: DashboardRole,
  notification: TopbarNotification,
): string | null => {
  const { type, relatedType, relatedId } = notification;

  if (role === "admin") {
    if (type === "job_pending_review") return "/admin/jobs";
    if (type === "new_recruiter_account") return "/admin/system";
    return "/admin/notifications";
  }

  if (role === "recruiter") {
    if (type === "new_applicant" && relatedType === "application" && relatedId)
      return `/recruiter/candidates?applicationId=${relatedId}`;
    if (type === "new_applicant") return "/recruiter/candidates";
    return "/recruiter/notifications";
  }

  // candidate
  if (type === "feedback_received") return "/candidate/applied-jobs";
  return "/candidate/notifications";
};

export function Topbar({
  role,
  pathname,
  onOpenMobileSidebar,
  onLogout,
  user,
  isSidebarCollapsed = false,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        isNotificationsOpen &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen, isNotificationsOpen]);

  const [notifications, setNotifications] = useState<TopbarNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const currentUser = user || fallbackUsers[role];
  const darkMode = theme === "dark";

  const notificationsPath =
    role === "candidate"
      ? "/candidate/notifications"
      : `/${role}/notifications`;

  const matchedKey = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`));

  const pageTitle = matchedKey ? PAGE_TITLES[matchedKey] : "Bảng điều khiển";

  const displayedNotifications = notifications;

  const hasUnreadNotifications =
    unreadNotificationCount > 0 ||
    displayedNotifications.some((item) => !item.isRead);

  const handleNotificationClick = async (notification: TopbarNotification) => {
    setIsNotificationsOpen(false);

    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadNotificationCount((count) => Math.max(count - 1, 0));

      try {
        await notificationService.markAsRead(notification.rawId);
      } catch (error) {
        console.error("Lỗi đánh dấu thông báo đã đọc:", error);
      }
    }

    const link = resolveNotificationLink(role, notification);
    if (link) navigate(link);
  };

  const loadUnreadNotificationCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount(true);
      setUnreadNotificationCount(response.data.count);
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo chưa đọc:", error);
    }
  }, []);

  useVisiblePolling(
    loadUnreadNotificationCount,
    {
      enabled: !isNotificationsOpen,
      intervalMs: 120_000,
      runImmediately: true,
    },
  );

  const loadTopbarNotifications = useCallback(async () => {
    setIsNotificationsLoading(true);

    try {
      const response = await notificationService.getNotifications(
        { page: 1, limit: 10 },
        true,
      );
      const unreadResponse = await notificationService.getUnreadCount(true);

      setNotifications(mapTopbarNotifications(response.data));
      setUnreadNotificationCount(unreadResponse.data.count);
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
      setNotifications([]);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!authUser?.id || !client) return;

    const channel = client
      .channel(`notifications-topbar-${authUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${authUser.id}`,
        },
        () => {
          void loadUnreadNotificationCount();
          if (isNotificationsOpen) void loadTopbarNotifications();
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [
    authUser?.id,
    isNotificationsOpen,
    loadTopbarNotifications,
    loadUnreadNotificationCount,
  ]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setIsNotificationsLoading(true);
        const response = await notificationService.getNotifications(
          { page: 1, limit: 10 },
          true,
        );
        const unreadResponse = await notificationService.getUnreadCount(true);

        if (isMounted) {
          setNotifications(mapTopbarNotifications(response.data));
          setUnreadNotificationCount(unreadResponse.data.count);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);

        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) setIsNotificationsLoading(false);
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [isNotificationsOpen]);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 flex h-17 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 shadow-sm backdrop-blur transition-[left,background-color,border-color] duration-200 dark:border-slate-800 dark:bg-slate-900/95 sm:px-8 ${
        isSidebarCollapsed ? "lg:left-20" : "lg:left-65"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <span className="mb-1 block text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400 dark:text-slate-500">
            {BREADCRUMBS[role]}
          </span>

          <h2 className="text-base font-bold leading-none text-slate-900 dark:text-white">
            {pageTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title={
            darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
          }
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(false);
              setIsNotificationsOpen((open) => !open);
            }}
            className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5 stroke-[1.8]" />

            {hasUnreadNotifications ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <>
              <div className="absolute right-0 z-50 mt-3 w-88 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Thông báo
                  </span>

                  <Link
                    to={notificationsPath}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-600 dark:text-blue-400"
                  >
                    Xem tất cả
                  </Link>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isNotificationsLoading ? (
                    <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                      Đang tải thông báo...
                    </div>
                  ) : displayedNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      Chưa có thông báo nào.
                    </div>
                  ) : (
                    displayedNotifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                          item.isRead ? "" : "bg-indigo-50/40 dark:bg-indigo-950/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              item.isRead
                                ? "bg-slate-300 dark:bg-slate-700"
                                : "bg-indigo-500"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {item.message}
                            </p>

                            <span className="mt-1.5 block text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                              {item.timeLabel}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsProfileOpen((open) => !open);
            }}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-800"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
              <span>{currentUser.initials}</span>

              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="hidden text-left leading-none md:block">
              {role === "admin" ? (
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                  ADMIN
                </span>
              ) : (
                <>
                  <span className="block text-xs font-bold text-slate-800 dark:text-white">
                    {currentUser.name}
                  </span>

                  <span className="mt-0.5 block max-w-40 truncate text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {currentUser.email || currentUser.roleLabel}
                  </span>
                </>
              )}
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {isProfileOpen ? (
            <>
              <div className="absolute right-0 z-50 mt-3 w-60 rounded-xl border border-slate-200/90 bg-white py-1.5 shadow-md dark:border-slate-800 dark:bg-slate-900">
                {role === "admin" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    Đăng xuất
                  </button>
                ) : (
                  <>
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {currentUser.name}
                      </span>

                      <span className="mt-0.5 block truncate text-xs font-bold text-slate-700 dark:text-white">
                        {currentUser.email || currentUser.name}
                      </span>
                    </div>

                    {role === "recruiter" ? (
                      <>
                        <Link
                          to="/recruiter/settings?tab=company"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <User className="h-4 w-4 text-slate-400" />
                          Hồ sơ công ty
                        </Link>

                        <Link
                          to="/recruiter/settings?tab=password"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Settings className="h-4 w-4 text-slate-400" />
                          Đổi mật khẩu
                        </Link>
                      </>
                    ) : (
                      <Link
                        to={currentUser.profilePath}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Thông tin cá nhân
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
