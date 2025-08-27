# User Role Change Functionality

This document describes the new user role change functionality that allows system administrators to change user roles from `user` to `admin` and `super_admin`.

## Overview

The role change functionality is implemented as a new endpoint in the admin API that allows authorized administrators to modify user system roles. This is useful for:

- Promoting regular users to admin status
- Demoting admins back to regular users
- Managing system-wide permissions
- Onboarding new administrators

## API Endpoint

### PATCH `/api/admin/users/:userId/role`

Changes the system role of a specified user.

**URL Parameters:**
- `userId` (string, required): The MongoDB ObjectId of the user whose role should be changed

**Request Body:**
```json
{
  "newRole": "admin"  // Must be one of: "user", "admin", "super_admin"
}
```

**Headers:**
- `Authorization: Bearer <admin_token>` (required)
- `Content-Type: application/json`

**Response:**
```json
{
  "success": true,
  "message": "User role changed to admin successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "roles": {
        "systemRole": "admin"
      }
    },
    "newRole": "admin"
  }
}
```

## Security Requirements

- **Authentication Required**: Valid JWT token must be provided
- **Authorization Required**: User must have `admin` or `super_admin` system role
- **Permission Check**: The `requireSystemAdmin` middleware validates admin privileges

## Role Hierarchy

The system supports three system roles:

1. **`user`** - Regular user with basic permissions
2. **`admin`** - Administrator with elevated permissions
3. **`super_admin`** - Super administrator with full system access

## Implementation Details

### Controller Method

The role change logic is implemented in `adminController.changeUserRole()` which:

1. Validates the new role value
2. Checks if the target user exists
3. Creates or updates the UserRoles document
4. Logs the role change for audit purposes
5. Returns the updated user information

### Database Changes

- Updates the `systemRole` field in the `UserRoles` collection
- Creates a new UserRoles document if one doesn't exist
- Maintains referential integrity with the User model

### Error Handling

The endpoint handles various error scenarios:

- **400 Bad Request**: Invalid role value
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Target user doesn't exist
- **500 Internal Server Error**: Server-side errors

## Usage Examples

### Change User to Admin

```bash
curl -X PATCH \
  http://localhost:3000/api/admin/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"newRole": "admin"}'
```

### Change Admin to Super Admin

```bash
curl -X PATCH \
  http://localhost:3000/api/admin/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"newRole": "super_admin"}'
```

### Demote Admin to User

```bash
curl -X PATCH \
  http://localhost:3000/api/admin/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"newRole": "user"}'
```

## Testing

The functionality is thoroughly tested with the `admin.test.js` test suite, which covers:

- Successful role changes in all directions
- Input validation
- Authentication and authorization
- Error handling
- Edge cases (non-existent users, missing role documents)

Run the tests with:

```bash
npm test -- admin.test.js
```

## Audit Logging

All role changes are logged for security and compliance purposes:

- User performing the change
- Target user and their email
- Previous and new roles
- Timestamp of the change

## Best Practices

1. **Use with Caution**: Role changes affect system security
2. **Document Changes**: Keep records of role modifications
3. **Regular Review**: Periodically audit user roles
4. **Principle of Least Privilege**: Only grant necessary permissions
5. **Monitor Access**: Watch for unusual role change patterns

## Future Enhancements

Potential improvements for the role change functionality:

- Role change approval workflow
- Temporary role assignments
- Role change notifications
- Bulk role updates
- Role change history tracking
- Integration with external identity providers

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Ensure the authenticated user has admin privileges
2. **400 Bad Request**: Verify the newRole value is valid
3. **404 Not Found**: Check if the target user ID exists
4. **500 Internal Server Error**: Check server logs for detailed error information

### Debug Mode

Enable debug logging by setting the appropriate log level in your environment configuration.

## Support

For issues or questions regarding the role change functionality, please:

1. Check the server logs for error details
2. Verify authentication and authorization
3. Test with the provided test suite
4. Review this documentation
5. Contact the development team if issues persist
