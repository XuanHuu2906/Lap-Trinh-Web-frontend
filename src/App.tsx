import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import CVTemplatePage from "./pages/candidate/CVTemplatePage";
import { LoginPage } from "./pages/auth/Login";
import { CandidateRegisterPage } from "./pages/auth/RegisterCandidate";

// ── Public pages ──────────────────────────────────────────────────────────────
import Home from "./pages/Home";
import JobList from "./pages/public/JobList";
import JobDetail from "./pages/public/JobDetail";
import JobSearch from "./pages/public/JobSearch";

// ── Auth / Admin ──────────────────────────────────────────────────────────────
import { AdminLogin } from "./pages/admin/AdminLogin";
import { ForgotPasswordPage } from "./pages/auth/ForgotPassword";
import { EnterpriseRegisterPage } from "./pages/auth/RegisterEnterprise";

// ── Candidate pages ───────────────────────────────────────────────────────────
import CandidateLayout from "./components/layout/CandidateLayout";
import Overview from "./pages/candidate/Overview";
import AppliedJobs from "./pages/candidate/AppliedJobs";
import MyCVs from "./pages/candidate/MyCVs";
import SavedJobs from "./pages/candidate/SavedJobs";
import Notifications from "./pages/candidate/Notifications";
import CVBuilder from "./pages/candidate/CVBuilder";
import Chat from "./pages/candidate/Chat";

// ── Recruiter pages ───────────────────────────────────────────────────────────
import { RecruiterOverviewPage } from "./pages/recruiter/Overview";
import { PostJobPage } from "./pages/recruiter/PostJob";
import { ManageJobsPage } from "./pages/recruiter/ManageJobs";
import { ManageCandidatesPage } from "./pages/recruiter/ManageCandidates";
import { SettingsPage } from "./pages/recruiter/Settings";
import { RecruiterChatPage } from "./pages/recruiter/Chat";
import { RecruiterNotificationsPage } from "./pages/recruiter/Notifications";

// ── Admin pages ───────────────────────────────────────────────────────────────
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminJobs } from "./pages/admin/AdminJobs";
import { AdminTemplates } from "./pages/admin/AdminTemplates";
import { AdminSystem } from "./pages/admin/AdminSystem";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Layout (Header & Footer) ────────────────────────────── */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<JobList />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="job-search" element={<JobSearch />} />
          <Route path="cv-templates" element={<CVTemplatePage />} />
          <Route path="resources" element={<Navigate to="/cv-templates" replace />} />
          <Route path="resources/cv-templates" element={<Navigate to="/cv-templates" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── Admin ──────────────────────────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="system" element={<AdminSystem />} />
        </Route>

        {/* ── Auth ───────────────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register-candidate" element={<CandidateRegisterPage />} />
        <Route path="/register-enterprise" element={<EnterpriseRegisterPage />} />

        {/* ── Candidate Layout ───────────────────────────────────────────── */}
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="applied-jobs" element={<AppliedJobs />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="my-cvs" element={<MyCVs />} />
          <Route path="chat" element={<Chat />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cv-templates" element={<CVTemplatePage />} />
          <Route path="cv-builder" element={<CVBuilder />} />
        </Route>

        {/* ── Recruiter Layout ───────────────────────────────────────────── */}
        <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
          <Route index element={<RecruiterOverviewPage />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="manage-jobs" element={<ManageJobsPage />} />
          <Route path="candidates" element={<ManageCandidatesPage />} />
          <Route path="chat" element={<RecruiterChatPage />} />
          <Route path="notifications" element={<RecruiterNotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ── Fallback ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
