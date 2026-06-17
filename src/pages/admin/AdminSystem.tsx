import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { type User, type UserRole, type UserStatus, type CandidateProfile, type RecruiterProfile } from '../../types/user.type';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { getUsers, getUserById, updateUser, toggleUserStatus, deleteUser } from '../../services/admin.service';
import { useToast } from '../../components/common/toast';
import { Modal } from '../../components/common/Modal';

interface UserDetail extends User {
  candidateProfile?: (CandidateProfile & { _count?: { applications: number } }) | null;
  recruiterProfile?: RecruiterProfile | null;
  _count?: { jobPostings: number };
}

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
  const [hasLoadError, setHasLoadError] = useState(false);

  // States bộ lọc tìm kiếm
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("Tất cả");

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  // Modal Xem chi tiết
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    user: UserDetail | null;
    isLoading: boolean;
  }>({ isOpen: false, user: null, isLoading: false });

  // Modal Sửa thông tin
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    email: string;
    role: UserRole;
    status: UserStatus;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    userId: null,
    email: "",
    role: "candidate",
    status: "active",
    isSubmitting: false,
  });

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
    setHasLoadError(false);
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
      setHasLoadError(true);
      toast({ title: getErrorMessage(err) || 'Có lỗi xảy ra khi tải dữ liệu từ máy chủ.', variant: "error" });
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

    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận hành động",
      message: `Bạn có chắc chắn muốn ${actionText} tài khoản người dùng "${email}"?`,
      onConfirm: async () => {
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
    });
  };

  // Thay đổi quyền hạn (Role) người dùng qua PUT API
  const handleChangeUserRole = async (
    userId: number,
    newRole: UserRole,
    email: string,
  ) => {
    setConfirmConfig({
      isOpen: true,
      title: "Thay đổi vai trò người dùng",
      message: `Bạn có chắc chắn muốn thay đổi vai trò tài khoản "${email}" thành "${newRole.toUpperCase()}"?`,
      onConfirm: async () => {
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
    });
  };

  // Xem chi tiết tài khoản
  const handleViewDetail = async (userId: number) => {
    setDetailModal({ isOpen: true, user: null, isLoading: true });
    try {
      const response = await getUserById(userId);
      if (response.success && response.data) {
        setDetailModal({ isOpen: true, user: response.data as UserDetail, isLoading: false });
      } else {
        throw new Error(response.message || 'Không lấy được thông tin chi tiết');
      }
    } catch (err: unknown) {
      console.error(err);
      setDetailModal({ isOpen: false, user: null, isLoading: false });
      toast({
        title: 'Lỗi tải thông tin',
        description: getErrorMessage(err) || 'Lỗi không xác định',
        variant: 'error',
      });
    }
  };

  // Mở modal Sửa thông tin
  const handleOpenEdit = (user: User) => {
    setEditModal({
      isOpen: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isSubmitting: false,
    });
  };

  // Lưu thay đổi từ modal Sửa thông tin
  const handleSaveEdit = async () => {
    if (!editModal.userId) return;
    if (!editModal.email.trim()) {
      toast({ title: 'Email không được để trống', variant: 'error' });
      return;
    }

    setEditModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      const response = await updateUser(editModal.userId, {
        email: editModal.email.trim(),
        role: editModal.role,
        status: editModal.status,
      });
      if (response.success && response.data) {
        const updated = response.data;
        setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        toast({
          title: 'Cập nhật thành công',
          description: `Đã cập nhật tài khoản "${updated.email}".`,
          variant: 'success',
        });
        setEditModal(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
      } else {
        toast({
          title: 'Cập nhật thất bại',
          description: response.message || 'Lỗi không xác định',
          variant: 'error',
        });
        setEditModal(prev => ({ ...prev, isSubmitting: false }));
      }
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: 'Đã xảy ra lỗi',
        description: getErrorMessage(err) || 'Lỗi không xác định',
        variant: 'error',
      });
      setEditModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Xóa tài khoản (soft delete)
  const handleDeleteUser = (userId: number, email: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Xác nhận xóa tài khoản",
      message: `Bạn có chắc chắn muốn xóa tài khoản "${email}"? Thông tin cá nhân (họ tên, SĐT, địa chỉ...) sẽ bị ẩn danh, email "${email}" sẽ được giải phóng để có thể đăng ký lại. Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          const response = await deleteUser(userId);
          if (response.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setPagination(prev => ({ ...prev, total: Math.max(prev.total - 1, 0) }));
            toast({
              title: 'Đã xóa tài khoản',
              description: `Email "${email}" đã được giải phóng. Lịch sử hoạt động được giữ lại dưới dạng ẩn danh.`,
              variant: 'success',
            });
          } else {
            toast({
              title: 'Xóa thất bại',
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
      },
    });
  };

  // Tính toán tổng số trang
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
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
                ) : hasLoadError ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <span className="text-xs font-bold text-slate-500">Không thể tải dữ liệu</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchUsers}
                          className="mt-1 h-8 text-[11px] cursor-pointer"
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
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewDetail(user.id)}
                              className="h-8 w-8 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenEdit(user)}
                              className="h-8 w-8 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-200 cursor-pointer"
                              title="Sửa thông tin"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleUserStatus(user.id, user.status, user.email)}
                              className={`h-8 w-8 border cursor-pointer ${user.status === 'banned'
                                ? 'border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-200'
                                : 'border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-200'
                                }`}
                              title={user.status === 'banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {user.status === "banned" ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="h-8 w-8 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-200 cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewDetail(user.id)}
                              className="h-8 w-8 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-200 cursor-pointer"
                              title="Xem chi tiết quản trị viên"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Hệ thống</span>
                          </div>
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
          {!hasLoadError && !isLoading && users.length > 0 && (
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

      <Modal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        title={confirmConfig.title}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-650 dark:text-slate-350">
            {confirmConfig.message}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
              className="cursor-pointer h-9 px-4 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                confirmConfig.onConfirm();
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer h-9 px-4 text-xs font-semibold"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Xem chi tiết tài khoản */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, user: null, isLoading: false })}
        title="Chi tiết tài khoản"
      >
        {detailModal.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="ml-3 text-sm font-semibold text-slate-600">Đang tải...</span>
          </div>
        ) : detailModal.user ? (
          <div className="space-y-5">
            {/* Thông tin tài khoản cơ bản */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Thông tin tài khoản</h4>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-md p-4 border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">ID</p>
                  <p className="text-sm font-bold text-slate-900">#{detailModal.user.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Email</p>
                  <p className="text-sm font-bold text-slate-900 break-all">{detailModal.user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Vai trò</p>
                  <p className="text-sm font-bold text-slate-900 uppercase">{detailModal.user.role}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Trạng thái</p>
                  <Badge
                    variant={
                      detailModal.user.status === "active" ? "success"
                        : detailModal.user.status === "banned" ? "destructive"
                          : "secondary"
                    }
                  >
                    {detailModal.user.status === "active" ? "Hoạt động"
                      : detailModal.user.status === "banned" ? "Đã khóa"
                        : "Chưa kích hoạt"}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Ngày tạo</p>
                  <p className="text-sm font-semibold text-slate-700">{new Date(detailModal.user.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Cập nhật lần cuối</p>
                  <p className="text-sm font-semibold text-slate-700">{new Date(detailModal.user.updatedAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            </div>

            {/* Hồ sơ cá nhân quản trị viên */}
            {detailModal.user.role === 'admin' && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Hồ sơ cá nhân quản trị viên</h4>
                <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 rounded-md p-4 border border-indigo-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Họ và tên</p>
                    <p className="text-sm font-semibold text-slate-700">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-700">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Chức vụ</p>
                    <p className="text-sm font-semibold text-slate-700">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Phòng ban</p>
                    <p className="text-sm font-semibold text-slate-700">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Ngày sinh</p>
                    <p className="text-sm font-semibold text-slate-700">—</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Cấp độ quyền</p>
                    <p className="text-sm font-bold text-indigo-700">Super Admin</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Địa chỉ</p>
                    <p className="text-sm font-semibold text-slate-700">—</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile ứng viên */}
            {detailModal.user.candidateProfile && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Hồ sơ ứng viên</h4>
                <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 rounded-md p-4 border border-emerald-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Họ và tên</p>
                    <p className="text-sm font-bold text-slate-900">{detailModal.user.candidateProfile.fullName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-700">{detailModal.user.candidateProfile.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Địa chỉ</p>
                    <p className="text-sm font-semibold text-slate-700">{detailModal.user.candidateProfile.address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Ngày sinh</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {detailModal.user.candidateProfile.dateOfBirth
                        ? new Date(detailModal.user.candidateProfile.dateOfBirth).toLocaleDateString('vi-VN')
                        : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Số lượt ứng tuyển</p>
                    <p className="text-sm font-bold text-emerald-700">{detailModal.user.candidateProfile._count?.applications ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile nhà tuyển dụng */}
            {detailModal.user.recruiterProfile && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Hồ sơ nhà tuyển dụng</h4>
                <div className="grid grid-cols-2 gap-3 bg-blue-50/50 rounded-md p-4 border border-blue-100">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Tên công ty</p>
                    <p className="text-sm font-bold text-slate-900">{detailModal.user.recruiterProfile.companyName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Người liên hệ</p>
                    <p className="text-sm font-semibold text-slate-700">{detailModal.user.recruiterProfile.contactName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Số điện thoại</p>
                    <p className="text-sm font-semibold text-slate-700">{detailModal.user.recruiterProfile.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Website</p>
                    <p className="text-sm font-semibold text-slate-700 break-all">{detailModal.user.recruiterProfile.website || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Địa chỉ</p>
                    <p className="text-sm font-semibold text-slate-700">{detailModal.user.recruiterProfile.address || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Số tin đã đăng</p>
                    <p className="text-sm font-bold text-blue-700">{detailModal.user._count?.jobPostings ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModal({ isOpen: false, user: null, isLoading: false })}
                className="cursor-pointer h-9 px-4 text-xs font-semibold"
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 py-8 text-center">Không có dữ liệu</p>
        )}
      </Modal>

      {/* Modal Sửa thông tin tài khoản */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => !editModal.isSubmitting && setEditModal(prev => ({ ...prev, isOpen: false }))}
        title="Sửa thông tin tài khoản"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={editModal.email}
              onChange={(e) => setEditModal(prev => ({ ...prev, email: e.target.value }))}
              placeholder="example@email.com"
              disabled={editModal.isSubmitting}
              className="h-9 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Vai trò
            </label>
            <select
              value={editModal.role}
              onChange={(e) => setEditModal(prev => ({ ...prev, role: e.target.value as UserRole }))}
              disabled={editModal.isSubmitting}
              className="w-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 px-3 py-2 rounded-sm outline-none cursor-pointer focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="candidate">Candidate (Ứng viên)</option>
              <option value="recruiter">Recruiter (Nhà tuyển dụng)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Trạng thái
            </label>
            <select
              value={editModal.status}
              onChange={(e) => setEditModal(prev => ({ ...prev, status: e.target.value as UserStatus }))}
              disabled={editModal.isSubmitting}
              className="w-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 px-3 py-2 rounded-sm outline-none cursor-pointer focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Chưa kích hoạt</option>
              <option value="banned">Đã khóa</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
              disabled={editModal.isSubmitting}
              className="cursor-pointer h-9 px-4 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveEdit}
              disabled={editModal.isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer h-9 px-4 text-xs font-semibold inline-flex items-center gap-2"
            >
              {editModal.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
