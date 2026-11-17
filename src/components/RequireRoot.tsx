import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface RequireRootProps {
  children: React.ReactNode;
}

const RequireRoot: React.FC<RequireRootProps> = ({ children }) => {
  const { isRoot, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isRoot) {
    return <Navigate to="/analytics-dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireRoot;
