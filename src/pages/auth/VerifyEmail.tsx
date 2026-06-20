import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/layout/Footer";

type VerifyState = "verifying" | "success" | "already" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const token = searchParams.get("token") || "";

  const [state, setState] = useState<VerifyState>("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setState("error");
      setErrorMsg("Liên kết xác nhận không hợp lệ. Thiếu mã token.");
      return;
    }

    (async () => {
      try {
        const res = await verifyEmail(token);
        if (res.success) {
          setState(res.data?.alreadyVerified ? "already" : "success");
          setTimeout(() => navigate("/login"), 4000);
        } else {
          setState("error");
          setErrorMsg(res.message || "Xác nhận email thất bại.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setState("error");
        setErrorMsg(
          err.response?.data?.message ||
            err.message ||
            "Liên kết xác nhận không hợp lệ hoặc đã hết hạn.",
        );
      }
    })();
  }, [token, verifyEmail, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendInfo(null);
    setResendLoading(true);
    try {
      const res = await resendVerification(resendEmail);
      setResendInfo(
        res.message ||
          "Nếu email tồn tại và chưa được xác nhận, bạn sẽ nhận được email xác nhận mới.",
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setResendInfo(
        err.response?.data?.message ||
          err.message ||
          "Gửi lại email xác nhận thất bại. Vui lòng thử lại sau.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col justify-between text-slate-800">
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-125 bg-white border border-slate-200/80 rounded-lg shadow-sm p-8 text-left">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-900 leading-none tracking-tight">
              Xác nhận email
            </h2>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Đang xử lý yêu cầu xác nhận tài khoản của bạn.
            </p>
          </div>

          {state === "verifying" && (
            <div className="flex items-center gap-3 py-6">
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-600 font-semibold">
                Đang xác nhận email...
              </span>
            </div>
          )}

          {(state === "success" || state === "already") && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-start gap-3 mb-6">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[11px] font-black">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-emerald-800 font-bold text-[13px] leading-snug">
                  {state === "success"
                    ? "Xác nhận email thành công!"
                    : "Tài khoản đã được xác nhận trước đó."}
                </p>
                <p className="text-emerald-600 text-[12px] mt-1 leading-relaxed">
                  Bạn có thể đăng nhập ngay bây giờ.
                </p>
                <p className="text-emerald-500 text-[11px] mt-2 italic">
                  Đang chuyển hướng về trang đăng nhập trong giây lát...
                </p>
              </div>
            </div>
          )}

          {state === "error" && (
            <>
              <div className="bg-[#fff1f2] border border-red-100 p-4 rounded-sm flex items-start gap-3 mb-6">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[11px] font-black">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-600 font-bold text-[12px] leading-snug">
                    Xác nhận email thất bại
                  </p>
                  <p className="text-red-500 text-[11px] mt-1 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              </div>

              <form onSubmit={handleResend} className="space-y-3">
                <p className="text-xs text-slate-600 font-semibold">
                  Nhập email đã đăng ký để nhận lại liên kết xác nhận:
                </p>
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Email đã đăng ký"
                  className="w-full h-11 border border-slate-200 rounded px-4 text-sm outline-none focus:border-slate-800 transition-all bg-white text-slate-800 placeholder:text-slate-300"
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full h-11 bg-slate-900 text-white font-bold text-xs tracking-widest hover:bg-slate-800 transition-all rounded shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ĐANG GỬI...
                    </>
                  ) : (
                    "GỬI LẠI EMAIL XÁC NHẬN"
                  )}
                </button>
                {resendInfo && (
                  <p className="text-xs text-slate-600 italic mt-2">{resendInfo}</p>
                )}
              </form>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-slate-150 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-900 uppercase tracking-wider hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
