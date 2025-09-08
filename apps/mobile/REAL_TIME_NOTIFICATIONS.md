# Real-Time Notification System Integration

This document explains how the real-time notification system has been integrated into the mobile app using Socket.IO and the SocketContext.

## Overview

The notification system now supports real-time updates through WebSocket connections, providing instant notifications to users without requiring manual refresh or polling.

## Architecture

### Core Components

1. **SocketContext** (`apps/mobile/contexts/SocketContext.tsx`)
   - Centralized socket management
   - Multiple namespace support (notifications, chat, workspace, etc.)
   - Authentication integration
   - Push notification integration

2. **useRealTimeNotifications Hook** (`apps/mobile/hooks/socket/useRealTimeNotifications.ts`)
   - Dedicated hook for real-time notification functionality
   - Handles socket events and Redux state updates
   - Push notification scheduling

3. **useNotifications Hook** (`apps/mobile/hooks/useNotifications.ts`)
   - Updated to work with SocketContext
   - Fallback to REST API when socket is disconnected
   - Toast notification integration

4. **PushNotificationService** (`apps/mobile/services/pushNotificationService.ts`)
   - Expo notifications integration
   - Local notification scheduling
   - Token management

## Usage

### Basic Setup

1. **Wrap your app with SocketProvider**:

```tsx
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider>
      {/* Your app components */}
    </SocketProvider>
  );
}
```

2. **Use the real-time notifications hook**:

```tsx
import { useRealTimeNotifications } from './hooks/socket/useRealTimeNotifications';

function NotificationComponent() {
  const {
    isConnected,
    isConnecting,
    connectionError,
    reconnect,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getRecentNotifications,
  } = useRealTimeNotifications();

  // Your component logic
}
```

3. **Use the regular notifications hook for UI state**:

```tsx
import { useNotifications } from './hooks/useNotifications';

function NotificationList() {
  const {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Your component logic
}
```

### Socket Events

The system handles the following socket events:

#### Client → Server Events
- `notification:mark_read` - Mark a notification as read
- `notification:mark_all_read` - Mark all notifications as read
- `notification:get_unread_count` - Get unread notification count
- `notification:get_recent` - Get recent notifications
- `register_push_token` - Register push notification token

#### Server → Client Events
- `notification:new` - New notification received
- `notification:updated` - Notification updated
- `notification:read` - Notification marked as read
- `notification:unread_count` - Unread count update
- `notification:recent` - Recent notifications data

### Configuration

#### Environment Variables

Set these in your environment configuration:

```typescript
// apps/mobile/config/env.ts
export const env = {
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.217.1:3001',
  // ... other config
};
```

#### Socket Options

The socket connection uses these options:

```typescript
{
  autoConnect: false,
  auth: { token },
  transports: ['polling', 'websocket'],
  path: '/socket.io',
  timeout: 30000,
  reconnection: false, // Manual reconnection handling
  forceNew: true,
  upgrade: true,
  rememberUpgrade: false,
}
```

## Features

### Real-Time Updates
- Instant notification delivery
- Automatic Redux state updates
- Toast notifications for new messages
- Push notifications for background state

### Connection Management
- Automatic reconnection with exponential backoff
- Connection status monitoring
- Error handling and recovery
- Authentication token validation

### Push Notifications
- Expo push notification integration
- Local notification scheduling
- Token registration with server
- Background notification handling

### Fallback Support
- REST API fallback when socket is disconnected
- Graceful degradation
- Offline state handling

## Testing

### Demo Component

Use the `NotificationDemo` component to test the real-time functionality:

```tsx
import { NotificationDemo } from './components/NotificationDemo';

function TestScreen() {
  return <NotificationDemo />;
}
```

### Test Functions

The demo component includes test functions for:
- Creating test notifications
- Marking notifications as read
- Getting unread counts
- Testing reconnection
- Verifying socket events

## Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Check server is running on correct port
   - Verify SOCKET_URL configuration
   - Check authentication token validity

2. **Notifications Not Appearing**
   - Verify socket connection status
   - Check real-time preferences are enabled
   - Ensure proper Redux state management

3. **Push Notifications Not Working**
   - Check Expo push token registration
   - Verify notification permissions
   - Test with local notifications first

### Debug Information

Enable debug logging by setting:

```typescript
ENABLE_DEBUG: true
```

This will log socket events, connection status, and notification processing.

## Best Practices

1. **Always check connection status** before emitting socket events
2. **Use the real-time hook** for socket-specific functionality
3. **Use the regular hook** for UI state management
4. **Handle offline states** gracefully
5. **Clean up event listeners** in useEffect cleanup functions
6. **Test with different network conditions**

## Migration from Middleware

The system has been migrated from Redux middleware to SocketContext for better:
- Type safety
- Component-level control
- Easier testing
- Better error handling
- Cleaner separation of concerns

The old `notificationsSocketMiddleware` can be removed as its functionality is now handled by the SocketContext and hooks.
