import { useState } from 'react';

const candidates = [
  { initials: 'NT', color: '#6366f1', name: 'Nguyễn Văn Thái', email: 'thai.nguyen@email.com', position: 'Senior Frontend Engineer', date: '24/10/2023', status: 'Mới', statusStyle: 'border border-blue-400 text-blue-600 bg-white' },
  { initials: 'TM', color: '#f43f5e', avatar: true, name: 'Trần Thị Mai', email: 'mai.tran@email.com', position: 'Product Manager', date: '23/10/2023', status: 'Đang phỏng vấn', statusStyle: 'border border-orange-400 text-orange-600 bg-white' },
  { initials: 'LH', color: '#3b82f6', name: 'Lê Hoàng Hải', email: 'hai.le@email.com', position: 'Senior Frontend Engineer', date: '20/10/2023', status: 'Đạt', statusStyle: 'border border-emerald-400 text-emerald-600 bg-white' },
  { initials: 'PA', color: '#ec4899', name: 'Phạm Phương Anh', email: 'anh.pham@email.com', position: 'HR Specialist', date: '18/10/2023', status: 'Không phù hợp', statusStyle: 'border border-red-400 text-red-600 bg-white' },
];

export function ManageCandidatesPage() {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [allChecked, setAllChecked] = useState(false);

  const toggleAll = () => {
    if (allChecked) { setSelected([]); setAllChecked(false); }
    else { setSelected(candidates.map((_, i) => i)); setAllChecked(true); }
  };
  const toggleRow = (i: number) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div className="p-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Quản lý ứng viên</h1>
          <p className="text-[14px] text-slate-500 mt-1">Theo dõi và quản lý toàn bộ hồ sơ ứng tuyển trong hệ thống.</p>
        </div>
        <button className="h-10 px-5 bg-[#0f1f3d] text-white text-[13px] font-bold tracking-wide hover:bg-[#1a2f52] transition-colors flex items-center gap-2">
          <span>+</span> THÊM ỨNG VIÊN
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-0 bg-white border border-slate-200 border-b-0 px-5 py-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, email, SĐT..."
            className="w-full h-9 pl-9 pr-4 border border-slate-200 text-[13px] outline-none focus:border-slate-400 placeholder:text-slate-300 text-slate-700"
          />
        </div>
        <select
          value={positionFilter}
          onChange={e => setPositionFilter(e.target.value)}
          className="h-9 px-3 border border-slate-200 text-[13px] outline-none text-slate-500 bg-white appearance-none cursor-pointer min-w-[150px]"
        >
          <option value="">Tất cả vị trí</option>
          <option>Senior Frontend Engineer</option>
          <option>Product Manager</option>
          <option>HR Specialist</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 border border-slate-200 text-[13px] outline-none text-slate-500 bg-white appearance-none cursor-pointer min-w-[150px]"
        >
          <option value="">Tất cả trạng thái</option>
          <option>Mới</option>
          <option>Đang phỏng vấn</option>
          <option>Đạt</option>
          <option>Không phù hợp</option>
        </select>
        <div className="ml-auto">
          <button className="h-9 px-4 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Lọc nâng cao
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 border-t-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="w-10 px-5 py-3">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-slate-800 cursor-pointer" />
              </th>
              {['Ứng viên', 'Vị trí ứng tuyển', 'Ngày ứng tuyển', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr key={i} className={`border-b border-slate-50 transition-colors ${selected.includes(i) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                <td className="w-10 px-5 py-4">
                  <input type="checkbox" checked={selected.includes(i)} onChange={() => toggleRow(i)} className="accent-slate-800 cursor-pointer" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.color }}>
                      <span className="text-white text-[11px] font-bold">{c.initials}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">{c.name}</p>
                      <p className="text-[12px] text-slate-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px] text-slate-600">{c.position}</td>
                <td className="px-4 py-4 text-[13px] text-slate-500">{c.date}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm ${c.statusStyle}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.statusStyle.includes('blue') ? '#3b82f6' : c.statusStyle.includes('orange') ? '#f97316' : c.statusStyle.includes('emerald') ? '#10b981' : '#ef4444' }} />
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-[12px] text-slate-500 border border-slate-200 px-3 py-1 hover:bg-slate-100 transition-colors">Xem</button>
                    <button className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-[13px] text-slate-400">Hiển thị 1 - 10 trong số 1,248 ứng viên</p>
          <div className="flex items-center gap-1">
            <button className="h-8 px-3 text-[13px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">Trước</button>
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-8 h-8 text-[13px] border transition-colors ${p === 1 ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{p}</button>
            ))}
            <span className="px-2 text-slate-400 text-[13px]">...</span>
            <button className="w-8 h-8 text-[13px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">125</button>
            <button className="h-8 px-3 text-[13px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}