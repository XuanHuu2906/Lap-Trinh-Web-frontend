import { useState } from 'react';

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    location: 'Ho Chi Minh City, VN (Hybrid)',
    posted: '12/10/2023',
    deadline: '12/11/2023',
    deadlineOver: false,
    applicants: 45,
    applicantColor: 'bg-blue-500',
    status: 'ĐANG MỞ',
    statusStyle: 'bg-green-100 text-green-700',
  },
  {
    title: 'Product Manager',
    location: 'Hanoi, VN (On-site)',
    posted: '05/10/2023',
    deadline: '05/11/2023',
    deadlineOver: true,
    applicants: 12,
    applicantColor: 'bg-blue-400',
    status: 'ĐÃ ĐÓNG',
    statusStyle: 'bg-red-100 text-red-600',
  },
  {
    title: 'UX/UI Designer',
    location: 'Remote',
    posted: '28/09/2023',
    deadline: '28/10/2023',
    deadlineOver: false,
    applicants: 89,
    applicantColor: 'bg-blue-500',
    status: 'TẠM DỪNG',
    statusStyle: 'bg-yellow-100 text-yellow-700',
  },
];

export function ManageJobsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Quản lý tin đăng</h1>
          <p className="text-[14px] text-slate-500 mt-1">Xem và quản lý tất cả các tin tuyển dụng đã đăng.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 p-5 mb-6">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Bộ lọc tìm kiếm</p>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tìm kiếm tin</label>
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nhập tiêu đề công việc..."
                className="w-full h-10 pl-9 pr-4 border border-slate-200 text-[13px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700"
              />
            </div>
          </div>

          <div className="min-w-[200px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full h-10 pl-4 pr-8 border border-slate-200 text-[13px] outline-none text-slate-600 bg-white appearance-none cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ĐANG MỞ">Đang mở</option>
                <option value="ĐÃ ĐÓNG">Đã đóng</option>
                <option value="TẠM DỪNG">Tạm dừng</option>
              </select>
              <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="h-10 px-4 border border-slate-200 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              XÓA LỌC
            </button>
            <button className="h-10 px-4 bg-[#0f1f3d] text-white text-[12px] font-bold tracking-wide hover:bg-[#1a2f52] transition-colors">
              ÁP DỤNG
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Tiêu đề công việc', 'Ngày đăng', 'Hạn nộp', 'Số lượng ứng tuyển', 'Trạng thái', 'Hành động'].map(h => (
                <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((job, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5">
                  <p className="text-[14px] font-bold text-slate-900">{job.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="text-[12px] text-slate-400">{job.location}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-[13px] text-slate-500">{job.posted}</td>
                <td className="px-6 py-5">
                  <span className={`text-[13px] font-medium ${job.deadlineOver ? 'text-red-500' : 'text-slate-500'}`}>
                    {job.deadline}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div className={`w-9 h-9 rounded-full ${job.applicantColor} flex items-center justify-center`}>
                      <span className="text-white text-[12px] font-bold">{job.applicants}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-sm tracking-wide ${job.statusStyle}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {/* Chỉnh sửa */}
                    <div className="relative group">
                      <button className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm z-50">
                        Chỉnh sửa tin đăng
                      </div>
                    </div>

                    {/* Tạm dừng */}
                    <div className="relative group">
                      <button className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-slate-500 hover:text-yellow-600 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-yellow-600 text-white text-[10px] font-bold rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm z-50">
                        Tạm dừng tin tuyển dụng
                      </div>
                    </div>

                    {/* Xóa */}
                    <div className="relative group">
                      <button className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-red-50 hover:border-red-300 transition-colors text-slate-500 hover:text-red-500 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm z-50">
                        Xóa tin tuyển dụng
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-[13px] text-slate-400">Hiển thị 1 - 3 của 24 kết quả</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors rounded-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 text-[13px] rounded-sm transition-colors ${p === 1 ? 'bg-[#0f1f3d] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
            ))}
            <span className="px-1 text-slate-400 text-[13px]">...</span>
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors rounded-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}