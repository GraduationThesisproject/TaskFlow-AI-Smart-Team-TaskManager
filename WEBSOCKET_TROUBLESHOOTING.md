# WebSocket Connection Troubleshooting Guide

## Issue Description
You're experiencing the error: `WebSocket connection to 'ws://localhost:3001/socket.io/?EIO=4&transport=websocket' failed: WebSocket is closed before the connection is established.`

## Root Causes & Solutions

### 1. Backend Server Not Running
**Problem**: The backend server on port 3001 is not running or not accessible.

**Solution**:
```bash
# Navigate to backend directory
cd apps/backend

# Start the development server
npm run dev

# Or start production server
npm start
```

**Verification**: Check if port 3001 is listening:
```bash
# Windows
netstat -an | findstr :3001

# Linux/Mac
netstat -an | grep :3001
```

### 2. CORS Configuration Issues
**Problem**: The backend CORS settings don't allow your frontend origin.

**Current CORS Configuration** (from `apps/backend/src/config/env.js`):
```javascript
CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175', 
  'http://localhost:5176'
]
```

**Solution**: Ensure your frontend is running on one of these ports, or add your port to the CORS_ORIGIN environment variable.

### 3. Authentication Token Issues
**Problem**: The socket connection requires a valid JWT token for authentication.

**Solution**: Ensure the user is properly authenticated and has a valid token before attempting socket connection.

### 4. Socket.IO Version Mismatch
**Problem**: Frontend and backend Socket.IO versions might be incompatible.

**Solution**: Check package.json files and ensure compatible versions:
```json
// Frontend (apps/main/package.json)
"socket.io-client": "^4.x.x"

// Backend (apps/backend/package.json)  
"socket.io": "^4.x.x"
```

## Immediate Fixes Applied

### 1. Enhanced useSocket Hook
- Fixed duplicate import issue
- Added proper error handling and reconnection logic
- Implemented exponential backoff for reconnection attempts
- Added connection state management

### 2. SocketContext Provider
- Centralized socket management
- Automatic connection based on authentication state
- Proper cleanup and error handling

### 3. Debug Components
- SocketStatusIndicator: Shows connection status
- SocketDebugger: Comprehensive debugging tool (development only)

## Testing Your Connection

### 1. Use the Socket Debugger
The SocketDebugger component (visible in development mode) provides:
- Real-time connection status
- Connection testing tools
- Health check functionality
- Troubleshooting tips

### 2. Check Browser Console
Look for these log messages:
- 🔌 Socket connected successfully
- 🔄 Socket connecting...
- ❌ Socket error: [error details]

### 3. Test Backend Health
```bash
curl http://localhost:3001/health
```

## Step-by-Step Resolution

### Step 1: Verify Backend is Running
1. Check if backend server is running on port 3001
2. Test health endpoint: `http://localhost:3001/health`
3. Ensure no firewall/proxy blocking the connection

### Step 2: Check Frontend Configuration
1. Verify `SOCKET_URL` in environment configuration
2. Ensure frontend is running on an allowed CORS origin
3. Check if user is authenticated with valid token

### Step 3: Test Socket Connection
1. Use the SocketDebugger component to test connection
2. Check browser console for detailed error messages
3. Verify WebSocket transport is working

### Step 4: Monitor Connection
1. Watch the connection status indicator
2. Check for automatic reconnection attempts
3. Monitor error messages and connection state

## Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "WebSocket is closed before connection established" | Connection timing issues | Added connection delay and better error handling |
| "CORS error" | Origin not allowed | Check CORS_ORIGIN configuration |
| "Authentication failed" | Invalid/missing token | Ensure user is properly authenticated |
| "Connection timeout" | Server not responding | Check if backend is running |
| "Transport closed" | Network issues | Check network connectivity |

## Environment Variables

Ensure these environment variables are set correctly:

```bash
# Backend (.env)
PORT=3001
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
JWT_SECRET=your-secret-key

# Frontend (.env)
VITE_SOCKET_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api
```

## Production Considerations

1. **Remove Debug Components**: Remove SocketDebugger in production
2. **Environment Variables**: Use proper production URLs
3. **SSL/TLS**: Use WSS (secure WebSocket) in production
4. **Load Balancing**: Ensure WebSocket connections work with your load balancer
5. **Monitoring**: Implement proper logging and monitoring

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [CORS Configuration Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Support

If issues persist:
1. Check the SocketDebugger output
2. Review browser console logs
3. Verify backend server logs
4. Test with the provided debugging tools
5. Check network connectivity and firewall settings
