import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { post } from "../../services/api-client";
import Footer from "../../components/layout/Footer";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "Mã bảo mật đặt lại mật khẩu không hợp lệ hoặc đã thiếu. Vui lòng kiểm tra lại liên kết trong email.",
      );
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API reset-password thật từ backend
      const res = await post<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          token,
          newPassword,
        },
      );

      if (res.success) {
        setIsSubmitted(true);

        // Tự động chuyển hướng về trang đăng nhập sau 3.5 giây
        setTimeout(() => {
          navigate("/login");
        }, 3500);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Lỗi đặt lại mật khẩu:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Đặt lại mật khẩu thất bại. Mã liên kết có thể đã hết hạn.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
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
            HIREARCH
          </span>
        </Link>
      </header>

      {/* CENTERED CARD CONTAINER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-105 bg-white border border-slate-200/85 rounded-2xl shadow-sm p-8 relative transition-all duration-200">
          {/* Error Message Block */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3 mb-6 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-bold text-xs">
                  Lỗi đặt lại mật khẩu
                </p>
                <p className="text-red-600 text-xs mt-1 font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {!isSubmitted ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Đặt lại mật khẩu mới
                </h1>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Cung cấp mật khẩu bảo mật mới cho tài khoản của bạn bên dưới.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full h-11 border border-slate-300 rounded-lg pl-10 pr-10 outline-none text-sm transition-all focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wide">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full h-11 border border-slate-300 rounded-lg pl-10 pr-10 outline-none text-sm transition-all focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Cập nhật mật khẩu mới"
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
                Mật khẩu đã đặt lại!
              </h2>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                Mật khẩu của bạn đã được thay đổi thành công. Bạn hiện có thể
                đăng nhập bằng mật khẩu mới này.
              </p>
              <p className="text-emerald-600 text-xs mt-4 font-semibold italic">
                Đang tự động chuyển hướng bạn về trang đăng nhập...
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="border-t border-slate-100 mt-6 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:underline transition-all"
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
export default ResetPasswordPage;
