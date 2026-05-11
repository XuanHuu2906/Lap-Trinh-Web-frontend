import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Layers,
  X,
  Bell,
} from "lucide-react";

interface SidebarProps {
  pathname: string;
  onLogout: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

const navItems = [
  {
    label: "Tổng quan",
    path: "/recruiter",
    exact: true,
    icon: LayoutDashboard,
  },
  {
    label: "Đăng tin tuyển dụng",
    path: "/recruiter/post-job",
    icon: PlusCircle,
  },
  {
    label: "Quản lý tin đăng",
    path: "/recruiter/manage-jobs",
    icon: FileText,
  },
  {
    label: "Quản lý ứng viên",
    path: "/recruiter/candidates",
    icon: Users,
  },
  {
    label: "Trò chuyện",
    path: "/recruiter/chat",
    icon: MessageSquare,
  },
  {
    label: "Thông báo",
    path: "/recruiter/notifications",
    icon: Bell,
  },
  {
    label: "Hồ sơ công ty",
    path: "/recruiter/settings",
    icon: Settings,
  },
];

const mockUser = {
  name: "Nguyễn Văn Recruiter",
  role: "HR Manager",
  initials: "NR",
};

export const RecruiterSidebar: React.FC<SidebarProps> = ({
  pathname,
  onLogout,
  onCloseMobile,
  isMobile = false,
}) => {
  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const content = (
    <>
      {/* Header / Logo */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-base font-extrabold tracking-wider leading-none">
              HIREARCH
            </h1>
            <span className="text-[9px] tracking-[2px] text-indigo-400 font-bold uppercase block mt-1">
              NHÀ TUYỂN DỤNG
            </span>
          </div>
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white cursor-pointer lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Quản lý tuyển dụng
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150 ${
                active
                  ? "bg-indigo-600/10 text-indigo-400 font-bold border-l-4 border-indigo-500 pl-3"
                  : "hover:bg-slate-800/60 hover:text-white text-slate-400"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors duration-150 ${
                  active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">{mockUser.initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate leading-none">
              {mockUser.name}
            </p>
            <p className="text-slate-500 text-[11px] mt-1 truncate">
              {mockUser.role}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="w-[280px] bg-slate-900 text-slate-300 flex flex-col h-full animate-slide-right shadow-2xl">
        {content}
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0 fixed top-0 left-0 h-full z-30">
      {content}
    </aside>
  );
};
