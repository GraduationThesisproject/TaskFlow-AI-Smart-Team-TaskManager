import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRoutePermissions } from '../../hooks/useRoutePermissions';
import { Loading } from '@taskflow/ui';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredWorkspaceAccess?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  allowUnauthenticated?: boolean;
  customCheck?: () => boolean | Promise<boolean>;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredWorkspaceAccess = false,
  redirectTo = '/',
  fallback,
  showLoading = true,
  allowUnauthenticated = false,
  customCheck,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canAccessCurrentRoute } = useRoutePermissions();

  const [customCheckResult, setCustomCheckResult] = React.useState<boolean | null>(null);
  const [isCustomChecking, setIsCustomChecking] = React.useState(false);

  // Handle custom permission check
  React.useEffect(() => {
    if (customCheck) {
      setIsCustomChecking(true);
      const result = customCheck();
      
      if (result instanceof Promise) {
        result.then(setCustomCheckResult).finally(() => setIsCustomChecking(false));
      } else {
        setCustomCheckResult(result);
        setIsCustomChecking(false);
      }
    }
  }, [customCheck]);

  // Show loading while checking authentication or custom permissions
  if (isLoading || isCustomChecking) {
    if (showLoading) {
      return <Loading text="Checking permissions..." />;
    }
    return null;
  }

  // Allow unauthenticated access if explicitly allowed
  if (allowUnauthenticated) {
    return <>{children}</>;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user exists
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check custom permission if provided
  if (customCheck && customCheckResult === false) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/no-access" replace />;
  }

  // Check workspace access if required
  if (requiredWorkspaceAccess && !canAccessCurrentRoute) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
};

// Higher-order component for route protection
export const withRouteGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'> = {}
) => {
  const GuardedComponent: React.FC<P> = (props) => (
    <RouteGuard {...options}>
      <Component {...props} />
    </RouteGuard>
  );

  GuardedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`;
  return GuardedComponent;
};

// Conditional route guard that only applies protection when condition is met
export const ConditionalRouteGuard: React.FC<RouteGuardProps & { 
  condition: boolean | (() => boolean) 
}> = ({ condition, children, ...guardProps }) => {
  const shouldGuard = typeof condition === 'function' ? condition() : condition;
  
  if (!shouldGuard) {
    return <>{children}</>;
  }
  
  return <RouteGuard {...guardProps}>{children}</RouteGuard>;
};
