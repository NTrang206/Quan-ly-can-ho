import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import { AdminLayout } from '../components/layout/AdminLayout';
import { TenantLayout } from '../components/layout/TenantLayout';
import { PrivateRoute } from './PrivateRoute';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { PublicExplorePage } from '../pages/PublicExplorePage';
import { ApartmentDetailPage } from '../pages/ApartmentDetailPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { BuildingsPage } from '../pages/BuildingsPage';
import { ContractsPage } from '../pages/ContractsPage';
import { FinancePage } from '../pages/FinancePage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { AlertsAIPage } from '../pages/AlertsAIPage';
import { RagChatbotPage } from '../pages/RagChatbotPage';
import { BookingsPage } from '../pages/BookingsPage';
import { TenantsPage } from '../pages/TenantsPage';
import { ResidentPortalPage } from '../pages/ResidentPortalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/explore" replace />;
  }

  if (user.roleCode === 'TENANT') {
    return <Navigate to="/resident-portal" replace />;
  }

  if (user.roleCode === 'GUEST') {
    return <Navigate to="/explore" replace />;
  }

  if (user.roleCode === 'ACCOUNTANT') {
    return <Navigate to="/admin/finance" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route path="/explore" element={<PublicExplorePage />} />
      <Route path="/apartments/:id" element={<ApartmentDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Resident / Tenant Portal Route */}
      <Route
        path="/resident-portal"
        element={
          <PrivateRoute allowedRoles={['TENANT', 'ADMIN', 'STAFF']}>
            <TenantLayout>
              <ResidentPortalPage />
            </TenantLayout>
          </PrivateRoute>
        }
      />

      {/* Admin / Staff / Accountant Enterprise Portal Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['ADMIN', 'STAFF', 'ACCOUNTANT']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="buildings" element={<BuildingsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="alerts" element={<AlertsAIPage />} />
        <Route path="rag-chatbot" element={<RagChatbotPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="tenants" element={<TenantsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
