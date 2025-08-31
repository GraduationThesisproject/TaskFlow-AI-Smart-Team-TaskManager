import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import type { WorkspaceRole } from '../../types/workspace.types';
import type { ProtectedRouteProps } from '../../types/interfaces/ui';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo,
  fallback = null,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasPermission, permissions } = usePermissions();
  const location = useLocation();

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check role-based permissions
  if (requiredRole && !hasPermission(requiredRole)) {
    // Redirect to no-access page or fallback
    return redirectTo ? (
      <Navigate to={redirectTo} replace state={{ from: location }} />
    ) : (
      <Navigate to="/no-access" replace state={{ from: location }} />
    );
  }

  // Check specific permission
  if (requiredPermission && !permissions[requiredPermission as keyof typeof permissions]) {
    return redirectTo ? (
      <Navigate to={redirectTo} replace state={{ from: location }} />
    ) : (
      <Navigate to="/no-access" replace state={{ from: location }} />
    );
  }

  // User has access, render children
  return <>{children}</>;
};
