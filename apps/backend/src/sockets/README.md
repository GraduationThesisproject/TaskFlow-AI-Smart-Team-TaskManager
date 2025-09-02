# TaskFlow Socket System

This document describes the refactored socket system architecture for TaskFlow.

## Socket Architecture Overview

The socket system has been refactored into three main components:

### 1. Board Socket (`board.socket.js`)
- **Namespace**: Default (root namespace `/`)
- **Purpose**: Handles all real-time board and task operations
- **Features**:
  - Board joining/leaving
  - Column CRUD operations
  - Task updates and movement
  - Real-time comments
  - User presence and typing indicators
  - Bulk operations
  - Board settings management

### 2. Notification Socket (`notification.socket.js`)
- **Namespace**: `/notifications`
- **Purpose**: Dedicated namespace for all notification-related events
- **Features**:
  - Real-time notifications
  - Unread count management
  - Notification subscriptions by type
  - Delivery status tracking
  - Bulk notification sending
  - System-wide broadcasts

### 3. System Socket (`system.socket.js`)
- **Namespace**: `/system`
- **Purpose**: System monitoring, health checks, and administrative operations
- **Features**:
  - System health monitoring
  - Performance metrics
  - Configuration management
  - Maintenance mode control
  - System backup operations
  - Scheduled restarts
  - Real-time system status updates

## Connection URLs

### Frontend Connection Examples

```javascript
// Connect to board socket (default namespace)
const boardSocket = io('http://localhost:3001', {
  auth: { token: userToken }
});

// Connect to notification socket
const notificationSocket = io('http://localhost:3001/notifications', {
  auth: { token: userToken }
});

// Connect to system socket (admin only)
const systemSocket = io('http://localhost:3001/system', {
  auth: { token: adminToken }
});
```

## Authentication

All socket connections require JWT authentication via the `auth.token` parameter.

### System Socket Access
- Requires user to have `system:monitor` permission
- Accessible only to system administrators
- Provides system-wide control and monitoring capabilities

## Event Naming Convention

### Board Events
- `board:join` - Join a board room
- `board:leave` - Leave a board room
- `column:create` - Create a new column
- `column:update` - Update column properties
- `column:delete` - Delete a column
- `task:update` - Update task properties
- `task:move` - Move task between columns
- `comment:add` - Add comment to task

### Notification Events
- `notifications:getUnreadCount` - Get unread notification count
- `notifications:markRead` - Mark notification as read
- `notifications:subscribe` - Subscribe to notification types
- `notification:new` - New notification received

### System Events
- `system:health-check` - Request system health status
- `system:get-metrics` - Get system performance metrics
- `system:maintenance-mode` - Toggle maintenance mode
- `system:backup` - Initiate system backup
- `system:restart` - Schedule system restart

## Global Utilities

### Board Socket
```javascript
// Notify all users in a board
io.notifyBoard(boardId, 'event', data);

// Notify board administrators
io.notifyBoardAdmins(boardId, 'event', data);
```

### Notification Socket
```javascript
// Send notification to specific user
global.notificationNamespace.sendNotification(userId, notificationData);

// Send bulk notifications
global.notificationNamespace.sendBulkNotifications(notifications);

// Broadcast system notification
global.notificationNamespace.broadcastSystemNotification(data, userFilter);
```

### System Socket
```javascript
// Access system namespace globally
global.systemNamespace.emit('event', data);
```

## Error Handling

All socket events include comprehensive error handling:
- Authentication errors
- Permission validation
- Database operation failures
- Invalid input validation
- System operation failures

## Performance Considerations

- **Namespaces**: Separate concerns and reduce unnecessary event propagation
- **Room Management**: Efficient room joining/leaving for targeted broadcasts
- **Authentication Caching**: JWT verification cached per connection
- **Event Batching**: Bulk operations for multiple updates
- **Connection Limits**: Per-namespace connection management

## Security Features

- JWT-based authentication for all connections
- Role-based permission checking
- Input validation and sanitization
- Rate limiting (implemented in middleware)
- Secure room access validation

## Monitoring and Logging

- Comprehensive logging for all socket operations
- Connection/disconnection tracking
- Error logging with stack traces
- Performance metrics collection
- User activity monitoring

## Migration Notes

### From Previous Version
- `task.socket.js` functionality merged into `board.socket.js`
- Notification socket now uses dedicated namespace `/notifications`
- New system socket for administrative operations
- Improved error handling and validation
- Better separation of concerns

### Breaking Changes
- Task events now handled through board socket
- Notification connection requires namespace specification
- System operations require elevated permissions
- Some event names may have changed for consistency
