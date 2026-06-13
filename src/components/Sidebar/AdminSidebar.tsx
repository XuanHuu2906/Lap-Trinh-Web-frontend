import { Link } from "react-router-dom";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  pathname: string;
  onLogout: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

const navItems = [
  {
    label: "Tổng quan hệ thống",
    path: "/admin/dashboard",
    aliases: ["/admin"],
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý tuyển dụng",
    path: "/admin/jobs",
    icon: Briefcase,
  },
  {
    label: "Quản lý mẫu CV",
    path: "/admin/templates",
    icon: FileText,
  },
  {
    label: "Quản lý tài khoản",
    path: "/admin/system",
    icon: Users,
  },
  {
    label: "Nhật ký hệ thống",
    path: "/admin/activity-logs",
    icon: Clock,
  },
];

export function AdminSidebar({
  pathname,
  onCloseMobile,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const collapsed = isCollapsed && !isMobile;
  const isActive = (path: string, aliases: string[] = []) =>
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    aliases.some((alias) => pathname === alias);

  const content = (
    <>
      <div
        className={`flex h-16 items-center border-b border-slate-800 bg-slate-950 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          {!collapsed ? (
            <div>
              <h1 className="text-base font-extrabold leading-none tracking-wider text-white">
                HIREARCH
              </h1>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[2px] text-indigo-400">
                Admin Control
              </span>
            </div>
          ) : null}
        </div>

        {isMobile && onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : !isMobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      <nav className={`flex-1 overflow-y-auto py-6 ${collapsed ? "px-3" : "px-4"}`}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.aliases);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center rounded-lg py-3 transition-all duration-150 ${
                  collapsed ? "justify-center px-0" : "gap-4 px-4"
                } ${
                  active
                    ? `${collapsed ? "" : "border-l-4 pl-3"} border-indigo-500 bg-indigo-600/10 font-bold text-indigo-400`
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-150 ${
                    active
                      ? "text-indigo-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {!collapsed ? (
                  <span className="text-sm font-semibold">{item.label}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );

  if (isMobile) {
    return (
      <aside className="z-10 flex h-full w-70 flex-col bg-slate-900 text-slate-300 shadow-2xl">
        {content}
      </aside>
    );
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-30 hidden h-full shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-65"
      }`}
    >
      {content}
    </aside>
  );
}
