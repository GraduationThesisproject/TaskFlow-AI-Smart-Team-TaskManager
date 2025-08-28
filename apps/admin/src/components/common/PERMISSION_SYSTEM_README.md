# Admin Permission System

This document explains how to use the permission system in the TaskFlow Admin Panel to control access to different features based on admin roles.

## 🏗️ Architecture Overview

The permission system consists of several components:

- **`useAdminPermissions`** - Hook for checking permissions
- **`PermissionGuard`** - Component wrapper for conditional rendering
- **`ProtectedFeature`** - Component for protecting features with fallbacks
- **`PermissionDeniedPopup`** - User-friendly popup for denied access
- **`withPermission`** - Higher-order component for permission checks

## 🔐 Admin Roles & Permissions

### Role Hierarchy
1. **Super Admin** - Full system access
2. **Admin** - System administration (no super admin management)
3. **Moderator** - Content moderation and user oversight
4. **Viewer** - Read-only access to dashboard and reports

### Default Permissions by Role

| Permission | Super Admin | Admin | Moderator | Viewer |
|------------|-------------|-------|-----------|---------|
| `dashboard_overview` | ✅ | ✅ | ✅ | ✅ |
| `user_management` | ✅ | ✅ | ✅ | ❌ |
| `admin_management` | ✅ | ✅ | ❌ | ❌ |
| `system_settings` | ✅ | ✅ | ❌ | ❌ |
| `data_export` | ✅ | ✅ | ❌ | ❌ |
| `audit_logs` | ✅ | ✅ | ❌ | ❌ |
| `backup_restore` | ✅ | ❌ | ❌ | ❌ |
| `content_moderation` | ✅ | ✅ | ✅ | ❌ |
| `reports` | ✅ | ✅ | ✅ | ✅ |

## 🚀 Usage Examples

### 1. Basic Permission Check

```tsx
import { useAdminPermissions } from '../hooks/useAdminPermissions';

const MyComponent = () => {
  const { hasPermission, isViewer, isAdmin } = useAdminPermissions();

  if (hasPermission('user_management')) {
    return <UserManagementPanel />;
  }

  return <AccessDeniedMessage />;
};
```

### 2. Using PermissionGuard Component

```tsx
import { PermissionGuard } from '../components/common';

const UserManagementPage = () => {
  return (
    <div>
      <h1>User Management</h1>
      
      <PermissionGuard 
        requiredPermission="user_management"
        featureName="User Management"
        actionName="access"
      >
        <UserList />
        <UserCreateForm />
      </PermissionGuard>
      
      <PermissionGuard 
        requiredPermission="admin_management"
        featureName="Admin Management"
        actionName="access"
      >
        <AdminList />
      </PermissionGuard>
    </div>
  );
};
```

### 3. Using ProtectedFeature Component

```tsx
import { ProtectedFeature } from '../components/common';

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Always visible */}
      <DashboardOverview />
      
      {/* Protected with fallback */}
      <ProtectedFeature
        requiredPermission="user_management"
        featureName="User Statistics"
        actionName="view"
        fallback={<UserStatsPlaceholder />}
      >
        <UserStatistics />
      </ProtectedFeature>
      
      {/* Protected without fallback */}
      <ProtectedFeature
        requiredPermission="system_settings"
        featureName="System Configuration"
        actionName="manage"
        showAccessButton={true}
      >
        <SystemSettings />
      </ProtectedFeature>
    </div>
  );
};
```

### 4. Using Higher-Order Components

```tsx
import { withPermission } from '../components/common';

const UserManagementPanel = () => {
  return (
    <div>
      <h2>User Management</h2>
      {/* Component content */}
    </div>
  );
};

// Wrap with permission check
export default withPermission(UserManagementPanel, {
  requiredPermission: 'user_management',
  featureName: 'User Management',
  actionName: 'access'
});
```

### 5. Using Permission Hooks

```tsx
import { useFeatureAccess } from '../components/common';

const UserActions = () => {
  const { hasAccess, checkAccess } = useFeatureAccess('user_management');

  const handleEditUser = () => {
    if (checkAccess('User Management', 'edit')) {
      // Proceed with edit
      editUser();
    }
    // Permission denied popup will show automatically
  };

  return (
    <div>
      {hasAccess ? (
        <button onClick={handleEditUser}>Edit User</button>
      ) : (
        <span>No edit permission</span>
      )}
    </div>
  );
};
```

