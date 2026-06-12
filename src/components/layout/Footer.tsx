import { BriefcaseBusiness, Search, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const socialIcons = {
  facebook: (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 8.5h2V5h-2.8C10.3 5 9 6.7 9 9.3V11H7v3.5h2V21h4v-6.5h2.7L16 11h-3V9.6c0-.8.3-1.1 1-1.1Z" />
    </svg>
  ),
  linkedin: (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.5 8.8H3.8V20h2.7V8.8ZM5.2 4C4.3 4 3.6 4.7 3.6 5.6S4.3 7.2 5.2 7.2s1.6-.7 1.6-1.6S6.1 4 5.2 4ZM20.4 13.6c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-2.9 1.5V8.8H11V20h2.7v-5.5c0-1.4.3-2.7 2-2.7 1.6 0 1.7 1.5 1.7 2.8V20h2.7v-6.4Z" />
    </svg>
  ),
  twitter: (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.5 10.6 21 3h-1.5l-5.7 6.6L9.3 3H4l6.8 9.9L4 21h1.5l6-7 4.8 7H21l-6.5-9.4Zm-2.1 2.5-.7-1L6.2 4.2h2.5l4.4 6.3.7 1 5.8 8.3h-2.5l-4.7-6.7Z" />
    </svg>
  ),
};

export default function Footer() {
  const { pathname } = useLocation();
  const isEmployerHome = pathname.startsWith("/employers");

  const footerClass = isEmployerHome
    ? "border-t border-white/10 bg-[#111313] text-slate-400"
    : "mt-20 bg-gray-900 text-gray-400";

  const brandClass = isEmployerHome ? "bg-violet-600" : "bg-blue-600";

  return (
    <footer className={footerClass}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 text-sm md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div
            className={`${brandClass} mb-3 inline-block rounded px-2 py-1 text-xs font-bold uppercase tracking-widest text-white`}
          >
            HireArch
          </div>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500">
            Nền tảng kết nối ứng viên và nhà tuyển dụng với quy trình rõ ràng,
            dữ liệu thật và trải nghiệm làm việc gọn gàng.
          </p>
          <div className="mt-4 flex gap-3">
            {["facebook", "linkedin", "twitter"].map((name) => (
              <button
                key={name}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-700 transition-colors hover:border-blue-500 hover:text-blue-400"
                type="button"
              >
                {socialIcons[name as keyof typeof socialIcons]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <UserRound className="h-4 w-4" />
            Ứng viên
          </p>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>
              <Link to="/" className="transition-colors hover:text-gray-300">
                Trang người tìm việc
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="transition-colors hover:text-gray-300">
                Tìm kiếm việc làm
              </Link>
            </li>
            <li>
              <button className="text-left transition-colors hover:text-gray-300" type="button">
                Việc làm nổi bật
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <BriefcaseBusiness className="h-4 w-4" />
            Nhà tuyển dụng
          </p>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>
              <Link to="/employers" className="transition-colors hover:text-gray-300">
                Trang tuyển dụng
              </Link>
            </li>
            <li>
              <Link
                to="/register-employer"
                className="transition-colors hover:text-gray-300"
              >
                Đăng tin tuyển dụng
              </Link>
            </li>
            <li>
              <button className="text-left transition-colors hover:text-gray-300" type="button">
                Quản lý tuyển dụng
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <Search className="h-4 w-4" />
            Hỗ trợ
          </p>
          <ul className="space-y-2 text-xs text-gray-500">
            {["Liên hệ hỗ trợ", "Chính sách bảo mật", "Điều khoản sử dụng"].map(
              (item) => (
                <li key={item}>
                  <button
                    className="text-left transition-colors hover:text-gray-300"
                    type="button"
                  >
                    {item}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-gray-800 px-6 py-4 text-xs text-gray-600 sm:flex-row">
        <span>© 2026 HireArch Enterprise. All rights reserved.</span>
        <div className="flex flex-wrap gap-4">
          {["Privacy Policy", "Terms of Service", "Security"].map((item) => (
            <button key={item} className="transition-colors hover:text-gray-400" type="button">
              {item}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
