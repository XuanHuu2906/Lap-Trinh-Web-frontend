import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { CVTemplatePage } from "./pages/candidate/CVTemplatePage";
import { LoginPage } from "./pages/auth/Login";
import { CandidateRegisterPage } from "./pages/auth/RegisterCandidate";
import { RecruiterRegisterPage } from "./pages/auth/RegisterEmployer";

// ── Trang mới ─────────────────────────────────────────────────────────────────
import Home from "./pages/Home";
import JobList from "./pages/JobList.tsx";
import JobDetail from "./pages/JobDetail.tsx";

// ── Candidate Layout & Pages ──────────────────────────────────────────────────
import Overview from "./pages/candidate/Overview";
import AppliedJobs from "./pages/candidate/AppliedJobs";
import MyCVs from "./pages/candidate/MyCVs";
import CVBuilder from "./pages/candidate/CVBuilder";
import Notifications from "./pages/candidate/Notifications";

// ── Public Job Search ─────────────────────────────────────────────────────────
import JobSearch from "./pages/public/JobSearch";

// ── Mock CV Builder ───────────────────────────────────────────────────────────
const MockCVBuilderPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const templateName = params.get("template") || "Mẫu thiết kế đã chọn";

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm w-full">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-4">
          UC-05: Tạo CV - Bước 4 (Giả lập)
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans">
          Trình thiết kế CV
        </h2>
        <p className="text-slate-500 text-sm mb-6 font-sans">
          Đã tải mẫu CV:{" "}
          <strong className="text-slate-800">{templateName}</strong>. Hãy bắt
          đầu nhập thông tin cá nhân, học vấn, kỹ năng để tạo CV của bạn.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              alert("Lưu CV thành công!");
              window.location.href = "/";
            }}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            Lưu CV vào hệ thống (Hoàn thành UC-05)
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2.5 border border-transparent text-slate-500 font-semibold text-sm rounded-sm hover:text-slate-700 transition-all cursor-pointer"
          >
            Quay lại chọn mẫu khác
          </button>
        </div>
      </div>
    </div>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Layout (Header & Footer) ── */}
        <Route path="/" element={<PublicLayout />}>
          {/* Trang chủ */}
          <Route index element={<Home />} />

          {/* Danh sách & chi tiết việc làm (public, có header/footer) */}
          <Route path="jobs" element={<JobList />} />
          <Route path="jobs/:id" element={<JobDetail />} />

          {/* Tìm việc nâng cao */}
          <Route path="job-search" element={<JobSearch />} />

          {/* CV Templates */}
          <Route path="cv-templates" element={<CVTemplatePage />} />
          <Route
            path="resources"
            element={<Navigate to="/cv-templates" replace />}
          />
          <Route
            path="resources/cv-templates"
            element={<Navigate to="/cv-templates" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── Candidate Layout (Sidebar + Topbar) ── */}
        <Route path="/candidate" element={<Overview />}>
          {/* Redirect /candidate → /candidate/overview */}
          <Route index element={<Navigate to="overview" replace />} />

          <Route path="overview" element={<Overview />} />
          <Route path="applied-jobs" element={<AppliedJobs />} />
          <Route path="my-cvs" element={<MyCVs />} />
          <Route path="cv-builder" element={<CVBuilder />} />
          <Route path="notifications" element={<Notifications />} />

          {/* CV Templates bên trong candidate layout */}
          <Route path="cv-templates" element={<CVTemplatePage />} />

          {/* Mock CV Builder (từ template chọn mẫu) — giữ nguyên route cũ */}
          <Route path="cv-builder-mock" element={<MockCVBuilderPage />} />
        </Route>

        {/* ── Auth — layout toàn màn hình ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<CandidateRegisterPage />} />
        <Route path="/register-candidate" element={<CandidateRegisterPage />} />
        <Route path="/register-employer" element={<RecruiterRegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
