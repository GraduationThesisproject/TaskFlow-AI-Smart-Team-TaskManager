import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { WorkspaceRole } from '../../types/workspace.types';

// Base selectors
export const selectPermissionState = (state: RootState) => state.permissions;
export const selectCurrentUserRole = (state: RootState) => state.permissions.currentUserRole;
export const selectWorkspacePermissions = (state: RootState) => state.permissions.workspacePermissions;
export const selectPermissionLoading = (state: RootState) => state.permissions.isLoading;
export const selectPermissionError = (state: RootState) => state.permissions.error;

// Derived selectors
export const selectUserRoleForWorkspace = createSelector(
  [selectCurrentUserRole, selectWorkspacePermissions, (_, workspaceId: string) => workspaceId],
  (currentRole, workspacePermissions, workspaceId) => {
    return workspacePermissions[workspaceId] || currentRole;
  }
);

export const selectHasPermission = createSelector(
  [selectUserRoleForWorkspace, (_, __, requiredRole: WorkspaceRole) => requiredRole],
  (userRole, requiredRole) => {
    if (!userRole) return false;
    
    const roleHierarchy: Record<WorkspaceRole, number> = {
      owner: 3,
      admin: 2,
      member: 1,
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
);

export const selectCanPerformAction = createSelector(
  [selectUserRoleForWorkspace, (_, __, action: string) => action],
  (userRole, action) => {
    if (!userRole) return false;
    
    const actionPermissions: Record<string, WorkspaceRole[]> = {
      'view': ['owner', 'admin', 'member'],
      'edit': ['owner', 'admin', 'member'],
      'delete': ['owner', 'admin'],
      'invite': ['owner', 'admin'],
      'manage_members': ['owner', 'admin'],
      'manage_settings': ['owner'],
    };
    
    const requiredRoles = actionPermissions[action] || [];
    return requiredRoles.includes(userRole);
  }
);