## 🎯 Best Practices

### 1. Always Check Permissions
```tsx
// ❌ Don't do this
const handleDelete = () => {
  deleteUser(); // No permission check
};

// ✅ Do this instead
const handleDelete = () => {
  if (checkAccess('User Management', 'delete')) {
    deleteUser();
  }
};
```

### 2. Use Appropriate Fallbacks
```tsx
// ❌ Don't show nothing
<PermissionGuard requiredPermission="admin_management">
  <AdminPanel />
</PermissionGuard>

// ✅ Show helpful message
<PermissionGuard 
  requiredPermission="admin_management"
  fallback={<AdminAccessRequired />}
>
  <AdminPanel />
</PermissionGuard>
```

### 3. Provide Clear Feature Names
```tsx
// ❌ Vague
<PermissionGuard requiredPermission="user_management">
  <Component />
</PermissionGuard>

// ✅ Clear and specific
<PermissionGuard 
  requiredPermission="user_management"
  featureName="User Management Dashboard"
  actionName="view"
>
  <Component />
</PermissionGuard>
```

### 4. Handle Multiple Permissions
```tsx
// Check if user has ALL required permissions
<PermissionGuard 
  requiredPermissions={['user_management', 'data_export']}
  featureName="User Data Export"
  actionName="perform"
>
  <ExportButton />
</PermissionGuard>

// Check if user has ANY of the permissions
const { hasAnyPermission } = useAdminPermissions();
if (hasAnyPermission(['user_management', 'admin_management'])) {
  // Show user management features
}
```

## 🔧 Customization

### Custom Permission Messages
```tsx
const { showPopup } = usePermissionDeniedPopup();

const handleCustomAccess = () => {
  showPopup({
    featureName: 'Advanced Analytics',
    actionName: 'access',
    customMessage: 'This feature requires special training and approval.',
    userRole: 'Viewer',
    showContactInfo: true
  });
};
```

### Role-Based UI Adjustments
```tsx
const { isViewer, isModerator, isAdmin } = useAdminPermissions();

return (
  <div>
    {isViewer && <ViewerDashboard />}
    {isModerator && <ModeratorDashboard />}
    {isAdmin && <AdminDashboard />}
  </div>
);
```

## 🚨 Error Handling

### Permission Denied Popup
The system automatically shows a user-friendly popup when:
- User tries to access a restricted feature
- User clicks on a protected button
- Component renders without proper permissions

### Fallback Content
Always provide fallback content for better UX:
```tsx
<ProtectedFeature
  requiredPermission="system_settings"
  featureName="System Settings"
  fallback={
    <div className="text-center p-4 text-gray-500">
      <p>System settings are restricted to administrators.</p>
      <p>Contact your admin for access.</p>
    </div>
  }
>
  <SystemSettings />
</ProtectedFeature>
```

## 📱 Testing Permissions

### Demo Component
Use the `PermissionDemo` component to test different permission scenarios:

```tsx
import { PermissionDemo } from '../components/common';

// Add to your admin panel for testing
<Route path="/permissions" element={<PermissionDemo />} />
```

### Testing Different Roles
1. Login as different admin users (viewer, moderator, admin, super_admin)
2. Navigate to protected features
3. Verify permission denied popups appear correctly
4. Check that fallback content displays appropriately

## 🔒 Security Notes

- **Frontend Only**: This permission system is for UI control only
- **Backend Validation**: Always validate permissions on the backend
- **Token Security**: Ensure admin tokens are properly secured
- **Role Verification**: Verify admin roles on every request

## 📚 Related Components

- `useAdminPermissions` - Main permission hook
- `PermissionGuard` - Conditional rendering wrapper
- `ProtectedFeature` - Feature protection with fallbacks
- `PermissionDeniedPopup` - Access denied popup
- `withPermission` - HOC for permission checks
- `useFeatureAccess` - Feature access hook
- `PermissionDemo` - Demo and testing component
