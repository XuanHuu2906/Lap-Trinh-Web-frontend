import React from 'react';
import {
  Briefcase,
  FileText,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle
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
      user: 'Ứng viên Trần Thu Hà',
      message: 'đã khởi tạo CV từ mẫu thiết kế "Tech Minimal"',
      time: '24 phút trước',
      icon: FileText,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      badgeText: 'Tạo CV',
    },
    {
      id: 4,
      type: 'recruiter_reg',
      user: 'Doanh nghiệp TechNova Solutions',
      message: 'đăng ký tài khoản doanh nghiệp mới thành công',
      time: '1 giờ trước',
      icon: Building2,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-100',
      badgeText: 'Doanh nghiệp mới',
    },
    {
      id: 5,
      type: 'cv_template',
      user: 'Admin Administrator',
      message: 'đã xuất bản mẫu thiết kế CV chuẩn "Creative Modern"',
      time: '4 giờ trước',
      icon: FileText,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-100',
      badgeText: 'Mẫu CV mới',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">

      {/* 1. TOP TITLE SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">TỔNG QUAN HỆ THỐNG</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Báo cáo thời gian thực và quản lý các hoạt động tuyển dụng trên hệ thống.
          </p>
        </div>
      </div>

      {/* 2. KPIS SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* 3. DUAL GRID: ACTIVITIES + ANALYTICS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Recent Activities (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-sm shadow-2xs p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Nhật ký hoạt động hệ thống gần đây
              </h3>
            </div>
            <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
              Xem tất cả
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

        {/* Right Column: Business Analytics & Shortcuts (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Business Analytics Card */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-2xs p-6">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">
                PHÂN TÍCH TRẠNG THÁI & TÀI KHOẢN
              </h3>
            </div>

            <div className="space-y-5">
              {/* Metric 1: Account breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700">Tỷ lệ người dùng (Ứng viên / DN)</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">18,520 / 942</span>
                </div>
                <div className="w-full h-2 bg-amber-500 rounded-sm overflow-hidden flex">
                  <div className="w-[95%] h-full bg-indigo-600" title="Ứng viên (95%)"></div>
                  <div className="w-[5%] h-full bg-amber-500" title="Doanh nghiệp (5%)"></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-indigo-600 font-bold">Ứng viên (95%)</span>
                  <span className="text-[9px] text-amber-600 font-bold">Doanh nghiệp (5%)</span>
                </div>
              </div>

              {/* Metric 2: Job approvals */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Trạng thái Tin tuyển dụng</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">1,482 tin</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden flex">
                  <div className="w-[84%] h-full bg-emerald-500" title="Đã duyệt (84%)"></div>
                  <div className="w-[12%] h-full bg-amber-500" title="Chờ duyệt (12%)"></div>
                  <div className="w-[4%] h-full bg-rose-500" title="Khác (4%)"></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-emerald-600 font-bold">Đã duyệt (84%)</span>
                  <span className="text-[9px] text-amber-600 font-bold">Chờ duyệt (12%)</span>
                  <span className="text-[9px] text-rose-600 font-bold">Khác (4%)</span>
                </div>
              </div>

              {/* Metric 3: CV Quality template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Mẫu CV tạo trên hệ thống</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">4,289 CV</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-sm overflow-hidden flex">
                  <div className="w-[72%] h-full bg-emerald-500" title="Sử dụng mẫu chuẩn (72%)"></div>
                  <div className="w-[28%] h-full bg-slate-300" title="Tải lên trực tiếp (28%)"></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-emerald-600 font-bold">Mẫu chuẩn (72%)</span>
                  <span className="text-[9px] text-slate-500 font-bold">Tự tải lên (28%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
