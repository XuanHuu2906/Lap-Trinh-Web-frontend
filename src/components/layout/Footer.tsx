import { Link } from "react-router-dom";
const socialIcons = {
  facebook: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 8.5h2V5h-2.8C10.3 5 9 6.7 9 9.3V11H7v3.5h2V21h4v-6.5h2.7L16 11h-3V9.6c0-.8.3-1.1 1-1.1Z" />
    </svg>
  ),

  linkedin: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.5 8.8H3.8V20h2.7V8.8ZM5.2 4C4.3 4 3.6 4.7 3.6 5.6S4.3 7.2 5.2 7.2s1.6-.7 1.6-1.6S6.1 4 5.2 4ZM20.4 13.6c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5.9-2.9 1.5V8.8H11V20h2.7v-5.5c0-1.4.3-2.7 2-2.7 1.6 0 1.7 1.5 1.7 2.8V20h2.7v-6.4Z" />
    </svg>
  ),

  twitter: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.5 10.6 21 3h-1.5l-5.7 6.6L9.3 3H4l6.8 9.9L4 21h1.5l6-7 4.8 7H21l-6.5-9.4Zm-2.1 2.5-.7-1L6.2 4.2h2.5l4.4 6.3.7 1 5.8 8.3h-2.5l-4.7-6.7Z" />
    </svg>
  ),
};
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* Brand */}
        <div>
          <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded tracking-widest uppercase inline-block mb-3">
            HireArch
          </div>
          <p className="text-gray-500 text-xs leading-relaxed mt-1">
            Nền tảng tuyển dụng dành cho doanh nghiệp hàng đầu Việt Nam.
          </p>
          <div className="flex gap-3 mt-4">
            {["facebook", "linkedin", "twitter"].map((s) => (
              <button
                key={s}
                className="w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                {socialIcons[s as keyof typeof socialIcons]}
              </button>
            ))}
          </div>
        </div>

        {/* Ứng viên */}
        <div>
          <p className="font-semibold text-gray-300 mb-3 text-sm">Ứng viên</p>
          <ul className="space-y-2 text-xs text-gray-500">
            <li>
              <Link
                to="/jobs"
                className="hover:text-gray-300 transition-colors"
              >
                Tìm kiếm việc làm
              </Link>
            </li>
            <li>
              <Link
                to="/cv-templates"
                className="hover:text-gray-300 transition-colors"
              >
                Tạo hồ sơ CV
              </Link>
            </li>
            <li>
              <button className="hover:text-gray-300 transition-colors text-left">
                Công ty nổi bật
              </button>
            </li>
            <li>
              <button className="hover:text-gray-300 transition-colors text-left">
                Cẩm nang nghề nghiệp
              </button>
            </li>
          </ul>
        </div>

        {/* Nhà tuyển dụng */}
        <div>
          <p className="font-semibold text-gray-300 mb-3 text-sm">
            Nhà tuyển dụng
          </p>
          <ul className="space-y-2 text-xs text-gray-500">
            {[
              "Đăng tin tuyển dụng",
              "Tìm kiếm ứng viên",
              "Gói dịch vụ",
              "Quản lý tuyển dụng",
            ].map((item) => (
              <li key={item}>
                <button className="hover:text-gray-300 transition-colors text-left">
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Công ty */}
        <div>
          <p className="font-semibold text-gray-300 mb-3 text-sm">Công ty</p>
          <ul className="space-y-2 text-xs text-gray-500">
            {[
              "Về chúng tôi",
              "Blog & Tin tức",
              "Liên hệ hỗ trợ",
              "Chính sách bảo mật",
            ].map((item) => (
              <li key={item}>
                <button className="hover:text-gray-300 transition-colors text-left">
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 px-6 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-2">
        <span>© 2024 HireArch Enterprise. All rights reserved.</span>
        <div className="flex gap-4 flex-wrap">
          {[
            "Privacy Policy",
            "Terms of Service",
            "Cookie Policy",
            "Accessibility",
            "Security",
          ].map((link) => (
            <button
              key={link}
              className="hover:text-gray-400 transition-colors"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
