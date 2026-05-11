// Sparkline SVG thuần — không dùng recharts
function Sparkline() {
  const data = [80, 95, 88, 102, 110, 108, 142];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const w = 64, h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}


const applicants = [
  { initials: 'NV', color: '#6366f1', name: 'Nguyễn Văn A', position: 'Senior Frontend Developer', status: 'Chưa xem', statusColor: 'bg-red-100 text-red-600', time: '2 giờ trước' },
  { initials: 'TT', color: '#f59e0b', name: 'Trần Thị B', position: 'Marketing Manager', status: 'Đang đánh giá', statusColor: 'bg-yellow-100 text-yellow-700', time: 'Hôm qua' },
  { initials: 'LM', color: '#10b981', name: 'Lê Minh C', position: 'Data Analyst', status: 'Đã lên lịch PV', statusColor: 'bg-green-100 text-green-700', time: 'Hôm qua' },
  { initials: 'PH', color: '#8b5cf6', name: 'Pham Hoàng D', position: 'UX/UI Designer', status: 'Chưa xem', statusColor: 'bg-red-100 text-red-600', time: '2 ngày trước' },
];

const urgentTasks = [
  { text: 'Phê duyệt yêu cầu tuyển dụng từ bộ phận IT.', deadline: 'Hạn: Hôm nay' },
  { text: 'Đánh giá 15 ứng viên vòng CV cho vị trí Sales.', deadline: 'Hạn: Ngày mai' },
  { text: 'Gia hạn tin tuyển dụng "Marketing Executive".', deadline: 'Hạn: Thứ Sáu' },
];

export function RecruiterOverviewPage() {
  return (
    <div className="flex-1 p-8">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Tổng quan tuyển dụng</h1>
          <p className="text-[14px] text-slate-500 mt-1">Theo dõi hiệu suất chiến dịch và quản lý ứng viên mới trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-5 border border-slate-300 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            XUẤT BÁO CÁO
          </button>
          <button className="h-10 px-5 bg-[#0f1f3d] text-white text-[13px] font-semibold hover:bg-[#1a2f52] transition-colors flex items-center gap-2">
            <span>+</span> ĐĂNG TIN MỚI
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Tổng số tin */}
        <div className="bg-white border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tổng số tin</p>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-[36px] font-black text-slate-900 leading-none">142</span>
            <div className="flex flex-col items-start mb-1">
              <div className="h-8 w-16">
                <Sparkline />
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">↑ +12%</span>
            </div>
          </div>
        </div>

        {/* Tin đang mở */}
        <div className="bg-white border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tin đang mở</p>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-[36px] font-black text-slate-900 leading-none">38</span>
        </div>

        {/* Ứng viên mới */}
        <div className="bg-white border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ứng viên mới</p>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[36px] font-black text-slate-900 leading-none">847</span>
            <span className="text-[11px] text-emerald-600 font-semibold mb-1">+54 tuần này</span>
          </div>
        </div>

        {/* Phản hồi đã gửi */}
        <div className="bg-white border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phản hồi đã gửi</p>
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[36px] font-black text-slate-900 leading-none">1,204</span>
            <span className="text-[11px] text-slate-400 font-semibold mb-1">Tỷ lệ 85%</span>
          </div>
        </div>
      </div>

      {/* Bottom section: table + right panel */}
      <div className="grid grid-cols-[1fr_280px] gap-6">

        {/* Applicants table */}
        <div className="bg-white border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-bold text-slate-800">Danh sách ứng viên mới</h2>
            <button className="text-[13px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
              XEM TẤT CẢ →
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Họ tên', 'Vị trí ứng tuyển', 'Trạng thái', 'Ngày nộp', 'Thao tác'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.map((a, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.color }}>
                        <span className="text-white text-[11px] font-bold">{a.initials}</span>
                      </div>
                      <span className="text-[13px] font-semibold text-slate-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600">{a.position}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-sm ${a.statusColor}`}>{a.status}</span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-400">{a.time}</td>
                  <td className="px-6 py-4">
                    <button className="text-[12px] text-slate-500 border border-slate-200 px-3 py-1 hover:bg-slate-100 transition-colors">Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Campaign card */}
          <div className="bg-[#0f1f3d] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <svg viewBox="0 0 80 80" fill="white">
                <circle cx="60" cy="20" r="40" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold leading-snug mb-3">Chiến dịch tuyển dụng</h3>
            <p className="text-[13px] text-white/60 leading-relaxed mb-5">
              Khởi tạo chiến dịch mới để thu hút nhân tài cho các vị trí đang cần gấp.
            </p>
            <button className="w-full h-10 bg-white text-[#0f1f3d] text-[12px] font-bold tracking-widest hover:bg-slate-100 transition-colors">
              BẮT ĐẦU NGAY
            </button>
          </div>

          {/* Urgent tasks */}
          <div className="bg-white border border-slate-200 p-5 flex-1">
            <h3 className="text-[14px] font-bold text-slate-800 mb-4">Cần xử lý gấp</h3>
            <div className="space-y-4">
              {urgentTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="text-[13px] text-slate-700 leading-snug">{task.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}