import React, { useState } from 'react';
import { useAdminPermissions, AdminPermissions } from '../../hooks/useAdminPermissions';
import { Button, Card, CardContent, CardHeader, CardTitle, Typography } from '@taskflow/ui';
import { ShieldExclamationIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof AdminPermissions;
  requiredPermissions?: (keyof AdminPermissions)[];
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
              featureName={featureName}
              actionName={actionName}
              userRole={getRoleDisplayName()}
              onClose={() => setShowPermissionPopup(false)}
            />
          )}
        </>
      );
    }
    
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface PermissionDeniedPopupProps {
  featureName: string;
  actionName: string;
  userRole: string;
  onClose: () => void;
}

const PermissionDeniedPopup: React.FC<PermissionDeniedPopupProps> = ({
  featureName,
  actionName,
  userRole,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            Access Denied
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <Typography variant="body" className="text-gray-600">
              You don't have permission to {actionName} <strong>{featureName}</strong>.
            </Typography>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <LockClosedIcon className="w-4 h-4" />
                <span>Current Role: <strong>{userRole}</strong></span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Contact your system administrator if you need access to this feature.</p>
            <p>Your current role has limited permissions for security reasons.</p>
          </div>
          
          <Button 
            onClick={onClose}
            className="w-full"
            variant="outline"
          >
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Higher-order component for wrapping components with permission checks
export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<PermissionGuardProps, 'children'> = {}
) => {
  const WithPermissionComponent: React.FC<P> = (props) => (
    <PermissionGuard {...options}>
      <WrappedComponent {...props} />
    </PermissionGuard>
  );

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithPermissionComponent;
};

// Hook for checking permissions in components
export const usePermissionCheck = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAdminPermissions();
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkAccess: (permission: keyof AdminPermissions) => hasPermission(permission),
    checkMultipleAccess: (permissions: (keyof AdminPermissions)[]) => hasAllPermissions(permissions),
    checkAnyAccess: (permissions: (keyof AdminPermissions)[]) => hasAnyPermission(permissions),
  };
};
