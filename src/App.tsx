import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { CVTemplatePage } from './pages/candidate/CVTemplatePage';

// Login & Forgot Password
import { LoginPage } from './pages/auth/Login';
import { ForgotPasswordPage } from './pages/auth/ForgotPassword';

// Register
import { CandidateRegisterPage } from './pages/auth/RegisterCandidate';
import { EnterpriseRegisterPage } from './pages/auth/RegisterEnterprise';

// Admin imports
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminJobs } from './pages/admin/AdminJobs';
import { AdminTemplates } from './pages/admin/AdminTemplates';
import { AdminSystem } from './pages/admin/AdminSystem';



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
import FindJobs from "./pages/candidate/FindJobs";
import SavedJobs from "./pages/candidate/SavedJobs";
import Chat from "./pages/candidate/Chat";

// ── Public Job Search ─────────────────────────────────────────────────────────
import JobSearch from "./pages/public/JobSearch";

// ── Recruiter Layout & Pages ──────────────────────────────────────────────────
import { RecruiterOverviewPage } from "./pages/recruiter/Overview";

import { PostJobPage } from "./pages/recruiter/PostJob";
import { ManageJobsPage } from "./pages/recruiter/ManageJobs";
import { ManageCandidatesPage } from "./pages/recruiter/ManageCandidates";
import { SettingsPage } from "./pages/recruiter/Settings";
import { RecruiterChatPage } from "./pages/recruiter/Chat";
import { RecruiterNotificationsPage } from "./pages/recruiter/Notifications";

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
        </Route>

        {/* PHÂN HỆ QUẢN TRỊ ADMIN PORTAL */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Đăng ký và đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register-candidate" element={<CandidateRegisterPage />} />
        <Route path="/register-enterprise" element={<EnterpriseRegisterPage />} />

        {/* ── Candidate Layout (Sidebar + Topbar) ── */}
        <Route path="/candidate" element={<DashboardLayout role="candidate" />}>
          {/* Redirect /candidate → /candidate/overview */}
          <Route index element={<Navigate to="overview" replace />} />

          <Route path="overview" element={<Overview />} />
          <Route path="applied-jobs" element={<AppliedJobs />} />
          <Route path="my-cvs" element={<MyCVs />} />
          <Route path="notifications" element={<Notifications />} />

          {/* UC-03 Tìm việc, UC-09 Việc đã lưu, UC-21 Trò chuyện */}
          <Route path="find-jobs" element={<FindJobs />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="chat" element={<Chat />} />

          {/* UC-05 Thiết lập CV: Gộp luồng mẫu CV và thiết kế CV */}
          <Route path="create-cv" element={<CVTemplatePage />} />
          <Route path="cv-builder" element={<CVBuilder />} />
          <Route path="cv-templates" element={<CVTemplatePage />} />

        </Route>

        {/* ── Recruiter Layout (Sidebar + Topbar) ── */}
        <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
          <Route index element={<RecruiterOverviewPage />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="manage-jobs" element={<ManageJobsPage />} />
          <Route path="candidates" element={<ManageCandidatesPage />} />
          <Route path="chat" element={<RecruiterChatPage />} />
          <Route path="notifications" element={<RecruiterNotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Group Route Admin có bọc Layout Sidebar cố định & Xác thực tự động */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="system" element={<AdminSystem />} />
        </Route>

        {/* Tự động điều hướng các trang lỗi không khớp về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;