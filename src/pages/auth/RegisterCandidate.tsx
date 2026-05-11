import { Link } from "react-router-dom";

export function CandidateRegisterPage() {
  return (
    <section className="overflow-hidden bg-white grid grid-cols-2 min-h-screen">
      {/* Left Panel */}
      <div className="bg-linear-to-b from-slate-900 to-[#10264f] text-white p-10 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">HIREARCH</h2>
          <p className="text-xs tracking-[3px] mt-1 text-white/60">
            Enterprise Portal
          </p>
        </div>

        <div>
          <h3 className="text-5xl font-bold leading-tight max-w-sm text-left">
            Mở khóa tiềm năng. Xây dựng sự nghiệp.
          </h3>
          <p className="mt-6 text-white/60 text-base leading-7 max-w-xs text-left">
            Tham gia mạng lưới nhân tài độc quyền của chúng tôi để kết nối với
            các cơ hội nghề nghiệp cấp cao từ các tổ chức hàng đầu.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C8.676 1 6 3.676 6 7c0 2.09.894 3.977 2.328 5.285C5.033 13.846 3 17.2 3 21h2c0-3.86 2.915-7 7-7s7 3.14 7 7h2c0-3.8-2.033-7.154-5.328-8.715C17.106 10.977 18 9.09 18 7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4s-1.724 4-4 4-4-1.724-4-4 1.724-4 4-4z" />
              </svg>
              Bảo mật tuyệt đối
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm0 3a1 1 0 00-1 1v5a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L13 13.586V8a1 1 0 00-1-1z" />
              </svg>
              Kết nối trực tiếp
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-start px-16 py-14 bg-[#f8f8f8] text-left">
        <div className="w-full max-w-md">
          <h2
            className="text-4xl font-bold mb-2 text-left"
            style={{ color: "#0f172a" }}
          >
            Đăng ký ứng viên
          </h2>
          <p className="text-sm mb-10 text-left" style={{ color: "#475569" }}>
            Vui lòng cung cấp thông tin để tạo hồ sơ cá nhân.
          </p>

          <div className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn A"
                className="w-full h-12 border border-neutral-300 px-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="VD: ungvien@congty.vn"
                className="w-full h-12 border border-neutral-300 px-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full h-12 border border-neutral-300 px-4 pr-10 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer">
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                className="w-full h-12 border border-neutral-300 px-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 bg-white transition-all"
              />
            </div>

            {/* Nút đăng ký - căn giữa */}
            <button className="w-full h-12 bg-[#1a2332] text-white font-bold text-[13px] tracking-[2px] hover:bg-[#111827] transition-colors mt-2 text-center">
              ĐĂNG KÝ
            </button>
          </div>

          {/* Footer - căn giữa */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <span className="text-[13px] text-slate-400">
              Đã có tài khoản?{" "}
            </span>
            <Link
              to="/login"
              className="text-[13px] font-bold text-slate-800 uppercase tracking-wider hover:text-black transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
