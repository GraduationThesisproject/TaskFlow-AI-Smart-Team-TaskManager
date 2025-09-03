import { WorkspaceRole } from '../types/workspace.types';

export const roleHierarchy: Record<WorkspaceRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export const canPerformAction = (
  userRole: WorkspaceRole | null,
  requiredRole: WorkspaceRole
): boolean => {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const getRoleDisplayName = (role: WorkspaceRole): string => {
  const displayNames: Record<WorkspaceRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
  };
  return displayNames[role];
};

export const getRoleColor = (role: WorkspaceRole): string => {
  const colors: Record<WorkspaceRole, string> = {
    owner: 'text-red-500',
    admin: 'text-blue-500',
    member: 'text-green-500',
  };
  return colors[role];
};
