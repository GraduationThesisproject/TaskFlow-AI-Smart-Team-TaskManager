# Admin Account Setup

This document explains how to set up admin accounts for the TaskFlow admin panel.

## Quick Setup

### Option 1: Create Admin Account Only
Run the dedicated admin creation script:

```bash
cd apps/backend
node src/scripts/create-admin.js
```

This will create:
- **Email**: `admin@admin.com`
- **Password**: `admin123!`
- **Role**: `super_admin` (full permissions)

### Option 2: Full Database Seeding
Run the complete seeder which includes admin accounts:

```bash
cd apps/backend
node src/scripts/seed.js
```

This creates multiple test accounts including:
- `admin@admin.com` (password: `admin123!`) - System Administrator
- `superadmin.test@gmail.com` (password: `12345678A!`)
- `admin.test@gmail.com` (password: `12345678A!`)
- And more test users...

## Admin Account Details

### System Administrator (admin@admin.com)
- **Email**: `admin@admin.com`
- **Password**: `admin123!`
- **Role**: `super_admin`
- **Permissions**: All permissions enabled

### Test Admin Accounts
- **Super Admin**: `superadmin.test@gmail.com` / `12345678A!`
- **Admin**: `admin.test@gmail.com` / `12345678A!`

## Admin Panel Access

1. Start the backend server:
   ```bash
   cd apps/backend
   npm run dev
   ```

2. Start the admin frontend:
   ```bash
   cd apps/admin
   npm run dev
   ```

3. Navigate to the login page and use the admin credentials

## Admin Model Structure

The system uses two models for admin functionality:

### UserRoles Model
- Handles general user roles (`super_admin`, `admin`, `user`)
- Manages workspace and space-level permissions

### Admin Model
- Handles admin panel access
- Manages admin-specific permissions
- Controls access to admin features

## Permissions

### Super Admin Permissions
- ✅ Manage Users
- ✅ Manage Workspaces
- ✅ Manage Templates
- ✅ View Analytics
- ✅ System Settings
- ✅ Manage Admins
- ✅ View System Logs
- ✅ Manage Quotas
- ✅ Manage AI Jobs

### Admin Permissions
- ✅ Manage Users
- ✅ Manage Workspaces
- ❌ Manage Templates
- ✅ View Analytics
- ❌ System Settings
- ❌ Manage Admins
- ❌ View System Logs
- ❌ Manage Quotas
- ❌ Manage AI Jobs

## Troubleshooting

### Admin Account Not Working
1. Ensure the backend server is running
2. Check MongoDB connection
3. Verify the Admin model was created
4. Check browser console for errors

### Permission Issues
1. Verify the Admin model has the correct permissions
2. Check if the user has both UserRoles and Admin entries
3. Ensure the admin account is active

### Database Connection Issues
1. Check MongoDB is running
2. Verify connection string in `.env` file
3. Ensure database exists and is accessible

## Security Notes

- The default admin password (`admin123!`) is intentionally simple for development
- **Change the password in production environments**
- Consider implementing 2FA for admin accounts
- Regularly rotate admin credentials
- Monitor admin account activity
