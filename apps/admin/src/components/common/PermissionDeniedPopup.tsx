import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Typography } from '@taskflow/ui';
import { ShieldExclamationIcon, LockClosedIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface PermissionDeniedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  actionName?: string;
  userRole?: string;
  requiredRole?: string;
  customMessage?: string;
  showContactInfo?: boolean;
}

export const PermissionDeniedPopup: React.FC<PermissionDeniedPopupProps> = ({
  isOpen,
  onClose,
  featureName,
  actionName = 'access',
  userRole,
  requiredRole,
  customMessage,
  showContactInfo = true
}) => {
  if (!isOpen) return null;

  const getActionText = () => {
    switch (actionName) {
      case 'create':
        return 'create';
      case 'edit':
        return 'edit';
      case 'delete':
        return 'delete';
      case 'manage':
        return 'manage';
      case 'view':
        return 'view';
      default:
        return 'access';
    }
  };

  const getRoleComparison = () => {
    if (!userRole || !requiredRole) return null;
    
    const roleHierarchy = {
      'super_admin': 4,
      'admin': 3,
      'moderator': 2,
      'viewer': 1
    };
    
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    if (userLevel < requiredLevel) {
      return {
        type: 'upgrade' as const,
        message: `You need at least ${requiredRole} role to access this feature.`
      };
    }
    
    return null;
  };

  const roleComparison = getRoleComparison();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            Access Denied
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="space-y-3">
            {customMessage ? (
              <Typography variant="body" className="text-gray-600">
                {customMessage}
              </Typography>
            ) : (
              <Typography variant="body" className="text-gray-600">
                You don't have permission to {getActionText()} <strong>{featureName}</strong>.
              </Typography>
            )}
            
            {userRole && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <LockClosedIcon className="w-4 h-4" />
                  <span>Current Role: <strong>{userRole}</strong></span>
                </div>
              </div>
            )}
            
            {roleComparison && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                  <InformationCircleIcon className="w-4 h-4" />
                  <span>{roleComparison.message}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 space-y-2">
            <p>This feature requires additional permissions for security reasons.</p>
            
            {showContactInfo && (
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-yellow-700 text-sm">
                  <strong>Need access?</strong> Contact your system administrator to request permission.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-2">
            <Button 
              onClick={onClose}
              className="flex-1"
              variant="outline"
            >
              Got it
            </Button>
            
            {showContactInfo && (
              <Button 
                onClick={() => {
                  // You can implement contact admin functionality here
                  onClose();
                }}
                className="flex-1"
                variant="default"
              >
                Contact Admin
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for managing permission denied popup state
export const usePermissionDeniedPopup = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [popupConfig, setPopupConfig] = React.useState<Omit<PermissionDeniedPopupProps, 'isOpen' | 'onClose'>>({
    featureName: '',
    actionName: 'access',
    userRole: '',
    customMessage: '',
    showContactInfo: true
  });

  const showPopup = (config: Omit<PermissionDeniedPopupProps, 'isOpen' | 'onClose'>) => {
    setPopupConfig(config);
    setIsOpen(true);
  };

  const hidePopup = () => setIsOpen(false);

  return {
    isOpen,
    popupConfig,
    showPopup,
    hidePopup
  };
};
