import React from 'react';
import { 
  PermissionGuard, 
  ProtectedFeature, 
  useFeatureAccess,
  useAdminPermissions 
} from './index';
import type { AdminPermissions } from '../../hooks/useAdminPermissions';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import { 
  UserGroupIcon, 
  CogIcon, 
  ChartBarIcon, 
  TrashIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Example 1: Using PermissionGuard for conditional rendering
export const UserManagementSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserGroupIcon className="w-5 h-5" />
          <span>User Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PermissionGuard 
          requiredPermission="user_management"
          featureName="User Management"
          actionName="access"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">
                <EyeIcon className="w-4 h-4 mr-2" />
                View Users
              </Button>
              
              <PermissionGuard 
                requiredPermission="user_management"
                featureName="User Management"
                actionName="edit"
              >
                <Button variant="outline" className="w-full">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Users
                </Button>
              </PermissionGuard>
              
              <PermissionGuard 
                requiredPermission="user_management"
                featureName="User Management"
                actionName="delete"
              >
                <Button variant="outline" className="w-full">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Users
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </PermissionGuard>
      </CardContent>
    </Card>
  );
};

// Example 2: Using ProtectedFeature with fallbacks
export const SystemSettingsSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CogIcon className="w-5 h-5" />
          <span>System Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProtectedFeature
          requiredPermission="system_settings"
          featureName="System Settings"
          actionName="manage"
          fallback={
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium mb-2">
                System Settings Access Required
              </p>
              <p className="text-yellow-700 text-sm">
                Only administrators can access system settings.
              </p>
            </div>
          }
        >
          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              General Settings
            </Button>
            <Button variant="outline" className="w-full">
              Security Configuration
            </Button>
            <Button variant="outline" className="w-full">
              Backup Settings
            </Button>
          </div>
        </ProtectedFeature>
      </CardContent>
    </Card>
  );
};

// Example 3: Using useFeatureAccess hook for action-based permissions
export const AnalyticsSection: React.FC = () => {
  const { hasAccess, checkAccess } = useFeatureAccess('analytics_insights');

  const handleViewAnalytics = () => {
    if (checkAccess('Analytics Dashboard', 'view')) {
      // Proceed with analytics view
      console.log('Opening analytics dashboard...');
    }
    // Permission denied popup will show automatically if access is denied
  };

  const handleExportData = () => {
    if (checkAccess('Analytics Data', 'export')) {
      // Proceed with data export
      console.log('Exporting analytics data...');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5" />
          <span>Analytics & Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleViewAnalytics}
            variant="outline" 
            className="w-full"
            disabled={!hasAccess}
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          
          <ProtectedFeature
            requiredPermission="data_export"
            featureName="Data Export"
            actionName="perform"
            showAccessButton={true}
          >
            <Button 
              onClick={handleExportData}
              variant="outline" 
              className="w-full"
            >
              Export Data
            </Button>
          </ProtectedFeature>
        </div>
      </CardContent>
    </Card>
  );
};

// Example 4: Role-based conditional rendering
export const RoleBasedDashboard: React.FC = () => {
  const { isViewer, isModerator, isAdmin, isSuperAdmin } = useAdminPermissions();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
        <p className="text-gray-600">
          Your role determines what you can see and do in this panel.
        </p>
      </div>

      {/* Viewer-specific content */}
      {isViewer && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Viewer Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              As a viewer, you have read-only access to reports and analytics.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Moderator-specific content */}
      {isModerator && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Moderator Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              As a moderator, you can manage users and content, plus view reports.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Admin-specific content */}
      {isAdmin && (
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700">
              As an admin, you have full system management capabilities.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Super Admin-specific content */}
      {isSuperAdmin && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Super Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              As a super admin, you have complete system access and can manage other admins.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Common sections for all roles */}
      <UserManagementSection />
      <SystemSettingsSection />
      <AnalyticsSection />
    </div>
  );
};

// Example 5: Using withPermission HOC
const AdminManagementPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This panel is only visible to users with admin management permissions.</p>
        <Button variant="outline" className="mt-4">
          Manage Admins
        </Button>
      </CardContent>
    </Card>
  );
};

// Wrap with permission check
export const ProtectedAdminManagement = withPermission(AdminManagementPanel, {
  requiredPermission: 'admin_management',
  featureName: 'Admin Management',
  actionName: 'access'
});

// Main integration example
export const PermissionIntegrationExample: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Permission System Integration Examples
      </h1>
      
      <RoleBasedDashboard />
      
      <ProtectedAdminManagement />
    </div>
  );
};

// Helper function to wrap components with permission checks
function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    requiredPermission: keyof AdminPermissions;
    featureName: string;
    actionName?: string;
  }
) {
  const WithPermissionComponent: React.FC<P> = (props) => (
    <PermissionGuard {...options}>
      <WrappedComponent {...props} />
    </PermissionGuard>
  );

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithPermissionComponent;
}
