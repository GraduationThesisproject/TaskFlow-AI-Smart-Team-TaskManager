import React from 'react';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { usePermissionDeniedPopup } from './index';
import { Button } from '@taskflow/ui';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  requiredPermission: string;
  featureName: string;
  actionName?: string;
  fallback?: React.ReactNode;
  showAccessButton?: boolean;
  className?: string;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  children,
  requiredPermission,
  featureName,
  actionName = 'access',
  fallback = null,
  showAccessButton = true,
  className = ''
}) => {
  const { hasPermission, getRoleDisplayName } = useAdminPermissions();
  const { showPopup } = usePermissionDeniedPopup();

  const handleAccessAttempt = () => {
    showPopup({
      featureName,
      actionName,
      userRole: getRoleDisplayName(),
      showContactInfo: true
    });
  };

  if (hasPermission(requiredPermission as any)) {
    return <div className={className}>{children}</div>;
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={`${className} text-center p-4 bg-gray-50 rounded-lg border border-gray-200`}>
      <div className="flex items-center justify-center space-x-2 text-gray-500 mb-3">
        <LockClosedIcon className="w-5 h-5" />
        <span className="font-medium">Access Restricted</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        You don't have permission to {actionName} <strong>{featureName}</strong>.
      </p>
      
      {showAccessButton && (
        <Button 
          onClick={handleAccessAttempt}
          variant="outline"
          size="sm"
        >
          Request Access
        </Button>
      )}
    </div>
  );
};

// Higher-order component for protecting features
export const withFeatureProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ProtectedFeatureProps, 'children'>
) => {
  const WithFeatureProtectionComponent: React.FC<P> = (props) => (
    <ProtectedFeature {...options}>
      <WrappedComponent {...props} />
    </ProtectedFeature>
  );

  WithFeatureProtectionComponent.displayName = `withFeatureProtection(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithFeatureProtectionComponent;
};

// Hook for checking if a feature is accessible
export const useFeatureAccess = (requiredPermission: string) => {
  const { hasPermission, getRoleDisplayName } = useAdminPermissions();
  const { showPopup } = usePermissionDeniedPopup();

  const checkAccess = (featureName: string, actionName: string = 'access') => {
    if (!hasPermission(requiredPermission as any)) {
      showPopup({
        featureName,
        actionName,
        userRole: getRoleDisplayName(),
        showContactInfo: true
      });
      return false;
    }
    return true;
  };

  return {
    hasAccess: hasPermission(requiredPermission as any),
    checkAccess,
    requiredPermission
  };
};
