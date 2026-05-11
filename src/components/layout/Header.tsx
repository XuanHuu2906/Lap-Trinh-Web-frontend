import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-blue-700 ${
      isActive
        ? "text-blue-700 border-b-2 border-blue-700 pb-0.5"
        : "text-gray-600"
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-700 text-white font-bold text-xs px-2 py-1 rounded tracking-widest uppercase">
            HireArch
          </div>
          <span className="text-gray-500 text-xs font-semibold tracking-widest uppercase hidden sm:block">
            Enterprise
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/jobs" className={linkClass}>
            Tìm việc
          </NavLink>
          <button className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">
            Đăng việc
          </button>
          <button className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors">
            Tài nguyên
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center text-gray-500 hover:text-blue-700 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Đăng ký
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link
            to="/jobs"
            onClick={() => setMenuOpen(false)}
            className="hover:text-blue-700"
          >
            Tìm việc
          </Link>
          <button className="text-left hover:text-blue-700">Đăng việc</button>
          <button className="text-left hover:text-blue-700">Tài nguyên</button>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="text-sm font-medium text-gray-600 hover:text-blue-700"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
              className="bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
            >
              Đăng ký
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
