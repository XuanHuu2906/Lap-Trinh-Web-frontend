import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Search,
  Users,
  Building2,
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shield,
  Activity,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  getSystemActivities,
  getAuditLogs,
  type SystemActivity,
  type AuditLog,
} from "../../services/admin.service";
import { getAdminBadgeClass } from "../../utils/adminBadge";
import { useToast } from "../../components/common/toast";

const PAGE_SIZE = 10;

type TabKey = "system" | "audit";

const ACTION_LABELS: Record<string, string> = {
  update_user: "Cập nhật người dùng",
  toggle_user_status: "Khóa/Mở tài khoản",
  delete_user: "Xóa người dùng",
  force_delete_job: "Xóa cứng tin tuyển dụng",
};

const ACTION_BADGE_COLORS: Record<string, string> = {
  update_user: "bg-blue-50 text-blue-700 border-blue-100",
  toggle_user_status: "bg-amber-50 text-amber-700 border-amber-100",
  delete_user: "bg-rose-50 text-rose-700 border-rose-100",
  force_delete_job: "bg-rose-50 text-rose-700 border-rose-100",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  user: "Người dùng",
  job_posting: "Tin tuyển dụng",
};

const SystemSkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-8"></div></td>
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-slate-200 rounded-sm"></div>
        <div className="h-4 bg-slate-200 rounded-xs w-48"></div>
      </div>
    </td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-64"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-24"></div></td>
    <td className="px-5 py-4 text-center"><div className="h-6 bg-slate-200 rounded-xs w-20 mx-auto"></div></td>
  </tr>
);

const AuditSkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-8"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-40"></div></td>
    <td className="px-5 py-4"><div className="h-6 bg-slate-200 rounded-xs w-32"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-28"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-48"></div></td>
    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded-xs w-24"></div></td>
  </tr>
);

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

const formatFullDateTime = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

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

    if (diffSecs < 60) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  } catch {
    return "Vừa xong";
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "registration": return Users;
    case "recruiter_reg": return Building2;
    case "cv_created": return FileText;
    case "approval": return Clock;
    case "job_posted": return Briefcase;
    default: return Clock;
  }
};

const formatDetails = (details: string | null): string => {
  if (!details) return "—";
  try {
    const obj = JSON.parse(details);
    return JSON.stringify(obj);
  } catch {
    return details;
  }
};

