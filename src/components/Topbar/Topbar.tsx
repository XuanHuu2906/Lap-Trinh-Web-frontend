import { useState } from "react";
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

type DashboardRole = "candidate" | "recruiter" | "admin";

type TopbarUser = {
  name: string;
  roleLabel: string;
  initials: string;
  email: string;
  profilePath: string;
  avatarUrl?: string | null;
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
  "/recruiter/settings": "Cài đặt doanh nghiệp",

  "/admin": "Tổng quan hệ thống",
  "/admin/dashboard": "Tổng quan hệ thống",
  "/admin/jobs": "Quản lý tuyển dụng",
  "/admin/templates": "Quản lý mẫu CV",
  "/admin/system": "Quản lý tài khoản",
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
    name: "Nguyễn Văn Recruiter",
    roleLabel: "HR Manager",
    initials: "NR",
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

export function Topbar({
  role,
  pathname,
  onOpenMobileSidebar,
  onLogout,
  user,
}: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const currentUser = user || fallbackUsers[role];
  const darkMode = theme === "dark";
  const matchedKey = Object.keys(PAGE_TITLES).find(
    (key) => pathname === key || pathname.startsWith(`${key}/`),
  );
  const pageTitle = matchedKey ? PAGE_TITLES[matchedKey] : "Bảng điều khiển";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 transition-colors duration-150 dark:border-slate-800/80 dark:bg-slate-900 sm:px-8">
      <div className="flex items-center gap-4">
        <button
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

        <Link
          to={role === "candidate" ? "/candidate/notifications" : `/${role}/notifications`}
          className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell className="h-5 w-5 stroke-[1.8]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
        </Link>

        <span className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                currentUser.initials
              )}
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
              <div className="absolute right-0 z-50 mt-3 w-56 rounded-xl border border-slate-200/90 bg-white py-1.5 shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tài khoản hiện tại
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-slate-700 dark:text-white">
                    {currentUser.email || currentUser.name}
                  </span>
                </div>

                <Link
                  to={currentUser.profilePath}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Thông tin cá nhân
                </Link>

                {role === "recruiter" ? (
                  <Link
                    to="/recruiter/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Thiết lập tài khoản
                  </Link>
                ) : null}

                <button
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