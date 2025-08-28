# Admin System - TaskFlow AI

## Overview

The Admin System is a separate, dedicated system for managing administrative users in TaskFlow AI. It's completely independent from the regular app users and provides role-based access control with granular permissions.

## 🏗️ Architecture

### Separate Admin Model
- **Independent from User model** - No dependency on regular app users
- **Dedicated authentication** - Separate login system for admin users
- **Role-based permissions** - Granular control over admin capabilities
- **2FA support** - Built-in two-factor authentication

### Admin Roles Hierarchy
1. **super_admin** - Full system access, can manage other admins
2. **admin** - System administration, user management
3. **moderator** - Content moderation, user oversight
4. **viewer** - Read-only access to dashboard and reports

## 🔐 Authentication Flow

### Admin Login Process
1. **Email/Password** - Initial authentication
2. **2FA Verification** - If enabled (TOTP + backup codes)
3. **Session Creation** - Secure session management
4. **Permission Check** - Role-based access control

### Security Features
- **Password hashing** - bcrypt with cost 12
- **Session management** - Secure session tokens
- **2FA support** - TOTP + backup codes + recovery tokens
- **Permission validation** - Every action checks permissions

## 📊 Admin Model Structure

### Core Fields
```javascript
{
  userName: String,           // Unique username
  userEmail: String,          // Unique email
  password: String,           // Hashed password
  role: String,               // Role enum
  permissions: Array,         // Granular permissions
  isActive: Boolean,          // Account status
  hasTwoFactorAuth: Boolean,  // 2FA status
  // ... additional fields
}
```

### Permission Structure
```javascript
permissions: [
  {
    name: 'user_management',    // Permission identifier
    description: 'Manage users', // Human-readable description
    allowed: true               // Whether permission is granted
  }
]
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd apps/backend
npm install
```

### 2. Run Admin System Test
```bash
node test-admin-system.js
```

### 3. Start the Server
```bash
npm run dev
```

### 4. Access Admin Management API
```
Base URL: http://localhost:3001/api/admin-management
```

## 🔧 API Endpoints

### Admin Management Routes
All routes require `admin_management` permission.

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| POST | `/create` | Create new admin | `admin_management` |
| GET | `/list` | List all admins | `admin_management` |
| GET | `/stats/overview` | Admin statistics | `admin_management` |
| GET | `/:id` | Get admin by ID | `admin_management` |
| PUT | `/:id` | Update admin | `admin_management` |
| DELETE | `/:id` | Delete admin | `admin_management` |
| PATCH | `/:id/password` | Change password | `admin_management` |
| PATCH | `/:id/toggle-status` | Activate/deactivate | `admin_management` |

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| POST | `/api/admin/auth/login/2fa-complete` | Complete 2FA login |
| GET | `/api/admin/auth/me` | Get current admin |

## 👥 Default Admin Users

### Super Administrator
- **Email**: `admin@admin.com`
- **Password**: `Admin123!`
- **Role**: `super_admin`
- **Permissions**: All permissions granted

### System Administrator
- **Email**: `admin@taskflow.com`
- **Password**: `Admin123!`
- **Role**: `admin`
- **Permissions**: Most system permissions

### Content Moderator
- **Email**: `moderator@taskflow.com`
- **Password**: `Moderator123!`
- **Role**: `moderator`
- **Permissions**: User and content moderation

### Read-Only Viewer
- **Email**: `viewer@taskflow.com`
- **Password**: `Viewer123!`
- **Role**: `viewer`
- **Permissions**: Dashboard and report viewing only

## 🔑 Permission System

### Default Permissions by Role

#### Super Admin
- `user_management` - Manage all users
- `admin_management` - Manage admin users
- `system_settings` - Access system settings
- `data_export` - Export data
- `audit_logs` - View audit logs
- `backup_restore` - Backup and restore data

#### Admin
- `user_management` - Manage users
- `admin_management` - View admin users
- `system_settings` - Access system settings
- `data_export` - Export data
- `audit_logs` - View audit logs

#### Moderator
- `user_management` - Moderate users
- `content_moderation` - Moderate content
- `reports` - Handle reports

#### Viewer
- `dashboard_view` - View dashboard
- `reports_view` - View reports

### Custom Permissions
You can override default permissions when creating or updating admins:

```javascript
{
  permissions: [
    { name: 'user_management', allowed: true },
    { name: 'admin_management', allowed: false }, // Override default
    { name: 'custom_permission', allowed: true }  // Add custom permission
  ]
}
```

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Stored as bcrypt hash with cost 12

### Two-Factor Authentication
- **TOTP** - Time-based one-time passwords
- **Backup Codes** - 10 one-time use codes
- **Recovery Token** - Emergency access token

### Session Management
- Secure session tokens
- Device tracking
- Activity logging
- Automatic session cleanup

## 📝 Usage Examples

### Create New Admin
```bash
curl -X POST http://localhost:3001/api/admin-management/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "newadmin",
    "userEmail": "newadmin@company.com",
    "password": "SecurePass123!",
    "role": "admin",
    "firstName": "New",
    "lastName": "Administrator"
  }'
```

### List All Admins
```bash
curl -X GET "http://localhost:3001/api/admin-management/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Admin
```bash
curl -X PUT http://localhost:3001/api/admin-management/ADMIN_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "moderator",
    "isActive": false
  }'
```

## 🔍 Monitoring and Logging

### Activity Tracking
- Login attempts logged
- Permission changes tracked
- Admin actions audited
- Session activity monitored

### Error Handling
- Comprehensive error logging
- Validation error details
- Permission denial logging
- Security event tracking

## 🚨 Best Practices

### Security
1. **Use strong passwords** - Follow password requirements
2. **Enable 2FA** - For all admin accounts
3. **Regular audits** - Review admin permissions
4. **Principle of least privilege** - Grant minimum required permissions

### Administration
1. **Role-based access** - Use predefined roles when possible
2. **Permission reviews** - Regularly audit admin permissions
3. **Account lifecycle** - Deactivate unused accounts
4. **Documentation** - Keep admin procedures updated

## 🐛 Troubleshooting

### Common Issues

#### Admin Login Fails
- Check if admin account exists and is active
- Verify password meets requirements
- Check if 2FA is properly configured

#### Permission Denied
- Verify admin has required permissions
- Check if admin account is active
- Ensure proper role assignment

#### 2FA Issues
- Verify TOTP app is synchronized
- Use backup codes if needed
- Check recovery token validity

### Debug Mode
Enable detailed logging by setting environment variables:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📚 Additional Resources

### Related Files
- `src/models/Admin.js` - Admin model definition
- `src/controllers/adminManagement.controller.js` - Admin management logic
- `src/routes/adminManagement.routes.js` - API routes
- `src/middlewares/validation.js` - Input validation
- `src/seeders/adminSeeder.js` - Initial admin creation

### Dependencies
- `bcryptjs` - Password hashing
- `express-validator` - Input validation
- `mongoose` - Database operations

## 🤝 Contributing

When adding new features to the admin system:

1. **Update permissions** - Add new permission types
2. **Extend validation** - Add input validation rules
3. **Update documentation** - Keep this README current
4. **Add tests** - Ensure functionality works correctly

## 📄 License

This admin system is part of TaskFlow AI and follows the same licensing terms.
