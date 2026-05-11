import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { type Job, type JobType } from '../../types/job.type';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

interface AdminJob extends Job {
  companyName: string;
  companyLogo: string;
  rejectionReason?: string;
}

// Mock ban đầu cho các tin đăng tuyển dụng (gồm các trạng thái Chờ duyệt, Đã duyệt, Đã từ chối)
const INITIAL_JOBS_MOCK: AdminJob[] = [
  {
    id: 101,
    recruiterId: 5,
    companyName: 'FPT Software',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
    title: 'Senior Node.js Backend Developer',
    description: 'Xây dựng kiến trúc hệ thống backend microservices xử lý hàng triệu request đồng thời. Tích hợp thanh toán trực tuyến, quản lý bảo mật và tối ưu cơ sở dữ liệu lớn.',
    requirements: 'Tối thiểu 4 năm kinh nghiệm làm việc với Node.js, NestJS và SQL Server. Có kinh nghiệm với Docker, Redis và thiết kế hệ thống phân tán.',
    location: 'Hà Nội (Cầu Giấy)',
    salaryMin: 1800,
    salaryMax: 2500,
    salaryUnit: 'month' as const,
    jobType: 'full_time' as const,
    experienceLevel: 'senior' as const,
    status: 'draft' as const, // Trạng thái Chờ duyệt
    createdAt: '2026-05-09T10:30:00Z',
    updatedAt: '2026-05-09T10:30:00Z',
    expiresAt: '2026-06-09T10:30:00Z',
  },
  {
    id: 102,
    recruiterId: 8,
    companyName: 'VNG Corporation',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=80&q=80',
    title: 'Product Owner (E-commerce Platform)',
    description: 'Chịu trách nhiệm nghiên cứu thị trường, lập kế hoạch và định hình sản phẩm. Quản lý backlog, phối hợp với dev team và các bên liên quan để đưa ra tính năng mới đúng hạn.',
    requirements: '3 năm kinh nghiệm PO/PM trong mảng Thương mại điện tử hoặc Fintech. Khả năng tư duy logic tốt, giao tiếp lưu loát và hiểu biết sâu sắc về hành vi người dùng.',
    location: 'TP. Hồ Chí Minh (Quận 7)',
    salaryMin: 2000,
    salaryMax: 3500,
    salaryUnit: 'month' as const,
    jobType: 'full_time' as const,
    experienceLevel: 'manager' as const,
    status: 'draft' as const, // Trạng thái Chờ duyệt
    createdAt: '2026-05-10T08:15:00Z',
    updatedAt: '2026-05-10T08:15:00Z',
    expiresAt: '2026-06-10T08:15:00Z',
  },
  {
    id: 103,
    recruiterId: 12,
    companyName: 'Techcombank',
    companyLogo: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=80&q=80',
    title: 'UI/UX Designer (Mobile Banking app)',
    description: 'Nghiên cứu hành vi người dùng, vẽ wireframe, thiết kế giao diện ứng dụng ngân hàng số trực quan, nâng cấp trải nghiệm giao dịch tài chính nhanh gọn.',
    requirements: 'Kinh nghiệm thiết kế Figma tối thiểu 2 năm, ưu tiên ứng viên từng làm tài chính hoặc thiết kế ứng dụng thanh toán ngân hàng.',
    location: 'TP. Hồ Chí Minh (Quận 1)',
    salaryMin: 1200,
    salaryMax: 1800,
    salaryUnit: 'month' as const,
    jobType: 'full_time' as const,
    experienceLevel: 'mid' as const,
    status: 'active' as const, // Đã duyệt
    createdAt: '2026-05-08T14:00:00Z',
    updatedAt: '2026-05-08T14:00:00Z',
    expiresAt: '2026-06-08T14:00:00Z',
  },
  {
    id: 104,
    recruiterId: 15,
    companyName: 'Shopee Vietnam',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=80&q=80',
    title: 'Data Analyst (Marketing Department)',
    description: 'Phân tích hiệu suất chiến dịch quảng cáo, truy vấn SQL, trực quan hóa dữ liệu hiệu quả nhằm báo cáo cho các quyết định tối ưu ngân sách marketing.',
    requirements: 'Kỹ năng SQL xuất sắc, biết Tableau hoặc PowerBI. Kinh nghiệm Marketing DA là lợi thế lớn.',
    location: 'Đà Nẵng (Hải Châu)',
    salaryMin: 1000,
    salaryMax: 1500,
    salaryUnit: 'month' as const,
    jobType: 'full_time' as const,
    experienceLevel: 'junior' as const,
    status: 'active' as const, // Đã duyệt
    createdAt: '2026-05-07T09:00:00Z',
    updatedAt: '2026-05-07T09:00:00Z',
    expiresAt: '2026-06-07T09:00:00Z',
  },
  {
    id: 105,
    recruiterId: 19,
    companyName: 'Crypto Startup Corp',
    companyLogo: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=80&q=80',
    title: 'Solidity Smart Contract Auditor',
    description: 'Thực hiện kiểm thử hợp đồng thông minh blockchain cho các dự án Web3 của công ty nhằm đảm bảo tính an toàn bảo mật, tránh thất thoát tài sản.',
    requirements: 'Đã từng kiểm duyệt (Audit) ít nhất 3 dự án DeFi lớn, am hiểu sâu sắc về ERC-20, ERC-721 và lỗ hổng bảo mật Solidity.',
    location: 'Từ xa (Remote)',
    salaryMin: null,
    salaryMax: null,
    salaryUnit: 'negotiable' as const,
    jobType: 'remote' as const,
    experienceLevel: 'senior' as const,
    status: 'closed' as const, // Coi closed làm Từ chối (Rejected)
    createdAt: '2026-05-05T11:00:00Z',
    updatedAt: '2026-05-05T11:00:00Z',
    expiresAt: '2026-06-05T11:00:00Z',
    rejectionReason: 'Nội dung tuyển dụng chứa từ khóa liên quan đến đầu tư tài chính tiền số rủi ro cao, không phù hợp chính sách tin đăng của HireArch.',
  }
];

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<AdminJob[]>(INITIAL_JOBS_MOCK);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('Tất cả');

  // Quản lý Modal Từ Chối Duyệt Tin
  const [rejectingJobId, setRejectingJobId] = useState<number | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isRejectingModalOpen, setIsRejectingModalOpen] = useState(false);

  // Quản lý Modal Xem Chi Tiết Tin Đăng
  const [previewingJob, setPreviewingJob] = useState<AdminJob | null>(null);

  // Ánh xạ bộ lọc tab sang trạng thái dữ liệu
  const getTabStatusFilter = () => {
    if (activeTab === 'pending') return 'draft';
    if (activeTab === 'approved') return 'active';
    return 'closed'; // Rejected
  };

  // Hàm xử lý Phê duyệt tin đăng nhanh
  const handleApprove = (jobId: number) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return { ...job, status: 'active' as const };
      }
      return job;
    }));
    alert('Phê duyệt tin tuyển dụng thành công! Tin đăng hiện đã hiển thị công khai.');
  };

  // Hàm mở Modal Từ chối tin đăng
  const handleOpenRejectModal = (jobId: number) => {
    setRejectingJobId(jobId);
    setRejectionReasonInput('');
    setIsRejectingModalOpen(true);
  };

  // Hàm thực thi Từ chối tin đăng
  const handleConfirmReject = () => {
    if (!rejectionReasonInput.trim()) {
      alert('Vui lòng nhập lý do từ chối để thông báo cho Nhà tuyển dụng.');
      return;
    }

    setJobs(prev => prev.map(job => {
      if (job.id === rejectingJobId) {
        return {
          ...job,
          status: 'closed' as const, // Chuyển sang rejected (closed)
          rejectionReason: rejectionReasonInput
        };
      }
      return job;
    }));

    setIsRejectingModalOpen(false);
    setRejectingJobId(null);
    alert('Đã từ chối tin đăng và gửi lý do phản hồi cho Nhà tuyển dụng.');
  };

  // Xóa bỏ / gỡ bài tuyển dụng vi phạm vĩnh viễn khỏi hệ thống (UC-20)
  const handleDeleteJob = (jobId: number, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn gỡ vĩnh viễn bài đăng tuyển dụng vi phạm "${title}" khỏi hệ thống?`)) {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      alert('Đã gỡ bỏ bài tuyển dụng thành công.');
    }
  };

  // Bộ lọc dữ liệu tin tuyển dụng theo Tìm kiếm, Loại công việc và Bộ lọc Tab hoạt động
  const filteredJobs = jobs.filter(job => {
    const matchesTab = job.status === getTabStatusFilter();

    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedJobType === 'Tất cả' ||
      (selectedJobType === 'Full-time' && job.jobType === 'full_time') ||
      (selectedJobType === 'Remote' && job.jobType === 'remote');

    return matchesTab && matchesSearch && matchesType;
  });

  // Chuyển dịch tên loại hình công việc
  const translateJobType = (type: JobType) => {
    switch (type) {
      case 'full_time': return 'Full-time';
      case 'part_time': return 'Part-time';
      case 'remote': return 'Từ xa (Remote)';
      case 'internship': return 'Thực tập';
      case 'contract': return 'Hợp đồng';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800">

      {/* 1. TOP CONTROL PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">DUYỆT & KIỂM DUYỆT TIN ĐĂNG</h1>
        </div>
      </div>

      {/* 2. STATS OVERVIEW FOR TIN ĐĂNG SỬ DỤNG SHADCN CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <CardDescription className="uppercase tracking-wider">YÊU CẦU CHỜ DUYỆT</CardDescription>
            <CardTitle className="text-xl mt-1 text-slate-900 font-black">
              {jobs.filter(j => j.status === 'draft').length} tin đăng
            </CardTitle>
          </div>
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <CardDescription className="uppercase tracking-wider">TIN ĐĂNG HOẠT ĐỘNG</CardDescription>
            <CardTitle className="text-xl mt-1 text-slate-900 font-black">
              {jobs.filter(j => j.status === 'active').length} tin đăng
            </CardTitle>
          </div>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <CardDescription className="uppercase tracking-wider">ĐÃ TỪ CHỐI DUYỆT</CardDescription>
            <CardTitle className="text-xl mt-1 text-slate-900 font-black">
              {jobs.filter(j => j.status === 'closed').length} tin đăng
            </CardTitle>
          </div>
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
        </Card>
      </div>

      {/* 3. TABS NAVIGATION & SEARCH SEARCH */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-3xs overflow-hidden">

        {/* Navigation tabs row */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 px-6 py-4 gap-4 bg-slate-50/50">

          {/* Tabs switch list */}
          <div className="flex border-b border-transparent gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'pending'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
            >
              Chờ phê duyệt ({jobs.filter(j => j.status === 'draft').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'approved'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
            >
              Đã kích hoạt ({jobs.filter(j => j.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${activeTab === 'rejected'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
            >
              Đã từ chối ({jobs.filter(j => j.status === 'closed').length})
            </button>
          </div>

          {/* Quick Filters - Sử dụng Shadcn UI Input */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
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

            <div className="flex items-center gap-1.5 border border-slate-200 px-2.5 h-9 bg-white rounded-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="text-xs font-bold text-slate-600 outline-none bg-transparent cursor-pointer"
              >
                <option value="Tất cả">Tất cả loại hình</option>
                <option value="Full-time">Full-time</option>
                <option value="Remote">Từ xa (Remote)</option>
              </select>
            </div>
          </div>

        </div>

        {/* 4. CONTENT LISTING */}
        {filteredJobs.length > 0 ? (
          <div className="divide-y divide-slate-150 text-left">
            {filteredJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                {/* Left info */}
                <div className="flex items-start gap-4">
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-12 h-12 rounded-sm border border-slate-200/80 shadow-3xs flex-shrink-0 object-cover"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-indigo-600 font-bold mt-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.companyName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-semibold mt-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {job.salaryMin && job.salaryMax
                            ? `${job.salaryMin}$ - ${job.salaryMax}$ / tháng`
                            : 'Thỏa thuận'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    {/* SỬ DỤNG SHADCN BADGE */}
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="secondary">
                        {translateJobType(job.jobType)}
                      </Badge>
                      <Badge variant="outline" className="text-indigo-700 border-indigo-200 bg-indigo-50/30">
                        Kinh nghiệm: {job.experienceLevel}
                      </Badge>
                    </div>

                    {/* Rejection Reason Display (For Rejected Tab) */}
                    {activeTab === 'rejected' && job.rejectionReason && (
                      <div className="bg-red-50 border border-red-100/70 p-3 mt-4 rounded-sm flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-extrabold text-red-700 block uppercase tracking-wider">Lý do từ chối duyêt bài</span>
                          <p className="text-xs text-red-650 font-medium leading-relaxed mt-1">{job.rejectionReason}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right: Actions (Sử dụng các component Shadcn/UI Button) */}
                <div className="flex items-center gap-2 self-end md:self-start flex-shrink-0">

                  {/* Button Xem chi tiết từ thư viện Shadcn */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPreviewingJob(job)}
                    className="h-9 w-9 border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350 bg-white"
                    title="Xem chi tiết tin đăng"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </Button>

                  {/* Button Xóa tin vi phạm từ thư viện Shadcn */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="h-9 w-9 border border-slate-200 text-slate-450 hover:text-red-650 hover:border-red-200 bg-white"
                    title="Gỡ bỏ tin tuyển dụng vi phạm vĩnh viễn"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </Button>

                  {activeTab === 'pending' && (
                    <>
                      {/* Button Duyệt tin (Shadcn UI Default variant) */}
                      <Button
                        size="sm"
                        onClick={() => handleApprove(job.id)}
                        className="bg-slate-900 text-white font-bold text-xs cursor-pointer h-9 px-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Duyệt tin
                      </Button>

                      {/* Button Từ chối (Shadcn UI Outline variant) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRejectModal(job.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-bold text-xs h-9 px-3.5"
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
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Không tìm thấy tin tuyển dụng nào</p>
            <p className="text-xs text-slate-400 mt-1">Hệ thống hiện tại không có tin đăng nào ở danh mục này.</p>
          </div>
        )}

      </div>

      {/* 5. MODAL: TỪ CHỐI DUYỆT TIN ĐĂNG */}
      {isRejectingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-sm w-full max-w-lg shadow-xl overflow-hidden animate-slide-up text-left">
            <div className="h-1 bg-red-600 w-full"></div>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-wider">Từ chối phê duyệt bài tuyển dụng</h3>
              </div>
              <button
                onClick={() => setIsRejectingModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Nhà tuyển dụng sẽ nhận được thông báo giải trình vì sao bài tuyển dụng bị từ chối phê duyệt hiển thị. Vui lòng ghi rõ lý do chi tiết dưới đây:
              </p>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Lý do từ chối</label>
                <textarea
                  rows={4}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Ví dụ: Mô tả công việc quá sơ sài hoặc chứa thông tin không chính thống, liên hệ doanh nghiệp không chính xác..."
                  className="w-full border border-slate-200 text-xs font-semibold p-3 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 rounded-sm bg-white"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              {/* Button Hủy từ Shadcn UI Ghost */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRejectingModalOpen(false)}
                className="text-slate-500 hover:text-slate-850 font-bold text-xs h-9 px-4"
              >
                Hủy bỏ
              </Button>

              {/* Button Xác nhận từ Shadcn UI Destructive */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
                className="font-bold text-xs h-9 px-4"
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: XEM CHI TIẾT TIN TUYỂN DỤNG */}
      {previewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
          <div className="bg-white border border-slate-200 rounded-sm w-full max-w-2xl shadow-xl overflow-hidden animate-slide-up h-[90vh] flex flex-col">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={previewingJob.companyLogo}
                  alt={previewingJob.companyName}
                  className="w-10 h-10 border border-slate-200 rounded-sm flex-shrink-0 object-cover"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-none">{previewingJob.companyName}</h3>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide block mt-1">Yêu cầu kiểm duyệt tin đăng</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewingJob(null)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details view */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">

              <div>
                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-1">TIÊU ĐỀ CÔNG VIỆC</span>
                <h1 className="text-xl font-black text-slate-950 leading-snug">{previewingJob.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">
                    {translateJobType(previewingJob.jobType)}
                  </Badge>
                  <Badge variant="outline">
                    Cấp bậc: {previewingJob.experienceLevel}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase mb-1">ĐỊA ĐIỂM</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {previewingJob.location}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 block tracking-wider uppercase mb-1">MỨC LƯƠNG</span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    {previewingJob.salaryMin && previewingJob.salaryMax
                      ? `${previewingJob.salaryMin}$ - ${previewingJob.salaryMax}$ / tháng`
                      : 'Thỏa thuận'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 block tracking-widest uppercase mb-2">MÔ TẢ CÔNG VIỆC</span>
                <p className="text-xs font-semibold leading-relaxed text-slate-650 bg-slate-50 p-4 rounded-sm border border-slate-150">
                  {previewingJob.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black text-slate-400 block tracking-widest uppercase mb-2">YÊU CẦU CÔNG VIỆC</span>
                <p className="text-xs font-semibold leading-relaxed text-slate-650 bg-slate-50 p-4 rounded-sm border border-slate-150">
                  {previewingJob.requirements}
                </p>
              </div>

            </div>

            {/* Bottom buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-400 font-bold">Mã tin tuyển dụng: #{previewingJob.id}</span>
              <div className="flex gap-2">
                {/* Button Đóng từ Shadcn UI Ghost */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewingJob(null)}
                  className="text-slate-500 hover:text-slate-800 font-bold text-xs h-9 px-4"
                >
                  Đóng lại
                </Button>

                {previewingJob.status === 'draft' && (
                  <>
                    {/* Button Duyệt ngay từ Shadcn Default */}
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(previewingJob.id);
                        setPreviewingJob(null);
                      }}
                      className="bg-slate-900 text-white font-bold text-xs h-9 px-4"
                    >
                      Phê duyệt ngay
                    </Button>

                    {/* Button Từ chối từ Shadcn Outline */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleOpenRejectModal(previewingJob.id);
                        setPreviewingJob(null);
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-red-600 font-bold text-xs h-9 px-4"
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
