import React from 'react';
import { usePermissions, Permission } from '../../hooks/usePermissions';
import { WorkspaceRole } from '../../types/workspace.types';
import type { PermissionGuardProps } from '../../types/interfaces/ui';

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
}) => {
  const { hasPermission, permissions } = usePermissions();

  const hasAccess = () => {
    if (requiredRole) {
      return hasPermission(requiredRole);
    }
    
    if (requiredPermission) {
      return permissions[requiredPermission];
    }
    
    return true;
  };

  if (!hasAccess()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
