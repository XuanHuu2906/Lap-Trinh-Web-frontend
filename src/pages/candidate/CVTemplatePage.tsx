import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  FileText,
  CheckCircle2,
  Award,
  Zap,
} from "lucide-react";
import { type CVTemplate, type CVTemplateCategory } from "../../types/cv.type";
import { CVTemplateCard } from "../../components/cv/CVTemplateCard";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/ui/button";

const MOCK_TEMPLATES: CVTemplate[] = [
  {
    id: 1,
    name: "Executive Standard",
    category: "Đơn giản",
    description:
      "Cấu trúc truyền thống, tối ưu cho ATS. Phù hợp cho cấp quản lý và tài chính.",
    thumbnailUrl: null,
    layoutConfig: null,
    isActive: true,
    createdBy: 1,
    createdAt: "2026-05-07T15:00:00Z",
    updatedAt: "2026-05-07T15:00:00Z",
    isNew: true,
    features: [
      "Tối ưu hệ thống ATS",
      "Cấu trúc 1 cột truyền thống",
      "Thích hợp cho Tài chính, Quản lý",
    ],
  },
  {
    id: 2,
    name: "Corporate Split",
    category: "Hiện đại",
    description:
      "Bố cục 2 cột hiện đại. Phân tách rõ ràng giữa kỹ năng và kinh nghiệm.",
    thumbnailUrl: null,
    layoutConfig: null,
    isActive: true,
    createdBy: 1,
    createdAt: "2026-05-07T15:00:00Z",
    updatedAt: "2026-05-07T15:00:00Z",
    features: [
      "Bố cục 2 cột cân đối",
      "Nổi bật phần Kỹ năng & Ngôn ngữ",
      "Thích hợp cho HR, Marketing",
    ],
  },
  {
    id: 3,
    name: "Tech Minimal",
    category: "Chuyên nghiệp",
    description:
      "Tập trung tối đa vào dữ liệu và công nghệ. Lựa chọn hàng đầu cho IT/Engineering.",
    thumbnailUrl: null,
    layoutConfig: null,
    isActive: true,
    createdBy: 1,
    createdAt: "2026-05-07T15:00:00Z",
    updatedAt: "2026-05-07T15:00:00Z",
    features: [
      "Tông màu tối (Dark Mode) sang trọng",
      "Làm nổi bật dự án Công nghệ",
      "Thích hợp cho Lập trình viên, Kỹ sư",
    ],
  },
  {
    id: 4,
    name: "Consultant Pro",
    category: "Chuyên nghiệp",
    description:
      "Trình bày dự án chuyên sâu. Thích hợp cho chuyên viên tư vấn và marketing.",
    thumbnailUrl: null,
    layoutConfig: null,
    isActive: true,
    createdBy: 1,
    createdAt: "2026-05-07T15:00:00Z",
    updatedAt: "2026-05-07T15:00:00Z",
    features: [
      "Căn lề chuẩn mực tối giản",
      "Phần chân trang cá tính",
      "Thích hợp cho Tư vấn viên, Sales",
    ],
  },
];

