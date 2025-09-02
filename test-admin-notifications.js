const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Admin credentials from the logs
const adminUser = {
  email: 'admin@admin.com',
  password: 'admin123'
};

let authToken = null;
let socket = null;

async function adminLogin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, adminUser);
    authToken = response.data.data.token;
    console.log('✅ Admin login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting to Socket.IO...');
    
    socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      reject(error);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });
}

function setupNotificationListeners() {
  console.log('👂 Setting up notification listeners...');
  
  // Listen for new notifications
  socket.on('notification:new', (data) => {
    console.log('📢 New notification received:', {
      id: data.notification._id,
      title: data.notification.title,
      message: data.notification.message,
      type: data.notification.type,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for typed notifications
  socket.on('notification:typed', (data) => {
    console.log('📢 Typed notification received:', {
      type: data.type,
      notification: data.notification
    });
  });

  // Listen for unread count updates
  socket.on('notifications:unreadCount', (data) => {
    console.log('📊 Unread count updated:', data.count);
  });

  // Listen for marked as read events
  socket.on('notifications:marked-read', (data) => {
    console.log('✅ Notification marked as read:', data.notificationId);
  });

  // Listen for all marked as read events
  socket.on('notifications:all-marked-read', () => {
    console.log('✅ All notifications marked as read');
  });

  // Listen for recent notifications
  socket.on('notifications:recent', (data) => {
    console.log('📋 Recent notifications:', data.notifications.length, 'items');
  });

  // Listen for subscription confirmations
  socket.on('notifications:subscribed', (data) => {
    console.log('📌 Subscribed to notification types:', data.types);
  });

  // Listen for unsubscription confirmations
  socket.on('notifications:unsubscribed', (data) => {
    console.log('📌 Unsubscribed from notification types:', data.types);
  });
}

async function testNotificationCreation() {
  try {
    console.log('\n🧪 Testing notification creation...');
    
    const notificationData = {
      recipientId: '68b025ad0bd7371b487411ca', // Admin user ID from logs
      title: 'Admin Test Notification',
      message: 'This is a test notification sent by admin at ' + new Date().toISOString(),
      type: 'admin_test',
      relatedEntity: {
        entityType: 'admin_test',
        entityId: 'admin-test-entity-' + Date.now()
      }
    };

    const response = await axios.post(`${BASE_URL}/api/test/create-notification`, notificationData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test notification created:', response.data);
    return response.data.notification;
  } catch (error) {
    console.error('❌ Failed to create test notification:', error.response?.data || error.message);
    throw error;
  }
}

async function testBulkNotifications() {
  try {
    console.log('\n🧪 Testing bulk notifications...');
    
    const notifications = [
      {
        recipient: '68b025ad0bd7371b487411ca',
        title: 'Admin Bulk Test 1',
        message: 'First admin bulk notification',
        type: 'admin_bulk_test',
        relatedEntity: {
          entityType: 'admin_test',
          entityId: 'admin-bulk-1'
        }
      },
      {
        recipient: '68b025ad0bd7371b487411ca',
        title: 'Admin Bulk Test 2',
        message: 'Second admin bulk notification',
        type: 'admin_bulk_test',
        relatedEntity: {
          entityType: 'admin_test',
          entityId: 'admin-bulk-2'
        }
      }
    ];

    const response = await axios.post(`${BASE_URL}/api/test/bulk-notifications`, { notifications }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Bulk notifications sent:', response.data);
    return response.data.results;
  } catch (error) {
    console.error('❌ Failed to send bulk notifications:', error.response?.data || error.message);
    throw error;
  }
}

async function testSystemBroadcast() {
  try {
    console.log('\n🧪 Testing system broadcast...');
    
    const broadcastData = {
      title: 'Admin System Broadcast Test',
      message: 'This is a system-wide broadcast notification from admin',
      type: 'admin_system_broadcast'
    };

    const response = await axios.post(`${BASE_URL}/api/test/broadcast-system`, broadcastData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ System broadcast sent:', response.data);
    return response.data.results;
  } catch (error) {
    console.error('❌ Failed to send system broadcast:', error.response?.data || error.message);
    throw error;
  }
}

async function testSocketOperations() {
  try {
    console.log('\n🧪 Testing socket operations...');
    
    // Get unread count
    socket.emit('notifications:getUnreadCount');
    
    // Subscribe to specific notification types
    socket.emit('notifications:subscribe', { 
      types: ['admin_test', 'admin_bulk_test', 'admin_system_broadcast'] 
    });
    
    // Get recent notifications
    socket.emit('notifications:getRecent', { limit: 5 });
    
    console.log('✅ Socket operations initiated');
  } catch (error) {
    console.error('❌ Socket operations failed:', error.message);
    throw error;
  }
}

async function testNotificationMarking() {
  try {
    console.log('\n🧪 Testing notification marking...');
    
    // First get recent notifications to have an ID to mark
    socket.emit('notifications:getRecent', { limit: 1 });
    
    // Wait a bit then mark all as read
    setTimeout(() => {
      socket.emit('notifications:markAllRead');
      console.log('✅ Mark all as read initiated');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Notification marking failed:', error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Admin Real-time Notification Tests\n');
    
    // Step 1: Admin Login
    await adminLogin();
    
    // Step 2: Connect to Socket.IO
    await connectSocket(authToken);
    
    // Step 3: Setup listeners
    setupNotificationListeners();
    
    // Step 4: Test socket operations
    await testSocketOperations();
    
    // Wait for initial data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Test notification creation
    await testNotificationCreation();
    
    // Wait for notification to be received
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Test bulk notifications
    await testBulkNotifications();
    
    // Wait for bulk notifications to be received
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 7: Test system broadcast
    await testSystemBroadcast();
    
    // Wait for broadcast to be received
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 8: Test notification marking
    await testNotificationMarking();
    
    // Keep the connection alive for a bit to see all notifications
    console.log('\n⏳ Waiting for notifications to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
      console.log('🔌 Socket disconnected');
    }
    process.exit(0);
  }
}

// Run the tests
runTests();
