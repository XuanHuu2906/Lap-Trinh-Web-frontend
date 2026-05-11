import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Layout,
  X,
  CheckCircle2,
  Upload,
  FileCode,
  FileText,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Award,
  Globe,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

interface CVTemplate {
  id: number;
  name: string;
  category: 'Đon giản' | 'Đơn giản' | 'Hiện đại' | 'Chuyên nghiệp';
  description: string;
  thumbnailUrl?: string;
  isActive: boolean;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock ban đầu cho các mẫu CV hiện tại (Thỏa mãn UC-19)
const INITIAL_TEMPLATES_MOCK: CVTemplate[] = [
  {
    id: 1,
    name: 'Executive Standard',
    category: 'Đơn giản',
    description: 'Bố cục truyền thống, đơn giản, tập trung làm nổi bật quá trình công tác. Mẫu CV chuẩn hóa đạt điểm tương thích tối đa 99% với các bộ đọc ATS tự động trên thị trường.',
    thumbnailUrl: 'executive_standard_v1.png',
    isActive: true,
    features: ['Chuẩn hóa ATS tuyệt đối', 'Bố cục 1 cột tối ưu cho robot', 'Cực kỳ tinh gọn chuyên nghiệp'],
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    id: 2,
    name: 'Modern Split Creative',
    category: 'Hiện đại',
    description: 'Thiết kế chia hai cột tương phản cao. Thích hợp cho ứng viên mong muốn ứng tuyển các vị trí Sáng tạo, Marketing, thiết kế UI/UX nhờ cách trình bày kỹ năng bắt mắt.',
    thumbnailUrl: 'modern_split_blue.png',
    isActive: true,
    features: ['Bố cục 2 cột cá tính', 'Thang đo kỹ năng trực quan', 'Không gian chèn ảnh chân dung sang trọng'],
    createdAt: '2026-05-03T14:30:00Z',
    updatedAt: '2026-05-03T14:30:00Z'
  },
  {
    id: 3,
    name: 'Tech Minimalist Dark',
    category: 'Hiện đại',
    description: 'Tông màu xám ghi trung tính hiện đại, mang hơi thở công nghệ cao. Bố cục phân mảnh hợp lý, khuyên dùng cho các lập trình viên, kỹ sư dữ liệu hoặc chuyên gia CNTT.',
    thumbnailUrl: 'tech_minimalist_dark.png',
    isActive: true,
    features: ['Tông màu xám đen sang trọng', 'Dễ theo dõi kinh nghiệm dự án', 'Bố cục cân đối, thoáng đãng'],
    createdAt: '2026-05-05T09:15:00Z',
    updatedAt: '2026-05-05T09:15:00Z'
  },
  {
    id: 4,
    name: 'Corporate Leadership',
    category: 'Chuyên nghiệp',
    description: 'Dành cho các vị trí quản lý cấp cao, giám đốc điều hành, trưởng phòng. Màu xanh hải quân sẫm biểu trưng cho sự ổn định, tin cậy, vững chắc và năng lực vượt trội.',
    thumbnailUrl: 'corporate_navy_gold.png',
    isActive: false, // Ban đầu để ẩn (UC-19 Luồng phụ ẩn mẫu)
    features: ['Thiết kế navy vương giả', 'Làm nổi bật dự án & chứng chỉ', 'Có phần tóm tắt mục tiêu uy tín'],
    createdAt: '2026-05-08T11:00:00Z',
    updatedAt: '2026-05-08T11:00:00Z'
  }
];

export const AdminTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<CVTemplate[]>(INITIAL_TEMPLATES_MOCK);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Trạng thái cho Form Modal (Thêm/Sửa)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Các trường dữ liệu của Form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Đơn giản' | 'Hiện đại' | 'Chuyên nghiệp'>('Đơn giản');
  const [formDescription, setFormDescription] = useState('');
  const [formThumbnailName, setFormThumbnailName] = useState('');
  const [formConfigName, setFormConfigName] = useState('');
  const [formFeatureInput, setFormFeatureInput] = useState('');
  const [formFeaturesList, setFormFeaturesList] = useState<string[]>([]);

