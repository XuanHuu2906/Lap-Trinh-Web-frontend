import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "../src/layouts/PublicLayout";
import CVTemplatePage from "./pages/candidate/CVTemplatePage";
import { LoginPage } from "./pages/auth/Login";
import { CandidateRegisterPage } from "./pages/auth/RegisterCandidate";
import { RecruiterRegisterPage } from "./pages/auth/RegisterEmployer";

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
import Overview from "./pages/candidate/Overview";
import AppliedJobs from "./pages/candidate/AppliedJobs";
import MyCVs from "./pages/candidate/MyCVs";
import Notifications from "./pages/candidate/Notifications";
import CandidateLayout from "./components/layout/CandidateLayout";
import CVBuilder from "./pages/candidate/CVBuilder";

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
          <Route
            path="resources"
            element={<Navigate to="/cv-templates" replace />}
          />
          <Route
            path="resources/cv-templates"
            element={<Navigate to="/cv-templates" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── Admin ────────────────────────────────────────────────────────── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Auth ─────────────────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register-candidate" element={<CandidateRegisterPage />} />
        <Route
          path="/register-enterprise"
          element={<EnterpriseRegisterPage />}
        />
        <Route path="/register" element={<CandidateRegisterPage />} />
        <Route path="/register-employer" element={<RecruiterRegisterPage />} />

        {/* ── Candidate Layout (Sidebar + Topbar) ─────────────────────────── */}
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="applied-jobs" element={<AppliedJobs />} />
          <Route path="my-cvs" element={<MyCVs />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cv-templates" element={<CVTemplatePage />} />
          <Route path="cv-builder" element={<CVBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
