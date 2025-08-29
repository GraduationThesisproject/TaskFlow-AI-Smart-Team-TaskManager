import React, { useState } from 'react';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { PermissionDeniedPopup } from './PermissionDeniedPopup';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof ReturnType<typeof useAdminPermissions>['permissions'];
  requiredPermissions?: (keyof ReturnType<typeof useAdminPermissions>['permissions'])[];
  fallback?: React.ReactNode;
  showPopup?: boolean;
  featureName?: string;
  actionName?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  fallback = null,
  showPopup = true,
  featureName = 'this feature',
  actionName = 'access'
}) => {
  const { hasPermission, hasAllPermissions, getRoleDisplayName, currentAdmin } = useAdminPermissions();
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  const hasAccess = (): boolean => {
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }
    
    if (requiredPermissions) {
      return hasAllPermissions(requiredPermissions);
    }
    
    return true;
  };

  const handleAccessAttempt = () => {
    if (!hasAccess() && showPopup) {
      setShowPermissionPopup(true);
    }
  };

  if (!hasAccess()) {
    if (showPopup) {
      return (
        <>
          <div onClick={handleAccessAttempt}>
            {fallback || children}
          </div>
          
          {showPermissionPopup && (
            <PermissionDeniedPopup
              isOpen={showPermissionPopup}
              onClose={() => setShowPermissionPopup(false)}
              featureName={featureName}
              actionName={actionName}
              userRole={getRoleDisplayName()}
            />
          )}
        </>
      );
    }
    
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
