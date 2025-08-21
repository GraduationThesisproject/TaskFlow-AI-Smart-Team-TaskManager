import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from './usePermissions';
import { ROUTES, getRoutesByRole, type RouteConfig } from '../config/routes';

export const useRoutePermissions = () => {
  const location = useLocation();
  const { userRole, hasPermission } = usePermissions();

  const currentRoute = useMemo(() => {
    const path = location.pathname;
    
    // Find the matching route configuration
    for (const [key, route] of Object.entries(ROUTES)) {
      if (route.path.includes('*')) {
        // Handle wildcard routes
        const basePath = route.path.replace('/*', '');
        if (path.startsWith(basePath)) {
          return { key, ...route };
        }
      } else if (route.path === path) {
        return { key, ...route };
      }
    }
    
    return null;
  }, [location.pathname]);

  const canAccessCurrentRoute = useMemo(() => {
    if (!currentRoute) return false;
    if (currentRoute.isPublic) return true;
    if (!userRole) return false;
    if (!currentRoute.requiredRole) return true;
    
    return hasPermission(currentRoute.requiredRole);
  }, [currentRoute, userRole, hasPermission]);

  const accessibleRoutes = useMemo(() => {
    if (!userRole) return getRoutesByRole('member'); // Default to member routes
    return getRoutesByRole(userRole);
  }, [userRole]);

  const getRouteAccess = (routeKey: keyof typeof ROUTES): boolean => {
    const route = ROUTES[routeKey];
    if (route.isPublic) return true;
    if (!userRole) return false;
    if (!route.requiredRole) return true;
    
    return hasPermission(route.requiredRole);
  };

  return {
    currentRoute,
    canAccessCurrentRoute,
    accessibleRoutes,
    getRouteAccess,
    userRole,
  };
};
