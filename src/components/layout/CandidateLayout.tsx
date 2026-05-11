import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

// ── Nav items (khớp với ảnh) ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/candidate/overview", icon: LayoutDashboard, label: "Tổng quan" },
  {
    to: "/candidate/applied-jobs",
    icon: BriefcaseBusiness,
    label: "Đã ứng tuyển",
  },
  { to: "/candidate/my-cvs", icon: FileText, label: "CV của tôi" },
  { to: "/candidate/cv-builder", icon: FileText, label: "Tạo CV mới" },
  { to: "/candidate/cv-templates", icon: FileText, label: "Mẫu CV" },
  { to: "/candidate/job-search", icon: Search, label: "Tìm việc làm" },
  { to: "/candidate/notifications", icon: Bell, label: "Thông báo", badge: 3 },
];

export default function CandidateLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          w-52.5 bg-[#1b2537]
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:shrink-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4.5 border-b border-white/10">
          <div className="w-6 h-6 bg-blue-500 rounded-[5px] flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 14 14"
              className="w-3.5 h-3.5 text-white"
              fill="currentColor"
            >
              <rect x="1" y="1" width="5" height="5" rx="1" />
              <rect x="8" y="1" width="5" height="5" rx="1" />
              <rect x="1" y="8" width="5" height="5" rx="1" />
              <rect x="8" y="8" width="5" height="5" rx="1" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-white text-[13px] font-bold tracking-wider uppercase">
              Hirearch
            </p>
            <p className="text-white/35 text-[9px] uppercase tracking-[0.12em]">
              Cổng ứng viên
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/candidate/overview"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-5 py-2.75 text-[13px] font-medium transition-colors
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/6"
                }`
              }
            >
              <Icon size={15} strokeWidth={1.8} className="shrink-0" />
              <span className="tracking-wide">{label}</span>
              {badge && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shrink-0">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 py-2">
          <button
            onClick={() => navigate("/candidate/settings")}
            className="flex items-center gap-3 px-5 py-2.5 w-full text-white/40 hover:text-white text-[13px] transition-colors"
          >
            <Settings size={15} strokeWidth={1.8} />
            <span>Cài đặt</span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 px-5 py-2.5 w-full text-white/40 hover:text-white text-[13px] transition-colors"
          >
            <LogOut size={15} strokeWidth={1.8} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 shrink-0">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          {/* Search — center of topbar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-85">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.75 text-[13px] text-gray-700 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Right: Bell + User */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Bell */}
            <NavLink
              to="/candidate/notifications"
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} strokeWidth={1.8} />
            </NavLink>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7.5 h-7.5 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  N
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-[12px] font-semibold text-gray-800">
                    Nguyễn Văn A
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Chuyên viên Marketing
                  </p>
                </div>
                <ChevronDown
                  size={13}
                  className="text-gray-400 hidden sm:block"
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1 text-[13px]">
                    <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors">
                      Hồ sơ của tôi
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/candidate/settings");
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cài đặt
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/login");
                      }}
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
