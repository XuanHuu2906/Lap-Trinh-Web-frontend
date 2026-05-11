import React, { useState, useEffect } from "react";
import { Star, MapPin, DollarSign, Calendar, ChevronRight, CheckCircle, FileText, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  logoColor: string;
  location: string;
  salary: string;
  deadline: string;
  tags: string[];
  field: string;
  type: string;
  experience: string;
  level: string;
  description: string;
}

const JOBS_DATA: Job[] = [
  {
    id: 1,
    title: "Senior Frontend Engineer (React/TypeScript)",
    company: "TechNova Solutions",
    logo: "TN",
    logoColor: "bg-indigo-600",
    location: "Hồ Chí Minh (Quận 1)",
    salary: "35 - 45 triệu",
    deadline: "25/06/2026",
    tags: ["React", "TypeScript", "TailwindCSS", "NextJS"],
    field: "IT / Software",
    type: "Toàn thời gian",
    experience: "3 - 5 năm",
    level: "Senior",
    description: "Chịu trách nhiệm thiết kế kiến trúc frontend và phát triển các tính năng phức tạp cho nền tảng tuyển dụng doanh nghiệp SaaS. Tối ưu hóa hiệu năng tải trang và trải nghiệm người dùng.",
  },
  {
    id: 2,
    title: "Fullstack Node.js & React Developer",
    company: "VNG Corporation",
    logo: "V",
    logoColor: "bg-orange-500",
    location: "Hà Nội (Cầu Giấy)",
    salary: "28 - 38 triệu",
    deadline: "15/06/2026",
    tags: ["NodeJS", "React", "MongoDB", "Express"],
    field: "IT / Software",
    type: "Làm việc từ xa (Remote)",
    experience: "2 - 4 năm",
    level: "Middle",
    description: "Tham gia phát triển các dịch vụ thanh toán trực tuyến và game portal. Xây dựng Restful API có hiệu năng cao và tích hợp mượt mà với UI frontend.",
  },
  {
    id: 3,
    title: "Product UI/UX Designer",
    company: "MoMo Fintech",
    logo: "M",
    logoColor: "bg-pink-600",
    location: "Hồ Chí Minh (Quận 7)",
    salary: "22 - 32 triệu",
    deadline: "30/06/2026",
    tags: ["Figma", "UX Research", "Wireframing", "Design System"],
    field: "Design",
    type: "Toàn thời gian",
    experience: "2 - 3 năm",
    level: "Middle",
    description: "Nghiên cứu hành vi người dùng, vẽ luồng trải nghiệm (user flow) và thiết kế giao diện ứng dụng ví điện tử MoMo thân thiện, hiện đại.",
  },
  {
    id: 4,
    title: "Data Analyst & Business Intelligence",
    company: "Shopee Vietnam",
    logo: "S",
    logoColor: "bg-orange-600",
    location: "Hà Nội (Hai Bà Trưng)",
    salary: "25 - 35 triệu",
    deadline: "10/07/2026",
    tags: ["Python", "SQL", "Tableau", "PowerBI"],
    field: "Data",
    type: "Toàn thời gian",
    experience: "2 - 5 năm",
    level: "Senior",
    description: "Thu thập, xử lý dữ liệu hành vi mua sắm thương mại điện tử để xây dựng các báo cáo trực quan cho ban giám đốc phục vụ chiến lược kinh doanh.",
  },
  {
    id: 5,
    title: "AI Engineer / Machine Learning Specialist",
    company: "FPT Software AI Lab",
    logo: "F",
    logoColor: "bg-blue-600",
    location: "Hồ Chí Minh (Quận 9)",
    salary: "45 - 65 triệu",
    deadline: "18/06/2026",
    tags: ["Python", "PyTorch", "NLP", "LLMs"],
    field: "AI / Tech",
    type: "Toàn thời gian",
    experience: "3+ năm",
    level: "Senior",
    description: "Nghiên cứu và tinh chỉnh các mô hình học máy, xử lý ngôn ngữ tự nhiên phục vụ sản xuất AI Agent thông minh cho doanh nghiệp toàn cầu.",
  },
];

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  
  // Modal ứng tuyển
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCV, setSelectedCV] = useState("cv_goc_2026.pdf");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load việc đã lưu từ LocalStorage
  const loadSavedJobs = () => {
    const savedIdsString = localStorage.getItem("savedJobIds");
    if (savedIdsString) {
      const savedIds: number[] = JSON.parse(savedIdsString);
      const filtered = JOBS_DATA.filter((j) => savedIds.includes(j.id));
      setSavedJobs(filtered);
    } else {
      setSavedJobs([]);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  // Xóa việc đã lưu (UC-09)
  const handleUnsaveJob = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const savedIdsString = localStorage.getItem("savedJobIds");
    if (savedIdsString) {
      const savedIds: number[] = JSON.parse(savedIdsString);
      const updated = savedIds.filter((jobId) => jobId !== id);
      localStorage.setItem("savedJobIds", JSON.stringify(updated));
      loadSavedJobs();
    }
  };

  // Submit ứng tuyển (UC-03)
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      const applied = localStorage.getItem("appliedJobs") ? JSON.parse(localStorage.getItem("appliedJobs")!) : [];
      if (!applied.some((a: any) => a.id === selectedJob?.id)) {
        applied.push({
          id: selectedJob?.id,
          title: selectedJob?.title,
          company: selectedJob?.company,
          location: selectedJob?.location,
          salary: selectedJob?.salary,
          appliedDate: new Date().toLocaleDateString("vi-VN"),
          status: "Đang duyệt",
          cvName: selectedCV,
        });
        localStorage.setItem("appliedJobs", JSON.stringify(applied));
      }
    }, 1000);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setIsSubmitted(false);
    setCoverLetter("");
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Việc làm đã lưu (UC-09)</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Lưu trữ các cơ hội việc làm tốt để xem lại và tiến hành nộp đơn tuyển dụng bất cứ lúc nào.</p>
      </div>

      {/* Danh sách việc đã lưu */}
      <div className="space-y-4">
        {savedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center transition-colors duration-150">
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Bạn chưa lưu việc làm nào</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Hãy truy cập mục <strong>Tìm việc</strong> trên Sidebar, nhấp biểu tượng Ngôi sao/Bookmark để lưu lại các tin đăng hấp dẫn nhé!
            </p>
          </div>
        ) : (
          savedJobs.map((job) => (
            <Card
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-5 rounded-xl transition-all shadow-3xs hover:shadow-xs cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${job.logoColor} text-white flex items-center justify-center text-lg font-black shrink-0 shadow-3xs`}>
                    {job.logo}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{job.company}</p>
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Hạn nộp: {job.deadline}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px] lowercase first-letter:uppercase font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none">
                          {tag}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="px-2 py-0.5 text-[10px] lowercase first-letter:uppercase font-bold rounded-md bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-none">
                        {job.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-start gap-3 mt-2 md:mt-0 shrink-0">
                  <Button
                    variant="destructive"
                    onClick={(e) => handleUnsaveJob(job.id, e)}
                    className="p-2 rounded-lg border border-red-100 dark:border-red-950/30 bg-red-50 dark:bg-red-950/10 text-red-500 hover:bg-red-100 hover:text-red-650 dark:hover:text-red-400 transition-all cursor-pointer flex items-center justify-center h-9 w-9"
                    title="Bỏ lưu công việc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                    className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-3xs cursor-pointer active:scale-[0.98]"
                  >
                    Ứng tuyển ngay
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Ứng tuyển */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden animate-fade-in text-left">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold rounded-full">UC-03: Ứng tuyển</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nộp hồ sơ trực tuyến</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm cursor-pointer"
              >
                Đóng ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {!isSubmitted ? (
                <form onSubmit={handleApplySubmit} className="space-y-5">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Vị trí ứng tuyển:</p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{selectedJob.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{selectedJob.company} — {selectedJob.location}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* CV Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Chọn CV dùng để nộp:
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 border border-indigo-500 dark:border-indigo-600 bg-indigo-500/5 dark:bg-indigo-950/20 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="selectedCV"
                            value="cv_goc_2026.pdf"
                            checked={selectedCV === "cv_goc_2026.pdf"}
                            onChange={(e) => setSelectedCV(e.target.value)}
                            className="w-4 h-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">CV_Nguyen_Van_A_Chuan.pdf (Mặc định)</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Tạo từ mẫu: Executive Standard • Cập nhật hôm qua</p>
                          </div>
                        </div>
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                      </label>
                    </div>
                  </div>

                  {/* Cover letter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Thư giới thiệu (Không bắt buộc):
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Hãy viết vài câu giới thiệu ngắn gọn..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full text-xs font-medium p-3 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-650"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs font-bold hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      Nộp hồ sơ ngay
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-12 px-4 text-center">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ứng tuyển thành công!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Hồ sơ của bạn đã được chuyển thẳng đến bộ phận Tuyển dụng của <strong className="text-slate-800 dark:text-white">{selectedJob.company}</strong>.
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="mt-6 px-6 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
