# TaskFlow Frontend Socket Architecture

This document describes the restructured socket implementation for the TaskFlow frontend that properly handles backend namespaces.

## Architecture Overview

The new socket architecture follows a namespace-based approach that mirrors the backend structure:

```
SocketContext (Provider)
    ↓
Multiple Socket Instances (one per namespace)
    ↓
Specialized Hooks (business logic)
    ↓
Components (UI usage)
```

## Namespaces

### 1. **Board Socket** (`/` - default namespace)
- **Purpose**: Board and task operations
- **Hook**: `useBoardSocket()`
- **Events**: `board:join`, `task:create`, `column:update`, etc.

### 2. **Notification Socket** (`/notifications`)
- **Purpose**: Real-time notifications
- **Hook**: `useNotificationSocket()`
- **Events**: `notifications:getUnreadCount`, `notification:new`, etc.

### 3. **System Socket** (`/system`)
- **Purpose**: System monitoring (admin only)
- **Hook**: `useSystemSocket()`
- **Events**: `system:health-check`, `system:get-metrics`, etc.

### 4. **Chat Socket** (`/chat`)
- **Purpose**: Real-time chat functionality
- **Hook**: `useChatSocket()`
- **Events**: `chat:join`, `chat:message`, `chat:typing-start`, etc.

### 5. **Workspace Socket** (`/workspace`)
- **Purpose**: Workspace management
- **Hook**: `useWorkspaceSocket()`
- **Events**: `workspace:join`, `workspace:add-member`, etc.

## Usage Examples

### Basic Socket Connection
```tsx
import { useSocketConnection } from '../hooks/socket';

function App() {
  const { isAnyConnected, reconnect, connectionDetails } = useSocketConnection();
  
  return (
    <div>
      <p>Socket Status: {isAnyConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={reconnect}>Reconnect</button>
    </div>
  );
}
```

### Board Operations
```tsx
import { useBoardSocket } from '../hooks/socket';

function BoardComponent() {
  const { socket, isConnected, emit, on, off } = useBoardSocket();
  
  useEffect(() => {
    if (isConnected) {
      emit('board:join', { boardId: 'board123' });
    }
  }, [isConnected, emit]);
  
  // ... rest of component
}
```

### Notifications
```tsx
import { useNotifications } from '../hooks/socket';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <span>{unreadCount}</span>
      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          {notification.content}
        </div>
      ))}
    </div>
  );
}
```

### System Monitoring (Admin Only)
```tsx
import { useSystemMonitoring } from '../hooks/socket';

function SystemDashboard() {
  const { metrics, health, requestHealthCheck, toggleMaintenanceMode } = useSystemMonitoring();
  
  return (
    <div>
      <button onClick={requestHealthCheck}>Check Health</button>
      <button onClick={() => toggleMaintenanceMode(true)}>Enable Maintenance</button>
      
      {health && (
        <div>
          <p>Status: {health.status}</p>
          <p>Uptime: {health.uptime}</p>
        </div>
      )}
    </div>
  );
}
```

## Migration from Old Implementation

### Before (Old way)
```tsx
// ❌ Creating individual socket connections
const socket = io('http://localhost:3001', { auth: { token } });
socket.emit('event', data);
```

### After (New way)
```tsx
// ✅ Using centralized namespace hooks
const { emit } = useBoardSocket();
emit('event', data);
```

## Benefits of New Architecture

1. **Centralized Management**: All socket connections managed in one place
2. **Namespace Separation**: Proper separation of concerns matching backend
3. **Authentication**: Centralized JWT token handling
4. **Error Handling**: Consistent error handling across all namespaces
5. **Reconnection**: Automatic reconnection with exponential backoff
6. **Type Safety**: Full TypeScript support for all socket operations
7. **Performance**: No duplicate connections, efficient resource usage
8. **Maintainability**: Clear separation of business logic and socket management

## Configuration

The socket system automatically uses the following environment variables:
- `VITE_SOCKET_URL`: Base socket server URL (default: `http://localhost:3001`)
- `VITE_API_BASE_URL`: API base URL for authentication

## Error Handling

All socket operations include comprehensive error handling:
- Connection failures
- Authentication errors
- Network timeouts
- Server errors
- Automatic reconnection attempts

## Security Features

- JWT-based authentication for all connections
- Role-based access control (system socket requires admin privileges)
- Secure room access validation
- Input validation and sanitization

## Performance Considerations

- **Connection Pooling**: Single connection per namespace
- **Event Batching**: Efficient event handling
- **Memory Management**: Proper cleanup on component unmount
- **Reconnection Strategy**: Exponential backoff with maximum attempts
- **Room Management**: Efficient room joining/leaving

## Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check authentication token
   - Verify backend server is running
   - Check network connectivity

2. **Events not firing**
   - Ensure socket is connected
   - Verify event names match backend
   - Check authentication permissions

3. **Performance issues**
   - Monitor connection count
   - Check for memory leaks
   - Verify proper cleanup

### Debug Mode

Enable debug logging by setting `VITE_ENABLE_DEBUG=true` in your environment variables.

## Future Enhancements

- WebSocket fallback support
- Offline message queuing
- Message encryption
- Advanced analytics and monitoring
- Multi-region support
