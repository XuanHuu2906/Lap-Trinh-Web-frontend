import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ địa chỉ email và mật khẩu.');
      return;
    }

    setIsLoading(true);

    // Giả lập độ trễ kết nối mạng để tạo cảm giác chuyên nghiệp
    setTimeout(() => {
      setIsLoading(false);
      
      // Kiểm tra tài khoản admin demo
      if (email === 'admin@hirearch.com' && password === 'admin123') {
        localStorage.setItem('isAdminAuthenticated', 'true');
        
        // Điều hướng sau đăng nhập
        const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';
        navigate(redirectUrl);
      } else {
        setError('Địa chỉ email hoặc mật khẩu quản trị viên không hợp lệ. Vui lòng thử lại.');
      }
    }, 800);
  };

  // Đăng nhập nhanh dành cho nhà phát triển/giám khảo tuyển dụng
  const handleQuickLogin = () => {
    setEmail('admin@hirearch.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <section className="full-screen-page flex flex-col items-center justify-center min-h-screen bg-[#f1f5f9] font-sans p-6 text-left">
      
      {/* 1. BRAND LOGO */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-sm shadow-sm border border-slate-800">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="text-slate-900 text-3xl font-black tracking-widest uppercase">
            HireArch
          </span>
        </div>
        <p className="text-[10px] tracking-[4px] text-slate-400 font-bold uppercase">
          SYSTEM ADMINISTRATION PORTAL
          </p>
      </div>

      {/* 2. CARD FORM */}
      <div className="w-full max-w-[500px] bg-white border border-slate-200/90 shadow-md overflow-hidden rounded-sm">
        {/* Top thick indicator */}
        <div className="h-[4px] bg-slate-900 w-full"></div>

        <div className="px-10 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-1.5 leading-none">
              Đăng Nhập Quản Trị
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide">
              Hệ thống giám sát và vận hành cổng tuyển dụng
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3 mb-6 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-bold text-xs">Lỗi đăng nhập</p>
                <p className="text-red-600 text-xs mt-1 font-medium leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field: Email - Sử dụng Shadcn Input */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                TÀI KHOẢN ADMIN
              </label>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hirearch.com"
                  className="w-full h-12 pl-11 pr-4"
                />
              </div>
            </div>

            {/* Field: Password - Sử dụng Shadcn Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  MẬT KHẨU BẢO MẬT
                </label>
                <button 
                  type="button"
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors cursor-pointer"
                >
                  Yêu cầu cấp lại?
                </button>
              </div>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                  <Lock className="w-4 h-4" />
                </span>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Login Helper Box */}
            <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">Môi trường thử nghiệm</span>
                <span className="text-[11px] font-semibold text-slate-600 block mt-1">Tài khoản: admin@hirearch.com / admin123</span>
              </div>
              <Button
                type="button"
                onClick={handleQuickLogin}
                className="px-3 h-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] tracking-wider rounded-sm transition-all uppercase cursor-pointer"
              >
                Nhập nhanh
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 text-white font-bold text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-850 transition-all shadow-sm rounded-sm disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ĐANG XỬ LÝ...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  ĐĂNG NHẬP HỆ THỐNG
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info link */}
        <div className="bg-slate-50/50 border-t border-slate-150 px-8 py-4 text-center flex items-center justify-center">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')} 
            className="text-xs text-slate-500 hover:text-slate-850 font-bold transition-colors cursor-pointer h-9 px-4"
          >
            ← Quay về cổng tuyển dụng ngoài
          </Button>
        </div>
      </div>

      {/* 3. UNDER FOOTER */}
      <div className="mt-8 text-center text-[11px] text-slate-400">
        <p>© 2026 HireArch. Cổng quản trị bảo mật tối cao.</p>
      </div>

    </section>
  );
};
