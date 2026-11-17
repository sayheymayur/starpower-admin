import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface RequireAdminProps {
  children: React.ReactNode;
}

/** Gates admin-only screens (role/account management). Requires roleId === 'admin'. */
const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
