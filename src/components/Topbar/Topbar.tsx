import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { notificationService } from "../../services/notification.service";

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
  title: string;
  message: string;
  timeLabel: string;
  isRead: boolean;
};

interface TopbarProps {
  role: DashboardRole;
  pathname: string;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  user?: TopbarUser;
}

const PAGE_TITLES: Record<string, string> = {
  "/candidate": "Tổng quan",
  "/candidate/overview": "Tổng quan",
  "/candidate/find-jobs": "Tìm kiếm việc làm",
  "/candidate/job-search": "Tìm kiếm việc làm",
  "/candidate/applied-jobs": "Danh sách ứng tuyển",
  "/candidate/saved-jobs": "Việc làm đã lưu",
  "/candidate/chat": "Trò chuyện",
  "/candidate/cv-templates": "Mẫu CV",
  "/candidate/cv-builder": "Thiết kế CV",
  "/candidate/my-cvs": "Quản lý CV",
  "/candidate/notifications": "Thông báo cá nhân",
  "/candidate/settings": "Hồ sơ cá nhân",

  "/recruiter": "Tổng quan hoạt động",
  "/recruiter/overview": "Tổng quan hoạt động",
  "/recruiter/post-job": "Đăng tin tuyển dụng mới",
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
  candidate: "HIREARCH / Cổng ứng viên",
  recruiter: "HIREARCH / Nhà tuyển dụng",
  admin: "HIREARCH / Quản trị viên",
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
    name: "Admin Administrator",
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

export function Topbar({
  role,
  pathname,
  onOpenMobileSidebar,
  onLogout,
  user,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<TopbarNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const currentUser = user || fallbackUsers[role];
  const darkMode = theme === "dark";

  const notificationsPath =
    role === "candidate"
      ? "/candidate/notifications"
      : `/${role}/notifications`;

  const matchedKey = Object.keys(PAGE_TITLES).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );

  const pageTitle = matchedKey ? PAGE_TITLES[matchedKey] : "Bảng điều khiển";

  const displayedNotifications = notifications;

  const hasUnreadNotifications = displayedNotifications.some(
    (item) => !item.isRead,
  );

  useEffect(() => {
    if (!isNotificationsOpen) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        setIsNotificationsLoading(true);

        const response = await notificationService.getNotifications(
          { page: 1, limit: 5 },
          true,
        );

        if (isMounted) {
          setNotifications(
            response.data.map((item) => ({
              id: String(item.id),
              title: item.title,
              message: item.message,
              timeLabel: formatNotificationTime(item.createdAt),
              isRead: item.isRead,
            })),
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error);

        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setIsNotificationsLoading(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [isNotificationsOpen, role]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 transition-colors duration-150 dark:border-slate-800/80 dark:bg-slate-900 sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
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
        {role !== "admin" ? (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Tìm kiếm..."
              className="h-9 w-52 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-[13px] text-slate-700 outline-none transition-all focus:w-60 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-500" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(false);
              setIsNotificationsOpen((open) => !open);
            }}
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5 stroke-[1.8]" />

            {hasUnreadNotifications ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
            ) : null}
          </button>

          {isNotificationsOpen ? (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />

              <div className="absolute right-0 z-50 mt-3 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">
                    Thông báo
                  </span>

                  <Link
                    to={notificationsPath}
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                      <div
                        key={item.id}
                        className="border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800"
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

        <span className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsProfileOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
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
              <span className="block text-xs font-bold text-slate-800 dark:text-white">
                {currentUser.name}
              </span>

              <span className="mt-0.5 block max-w-40 truncate text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {currentUser.email || currentUser.roleLabel}
              </span>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {isProfileOpen ? (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />

              <div className="absolute right-0 z-50 mt-3 w-60 rounded-xl border border-slate-200/90 bg-white py-1.5 shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tài khoản hiện tại
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
                      to="/recruiter/settings?tab=contact"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <Settings className="h-4 w-4 text-slate-400" />
                      Thông tin liên hệ
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
                  Đăng xuất hệ thống
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}