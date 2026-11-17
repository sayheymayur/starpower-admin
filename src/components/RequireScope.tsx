import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface RequireScopeProps {
  scope: string;
  children: React.ReactNode;
}

const RequireScope: React.FC<RequireScopeProps> = ({ scope, children }) => {
  const { can, isLoading } = useAuth();

  if (isLoading) return null;

  if (!can(scope)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RequireScope;
