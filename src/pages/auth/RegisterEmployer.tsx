import { Link } from 'react-router-dom';

export function RecruiterRegisterPage() {
  return (
    <section className="overflow-hidden bg-white grid grid-cols-2 min-h-screen">
      {/* Left Panel */}
      <div className="bg-gradient-to-b from-slate-900 to-[#10264f] text-white p-10 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 flex items-center justify-center rounded-sm">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">HireArch Enterprise</span>
        </div>

        <div>
          <h3 className="text-5xl font-bold leading-tight max-w-xs text-left">
            Kiến tạo đội ngũ tinh hoa
          </h3>
          <p className="mt-6 text-white/60 text-base leading-7 max-w-xs text-left">
            Nền tảng tuyển dụng chuyên nghiệp dành cho doanh nghiệp. Đăng tin tuyển dụng và tiếp cận ứng viên phù hợp với quy trình tối ưu và bảo mật cao.
          </p>
        </div>

        <p className="text-[11px] text-white/30 uppercase tracking-[2px]">
          © 2024 HIREARCH SYSTEMS. B2B SOLUTIONS.
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-start px-16 py-14 bg-white text-left">
        <div className="w-full max-w-lg">
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#0f172a' }}>
            Đăng ký nhà tuyển dụng
          </h2>
          <p className="text-sm mb-10" style={{ color: '#475569' }}>
            Thiết lập tài khoản doanh nghiệp để bắt đầu quá trình tuyển dụng.
          </p>

          <div className="space-y-5">
            {/* Tên công ty */}
            <div>
              <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Tên công ty / cá nhân
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Nhập tên tổ chức hoặc cá nhân đại diện"
                  className="w-full h-12 border border-neutral-300 pl-10 pr-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="email@congty.com"
                  className="w-full h-12 border border-neutral-300 pl-10 pr-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
                />
              </div>
            </div>

            {/* Mật khẩu + Xác nhận - 2 cột */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 border border-neutral-300 pl-10 pr-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 border border-neutral-300 pl-10 pr-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox điều khoản */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 border border-neutral-300 accent-slate-800 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-[13px] text-slate-500 leading-relaxed cursor-pointer">
                Tôi đồng ý với{' '}
                <span className="text-slate-700 font-semibold underline cursor-pointer">Điều khoản dịch vụ</span>
                {' '}và{' '}
                <span className="text-slate-700 font-semibold underline cursor-pointer">Chính sách bảo mật</span>
                {' '}của HireArch Enterprise.
              </label>
            </div>

            {/* Nút đăng ký */}
            <button className="w-full h-12 bg-[#1a2332] text-white font-bold text-[13px] tracking-[2px] hover:bg-[#111827] transition-colors flex items-center justify-center gap-2">
              ĐĂNG KÝ NHÀ TUYỂN DỤNG
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <Link to="/login" className="text-[13px] text-slate-500 hover:text-slate-800 transition-colors">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}