  // Trạng thái cho Trạm xem thử CV thiết kế (Luồng chính bước 5)
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  // Mở modal thêm mới mẫu CV (UC-19)
  const handleOpenAddModal = () => {
    setFormMode('add');
    setEditingTemplateId(null);
    setFormName('');
    setFormCategory('Đơn giản');
    setFormDescription('');
    setFormThumbnailName('');
    setFormConfigName('');
    setFormFeatureInput('');
    setFormFeaturesList([]);
    setIsFormModalOpen(true);
  };

  // Mở modal cập nhật mẫu CV (UC-19)
  const handleOpenEditModal = (template: CVTemplate) => {
    setFormMode('edit');
    setEditingTemplateId(template.id);
    setFormName(template.name);
    setFormCategory(template.category === 'Đon giản' ? 'Đơn giản' : template.category);
    setFormDescription(template.description);
    setFormThumbnailName(template.thumbnailUrl || '');
    setFormConfigName('layout_config_schema.json');
    setFormFeatureInput('');
    setFormFeaturesList(template.features || []);
    setIsFormModalOpen(true);
  };

  // Kích hoạt hoặc ẩn mẫu CV khỏi ứng viên (Luồng phụ ẩn CV của UC-19)
  const handleToggleActive = (id: number) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.isActive;
        return { ...t, isActive: nextState, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  // Thêm một đặc điểm thiết kế vào danh sách tạm của Form
  const handleAddFeatureToForm = () => {
    if (formFeatureInput.trim()) {
      setFormFeaturesList(prev => [...prev, formFeatureInput.trim()]);
      setFormFeatureInput('');
    }
  };

  // Xóa một đặc điểm thiết kế khỏi danh sách tạm của Form
  const handleRemoveFeatureFromForm = (idxToDelete: number) => {
    setFormFeaturesList(prev => prev.filter((_, idx) => idx !== idxToDelete));
  };

  // Gửi Form Đăng ký / Chỉnh sửa mẫu CV (Xác thực UC-25)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // RÀO CẢN KIỂM DUYỆT (UC-25: Kiểm duyệt tính an toàn của tệp tải lên)
    if (formConfigName) {
      if (!formConfigName.toLowerCase().endsWith('.json')) {
        alert('[LỖI KIỂM DUYỆT UC-25] Phát hiện tệp cấu hình không hợp lệ! Hệ thống chỉ chấp nhận định dạng tệp .json để xây dựng sơ đồ trường dữ liệu.');
        return;
      }
    } else {
      alert('[LỖI KIỂM DUYỆT UC-25] Vui lòng tải lên tệp cấu hình trường thiết kế dạng .json để hệ thống có dữ liệu biên dịch CV Builder.');
      return;
    }

    if (formThumbnailName && !/\.(png|jpe?g|webp)$/i.test(formThumbnailName)) {
      alert('[LỖI KIỂM DUYỆT UC-25] Phát hiện ảnh thumbnail giả mạo hoặc chứa mã độc đuôi thực thi! Vui lòng chỉ tải lên ảnh định dạng .png, .jpg hoặc .webp.');
      return;
    }

    if (formMode === 'add') {
      // Đăng ký mới mẫu CV
      const newTemplateId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
      const newTemplateObj: CVTemplate = {
        id: newTemplateId,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        thumbnailUrl: formThumbnailName || 'default_cv_template.png',
        isActive: true, // Mặc định mở ngay khi đăng ký thành công
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: formFeaturesList.length > 0 ? formFeaturesList : ['Dễ dàng tùy biến thông tin', 'Bố cục cân đối trực quan']
      };

      setTemplates(prev => [newTemplateObj, ...prev]);
      alert('Đã đăng ký thêm mới mẫu CV thành công và đưa vào hoạt động!');
    } else {
      // Chỉnh sửa mẫu CV hiện có
      setTemplates(prev => prev.map(t => {
        if (t.id === editingTemplateId) {
          return {
            ...t,
            name: formName.trim(),
            category: formCategory,
            description: formDescription.trim(),
            thumbnailUrl: formThumbnailName,
            features: formFeaturesList,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));
      alert('Đã cập nhật các thay đổi của mẫu CV thành công!');
    }

    setIsFormModalOpen(false);
  };

  // Xóa mẫu CV (Xử lý ngoại lệ UC-19)
  const handleDeleteTemplate = (id: number, name: string) => {
    // NGOẠI LỆ: Xóa template đang được dùng bởi ứng viên
    if (id === 1 || id === 2) {
      alert(`[NGOẠI LỆ UC-19] Không thể xóa mẫu CV "${name}"!
----------------------------------------------------------------------
Hệ thống phát hiện mẫu thiết kế này đang được liên kết với 34 bản CV đang hoạt động của ứng viên.
Việc xóa vĩnh viễn sẽ phá vỡ cấu trúc CV của họ.

BIỆN PHÁP THAY THẾ:
Vui lòng sử dụng cần gạt "ẨN KHỎI USER" để ẩn mẫu này đi. Ứng viên mới sẽ không nhìn thấy mẫu này nữa, nhưng các CV cũ đã tạo vẫn sẽ được giữ nguyên an toàn.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mẫu CV "${name}" khỏi hệ thống?`)) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      alert('Đã xóa mẫu CV thành công.');
    }
  };

  // Lọc danh sách mẫu CV hiển thị trên giao diện quản trị
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Tất cả' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800">

      {/* 1. TOP TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">QUẢN LÝ TEMPLATE CV</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Quản lý kho template CV cung cấp cho ứng viên, hỗ trợ Thêm mới, Sửa, Xóa, Xem trước và Ẩn mẫu CV an toàn.
          </p>
        </div>

        {/* Button Đăng ký dùng Shadcn UI */}
        <Button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          ĐĂNG KÝ MẪU MỚI
        </Button>
      </div>

      {/* 2. CONTROL FILTERS */}
      <div className="bg-white border border-slate-200/90 rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-3xs">

        {/* Category filters sử dụng Shadcn UI Buttons */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['Tất cả', 'Đơn giản', 'Hiện đại', 'Chuyên nghiệp'].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="font-bold h-9 px-3.5 text-xs cursor-pointer text-left"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Search tool - Sử dụng Shadcn Input */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
            <Search className="w-4 h-4" />
          </span>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm mẫu CV..."
            className="w-full h-9 pl-10 pr-3"
          />
        </div>

      </div>

      {/* 3. TEMPLATES DISPLAY GRID */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white border ${template.isActive ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/50'} rounded-sm shadow-3xs p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xs`}
            >
              {/* Status Ribbon (For Inactive templates) */}
              {!template.isActive && (
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-slate-200 text-slate-500 text-[9px] font-black rounded-xs uppercase tracking-wider">
                  Đang ẩn khỏi ứng viên
                </div>
              )}

              <div>
                {/* Heading info - Sử dụng Shadcn Badge */}
                <div className="flex items-start justify-between mb-3.5">
                  <div>
                    <Badge variant="secondary" className="mb-1.5">
                      {template.category}
                    </Badge>
                    <h3 className="text-base font-extrabold text-slate-900 leading-none">
                      {template.name}
                    </h3>
                  </div>
                </div>

                {/* Simulated Thumbnail Preview Placeholder */}
                <div className="aspect-[16/9] w-full bg-slate-50 border border-slate-150/80 rounded-sm mb-4 flex flex-col items-center justify-center p-4 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 z-10">
                    {/* Xem thử bằng Shadcn Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="bg-white hover:bg-slate-100 border-none text-slate-900 text-[11px] font-black rounded-sm h-8 px-4 cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      Xem thử thiết kế
                    </Button>
                  </div>
                  <FileText className="w-8 h-8 text-slate-300 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{template.thumbnailUrl || 'template_design.png'}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                  {template.description}
                </p>

                {/* Features checklist list */}
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase mb-1">
                    Đặc điểm nổi bật:
                  </span>
                  {template.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center text-xs text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer controls inside Card */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">

                {/* Active switch slider (Luồng thay thế) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(template.id)}
                    className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                    title={template.isActive ? 'Ẩn mẫu CV này khỏi người dùng' : 'Hiển thị mẫu CV này cho người dùng'}
                  >
                    {template.isActive ? (
                      <ToggleRight className="w-9 h-6 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-9 h-6 text-slate-300" />
                    )}
                  </button>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {template.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
                  </span>
                </div>

                {/* Edit/Delete actions sử dụng Shadcn UI Buttons */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPreviewTemplate(template)}
                    className="h-8 w-8 border border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
                    title="Xem trước giao diện template"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenEditModal(template)}
                    className="h-8 w-8 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/20 bg-white"
                    title="Chỉnh sửa chi tiết"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    className="h-8 w-8 border border-slate-200 text-slate-400 hover:text-red-650 hover:border-red-200 bg-white"
                    title="Xóa mẫu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm py-16 text-center shadow-3xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">Không tìm thấy mẫu CV nào khớp bộ lọc</p>
          <p className="text-xs text-slate-400 mt-1">Vui lòng thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc danh mục khác.</p>
        </div>
      )}

      {/* 4. MODAL: ĐĂNG KÝ HOẶC CHỈNH SỬA MẪU CV (Hỗ trợ upload & cấu hình) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-sm w-full max-w-lg shadow-xl overflow-hidden animate-slide-up text-left">
            <div className="h-1 bg-indigo-600 w-full"></div>

            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Layout className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  {formMode === 'add' ? 'Đăng ký Template CV mới' : 'Cập nhật thiết kế Template CV'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* 1. Template Name - Sử dụng Shadcn UI Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">TÊN MẪU THIẾT KẾ</label>
                  <Input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Executive Standard, Modern Creative..."
                    className="w-full"
                  />
                </div>

                {/* 2. Category */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">DANH MỤC PHÂN LOẠI</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full border border-slate-200 text-xs font-bold h-10 px-3 outline-none focus:border-slate-850 rounded-sm bg-white cursor-pointer text-slate-850"
                  >
                    <option value="Đơn giản">Đơn giản (ATS Friendly)</option>
                    <option value="Hiện đại">Hiện đại (Modern Split)</option>
                    <option value="Chuyên nghiệp">Chuyên nghiệp (Professional)</option>
                  </select>
                </div>

                {/* 3. Description */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">MÔ TẢ CHI TIẾT NGẮN</label>
                  <textarea
                    rows={2}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Mô tả tóm tắt phong cách thiết kế, đối tượng ngành nghề phù hợp..."
                    className="w-full border border-slate-200 text-xs font-semibold p-3 outline-none focus:border-slate-850 rounded-sm bg-white text-slate-850"
                  ></textarea>
                </div>

                {/* 4. Upload Preview Design Image (Thumbnail) & Upload JSON Config */}
                <div className="grid grid-cols-2 gap-4">
                  {/* File Upload 1: Thumbnail */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ẢNH THIẾT KẾ (THUMBNAIL)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        id="thumbnail-upload"
                        className="hidden"
                        onChange={() => setFormThumbnailName(`${formName.toLowerCase().replace(/ /g, '_')}_preview.png`)}
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="w-full h-10 border border-slate-200 rounded-sm px-3 flex items-center justify-between text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="truncate pr-2">{formThumbnailName || 'Chọn ảnh xem trước...'}</span>
                        <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </label>
                    </div>
                  </div>

                  {/* File Upload 2: JSON Layout Config */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CẤU HÌNH TRƯỜNG (JSON)</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        id="config-upload"
                        className="hidden"
                        onChange={() => setFormConfigName('layout_config_schema.json')}
                      />
                      <label
                        htmlFor="config-upload"
                        className="w-full h-10 border border-slate-200 rounded-sm px-3 flex items-center justify-between text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="truncate pr-2">{formConfigName || 'Tải file .json...'}</span>
                        <FileCode className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 5. Features checklist selection - Sử dụng Shadcn UI Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ĐẶC ĐIỂM THIẾT KẾ NỔI BẬT</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={formFeatureInput}
                      onChange={(e) => setFormFeatureInput(e.target.value)}
                      placeholder="Ví dụ: Bố cục 2 cột, Tương thích ATS tốt..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeatureToForm}
                      variant="secondary"
                      className="h-10 px-4"
                    >
                      Thêm
                    </Button>
                  </div>

                  {/* Features listing */}
                  {formFeaturesList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 bg-slate-50 border border-slate-150 p-2.5 rounded-sm">
                      {formFeaturesList.map((feat, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-white border-slate-200 text-slate-650 inline-flex items-center gap-1 normal-case font-semibold"
                        >
                          {feat}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromForm(index)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Action buttons inside form sử dụng Shadcn UI */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-slate-500 hover:text-slate-850 font-bold text-xs h-9 px-4"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-xs"
                >
                  {formMode === 'add' ? 'Đăng ký mẫu' : 'Lưu cập nhật'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 5. MODAL: PREVIEW (XEM TRƯỚC GIAO DIỆN TEMPLATE CV) - LUỒNG CHÍNH BƯỚC 5 */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090d16]/85 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-100 border border-slate-200 rounded-sm w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-slide-up text-left">

            {/* Header */}
            <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    XEM TRƯỚC BẢN THIẾT KẾ: {previewTemplate.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wide">
                    Danh mục: {previewTemplate.category} • Người thiết kế: Admin Hệ Thống
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Preview Workstation */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-250 flex justify-center items-start">

              {/* Simulated Paper CV Document Sheet */}
              <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-sm shadow-lg overflow-hidden flex flex-col text-slate-800 font-sans min-h-[842px]">

                {/* 1. Render Template Style variant based on category */}

                {previewTemplate.category === 'Đơn giản' && (
                  <div className="p-8 space-y-6">
                    {/* Header Minimal */}
                    <div className="text-center border-b border-slate-200 pb-5">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">NGUYỄN VĂN A</h2>
                      <p className="text-xs text-indigo-600 font-bold tracking-widest uppercase mt-1">Lập Trình Viên Full-Stack</p>
                      <div className="flex justify-center gap-4 text-[11px] text-slate-500 font-medium mt-3">
                        <span>anv@gmail.com</span>
                        <span>•</span>
                        <span>0987 654 321</span>
                        <span>•</span>
                        <span>Hà Nội, Việt Nam</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-slate-800 pl-2">Mục tiêu nghề nghiệp</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        Hơn 3 năm kinh nghiệm trong phát triển hệ thống web quy mô lớn. Mong muốn mang kiến thức về React, Node.js và kiến trúc microservices đóng góp cho sự phát triển của công ty.
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-slate-800 pl-2">Kinh nghiệm làm việc</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                            <span>CÔNG TY CÔNG NGHỆ ABC — Lập trình viên ReactJS</span>
                            <span className="text-slate-500">T6/2024 - Hiện tại</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">Xây dựng và tối ưu giao diện dashboard quản lý thông tin doanh nghiệp, nâng tốc độ tải trang lên 35%.</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                            <span>TẬP ĐOÀN XYZ — Lập trình viên Backend</span>
                            <span className="text-slate-500">T9/2023 - T5/2024</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">Phát triển hệ thống APIs cho mobile app dịch vụ thương mại điện tử sử dụng Express và MongoDB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-2 border-slate-800 pl-2">Học vấn</h4>
                      <div className="flex justify-between text-[11px] font-bold text-slate-900">
                        <span>ĐẠI HỌC CÔNG NGHỆ THÔNG TIN — Cử nhân CNTT (GPA: 3.4/4)</span>
                        <span className="text-slate-500">2020 - 2024</span>
                      </div>
                    </div>
                  </div>
                )}

                {(previewTemplate.category === 'Hiện đại' || previewTemplate.category === 'Đon giản') && (
                  <div className="flex flex-1 min-h-[842px]">
                    {/* Left Split Navigation sidebar (Contrast Dark theme background) */}
                    <div className="w-[220px] bg-slate-900 text-white p-6 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="text-left border-b border-slate-800 pb-4">
                          <h2 className="text-lg font-black tracking-tight leading-none text-white uppercase">TRẦN THỊ B</h2>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1.5 block">UI/UX Designer</p>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-3">
                          <span className="text-[9px] font-black text-indigo-400 tracking-wider block uppercase">Liên hệ</span>
                          <div className="text-[10px] text-slate-300 space-y-2.5 font-medium">
                            <p className="truncate">tranthib@gmail.com</p>
                            <p>0901 234 567</p>
                            <p>TP. HCM, Việt Nam</p>
                          </div>
                        </div>

                        {/* Skills breakdown stats layout */}
                        <div className="space-y-3">
                          <span className="text-[9px] font-black text-indigo-400 tracking-wider block uppercase">Kỹ năng thiết kế</span>
                          <div className="space-y-2 text-[10px] text-slate-300 font-semibold">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Figma Design</span>
                                <span className="text-indigo-400">90%</span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[90%]"></div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Prototyping</span>
                                <span className="text-indigo-400">80%</span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[80%]"></div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>User Research</span>
                                <span className="text-indigo-400">75%</span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[75%]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <span className="text-[8px] text-slate-500 font-mono tracking-widest block text-center">HireArch Template</span>
                    </div>

                    {/* Right side body detail view */}
                    <div className="flex-1 p-8 space-y-6 text-left">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          Giới thiệu bản thân
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          Nhà thiết kế sản phẩm sáng tạo với niềm đam mê sâu sắc trong việc chuyển đổi các vấn đề phức tạp của người dùng thành các giải pháp tương tác đơn giản, mượt mà và trực quan nhất.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                          Kinh nghiệm dự án nổi bật
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                              <span>CREATIVE HUB — UI/UX Designer</span>
                              <span className="text-indigo-600 text-[10px]">2024 - Hiện tại</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">Nghiên cứu hành vi, tái cấu trúc luồng mua sắm sàn TMĐT giúp tăng chỉ số chuyển đổi giỏ hàng lên 14%.</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                              <span>SAIGON STUDIO — Thiết kế giao diện</span>
                              <span className="text-indigo-600 text-[10px]">2023 - 2024</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold mt-1">Phối hợp với PM thiết kế 5 website thương hiệu lớn đạt giải thưởng thiết kế quốc gia.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <GraduationCap className="w-4 h-4 text-indigo-500" />
                          Học trình đào tạo
                        </h4>
                        <div className="flex justify-between text-[11px] font-bold text-slate-900">
                          <span>ĐẠI HỌC KIẾN TRÚC TP.HCM — Ngành Thiết Kế Đồ Họa</span>
                          <span className="text-slate-500 text-[10px]">2019 - 2023</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewTemplate.category === 'Chuyên nghiệp' && (
                  <div className="p-8 space-y-6">
                    {/* Header Professional Navy style banner */}
                    <div className="bg-[#0f172a] text-white p-6 -mx-8 -mt-8 text-left flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-black tracking-wider uppercase">PHẠM MINH C</h2>
                        <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase mt-1">CHUYÊN GIA TÀI CHÍNH / PROJECT MANAGER</p>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium text-right space-y-1">
                        <p>pmc@gmail.com</p>
                        <p>0912 345 678</p>
                        <p>Hà Nội, Việt Nam</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-[#0f172a] pb-1.5">
                        <Award className="w-4 h-4 text-[#0f172a]" />
                        TÓM TẮT CHUYÊN MÔN
                      </h4>
                      <p className="text-[11px] text-slate-650 font-medium leading-relaxed">
                        Chuyên gia Quản lý dự án đạt chứng chỉ PMP quốc tế với hơn 5 năm kinh nghiệm dẫn dắt các dự án tài chính số quy mô lớn. Am hiểu sâu sắc về quản trị rủi ro và tối ưu hóa ngân sách vận hành.
                      </p>
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5 border-b-2 border-[#0f172a] pb-1.5">
                        <Briefcase className="w-4 h-4 text-[#0f172a]" />
                        QUÁ TRÌNH CÔNG TÁC CHUYÊN NGHIỆP
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                            <span>VINA BANK — Trưởng Ban Quản Lý Dự Án Fintech</span>
                            <span className="text-[#0f172a] font-black text-[10px]">T1/2023 - Hiện tại</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">Quản lý ngân sách 2.5 triệu USD, dẫn dắt đội ngũ 24 kỹ sư xây dựng lõi thẻ thanh toán thế hệ mới đúng tiến độ cam kết.</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                            <span>FINANCE GROUP — Trưởng nhóm Phân tích Nghiệp vụ</span>
                            <span className="text-[#0f172a] font-black text-[10px]">T8/2021 - T12/2022</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1">Phân tích yêu cầu, xây dựng tài liệu kỹ thuật cho hệ thống ERP nội bộ giúp cắt giảm 18% chi phí vận hành.</p>
                        </div>
                      </div>
                    </div>

                    {/* Core Skills and Certificates in columns */}
                    <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-[#0f172a]" />
                          KỸ NĂNG CỐT LÕI
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-xs">Risk Management</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-xs">Agile/Scrum</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-xs">Budget Control</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-wider flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#0f172a]" />
                          CHỨNG CHỈ QUỐC TẾ
                        </h4>
                        <ul className="text-[10px] font-semibold text-slate-600 space-y-1 list-disc list-inside">
                          <li>Project Management Professional (PMP)</li>
                          <li>Certified ScrumMaster (CSM)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Bottom bar đóng xem trước */}
            <div className="px-6 py-4 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-bold">Bản xem trước dữ liệu mẫu</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
                className="bg-transparent border-slate-700 hover:bg-slate-800 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-xs h-9 px-4 cursor-pointer"
              >
                Đóng
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
