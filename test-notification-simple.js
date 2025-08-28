const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Test user credentials - Using existing admin user from your system
const TEST_USER = {
  email: 'admin@admin.com',     // Super admin user from your seeders
  password: 'Admin123!'         // Working password (capital A)
};

let authToken = null;
let socket = null;
let testUserId = null;

// Utility functions
const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : type === 'WARNING' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Step 1: Authenticate
async function authenticate() {
  try {
    log('🔐 Authenticating with the server...');
    
    const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    authToken = response.data.data.token;
    testUserId = response.data.data.admin.id;
    log(`✅ Authentication successful! Admin ID: ${testUserId}`, 'SUCCESS');
    
    return true;
  } catch (error) {
    log(`❌ Authentication failed: ${error.response?.data?.message || error.message}`, 'ERROR');
    log('💡 Make sure to update TEST_USER credentials in the script with a valid user', 'WARNING');
    return false;
  }
}

// Step 2: Connect to notification socket
function connectSocket() {
  return new Promise((resolve, reject) => {
    log('🔌 Connecting to notification socket...');
    
    socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token: authToken },
      timeout: 10000,
      reconnection: false
    });

    socket.on('connect', () => {
      log(`✅ Socket connected successfully! Socket ID: ${socket.id}`, 'SUCCESS');
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      log(`❌ Socket connection failed: ${error.message}`, 'ERROR');
      reject(error);
    });

    socket.on('error', (error) => {
      log(`❌ Socket error: ${error.message}`, 'ERROR');
      reject(error);
    });

    // Connection timeout
    setTimeout(() => {
      if (!socket.connected) {
        reject(new Error('Socket connection timeout after 10 seconds'));
      }
    }, 10000);
  });
}

// Step 3: Test basic socket functionality
async function testBasicSocketFunctionality() {
  log('🧪 Testing basic socket functionality...');
  
  return new Promise((resolve, reject) => {
    let unreadCountReceived = false;
    
    socket.on('notifications:unreadCount', (data) => {
      log(`🔢 Received unread count: ${data.count} notifications`, 'SUCCESS');
      unreadCountReceived = true;
      resolve({ success: true, count: data });
    });
    
    socket.emit('notifications:getUnreadCount');
    
    setTimeout(() => {
      if (!unreadCountReceived) {
        reject(new Error('Timeout: No response from unread count request'));
      }
    }, 5000);
  });
}

// Step 4: Create a test notification
async function createTestNotification() {
  log('📝 Creating a test notification...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/test/create-notification`, {
      recipientId: testUserId,
      title: '🧪 Real-time Test Notification',
      message: 'This notification was sent to test real-time delivery!',
      type: 'test_notification',
      relatedEntity: {
        entityType: 'test',
        entityId: `test-${Date.now()}`
      }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log(`✅ Test notification created successfully! ID: ${response.data.notification._id}`, 'SUCCESS');
    return response.data.notification;
    
  } catch (error) {
    log(`❌ Failed to create test notification: ${error.response?.data?.message || error.message}`, 'ERROR');
    throw error;
  }
}

// Step 5: Wait for real-time notification
async function waitForRealTimeNotification() {
  log('📨 Waiting for real-time notification delivery...');
  
  return new Promise((resolve, reject) => {
    let notificationReceived = false;
    
    socket.on('notification:new', (data) => {
      log(`📨 REAL-TIME NOTIFICATION RECEIVED! 🎉`, 'SUCCESS');
      log(`   Title: ${data.notification.title}`, 'SUCCESS');
      log(`   Message: ${data.notification.message}`, 'SUCCESS');
      log(`   Type: ${data.notification.type}`, 'SUCCESS');
      log(`   Created: ${new Date(data.notification.createdAt).toLocaleString()}`, 'SUCCESS');
      
      notificationReceived = true;
      resolve({ success: true, notification: data.notification });
    });
    
    // Wait for notification (max 10 seconds)
    setTimeout(() => {
      if (!notificationReceived) {
        reject(new Error('Timeout: No real-time notification received after 10 seconds'));
      }
    }, 10000);
  });
}

