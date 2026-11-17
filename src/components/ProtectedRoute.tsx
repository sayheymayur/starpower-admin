import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import {
  canAccessAstro,
  canEnterFullDashboardShell,
} from '../utils/authRoles';
import { isAdminRole } from '../utils/scopes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  astroOnly?: boolean;
  minimal?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  astroOnly,
  minimal,
}) => {
  const { user, scopes, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Login />;
  }

  if (user.product && user.product !== 'starpower') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (minimal) {
    return <>{children}</>;
  }

  if (astroOnly) {
    if (!canAccessAstro(scopes) && !isAdminRole(user.roleId ?? user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return <>{children}</>;
  }

  if (!canEnterFullDashboardShell(scopes) && !canAccessAstro(scopes)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
