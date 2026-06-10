/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { type User, type UserRole, type UserStatus } from '../../types/user.type';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { getUsers, updateUser, toggleUserStatus } from '../../services/admin.service';
import { useToast } from '../../components/common/toast';

const SkeletonRow: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4">
      <div className="h-4 bg-slate-200 rounded-xs w-8"></div>
    </td>
    <td className="px-5 py-4">
      <div className="h-4 bg-slate-200 rounded-xs w-48"></div>
    </td>
    <td className="px-5 py-4">
      <div className="h-7 bg-slate-200 rounded-xs w-20"></div>
    </td>
    <td className="px-5 py-4">
      <div className="h-6 bg-slate-200 rounded-xs w-16"></div>
    </td>
    <td className="px-5 py-4">
      <div className="h-4 bg-slate-200 rounded-xs w-24"></div>
    </td>
    <td className="px-5 py-4 text-center">
      <div className="h-8 bg-slate-200 rounded-xs w-8 mx-auto"></div>
    </td>
  </tr>
);

const getErrorMessage = (err: unknown): string => {
  if (typeof err === "object" && err !== null) {
    const response = "response" in err
      ? (err as { response?: { data?: { message?: string } } }).response
      : undefined;
    const message = "message" in err ? (err as { message?: unknown }).message : undefined;

    return response?.data?.message || (typeof message === "string" ? message : "");
  }

  return "";
};

