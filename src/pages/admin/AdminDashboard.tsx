import React from 'react';
import { 
  Briefcase, 
  FileText, 
  Users, 
  Building2, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Database,
  Cpu
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  // Mock KPIs Data
  const kpis = [
    {
      title: 'TIN ĐĂNG TUYỂN DỤNG',
      value: '1,482',
      change: '+12.4%',
      isPositive: true,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'CV ĐÃ ĐƯỢC TẠO',
      value: '4,289',
      change: '+18.2%',
      isPositive: true,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'ỨNG VIÊN ĐĂNG KÝ',
      value: '18,520',
      change: '+8.5%',
      isPositive: true,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'DOANH NGHIỆP ĐĂNG KÝ',
      value: '942',
      change: '+14.6%',
      isPositive: true,
      icon: Building2,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'TỶ LỆ KHỚP ATS',
      value: '76.4%',
      change: '-1.2%',
      isPositive: false,
      icon: Percent,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
  ];

  // Hoạt động gần đây trên hệ thống
  const recentActivities = [
    {
      id: 1,
      type: 'approval',
      user: 'Nhà tuyển dụng FPT Software',
      message: 'đã yêu cầu phê duyệt tin tuyển dụng "Senior React Developer"',
      time: '3 phút trước',
      icon: Clock,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-100',
      badgeText: 'Chờ duyệt',
    },
    {
      id: 2,
      type: 'registration',
      user: 'Ứng viên Lê Hoàng Nam',
      message: 'đã đăng ký tài khoản ứng viên mới thành công',
      time: '12 phút trước',
      icon: Users,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeText: 'Thành viên mới',
    },
    {
      id: 3,
      type: 'cv_created',
      user: 'Hệ thống tuyển dụng',
      message: 'Ứng viên đã khởi tạo CV từ Template "Tech Minimal"',
      time: '24 phút trước',
      icon: FileText,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      badgeText: 'Tạo CV',
    },
    {
      id: 4,
      type: 'ban',
      user: 'Admin Administrator',
      message: 'đã vô hiệu hóa tài khoản "spam_user@gmail.com" do vi phạm chính sách',
      time: '1 giờ trước',
      icon: XCircle,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-100',
      badgeText: 'Vô hiệu hóa',
    },
    {
      id: 5,
      type: 'system',
      user: 'Hệ thống tự động',
      message: 'Đã hoàn thành sao lưu cơ sở dữ liệu định kỳ (SQL Server Backup)',
      time: '4 giờ trước',
      icon: Database,
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
      badgeText: 'Bảo trì',
    },
  ];

  // Dữ liệu mô phỏng biểu đồ cột tăng trưởng (vẽ bằng Tailwind CSS)
  const chartData = [
    { label: 'Tháng 11', value: 34, height: 'h-[34%]' },
    { label: 'Tháng 12', value: 48, height: 'h-[48%]' },
    { label: 'Tháng 1', value: 65, height: 'h-[65%]' },
    { label: 'Tháng 2', value: 82, height: 'h-[82%]' },
    { label: 'Tháng 3', value: 74, height: 'h-[74%]' },
    { label: 'Tháng 4', value: 95, height: 'h-[95%]' },
    { label: 'Tháng 5 (Nay)', value: 100, height: 'h-[100%]' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* 1. TOP TITLE SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TỔNG QUAN HỆ THỐNG</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Báo cáo thời gian thực, giám sát tiến trình tuyển dụng và tình trạng máy chủ.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-bold bg-white border border-slate-200 px-3.5 py-2 rounded-sm shadow-2xs">
            CẬP NHẬT GẦN NHẤT: <span className="text-slate-800">12:51:33 (HÔM NAY)</span>
          </div>
        </div>
      </div>

      {/* 2. KPIS SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`bg-white border ${kpi.borderColor} p-5 rounded-sm shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-xs`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 ${kpi.bgColor} ${kpi.color} rounded-sm flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {kpi.value}
                  </span>
                </div>
                <div className={`flex items-center text-[10px] font-bold ${kpi.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  <span>{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. DUAL GRID: CHARTS + SYSTEM STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Pure CSS/Tailwind Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-sm shadow-2xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-850" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Xu hướng Đăng ký và Tạo hồ sơ CV mới
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Biểu đồ nửa năm qua
            </span>
          </div>

          {/* Graph Simulation Canvas */}
          <div className="h-[260px] flex items-end gap-5 sm:gap-8 px-4 border-b border-slate-200 pb-2 relative">
            
            {/* Grid Line Simulators */}
            <div className="absolute left-0 right-0 top-0 border-t border-slate-100/70 text-[9px] text-slate-350 font-bold pt-1">
              100% Peak
            </div>
            <div className="absolute left-0 right-0 top-[25%] border-t border-slate-100/70 text-[9px] text-slate-350 font-bold pt-1">
              75% High
            </div>
            <div className="absolute left-0 right-0 top-[50%] border-t border-slate-100/70 text-[9px] text-slate-350 font-bold pt-1">
              50% Normal
            </div>
            <div className="absolute left-0 right-0 top-[75%] border-t border-slate-100/70 text-[9px] text-slate-350 font-bold pt-1">
              25% Low
            </div>

            {/* Columns list */}
            {chartData.map((col, index) => (
              <div key={index} className="flex-1 flex flex-col items-center h-full justify-end relative group z-10">
                
                {/* Column Bar with Gradient & Hover tooltip */}
                <div className={`w-full ${col.height} bg-slate-900 hover:bg-indigo-600 transition-all duration-200 cursor-pointer relative flex items-start justify-center`}>
                  
                  {/* Tooltip Popup on Hover */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-sm shadow-md transition-all duration-150 z-20 pointer-events-none whitespace-nowrap">
                    Tăng trưởng: {col.value}%
                  </div>

                  <div className="w-full h-1.5 bg-indigo-500/80"></div>
                </div>

                <span className="text-[10px] text-slate-400 font-bold mt-2 text-center whitespace-nowrap leading-none block">
                  {col.label}
                </span>

              </div>
            ))}

          </div>

          <div className="flex flex-wrap gap-6 mt-4 justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-900 rounded-2xs"></span>
              <span className="text-xs text-slate-500 font-semibold">Tăng trưởng ứng viên thực tế</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-2xs"></span>
              <span className="text-xs text-slate-500 font-semibold">Công ty đăng ký và kích hoạt</span>
            </div>
          </div>

        </div>

        {/* Right: Server / Tech Health Status Monitor Widget */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-sm shadow-2xs p-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">
              THIẾT BỊ & MÁY CHỦ LOCAL
            </h3>
          </div>

          <div className="space-y-5">
            {/* Health metric 1: Database Connections */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">SQL Server (Local Connection)</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900">92/100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden">
                <div className="w-[92%] h-full bg-indigo-600 rounded-sm"></div>
              </div>
            </div>

            {/* Health metric 2: Server Workload CPU */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">CPU Load (Tải tài nguyên)</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900">42%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden">
                <div className="w-[42%] h-full bg-emerald-500 rounded-sm"></div>
              </div>
            </div>

            {/* Health metric 3: Memory */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-rose-600">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">Dung lượng bộ nhớ RAM</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900">68%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden">
                <div className="w-[68%] h-full bg-rose-500 rounded-sm"></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-150 rounded-sm mt-4">
            <span className="text-[10px] font-black text-slate-400 block uppercase leading-none">THƯ MỤC LƯU TRỮ TRỰC TUYẾN</span>
            <p className="text-xs font-mono font-bold text-slate-700 mt-2 truncate">
              D:\LTWeb\Thuchanh-Backend\
            </p>
            <span className="text-[9px] font-bold text-slate-400 block mt-1">Cơ sở dữ liệu đang kết nối: MS SQL SERVER</span>
          </div>

        </div>

      </div>

      {/* 4. RECENT SYSTEM ACTIVITIES ROW */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Nhật ký vận hành & hoạt động hệ thống
            </h3>
          </div>
          <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
            Xem tất cả nhật ký (Logs)
          </span>
        </div>

        {/* List of activities */}
        <div className="divide-y divide-slate-100">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-200/80 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-800 leading-normal">
                      <strong className="text-slate-950 font-bold">{act.user}</strong> {act.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
                      {act.time}
                    </span>
                  </div>
                </div>
                <div className="self-start sm:self-auto">
                  <span className={`inline-flex px-2.5 py-1 border text-[10px] font-bold uppercase rounded-2xs ${act.badgeColor}`}>
                    {act.badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
