import { BriefcaseBusiness, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isEmployerHome = pathname.startsWith("/employers");

  const dashboardPath =
    user?.role === "candidate"
      ? "/candidate/overview"
      : user?.role === "recruiter"
        ? "/recruiter/overview"
        : user?.role === "admin"
          ? "/admin/dashboard"
          : "/auth/setup-profile";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors ${
      isEmployerHome
        ? isActive
          ? "text-white"
          : "text-slate-300 hover:text-white"
        : isActive
          ? "border-b-2 border-blue-700 pb-0.5 text-blue-700"
          : "text-gray-600 hover:text-blue-700"
    }`;

  const plainButtonClass = `cursor-pointer text-sm font-semibold transition-colors ${
    isEmployerHome
      ? "text-slate-300 hover:text-white"
      : "text-gray-600 hover:text-blue-700"
  }`;

  const switchButtonClass = isEmployerHome
    ? "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-bold text-white transition hover:border-sky-300/70 hover:bg-white/10"
    : "inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100";

  const goToPostJob = () => {
    navigate(
      isAuthenticated && user?.role === "recruiter"
        ? "/recruiter/post-job"
        : "/register-employer",
    );
    setMenuOpen(false);
  };

  const goToDashboard = () => {
    navigate(dashboardPath);
    setMenuOpen(false);
  };

  const goToCandidateHome = () => {
    navigate("/");
    setMenuOpen(false);
  };

  const goToEmployerHome = () => {
    navigate("/employers");
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b shadow-sm ${
        isEmployerHome
          ? "border-white/10 bg-[#111313] text-white"
          : "border-gray-200 bg-white text-slate-900"
      }`}
    >
      {isEmployerHome ? (
        <div className="border-b border-white/10 bg-[#17191a]">
          <div className="mx-auto flex h-11 max-w-7xl items-center justify-center gap-5 px-4 text-sm font-semibold text-slate-200">
            <span className="hidden sm:inline">
              Thông báo tức thì, phản hồi hồ sơ nhanh và dễ dàng hơn
            </span>
            <button
              type="button"
              onClick={goToPostJob}
              className="rounded-lg bg-violet-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-violet-500"
            >
              Đăng tin ngay
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to={isEmployerHome ? "/employers" : "/"}
          className="flex items-center gap-2"
        >
          <div
            className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-widest text-white ${
              isEmployerHome ? "bg-violet-600" : "bg-blue-700"
            }`}
          >
            HireArch
          </div>
          <span
            className={`hidden text-xs font-semibold uppercase tracking-widest sm:block ${
              isEmployerHome ? "text-slate-400" : "text-gray-500"
            }`}
          >
            {isEmployerHome ? "Recruiter" : "Enterprise"}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {isEmployerHome ? (
            <>
              <button type="button" onClick={goToPostJob} className={plainButtonClass}>
                Đăng tin
              </button>
              <button type="button" className={plainButtonClass}>
                Trợ giúp
              </button>
              <button
                type="button"
                onClick={goToCandidateHome}
                className={switchButtonClass}
              >
                <UserRound className="h-4 w-4" />
                Dành cho ứng viên
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" end className={linkClass}>
                Trang chủ
              </NavLink>
              <NavLink to="/jobs" className={linkClass}>
                Tìm việc
              </NavLink>
              <button
                type="button"
                onClick={goToEmployerHome}
                className={switchButtonClass}
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Dành cho nhà tuyển dụng
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={goToDashboard}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                isEmployerHome
                  ? "bg-violet-600 hover:bg-violet-500"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              Bảng điều khiển
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate(isEmployerHome ? "/register-employer" : "/login")}
                className={`hidden cursor-pointer text-sm font-semibold transition-colors sm:block ${
                  isEmployerHome
                    ? "text-slate-300 hover:text-white"
                    : "text-gray-600 hover:text-blue-700"
                }`}
              >
                {isEmployerHome ? "Đăng ký/Đăng nhập" : "Đăng nhập"}
              </button>
              {!isEmployerHome ? (
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Đăng ký
                </button>
              ) : null}
            </>
          )}

          <button
            type="button"
            className={isEmployerHome ? "text-slate-200 md:hidden" : "text-gray-600 md:hidden"}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mở menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          className={`flex flex-col gap-3 border-t px-4 py-3 text-sm font-semibold md:hidden ${
            isEmployerHome
              ? "border-white/10 bg-[#111313] text-slate-200"
              : "border-gray-100 bg-white text-gray-700"
          }`}
        >
          {isEmployerHome ? (
            <>
              <button type="button" onClick={goToPostJob} className="text-left">
                Đăng tin
              </button>
              <button type="button" className="text-left">
                Trợ giúp
              </button>
              <button
                type="button"
                onClick={goToCandidateHome}
                className="inline-flex items-center gap-2 text-left"
              >
                <UserRound className="h-4 w-4" />
                Dành cho ứng viên
              </button>
            </>
          ) : (
            <>
              <Link to="/" onClick={() => setMenuOpen(false)}>
                Trang chủ
              </Link>
              <Link to="/jobs" onClick={() => setMenuOpen(false)}>
                Tìm việc
              </Link>
              <button
                type="button"
                onClick={goToEmployerHome}
                className="inline-flex items-center gap-2 text-left"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Dành cho nhà tuyển dụng
              </button>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}
