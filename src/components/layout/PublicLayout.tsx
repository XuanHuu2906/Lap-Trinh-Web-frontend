import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-200">
      <header className="h-16 bg-[#6FAFC9] border-b border-gray-200 sticky top-0 z-500 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
            HR
          </div>
          <span className="font-bold text-gray-800 text-xl">TalentFlow</span>
        </div>
        <button
          className=" items-center cursor-pointer px-5 py-2 text-blue-600 
        font-semibold border border-blue-600 rounded-md hover:bg-blue-200 transition 0.3s"
        >
          Đăng nhập
        </button>
      </header>
      <Header />
      <main className="flex-1 w-full py-8 px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;
