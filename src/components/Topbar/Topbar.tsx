import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
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
  "/candidate/find-jobs": "Tìm việc làm",
  "/candidate/job-search": "Tìm việc làm",
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
  "/recruiter/settings": "Cài đặt doanh nghiệp",

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
    initials: "NT",
    email: "",
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

const ROLE_NOTIFICATION_PREVIEWS: Partial<
  Record<DashboardRole, TopbarNotification[]>
> = {
  admin: [
    {
      id: "admin-job-review",
      title: "Tin tuyển dụng cần duyệt",
      message: "Có tin tuyển dụng mới đang chờ kiểm duyệt nội dung.",
      timeLabel: "10 phút trước",
      isRead: false,
    },
  ],
  recruiter: [
    {
      id: "recruiter-application",
      title: "Hồ sơ ứng tuyển mới",
      message: "Một ứng viên vừa nộp hồ sơ vào tin tuyển dụng của bạn.",
      timeLabel: "2 phút trước",
      isRead: false,
    },
  ],
};

const formatNotificationTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

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
    role === "candidate" ? "/candidate/notifications" : `/${role}/notifications`;
  const matchedKey = Object.keys(PAGE_TITLES).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  const pageTitle = matchedKey ? PAGE_TITLES[matchedKey] : "Bảng điều khiển";
  const displayedNotifications =
    role === "candidate" ? notifications : ROLE_NOTIFICATION_PREVIEWS[role] ?? [];
  const hasUnreadNotifications = displayedNotifications.some(
    (item) => !item.isRead,
  );

  useEffect(() => {
    if (!isNotificationsOpen) return;

    if (role !== "candidate") {
      setIsNotificationsLoading(false);
      return;
    }

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
      } catch {
        if (isMounted) setNotifications([]);
      } finally {
        if (isMounted) setIsNotificationsLoading(false);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [isNotificationsOpen, role]);

  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-6 shadow-sm backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-8">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <span className="mb-1 block text-[10px] font-bold uppercase leading-none tracking-widest text-slate-400 dark:text-slate-500">
            {BREADCRUMBS[role]}
          </span>
          <h2 className="truncate text-base font-bold leading-none text-slate-900 dark:text-white">
            {pageTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <div className="relative">
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
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-3 w-88 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
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
                      <div
                        key={item.id}
                        className="border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              item.isRead
                                ? "bg-slate-300 dark:bg-slate-700"
                                : "bg-blue-600"
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

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsProfileOpen((open) => !open);
            }}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-800"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
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
            <div className="hidden min-w-0 text-left md:block">
              <span className="block max-w-40 truncate text-sm font-bold leading-4 text-slate-900 dark:text-white">
                {currentUser.name}
              </span>
              <span className="mt-0.5 block max-w-40 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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
              <div className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">
                    {currentUser.name}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {currentUser.email || currentUser.roleLabel}
                  </span>
                </div>
                <Link
                  to={currentUser.profilePath}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Hồ sơ cá nhân
                </Link>
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
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
