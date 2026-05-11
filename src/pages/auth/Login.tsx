import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Giả lập mật khẩu chính xác là '123456'
    if (password === "123456") {
      setShowError(false);
      alert("Đăng nhập thành công!");
      navigate("/");
    } else {
      setShowError(true);
    }
  };

  return (
    <div className="full-screen-page min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-between text-slate-800">
      {/* HEADER LOGO */}
      <header className="w-full px-6 sm:px-12 md:px-16 pt-6 pb-2 flex justify-start items-center">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-sm shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
            </svg>
          </div>
          <span className="text-slate-900 text-[20px] font-extrabold tracking-widest uppercase font-sans">
            HIREARCH{" "}
            <span className="text-slate-500 font-medium text-base">
              ENTERPRISE
            </span>
          </span>
        </Link>
      </header>

      {/* CENTERED LOGIN CARD CONTAINER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        <div className="w-full max-w-100 bg-white border border-slate-200/80 rounded-lg shadow-sm p-6 relative">
          <div className="mb-6">
            <h1 className="text-[32px] font-bold text-slate-900 leading-none tracking-tight">
              Đăng nhập
            </h1>
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              className="w-full h-10 border border-slate-300 hover:border-slate-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 bg-white hover:bg-slate-50/50 transition-all cursor-pointer shadow-3xs"
            >
              <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Terms Agreement */}
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed my-4">
            Khi nhấp vào Tiếp tục, bạn đồng ý với{" "}
            <span className="text-slate-900 hover:underline cursor-pointer">
              Thỏa thuận người dùng
            </span>
            ,{" "}
            <span className="text-slate-900 hover:underline cursor-pointer">
              Chính sách quyền riêng tư
            </span>{" "}
            và{" "}
            <span className="text-slate-900 hover:underline cursor-pointer">
              Chính sách cookie
            </span>{" "}
            của HireArch.
          </p>

          {/* Divider line */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-3 text-xs text-slate-400 font-bold">hoặc</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Error message block */}
          {showError && (
            <div className="bg-[#fff1f2] border border-red-100 p-3 rounded-sm flex items-start gap-3 mb-4 animate-fade-in">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[11px] font-black">!</span>
              </div>
              <div className="flex-1">
                <p className="text-red-600 font-bold text-[12px] leading-snug">
                  Đăng nhập thất bại
                </p>
                <p className="text-red-500 text-[11px] leading-relaxed">
                  Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.
                </p>
              </div>
            </div>
          )}

          {/* Credentials Inputs Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email / Phone */}
            <div>
              <div className="relative w-full">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email hoặc số điện thoại"
                  className="w-full border border-slate-300 h-12 px-3 text-[14px] outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 placeholder:text-slate-400 text-slate-800 transition-all bg-white rounded-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full border border-slate-300 h-12 pl-3 pr-16 text-[14px] outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 placeholder:text-slate-400 text-slate-800 transition-all bg-white rounded-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-900 hover:text-slate-700 transition-colors cursor-pointer select-none"
              >
                {showPassword ? "Ẩn" : "Hiển thị"}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-start">
              <Link
                to="/forgot-password"
                className="text-[13px] font-bold text-slate-900 hover:text-slate-700 hover:underline transition-all cursor-pointer"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Keep Signed In Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 border-slate-300 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-slate-500 font-bold hover:text-slate-700 cursor-pointer select-none"
              >
                Duy trì trạng thái đăng nhập của tôi
              </label>
            </div>

            {/* Login Button (Pill shape) */}
            <button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-3xs mt-2 active:scale-[0.98]"
            >
              Đăng nhập
            </button>
          </form>
        </div>

        {/* BOTTOM REGISTER OPTIONS */}
        <div className="text-center mt-6 text-[13px] font-semibold text-slate-500">
          <span>Bạn mới sử dụng HireArch? </span>
          <div className="inline-flex gap-2.5 mt-1.5 sm:mt-0">
            <Link
              to="/register-candidate"
              className="font-extrabold text-slate-900 hover:underline"
            >
              Đăng ký ứng viên
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              to="/register-enterprise"
              className="font-extrabold text-slate-900 hover:underline"
            >
              Đăng ký nhà tuyển dụng
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
