import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-blue-700 ${
      isActive
        ? "text-blue-700 border-b-2 border-blue-700 pb-0.5"
        : "text-gray-600"
    }`;

  const actionLinkClass =
    "text-sm font-medium text-gray-600 transition-colors hover:text-blue-700 cursor-pointer";

  const goToPostJob = () => {
    navigate(
      isAuthenticated && user?.role === "recruiter"
        ? "/recruiter/post-job"
        : "/register-employer",
    );
    setMenuOpen(false);
  };

  const goToCreateCV = () => {
    navigate(
      isAuthenticated && user?.role === "candidate"
        ? "/candidate/cv-templates"
        : "/cv-templates",
    );
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded bg-blue-700 px-2 py-1 text-xs font-bold uppercase tracking-widest text-white">
            HireArch
          </div>
          <span className="hidden text-xs font-semibold uppercase tracking-widest text-gray-500 sm:block">
            Enterprise
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/jobs" className={linkClass}>
            Tìm việc
          </NavLink>
          <button type="button" onClick={goToPostJob} className={actionLinkClass}>
            Đăng việc
          </button>
          <button type="button" onClick={goToCreateCV} className={actionLinkClass}>
            Tạo CV
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hidden cursor-pointer text-sm font-medium text-gray-600 transition-colors hover:text-blue-700 sm:block"
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Đăng ký
          </button>

          <button
            type="button"
            className="cursor-pointer text-gray-600 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mở menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-700 md:hidden">
          <Link
            to="/jobs"
            onClick={() => setMenuOpen(false)}
            className="cursor-pointer hover:text-blue-700"
          >
            Tìm việc
          </Link>
          <button
            type="button"
            onClick={goToPostJob}
            className="cursor-pointer text-left hover:text-blue-700"
          >
            Đăng việc
          </button>
          <button
            type="button"
            onClick={goToCreateCV}
            className="cursor-pointer text-left hover:text-blue-700"
          >
            Tạo CV
          </button>
          <div className="flex gap-3 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="cursor-pointer text-sm font-medium text-gray-600 hover:text-blue-700"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
              className="cursor-pointer rounded-lg bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white"
            >
              Đăng ký
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
