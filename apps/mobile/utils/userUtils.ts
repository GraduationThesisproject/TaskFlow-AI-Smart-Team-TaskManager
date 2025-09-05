import type { User } from '../types/auth.types';

// Helper functions to easily access user data from the nested structure
export const getUserName = (user: User | null): string => {
  return user?.user?.name || 'User';
};

export const getUserEmail = (user: User | null): string => {
  return user?.user?.email || '';
};

export const getUserAvatar = (user: User | null): string | undefined => {
  return user?.user?.avatar;
};

export const getUserInitials = (user: User | null): string => {
  const name = getUserName(user);
  return name.charAt(0).toUpperCase();
};

export const getUserTheme = (user: User | null): 'light' | 'dark' | 'system' => {
  return user?.preferences?.theme?.mode || 'system';
};

export const getUserPermissions = (user: User | null): string[] => {
  return user?.roles?.permissions || [];
};

export const getUserWorkspaceRoles = (user: User | null): Record<string, string[]> => {
  return user?.roles?.workspaces || {};
};

export const hasPermission = (user: User | null, permission: string): boolean => {
  return getUserPermissions(user).includes(permission);
};

export const hasWorkspaceRole = (user: User | null, workspaceId: string, role: string): boolean => {
  const workspaceRoles = getUserWorkspaceRoles(user);
  return workspaceRoles[workspaceId]?.includes(role) || false;
};

export const isUserActive = (user: User | null): boolean => {
  return user?.user?.isActive || false;
};

export const isEmailVerified = (user: User | null): boolean => {
  return user?.user?.emailVerified || false;
};
