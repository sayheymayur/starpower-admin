import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { canAccessAstro } from '../utils/authRoles';

interface AstroRouteProps {
  children: React.ReactNode;
}

const AstroRoute: React.FC<AstroRouteProps> = ({ children }) => {
  const { scopes, isLoading } = useAuth();

  if (isLoading) return null;

  if (!canAccessAstro(scopes)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AstroRoute;
