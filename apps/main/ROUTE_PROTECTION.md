# Route Protection and Authentication System

## Overview

The TaskFlow frontend now includes a comprehensive route protection system that automatically redirects users based on their authentication status and workspace permissions. This system ensures that users can only access features and pages they have permission to use.

## Architecture

### Core Components

1. **`ProtectedRoute`**: Wraps routes that require authentication and specific permissions
2. **`PublicRoute`**: Wraps routes that should only be accessible to unauthenticated users
3. **`NavigationGuard`**: Protects navigation links based on permissions
4. **`ProtectedLink`**: A Link component that only renders if user has required permissions
5. **`PermissionGuard`**: Conditionally renders UI elements based on permissions

### Hooks

1. **`useAuth`**: Manages authentication state and user data
2. **`usePermissions`**: Provides permission checking functionality
3. **`useRoutePermissions`**: Combines route configuration with permission checking

### Configuration

- **`routes.ts`**: Central route configuration with permission requirements
- **`permissionSlice.ts`**: Redux slice for permission state management
- **`permissionSelectors.ts`**: Redux selectors for efficient permission access

## Route Configuration

Routes are centrally configured in `src/config/routes.ts` with their required permissions:

```typescript
export const ROUTES = {
  // Public routes (no authentication required)
  LANDING: { path: '/*', isPublic: true },
  SIGNIN: { path: '/signin', isPublic: true },
  SIGNUP: { path: '/signup', isPublic: true },

  // Protected routes (authentication required)
  DASHBOARD: { path: '/dashboard/*', requiredRole: 'member' },
  NO_ACCESS: { path: '/no-access' },

  // Workspace routes (require member role)
  WORKSPACE: { path: '/workspace/*', requiredRole: 'member' },
  SPACE: { path: '/space/*', requiredRole: 'member' },
  BOARD: { path: '/board/*', requiredRole: 'member' },

  // Admin routes (require admin or owner role)
  WORKSPACE_SETTINGS: { path: '/workspace/settings', requiredRole: 'admin' },
  WORKSPACE_MEMBERS: { path: '/workspace/members', requiredRole: 'admin' },
  WORKSPACE_BILLING: { path: '/workspace/billing', requiredRole: 'owner' },

  // Owner-only routes
  WORKSPACE_DELETE: { path: '/workspace/delete', requiredRole: 'owner' },
};
```

## Permission Hierarchy

The system uses a role-based permission hierarchy:

```typescript
const roleHierarchy: Record<WorkspaceRole, number> = {
  owner: 3,    // Highest permissions
  admin: 2,    // Can manage members and settings
  member: 1,   // Basic workspace access
};
```

Users with higher roles automatically have access to features available to lower roles.

## Usage Examples

### 1. Protecting Routes in App.tsx

```tsx
import { ProtectedRoute, PublicRoute } from './components';

// Public routes (only for unauthenticated users)
<Route path="/*" element={
  <PublicRoute>
    <LandingPage />
  </PublicRoute>
} />

// Protected routes (require authentication)
<Route path="/dashboard/*" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Role-based protected routes
<Route path="/workspace/*" element={
  <ProtectedRoute requiredRole="member">
    <WorkSpace />
  </ProtectedRoute>
} />

<Route path="/workspace/settings" element={
  <ProtectedRoute requiredRole="admin">
    <WorkspaceSettings />
  </ProtectedRoute>
} />

<Route path="/workspace/billing" element={
  <ProtectedRoute requiredRole="owner">
    <BillingPage />
  </ProtectedRoute>
} />
```

### 2. Protecting UI Elements

```tsx
import { PermissionGuard } from './components';

// Role-based protection
<PermissionGuard requiredRole="admin">
  <Button onClick={deleteWorkspace}>Delete Workspace</Button>
</PermissionGuard>

// Permission-based protection
<PermissionGuard requiredPermission="canManageMembers">
  <Button onClick={inviteMembers}>Invite Members</Button>
</PermissionGuard>

// With fallback content
<PermissionGuard requiredRole="owner" fallback={<p>Only owners can access this feature</p>}>
  <Button onClick={transferOwnership}>Transfer Ownership</Button>
</PermissionGuard>
```

