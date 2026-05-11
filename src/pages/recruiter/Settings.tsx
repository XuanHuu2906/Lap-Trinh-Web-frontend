import { useState, useRef } from "react";

const settingsTabs = [
  "Hồ sơ công ty",
  "Thông tin liên hệ",
  "Đổi mật khẩu",
  "Cấu hình thông báo",
];

const MAX_DESC = 1000;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Hồ sơ công ty");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("TechNova Solutions");
  const [industry, setIndustry] = useState("Công nghệ thông tin / Phần mềm");
  const [companySize, setCompanySize] = useState("201-500 nhân viên");
  const [website, setWebsite] = useState("www.technovasolutions.com");
  const [description, setDescription] = useState(
    "TechNova Solutions là nhà cung cấp hàng đầu các giải pháp chuyển đổi số cho doanh nghiệp vừa và nhỏ. Chúng tôi tập trung vào việc xây dựng các nền tảng SaaS có tính bảo mật cao và dễ dàng mở rộng.",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1
          className="text-[26px] font-bold leading-tight"
          style={{ color: "#0f172a" }}
        >
          Hồ sơ & Cài đặt
        </h1>
        <p className="text-[14px] text-slate-500 mt-1">
          Quản lý thông tin doanh nghiệp và tùy chỉnh cấu hình tài khoản.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left settings menu */}
        <div className="w-50 shrink-0 bg-white border border-slate-200">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-5 py-3 text-[13px] border-b border-slate-100 last:border-b-0 transition-colors ${
                activeTab === tab
                  ? "text-slate-900 font-semibold bg-slate-50 border-l-2 border-l-[#0f1f3d]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right form panel */}
        <div className="flex-1 bg-white border border-slate-200">
          {activeTab === "Hồ sơ công ty" && (
            <div>
              <div className="px-8 pt-7 pb-5 border-b border-slate-100">
                <h2 className="text-[16px] font-bold text-slate-900">
                  Hồ sơ công ty
                </h2>
                <p className="text-[13px] text-slate-500 mt-1">
                  Thông tin này sẽ được hiển thị công khai trên các tin tuyển
                  dụng của bạn.
                </p>
                bg-linear-to-br
              </div>

              <div className="px-8 py-7 space-y-6">
                {/* Logo upload */}
                <div className="flex items-start gap-5 p-4 border border-slate-200 bg-slate-50">
                  shrink-0
                  <div className="w-16 h-16 bg-blue-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold text-center leading-tight px-1">
                          COMPA
                          <br />
                          NY
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Logo doanh nghiệp
                    </label>
                    <p className="text-[12px] text-slate-400 mb-3">
                      Định dạng JPG, PNG. Kích thước tối đa 2MB. Tỉ lệ 1:1.
                    </p>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="h-8 px-4 border border-slate-300 text-[12px] font-semibold text-slate-600 hover:bg-white transition-colors"
                    >
                      Thay đổi Logo
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogo}
                    />
                  </div>
                </div>

                {/* Tên công ty */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Tên công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-700 transition-all"
                  />
                </div>

                {/* Lĩnh vực + Quy mô */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Lĩnh vực hoạt động
                    </label>
                    <div className="relative">
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full h-11 border border-slate-200 pl-4 pr-8 text-[13px] outline-none text-slate-600 bg-white appearance-none cursor-pointer"
                      >
                        <option>Công nghệ thông tin / Phần mềm</option>
                        <option>Tài chính / Ngân hàng</option>
                        <option>Bán lẻ / Thương mại điện tử</option>
                        <option>Sản xuất / Công nghiệp</option>
                        <option>Y tế / Dược phẩm</option>
                        <option>Giáo dục / Đào tạo</option>
                      </select>
                      <svg
                        className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Quy mô nhân sự
                    </label>
                    <div className="relative">
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full h-11 border border-slate-200 pl-4 pr-8 text-[13px] outline-none text-slate-600 bg-white appearance-none cursor-pointer"
                      >
                        <option>1-10 nhân viên</option>
                        <option>11-50 nhân viên</option>
                        <option>51-200 nhân viên</option>
                        <option>201-500 nhân viên</option>
                        <option>501-1000 nhân viên</option>
                        <option>Trên 1000 nhân viên</option>
                      </select>
                      <svg
                        className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Website công ty
                  </label>
                  <div className="flex">
                    <span className="h-11 px-4 border border-r-0 border-slate-200 bg-slate-50 text-[13px] text-slate-500 flex items-center shrink-0">
                      https://
                    </span>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="flex-1 h-11 border border-slate-200 px-4 text-[13px] outline-none focus:border-slate-400 text-slate-700 transition-all"
                    />
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Mô tả doanh nghiệp
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) =>
                      e.target.value.length <= MAX_DESC &&
                      setDescription(e.target.value)
                    }
                    rows={5}
                    className="w-full border border-slate-200 px-4 py-3 text-[13px] outline-none focus:border-slate-400 text-slate-700 resize-y transition-all"
                  />
                  <p className="text-right text-[12px] text-slate-400 mt-1">
                    {description.length} / {MAX_DESC} ký tự
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setCompanyName("TechNova Solutions");
                    setIndustry("Công nghệ thông tin / Phần mềm");
                    setCompanySize("201-500 nhân viên");
                    setWebsite("www.technovasolutions.com");
                    setDescription(
                      "TechNova Solutions là nhà cung cấp hàng đầu các giải pháp chuyển đổi số cho doanh nghiệp vừa và nhỏ. Chúng tôi tập trung vào việc xây dựng các nền tảng SaaS có tính bảo mật cao và dễ dàng mở rộng.",
                    );
                    setLogoPreview(null);
                  }}
                  className="h-10 px-6 border border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button className="h-10 px-6 bg-[#0f1f3d] text-white text-[13px] font-bold hover:bg-[#1a2f52] transition-colors">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {activeTab !== "Hồ sơ công ty" && (
            <div className="px-8 py-16 text-center">
              <svg
                className="w-12 h-12 text-slate-200 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-[14px] text-slate-400">
                Nội dung{" "}
                <span className="font-semibold text-slate-600">
                  {activeTab}
                </span>{" "}
                đang được phát triển.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
