import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { CVTemplatePage } from './pages/candidate/CVTemplatePage';

// Placeholder/Mock Pages to simulate full Use Case flows
const MockLoginPage: React.FC = () => {
  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    // Read redirect query or fallback
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect') || '/';
    window.location.href = redirectUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm w-full">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans">Sign In</h2>
        <p className="text-slate-500 text-sm mb-6 font-sans">
          This is a simulated sign-in page to satisfy the **UC-05 (Tạo CV)** login precondition.
        </p>
        <button 
          onClick={handleLogin}
          className="w-full py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-[4px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
        >
          Simulate Sign In & Continue
        </button>
      </div>
    </div>
  );
};

const MockRegisterPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
    <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm w-full">
      <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans">Register</h2>
      <p className="text-slate-500 text-sm mb-6 font-sans">This is a simulated register page.</p>
      <button 
        onClick={() => window.history.back()}
        className="w-full py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-[4px] hover:bg-slate-50 transition-all cursor-pointer"
      >
        Go Back
      </button>
    </div>
  </div>
);

const MockCVBuilderPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const templateName = params.get('template') || 'Selected Template';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm w-full">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-4">
          UC-05: Tạo CV - Bước 4
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-sans">Trình thiết kế CV</h2>
        <p className="text-slate-500 text-sm mb-6 font-sans">
          Đã tải mẫu CV: <strong className="text-slate-800">{templateName}</strong>. Hãy bắt đầu nhập thông tin cá nhân, học vấn, kỹ năng để tạo CV của bạn.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => {
              alert('Lưu CV thành công!');
              window.location.href = '/';
            }}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-[4px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            Lưu CV vào hệ thống (Hoàn thành UC-05)
          </button>
          <button 
            onClick={() => window.history.back()}
            className="w-full py-2.5 border border-transparent text-slate-500 font-semibold text-sm rounded-[4px] hover:text-slate-700 transition-all cursor-pointer"
          >
            Quay lại chọn mẫu khác
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          {/* Mặc định hiển thị Trang chọn mẫu CV */}
          <Route index element={<CVTemplatePage />} />
          <Route path="resources" element={<Navigate to="/" replace />} />
          <Route path="resources/cv-templates" element={<Navigate to="/" replace />} />
          <Route path="login" element={<MockLoginPage />} />
          <Route path="register" element={<MockRegisterPage />} />
          <Route path="candidate/cv-builder" element={<MockCVBuilderPage />} />
          {/* Điều hướng mặc định */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
