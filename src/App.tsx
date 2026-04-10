// === FILE: src/App.tsx (PHIÊN BẢN TỐT NHẤT HIỆN TẠI) ===
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/layout/PublicLayout";

const LandingPage = () => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <div className="text-center px-6">
      <h1 className="text-5xl font-bold text-slate-800 mb-4">TalentFlow</h1>
      <p className="text-xl text-slate-600 mb-8">
        Hệ thống quản lý tuyển dụng thông minh
      </p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
