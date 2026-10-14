import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/entities';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isInitialized, hasActiveContract, isManagement } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Đang khởi tạo phiên làm việc...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = user.roleCode;

  // Nghiệp vụ Cổng Cư Dân:
  // Nếu là đường dẫn cổng cư dân (/tenant-portal hoặc /resident-portal):
  // Chỉ tài khoản đã được duyệt hợp đồng ACTIVE (hoặc ban quản lý) mới được vào.
  // Khách vãn lai (GUEST) hoặc tài khoản chưa có hợp đồng được duyệt bị chặn và redirect về /explore
  const isResidentPortal = location.pathname.startsWith('/tenant-portal') || location.pathname.startsWith('/resident-portal');
  if (isResidentPortal) {
    if (!isManagement && (currentRole === 'GUEST' || !hasActiveContract)) {
      return <Navigate to="/explore?notice=no_active_contract" replace />;
    }
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
