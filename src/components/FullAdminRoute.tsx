import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  canAccessAstro,
  canEnterFullDashboardShell,
} from '../utils/authRoles';

interface FullAdminRouteProps {
  children: React.ReactNode;
}

const FullAdminRoute: React.FC<FullAdminRouteProps> = ({ children }) => {
  const { scopes, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!canEnterFullDashboardShell(scopes)) {
    if (canAccessAstro(scopes)) {
      return <Navigate to="/astro" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default FullAdminRoute;
