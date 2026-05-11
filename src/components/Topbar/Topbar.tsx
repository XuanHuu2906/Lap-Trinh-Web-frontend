import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  User,
  LogOut,
  Search,
  Settings,
} from "lucide-react";

interface TopbarProps {
  role: "candidate" | "recruiter" | "admin";
  pathname: string;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const PAGE_TITLES: Record<string, string> = {
  "/candidate": "Tổng quan",
  "/candidate/overview": "Tổng quan",
  "/candidate/find-jobs": "Tìm kiếm việc làm (UC-03)",
  "/candidate/applied-jobs": "Danh sách ứng tuyển",
  "/candidate/saved-jobs": "Việc làm đã lưu (UC-09)",
  "/candidate/chat": "Nhắn tin tuyển dụng (UC-21)",
  "/candidate/create-cv": "Thiết lập mẫu CV (UC-05)",
  "/candidate/cv-templates": "Thiết lập mẫu CV (UC-05)",
  "/candidate/cv-builder": "Thiết kế CV (UC-05)",
  "/candidate/my-cvs": "Quản lý CV",
  "/candidate/notifications": "Thông báo cá nhân",

  "/recruiter": "Tổng quan hoạt động",
  "/recruiter/post-job": "Đăng tin tuyển dụng mới",
  "/recruiter/manage-jobs": "Quản lý tin tuyển dụng",
  "/recruiter/candidates": "Quản lý ứng tuyển viên",
  "/recruiter/settings": "Cài đặt doanh nghiệp",

  "/admin": "Tổng quan hệ thống",
  "/admin/dashboard": "Tổng quan hệ thống",
  "/admin/jobs": "Quản lý tuyển dụng",
  "/admin/templates": "Quản lý mẫu thiết kế CV",
  "/admin/system": "Quản lý tài khoản",
};

const BREADCRUMBS: Record<string, string> = {
  candidate: "HIREARCH / CỔNG ỨNG VIÊN",
  recruiter: "HIREARCH / NHÀ TUYỂN DỤNG",
  admin: "HIREARCH / QUẢN TRỊ VIÊN",
};

const USERS_MOCK = {
  candidate: {
    name: "Nguyễn Văn A",
    role: "Ứng viên",
    initials: "NA",
    email: "nguyenvana@gmail.com",
    profilePath: "/candidate/my-cvs",
  },
  recruiter: {
    name: "Nguyễn Văn Recruiter",
    role: "HR Manager",
    initials: "NR",
    email: "recruiter@technova.com",
    profilePath: "/recruiter/settings",
  },
  admin: {
    name: "Admin Administrator",
    role: "SUPER_ADMIN",
    initials: "AD",
    email: "admin@hirearch.com",
    profilePath: "/admin/system",
  },
};

export const Topbar: React.FC<TopbarProps> = ({
  role,
  pathname,
  onOpenMobileSidebar,
  onLogout,
  darkMode,
  setDarkMode,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const user = USERS_MOCK[role];

  // Tìm kiếm tiêu đề phù hợp
  const matchedKey = Object.keys(PAGE_TITLES).find(
    (key) => pathname === key || pathname.startsWith(key + "/"),
  );
  const pageTitle = matchedKey ? PAGE_TITLES[matchedKey] : "Bảng điều khiển";

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 sm:px-8 flex items-center justify-between shrink-0 z-30 sticky top-0 transition-colors duration-150">
      {/* Left: Hamburger (mobile) & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none mb-1">
            {BREADCRUMBS[role]}
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right: Actions, Theme toggle, Notification & Account */}
      <div className="flex items-center gap-4">
        {/* Search Bar for Recruiter and Candidate (Desktop only) */}
        {role !== "admin" && (
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Tìm kiếm..."
              className="h-8 pl-9 pr-4 border border-slate-200 dark:border-slate-800 text-[13px] rounded-lg w-48 focus:w-56 outline-none focus:border-indigo-500 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 transition-all"
            />
          </div>
        )}

        {/* Theme Toggle (Sáng / Tối) */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={
            darkMode
              ? "Chuyển sang giao diện Sáng"
              : "Chuyển sang giao diện Tối"
          }
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg rounded-xl py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-slate-800 dark:text-white">
                    Thông báo mới
                  </p>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                    3 chưa đọc
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[
                    {
                      text: "Cập nhật trạng thái phỏng vấn cho vị trí Senior Frontend Engineer",
                      time: "5 phút trước",
                    },
                    {
                      text: "Lịch hẹn phỏng vấn trực tuyến lúc 14:00 ngày mai",
                      time: "1 giờ trước",
                    },
                    {
                      text: "Tin tuyển dụng bạn lưu trữ đã được cập nhật mức lương mới",
                      time: "3 giờ trước",
                    },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <p className="text-[12px] text-slate-700 dark:text-slate-350 leading-snug">
                        {n.text}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-550 mt-1">
                        {n.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to={role === "candidate" ? "/candidate/notifications" : "#"}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[12px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <span className="h-6 w-px bg-slate-200 dark:bg-slate-850"></span>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
              {user.initials}
            </div>
            <div className="hidden md:block text-left leading-none">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                {user.name}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold tracking-wider mt-0.5 block uppercase">
                {user.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              ></div>
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md rounded-xl py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                    Tài khoản hiện tại
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-white block truncate mt-0.5">
                    {user.email}
                  </span>
                </div>

                <Link
                  to={user.profilePath}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Thông tin cá nhân
                </Link>

                {role === "recruiter" && (
                  <Link
                    to="/recruiter/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Thiết lập tài khoản
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-slate-100 dark:border-slate-800 text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Đăng xuất hệ thống
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