### 3. Protecting Navigation Links

```tsx
import { ProtectedLink, NavigationGuard } from './components';
import { ROUTES } from './config/routes';

// Using ProtectedLink
<ProtectedLink to="/workspace/settings" routeKey="WORKSPACE_SETTINGS">
  Settings
</ProtectedLink>

// Using NavigationGuard
<NavigationGuard routeKey="WORKSPACE_BILLING">
  <Link to="/workspace/billing">Billing</Link>
</NavigationGuard>

// With fallback
<NavigationGuard routeKey="WORKSPACE_DELETE" fallback={<span>Delete (Admin Only)</span>}>
  <Link to="/workspace/delete">Delete Workspace</Link>
</NavigationGuard>
```

### 4. Using Permission Hooks

```tsx
import { usePermissions, useRoutePermissions } from './hooks';

const MyComponent = () => {
  const { userRole, hasPermission, permissions } = usePermissions();
  const { canAccessCurrentRoute, accessibleRoutes } = useRoutePermissions();

  // Check specific permissions
  if (hasPermission('admin')) {
    // Admin-only logic
  }

  // Check specific permission
  if (permissions.canManageMembers) {
    // Can manage members
  }

  // Check route access
  if (canAccessCurrentRoute) {
    // User can access current route
  }

  return (
    <div>
      {userRole && <p>Your role: {userRole}</p>}
      {permissions.canInvite && <Button>Invite User</Button>}
    </div>
  );
};
```

## Automatic Redirection

The system automatically handles redirections based on user state:

### Unauthenticated Users
- **Action**: Redirected to landing page (`/`)
- **Use Case**: When trying to access protected routes

### Insufficient Permissions
- **Action**: Redirected to "No Access" page (`/no-access`)
- **Use Case**: When authenticated but lacking required role/permissions

### Authenticated Users on Public Pages
- **Action**: Redirected to dashboard (`/dashboard`)
- **Use Case**: When accessing login/signup pages while already authenticated

## Error Handling

### No Access Page
When users lack permissions, they're redirected to a dedicated "No Access" page that:
- Shows what page they were trying to access
- Provides navigation options (Dashboard, Home)
- Explains why access was denied

### Loading States
During authentication checks, users see loading spinners to prevent UI flickering.

## Integration with Existing Components

### Example: Dashboard Home Layout

```tsx
// Before: No permission checking
<Button variant="default">+ New</Button>

// After: Permission-based rendering
<PermissionGuard requiredRole="admin">
  <Button variant="default">+ New</Button>
</PermissionGuard>
```

### Example: Navigation Menu

```tsx
// Before: All links visible
<Link to="/workspace/settings">Settings</Link>
<Link to="/workspace/billing">Billing</Link>

// After: Permission-based navigation
<ProtectedLink to="/workspace/settings" routeKey="WORKSPACE_SETTINGS">
  Settings
</ProtectedLink>
<ProtectedLink to="/workspace/billing" routeKey="WORKSPACE_BILLING">
  Billing
</ProtectedLink>
```

## Best Practices

1. **Use Route Configuration**: Always define routes in `routes.ts` for consistency
2. **Check Permissions Early**: Use `useRoutePermissions` to check access before rendering
3. **Provide Fallbacks**: Always provide meaningful fallback content for denied permissions
4. **Test Different Roles**: Ensure all permission levels work correctly
5. **Handle Loading States**: Show appropriate loading indicators during permission checks

## Security Considerations

- All permission checks happen on the client-side for UX purposes
- Server-side validation is still required for all API calls
- Token-based authentication ensures secure session management
- Role hierarchy prevents privilege escalation
- Automatic logout on token expiration

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check that `PublicRoute` and `ProtectedRoute` aren't conflicting
2. **Permission Not Working**: Verify the user has the correct role in the workspace
3. **Route Not Found**: Ensure the route is properly configured in `routes.ts`
4. **Loading Forever**: Check that authentication state is properly initialized

### Debug Mode

Enable debug logging by setting `localStorage.setItem('debug-permissions', 'true')` to see permission checks in the console.
