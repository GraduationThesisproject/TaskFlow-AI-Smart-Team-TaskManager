import React from 'react';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { PermissionGuard, usePermissionDeniedPopup } from './index';
import { Button, Card, CardContent, CardHeader, CardTitle, Typography } from '@taskflow/ui';
import { 
  UserGroupIcon, 
  CogIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export const PermissionDemo: React.FC = () => {
  const { 
    currentAdmin, 
    getRoleDisplayName, 
    permissions,
    isViewer,
    isModerator,
    isAdmin,
    isSuperAdmin
  } = useAdminPermissions();
  
  const { showPopup, hidePopup, isOpen } = usePermissionDeniedPopup();

  const handlePermissionCheck = (feature: string, action: string = 'access') => {
    showPopup({
      featureName: feature,
      actionName: action,
      userRole: getRoleDisplayName(),
      showContactInfo: true
    });
  };

  if (!currentAdmin) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h4">Please log in to see permission demo</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <Typography variant="h3" className="mb-2">
          Permission System Demo
        </Typography>
        <Typography variant="body" className="text-gray-600">
          Welcome, <strong>{currentAdmin.name}</strong> ({getRoleDisplayName()})
        </Typography>
      </div>

      {/* Current Role & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Your Current Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(permissions).map(([permission, allowed]) => (
              <div 
                key={permission}
                className={`p-3 rounded-lg border ${
                  allowed 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="text-sm font-medium capitalize">
                  {permission.replace('_', ' ')}
                </div>
                <div className="text-xs">
                  {allowed ? '✅ Allowed' : '❌ Denied'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Access Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5" />
              <span>User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PermissionGuard 
              requiredPermission="user_management"
              featureName="User Management"
              actionName="access"
            >
              <div className="space-y-2">
                <Button 
                  onClick={() => handlePermissionCheck('User List', 'view')}
                  className="w-full"
                  variant="outline"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Users
                </Button>
                
                <PermissionGuard 
                  requiredPermission="user_management"
                  featureName="User Management"
                  actionName="edit"
                >
                  <Button 
                    onClick={() => handlePermissionCheck('User Management', 'edit')}
                    className="w-full"
                    variant="outline"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Users
                  </Button>
                </PermissionGuard>
                
                <PermissionGuard 
                  requiredPermission="user_management"
                  featureName="User Management"
                  actionName="delete"
                >
                  <Button 
                    onClick={() => handlePermissionCheck('User Management', 'delete')}
                    className="w-full"
                    variant="outline"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Users
                  </Button>
                </PermissionGuard>
              </div>
            </PermissionGuard>
            
            {!permissions.user_management && (
              <div className="text-center text-gray-500">
                <p>You don't have access to user management</p>
                <Button 
                  onClick={() => handlePermissionCheck('User Management')}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  Try to Access
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CogIcon className="w-5 h-5" />
              <span>System Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PermissionGuard 
              requiredPermission="system_settings"
              featureName="System Settings"
              actionName="access"
            >
              <Button 
                onClick={() => handlePermissionCheck('System Settings', 'manage')}
                className="w-full"
                variant="outline"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Manage Settings
              </Button>
            </PermissionGuard>
            
            {!permissions.system_settings && (
              <div className="text-center text-gray-500">
                <p>You don't have access to system settings</p>
                <Button 
                  onClick={() => handlePermissionCheck('System Settings')}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  Try to Access
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PermissionGuard 
              requiredPermission="analytics_insights"
              featureName="Analytics"
              actionName="view"
            >
              <Button 
                onClick={() => handlePermissionCheck('Analytics Dashboard', 'view')}
                className="w-full"
                variant="outline"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </PermissionGuard>
            
            {!permissions.analytics_insights && (
              <div className="text-center text-gray-500">
                <p>You don't have access to analytics</p>
                <Button 
                  onClick={() => handlePermissionCheck('Analytics')}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  Try to Access
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role-Specific Features */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Specific Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isViewer && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Viewer Role Features</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• View dashboard and reports</li>
                  <li>• Read-only access to analytics</li>
                  <li>• View system health status</li>
                  <li>• Access profile settings</li>
                </ul>
              </div>
            )}
            
            {isModerator && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Moderator Role Features</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• All viewer permissions</li>
                  <li>• Moderate users and content</li>
                  <li>• Handle reports</li>
                  <li>• Manage notifications</li>
                </ul>
              </div>
            )}
            
            {isAdmin && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">Admin Role Features</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• All moderator permissions</li>
                  <li>• Full user management</li>
                  <li>• System configuration</li>
                  <li>• Data export capabilities</li>
                </ul>
              </div>
            )}
            
            {isSuperAdmin && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Super Admin Features</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• All admin permissions</li>
                  <li>• Manage other admins</li>
                  <li>• System backup and restore</li>
                  <li>• Full system access</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

            {/* Permission Denied Popup */}
      <PermissionDeniedPopup
        isOpen={isOpen}
        onClose={hidePopup}
        featureName=""
        actionName="access"
        userRole={getRoleDisplayName()}
        showContactInfo={true}
      />
    </div>
  );
};
