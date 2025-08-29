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

    // Set default permissions based on role
    const defaultPermissions = getDefaultPermissionsForRole(currentAdmin.role);
    
    // If admin has explicit permissions, merge them with defaults
    if (currentAdmin.permissions && currentAdmin.permissions.length > 0) {
      const permissionMap = currentAdmin.permissions.reduce((acc, perm) => {
        // Check if the permission name matches our permission system
        const permissionKey = perm.name as keyof AdminPermissions;
        if (permissionKey in defaultPermissions) {
          acc[permissionKey] = perm.allowed !== false; // Default to true unless explicitly denied
        }
        return acc;
      }, {} as Partial<AdminPermissions>);
      
      return {
        ...defaultPermissions,
        ...permissionMap,
      };
    }
    
    return defaultPermissions;
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
      'admin': 'Administrator',
      'moderator': 'Moderator',
      'viewer': 'Viewer',
    };
    
    return roleNames[currentAdmin.role] || 'Unknown Role';
  };

  const getRoleLevel = (): number => {
    if (!currentAdmin) return 0;
    
    const roleLevels = {
      'super_admin': 4,
      'admin': 3,
      'moderator': 2,
      'viewer': 1,
    };
    
    return roleLevels[currentAdmin.role] || 0;
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessFeature,
    getRoleDisplayName,
    getRoleLevel,
    currentAdmin,
    isSuperAdmin: currentAdmin?.role === 'super_admin',
    isAdmin: currentAdmin?.role === 'admin' || currentAdmin?.role === 'super_admin',
    isModerator: currentAdmin?.role === 'moderator' || currentAdmin?.role === 'admin' || currentAdmin?.role === 'super_admin',
    isViewer: currentAdmin?.role === 'viewer',
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
        backup_restore: false, // Admins cannot backup/restore
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
        deployment_env: false, // Admins cannot access deployment
        content_moderation: true,
        reports: true,
      };

    case 'moderator':
      return {
        ...basePermissions,
        user_management: true,
        admin_management: false,
        system_settings: false,
        data_export: false,
        audit_logs: false,
        backup_restore: false,
        dashboard_overview: true,
        templates_configs: true,
        analytics_insights: true,
        system_health: true,
        integration_mgmt: false,
        notifications_comms: true,
        powerbi_integration: true,
        customer_support: true,
        profile_settings: true,
        security_compliance: false,
        deployment_env: false,
        content_moderation: true,
        reports: true,
      };

    case 'viewer':
      return {
        ...basePermissions,
        user_management: false,
        admin_management: false,
        system_settings: false,
        data_export: false,
        audit_logs: false,
        backup_restore: false,
        dashboard_overview: true,
        templates_configs: false,
        analytics_insights: true,
        system_health: true,
        integration_mgmt: false,
        notifications_comms: false,
        powerbi_integration: true,
        customer_support: false,
        profile_settings: true,
        security_compliance: false,
        deployment_env: false,
        content_moderation: false,
        reports: true,
      };

    default:
      return basePermissions;
  }
}