export const AdminLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("system");
  const { toast } = useToast();

  // === System activities tab state ===
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [hasActivitiesError, setHasActivitiesError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // === Audit logs tab state ===
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [hasAuditError, setHasAuditError] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [auditDateFilter, setAuditDateFilter] = useState("");

  const fetchActivities = useCallback(async () => {
    setIsLoadingActivities(true);
    setHasActivitiesError(false);
    try {
      const response = await getSystemActivities({
        page: activitiesPage,
        limit: PAGE_SIZE,
        type: typeFilter !== "all" ? typeFilter : undefined,
        search: searchTerm.trim() || undefined,
        date: dateFilter || undefined,
      });
      if (response.success && response.data) {
        setActivities(response.data);
        setActivitiesTotal(response.pagination?.total ?? 0);
      } else {
        throw new Error("Không thể tải nhật ký hoạt động");
      }
    } catch (err: unknown) {
      console.error(err);
      setHasActivitiesError(true);
      toast({ title: getErrorMessage(err) || "Đã xảy ra lỗi khi tải dữ liệu từ máy chủ.", variant: "error" });
    } finally {
      setIsLoadingActivities(false);
    }
  }, [activitiesPage, typeFilter, searchTerm, dateFilter, toast]);

  const fetchAudit = useCallback(async () => {
    setIsLoadingAudit(true);
    setHasAuditError(false);
    try {
      const response = await getAuditLogs({
        page: auditPage,
        limit: PAGE_SIZE,
        action: actionFilter !== "all" ? actionFilter : undefined,
        targetType: targetTypeFilter !== "all" ? targetTypeFilter : undefined,
        search: auditSearch.trim() || undefined,
        date: auditDateFilter || undefined,
      });
      if (response.success && response.data) {
        setAuditLogs(response.data);
        setAuditTotal(response.pagination?.total ?? 0);
      } else {
        throw new Error("Không thể tải nhật ký hành động admin");
      }
    } catch (err: unknown) {
      console.error(err);
      setHasAuditError(true);
      toast({ title: getErrorMessage(err) || "Đã xảy ra lỗi khi tải dữ liệu từ máy chủ.", variant: "error" });
    } finally {
      setIsLoadingAudit(false);
    }
  }, [auditPage, actionFilter, targetTypeFilter, auditSearch, auditDateFilter, toast]);

  useEffect(() => {
    if (activeTab === "system") fetchActivities();
  }, [activeTab, fetchActivities]);

  useEffect(() => {
    if (activeTab === "audit") fetchAudit();
  }, [activeTab, fetchAudit]);

  // Reset to page 1 khi filter thay đổi
  useEffect(() => { setActivitiesPage(1); }, [searchTerm, typeFilter, dateFilter]);
  useEffect(() => { setAuditPage(1); }, [auditSearch, actionFilter, targetTypeFilter, auditDateFilter]);

  const activitiesTotalPages = Math.ceil(activitiesTotal / PAGE_SIZE) || 1;
  const auditTotalPages = Math.ceil(auditTotal / PAGE_SIZE) || 1;
  const activitiesStartIndex = (activitiesPage - 1) * PAGE_SIZE;
  const auditStartIndex = (auditPage - 1) * PAGE_SIZE;

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void,
  ) => (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
        </Button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              onClick={() => setPage(pageNum)}
              className={`h-7 w-7 text-[10px] font-bold cursor-pointer ${currentPage === pageNum
                ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-650 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 pt-3 gap-2 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "system"
              ? "border-slate-900 dark:border-indigo-500 text-slate-900 dark:text-slate-50 font-extrabold"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
              }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Nhật ký hệ thống
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "audit"
              ? "border-slate-900 dark:border-indigo-500 text-slate-900 dark:text-slate-50 font-extrabold"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
              }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Hành động Admin
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "system" ? (
            <>
              {/* Filters row */}
              <div className="flex flex-col xl:flex-row items-center gap-4 justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                    <Search className="w-4 h-4" />
                  </span>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên người dùng, email, công ty..."
                    className="w-full h-9 pl-10 pr-3 text-xs animate-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm w-full sm:w-auto">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Loại nhật ký:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-200 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
                    >
                      <option value="all">Tất cả</option>
                      <option value="registration">Thành viên mới (Candidate)</option>
                      <option value="recruiter_reg">Doanh nghiệp mới (Recruiter)</option>
                      <option value="cv_created">Tạo / Tải lên CV</option>
                      <option value="approval">Yêu cầu duyệt tin</option>
                      <option value="job_posted">Đăng tin tuyển dụng</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm w-full sm:w-auto">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ngày:</span>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-200 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3 w-16">STT</th>
                      <th className="px-5 py-3 w-56">ĐỐI TƯỢNG TÁC ĐỘNG</th>
                      <th className="px-5 py-3">HÀNH ĐỘNG CHI TIẾT</th>
                      <th className="px-5 py-3 w-48">THỜI GIAN GHI NHẬN</th>
                      <th className="px-5 py-3 text-center w-32">LOẠI SỰ KIỆN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {isLoadingActivities ? (
                      Array.from({ length: PAGE_SIZE }).map((_, idx) => <SystemSkeletonRow key={idx} />)
                    ) : hasActivitiesError ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <span className="text-xs font-bold text-slate-500">Không thể tải dữ liệu</span>
                            <Button variant="outline" size="sm" onClick={fetchActivities} className="mt-1 h-8 text-[11px] cursor-pointer">
                              Thử lại
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : activities.length > 0 ? (
                      activities.map((act, index) => {
                        const Icon = getActivityIcon(act.type);
                        return (
                          <tr key={act.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500">
                              #{activitiesStartIndex + index + 1}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className="w-6.5 h-6.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-sm flex items-center justify-center shrink-0">
                                  <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                                </div>
                                <span className="truncate max-w-[200px]" title={act.user}>
                                  {act.user}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-800 dark:text-slate-300 font-medium leading-relaxed">
                              {act.message}
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                              <div className="font-semibold">{formatFullDateTime(act.createdAt)}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                {formatRelativeTime(act.createdAt)}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 border text-[9px] font-bold uppercase rounded-2xs ${getAdminBadgeClass(act.badgeColor)}`}>
                                {act.badgeText}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-450 dark:text-slate-500 font-semibold">
                          Không tìm thấy sự kiện nhật ký nào trùng khớp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {!hasActivitiesError && !isLoadingActivities && activitiesTotal > 0 &&
                renderPagination(activitiesPage, activitiesTotalPages, setActivitiesPage)}
            </>
          ) : (
            <>
              {/* Audit Filters row */}
              <div className="flex flex-col xl:flex-row items-center gap-4 justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                    <Search className="w-4 h-4" />
                  </span>
                  <Input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Tìm theo email admin..."
                    className="w-full h-9 pl-10 pr-3 text-xs animate-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm w-full sm:w-auto">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hành động:</span>
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-200 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
                    >
                      <option value="all">Tất cả</option>
                      <option value="update_user">Cập nhật người dùng</option>
                      <option value="toggle_user_status">Khóa/Mở tài khoản</option>
                      <option value="delete_user">Xóa người dùng</option>
                      <option value="force_delete_job">Xóa cứng tin tuyển dụng</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm w-full sm:w-auto">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Đối tượng:</span>
                    <select
                      value={targetTypeFilter}
                      onChange={(e) => setTargetTypeFilter(e.target.value)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-200 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
                    >
                      <option value="all">Tất cả</option>
                      <option value="user">Người dùng</option>
                      <option value="job_posting">Tin tuyển dụng</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm w-full sm:w-auto">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ngày:</span>
                    <input
                      type="date"
                      value={auditDateFilter}
                      onChange={(e) => setAuditDateFilter(e.target.value)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-200 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
                    />
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3 w-16">STT</th>
                      <th className="px-5 py-3 w-56">ADMIN</th>
                      <th className="px-5 py-3 w-44">HÀNH ĐỘNG</th>
                      <th className="px-5 py-3 w-40">ĐỐI TƯỢNG</th>
                      <th className="px-5 py-3">CHI TIẾT</th>
                      <th className="px-5 py-3 w-44">THỜI GIAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {isLoadingAudit ? (
                      Array.from({ length: PAGE_SIZE }).map((_, idx) => <AuditSkeletonRow key={idx} />)
                    ) : hasAuditError ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center gap-2.5">
                            <span className="text-xs font-bold text-slate-500">Không thể tải dữ liệu</span>
                            <Button variant="outline" size="sm" onClick={fetchAudit} className="mt-1 h-8 text-[11px] cursor-pointer">
                              Thử lại
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : auditLogs.length > 0 ? (
                      auditLogs.map((log, index) => {
                        const actionLabel = ACTION_LABELS[log.action] || log.action;
                        const badgeColor = ACTION_BADGE_COLORS[log.action] || "bg-slate-50 text-slate-700 border-slate-100";
                        const targetLabel = TARGET_TYPE_LABELS[log.targetType] || log.targetType;
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500">
                              #{auditStartIndex + index + 1}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className="w-6.5 h-6.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-sm flex items-center justify-center shrink-0">
                                  <Shield className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                                </div>
                                <span className="truncate max-w-[200px]" title={log.admin.email}>
                                  {log.admin.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2 py-0.5 border text-[9px] font-bold uppercase rounded-2xs ${getAdminBadgeClass(badgeColor)}`}>
                                {actionLabel}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-800 dark:text-slate-300 font-medium">
                              {targetLabel} <span className="text-slate-400">#{log.targetId}</span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                              <span className="line-clamp-2 break-all" title={log.details || undefined}>
                                {formatDetails(log.details)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                              <div className="font-semibold">{formatFullDateTime(log.createdAt)}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                {formatRelativeTime(log.createdAt)}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-450 dark:text-slate-500 font-semibold">
                          Chưa có hành động admin nào được ghi nhận.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {!hasAuditError && !isLoadingAudit && auditTotal > 0 &&
                renderPagination(auditPage, auditTotalPages, setAuditPage)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
