import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '@taskflow/ui';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({
  children,
  redirectTo = '/dashboard',
  showLoading = true,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading && showLoading) {
    return <Loading text="Checking authentication..." />;
  }

  // If user is authenticated, redirect them away from public routes
  if (isAuthenticated && user) {
    // Redirect to dashboard or specified route
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If not authenticated, allow access to public routes
  return <>{children}</>;
};

// Higher-order component for public-only components
export const withPublicOnly = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PublicOnlyRouteProps, 'children'> = {}
) => {
  const PublicOnlyComponent: React.FC<P> = (props) => (
    <PublicOnlyRoute {...options}>
      <Component {...props} />
    </PublicOnlyRoute>
  );

  PublicOnlyComponent.displayName = `withPublicOnly(${Component.displayName || Component.name})`;
  return PublicOnlyComponent;
};

// Conditional route guard for more complex logic
export const ConditionalRouteGuard: React.FC<{
  children: React.ReactNode;
  condition: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}> = ({ children, condition, redirectTo = '/dashboard', fallback }) => {
  const location = useLocation();

  if (condition) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Route guard with custom check function
export const RouteGuard: React.FC<{
  children: React.ReactNode;
  customCheck: () => boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}> = ({ children, customCheck, redirectTo = '/dashboard', fallback }) => {
  const location = useLocation();

  if (customCheck()) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
