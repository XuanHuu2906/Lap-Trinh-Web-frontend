import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";

import Home from "./pages/Home";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminJobs } from "./pages/admin/AdminJobs";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLogs } from "./pages/admin/AdminLogs";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminSystem } from "./pages/admin/AdminSystem";
import { AdminTemplates } from "./pages/admin/AdminTemplates";
import { ForgotPasswordPage } from "./pages/auth/ForgotPassword";
import { LoginPage } from "./pages/auth/Login";
import { CandidateRegisterPage } from "./pages/auth/RegisterCandidate";
import { EnterpriseRegisterPage } from "./pages/auth/RegisterEnterprise";
import { ResetPasswordPage } from "./pages/auth/ResetPassword";
import { SetupProfilePage } from "./pages/auth/SetupProfile";
import AppliedJobs from "./pages/candidate/AppliedJobs";
import Chat from "./pages/candidate/Chat";
import CVBuilder from "./pages/candidate/CVBuilder";
import CVTemplatePage from "./pages/candidate/CVTemplatePage";
import MyCVs from "./pages/candidate/MyCVs";
import Notifications from "./pages/candidate/Notifications";
import Overview from "./pages/candidate/Overview";
import SavedJobs from "./pages/candidate/SavedJobs";
import CandidateSettings from "./pages/candidate/Settings";
import JobDetail from "./pages/public/JobDetail";
import JobList from "./pages/public/JobList";
import JobSearch from "./pages/public/JobSearch";
import CompanyProfile from "./pages/public/CompanyProfile";
import { RecruiterChatPage } from "./pages/recruiter/Chat";
import { ManageCandidatesPage } from "./pages/recruiter/ManageCandidates";
import { ManageJobsPage } from "./pages/recruiter/ManageJobs";
import { RecruiterNotificationsPage } from "./pages/recruiter/Notifications";
import { RecruiterOverviewPage } from "./pages/recruiter/Overview";
import { PostJobPage } from "./pages/recruiter/PostJob";
import { RecruiterJobDetailPage } from "./pages/recruiter/RecruiterJobDetail";
import { SettingsPage } from "./pages/recruiter/Settings";
import EmployerHome from "./pages/EmployerHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="employers" element={<EmployerHome />} />
          <Route path="jobs" element={<JobList />} />
          <Route path="jobs/:id" element={<JobDetail variant="public" />} />
          <Route
            path="companies/:recruiterId"
            element={<CompanyProfile variant="public" />}
          />
          <Route path="cv-templates" element={<CVTemplatePage />} />
          <Route path="resources" element={<Navigate to="/cv-templates" replace />} />
          <Route
            path="resources/cv-templates"
            element={<Navigate to="/cv-templates" replace />}
          />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<CandidateRegisterPage />} />
        <Route path="/register-candidate" element={<CandidateRegisterPage />} />
        <Route path="/register-employer" element={<EnterpriseRegisterPage />} />
        <Route path="/register-enterprise" element={<EnterpriseRegisterPage />} />

        <Route element={<ProtectedRoute allowedRoles={["pending"]} />}>
          <Route path="/auth/setup-profile" element={<SetupProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
          <Route path="/candidate" element={<DashboardLayout role="candidate" />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="applied-jobs" element={<AppliedJobs />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="my-cvs" element={<MyCVs />} />
            <Route path="job-search" element={<JobSearch variant="candidate" />} />
            <Route path="find-jobs" element={<JobSearch variant="candidate" />} />
            <Route path="jobs/:id" element={<JobDetail variant="candidate" />} />
            <Route
              path="companies/:recruiterId"
              element={<CompanyProfile variant="candidate" />}
            />
            <Route path="chat" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="cv-templates" element={<CVTemplatePage />} />
            <Route path="cv-builder" element={<CVBuilder />} />
            <Route path="settings" element={<CandidateSettings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
          <Route path="/recruiter" element={<DashboardLayout role="recruiter" />}>
            <Route index element={<RecruiterOverviewPage />} />
            <Route path="overview" element={<RecruiterOverviewPage />} />
            <Route path="post-job" element={<PostJobPage />} />
            <Route path="manage-jobs" element={<ManageJobsPage />} />
            <Route path="manage-jobs/:id" element={<RecruiterJobDetailPage />} />
            <Route path="manage-jobs/:id/edit" element={<PostJobPage />} />
            <Route path="candidates" element={<ManageCandidatesPage />} />
            <Route path="chat" element={<RecruiterChatPage />} />
            <Route path="notifications" element={<RecruiterNotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="templates" element={<AdminTemplates />} />
            <Route path="system" element={<AdminSystem />} />
            <Route path="activity-logs" element={<AdminLogs />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
