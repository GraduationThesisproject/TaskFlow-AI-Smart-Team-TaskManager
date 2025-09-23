import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useRoutePermissions } from './useRoutePermissions';
import { ROUTES, getRouteConfig } from '../config/routes';

export const useProtectedRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canAccessCurrentRoute, currentRoute } = useRoutePermissions();

  // Check if current route requires authentication
  const isRouteProtected = useMemo(() => {
    if (!currentRoute) return false;
    return !currentRoute.isPublic;
  }, [currentRoute]);

  // Check if user can access current route
  const canAccessRoute = useMemo(() => {
    if (!isRouteProtected) return true;
    if (!isAuthenticated) return false;
    if (!user) return false;
    return canAccessCurrentRoute;
  }, [isRouteProtected, isAuthenticated, user, canAccessCurrentRoute]);

  // Check if user can access a specific route
  const canAccessSpecificRoute = useCallback((routeKey: keyof typeof ROUTES) => {
    const routeConfig = getRouteConfig(routeKey);
    
    if (routeConfig.isPublic) return true;
    if (!isAuthenticated) return false;
    if (!user) return false;
    
    // For authenticated routes, just check if user is authenticated
    return true;
  }, [isAuthenticated, user]);

  // Navigate to route with protection check
  const navigateToProtectedRoute = useCallback((
    routeKey: keyof typeof ROUTES,
    options?: { replace?: boolean; state?: any }
  ) => {
    const routeConfig = getRouteConfig(routeKey);
    
    if (canAccessSpecificRoute(routeKey)) {
      navigate(routeConfig.path, options);
    } else {
      // Redirect to login if not authenticated
      navigate('/', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [canAccessSpecificRoute, navigate, location]);

  // Get accessible routes for current user
  const getAccessibleRoutes = useCallback(() => {
    if (!isAuthenticated || !user) {
      return Object.entries(ROUTES).filter(([_, config]) => config.isPublic);
    }

    // If authenticated, return all routes
    return Object.entries(ROUTES);
  }, [isAuthenticated, user]);

  return {
    // State
    isAuthenticated,
    isLoading,
    user,
    isRouteProtected,
    canAccessRoute,
    currentRoute,
    
    // Methods
    canAccessSpecificRoute,
    navigateToProtectedRoute,
    getAccessibleRoutes,
    
    // Utilities
    isReady: !isLoading,
  };
};
