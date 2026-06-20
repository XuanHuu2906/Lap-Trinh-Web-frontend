import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/layout/Footer";

export function CandidateRegisterPage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();

  const [fullName, setFullName] = useState("");
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
      const res = await registerCandidate({
        fullName,
        email,
        password,
        confirmPassword,
      });
      if (res.success) {
        const registeredEmail = email;
        setSuccessMsg(
          res.message ||
            "Đăng ký ứng viên thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
        );

        // Làm sạch các trường dữ liệu
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreeTerms(false);

        // Chuyển hướng sang trang hướng dẫn kiểm tra email
        setTimeout(() => {
          navigate("/email-sent", { state: { email: registeredEmail } });
        }, 1500);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Lỗi đăng ký ứng viên:", err);
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
      {/* Vùng không gian ở giữa để căn thẻ đăng ký */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {/* Thẻ đăng ký (Card) màu trắng nổi bật ở giữa */}
        <div className="w-full max-w-125 bg-white border border-slate-200/80 rounded-lg shadow-sm p-8 text-left">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
              Đăng ký ứng viên
            </h2>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Vui lòng cung cấp thông tin để tạo hồ sơ cá nhân của bạn.
            </p>
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
                  Đang chuyển hướng để kiểm tra email...
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
            {/* Họ và tên */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Họ và tên
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
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
                  placeholder="VD: ungvien@congty.vn"
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
                id="candidate-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 border border-slate-200 accent-slate-900 cursor-pointer shrink-0"
              />
              <label
                htmlFor="candidate-terms"
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
                  ĐĂNG KÝ ỨNG VIÊN
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
      {/* Hướng dẫn tạo trang doanh nghiệp dưới ô đăng ký */}
      <div className="text-center text-[13px] font-medium text-slate-500 mb-10">
        <span>Bạn đang muốn tạo tài khoản doanh nghiệp? </span>
        <Link
          to="/register-enterprise"
          className="text-[#6366f1] hover:text-[#4f46e5] font-semibold hover:underline transition-all"
        >
          Đăng ký tài khoản doanh nghiệp
        </Link>
      </div>

      {/* Footer chung dưới đáy trang */}
      <Footer />
    </div>
  );
}
