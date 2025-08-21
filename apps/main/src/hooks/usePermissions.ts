import { useAppSelector } from '../store';
import { WorkspaceRole } from '../types/workspace.types';

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
}

export const usePermissions = (workspaceId?: string) => {
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace, members } = useAppSelector((state) => state.workspace);

  const getUserRole = (): WorkspaceRole | null => {
    if (!user || !currentWorkspace) return null;
    
    // Check if user is the owner
    if (currentWorkspace.ownerId === user.id) {
      return 'owner';
    }
    
    // Check member role
    const member = members.find(m => m.userId === user.id);
    return member?.role || null;
  };

  const hasPermission = (requiredRole: WorkspaceRole): boolean => {
    const userRole = getUserRole();
    if (!userRole) return false;

    const roleHierarchy: Record<WorkspaceRole, number> = {
      owner: 3,
      admin: 2,
      member: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const getPermissions = (): Permission => {
    const userRole = getUserRole();
    
    if (!userRole) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageMembers: false,
        canManageSettings: false,
      };
    }

    switch (userRole) {
      case 'owner':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
          canInvite: true,
          canManageMembers: true,
          canManageSettings: true,
        };
      case 'admin':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
          canInvite: true,
          canManageMembers: true,
          canManageSettings: false,
        };
      case 'member':
        return {
          canView: true,
          canEdit: true,
          canDelete: false,
          canInvite: false,
          canManageMembers: false,
          canManageSettings: false,
        };
      default:
        return {
          canView: false,
          canEdit: false,
          canDelete: false,
          canInvite: false,
          canManageMembers: false,
          canManageSettings: false,
        };
    }
  };

  return {
    userRole: getUserRole(),
    hasPermission,
    getPermissions,
    permissions: getPermissions(),
  };
};
