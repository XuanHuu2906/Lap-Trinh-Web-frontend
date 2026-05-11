import React, { useState } from 'react';
import {
  Users,
  Search,
  Lock,
  Unlock
} from 'lucide-react';
import { type User, type UserRole, type UserStatus } from '../../types/user.type';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

// Mock danh sách người dùng ban đầu
const INITIAL_USERS_MOCK: User[] = [
  { id: 1, email: 'admin@hirearch.com', role: 'admin', status: 'active', createdAt: '2026-04-01T08:00:00Z', updatedAt: '2026-04-01T08:00:00Z' },
  { id: 2, email: 'lehoangnam_coder@gmail.com', role: 'candidate', status: 'active', createdAt: '2026-05-10T08:12:00Z', updatedAt: '2026-05-10T08:12:00Z' },
  { id: 3, email: 'hr.fptsoftware@fpt.com', role: 'recruiter', status: 'active', createdAt: '2026-05-09T10:20:00Z', updatedAt: '2026-05-09T10:20:00Z' },
  { id: 4, email: 'spam_account_99@yahoo.com', role: 'candidate', status: 'banned', createdAt: '2026-05-01T15:30:00Z', updatedAt: '2026-05-05T11:00:00Z' },
  { id: 5, email: 'recruiter.shopee@shopee.vn', role: 'recruiter', status: 'active', createdAt: '2026-05-07T09:00:00Z', updatedAt: '2026-05-07T09:00:00Z' },
  { id: 6, email: 'nguyenvan_a_manager@gmail.com', role: 'candidate', status: 'inactive', createdAt: '2026-05-02T11:45:00Z', updatedAt: '2026-05-02T11:45:00Z' }
];

export const AdminSystem: React.FC = () => {
  // State quản lý danh sách Users
  const [users, setUsers] = useState<User[]>(INITIAL_USERS_MOCK);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('Tất cả');

  // Xử lý Khóa/Mở khóa tài khoản (Ban/Unban)
  const handleToggleUserStatus = (userId: number, currentStatus: UserStatus, email: string) => {
    const isBan = currentStatus !== 'banned';
    const actionText = isBan ? 'Khóa vĩnh viễn' : 'Mở khóa hoạt động';

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản người dùng "${email}"?`)) {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: isBan ? 'banned' as const : 'active' as const };
        }
        return u;
      }));
      alert(`Đã ${isBan ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} "${email}" thành công.`);
    }
  };

  // Thay đổi quyền hạn (Role) người dùng thử nghiệm
  const handleChangeUserRole = (userId: number, newRole: UserRole, email: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    }));
    alert(`Đã thay đổi vai trò tài khoản "${email}" thành "${newRole}" thành công.`);
  };

  // Lọc danh sách người dùng theo tên/email và theo vai trò
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'Tất cả' || u.role === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800">

      {/* 1. TOP TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">QUẢN LÝ TÀI KHOẢN</h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5 ml-7">
            Phân quyền người dùng, quản trị vai trò thành viên và hỗ trợ khóa/mở khóa tài khoản (UC-18).
          </p>
        </div>
      </div>

      {/* 2. MAIN USER MANAGEMENT LIST */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-6 space-y-6">

          {/* User filters row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">

            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 z-10">
                <Search className="w-4 h-4" />
              </span>
              <Input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Tìm tài khoản người dùng..."
                className="w-full h-9 pl-10 pr-3"
              />
            </div>

            <div className="flex items-center gap-2 border border-slate-200 px-2.5 h-9 bg-white rounded-sm w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phân quyền:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs font-bold text-slate-600 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Admin">Admin</option>
                <option value="Candidate">Candidate</option>
                <option value="Recruiter">Recruiter</option>
              </select>
            </div>

          </div>

          {/* User Database Table Grid */}
          <div className="overflow-x-auto border border-slate-150 rounded-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">ĐỊA CHỈ EMAIL TÀI KHOẢN</th>
                  <th className="px-5 py-3">VAI TRÒ</th>
                  <th className="px-5 py-3">TRẠNG THÁI THÀNH VIÊN</th>
                  <th className="px-5 py-3">NGÀY ĐĂNG KÝ</th>
                  <th className="px-5 py-3 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-400">#{user.id}</td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900">{user.email}</td>
                      <td className="px-5 py-3.5 uppercase">
                        <select
                          value={user.role}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange={(e) => handleChangeUserRole(user.id, e.target.value as any, user.email)}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 px-2 py-1 rounded-sm outline-none cursor-pointer"
                          disabled={user.role === 'admin'} // Không đổi quyền của chính super admin
                        >
                          <option value="admin">Admin</option>
                          <option value="candidate">Candidate</option>
                          <option value="recruiter">Recruiter</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'success'
                              : user.status === 'banned'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {user.status === 'active' ? 'Hoạt động' : user.status === 'banned' ? 'Đã khóa' : 'Chưa kích hoạt'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-450 font-semibold">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {user.role !== 'admin' ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleUserStatus(user.id, user.status, user.email)}
                            className={`h-8 w-8 border cursor-pointer ${user.status === 'banned'
                              ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                              : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'
                              }`}
                            title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {user.status === 'banned' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Hệ thống</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      Không có người dùng nào trùng khớp với từ khóa tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
