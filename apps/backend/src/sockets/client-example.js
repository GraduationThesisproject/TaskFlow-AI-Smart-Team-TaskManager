/**
 * TaskFlow Socket Client Connection Examples
 * 
 * This file demonstrates how to connect to the refactored socket system
 * from the frontend application.
 */

// Example Socket.IO client connections for different namespaces

// 1. Board Socket (Default Namespace) - For board and task operations
const connectToBoardSocket = (userToken) => {
    const boardSocket = io('http://localhost:3001', {
        auth: { token: userToken },
        transports: ['websocket', 'polling']
    });

    // Connection events
    boardSocket.on('connect', () => {
        console.log('Connected to board socket');
    });

    boardSocket.on('connected', (data) => {
        console.log('Board socket welcome:', data.message);
    });

    // Board events
    boardSocket.on('board:state', (data) => {
        console.log('Board state received:', data);
        // Handle board state update
    });

    boardSocket.on('board:user-joined', (data) => {
        console.log('User joined board:', data.user.name);
        // Update UI to show user joined
    });

    boardSocket.on('board:user-left', (data) => {
        console.log('User left board:', data.user.name);
        // Update UI to show user left
    });

    // Column events
    boardSocket.on('column:created', (data) => {
        console.log('Column created:', data.column.title);
        // Add new column to UI
    });

    boardSocket.on('column:updated', (data) => {
        console.log('Column updated:', data.column.title);
        // Update column in UI
    });

    boardSocket.on('column:deleted', (data) => {
        console.log('Column deleted:', data.columnId);
        // Remove column from UI
    });

    // Task events
    boardSocket.on('task:updated', (data) => {
        console.log('Task updated:', data.task.title);
        // Update task in UI
    });

    boardSocket.on('task:moved', (data) => {
        console.log('Task moved:', data.taskId);
        // Update task position in UI
    });

    // Comment events
    boardSocket.on('comment:added', (data) => {
        console.log('Comment added:', data.comment.content);
        // Add comment to UI
    });

    // User interaction events
    boardSocket.on('user:typing', (data) => {
        console.log('User typing:', data.user.name);
        // Show typing indicator
    });

    boardSocket.on('user:presence', (data) => {
        console.log('User presence:', data.user.name, data.status);
        // Update user presence indicator
    });

    // Error handling
    boardSocket.on('error', (error) => {
        console.error('Board socket error:', error);
        // Handle error appropriately
    });

    return boardSocket;
};

// 2. Notification Socket - For real-time notifications
const connectToNotificationSocket = (userToken) => {
    const notificationSocket = io('http://localhost:3001/notifications', {
        auth: { token: userToken },
        transports: ['websocket', 'polling']
    });

    // Connection events
    notificationSocket.on('connect', () => {
        console.log('Connected to notification socket');
        
        // Get initial unread count
        notificationSocket.emit('notifications:getUnreadCount');
        
        // Subscribe to specific notification types
        notificationSocket.emit('notifications:subscribe', {
            types: ['task', 'comment', 'mention', 'system']
        });
    });

    // Notification events
    notificationSocket.on('notifications:unreadCount', (data) => {
        console.log('Unread notifications:', data.count);
        // Update unread count in UI
    });

    notificationSocket.on('notification:new', (data) => {
        console.log('New notification:', data.notification);
        // Show new notification in UI
    });

    notificationSocket.on('notification:typed', (data) => {
        console.log('Typed notification:', data.type, data.notification);
        // Handle type-specific notification
    });

    notificationSocket.on('notifications:marked-read', (data) => {
        console.log('Notification marked as read:', data.notificationId);
        // Update notification status in UI
    });

    notificationSocket.on('notifications:all-marked-read', () => {
        console.log('All notifications marked as read');
        // Update all notifications in UI
    });

    // Subscription events
    notificationSocket.on('notifications:subscribed', (data) => {
        console.log('Subscribed to notification types:', data.types);
    });

    notificationSocket.on('notifications:unsubscribed', (data) => {
        console.log('Unsubscribed from notification types:', data.types);
    });

    // Error handling
    notificationSocket.on('error', (error) => {
        console.error('Notification socket error:', error);
    });

    return notificationSocket;
};

