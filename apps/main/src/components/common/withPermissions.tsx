import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { WorkspaceRole } from '../../types/workspace.types';

interface WithPermissionsProps {
  requiredRole?: WorkspaceRole;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export const withPermissions = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPermissionsProps = {}
) => {
  const WithPermissionsComponent: React.FC<P> = (props) => {
    const { hasPermission, permissions } = usePermissions();
    const { requiredRole, requiredPermission, fallback = null } = options;

    const hasAccess = () => {
      if (requiredRole) {
        return hasPermission(requiredRole);
      }
      
      if (requiredPermission) {
        return permissions[requiredPermission as keyof typeof permissions] || false;
      }
      
      return true;
    };

    if (!hasAccess()) {
      return <>{fallback}</>;
    }

    return <WrappedComponent {...props} />;
  };

  WithPermissionsComponent.displayName = `withPermissions(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPermissionsComponent;
};
