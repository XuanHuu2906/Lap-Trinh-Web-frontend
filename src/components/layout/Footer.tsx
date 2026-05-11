import { Link } from "react-router-dom";

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
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
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
