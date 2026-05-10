import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const navItems = [
  {
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    label: 'Tổng quan',
    path: '/recruiter',
    exact: true,
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    label: 'Đăng tin tuyển dụng',
    path: '/recruiter/post-job',
  },
  {
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    label: 'Quản lý tin đăng',
    path: '/recruiter/manage-jobs',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    label: 'Quản lý ứng viên',
    path: '/recruiter/candidates',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    label: 'Báo cáo',
    path: '/recruiter/reports',
  },
];

const bottomItems = [
  {
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    label: 'Hỗ trợ',
    path: '/recruiter/support',
  },
  {
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
    label: 'Cài đặt',
    path: '/recruiter/settings',
  },
];

// Mock user — thay bằng context/auth thực tế
const currentUser = {
  name: 'Nguyễn Văn Recruiter',
  role: 'HR Manager',
  initials: 'NR',
  company: 'TechNova Solutions',
};

export function RecruiterLayout() {
  const { pathname } = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans overflow-x-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-[152px] min-h-screen bg-[#0f1f3d] flex flex-col justify-between flex-shrink-0 fixed top-0 left-0 h-full z-30">
        <div>
          {/* Logo */}
          <div className="px-4 py-5 border-b border-white/10">
            <Link to="/recruiter" className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-white/20 rounded-sm flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                </svg>
              </div>
              <span className="text-white text-[12px] font-bold leading-tight">
                Recruiter<br />Portal
              </span>
            </Link>
            <p className="text-white/40 text-[9px] tracking-[2px] uppercase mt-1">Enterprise Edition</p>
          </div>

          {/* Main nav */}
          <nav className="mt-4 px-2 space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  to={item.path}
                  key={item.path}
                  className={`flex items-start gap-2 px-3 py-2.5 rounded-sm transition-colors ${
                    active ? 'bg-white/15' : 'hover:bg-white/10'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${active ? 'text-white' : 'text-white/50'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                  </svg>
                  <span className={`text-[10px] uppercase tracking-wide leading-tight ${active ? 'text-white font-bold' : 'text-white/50'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom nav + user */}
        <div>
          <div className="px-2 pb-2 space-y-0.5">
            {bottomItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  to={item.path}
                  key={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors ${
                    active ? 'bg-white/15' : 'hover:bg-white/10'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-white/40'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                  </svg>
                  <span className={`text-[10px] uppercase tracking-wide ${active ? 'text-white font-bold' : 'text-white/40'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Đăng xuất */}
          <div className="px-2 pb-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-white/10 w-full transition-colors">
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-white/40 text-[10px] uppercase tracking-wide">Đăng xuất</span>
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#3b5bdb] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[11px] font-bold">{currentUser.initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-[11px] font-semibold leading-none truncate">{currentUser.name.split(' ').slice(-2).join(' ')}</p>
                <p className="text-white/40 text-[10px] mt-0.5 truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area (offset for fixed sidebar) ── */}
      <div className="flex flex-col min-h-screen ml-[152px] w-[calc(100vw-152px)] min-w-0 overflow-x-hidden">

        {/* ── Header ── */}
        <header className="bg-white border-b border-slate-200 px-8 py-0 flex items-center justify-between h-14 sticky top-0 z-20">
          {/* Left: brand + search */}
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-slate-800 whitespace-nowrap">Enterprise Job Board</span>
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Tìm kiếm..."
                className="h-8 pl-9 pr-4 border border-slate-200 text-[13px] w-52 outline-none focus:border-slate-400 placeholder:text-slate-300 bg-slate-50 transition-all"
              />
            </div>
          </div>

          {/* Center: tabs */}
          <nav className="flex items-center gap-1 h-full">
            {[
              { label: 'Dashboard', path: '/recruiter', exact: true },
              { label: 'Recruitment', path: '/recruiter/post-job' },
              { label: 'Analytics', path: '/recruiter/analytics' },
            ].map((tab) => {
              const active = tab.exact ? pathname === tab.path : pathname.startsWith(tab.path) || (tab.label === 'Recruitment' && ['/recruiter/post-job', '/recruiter/manage-jobs', '/recruiter/candidates'].some(p => pathname.startsWith(p)));
              return (
                <Link
                  key={tab.label}
                  to={tab.path}
                  className={`h-full px-4 flex items-center text-[13px] font-medium border-b-2 transition-colors ${
                    active
                      ? 'text-blue-600 border-blue-600'
                      : 'text-slate-500 border-transparent hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: actions + user */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                className="relative w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-sm transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[13px] font-bold text-slate-800">Thông báo</p>
                  </div>
                  {[
                    { text: 'Ứng viên mới nộp hồ sơ vào vị trí Senior Frontend Engineer', time: '5 phút trước' },
                    { text: 'Lịch phỏng vấn với Trần Thị Mai lúc 14:00 hôm nay', time: '1 giờ trước' },
                    { text: 'Tin tuyển dụng "Product Manager" sắp hết hạn', time: '3 giờ trước' },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                      <p className="text-[12px] text-slate-700 leading-snug">{n.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-center">
                    <button className="text-[12px] text-blue-600 font-semibold hover:underline">Xem tất cả</button>
                  </div>
                </div>
              )}
            </div>

            {/* Help */}
            <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-sm transition-colors">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 border border-slate-200 px-3 py-1.5 hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 bg-[#0f1f3d] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">{currentUser.initials}</span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[12px] font-semibold text-slate-800 leading-none">{currentUser.name.split(' ').slice(-2).join(' ')}</p>
                  <p className="text-[10px] text-slate-400">{currentUser.role}</p>
                </div>
                <svg className="w-3 h-3 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 w-52 bg-white border border-slate-200 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[13px] font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">{currentUser.company}</p>
                  </div>
                  {[
                    { label: 'Hồ sơ công ty', path: '/recruiter/settings', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
                    { label: 'Cài đặt', path: '/recruiter/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                  ].map((item) => (
                    <Link key={item.label} to={item.path} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
                      </svg>
                      <span className="text-[13px] text-slate-600">{item.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100">
                    <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full transition-colors">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-[13px] text-red-500 font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
            )}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}