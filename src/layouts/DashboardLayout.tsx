import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import CandidateLayout from "../components/layout/CandidateLayout";
import { RecruiterSidebar } from "../components/Sidebar/RecruiterSidebar";
import { AdminSidebar } from "../components/Sidebar/AdminSidebar";
import { Topbar } from "../components/Topbar/Topbar";

interface DashboardLayoutProps {
  role: "candidate" | "recruiter" | "admin";
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quản lý trạng thái Chế độ tối (Dark Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Đóng sidebar di động khi thay đổi đường dẫn (URL)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [pathname]);

  // Xử lý đăng xuất riêng biệt theo từng Role
  const handleLogout = () => {
    if (role === "admin") {
      localStorage.removeItem("isAdminAuthenticated");
      alert("Đăng xuất Admin thành công!");
      navigate("/admin/login");
    } else {
      alert("Đăng xuất tài khoản thành công!");
      navigate("/login");
    }
  };

  // Render Sidebar tương ứng theo Role
  const renderSidebar = (isMobileView: boolean) => {
    const props = {
      pathname,
      onLogout: handleLogout,
      onCloseMobile: () => setIsSidebarOpen(false),
      isMobile: isMobileView,
    };

    switch (role) {
      case "candidate":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <CandidateLayout {...(props as any)} />;
      case "recruiter":
        return <RecruiterSidebar {...props} />;
      case "admin":
        return <AdminSidebar {...props} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-150">
      {/* ── 1. Sidebar cho Desktop (Cố định góc trái) ── */}
      {renderSidebar(false)}

      {/* ── 2. Sidebar di động dạng Drawer (Bật/tắt) ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          {/* Click ra ngoài để đóng */}
          <div
            className="fixed inset-0"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          {renderSidebar(true)}
        </div>
      )}

      {/* ── 3. Khu vực nội dung chính phía bên phải ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-65 min-h-screen">
        {/* Topbar dùng chung */}
        <Topbar
          role={role}
          pathname={pathname}
          onOpenMobileSidebar={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Nội dung trang con do Router nạp vào */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
