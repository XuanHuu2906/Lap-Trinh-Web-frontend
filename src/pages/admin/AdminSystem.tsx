import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Cpu, 
  ShieldAlert, 
  Search, 
  Lock, 
  Unlock, 
  Save, 
  RefreshCw, 
  Server, 
  Database
} from 'lucide-react';
import { type User, type UserRole, type UserStatus } from '../../types/user.type';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

// Mock danh sách người dùng ban đầu
const INITIAL_USERS_MOCK: User[] = [
  { id: 1, email: 'admin@hirearch.com', role: 'admin', status: 'active', createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z' },
  { id: 2, email: 'lehoangnam_coder@gmail.com', role: 'candidate', status: 'active', createdAt: '2026-05-10T08:12:00Z', updatedAt: '2026-05-10T08:12:00Z' },
  { id: 3, email: 'hr.fptsoftware@fpt.com', role: 'recruiter', status: 'active', createdAt: '2026-05-09T10:20:00Z', updatedAt: '2026-05-09T10:20:00Z' },
  { id: 4, email: 'spam_account_99@yahoo.com', role: 'candidate', status: 'banned', createdAt: '2026-05-01T15:30:00Z', updatedAt: '2026-05-05T11:00:00Z' },
  { id: 5, email: 'recruiter.shopee@shopee.vn', role: 'recruiter', status: 'active', createdAt: '2026-05-07T09:00:00Z', updatedAt: '2026-05-07T09:00:00Z' },
  { id: 6, email: 'nguyenvan_a_manager@gmail.com', role: 'candidate', status: 'inactive', createdAt: '2026-05-02T11:45:00Z', updatedAt: '2026-05-02T11:45:00Z' }
];

export const AdminSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'monitoring'>('users');
  
  // State quản lý danh sách Users
  const [users, setUsers] = useState<User[]>(INITIAL_USERS_MOCK);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('Tất cả');

  // State quản lý Cấu hình hệ thống
  const [maxUploadSize, setMaxUploadSize] = useState(10);
  const [jobExpiryDays, setJobExpiryDays] = useState(30);
  const [atsThreshold, setAtsThreshold] = useState(70);
  const [systemEmail, setSystemEmail] = useState('notifications@hirearch.com');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // State quản lý Giám sát Server Telemetry (biến thiên tự động qua useEffect)
  const [cpuUsage, setCpuUsage] = useState(45);
  const [ramUsage, setRamUsage] = useState(62);
  const [networkLatency, setNetworkLatency] = useState(14);
  const [diskFreeGb] = useState(245);

  // Hiệu ứng dao động thông số Server Telemetry tạo cảm giác thực tế sống động (WOW Factor)
  useEffect(() => {
    const interval = setInterval(() => {
      // CPU dao động ngẫu nhiên tăng/giảm nhẹ khoảng 3%
      setCpuUsage(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const nextVal = prev + change;
        return nextVal > 10 && nextVal < 90 ? nextVal : prev;
      });
      // RAM dao động cực nhỏ 1%
      setRamUsage(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const nextVal = prev + change;
        return nextVal > 40 && nextVal < 85 ? nextVal : prev;
      });
      // Độ trễ mạng dao động giữa 11ms và 20ms
      setNetworkLatency(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const nextVal = prev + change;
        return nextVal > 8 && nextVal < 35 ? nextVal : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Xử lý Khóa/Mở khóa tài khoản (Ban/Unban)
  const handleToggleUserStatus = (userId: number, currentStatus: UserStatus, email: string) => {
    const isBan = currentStatus !== 'banned';
    const actionText = isBan ? 'Khóa vĩnh viễn' : 'Mở khóa hoạt động';
    
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản người dùng "${email}"?`)) {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: isBan ? 'banned' as const : 'active' as const };
        }
        return u;
      }));
      alert(`Đã ${isBan ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} "${email}" thành công.`);
    }
  };

  // Thay đổi quyền hạn (Role) người dùng thử nghiệm
  const handleChangeUserRole = (userId: number, newRole: UserRole, email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));
    alert(`Đã thay đổi vai trò tài khoản "${email}" thành "${newRole}" thành công.`);
  };

  // Lưu cấu hình tham số hệ thống
  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    setTimeout(() => {
      setIsSavingSettings(false);
      alert('Lưu các tham số cấu hình hệ thống thành công! Toàn bộ thay đổi đã được áp dụng vào Runtime Database.');
    }, 800);
  };

  // Lọc danh sách người dùng theo tên/email và theo vai trò
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'Tất cả' || u.role === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800">
      
      {/* 1. TOP MENU NAV & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">CẤU HÌNH & HỆ THỐNG</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Quản lý tài khoản bảo mật, tinh chỉnh tham số vận hành, sao lưu và giám sát hiệu năng máy chủ.
          </p>
        </div>
      </div>

      {/* 2. TAB CONTROLLER CHÍNH */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-slate-900 text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Users className="w-4 h-4" />
          Tài khoản người dùng ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'border-slate-900 text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Settings className="w-4 h-4" />
          Tham số cấu hình
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'monitoring'
              ? 'border-slate-900 text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Giám sát hiệu suất (Real-time)
        </button>
      </div>

      {/* 3. TABS CONTENT VIEWPORT */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        
        {/* TAB 1: USER DATABASE MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            
            {/* User filters row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                  <Search className="w-4 h-4" />
                </span>
                <Input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Tìm tài khoản người dùng..."
                  className="w-full h-9 pl-10 pr-3"
                />
              </div>

              <div className="flex items-center gap-2 border border-slate-200 px-2.5 h-9 bg-white rounded-sm w-full sm:w-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phân quyền:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="text-xs font-bold text-slate-600 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="Admin">Admin</option>
                  <option value="Candidate">Candidate</option>
                  <option value="Recruiter">Recruiter</option>
                </select>
              </div>

            </div>

            {/* User Database Table Grid */}
            <div className="overflow-x-auto border border-slate-150 rounded-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">ĐỊA CHỈ EMAIL TÀI KHOẢN</th>
                    <th className="px-5 py-3">VAI TRÒ</th>
                    <th className="px-5 py-3">TRẠNG THÁI KHÓA</th>
                    <th className="px-5 py-3">NGÀY ĐĂNG KÝ</th>
                    <th className="px-5 py-3 text-center">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-400">#{user.id}</td>
                        <td className="px-5 py-3.5 font-extrabold text-slate-900">{user.email}</td>
                        <td className="px-5 py-3.5 uppercase">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value as any, user.email)}
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 px-2 py-1 rounded-sm outline-none cursor-pointer"
                            disabled={user.role === 'admin'} // Không đổi quyền của chính super admin
                          >
                            <option value="admin">Admin</option>
                            <option value="candidate">Candidate</option>
                            <option value="recruiter">Recruiter</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          {/* SỬ DỤNG SHADCN BADGE */}
                          <Badge 
                            variant={
                              user.status === 'active' 
                                ? 'success' 
                                : user.status === 'banned'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {user.status === 'active' ? 'Hoạt động' : user.status === 'banned' ? 'Đã khóa' : 'Chưa kích hoạt'}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-slate-450 font-semibold">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {user.role !== 'admin' ? (
                            /* Sử dụng Button Shadcn UI cho thao tác Lock/Unlock */
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleUserStatus(user.id, user.status, user.email)}
                              className={`h-8 w-8 border cursor-pointer ${
                                user.status === 'banned'
                                  ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                  : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                              }`}
                              title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {user.status === 'banned' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </Button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hệ thống</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                        Không có người dùng nào trùng khớp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: SYSTEM GENERAL CONFIGURATION PARAMETERS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettingsSubmit} className="p-8 max-w-2xl space-y-6 text-left">
            
            <div className="border-b border-slate-100 pb-4 mb-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">THAM SỐ CẤU HÌNH VẬN HÀNH</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Các điều chỉnh ảnh hưởng trực tiếp đến quy định tin đăng và tệp tải lên hệ thống.</p>
            </div>

            <div className="space-y-4">
              
              {/* Parameter: Max Upload File Size - Sử dụng Shadcn Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Dung lượng tệp CV tải lên tối đa (MB)</label>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={maxUploadSize}
                    onChange={(e) => setMaxUploadSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Khuyên dùng dưới 15MB để tối ưu dung lượng ổ đĩa server.</span>
                </div>
              </div>

              {/* Parameter: Job Post Days Expiration - Sử dụng Shadcn Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Số ngày hiển thị tin tuyển dụng mặc định</label>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    min={5}
                    max={90}
                    value={jobExpiryDays}
                    onChange={(e) => setJobExpiryDays(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Hết thời gian này tin đăng của HR sẽ chuyển tự động sang trạng thái hết hạn.</span>
                </div>
              </div>

              {/* Parameter: Default ATS Matching Percent - Sử dụng Shadcn Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ngưỡng chấm khớp điểm ATS tối thiểu (%)</label>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    min={30}
                    max={95}
                    value={atsThreshold}
                    onChange={(e) => setAtsThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Quyết định mức khớp tối thiểu để gợi ý việc làm phù hợp cho ứng viên.</span>
                </div>
              </div>

              {/* Parameter: System Sender Email - Sử dụng Shadcn Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email hệ thống gửi thông báo</label>
                <div className="sm:col-span-2">
                  <Input
                    type="email"
                    required
                    value={systemEmail}
                    onChange={(e) => setSystemEmail(e.target.value)}
                    className="w-full"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Dùng để gửi thông báo duyệt tin, khóa tài khoản tự động.</span>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-100 pt-6 flex justify-end">
              {/* Button Save dùng Shadcn UI */}
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="flex items-center gap-2 h-10 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs cursor-pointer shadow-sm disabled:bg-slate-450"
              >
                {isSavingSettings ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu các thay đổi
                  </>
                )}
              </Button>
            </div>

          </form>
        )}

        {/* TAB 3: HARDWARE / SERVICE PERFORMANCE HEALTH TELEMETRY */}
        {activeTab === 'monitoring' && (
          <div className="p-8 space-y-8 animate-fade-in text-left">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">GIÁM SÁT HIỆU NĂNG MÁY CHỦ THỜI GIAN THỰC</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Thông số dao động ngẫu nhiên mô phỏng dựa trên tải thực tế của CPU, RAM và kết nối Database local.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 border border-slate-150 px-2.5 py-1.5 rounded-sm">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>REAL-TIME POLLING FEED</span>
              </div>
            </div>

            {/* SỬ DỤNG SHADCN CARD CHO TELEMETRY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Metric Card 1: CPU */}
              <Card className="p-5 flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription className="text-[10px] uppercase tracking-wider">BỘ VI XỬ LÝ (CPU)</CardDescription>
                    <Cpu className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-3xl text-slate-900 font-black">{cpuUsage}%</CardTitle>
                </div>
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-slate-200 rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000 rounded-sm"
                      style={{ width: `${cpuUsage}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold mt-1.5 block">Tình trạng: {cpuUsage > 80 ? 'Quá tải (Overload)' : 'Bình thường'}</span>
                </div>
              </Card>

              {/* Metric Card 2: Memory */}
              <Card className="p-5 flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription className="text-[10px] uppercase tracking-wider">BỘ NHỚ RAM</CardDescription>
                    <Server className="w-5 h-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-3xl text-slate-900 font-black">{ramUsage}%</CardTitle>
                </div>
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-slate-200 rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 rounded-sm"
                      style={{ width: `${ramUsage}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold mt-1.5 block">Đã dùng: {(16 * ramUsage / 100).toFixed(1)} GB / 16.0 GB</span>
                </div>
              </Card>

              {/* Metric Card 3: Network Latency */}
              <Card className="p-5 flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription className="text-[10px] uppercase tracking-wider">ĐỘ TRỄ KẾT NỐI API</CardDescription>
                    <Database className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-3xl text-slate-900 font-black">{networkLatency} ms</CardTitle>
                </div>
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-slate-200 rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-1000 rounded-sm"
                      style={{ width: `${(networkLatency / 40) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold mt-1.5 block">Trạng thái: Kết nối cực nhanh (Excellent)</span>
                </div>
              </Card>

              {/* Metric Card 4: Hard disk drive */}
              <Card className="p-5 flex flex-col justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <CardDescription className="text-[10px] uppercase tracking-wider">Ổ ĐĨA CÒN TRỐNG (SSD)</CardDescription>
                    <Server className="w-5 h-5 text-rose-600" />
                  </div>
                  <CardTitle className="text-3xl text-slate-900 font-black">{diskFreeGb} GB</CardTitle>
                </div>
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-slate-200 rounded-sm overflow-hidden">
                    <div className="w-[49%] h-full bg-rose-500 rounded-sm"></div>
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold mt-1.5 block">Tổng dung lượng: 500 GB (Đã dùng 51%)</span>
                </div>
              </Card>

            </div>

            {/* Tech details block block */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-sm flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Thông tin máy chủ cục bộ và kết nối Database</h4>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed mt-1.5">
                  Cổng tuyển dụng hiện đang chạy thử dưới môi trường Phát triển máy chủ (Development Server - Node.js v20.x, Vite HMR).
                  Đường dẫn kết nối SQL Server local từ file backend đang thông suốt.
                  Trình tự sao lưu tự động (Automatic Backup) được kích hoạt hàng tuần vào lúc 03:00 Chủ Nhật.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