// Step 6: Test notification marking as read
async function testMarkAsRead(notificationId) {
  log('✅ Testing mark as read functionality...');
  
  try {
    const response = await axios.put(`${BASE_URL}/api/notifications/${notificationId}/mark-read`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log(`✅ Notification marked as read successfully!`, 'SUCCESS');
    return response.data;
    
  } catch (error) {
    log(`❌ Failed to mark notification as read: ${error.response?.data?.message || error.message}`, 'ERROR');
    throw error;
  }
}

// Main test function
async function runNotificationTest() {
  try {
    log('🚀 Starting notification system real-time test...', 'SUCCESS');
    log('📋 This test will verify if notifications work in real-time', 'INFO');
    
    // Step 1: Authenticate
    const authSuccess = await authenticate();
    if (!authSuccess) {
      throw new Error('Authentication failed - cannot proceed with tests');
    }
    
    // Step 2: Connect socket
    await connectSocket();
    
    // Step 3: Test basic functionality
    log('\n📡 Step 1: Testing basic socket functionality...');
    const basicResult = await testBasicSocketFunctionality();
    log(`✅ Basic socket test passed! Unread count: ${basicResult.count}`, 'SUCCESS');
    
    // Step 4: Create test notification
    log('\n📝 Step 2: Creating test notification...');
    const testNotification = await createTestNotification();
    
    // Step 5: Wait for real-time delivery
    log('\n📨 Step 3: Testing real-time notification delivery...');
    const realtimeResult = await waitForRealTimeNotification();
    log(`✅ Real-time delivery test PASSED! 🎉`, 'SUCCESS');
    
    // Step 6: Test mark as read
    log('\n✅ Step 4: Testing mark as read...');
    await testMarkAsRead(testNotification._id);
    
    // Final summary
    log('\n🎉 NOTIFICATION SYSTEM TEST COMPLETED SUCCESSFULLY!', 'SUCCESS');
    log('\n📊 TEST RESULTS:', 'INFO');
    log('✅ Socket connection: SUCCESS', 'SUCCESS');
    log('✅ Authentication: SUCCESS', 'SUCCESS');
    log('✅ Basic functionality: SUCCESS', 'SUCCESS');
    log('✅ Real-time delivery: SUCCESS', 'SUCCESS');
    log('✅ Mark as read: SUCCESS', 'SUCCESS');
    
    log('\n🎯 CONCLUSION: Your notification system IS working in real-time!', 'SUCCESS');
    log('💡 Users will receive notifications instantly when they are created.', 'INFO');
    
    return true;
    
  } catch (error) {
    log(`\n❌ TEST FAILED: ${error.message}`, 'ERROR');
    
    if (error.message.includes('Authentication failed')) {
      log('💡 Solution: Update TEST_USER credentials in the script', 'WARNING');
    } else if (error.message.includes('Socket connection')) {
      log('💡 Solution: Make sure your backend server is running on port 3001', 'WARNING');
    } else if (error.message.includes('real-time notification')) {
      log('💡 Solution: Check if Socket.IO is properly configured in your backend', 'WARNING');
    }
    
    return false;
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
      log('🔌 Socket disconnected', 'INFO');
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  log('🔧 Notification System Real-time Test', 'INFO');
  log('=====================================', 'INFO');
  
  runNotificationTest()
    .then((success) => {
      if (success) {
        log('\n🎉 All tests passed! Your notification system is working perfectly.', 'SUCCESS');
        process.exit(0);
      } else {
        log('\n❌ Some tests failed. Check the error messages above.', 'ERROR');
        process.exit(1);
      }
    })
    .catch((error) => {
      log(`\n💥 Test execution crashed: ${error.message}`, 'ERROR');
      process.exit(1);
    });
}

module.exports = {
  runNotificationTest,
  authenticate,
  connectSocket,
  testBasicSocketFunctionality,
  createTestNotification,
  waitForRealTimeNotification
};