export const AdminSystem: React.FC = () => {
  const { toast } = useToast();

  // State quản lý danh sách Users & phân trang từ Server
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States bộ lọc tìm kiếm
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("Tất cả");

  // Cơ chế Debounce ô tìm kiếm sau 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(userSearchTerm);
      // Reset về trang 1 khi từ khóa tìm kiếm thay đổi
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  // Hàm gọi API lấy danh sách người dùng
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roleParam =
        userRoleFilter === "Tất cả" ? undefined : userRoleFilter.toLowerCase();
      const searchParam = debouncedSearchTerm.trim() || undefined;

      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: searchParam,
        role: roleParam,
      });

      if (response.success) {
        setUsers(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
        });
      } else {
        throw new Error("Lấy danh sách tài khoản thất bại.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err) || 'Có lỗi xảy ra khi tải dữ liệu từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API mỗi khi thay đổi trang, bộ lọc hoặc giá trị tìm kiếm đã debounce
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, debouncedSearchTerm, userRoleFilter]);

  // Xử lý bộ lọc phân quyền (Reset về trang 1)
  const handleRoleFilterChange = (role: string) => {
    setUserRoleFilter(role);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Xử lý Khóa/Mở khóa tài khoản (Ban/Unban) qua PATCH API
  const handleToggleUserStatus = async (
    userId: number,
    currentStatus: UserStatus,
    email: string,
  ) => {
    const isBan = currentStatus !== "banned";
    const actionText = isBan ? "Khóa vĩnh viễn" : "Mở khóa hoạt động";
    const newStatus: UserStatus = isBan ? "banned" : "active";

    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${actionText} tài khoản người dùng "${email}"?`,
      )
    ) {
      try {
        const response = await toggleUserStatus(userId, newStatus);
        if (response.success) {
          setUsers(prev => prev.map(u => {
            if (u.id === userId) {
              return { ...u, status: newStatus };
            }
            return u;
          }));
          toast({
            title: isBan ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
            description: `Tài khoản "${email}" đã được cập nhật thành công.`,
            variant: 'success',
          });
        } else {
          toast({
            title: 'Thao tác thất bại',
            description: response.message || 'Lỗi không xác định',
            variant: 'error',
          });
        }
      } catch (err: unknown) {
        console.error(err);
        toast({
          title: 'Đã xảy ra lỗi',
          description: getErrorMessage(err) || 'Lỗi không xác định',
          variant: 'error',
        });
      }
    }
  };

  // Thay đổi quyền hạn (Role) người dùng qua PUT API
  const handleChangeUserRole = async (
    userId: number,
    newRole: UserRole,
    email: string,
  ) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn thay đổi vai trò tài khoản "${email}" thành "${newRole.toUpperCase()}"?`,
      )
    ) {
      try {
        const response = await updateUser(userId, { role: newRole });
        if (response.success) {
          setUsers(prev => prev.map(u => {
            if (u.id === userId) {
              return { ...u, role: newRole };
            }
            return u;
          }));
          toast({
            title: 'Đã thay đổi vai trò',
            description: `Tài khoản "${email}" đã được chuyển thành "${newRole}".`,
            variant: 'success',
          });
        } else {
          toast({
            title: 'Thao tác thất bại',
            description: response.message || 'Lỗi không xác định',
            variant: 'error',
          });
        }
      } catch (err: unknown) {
        console.error(err);
        toast({
          title: 'Đã xảy ra lỗi',
          description: getErrorMessage(err) || 'Lỗi không xác định',
          variant: 'error',
        });
      }
    }
  };

  // Tính toán tổng số trang
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">

      {/* 1. TOP TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight font-sans">QUẢN LÝ TÀI KHOẢN</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 ml-7">
            Phân quyền người dùng, quản trị vai trò thành viên và hỗ trợ khóa/mở khóa tài khoản (UC-18).
          </p>
        </div>
      </div>

      {/* 2. MAIN USER MANAGEMENT LIST */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
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

            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 px-2.5 h-9 bg-white dark:bg-slate-950/60 rounded-sm w-full sm:w-auto">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phân quyền:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="text-xs font-bold text-slate-600 dark:text-slate-200 outline-none bg-transparent cursor-pointer flex-1 sm:flex-initial"
              >
                <option value="Tất cả">Tất cả</option>
                <option value="Admin">Admin</option>
                <option value="Candidate">Candidate</option>
                <option value="Recruiter">Recruiter</option>
              </select>
            </div>
          </div>

          {/* User Database Table Grid */}
          <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">ĐỊA CHỈ EMAIL TÀI KHOẢN</th>
                  <th className="px-5 py-3">VAI TRÒ</th>
                  <th className="px-5 py-3">TRẠNG THÁI THÀNH VIÊN</th>
                  <th className="px-5 py-3">NGÀY ĐĂNG KÝ</th>
                  <th className="px-5 py-3 text-center">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  Array.from({ length: pagination.limit }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : error ? (
                  <tr className="bg-red-50/20 dark:bg-red-950/20">
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <AlertCircle className="w-7 h-7 text-red-500" />
                        <span className="text-xs font-bold text-red-650 dark:text-red-300">{error}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchUsers}
                          className="mt-1 border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 h-8 text-[11px] cursor-pointer"
                        >
                          Thử lại
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-400 dark:text-slate-500">#{user.id}</td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900 dark:text-slate-100">{user.email}</td>
                      <td className="px-5 py-3.5 uppercase">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeUserRole(user.id, e.target.value as UserRole, user.email)}
                          className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 px-2 py-1 rounded-sm outline-none cursor-pointer"
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
                            user.status === "active"
                              ? "success"
                              : user.status === "banned"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {user.status === "active"
                            ? "Hoạt động"
                            : user.status === "banned"
                              ? "Đã khóa"
                              : "Chưa kích hoạt"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-450 dark:text-slate-500 font-semibold">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {user.role !== "admin" ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleUserStatus(user.id, user.status, user.email)}
                            className={`h-8 w-8 border cursor-pointer ${user.status === 'banned'
                              ? 'border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-200'
                              : 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-200'
                              }`}
                            title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                          >
                            {user.status === "banned" ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Hệ thống</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      Không có người dùng nào trùng khớp với từ khóa tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 3. PAGINATION FOOTER */}
          {!error && !isLoading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                  disabled={pagination.page === 1}
                  className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                </Button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`h-7 w-7 text-[10px] font-bold cursor-pointer ${pagination.page === pageNum
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-650 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }))}
                  disabled={pagination.page === totalPages}
                  className="h-7 w-7 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
