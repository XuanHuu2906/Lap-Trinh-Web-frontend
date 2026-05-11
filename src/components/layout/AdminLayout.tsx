import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Danh sách các tab menu bên Sidebar
  const menuItems = [
    {
      name: 'Tổng quan hệ thống',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Quản lý tuyển dụng',
      path: '/admin/jobs',
      icon: Briefcase,
    },
    {
      name: 'Quản lý mẫu CV',
      path: '/admin/templates',
      icon: FileText,
    },
    {
      name: 'Cấu hình hệ thống',
      path: '/admin/system',
      icon: Settings,
    },
  ];

  const activeItem = menuItems.find(item => location.pathname === item.path) || menuItems[0];

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-850 font-sans">

      {/* 1. SIDEBAR (Bản lớn dành cho Desktop) */}
      <aside className="hidden lg:flex flex-col w-[300px] bg-[#0f172a] text-slate-300 border-r border-slate-850 flex-shrink-0">

        {/* Sidebar Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-[#090d16]">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-base font-extrabold tracking-widest font-sans leading-none">
              HIREARCH
            </h1>
            <span className="text-[9px] tracking-[3px] text-indigo-400 font-bold uppercase block mt-1">
              ADMIN CONTROL
            </span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              QUẢN TRỊ CHÍNH
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-start gap-4 px-4 py-3.5 rounded-sm transition-all duration-150 cursor-pointer ${isActive
                  ? 'bg-slate-800 text-white shadow-inner border-l-[3px] border-indigo-500 pl-[13px]'
                  : 'hover:bg-slate-800/45 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-150 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                <div className="leading-none">
                  <span className="text-sm font-semibold block">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-[#090d16]/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/25 hover:bg-red-900/40 text-red-400 border border-red-900/30 text-xs font-bold tracking-widest rounded-sm transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            ĐĂNG XUẤT HỆ THỐNG
          </button>
        </div>
      </aside>

      {/* 2. SIDEBAR (Bản di động rèm che) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-[280px] bg-[#0f172a] text-slate-300 flex flex-col h-full animate-slide-right">
            {/* Header di động */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                <span className="text-white font-black tracking-widest text-sm">HIREARCH ADMIN</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu di động */}
            <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold transition-all ${isActive
                      ? 'bg-slate-800 text-white border-l-[3px] border-indigo-500'
                      : 'hover:bg-slate-800/45 text-slate-400 hover:text-white'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer di động */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/40 text-red-400 text-xs font-bold rounded-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                ĐĂNG XUẤT
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
        </div>
      )}

      {/* 3. KHU VỰC CHỨA NỘI DUNG CHÍNH (MAIN AREA) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">

        {/* Main Area Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between flex-shrink-0 z-30">

          {/* Left: Hamburger menu (mobile) & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">
                HIREARCH / QUẢN TRỊ VIÊN
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                {activeItem.name}
              </h2>
            </div>
          </div>

          {/* Right: Quick Notifications & Profile Menu */}
          <div className="flex items-center gap-4">

            {/* Cảnh báo trạng thái hệ thống */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-sm">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                HỆ THỐNG ONLINE
              </span>
            </div>

            {/* Notification Icon */}
            <button className="relative p-2 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <Bell className="w-5 h-5 stroke-[1.8]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white"></span>
            </button>

            <span className="h-6 w-px bg-slate-200"></span>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-slate-900 text-white rounded-sm flex items-center justify-center font-bold text-xs shadow-sm">
                  AD
                </div>
                <div className="hidden md:block text-left leading-none">
                  <span className="text-xs font-bold text-slate-800 block">Admin Administrator</span>
                  <span className="text-[9px] text-indigo-600 font-bold tracking-wider mt-0.5 block">SUPER_ADMIN</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {/* Profile Panel Overlay */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-200/90 shadow-md rounded-sm py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-150">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Tài khoản hiện tại</span>
                      <span className="text-xs font-bold text-slate-700 block truncate mt-0.5">admin@hirearch.com</span>
                    </div>
                    <Link
                      to="/admin/system"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 text-left cursor-pointer"
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

        {/* Main Content Area Viewport */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};
