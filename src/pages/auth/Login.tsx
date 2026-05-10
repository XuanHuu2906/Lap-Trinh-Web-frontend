import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-[#f1f5f9] font-sans p-6">
      {/* Logo Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-3 mb-2">
          {/* Icon grid/building */}
          <div className="w-12 h-12 bg-[#0f172a] flex items-center justify-center rounded-sm shadow-sm">
            <svg
              className="w-7 h-7 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
            </svg>
          </div>
          <span className="text-[#0f172a] text-[42px] font-black tracking-[1px] uppercase">
            HireArch
          </span>
        </div>
        <p className="text-[12px] tracking-[5px] text-slate-400 font-bold uppercase">
          ENTERPRISE PORTAL
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-140 bg-white border border-slate-200 shadow-sm overflow-hidden">
        {/* Top dark border */}
        <div className="h-0.75 bg-[#1e293b] w-full"></div>

        <div className="px-16 pt-14 pb-12">
          <div className="text-center mb-8">
            <h2
              className="text-[44px] font-black mb-2 leading-none"
              style={{ color: "#0f172a" }}
            >
              Đăng nhập
            </h2>
            <p className="text-[15px]" style={{ color: "#475569" }}>
              Truy cập hệ thống quản lý tuyển dụng
            </p>
          </div>

          {/* Error message - left-aligned with icon on left */}
          <div className="bg-[#fff1f2] border border-red-100 p-3 rounded-sm flex items-start gap-3 mb-7">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-[11px] font-black">!</span>
            </div>
            <div>
              <p className="text-red-600 font-bold text-[13px] leading-snug">
                Đăng nhập thất bại
              </p>
              <p className="text-red-500 text-[12px] leading-relaxed">
                Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông
                tin.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                ĐỊA CHỈ EMAIL
              </label>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full border border-slate-200 h-14 pl-11 pr-4 text-[16px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">
                  MẬT KHẨU
                </label>
                <button className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 h-14 pl-11 pr-4 text-[16px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Login Button */}
            <button className="w-full h-16 bg-[#1a2332] text-white font-bold text-[15px] tracking-[2px] flex items-center justify-center gap-3 hover:bg-[#111827] transition-colors mt-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              ĐĂNG NHẬP
            </button>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-[#f8fafc] border-t border-slate-100 px-10 py-6 flex items-center justify-center gap-5">
          <span className="text-[15px] text-slate-400">Chưa có tài khoản?</span>
          <div className="flex items-center gap-4">
            <Link
              to="/register-candidate"
              className="text-[16px] font-semibold text-slate-700 hover:text-black transition-colors"
            >
              Ứng viên
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              to="/register-employer"
              className="text-[16px] font-semibold text-slate-700 hover:text-black transition-colors"
            >
              Nhà tuyển dụng
            </Link>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="mt-10 text-center">
        <p className="text-[12px] text-slate-400 mb-2">
          © 2024 HireArch Enterprise. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
            Bảo mật
          </button>
          <span className="text-slate-300 text-[10px]">•</span>
          <button className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
            Điều khoản
          </button>
          <span className="text-slate-300 text-[10px]">•</span>
          <button className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
            Trợ giúp
          </button>
        </div>
      </div>
    </section>
  );
}
