import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../../components/layout/Footer";

export function SetupProfilePage() {
  const navigate = useNavigate();
  const { user, completeOnboarding, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter" | "">("");
  const [companyName, setCompanyName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Điền sẵn tên từ metadata Google của người dùng
  useEffect(() => {
    if (user && user.fullName) {
      // Nếu tên hiển thị chứa email hoặc placeholder thì để trống để người dùng nhập
      if (!user.fullName.includes("@")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFullName(user.fullName);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    // Xác thực cơ bản ở client
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    if (!role) {
      setError(
        "Vui lòng lựa chọn vai trò của bạn (Ứng viên hoặc Nhà tuyển dụng).",
      );
      return;
    }

    if (role === "recruiter" && !companyName.trim()) {
      setError("Nhà tuyển dụng bắt buộc phải nhập Tên công ty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await completeOnboarding(
        role,
        fullName.trim(),
        role === "recruiter" ? companyName.trim() : null,
      );
      if (res.success) {
        // Điều hướng trực tiếp dựa vào vai trò sau khi hoàn tất thành công
        if (role === "candidate") {
          navigate("/candidate/overview");
        } else if (role === "recruiter") {
          navigate("/recruiter/overview");
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Lỗi khi hoàn tất thiết lập hồ sơ:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      setError(errMsg);
      setIsSubmitting(false); // Cho phép thử lại nếu xảy ra lỗi
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Đăng xuất thất bại:", err);
    }
  };

  return (
    <div className="full-screen-page min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-between text-slate-800">
      {/* HEADER LOGO */}
      <header className="w-full px-6 sm:px-12 md:px-16 pt-6 pb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-sm shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
            </svg>
          </div>
          <span className="text-slate-900 text-[20px] font-extrabold tracking-widest uppercase">
            HIREARCH{" "}
            <span className="text-slate-500 font-medium text-base">
              ONBOARDING
            </span>
          </span>
        </div>
        <button
          onClick={handleLogoutClick}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          Đăng xuất
        </button>
      </header>

      {/* ONBOARDING FORM BOX */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
          <div className="bg-linear-to-r from-slate-900 to-slate-800 px-8 py-10 text-white text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Chào mừng đến với HireArch!
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Chúng tôi rất vui mừng được đồng hành cùng bạn. Chỉ mất 30 giây để
              bắt đầu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-red-800">
                  {error}
                </span>
              </div>
            )}

            {/* INPUT HO TEN */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-bold text-slate-700 uppercase tracking-wider"
              >
                Họ và Tên của bạn
              </label>
              <input
                id="fullName"
                type="text"
                disabled={isSubmitting}
                placeholder="Nhập đầy đủ họ và tên..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            {/* CHON VAI TRO */}
            <div className="space-y-3">
              <span className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                Tôi muốn tham gia với vai trò
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CARD CANDIDATE */}
                <div
                  onClick={() => !isSubmitting && setRole("candidate")}
                  className={`border-2 rounded-xl p-5 cursor-pointer flex flex-col justify-between h-44 transition-all duration-300 transform ${
                    role === "candidate"
                      ? "border-slate-950 bg-slate-50/50 scale-[1.02] shadow-md"
                      : "border-slate-200 hover:border-slate-400 hover:scale-[1.01]"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-lg text-indigo-600">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        role === "candidate"
                          ? "border-slate-950 bg-slate-950"
                          : "border-slate-300"
                      }`}
                    >
                      {role === "candidate" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Ứng viên tìm việc
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Tìm kiếm cơ hội việc làm mơ ước, xây dựng CV ấn tượng trực
                      tuyến và ứng tuyển nhanh chóng.
                    </p>
                  </div>
                </div>

                {/* CARD RECRUITER */}
                <div
                  onClick={() => !isSubmitting && setRole("recruiter")}
                  className={`border-2 rounded-xl p-5 cursor-pointer flex flex-col justify-between h-44 transition-all duration-300 transform ${
                    role === "recruiter"
                      ? "border-slate-950 bg-slate-50/50 scale-[1.02] shadow-md"
                      : "border-slate-200 hover:border-slate-400 hover:scale-[1.01]"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center rounded-lg text-emerald-600">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                        />
                      </svg>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        role === "recruiter"
                          ? "border-slate-950 bg-slate-950"
                          : "border-slate-300"
                      }`}
                    >
                      {role === "recruiter" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Nhà tuyển dụng
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Đăng tin tuyển dụng nhân sự, tìm kiếm ứng viên xuất sắc và
                      quản lý quy trình ứng tuyển tối ưu.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* INPUT TEN CONG TY (TRUOT XUONG KHI CHON RECRUITER) */}
            <div
              className={`transition-all duration-500 overflow-hidden ${
                role === "recruiter"
                  ? "max-h-32 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <div className="space-y-2 pt-2">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-bold text-slate-700 uppercase tracking-wider"
                >
                  Tên Công ty / Doanh nghiệp
                </label>
                <input
                  id="companyName"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Nhập tên doanh nghiệp tuyển dụng..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Đang thiết lập hồ sơ của bạn...
                  </>
                ) : (
                  <>
                    Hoàn tất và bắt đầu trải nghiệm
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
export default SetupProfilePage;
