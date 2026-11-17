import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { ADMIN_ONLY_PATHS, getScopeForPath } from '../config/routeScopes';
import { useAuth } from '../context/AuthContext';
import { getAccessibleHomeRoute } from '../utils/authRoles';

interface ScopeGuardProps {
  children: React.ReactNode;
}

const ANALYTICS_PATHS = ['/analytics-dashboard', '/analytics'];

/** Checks pathname against routeScopes and admin-only paths on every navigation. */
const ScopeGuard: React.FC<ScopeGuardProps> = ({ children }) => {
  const location = useLocation();
  const { can, isAdmin, isLoading, scopes, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const pathname = location.pathname;

  if (ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!isAdmin) return <Navigate to="/unauthorized" replace />;
    return <>{children}</>;
  }

  const required = getScopeForPath(pathname);
  if (required && !can(required)) {
    if (ANALYTICS_PATHS.includes(pathname)) {
      const home = getAccessibleHomeRoute(scopes, user);
      if (home !== pathname) {
        return <Navigate to={home} replace />;
      }
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ScopeGuard;
