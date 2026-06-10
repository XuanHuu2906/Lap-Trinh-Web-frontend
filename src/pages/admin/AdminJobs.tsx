/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  AlertTriangle,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { type Job, type JobType } from "../../types/job.type";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getAdminJobs, updateJobStatus, forceDeleteJob } from "../../services/admin.service";
import { useToast } from "../../components/common/toast";

interface AdminJob extends Job {
  companyName: string;
  companyLogo: string;
  rejectionReason?: string;
}

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

const SkeletonJobCard: React.FC = () => (
  <div className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6 animate-pulse">
    <div className="flex items-start gap-4 grow">
      <div className="w-12 h-12 bg-slate-200 rounded-sm shrink-0"></div>
      <div className="space-y-2.5 grow">
        <div className="h-4.5 bg-slate-200 rounded-xs w-2/3"></div>
        <div className="h-3.5 bg-slate-200 rounded-xs w-1/4"></div>
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="h-3 bg-slate-200 rounded-xs w-20"></div>
          <div className="h-3 bg-slate-200 rounded-xs w-24"></div>
          <div className="h-3 bg-slate-200 rounded-xs w-28"></div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-slate-200 rounded-xs w-16"></div>
          <div className="h-6 bg-slate-200 rounded-xs w-24"></div>
        </div>
      </div>
    </div>
    <div className="flex gap-2 shrink-0 self-end md:self-start">
      <div className="w-9 h-9 bg-slate-200 rounded-xs"></div>
      <div className="w-9 h-9 bg-slate-200 rounded-xs"></div>
    </div>
  </div>
);

