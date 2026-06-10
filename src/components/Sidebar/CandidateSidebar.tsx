import { Link } from "react-router-dom";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  X,
} from "lucide-react";

type CandidateSidebarProps = {
  pathname: string;
  displayName: string;
  initials: string;
  avatarUrl?: string | null;
  onLogout: () => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
};

const navItems = [
  {
    label: "Tổng quan",
    path: "/candidate/overview",
    aliases: ["/candidate"],
    icon: LayoutDashboard,
  },
  {
    label: "Đã ứng tuyển",
    path: "/candidate/applied-jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Việc đã lưu",
    path: "/candidate/saved-jobs",
    icon: Bookmark,
  },
  {
    label: "CV của tôi",
    path: "/candidate/my-cvs",
    icon: FileText,
  },
  {
    label: "Tìm việc làm",
    path: "/candidate/job-search",
    aliases: ["/candidate/find-jobs"],
    icon: Search,
  },
  {
    label: "Thông báo",
    path: "/candidate/notifications",
    icon: Bell,
  },
  {
    label: "Hồ sơ cá nhân",
    path: "/candidate/settings",
    icon: Settings,
  },
];

export function CandidateSidebar({
  pathname,
  displayName,
  initials,
  avatarUrl,
  onLogout,
  onCloseMobile,
  isMobile = false,
}: CandidateSidebarProps) {
  const isActive = (path: string, aliases: string[] = []) =>
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    aliases.some((alias) => pathname === alias);

  const content = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold leading-none tracking-wider text-white">
              HIREARCH
            </h1>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[2px] text-indigo-400">
              Cổng ứng viên
            </span>
          </div>
        </div>

        {isMobile && onCloseMobile ? (
          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-3 px-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Hồ sơ ứng viên
          </span>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.aliases);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`group flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-150 ${
                  active
                    ? "border-l-4 border-indigo-500 bg-indigo-600/10 pl-3 font-bold text-indigo-400"
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
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-slate-800 bg-slate-950/40 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 shadow-sm">
            <span className="text-xs font-bold text-white">{initials}</span>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold leading-none text-white">
              {displayName}
            </p>
            <p className="mt-1 truncate text-[11px] text-slate-500">Ứng viên</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
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
    <aside className="fixed left-0 top-0 z-30 hidden h-full w-65 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 lg:flex">
      {content}
    </aside>
  );
}
