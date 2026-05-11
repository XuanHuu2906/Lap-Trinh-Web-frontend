import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Footer from "../../components/layout/Footer";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập gửi mã xác nhận qua email trong 1.5 giây
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="full-screen-page min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-between text-slate-800">
      
      {/* HEADER LOGO */}
      <header className="w-full px-6 sm:px-12 md:px-16 pt-6 pb-2 flex justify-start items-center">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-sm shadow-sm">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
            </svg>
          </div>
          <span className="text-slate-900 text-[20px] font-extrabold tracking-widest uppercase">
            HIREARCH
          </span>
        </Link>
      </header>

      {/* CENTERED CARD CONTAINER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-[420px] bg-white border border-slate-200/85 rounded-2xl shadow-sm p-8 relative transition-all duration-200">
          
          {!isSubmitted ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Quên mật khẩu?
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Đừng lo lắng! Nhập địa chỉ email tài khoản của bạn dưới đây, chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wide">
                    Địa chỉ Email đăng ký
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 pl-11 pr-4 border border-slate-300 rounded-lg outline-none text-sm transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Gửi liên kết khôi phục"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Kiểm tra email của bạn
              </h2>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                Chúng tôi đã gửi một email hướng dẫn đặt lại mật khẩu đến hộp thư <strong className="text-slate-800">{email}</strong>.
              </p>
              <p className="text-slate-400 text-xs mt-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                Nếu không nhận được thư, vui lòng kiểm tra mục thư rác (Spam) hoặc thử lại sau vài phút.
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="border-t border-slate-100 mt-6 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang Đăng nhập
            </Link>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}