// 3. System Socket - For system monitoring (Admin only)
const connectToSystemSocket = (adminToken) => {
    const systemSocket = io('http://localhost:3001/system', {
        auth: { token: adminToken },
        transports: ['websocket', 'polling']
    });

    // Connection events
    systemSocket.on('connect', () => {
        console.log('Connected to system socket');
        
        // Subscribe to real-time monitoring
        systemSocket.emit('system:subscribe-monitoring', { interval: 5000 });
    });

    // System status events
    systemSocket.on('system:status', (data) => {
        console.log('System status:', data);
        // Display system status in admin dashboard
    });

    systemSocket.on('system:status-update', (data) => {
        console.log('System status update:', data);
        // Update system status display
    });

    systemSocket.on('system:health-status', (data) => {
        console.log('System health:', data);
        // Display health status
    });

    systemSocket.on('system:metrics', (data) => {
        console.log('System metrics:', data);
        // Update metrics display
    });

    // Configuration events
    systemSocket.on('system:config-updated', (data) => {
        console.log('System config updated:', data);
        // Update configuration display
    });

    // Maintenance events
    systemSocket.on('system:maintenance-mode-changed', (data) => {
        console.log('Maintenance mode changed:', data);
        // Update maintenance mode display
    });

    systemSocket.on('system:maintenance-notice', (data) => {
        console.log('Maintenance notice:', data);
        // Show maintenance notice to all users
    });

    // Backup events
    systemSocket.on('system:backup-initiated', (data) => {
        console.log('Backup initiated:', data);
        // Show backup status
    });

    systemSocket.on('system:backup-progress', (data) => {
        console.log('Backup progress:', data.progress + '%');
        // Update backup progress bar
    });

    // Restart events
    systemSocket.on('system:restart-scheduled', (data) => {
        console.log('System restart scheduled:', data);
        // Show restart countdown
    });

    // Error handling
    systemSocket.on('error', (error) => {
        console.error('System socket error:', error);
    });

    return systemSocket;
};

// 4. Utility Functions for Socket Management

// Disconnect from all sockets
const disconnectAllSockets = (sockets) => {
    Object.values(sockets).forEach(socket => {
        if (socket && socket.connected) {
            socket.disconnect();
        }
    });
};

// Reconnect to all sockets
const reconnectAllSockets = (sockets, tokens) => {
    if (tokens.board) {
        sockets.board = connectToBoardSocket(tokens.board);
    }
    if (tokens.notification) {
        sockets.notification = connectToNotificationSocket(tokens.notification);
    }
    if (tokens.system) {
        sockets.system = connectToSystemSocket(tokens.system);
    }
};

// Check socket connection status
const getSocketStatus = (sockets) => {
    const status = {};
    Object.entries(sockets).forEach(([name, socket]) => {
        status[name] = {
            connected: socket?.connected || false,
            id: socket?.id || null
        };
    });
    return status;
};

// Example usage
const initializeSockets = (userToken, adminToken = null) => {
    const sockets = {};
    
    try {
        // Connect to board socket
        sockets.board = connectToBoardSocket(userToken);
        
        // Connect to notification socket
        sockets.notification = connectToNotificationSocket(userToken);
        
        // Connect to system socket if admin token provided
        if (adminToken) {
            sockets.system = connectToSystemSocket(adminToken);
        }
        
        console.log('All sockets initialized successfully');
        return sockets;
        
    } catch (error) {
        console.error('Failed to initialize sockets:', error);
        throw error;
    }
};

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        connectToBoardSocket,
        connectToNotificationSocket,
        connectToSystemSocket,
        disconnectAllSockets,
        reconnectAllSockets,
        getSocketStatus,
        initializeSockets
    };
}
