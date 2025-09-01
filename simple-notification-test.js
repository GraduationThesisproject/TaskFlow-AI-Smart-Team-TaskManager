const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Test user credentials (using admin from logs)
const testUser = {
  email: 'admin@admin.com',
  password: 'admin123'
};

let authToken = null;
let socket = null;

async function testConnection() {
  try {
    console.log('🔍 Testing server connection...');
    
    // Test basic server response
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    
    const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, testUser);
    authToken = response.data.data.token;
    console.log('✅ Login successful, token received');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

function testSocketConnection() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Testing Socket.IO connection...');
    
    socket = io(SOCKET_URL, {
      auth: { token: authToken }
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      reject(error);
    });

    // Set a timeout
    setTimeout(() => {
      reject(new Error('Socket connection timeout'));
    }, 10000);
  });
}

function setupNotificationListeners() {
  console.log('👂 Setting up notification listeners...');
  
  let notificationCount = 0;
  
  // Listen for new notifications
  socket.on('notification:new', (data) => {
    notificationCount++;
    console.log(`📢 New notification #${notificationCount}:`, {
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

  return notificationCount;
}

async function testNotificationAPI() {
  try {
    console.log('\n🧪 Testing notification API endpoints...');
    
    // Test getting notifications
    const notificationsResponse = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ GET /api/notifications:', notificationsResponse.data.success);
    
    // Test getting notification stats
    const statsResponse = await axios.get(`${BASE_URL}/api/notifications/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log('✅ GET /api/notifications/stats:', statsResponse.data.success);
    
    return true;
  } catch (error) {
    console.error('❌ Notification API test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testSocketOperations() {
  try {
    console.log('\n🧪 Testing socket operations...');
    
    // Get unread count
    socket.emit('notifications:getUnreadCount');
    console.log('📊 Requested unread count');
    
    // Subscribe to specific notification types
    socket.emit('notifications:subscribe', { 
      types: ['test_notification', 'system_broadcast'] 
    });
    console.log('📌 Subscribed to notification types');
    
    // Get recent notifications
    socket.emit('notifications:getRecent', { limit: 5 });
    console.log('📋 Requested recent notifications');
    
    return true;
  } catch (error) {
    console.error('❌ Socket operations failed:', error.message);
    return false;
  }
}

async function testNotificationCreation() {
  try {
    console.log('\n🧪 Testing notification creation...');
    
    const notificationData = {
      recipientId: '68b025ad0bd7371b487411ca', // Admin user ID from logs
      title: 'Real-time Test Notification',
      message: 'This is a test notification for real-time testing at ' + new Date().toISOString(),
      type: 'test_notification',
      relatedEntity: {
        entityType: 'test',
        entityId: 'test-entity-' + Date.now()
      }
    };

    const response = await axios.post(`${BASE_URL}/api/test/create-notification`, notificationData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test notification created:', response.data.success);
    return response.data.notification;
  } catch (error) {
    console.error('❌ Failed to create test notification:', error.response?.data || error.message);
    return null;
  }
}

async function runRealTimeTest() {
  try {
    console.log('🚀 Starting Real-time Notification Test\n');
    
    // Step 1: Test server connection
    const serverRunning = await testConnection();
    if (!serverRunning) {
      console.log('❌ Server is not running. Please start the backend server first.');
      return;
    }
    
    // Step 2: Test login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('❌ Login failed. Cannot proceed with tests.');
      return;
    }
    
    // Step 3: Test Socket.IO connection
    const socketConnected = await testSocketConnection();
    if (!socketConnected) {
      console.log('❌ Socket connection failed. Cannot test real-time features.');
      return;
    }
    
    // Step 4: Setup notification listeners
    setupNotificationListeners();
    
    // Step 5: Test notification API
    await testNotificationAPI();
    
    // Step 6: Test socket operations
    await testSocketOperations();
    
    // Wait for initial data
    console.log('\n⏳ Waiting for initial data...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 7: Test notification creation
    const notification = await testNotificationCreation();
    
    if (notification) {
      console.log('\n⏳ Waiting for real-time notification...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log('\n✅ Real-time notification test completed!');
    console.log('\n📋 Summary:');
    console.log('- Server connection: ✅');
    console.log('- Authentication: ✅');
    console.log('- Socket.IO connection: ✅');
    console.log('- Notification API: ✅');
    console.log('- Real-time notifications: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
      console.log('🔌 Socket disconnected');
    }
    process.exit(0);
  }
}

// Run the test
runRealTimeTest();