export default function CVTemplatePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CVTemplateCategory>("Tất cả");
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(
    null,
  );

  const categories: CVTemplateCategory[] = [
    "Tất cả",
    "Đơn giản",
    "Hiện đại",
    "Chuyên nghiệp",
  ];

  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description!.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUseTemplate = (_template: CVTemplate) => {
    navigate("/candidate/cv-builder");
  };

  const handleOpenPreview = (template: CVTemplate) => {
    setPreviewTemplate(template);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grow flex flex-col justify-start">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-medium font-sans">
        <span className="hover:text-slate-600 cursor-pointer">Resources</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600 font-semibold">Chọn template CV</span>
      </nav>

      {/* Header */}
      <div className="text-left mb-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans mb-4">
          Chọn Mẫu CV
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-sans leading-relaxed">
          Thể hiện năng lực chuyên môn với các mẫu CV được thiết kế theo chuẩn
          tuyển dụng doanh nghiệp.
          <br className="hidden sm:inline" /> Lựa chọn phong cách phù hợp nhất
          với ngành nghề của bạn.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div className="flex flex-wrap gap-2 order-2 md:order-1">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "secondary" : "outline"}
              size="sm"
              className={`rounded-sm border font-semibold text-xs cursor-pointer ${
                selectedCategory === category
                  ? "border-slate-300 text-slate-900 font-bold shadow-sm"
                  : "border-slate-200 text-slate-500 hover:text-slate-800"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="relative max-w-xs w-full order-1 md:order-2 self-end md:self-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm mẫu..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-sm text-xs font-medium placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <CVTemplateCard
              key={template.id}
              template={template}
              onPreview={handleOpenPreview}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-lg bg-white/50">
          <FileText className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600 mb-1">
            Không tìm thấy mẫu CV nào
          </p>
          <p className="text-xs text-slate-400 max-w-xs">
            Hãy thử đổi bộ lọc hoặc gõ một từ khóa tìm kiếm khác!
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={previewTemplate !== null}
        onClose={handleClosePreview}
        title={`Xem trước mẫu: ${previewTemplate?.name}`}
      >
        {previewTemplate && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-2">
            {/* Left: Preview */}
            <div className="md:col-span-7 bg-slate-50 border border-slate-200/60 p-6 rounded-md flex justify-center items-center">
              <div className="w-70 h-93.25 bg-white shadow-lg rounded-sm border border-slate-200/40 overflow-hidden relative p-6">
                {previewTemplate.id === 1 && (
                  <div className="w-full h-full text-[6px] text-slate-500 flex flex-col justify-between">
                    <div>
                      <div className="font-extrabold text-[16px] text-slate-900 leading-none mb-1">
                        NGUYỄN VĂN A
                      </div>
                      <div className="text-[8px] text-indigo-700 font-bold mb-3">
                        FINANCE MANAGER
                      </div>
                      <div className="border-b border-slate-200 pb-2 mb-4 flex justify-between">
                        <span>Email: info@example.com</span>
                        <span>Phone: 0987 654 321</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="font-bold text-slate-800 text-[8px] border-b border-slate-100 pb-1 mb-1.5 uppercase">
                            Kinh nghiệm làm việc
                          </div>
                          <div>
                            <div className="flex justify-between font-semibold text-slate-700 text-[7px]">
                              <span>Trưởng phòng tài chính - ABC Group</span>
                              <span>2022 - Hiện tại</span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-sm mt-1"></div>
                            <div className="w-11/12 h-1 bg-slate-100 rounded-sm mt-1"></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[8px] border-b border-slate-100 pb-1 mb-1.5 uppercase">
                            Học vấn
                          </div>
                          <div className="flex justify-between font-semibold text-slate-700 text-[7px]">
                            <span>Thạc sĩ Tài chính - Đại học KTQD</span>
                            <span>2018 - 2020</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[5px] text-slate-300 border-t border-slate-100 pt-2 text-center font-bold">
                      ATS OPTIMIZED STANDARD
                    </div>
                  </div>
                )}

                {previewTemplate.id === 2 && (
                  <div className="w-full h-full text-[6px] text-slate-500 flex">
                    <div className="w-1/3 bg-slate-50 p-3 border-r border-slate-200 -m-6 mr-4 flex flex-col justify-between">
                      <div>
                        <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto mb-3"></div>
                        <div className="font-bold text-slate-900 text-center text-[8px] mb-1">
                          TRẦN THỊ B
                        </div>
                        <div className="text-[5px] text-slate-500 text-center mb-4">
                          MARKETING SPECIALIST
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[6px] uppercase border-b border-slate-200 pb-0.5 mb-1">
                            Kỹ năng
                          </div>
                          <div className="space-y-1">
                            <div className="w-12 h-1 bg-indigo-600 rounded-sm"></div>
                            <div className="w-10 h-1 bg-indigo-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[5px] text-slate-400 font-mono tracking-widest text-center">
                        SAM BASE WORK
                      </div>
                    </div>
                    <div className="w-2/3 pt-2">
                      <div className="font-bold text-slate-900 text-[9px] border-b border-slate-200 pb-1.5 mb-3">
                        HỒ SƠ NGHỀ NGHIỆP
                      </div>
                      <p className="text-[6px] leading-relaxed mb-4">
                        Chuyên viên Marketing với 3 năm kinh nghiệm lập kế hoạch
                        và thực thi chiến dịch quảng cáo digital.
                      </p>
                      <div className="font-bold text-slate-900 text-[9px] border-b border-slate-200 pb-1.5 mb-2">
                        KINH NGHIỆM
                      </div>
                      <div className="font-bold text-slate-800 text-[7px]">
                        Senior SEO Executive - XYZ Corp
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-sm mt-1"></div>
                    </div>
                  </div>
                )}

                {previewTemplate.id === 3 && (
                  <div className="w-full h-full text-[6px] text-slate-300 flex flex-col justify-between bg-[#1F242D] -m-6 p-6">
                    <div>
                      <div className="font-mono font-extrabold text-[14px] text-[#D5A153] leading-none mb-1">
                        DEV_LE_VAN_C.EXE
                      </div>
                      <div className="text-[7px] text-slate-400 font-mono mb-3">
                        FULL STACK DEVELOPER
                      </div>
                      <div className="border-b border-slate-700 pb-2 mb-4 flex justify-between font-mono text-[5px]">
                        <span>EMAIL: dev@example.io</span>
                        <span>IP: 192.168.1.1</span>
                      </div>
                      <div className="font-bold text-[#D5A153] text-[8px] border-b border-slate-700 pb-1 mb-1.5 uppercase font-mono">
                        SYS.EXPERIENCE()
                      </div>
                      <div className="flex justify-between font-semibold text-[6px] font-mono">
                        <span>Senior Node.js Developer - TechCorp</span>
                        <span>2021 - Present</span>
                      </div>
                      <p className="text-[5px] text-slate-400 mt-1 leading-normal font-mono">
                        - Build high-scalable microservices with NestJS and
                        RabbitMQ.
                      </p>
                    </div>
                    <div className="bg-[#D5A153] text-[#1F242D] text-[5px] py-1 text-center font-bold font-mono tracking-wider">
                      HTTP://PORTFOLIO.LEVAN_C.IO
                    </div>
                  </div>
                )}

                {previewTemplate.id === 4 && (
                  <div className="w-full h-full text-[6px] text-slate-500 flex flex-col justify-between font-sans">
                    <div>
                      <div className="font-serif font-extrabold text-[18px] text-slate-900 leading-tight mb-1">
                        CVM
                      </div>
                      <div className="w-20 h-0.5 bg-slate-800 mb-3"></div>
                      <div className="font-bold text-[9px] text-slate-800 uppercase mb-2">
                        PHẠM THỊ D
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1 border-r border-slate-100 pr-2">
                          <div className="font-bold text-slate-800 text-[6px] mb-1 uppercase">
                            Kỹ năng
                          </div>
                          <ul className="space-y-1">
                            <li>• Tư vấn giải pháp</li>
                            <li>• Thương lượng</li>
                          </ul>
                        </div>
                        <div className="col-span-2">
                          <div className="font-bold text-slate-800 text-[6px] mb-1 uppercase">
                            Học vấn
                          </div>
                          <div className="font-semibold text-slate-700 text-[6px]">
                            Đại học Ngoại Thương - Cử nhân QTKD
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#0F172A] text-white text-[4px] py-1 text-center font-bold tracking-widest -m-6 mt-auto">
                      SAFE SI WORK
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info */}
            <div className="md:col-span-5 flex flex-col h-full justify-between">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 mb-3 font-sans">
                  Phong cách: {previewTemplate.category}
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mb-3 font-sans">
                  {previewTemplate.name}
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed mb-6">
                  {previewTemplate.description}
                </p>

                <div className="mb-8">
                  <h5 className="text-xs font-bold text-slate-900 mb-3 font-sans uppercase tracking-wider">
                    Đặc điểm nổi bật:
                  </h5>
                  <ul className="space-y-2.5">
                    {previewTemplate.features?.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-xs text-slate-600 font-sans"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2.5 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                    <li className="flex items-start text-xs text-slate-600 font-sans">
                      <Award className="h-4 w-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" />
                      <span>Nhà tuyển dụng khuyên dùng</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-md border border-indigo-100/50 flex items-start">
                  <Zap className="h-5 w-5 text-indigo-500 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-indigo-950 mb-1 font-sans">
                      Mẹo viết CV chuẩn:
                    </h6>
                    <p className="text-[11px] text-indigo-800/80 font-sans leading-relaxed">
                      Hãy điền đầy đủ và chi tiết các dự án của bạn, đồng thời
                      sử dụng các từ khóa chuyên ngành để nâng cao điểm số quét
                      ATS!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button
                  onClick={() => {
                    handleClosePreview();
                    handleUseTemplate(previewTemplate);
                  }}
                  variant="default"
                  size="lg"
                  className="w-full text-xs font-bold tracking-wider rounded-sm shadow-md hover:shadow-lg"
                >
                  SỬ DỤNG MẪU NÀY BẮT ĐẦU TẠO CV
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