export const AdminJobs: React.FC = () => {
  const { toast } = useToast();

  // State quản lý danh sách Jobs & phân trang từ Server
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string>("Tất cả");

  // Quản lý Modal Từ Chối Duyệt Tin
  const [rejectingJobId, setRejectingJobId] = useState<number | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [isRejectingModalOpen, setIsRejectingModalOpen] = useState(false);

  // Quản lý Modal Xem Chi Tiết Tin Đăng
  const [previewingJob, setPreviewingJob] = useState<AdminJob | null>(null);

  // Cơ chế Debounce ô tìm kiếm sau 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hàm gọi API lấy danh sách tin tuyển dụng từ server
  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let statusParam: string | undefined = undefined;
      if (activeTab === "pending") statusParam = "draft";
      else if (activeTab === "approved") statusParam = "active";
      else if (activeTab === "rejected") statusParam = "closed";

      const searchParam = debouncedSearch.trim() || undefined;

      const response = await getAdminJobs({
        page: pagination.page,
        limit: pagination.limit,
        search: searchParam,
        status: statusParam,
      });

      if (response.success) {
        // Ánh xạ dữ liệu từ backend trả về dạng AdminJob của frontend
        const mappedJobs: AdminJob[] = response.data.map((job) => ({
          ...job,
          companyName:
            job.recruiter?.recruiterProfile?.companyName ||
            "Công ty chưa xác định",
          companyLogo:
            job.recruiter?.recruiterProfile?.logoUrl ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80",
        }));

        // Bộ lọc phụ client-side cho jobType nếu được chọn (vì server chỉ hỗ trợ bộ lọc chính)
        let finalJobs = mappedJobs;
        if (selectedJobType !== "Tất cả") {
          finalJobs = mappedJobs.filter(
            (job) =>
              (selectedJobType === "Full-time" &&
                job.jobType === "full_time") ||
              (selectedJobType === "Remote" && job.jobType === "remote"),
          );
        }

        setJobs(finalJobs);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
        });
      } else {
        throw new Error("Lấy danh sách tin tuyển dụng thất bại.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || "Có lỗi xảy ra khi kết nối tới máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tải danh sách công việc mỗi khi các filter/tab/trang thay đổi
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    activeTab,
    selectedJobType,
  ]);

  // Điều hướng tabs (Reset về trang 1)
  const handleTabChange = (tab: "pending" | "approved" | "rejected") => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Điều hướng chọn loại hình công việc (Reset về trang 1)
  const handleJobTypeChange = (type: string) => {
    setSelectedJobType(type);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Hàm xử lý Phê duyệt tin đăng thực tế
  const handleApprove = async (jobId: number) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn phê duyệt tin tuyển dụng này để hiển thị công khai?",
      )
    ) {
      try {
        const response = await updateJobStatus(jobId, "active");
        if (response.success) {
          // Cập nhật state cục bộ để loại bỏ tin vừa phê duyệt khỏi tab chờ duyệt
          setJobs(prev => prev.filter(j => j.id !== jobId));
          setPagination(prev => ({ ...prev, total: prev.total - 1 }));
          toast({
            title: "Phê duyệt tin tuyển dụng thành công",
            description: "Tin đăng hiện đã hiển thị công khai.",
            variant: "success",
          });
        } else {
          toast({
            title: "Thao tác thất bại",
            description: response.message || "Lỗi không xác định",
            variant: "error",
          });
        }
      } catch (err: unknown) {
        console.error(err);
        toast({
          title: "Đã xảy ra lỗi",
          description: getErrorMessage(err) || "Lỗi không xác định",
          variant: "error",
        });
      }
    }
  };

  // Hàm mở Modal Từ chối tin đăng
  const handleOpenRejectModal = (jobId: number) => {
    setRejectingJobId(jobId);
    setRejectionReasonInput("");
    setIsRejectingModalOpen(true);
  };

  // Hàm thực thi Từ chối tin đăng qua API thực tế
  const handleConfirmReject = async () => {
    if (!rejectionReasonInput.trim()) {
      toast({
        title: "Thiếu lý do từ chối",
        description: "Vui lòng nhập lý do từ chối để thông báo cho Nhà tuyển dụng.",
        variant: "warning",
      });
      return;
    }

    if (rejectingJobId) {
      try {
        const response = await updateJobStatus(
          rejectingJobId,
          "closed",
          rejectionReasonInput,
        );
        if (response.success) {
          setJobs((prev) => prev.filter((j) => j.id !== rejectingJobId));
          setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
          setIsRejectingModalOpen(false);
          setRejectingJobId(null);
          toast({
            title: "Đã từ chối tin đăng",
            description: "Lý do phản hồi đã được gửi cho Nhà tuyển dụng.",
            variant: "success",
          });
        } else {
          toast({
            title: "Thao tác thất bại",
            description: response.message || "Lỗi không xác định",
            variant: "error",
          });
        }
      } catch (err: unknown) {
        console.error(err);
        toast({
          title: "Đã xảy ra lỗi",
          description: getErrorMessage(err) || "Lỗi không xác định",
          variant: "error",
        });
      }
    }
  };

  // Gỡ bỏ bài tuyển dụng vi phạm vĩnh viễn khỏi hệ thống qua API (UC-20)
  const handleDeleteJob = async (jobId: number, title: string) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn gỡ vĩnh viễn bài đăng tuyển dụng vi phạm "${title}" khỏi hệ thống?`,
      )
    ) {
      try {
        const response = await forceDeleteJob(jobId);
        if (response.success) {
          setJobs(prev => prev.filter((job) => job.id !== jobId));
          setPagination(prev => ({ ...prev, total: prev.total - 1 }));
          toast({
            title: "Đã gỡ bỏ bài tuyển dụng",
            description: "Bài tuyển dụng vi phạm đã được xóa khỏi hệ thống.",
            variant: "success",
          });
        } else {
          toast({
            title: "Thao tác thất bại",
            description: response.message || "Lỗi không xác định",
            variant: "error",
          });
        }
      } catch (err: unknown) {
        console.error(err);
        toast({
          title: "Đã xảy ra lỗi",
          description: getErrorMessage(err) || "Lỗi không xác định",
          variant: "error",
        });
      }
    }
  };

  // Dịch tên loại hình công việc
  const translateJobType = (type: JobType) => {
    switch (type) {
      case "full_time":
        return "Full-time";
      case "part_time":
        return "Part-time";
      case "remote":
        return "Từ xa (Remote)";
      case "internship":
        return "Thực tập";
      case "contract":
        return "Hợp đồng";
      default:
        return type;
    }
  };

  // Tính toán tổng số trang
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
      {/* 1. TOP CONTROL PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-1.5 font-sans uppercase">
            DUYỆT & KIỂM DUYỆT TIN ĐĂNG
          </h1>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between rounded-sm shadow-2xs">
          <div>
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px]">
              YÊU CẦU CHỜ DUYỆT
            </CardDescription>
            <CardTitle className="text-xl mt-1 font-black">
              {activeTab === "pending" ? `${pagination.total} tin đăng` : "—"}
            </CardTitle>
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between rounded-sm shadow-2xs">
          <div>
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px]">
              TIN ĐĂNG HOẠT ĐỘNG
            </CardDescription>
            <CardTitle className="text-xl mt-1 font-black">
              {activeTab === "approved" ? `${pagination.total} tin đăng` : "—"}
            </CardTitle>
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between rounded-sm shadow-2xs">
          <div>
            <CardDescription className="uppercase tracking-wider font-extrabold text-[10px]">
              ĐÃ TỪ CHỐI DUYỆT
            </CardDescription>
            <CardTitle className="text-xl mt-1 font-black">
              {activeTab === "rejected" ? `${pagination.total} tin đăng` : "—"}
            </CardTitle>
          </div>
        </Card>
      </div>

      {/* 3. TABS NAVIGATION & SEARCH SEARCH */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        {/* Navigation tabs row */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 gap-4 bg-slate-50/50 dark:bg-slate-950/50">
          {/* Tabs switch list */}
          <div className="flex border-b border-transparent gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleTabChange("pending")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "pending"
                ? "border-slate-900 dark:border-indigo-500 text-slate-900 dark:text-slate-50 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
                }`}
            >
              Chờ phê duyệt{" "}
              {activeTab === "pending" ? `(${pagination.total})` : ""}
            </button>
            <button
              onClick={() => handleTabChange("approved")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "approved"
                ? "border-slate-900 dark:border-indigo-500 text-slate-900 dark:text-slate-50 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
                }`}
            >
              Đã kích hoạt{" "}
              {activeTab === "approved" ? `(${pagination.total})` : ""}
            </button>
            <button
              onClick={() => handleTabChange("rejected")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === "rejected"
                ? "border-slate-900 dark:border-indigo-500 text-slate-900 dark:text-slate-50 font-extrabold"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
                }`}
            >
              Đã từ chối{" "}
              {activeTab === "rejected" ? `(${pagination.total})` : ""}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                <Search className="w-4 h-4" />
              </span>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm công việc, công ty..."
                className="w-full sm:w-60 h-9 pl-10 pr-3"
              />
            </div>

            <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <select
                value={selectedJobType}
                onChange={(e) => handleJobTypeChange(e.target.value)}
                className="text-xs font-bold text-slate-650 dark:text-slate-200 outline-none bg-transparent cursor-pointer"
              >
                <option value="Tất cả">Tất cả loại hình</option>
                <option value="Full-time">Full-time</option>
                <option value="Remote">Từ xa (Remote)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. CONTENT LISTING */}
        {isLoading ? (
          <div className="divide-y divide-slate-150 dark:divide-slate-800 text-left">
            {Array.from({ length: pagination.limit }).map((_, idx) => (
              <SkeletonJobCard key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-red-650 dark:text-red-300">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              className="mt-3 border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs h-9 px-4 cursor-pointer"
            >
              Thử lại
            </Button>
          </div>
        ) : jobs.length > 0 ? (
          <div className="divide-y divide-slate-150 dark:divide-slate-800 text-left">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all flex flex-col md:flex-row md:items-start md:justify-between gap-6"
              >
                {/* Left info */}
                <div className="flex items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-12 h-12 rounded-sm border border-slate-200/80 dark:border-slate-700 shadow-3xs shrink-0 object-cover"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-bold mt-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.companyName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          {job.salaryMin && job.salaryMax
                            ? `${job.salaryMin}$ - ${job.salaryMax}$ / tháng`
                            : "Thỏa thuận"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          Đăng ngày:{" "}
                          {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="secondary">
                        {translateJobType(job.jobType)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/30"
                      >
                        Kinh nghiệm: {job.experienceLevel}
                      </Badge>
                    </div>

                    {/* Rejection Reason Display */}
                    {activeTab === "rejected" && job.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-950/30 border border-red-100/70 dark:border-red-900/60 p-3 mt-4 rounded-sm flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-extrabold text-red-700 dark:text-red-300 block uppercase tracking-wider">
                            Lý do từ chối duyệt bài
                          </span>
                          <p className="text-xs text-red-650 dark:text-red-300 font-semibold leading-relaxed mt-1">
                            {job.rejectionReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPreviewingJob(job)}
                    className="h-9 w-9 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:border-slate-350 dark:hover:border-slate-600 bg-white dark:bg-slate-950/60 cursor-pointer"
                    title="Xem chi tiết tin đăng"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="h-9 w-9 border border-slate-200 dark:border-slate-700 text-slate-450 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-900 bg-white dark:bg-slate-950/60 cursor-pointer"
                    title="Gỡ bỏ tin tuyển dụng vi phạm vĩnh viễn"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </Button>

                  {activeTab === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(job.id)}
                        className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer h-9 px-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Duyệt tin
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRejectModal(job.id)}
                        className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-800 hover:text-red-700 dark:hover:text-red-200 font-bold text-xs h-9 px-3.5 cursor-pointer"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Không tìm thấy tin tuyển dụng nào
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Hệ thống hiện tại không có tin đăng nào ở danh mục này.
            </p>
          </div>
        )}

        {/* 5. PAGINATION FOOTER */}
        {!error && !isLoading && jobs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/40">
            {/* Left Side: Current view status */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              Hiển thị <span className="font-extrabold text-slate-800 dark:text-slate-100">{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</span>
              {" "}-{" "}
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>
              {" "}trên tổng số{" "}
              <span className="font-extrabold text-slate-800 dark:text-slate-100">{pagination.total}</span> tin tuyển dụng
            </div>

            {/* Right Side: Navigation buttons and select items limit */}
            <div className="flex items-center gap-4">
              {/* Select limit */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Hiển thị:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }))}
                  className="text-[10px] font-bold text-slate-650 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-sm outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <option value={5}>5 dòng</option>
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>

              {/* Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(prev.page - 1, 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </Button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`h-7 w-7 text-[10px] font-bold cursor-pointer ${pagination.page === pageNum
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
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.page + 1, totalPages),
                    }))
                  }
                  disabled={pagination.page === totalPages}
                  className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. MODAL: TỪ CHỐI DUYỆT TIN ĐĂNG */}
      {isRejectingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm w-full max-w-lg shadow-xl overflow-hidden animate-slide-up text-left">
            <div className="h-1 bg-red-600 w-full"></div>
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider font-sans">
                  Từ chối phê duyệt bài tuyển dụng
                </h3>
              </div>
              <button
                onClick={() => setIsRejectingModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Nhà tuyển dụng sẽ nhận được thông báo giải trình vì sao bài
                tuyển dụng bị từ chối phê duyệt hiển thị. Vui lòng ghi rõ lý do
                chi tiết dưới đây:
              </p>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Lý do từ chối
                </label>
                <textarea
                  rows={4}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Ví dụ: Mô tả công việc quá sơ sài hoặc chứa thông tin không chính thống, liên hệ doanh nghiệp không chính xác..."
                  className="w-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 p-3 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 rounded-sm bg-white dark:bg-slate-950/60 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRejectingModalOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-100 font-bold text-xs h-9 px-4 cursor-pointer"
              >
                Hủy bỏ
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
                className="font-bold text-xs h-9 px-4 cursor-pointer"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: XEM CHI TIẾT TIN TUYỂN DỤNG */}
      {previewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm w-full max-w-2xl shadow-xl overflow-hidden animate-slide-up h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <img
                  src={previewingJob.companyLogo}
                  alt={previewingJob.companyName}
                  className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-sm shrink-0 object-cover"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 leading-none">
                    {previewingJob.companyName}
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide block mt-1">
                    Yêu cầu kiểm duyệt tin đăng
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewingJob(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details view */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-1">
                  TIÊU ĐỀ CÔNG VIỆC
                </span>
                <h1 className="text-xl font-black text-slate-950 dark:text-slate-50 leading-snug">
                  {previewingJob.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">
                    {translateJobType(previewingJob.jobType)}
                  </Badge>
                  <Badge variant="outline">
                    Cấp bậc: {previewingJob.experienceLevel}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block tracking-wider uppercase mb-1">
                    ĐỊA ĐIỂM
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {previewingJob.location}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block tracking-wider uppercase mb-1">
                    MỨC LƯƠNG
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    {previewingJob.salaryMin && previewingJob.salaryMax
                      ? `${previewingJob.salaryMin}$ - ${previewingJob.salaryMax}$ / tháng`
                      : "Thỏa thuận"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block tracking-widest uppercase mb-2">
                  MÔ TẢ CÔNG VIỆC
                </span>
                <p className="text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-sm border border-slate-150 dark:border-slate-800 whitespace-pre-wrap">
                  {previewingJob.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 block tracking-widest uppercase mb-2">
                  YÊU CẦU CÔNG VIỆC
                </span>
                <p className="text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-sm border border-slate-150 dark:border-slate-800 whitespace-pre-wrap">
                  {previewingJob.requirements}
                </p>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Mã tin tuyển dụng: #{previewingJob.id}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewingJob(null)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 font-bold text-xs h-9 px-4 cursor-pointer"
                >
                  Đóng lại
                </Button>

                {previewingJob.status === "draft" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(previewingJob.id);
                        setPreviewingJob(null);
                      }}
                      className="bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 cursor-pointer"
                    >
                      Phê duyệt ngay
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleOpenRejectModal(previewingJob.id);
                        setPreviewingJob(null);
                      }}
                      className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs h-9 px-4 cursor-pointer"
                    >
                      Từ chối tin
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
