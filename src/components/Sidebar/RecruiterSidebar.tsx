import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Users,
  X,
} from 'lucide-react';

/**
 * Component Sidebar dành cho nhà tuyển dụng
 * 
 * Hiển thị menu điều hướng với các chức năng chính:
 * - Tổng quan (Dashboard)
 * - Đăng tin tuyển dụng
 * - Quản lý tin đăng
 * - Quản lý ứng viên
 * - Trò chuyện
 * 
 * Hỗ trợ:
 * - Mobile: có nút đóng
 * - Desktop: có thể thu gọn (collapse)
 * - Highlight menu active dựa trên pathname
 */

/** Props cho component sidebar của recruiter */
type RecruiterSidebarProps = {
  pathname: string;                    // Đường dẫn hiện tại (để highlight menu active)
  onLogout: () => void;                // Hàm xử lý logout
  onCloseMobile?: () => void;          // Đóng menu trên mobile
  isMobile?: boolean;                   // Có đang ở chế độ mobile không
  isCollapsed?: boolean;                // Sidebar có đang thu gọn không
  onToggleCollapse?: () => void;        // Hàm toggle thu gọn sidebar
};

/** Danh sách các mục menu trong sidebar của recruiter */
const navItems = [
  {
    label: 'Tổng quan',
    path: '/recruiter/overview',
    aliases: ['/recruiter'],           // Alias cho path '/' cũng được coi là active
    icon: LayoutDashboard,
  },
  {
    label: 'Đăng tin tuyển dụng',
    path: '/recruiter/post-job',
    icon: PlusCircle,
  },
  {
    label: 'Quản lý tin đăng',
    path: '/recruiter/manage-jobs',
    icon: FileText,
  },
  {
    label: 'Quản lý ứng viên',
    path: '/recruiter/candidates',
    icon: Users,
  },
  {
    label: 'Trò chuyện',
    path: '/recruiter/chat',
    icon: MessageSquare,
  },
];

export function RecruiterSidebar({
  pathname,
  onCloseMobile,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
}: RecruiterSidebarProps) {
  const collapsed = isCollapsed && !isMobile;

  /** Kiểm tra một path có đang active không (dựa trên pathname hiện tại) */
  const isActive = (path: string, aliases: string[] = []) =>
    pathname === path ||
    pathname.startsWith(`${path}/`) ||
    aliases.some((alias) => pathname === alias);

  /** Nội dung sidebar (dùng chung cho cả mobile và desktop) */
  const content = (
    <>
      {/* ── Header: Logo + Tên thương hiệu ── */}
      <div
        className={`flex h-16 items-center border-b border-slate-800 bg-slate-950 px-4 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
        >
          {/* Icon thương hiệu */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <Layers className="h-5 w-5 text-white" />
          </div>

          {!collapsed ? (
            <div>
              {/* Tên thương hiệu */}
              <h1 className="text-base font-extrabold leading-none tracking-wider text-white">
                HIREARCH
              </h1>
              {/* Vai trò */}
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[2px] text-indigo-400">
                Nhà tuyển dụng
              </span>
            </div>
          ) : null}
        </div>

        {/* Nút đóng (mobile) hoặc nút thu gọn (desktop) */}
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
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      {/* ── Navigation: Danh sách menu ── */}
      <nav
        className={`flex-1 overflow-y-auto py-6 ${collapsed ? 'px-3' : 'px-4'}`}
      >
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
                  collapsed ? 'justify-center px-0' : 'gap-4 px-4'
                } ${
                  active
                    ? `${
                        collapsed ? '' : 'border-l-4 pl-3'
                      } border-indigo-500 bg-indigo-600/10 font-bold text-indigo-400`
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-150 ${
                    active
                      ? 'text-indigo-400'
                      : 'text-slate-400 group-hover:text-slate-200'
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

  // Mobile: sidebar overlay có width cố định 280px
  if (isMobile) {
    return (
      <aside className="z-10 flex h-full w-70 flex-col bg-slate-900 text-slate-300 shadow-2xl">
        {content}
      </aside>
    );
  }

  // Desktop: sidebar fixed bên trái, có thể thu gọn (w-20 hoặc w-65)
  return (
    <aside
      className={`fixed left-0 top-0 z-30 hidden h-full shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-[width] duration-200 lg:flex ${
        collapsed ? 'w-20' : 'w-65'
      }`}
    >
      {content}
    </aside>
  );
}
