import type { WorkspaceRole } from '../types/workspace.types';

export interface RouteConfig {
  path: string;
  requiredRole?: WorkspaceRole;
  requiredPermission?: string;
  redirectTo?: string;
  isPublic?: boolean;
}

export const ROUTES = {
  // Public routes (no authentication required)
  LANDING: { path: '/*', isPublic: true },
  SIGNIN: { path: '/signin', isPublic: true },
  SIGNUP: { path: '/signup', isPublic: true },

  // Protected routes (authentication required)
  DASHBOARD: { path: '/dashboard/*', requiredRole: 'member' },
  NO_ACCESS: { path: '/no-access' },

  // Workspace routes (require member role)
  WORKSPACE: { path: '/workspace/*', requiredRole: 'member' },
  SPACE: { path: '/space/*', requiredRole: 'member' },
  BOARD: { path: '/board/*', requiredRole: 'member' },

  // Admin routes (require admin or owner role)
  WORKSPACE_SETTINGS: { path: '/workspace/settings', requiredRole: 'admin' },
  WORKSPACE_MEMBERS: { path: '/workspace/members', requiredRole: 'admin' },
  WORKSPACE_BILLING: { path: '/workspace/billing', requiredRole: 'owner' },

  // Owner-only routes
  WORKSPACE_DELETE: { path: '/workspace/delete', requiredRole: 'owner' },
} as const;

export const getRouteConfig = (routeKey: keyof typeof ROUTES): RouteConfig => {
  return ROUTES[routeKey];
};

export const getPublicRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => route.isPublic);
};

export const getProtectedRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => !route.isPublic);
};

export const getRoutesByRole = (role: WorkspaceRole): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => {
    if (route.isPublic) return false;
    if (!route.requiredRole) return true;
    
    const roleHierarchy: Record<WorkspaceRole, number> = {
      owner: 3,
      admin: 2,
      member: 1,
    };
    
    return roleHierarchy[role] >= roleHierarchy[route.requiredRole];
  });
};
