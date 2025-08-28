import { useMemo } from 'react';
import { useAppSelector } from '../store';

export interface AdminPermission {
  name: string;
  description: string;
  allowed: boolean;
}

export interface AdminPermissions {
  // Core permissions
  user_management: boolean;
  admin_management: boolean;
  system_settings: boolean;
  data_export: boolean;
  audit_logs: boolean;
  backup_restore: boolean;
  
  // Feature-specific permissions
  dashboard_overview: boolean;
  templates_configs: boolean;
  analytics_insights: boolean;
  system_health: boolean;
  integration_mgmt: boolean;
  notifications_comms: boolean;
  powerbi_integration: boolean;
  customer_support: boolean;
  profile_settings: boolean;
  security_compliance: boolean;
  deployment_env: boolean;
  
  // Content moderation
  content_moderation: boolean;
  reports: boolean;
}

export const useAdminPermissions = () => {
  const { currentAdmin } = useAppSelector(state => state.admin);

  const permissions = useMemo((): AdminPermissions => {
    if (!currentAdmin) {
      return {
        user_management: false,
        admin_management: false,
        system_settings: false,
        data_export: false,
        audit_logs: false,
        backup_restore: false,
        dashboard_overview: false,
        templates_configs: false,
        analytics_insights: false,
        system_health: false,
        integration_mgmt: false,
        notifications_comms: false,
        powerbi_integration: false,
        customer_support: false,
        profile_settings: false,
        security_compliance: false,
        deployment_env: false,
        content_moderation: false,
        reports: false,
      };
    }

    // Convert admin permissions array to object
    const permissionMap = currentAdmin.permissions.reduce((acc, perm) => {
      acc[perm.name as keyof AdminPermissions] = perm.allowed;
      return acc;
    }, {} as Partial<AdminPermissions>);

    // Set default permissions based on role if not explicitly set
    const defaultPermissions = getDefaultPermissionsForRole(currentAdmin.role);
    
    return {
      ...defaultPermissions,
      ...permissionMap,
    };
  }, [currentAdmin]);

  const hasPermission = (permissionName: keyof AdminPermissions): boolean => {
    return permissions[permissionName] || false;
  };

  const hasAnyPermission = (permissionNames: (keyof AdminPermissions)[]): boolean => {
    return permissionNames.some(name => permissions[name]);
  };

  const hasAllPermissions = (permissionNames: (keyof AdminPermissions)[]): boolean => {
    return permissionNames.every(name => permissions[name]);
  };

  const canAccessFeature = (feature: keyof AdminPermissions): boolean => {
    return hasPermission(feature);
  };

  const getRoleDisplayName = (): string => {
    if (!currentAdmin) return 'Unknown';
    
    const roleNames = {
      'super_admin': 'Super Administrator',
      'admin': 'System Administrator',
      'moderator': 'Content Moderator',
      'viewer': 'Read-Only Viewer'
    };
    
    return roleNames[currentAdmin.role] || currentAdmin.role;
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessFeature,
    getRoleDisplayName,
    currentAdmin,
    isViewer: currentAdmin?.role === 'viewer',
    isModerator: currentAdmin?.role === 'moderator',
    isAdmin: currentAdmin?.role === 'admin',
    isSuperAdmin: currentAdmin?.role === 'super_admin',
  };
};

// Helper function to get default permissions for each role
function getDefaultPermissionsForRole(role: string): AdminPermissions {
  const basePermissions: AdminPermissions = {
    user_management: false,
    admin_management: false,
    system_settings: false,
    data_export: false,
    audit_logs: false,
    backup_restore: false,
    dashboard_overview: false,
    templates_configs: false,
    analytics_insights: false,
    system_health: false,
    integration_mgmt: false,
    notifications_comms: false,
    powerbi_integration: false,
    customer_support: false,
    profile_settings: false,
    security_compliance: false,
    deployment_env: false,
    content_moderation: false,
    reports: false,
  };

  switch (role) {
    case 'super_admin':
      return {
        ...basePermissions,
        user_management: true,
        admin_management: true,
        system_settings: true,
        data_export: true,
        audit_logs: true,
        backup_restore: true,
        dashboard_overview: true,
        templates_configs: true,
        analytics_insights: true,
        system_health: true,
        integration_mgmt: true,
        notifications_comms: true,
        powerbi_integration: true,
        customer_support: true,
        profile_settings: true,
        security_compliance: true,
        deployment_env: true,
        content_moderation: true,
        reports: true,
      };

    case 'admin':
      return {
        ...basePermissions,
        user_management: true,
        admin_management: true,
        system_settings: true,
        data_export: true,
        audit_logs: true,
        dashboard_overview: true,
        templates_configs: true,
        analytics_insights: true,
        system_health: true,
        integration_mgmt: true,
        notifications_comms: true,
        powerbi_integration: true,
        customer_support: true,
        profile_settings: true,
        security_compliance: true,
        content_moderation: true,
        reports: true,
      };

    case 'moderator':
      return {
        ...basePermissions,
        user_management: true,
        content_moderation: true,
        reports: true,
        dashboard_overview: true,
        templates_configs: true,
        analytics_insights: true,
        system_health: true,
        notifications_comms: true,
        powerbi_integration: true,
        customer_support: true,
        profile_settings: true,
      };

    case 'viewer':
      return {
        ...basePermissions,
        dashboard_overview: true,
        reports: true,
        analytics_insights: true,
        system_health: true,
        profile_settings: true,
      };

    default:
      return basePermissions;
  }
}
