import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  CANDIDATE_PROFILE_CHANGED_EVENT,
  candidateService,
  getCachedCandidateProfile,
  type CandidateProfile,
} from "@/services/candidate.service";
import { AdminSidebar } from "../components/Sidebar/AdminSidebar";
import { CandidateSidebar } from "../components/Sidebar/CandidateSidebar";
import { RecruiterSidebar } from "../components/Sidebar/RecruiterSidebar";
import { Topbar } from "../components/Topbar/Topbar";
import { useToast } from "../components/common/toast";

type DashboardRole = "candidate" | "recruiter" | "admin";

interface DashboardLayoutProps {
  role: DashboardRole;
}

const getAssetUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${serverUrl}${url}`;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "UV";

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const cachedCandidateProfile = getCachedCandidateProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCandidateSidebarCollapsed, setIsCandidateSidebarCollapsed] =
    useState(false);
  const [candidateProfile, setCandidateProfile] =
    useState<CandidateProfile | null>(cachedCandidateProfile?.data ?? null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (role !== "candidate") return;

    let isMounted = true;

    const loadCandidateProfile = async () => {
      try {
        const response = await candidateService.getProfile();
        if (isMounted) setCandidateProfile(response.data);
      } catch {
        if (isMounted) setCandidateProfile(null);
      }
    };

    loadCandidateProfile();

    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    if (role !== "candidate") return;

    const handleCandidateProfileChanged = (event: Event) => {
      const { detail } = event as CustomEvent<Partial<CandidateProfile>>;

      setCandidateProfile((current) => {
        if (current) return { ...current, ...detail };

        void candidateService
          .getProfile(true)
          .then((response) => setCandidateProfile(response.data))
          .catch(() => setCandidateProfile(null));

        return current;
      });
    };

    window.addEventListener(
      CANDIDATE_PROFILE_CHANGED_EVENT,
      handleCandidateProfileChanged,
    );

    return () => {
      window.removeEventListener(
        CANDIDATE_PROFILE_CHANGED_EVENT,
        handleCandidateProfileChanged,
      );
    };
  }, [role]);

  const dashboardUser = useMemo(() => {
    if (role === "candidate") {
      const name = candidateProfile?.fullName || user?.fullName || "Ứng viên";
      const email = candidateProfile?.user?.email || user?.email || "";

      return {
        name,
        email,
        initials: getInitials(name),
        avatarUrl: getAssetUrl(candidateProfile?.avatarUrl),
        roleLabel: "Ứng viên",
        profilePath: "/candidate/settings",
      };
    }

    if (role === "admin") {
      return {
        name: user?.fullName || "Admin Administrator",
        email: user?.email || "admin@hirearch.com",
        initials: "AD",
        roleLabel: "Super Admin",
        profilePath: "/admin/system",
      };
    }

    return {
      name: user?.fullName || "Nguyễn Văn Recruiter",
      email: user?.email || "recruiter@hirearch.com",
      initials: "NR",
      roleLabel: "HR Manager",
      profilePath: "/recruiter/settings",
    };
  }, [candidateProfile, role, user]);

  const handleLogout = async () => {
    if (role === "admin") {
      localStorage.removeItem("isAdminAuthenticated");
      toast({
        title: "Đăng xuất Admin thành công",
        variant: "success",
      });
      navigate("/admin/login");
      return;
    }

    await logout();
    navigate("/login");
  };

  const renderSidebar = (isMobileView: boolean) => {
    const props = {
      pathname,
      onLogout: handleLogout,
      onCloseMobile: () => setIsSidebarOpen(false),
      isMobile: isMobileView,
    };

    if (role === "candidate") {
      return (
        <CandidateSidebar
          {...props}
          isCollapsed={isCandidateSidebarCollapsed}
          onToggleCollapse={() =>
            setIsCandidateSidebarCollapsed((current) => !current)
          }
        />
      );
    }

    if (role === "recruiter") {
      return <RecruiterSidebar {...props} />;
    }

    return <AdminSidebar {...props} />;
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50/50 font-sans text-slate-800 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
      {renderSidebar(false)}

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setIsSidebarOpen(false)}
          />
          {renderSidebar(true)}
        </div>
      ) : null}

      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-200 ${
          role === "candidate" && isCandidateSidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-65"
        }`}
      >
        <Topbar
          role={role}
          pathname={pathname}
          onOpenMobileSidebar={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
          user={dashboardUser}
        />

        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
