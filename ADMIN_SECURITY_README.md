# Admin Security System - TaskFlow AI

## Overview

The Admin Security System provides comprehensive role-based access control (RBAC) for managing **admin panel users** in TaskFlow AI. This system is completely separate from the regular app user system.

**Key Separation:**
- **Regular App Users**: Normal users of the TaskFlow application (managed separately)
- **Admin Panel Users**: Users who can access and control the admin panel (managed here)

When you add an email in the security settings, it creates an **admin panel user only** - this user will NOT automatically become a regular app user.

## Features

### 🔐 Role-Based Access Control
- **Super Admin**: Complete system access with all permissions
- **Admin**: Full admin access with most permissions (cannot manage other admins)
- **Moderator**: Basic admin access with limited permissions

### 🛡️ Security Features
- Automatic Admin model creation when adding admin users
- Permission-based access control
- User activation/deactivation
- Role assignment and management
- Secure password requirements
- Audit logging

## Architecture

### Backend Models

#### User Model (`apps/backend/src/models/User.js`)
- **Regular app users only** - NOT admin panel users
- Core user information (name, email, password)
- Workspace, space, and board access
- **Separate from admin panel system**

#### UserRoles Model (`apps/backend/src/models/UserRoles.js`)
- **Regular app user roles** (workspace, space, board-specific)
- **NOT used for admin panel access**
- Granular permission management for app features

#### Admin Model (`apps/backend/src/models/Admin.js`)
- **Admin panel access control ONLY**
- Two types of admin users:
  1. **Regular users with admin privileges** (userId references User model)
  2. **Admin-only users** (no User model, direct admin access)
- Role-specific permissions for admin panel
- Activity tracking

### Permission Matrix

| Permission | Super Admin | Admin | Moderator |
|------------|-------------|-------|-----------|
| `manageUsers` | ✅ | ✅ | ✅ |
| `manageWorkspaces` | ✅ | ✅ | ❌ |
| `manageTemplates` | ✅ | ✅ | ❌ |
| `viewAnalytics` | ✅ | ✅ | ✅ |
| `systemSettings` | ✅ | ✅ | ❌ |
| `manageAdmins` | ✅ | ❌ | ❌ |
| `viewSystemLogs` | ✅ | ✅ | ✅ |
| `manageQuotas` | ✅ | ✅ | ❌ |
| `manageAIJobs` | ✅ | ✅ | ❌ |

## Usage

### Adding Admin Panel Users

1. **Navigate to Security Settings**
   - Go to Admin Panel → Settings → Security tab

2. **Click "Add Admin User"**
   - Fill in username, email, and password
   - Select appropriate role
   - Submit the form

3. **Automatic Setup**
   - **Admin panel user is created** (NOT a regular app user)
   - Admin model is automatically created with role-specific permissions
   - User can immediately access admin panel
   - **This user will NOT have access to regular app features**

**Important**: Adding an email here creates an admin panel user only. This user cannot access workspaces, tasks, or other app features unless they are also created as regular users separately.

### Managing Existing Users

- **Edit Roles**: Change user roles and permissions
- **Activate/Deactivate**: Enable or disable admin access
- **View Permissions**: See what each user can access

## API Endpoints

### Admin User Management

```http
POST /api/admin/users/add-with-email
{
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "role": "moderator"
}
```

```http
PATCH /api/admin/users/:userId/role
{
  "newRole": "admin"
}
```

```http
POST /api/admin/users/:userId/ban      # Deactivate
POST /api/admin/users/:userId/activate # Activate
```

### Role Information

```http
GET /api/admin/users/available-roles
```

## Frontend Components

### SecuritySettings Component
- **Location**: `apps/admin/src/components/security/SecuritySettings.tsx`
- **Features**: 
  - Admin user management
  - Role assignment
  - User activation/deactivation
  - Permission overview

### Integration
- **Settings Layout**: `apps/admin/src/layouts/SettingsLayout.tsx`
- **Admin Service**: `apps/admin/src/services/adminService.ts`

## System Separation

### 🔄 Two Separate Systems

#### 1. **Regular App User System**
- **Purpose**: Normal TaskFlow application users
- **Access**: Workspaces, tasks, boards, app features
- **Management**: Separate user management system
- **Models**: User, UserRoles, Workspace, etc.

#### 2. **Admin Panel System**
- **Purpose**: Admin panel access and control
- **Access**: Admin panel features, system settings, user management
- **Management**: This security system
- **Models**: Admin model only

**No Cross-Contamination**: Adding an email in security settings does NOT create a regular app user.

## Security Considerations

### 🔒 Access Control
- Only existing admins can add new admin panel users
- Role hierarchy enforcement
- Permission-based API access
- Complete separation from regular app user system

### 🚫 Restrictions
- Regular users cannot access admin panel
- Admins cannot manage super admins
- Moderators have limited system access

### 📝 Audit Trail
- All admin actions are logged
- User creation and role changes tracked
- Login attempts monitored

## Testing

### Run Security Tests
```bash
# Install dependencies
npm install axios

# Run test script
node test-admin-security.js
```

### Test Coverage
- ✅ Admin authentication
- ✅ Role management
- ✅ User creation with admin roles
- ✅ Permission-based access control
- ✅ User activation/deactivation
- ✅ Role assignment and changes

## Setup Instructions

### 1. Create Initial Admin User
```bash
cd apps/backend
npm run create-admin
```

### 2. Start the System
```bash
# Start backend
npm run dev:backend

# Start admin panel
npm run dev:admin
```

### 3. Access Admin Panel
- Navigate to `http://localhost:5175`
- Login with: `admin@admin.com` / `admin123!`
- Go to Settings → Security tab

## Troubleshooting

### Common Issues

#### "Admin user not found"
- Ensure you've run the create-admin script
- Check MongoDB connection
- Verify user exists in both User and Admin collections

#### "Permission denied"
- Check user's role and permissions
- Verify Admin model exists for the user
- Ensure proper authentication

#### "Role not available"
- Check current user's role
- Verify role hierarchy permissions
- Ensure Admin model is properly configured

### Debug Commands

```bash
# Check MongoDB collections
mongo taskflow
> db.users.find({email: "admin@admin.com"})
> db.admins.find({})
> db.userroles.find({})

# Check backend logs
cd apps/backend
npm run dev
```

## Best Practices

### 🔐 Security
- Use strong passwords (min 8 chars, special chars, numbers)
- Regularly rotate admin credentials
- Monitor admin user activity
- Limit super admin accounts

### 👥 User Management
- Assign minimal required permissions
- Regular permission audits
- Document role responsibilities
- Monitor inactive accounts

### 🚀 Performance
- Use role-based caching
- Optimize permission checks
- Monitor database queries
- Regular cleanup of inactive users

## Future Enhancements

### Planned Features
- [ ] Advanced permission granularity
- [ ] Time-based role assignments
- [ ] Multi-factor authentication for admins
- [ ] Role templates and presets
- [ ] Advanced audit reporting
- [ ] Integration with external identity providers

### Customization
- [ ] Custom permission definitions
- [ ] Role inheritance rules
- [ ] Conditional permissions
- [ ] Workflow-based access control

## Support

For issues or questions about the Admin Security System:

1. Check the troubleshooting section above
2. Review backend logs for errors
3. Verify database collections and data
4. Test with the provided test script
5. Check API endpoint responses

## Contributing

When contributing to the Admin Security System:

1. Follow existing code patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure backward compatibility
5. Test permission changes thoroughly

---

**Note**: This system is designed to provide secure, scalable admin management while maintaining clear separation between regular users and administrative users. Always test changes in a development environment before deploying to production.
