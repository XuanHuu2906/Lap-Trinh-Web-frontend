import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="h-16 bg-slate-100 border-t border-gray-200 w-full flex items-center">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
        <div className="text-gray-500">
          © 2026 TalentFlow. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-gray-500">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Chính sách bảo mật
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Điều khoản sử dụng
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
