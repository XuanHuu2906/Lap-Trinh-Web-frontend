import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getSystemActivities, type SystemActivity } from "../../services/admin.service";
import { getAdminBadgeClass } from "../../utils/adminBadge";
import { useToast } from "../../components/common/toast";

const SkeletonRow: React.FC = () => (
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

export const AdminLogs: React.FC = () => {
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<SystemActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const { toast } = useToast();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchLogs = async () => {
    setIsLoading(true);
    setHasLoadError(false);
    try {
      const response = await getSystemActivities({ limit: 100 });
      if (response.success && response.data) {
        setActivities(response.data);
        setFilteredActivities(response.data);
      } else {
        throw new Error(response.message || "Không thể tải nhật ký hoạt động");
      }
    } catch (err: unknown) {
      console.error(err);
      setHasLoadError(true);
      toast({ title: getErrorMessage(err) || "Đã xảy ra lỗi khi tải dữ liệu từ máy chủ.", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...activities];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (act) =>
          act.user.toLowerCase().includes(term) ||
          act.message.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((act) => act.type === typeFilter);
    }

    if (dateFilter) {
      result = result.filter((act) => getDateFilterValue(act.createdAt) === dateFilter);
    }

    setFilteredActivities(result);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [searchTerm, typeFilter, dateFilter, activities]);

  const getDateFilterValue = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  // Pagination logic
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredActivities.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">NHẬT KÝ HỆ THỐNG</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGS GRID */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-6 space-y-6">
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
                placeholder="Tìm tên người dùng, nội dung hành động..."
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

          {/* Database Table Grid */}
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
                {isLoading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : hasLoadError ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <span className="text-xs font-bold text-slate-500">Không thể tải dữ liệu</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchLogs}
                          className="mt-1 h-8 text-[11px] cursor-pointer"
                        >
                          Thử lại
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.length > 0 ? (
                  paginatedItems.map((act, index) => {
                    const Icon = getActivityIcon(act.type);
                    return (
                      <tr key={act.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500">
                          #{startIndex + index + 1}
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
                          <span
                            className={`inline-flex px-2 py-0.5 border text-[9px] font-bold uppercase rounded-2xs ${getAdminBadgeClass(act.badgeColor)}`}
                          >
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

          {/* 3. PAGINATION FOOTER */}
          {!hasLoadError && !isLoading && totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      onClick={() => setCurrentPage(pageNum)}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
