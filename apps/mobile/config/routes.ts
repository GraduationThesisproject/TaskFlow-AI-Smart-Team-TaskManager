import type { WorkspaceRole } from '../types/workspace.types';

export interface RouteConfig {
  path: string;
  requiredRole?: WorkspaceRole;
  requiredPermission?: string;
  redirectTo?: string;
  isPublic?: boolean;
  screenOptions?: {
    headerShown?: boolean;
    presentation?: 'modal' | 'card' | 'transparentModal';
    animation?: 'slide_from_right' | 'slide_from_left' | 'slide_from_bottom' | 'fade';
  };
}

export const ROUTES = {
  // Public routes (no authentication required)
  LANDING: { 
    path: '/(tabs)', 
    isPublic: true,
    screenOptions: { headerShown: false }
  },
  SIGNIN: { 
    path: '/signin', 
    isPublic: true,
    screenOptions: { 
      headerShown: true,
      presentation: 'card',
      animation: 'slide_from_right'
    }
  },
  SIGNUP: { 
    path: '/signup', 
    isPublic: true,
    screenOptions: { 
      headerShown: true,
      presentation: 'card',
      animation: 'slide_from_right'
    }
  },

  // Protected routes (authentication required)
  DASHBOARD: { 
    path: '/(tabs)', 
    requiredRole: 'member',
    screenOptions: { headerShown: false }
  },
  NO_ACCESS: { 
    path: '/no-access',
    screenOptions: { headerShown: true }
  },

  // Workspace routes (require member role)
  WORKSPACE: { 
    path: '/workspace', 
    requiredRole: 'member',
    screenOptions: { headerShown: true }
  },
  SPACE: { 
    path: '/space', 
    requiredRole: 'member',
    screenOptions: { headerShown: true }
  },
  BOARD: { 
    path: '/board', 
    requiredRole: 'member',
    screenOptions: { headerShown: true }
  },

  // Admin routes (require admin or owner role)
  WORKSPACE_SETTINGS: { 
    path: '/workspace/settings', 
    requiredRole: 'admin',
    screenOptions: { 
      headerShown: true,
      presentation: 'modal'
    }
  },
  WORKSPACE_MEMBERS: { 
    path: '/workspace/members', 
    requiredRole: 'admin',
    screenOptions: { 
      headerShown: true,
      presentation: 'modal'
    }
  },
  WORKSPACE_BILLING: { 
    path: '/workspace/billing', 
    requiredRole: 'owner',
    screenOptions: { 
      headerShown: true,
      presentation: 'modal'
    }
  },

  // Owner-only routes
  WORKSPACE_DELETE: { 
    path: '/workspace/delete', 
    requiredRole: 'owner',
    screenOptions: { 
      headerShown: true,
      presentation: 'modal'
    }
  },

  // Modal routes
  MODAL: { 
    path: '/modal', 
    isPublic: true,
    screenOptions: { 
      presentation: 'modal',
      animation: 'slide_from_bottom'
    }
  },

  // Tab routes
  TAB_ONE: { 
    path: '/(tabs)', 
    requiredRole: 'member',
    screenOptions: { headerShown: false }
  },
  TAB_TWO: { 
    path: '/(tabs)/two', 
    requiredRole: 'member',
    screenOptions: { headerShown: false }
  },

  // Profile and settings
  PROFILE: { 
    path: '/profile', 
    requiredRole: 'member',
    screenOptions: { 
      headerShown: true,
      presentation: 'card'
    }
  },
  SETTINGS: { 
    path: '/settings', 
    requiredRole: 'member',
    screenOptions: { 
      headerShown: true,
      presentation: 'card'
    }
  },

  // Notifications
  NOTIFICATIONS: { 
    path: '/notifications', 
    requiredRole: 'member',
    screenOptions: { 
      headerShown: true,
      presentation: 'card'
    }
  },

  // Search
  SEARCH: { 
    path: '/search', 
    requiredRole: 'member',
    screenOptions: { 
      headerShown: true,
      presentation: 'card'
    }
  },

} as const;

export const getRouteConfig = (routeKey: keyof typeof ROUTES): RouteConfig => {
  return ROUTES[routeKey];
};

export const getPublicRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => 'isPublic' in route && route.isPublic);
};

export const getProtectedRoutes = (): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => !('isPublic' in route && route.isPublic));
};

export const getRoutesByRole = (role: WorkspaceRole): RouteConfig[] => {
  return Object.values(ROUTES).filter(route => {
    if ('isPublic' in route && route.isPublic) return false;
    if (!('requiredRole' in route) || !route.requiredRole) return true;
    
    const roleHierarchy: Record<WorkspaceRole, number> = {
      owner: 3,
      admin: 2,
      member: 1,
    };
    
    return roleHierarchy[role] >= roleHierarchy[route.requiredRole];
  });
};

// Helper function to get route with screen options
export function getRouteWithOptions(routeKey: keyof typeof ROUTES) {
  const route = ROUTES[routeKey];
  return {
    ...route,
    screenOptions: {
      headerShown: true,
      ...route.screenOptions,
    },
  };
}

// Helper function to check if route requires authentication
export function requiresAuth(routeKey: keyof typeof ROUTES): boolean {
  const route = ROUTES[routeKey];
  return !('isPublic' in route && route.isPublic);
}

// Helper function to get route animation
export function getRouteAnimation(routeKey: keyof typeof ROUTES) {
  const route = ROUTES[routeKey];
  const screenOptions = 'screenOptions' in route ? route.screenOptions : undefined;
  return (screenOptions as any)?.animation || 'slide_from_right';
}

// Helper function to get route presentation
export function getRoutePresentation(routeKey: keyof typeof ROUTES) {
  const route = ROUTES[routeKey];
  const screenOptions = 'screenOptions' in route ? route.screenOptions : undefined;
  return (screenOptions as any)?.presentation || 'card';
}
