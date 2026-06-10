import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/user.type';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          {/* Một hiệu ứng spinner xoay động cao cấp */}
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 1. Nếu tài khoản chưa onboarding (role === 'pending') mà truy cập route khác
  if (user && user.role === 'pending') {
    if (!allowedRoles || !allowedRoles.includes('pending')) {
      return <Navigate to="/auth/setup-profile" replace />;
    }
  }

  // 2. Nếu tài khoản đã onboarding mà cố tình truy cập vào trang setup-profile
  if (user && user.role !== 'pending') {
    if (allowedRoles && allowedRoles.includes('pending')) {
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user.role === 'candidate') {
        return <Navigate to="/candidate/overview" replace />;
      } else if (user.role === 'recruiter') {
        return <Navigate to="/recruiter/overview" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
