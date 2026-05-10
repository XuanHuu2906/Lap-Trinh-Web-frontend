import { useState } from 'react';

export function PostJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: '#0f172a' }}>Đăng tin tuyển dụng</h1>
        <p className="text-[14px] text-slate-500 mt-1">Tạo một vị trí công việc mới trên hệ thống HireArch Enterprise.</p>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
        {/* Left: Form */}
        <div className="space-y-5">

          {/* Thông tin cơ bản */}
          <div className="bg-white border border-slate-200 p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Thông tin cơ bản
            </h2>

            {/* Tiêu đề */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Tiêu đề công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Vd: Senior Product Designer"
                className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 transition-all"
              />
            </div>

            {/* Loại hình + Kinh nghiệm */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Loại hình công việc <span className="text-red-500">*</span>
                </label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-500 bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Chọn loại hình...</option>
                  <option>Toàn thời gian</option>
                  <option>Bán thời gian</option>
                  <option>Thực tập</option>
                  <option>Freelance</option>
                  <option>Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Kinh nghiệm yêu cầu <span className="text-red-500">*</span>
                </label>
                <select
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 text-slate-500 bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Chọn mức kinh nghiệm...</option>
                  <option>Không yêu cầu</option>
                  <option>Dưới 1 năm</option>
                  <option>1 - 2 năm</option>
                  <option>2 - 5 năm</option>
                  <option>Trên 5 năm</option>
                </select>
              </div>
            </div>

            {/* Địa điểm + Phòng ban */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Địa điểm làm việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Vd: Hà Nội, TP.HCM hoặc Remote"
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Phòng ban
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Vd: Product, Engineering, HR"
                  className="w-full h-11 border border-slate-200 px-4 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Chi tiết công việc */}
          <div className="bg-white border border-slate-200 p-6">
            <h2 className="text-[14px] font-bold text-slate-800 mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Chi tiết công việc
            </h2>

            {/* Mô tả */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              {/* Mini toolbar */}
              <div className="flex items-center gap-1 border border-slate-200 border-b-0 px-3 py-2 bg-slate-50">
                <button
                  onClick={() => setBold(!bold)}
                  className={`w-7 h-7 flex items-center justify-center text-[13px] font-bold rounded hover:bg-slate-200 transition-colors ${bold ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
                >B</button>
                <button
                  onClick={() => setItalic(!italic)}
                  className={`w-7 h-7 flex items-center justify-center text-[13px] italic rounded hover:bg-slate-200 transition-colors ${italic ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
                >I</button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 transition-colors text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết các trách nhiệm và công việc hàng ngày..."
                rows={6}
                className={`w-full border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 resize-y transition-all ${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}`}
              />
            </div>

            {/* Yêu cầu ứng viên */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Yêu cầu ứng viên <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="Các kỹ năng, chứng chỉ và kinh nghiệm cần thiết..."
                rows={5}
                className="w-full border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 resize-y transition-all"
              />
            </div>

            {/* Quyền lợi */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Quyền lợi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={benefits}
                onChange={e => setBenefits(e.target.value)}
                placeholder="Lương thưởng, bảo hiểm, phúc lợi khác..."
                rows={4}
                className="w-full border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700 resize-y transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <button className="h-11 px-6 border border-slate-300 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Lưu nháp
            </button>
            <button className="h-11 px-6 bg-[#0f1f3d] text-white text-[13px] font-bold tracking-[1px] hover:bg-[#1a2f52] transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              ĐĂNG TIN NGAY
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4 sticky top-8">
          {/* Hướng dẫn */}
          <div className="bg-white border border-slate-200 p-5">
            <h3 className="text-[13px] font-bold text-slate-800 mb-4">Hướng dẫn đăng tin</h3>
            <div className="space-y-4">
              {[
                { color: 'bg-blue-500', title: 'Tiêu đề rõ ràng', desc: 'Sử dụng chức danh công việc tiêu chuẩn ngành để ứng viên dễ tìm thấy (vd: Frontend Engineer thay vì Code Ninja).' },
                { color: 'bg-amber-500', title: 'Mô tả chi tiết', desc: 'Nêu bật những thách thức, dự án và công cụ mà ứng viên sẽ làm việc hàng ngày.' },
                { color: 'bg-emerald-500', title: 'Minh bạch mức lương', desc: 'Các tin tuyển dụng công khai khoảng lương thu hút lượng ứng viên chất lượng cao hơn 30%.' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full ${tip.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-700">{tip.title}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="bg-white border border-slate-200 p-5">
            <h3 className="text-[13px] font-bold text-slate-800 mb-3">Trạng thái tin tuyển dụng</h3>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-500">Hiện tại:</span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 tracking-wide uppercase">
                Bản nháp (Draft)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}