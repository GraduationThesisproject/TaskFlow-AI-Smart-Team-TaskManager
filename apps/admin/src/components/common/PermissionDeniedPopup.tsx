import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Typography, Button } from '@taskflow/ui';
import { ShieldExclamationIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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
              {customMessage || `You don't have permission to ${getActionText()} ${featureName}.`}
            </Typography>
            
            {userRole && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <LockClosedIcon className="w-4 h-4" />
                  <span>Current Role: <strong>{userRole}</strong></span>
                </div>
              </div>
            )}
            
            {roleComparison && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Typography variant="body-small" className="text-blue-700">
                  {roleComparison.message}
                </Typography>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Contact your system administrator if you need access to this feature.</p>
            <p>Your current role has limited permissions for security reasons.</p>
          </div>
          
          {showContactInfo && (
            <div className="text-xs text-gray-400">
              <p>Need help? Contact: admin@taskflow.ai</p>
            </div>
          )}
          
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
