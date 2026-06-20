import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/layout/Footer";

interface EmailSentState {
  email?: string;
}

export function EmailSentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();

  const state = (location.state as EmailSentState) || {};
  const [email, setEmail] = useState<string>(state.email || "");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInfo(null);
    setLoading(true);
    try {
      const res = await resendVerification(email);
      setInfo(
        res.message ||
          "Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư.",
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setInfo(
        err.response?.data?.message ||
          err.message ||
          "Gửi lại email thất bại. Vui lòng thử lại sau.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col justify-between text-slate-800">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-125 bg-white border border-slate-200/80 rounded-lg shadow-sm p-8 text-left">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-emerald-600"
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
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-none tracking-tight">
                Kiểm tra email của bạn
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                Chúng tôi đã gửi liên kết xác nhận đến hộp thư của bạn.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded text-[13px] text-slate-700 leading-relaxed mb-6">
            <p className="mb-2">
              {email ? (
                <>
                  Một email xác nhận đã được gửi đến{" "}
                  <span className="font-bold text-slate-900">{email}</span>.
                </>
              ) : (
                "Một email xác nhận đã được gửi đến địa chỉ email bạn đã đăng ký."
              )}
            </p>
            <p>
              Vui lòng kiểm tra hộp thư (kể cả thư mục spam) và nhấn vào nút{" "}
              <strong>“Xác nhận email”</strong> trong email để kích hoạt tài khoản.
              Liên kết sẽ hết hạn sau <strong>1 giờ</strong>.
            </p>
          </div>

          <form onSubmit={handleResend} className="space-y-3">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Không nhận được email?
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email đã đăng ký"
              className="w-full h-11 border border-slate-200 rounded px-4 text-sm outline-none focus:border-slate-800 transition-all bg-white text-slate-800 placeholder:text-slate-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 border border-slate-900 text-slate-900 font-bold text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ĐANG GỬI...
                </>
              ) : (
                "GỬI LẠI EMAIL XÁC NHẬN"
              )}
            </button>
            {info && (
              <p className="text-xs text-slate-600 italic">{info}</p>
            )}
          </form>

          <div className="mt-6 pt-5 border-t border-slate-150 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-xs font-bold text-slate-900 uppercase tracking-wider hover:underline cursor-pointer"
            >
              Đến trang đăng nhập
            </button>
            <Link
              to="/"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:underline"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
