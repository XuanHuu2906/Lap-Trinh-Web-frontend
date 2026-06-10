import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/layout/Footer";

export function EnterpriseRegisterPage() {
  const navigate = useNavigate();
  const { registerRecruiter } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!agreeTerms) {
      setError(
        "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tiếp tục.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API đăng ký nhà tuyển dụng (truyền fullName bằng companyName để khớp interface)
      const res = await registerRecruiter({
        companyName,
        fullName: companyName,
        email,
        password,
        confirmPassword,
      });

      if (res.success) {
        setSuccessMsg(
          res.message ||
            "Đăng ký nhà tuyển dụng thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.",
        );

        // Reset form
        setCompanyName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeTerms(false);

        // Chuyển hướng sang trang đăng nhập sau 4 giây
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Lỗi đăng ký nhà tuyển dụng:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký thất bại. Vui lòng thử lại sau.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col justify-between text-slate-800">
      {/* Vùng không gian để căn thẻ đăng ký */}
      <main className="flex-1 flex items-start justify-center px-4 pt-12.5 pb-12.5">
        {/* Thẻ đăng ký nhà tuyển dụng (Card) màu trắng nổi bật */}
        <div className="w-full  bg-white border border-slate-200/80 rounded-lg shadow-sm p-8 text-left">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
              Đăng ký nhà tuyển dụng
            </h2>
          </div>

          {/* Success Message Block */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-start gap-3 mb-6 animate-fade-in">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[11px] font-black">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-emerald-800 font-bold text-[13px] leading-snug">
                  Đăng ký thành công!
                </p>
                <p className="text-emerald-600 text-[12px] mt-1 leading-relaxed">
                  {successMsg}
                </p>
                <p className="text-emerald-500 text-[11px] mt-2 italic">
                  Đang chuyển hướng về trang đăng nhập trong giây lát...
                </p>
              </div>
            </div>
          )}

          {/* Error Message Block */}
          {error && (
            <div className="bg-[#fff1f2] border border-red-100 p-4 rounded-sm flex items-start gap-3 mb-6 animate-fade-in">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[11px] font-black">!</span>
              </div>
              <div className="flex-1">
                <p className="text-red-600 font-bold text-[12px] leading-snug">
                  Lỗi đăng ký
                </p>
                <p className="text-red-500 text-[11px] mt-1 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên công ty */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Tên công ty / cá nhân
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nhập tên tổ chức hoặc cá nhân đại diện"
                  className="w-full h-11 border border-slate-200 rounded pl-10 pr-4 text-sm outline-none focus:border-slate-800 transition-all bg-white text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@congty.com"
                  className="w-full h-11 border border-slate-200 rounded pl-10 pr-4 text-sm outline-none focus:border-slate-800 transition-all bg-white text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Mật khẩu + Xác nhận - 2 cột */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 border border-slate-200 rounded pl-10 pr-4 text-sm outline-none focus:border-slate-800 transition-all bg-white text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
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
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 border border-slate-200 rounded pl-10 pr-4 text-sm outline-none focus:border-slate-800 transition-all bg-white text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox điều khoản */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 border border-slate-200 accent-slate-900 cursor-pointer shrink-0"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-500 leading-relaxed cursor-pointer selection:bg-slate-100"
              >
                Tôi đồng ý với{" "}
                <span className="text-slate-900 font-bold underline hover:text-black cursor-pointer">
                  Điều khoản dịch vụ
                </span>{" "}
                và{" "}
                <span className="text-slate-900 font-bold underline hover:text-black cursor-pointer">
                  Chính sách bảo mật
                </span>{" "}
                của HireArch Enterprise.
              </label>
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-slate-900 text-white font-bold text-xs tracking-widest hover:bg-slate-850 transition-all rounded shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ĐANG XỬ LÝ...
                </>
              ) : (
                <>
                  ĐĂNG KÝ NHÀ TUYỂN DỤNG
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
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Đường gạch ngang và dẫn hướng Đăng nhập */}
          <div className="mt-6 pt-5 border-t border-slate-150 text-center">
            <span className="text-xs text-slate-400 font-semibold">
              Đã có tài khoản?{" "}
            </span>
            <Link
              to="/login"
              className="text-xs font-bold text-slate-900 uppercase tracking-wider hover:underline ml-1"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </main>

      {/* Hướng dẫn đăng ký ứng viên dưới ô đăng ký */}
      <div className="text-center text-[13px] font-medium text-slate-500 mb-10 pt-5">
        <span>Bạn đang tìm kiếm cơ hội nghề nghiệp? </span>
        <Link
          to="/register-candidate"
          className="text-[#6366f1] hover:text-[#4f46e5] font-semibold hover:underline transition-all"
        >
          Đăng ký tài khoản ứng viên
        </Link>
      </div>

      {/* Footer chung dưới chân trang */}
      <Footer />
    </div>
  );
}
