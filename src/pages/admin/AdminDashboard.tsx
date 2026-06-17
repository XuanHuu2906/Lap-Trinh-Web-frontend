import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Users,
  Building2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "../../services/admin.service";
import { getAdminBadgeClass } from "../../utils/adminBadge";
import { JOB_STATUS } from "../../utils/job-status";
import { useToast } from "../../components/common/toast";

const getErrorMessage = (err: unknown): string => {
  if (typeof err === "object" && err !== null) {
    const response = "response" in err
      ? (err as { response?: { data?: { message?: string } } }).response
      : undefined;
    const message = "message" in err ? (err as { message?: unknown }).message : undefined;

    return response?.data?.message || (typeof message === "string" ? message : "");
  }

  return "";
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setHasLoadError(false);
        const response = await getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setHasLoadError(true);
          toast({ title: response.message || "Không thể tải dữ liệu thống kê", variant: "error" });
        }
      } catch (err: unknown) {
        console.error("Lỗi khi tải thống kê:", err);
        setHasLoadError(true);
        toast({ title: getErrorMessage(err) || "Đã xảy ra lỗi khi kết nối đến máy chủ", variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const formatRelativeTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return "Vừa xong";

      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) {
        return "Vừa xong";
      } else if (diffMins < 60) {
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else {
        return `${diffDays} ngày trước`;
      }
    } catch {
      return "Vừa xong";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return Users;
      case "recruiter_reg":
        return Building2;
      case "cv_created":
        return FileText;
      case "approval":
        return Clock;
      case "job_posted":
        return Briefcase;
      default:
        return Clock;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in font-sans">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse"></div>
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse"></div>
        </div>

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 p-5 rounded-sm shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse"></div>
              </div>
              <div className="flex justify-between items-end">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse"></div>
                <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm p-6 space-y-6">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse border-b border-slate-100 dark:border-slate-800 pb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-start gap-3 w-full">
                    <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse shrink-0"></div>
                    <div className="space-y-2 w-2/3">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse"></div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm p-6 space-y-6">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse border-b border-slate-100 dark:border-slate-800 pb-4"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse"></div>
                    <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse"></div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800/70 rounded-sm animate-pulse w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasLoadError) {
    return (
      <div className="space-y-8 animate-fade-in font-sans">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              TỔNG QUAN HỆ THỐNG
            </h1>
          </div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-sm p-6 text-center max-w-2xl mx-auto my-12">
          <h3 className="text-sm font-extrabold text-rose-800 dark:text-rose-200 uppercase tracking-wider mb-2">
            Không thể tải dữ liệu thống kê
          </h3>
          <p className="text-xs text-rose-600 dark:text-rose-300 font-medium mb-6">
            Vui lòng thử tải lại trang
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-200 bg-white dark:bg-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-sm transition-colors cursor-pointer"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // KPIs Configuration using fetched data
  const kpis = [
    {
      title: "TIN ĐĂNG TUYỂN DỤNG",
      value: stats?.kpis.jobs.toLocaleString("vi-VN") || "0",
      icon: Briefcase,
      color: "text-blue-600",
      darkColor: "dark:text-blue-300",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-950/40",
      borderColor: "border-blue-100",
    },
    {
      title: "CV ĐÃ ĐƯỢC TẠO",
      value: stats?.kpis.cvs.toLocaleString("vi-VN") || "0",
      icon: FileText,
      color: "text-indigo-600",
      darkColor: "dark:text-indigo-300",
      bgColor: "bg-indigo-50",
      darkBgColor: "dark:bg-indigo-950/40",
      borderColor: "border-indigo-100",
    },
    {
      title: "ỨNG VIÊN ĐĂNG KÝ",
      value: stats?.kpis.candidates.toLocaleString("vi-VN") || "0",
      icon: Users,
      color: "text-emerald-600",
      darkColor: "dark:text-emerald-300",
      bgColor: "bg-emerald-50",
      darkBgColor: "dark:bg-emerald-950/40",
      borderColor: "border-emerald-100",
    },
    {
      title: "DOANH NGHIỆP ĐĂNG KÝ",
      value: stats?.kpis.recruiters.toLocaleString("vi-VN") || "0",
      icon: Building2,
      color: "text-amber-600",
      darkColor: "dark:text-amber-300",
      bgColor: "bg-amber-50",
      darkBgColor: "dark:bg-amber-950/40",
      borderColor: "border-amber-100",
    },
  ];

  // 1. Account ratio calculations
  const totalUsers = (stats?.kpis.candidates || 0) + (stats?.kpis.recruiters || 0);
  const cRatio = totalUsers > 0 ? Math.round(((stats?.kpis.candidates || 0) / totalUsers) * 100) : 0;
  const rRatio = totalUsers > 0 ? 100 - cRatio : 0;

  // 2. Job breakdown status calculations
  const totalJobs = stats?.kpis.jobs || 0;
  const activeJobs =
    stats?.jobsBreakdown.active ??
    ((stats?.jobsBreakdown[JOB_STATUS.ACTIVE] || 0) + (stats?.jobsBreakdown.approved || 0));
  const pendingJobs =
    stats?.jobsBreakdown.pending ?? (stats?.jobsBreakdown[JOB_STATUS.PENDING_REVIEW] || 0);

  const activePercent = totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0;
  const pendingPercent = totalJobs > 0 ? Math.round((pendingJobs / totalJobs) * 100) : 0;
  const otherPercent = totalJobs > 0 ? Math.max(0, 100 - activePercent - pendingPercent) : 0;

  // 3. CV types breakdown calculations
  const totalCvs = stats?.kpis.cvs || 0;
  const builtCvs = (stats?.cvsBreakdown.built || 0) + (stats?.cvsBreakdown.online || 0);

  const builtPercent = totalCvs > 0 ? Math.round((builtCvs / totalCvs) * 100) : 0;
  const uploadedPercent = totalCvs > 0 ? Math.max(0, 100 - builtPercent) : 0;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* 2. KPIS SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900/80 border ${kpi.borderColor} dark:border-slate-800 p-5 rounded-sm shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-xs`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">
                  {kpi.title}
                </span>
                <div
                  className={`w-8 h-8 ${kpi.bgColor} ${kpi.darkBgColor} ${kpi.color} ${kpi.darkColor} rounded-sm flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-50 leading-none">
                    {kpi.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. DUAL GRID: ACTIVITIES + ANALYTICS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Activities (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wider">
                Nhật ký hoạt động hệ thống gần đây
              </h3>
            </div>
            <Link to="/admin/activity-logs" className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
              Xem tất cả
            </Link>
          </div>

          {/* List of activities */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.activities && stats.activities.length > 0 ? (
              stats.activities.map((act) => {
                const Icon = getActivityIcon(act.type);
                return (
                  <div
                    key={act.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-sm flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 dark:text-slate-300 leading-normal">
                          <strong className="text-slate-950 dark:text-slate-50 font-bold">
                            {act.user}
                          </strong>{" "}
                          {act.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
                          {formatRelativeTime(act.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="self-start sm:self-auto">
                      <span
                        className={`inline-flex px-2.5 py-1 border text-[10px] font-bold uppercase rounded-2xs ${getAdminBadgeClass(act.badgeColor)}`}
                      >
                        {act.badgeText}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Chưa có hoạt động nào được ghi nhận</p>
            )}
          </div>
        </div>

        {/* Right Column: Business Analytics & Shortcuts (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Business Analytics Card */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs p-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                PHÂN TÍCH TRẠNG THÁI & TÀI KHOẢN
              </h3>
            </div>

            <div className="space-y-5">
              {/* Metric 1: Account breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tỷ lệ người dùng (Ứng viên / DN)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-50">
                    {(stats?.kpis.candidates || 0).toLocaleString("vi-VN")} / {(stats?.kpis.recruiters || 0).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="w-full h-2 bg-amber-500 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${cRatio}%` }}
                    title={`Ứng viên (${cRatio}%)`}
                  ></div>
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${rRatio}%` }}
                    title={`Doanh nghiệp (${rRatio}%)`}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-indigo-600 font-bold">
                    Ứng viên ({cRatio}%)
                  </span>
                  <span className="text-[9px] text-amber-600 font-bold">
                    Doanh nghiệp ({rRatio}%)
                  </span>
                </div>
              </div>

              {/* Metric 2: Job approvals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Trạng thái Tin tuyển dụng
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-50">
                    {(stats?.kpis.jobs || 0).toLocaleString("vi-VN")} tin
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${activePercent}%` }}
                    title={`Đang hiển thị (${activePercent}%)`}
                  ></div>
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${pendingPercent}%` }}
                    title={`Chờ duyệt (${pendingPercent}%)`}
                  ></div>
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${otherPercent}%` }}
                    title={`Khác (${otherPercent}%)`}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-emerald-600 font-bold">
                    Đang hiển thị ({activePercent}%)
                  </span>
                  <span className="text-[9px] text-amber-600 font-bold">
                    Chờ duyệt ({pendingPercent}%)
                  </span>
                  <span className="text-[9px] text-rose-600 font-bold">
                    Khác ({otherPercent}%)
                  </span>
                </div>
              </div>

              {/* Metric 3: CV Quality template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mẫu CV tạo trên hệ thống
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-50">
                    {(stats?.kpis.cvs || 0).toLocaleString("vi-VN")} CV
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${builtPercent}%` }}
                    title={`Sử dụng mẫu chuẩn (${builtPercent}%)`}
                  ></div>
                  <div
                    className="h-full bg-slate-300 transition-all duration-500"
                    style={{ width: `${uploadedPercent}%` }}
                    title={`Tải lên trực tiếp (${uploadedPercent}%)`}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-emerald-600 font-bold">
                    Mẫu chuẩn ({builtPercent}%)
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold">
                    Tự tải lên ({uploadedPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
