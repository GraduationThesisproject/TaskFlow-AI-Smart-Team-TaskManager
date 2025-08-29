import React, { useState } from 'react';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { PermissionGuard } from './PermissionGuard';
import { Button, Card, CardContent, CardHeader, CardTitle, Typography, Badge } from '@taskflow/ui';
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  PuzzlePieceIcon,
  EyeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface TestResult {
  feature: string;
  permission: string;
  expectedAccess: boolean;
  actualAccess: boolean;
  passed: boolean;
}

export const PermissionTestSuite: React.FC = () => {
  const { 
    currentAdmin, 
    getRoleDisplayName, 
    permissions,
    isViewer,
    isModerator,
    isAdmin,
    isSuperAdmin,
    hasPermission
  } = useAdminPermissions();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Define all the permission tests
  const permissionTests: Array<{
    feature: string;
    permission: keyof typeof permissions;
    description: string;
    expectedForViewer: boolean;
    expectedForModerator: boolean;
    expectedForAdmin: boolean;
    expectedForSuperAdmin: boolean;
  }> = [
    {
      feature: "General System Settings",
      permission: "system_settings",
      description: "Access to company name, timezone, theme, and language settings",
      expectedForViewer: false,
      expectedForModerator: false,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Security & Compliance",
      permission: "security_compliance",
      description: "Access to password policies, session management, and 2FA settings",
      expectedForViewer: false,
      expectedForModerator: false,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Admin Management",
      permission: "admin_management",
      description: "Ability to add, edit, and manage admin users",
      expectedForViewer: false,
      expectedForModerator: false,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "User Management",
      permission: "user_management",
      description: "Access to user management and permission settings",
      expectedForViewer: false,
      expectedForModerator: true,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Analytics & Insights",
      permission: "analytics_insights",
      description: "Access to analytics dashboard and reporting",
      expectedForViewer: true,
      expectedForModerator: true,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Integration Management",
      permission: "integration_mgmt",
      description: "Ability to configure third-party integrations",
      expectedForViewer: false,
      expectedForModerator: false,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Notifications & Communications",
      permission: "notifications_comms",
      description: "Access to notification preferences and settings",
      expectedForViewer: true,
      expectedForModerator: true,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Data Export",
      permission: "data_export",
      description: "Ability to export data and generate reports",
      expectedForViewer: false,
      expectedForModerator: false,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    },
    {
      feature: "Profile Settings",
      permission: "profile_settings",
      description: "Access to personal profile and password change",
      expectedForViewer: true,
      expectedForModerator: true,
      expectedForAdmin: true,
      expectedForSuperAdmin: true
    }
  ];

  const runPermissionTests = () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    permissionTests.forEach(test => {
      const actualAccess = hasPermission(test.permission);
      let expectedAccess = false;

      // Determine expected access based on current role
      if (isViewer) {
        expectedAccess = test.expectedForViewer;
      } else if (isModerator) {
        expectedAccess = test.expectedForModerator;
      } else if (isAdmin) {
        expectedAccess = test.expectedForAdmin;
      } else if (isSuperAdmin) {
        expectedAccess = test.expectedForSuperAdmin;
      }

      results.push({
        feature: test.feature,
        permission: test.permission,
        expectedAccess,
        actualAccess,
        passed: expectedAccess === actualAccess
      });
    });

    setTestResults(results);
    setIsRunningTests(false);
  };

  const getExpectedAccessForCurrentRole = (test: typeof permissionTests[0]) => {
    if (isViewer) return test.expectedForViewer;
    if (isModerator) return test.expectedForModerator;
    if (isAdmin) return test.expectedForAdmin;
    if (isSuperAdmin) return test.expectedForSuperAdmin;
    return false;
  };

  if (!currentAdmin) {
    return (
      <div className="p-6 text-center">
        <Typography variant="h4">Please log in to run permission tests</Typography>
      </div>
    );
  }

  const totalTests = permissionTests.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <Typography variant="h3" className="mb-2">
          Permission System Test Suite
        </Typography>
        <Typography variant="body" className="text-gray-600 mb-4">
          Testing permission enforcement for role: <strong>{getRoleDisplayName()}</strong>
        </Typography>
        
        <Button 
          onClick={runPermissionTests}
          disabled={isRunningTests}
          className="mb-6"
        >
          {isRunningTests ? 'Running Tests...' : 'Run Permission Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-green-700 font-medium">{passedTests} Passed</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">{failedTests} Failed</span>
            </div>
            <div className="text-gray-600">
              Total: {totalTests}
            </div>
          </div>
        )}
      </div>

      {/* Current Role & Permissions Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Your Current Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* Permission Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.passed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{result.feature}</h4>
                      <p className="text-sm text-gray-600">Permission: {result.permission}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.passed ? 'success' : 'error'}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </Badge>
                      <div className="text-sm">
                        <span className="text-gray-600">Expected:</span>
                        <span className={`ml-1 ${result.expectedAccess ? 'text-green-600' : 'text-red-600'}`}>
                          {result.expectedAccess ? 'Access' : 'No Access'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Actual:</span>
                        <span className={`ml-1 ${result.actualAccess ? 'text-green-600' : 'text-red-600'}`}>
                          {result.actualAccess ? 'Access' : 'No Access'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Permission Guard Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Live Permission Guard Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* System Settings Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">System Settings Access</h4>
              <PermissionGuard
                requiredPermission="system_settings"
                featureName="System Settings Test"
                actionName="access"
              >
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 inline mr-2" />
                  <span className="text-green-700">Access Granted</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Configure Settings
                </Button>
              </PermissionGuard>
              {!permissions.system_settings && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <LockClosedIcon className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-700">Access Denied</span>
                </div>
              )}
            </div>

            {/* Admin Management Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Admin Management Access</h4>
              <PermissionGuard
                requiredPermission="admin_management"
                featureName="Admin Management Test"
                actionName="access"
              >
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 inline mr-2" />
                  <span className="text-green-700">Access Granted</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Manage Admins
                </Button>
              </PermissionGuard>
              {!permissions.admin_management && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <LockClosedIcon className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-700">Access Denied</span>
                </div>
              )}
            </div>

            {/* User Management Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">User Management Access</h4>
              <PermissionGuard
                requiredPermission="user_management"
                featureName="User Management Test"
                actionName="access"
              >
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 inline mr-2" />
                  <span className="text-green-700">Access Granted</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Manage Users
                </Button>
              </PermissionGuard>
              {!permissions.user_management && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <LockClosedIcon className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-700">Access Denied</span>
                </div>
              )}
            </div>

            {/* Analytics Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Analytics Access</h4>
              <PermissionGuard
                requiredPermission="analytics_insights"
                featureName="Analytics Test"
                actionName="access"
              >
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 inline mr-2" />
                  <span className="text-green-700">Access Granted</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  View Analytics
                </Button>
              </PermissionGuard>
              {!permissions.analytics_insights && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <LockClosedIcon className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-700">Access Denied</span>
                </div>
              )}
            </div>

            {/* Integrations Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Integrations Access</h4>
              <PermissionGuard
                requiredPermission="integration_mgmt"
                featureName="Integrations Test"
                actionName="access"
              >
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 inline mr-2" />
                  <span className="text-green-700">Access Granted</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Configure Integrations
                </Button>
              </PermissionGuard>
              {!permissions.integration_mgmt && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <LockClosedIcon className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-700">Access Denied</span>
                </div>
              )}
            </div>

            {/* Data Export Test */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Data Export Access</h4>
              <PermissionGuard
                requiredPermission="data_export"
                featureName="Data Export Test"
                actionName="access"
              >
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 inline mr-2" />
                  <span className="text-green-700">Access Granted</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Export Data
                </Button>
              </PermissionGuard>
              {!permissions.data_export && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <LockClosedIcon className="h-5 w-5 text-red-500 inline mr-2" />
                  <span className="text-red-700">Access Denied</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${isViewer ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-medium mb-2">Viewer Role</h4>
              <ul className="text-sm space-y-1">
                <li>• Dashboard access</li>
                <li>• Analytics viewing</li>
                <li>• Profile settings</li>
                <li>• Notifications</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg border ${isModerator ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-medium mb-2">Moderator Role</h4>
              <ul className="text-sm space-y-1">
                <li>• All viewer permissions</li>
                <li>• User management</li>
                <li>• Content moderation</li>
                <li>• Basic reporting</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg border ${isAdmin ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-medium mb-2">Admin Role</h4>
              <ul className="text-sm space-y-1">
                <li>• All moderator permissions</li>
                <li>• System settings</li>
                <li>• Admin management</li>
                <li>• Data export</li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg border ${isSuperAdmin ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className="font-medium mb-2">Super Admin</h4>
              <ul className="text-sm space-y-1">
                <li>• All admin permissions</li>
                <li>• Full system access</li>
                <li>• Admin management</li>
                <li>• System backup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
