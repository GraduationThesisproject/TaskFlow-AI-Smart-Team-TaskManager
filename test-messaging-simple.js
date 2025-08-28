const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Test user credentials
const TEST_USER = {
  email: 'admin@admin.com',
  password: 'Admin123!'
};

// Test customer data
const TEST_CUSTOMER = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  message: 'Hello! I need help with TaskFlow.'
};

let adminToken = null;
let testChatId = null;

// Utility functions
const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : type === 'WARNING' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

// Step 1: Admin Authentication
async function authenticateAdmin() {
  try {
    log('🔐 Authenticating admin...');
    
    const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    adminToken = response.data.data.token;
    log(`✅ Admin authenticated successfully!`, 'SUCCESS');
    
    return true;
  } catch (error) {
    log(`❌ Admin authentication failed: ${error.response?.data?.message || error.message}`, 'ERROR');
    return false;
  }
}

// Step 2: Test Public Chat Widget API
async function testPublicChatWidget() {
  try {
    log('📱 Testing Public Chat Widget API...');
    
    // Test 1: Start a new chat
    log('   📝 Starting new chat...');
    const startChatResponse = await axios.post(`${BASE_URL}/api/chat/widget/start`, {
      name: TEST_CUSTOMER.name,
      email: TEST_CUSTOMER.email,
      message: TEST_CUSTOMER.message,
      category: 'technical',
      priority: 'medium'
    });
    
    if (startChatResponse.data.success) {
      testChatId = startChatResponse.data.data.chat._id;
      log(`   ✅ Chat started successfully! Chat ID: ${testChatId}`, 'SUCCESS');
    } else {
      throw new Error('Failed to start chat');
    }
    
    // Test 2: Send a message to the chat
    log('   💬 Sending message to chat...');
    const sendMessageResponse = await axios.post(`${BASE_URL}/api/chat/widget/${testChatId}/message`, {
      content: 'This is a follow-up question. Can you help me?',
      name: TEST_CUSTOMER.name,
      email: TEST_CUSTOMER.email
    });
    
    if (sendMessageResponse.data.success) {
      log(`   ✅ Message sent successfully!`, 'SUCCESS');
    } else {
      throw new Error('Failed to send message');
    }
    
    log('✅ Public Chat Widget API tests passed!', 'SUCCESS');
    return true;
    
  } catch (error) {
    log(`❌ Public Chat Widget API test failed: ${error.response?.data?.message || error.message}`, 'ERROR');
    return false;
  }
}

// Step 3: Test Admin Chat Management API
async function testAdminChatManagement() {
  try {
    log('👨‍💼 Testing Admin Chat Management API...');
    
    // Test 1: Get active chats
    log('   📋 Getting active chats...');
    const activeChatsResponse = await axios.get(`${BASE_URL}/api/chat/admin/active`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (activeChatsResponse.data.success) {
      const chats = activeChatsResponse.data.data.chats;
      log(`   ✅ Active chats retrieved! Found ${chats.length} chats`, 'SUCCESS');
    } else {
      throw new Error('Failed to get active chats');
    }
    
    // Test 2: Accept chat
    log('   ✅ Accepting chat...');
    const acceptChatResponse = await axios.post(`${BASE_URL}/api/chat/admin/${testChatId}/accept`, {}, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (acceptChatResponse.data.success) {
      log(`   ✅ Chat accepted successfully!`, 'SUCCESS');
    } else {
      throw new Error('Failed to accept chat');
    }
    
    // Test 3: Send admin message
    log('   💬 Sending admin message...');
    const adminMessageResponse = await axios.post(`${BASE_URL}/api/chat/admin/${testChatId}/messages`, {
      content: 'Hello! I\'m here to help you with TaskFlow.',
      messageType: 'text'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (adminMessageResponse.data.success) {
      log(`   ✅ Admin message sent successfully!`, 'SUCCESS');
    } else {
      throw new Error('Failed to send admin message');
    }
    
    log('✅ Admin Chat Management API tests passed!', 'SUCCESS');
    return true;
    
  } catch (error) {
    log(`❌ Admin Chat Management API test failed: ${error.response?.data?.message || error.message}`, 'ERROR');
    return false;
  }
}

// Main test function
async function runMessagingTest() {
  try {
    log('🚀 Starting Messaging Customer Support System Test...', 'SUCCESS');
    
    // Step 1: Admin Authentication
    log('\n🔐 Step 1: Admin Authentication...');
    const authSuccess = await authenticateAdmin();
    if (!authSuccess) {
      throw new Error('Admin authentication failed - cannot proceed with tests');
    }
    
    // Step 2: Test Public Chat Widget API
    log('\n📱 Step 2: Testing Public Chat Widget API...');
    const widgetSuccess = await testPublicChatWidget();
    if (!widgetSuccess) {
      throw new Error('Public Chat Widget API tests failed');
    }
    
    // Step 3: Test Admin Chat Management API
    log('\n👨‍💼 Step 3: Testing Admin Chat Management API...');
    const adminSuccess = await testAdminChatManagement();
    if (!adminSuccess) {
      throw new Error('Admin Chat Management API tests failed');
    }
    
    // Final summary
    log('\n🎉 MESSAGING CUSTOMER SUPPORT SYSTEM TEST COMPLETED SUCCESSFULLY!', 'SUCCESS');
    log('\n📊 TEST RESULTS:', 'INFO');
    log('✅ Admin Authentication: SUCCESS', 'SUCCESS');
    log('✅ Public Chat Widget API: SUCCESS', 'SUCCESS');
    log('✅ Admin Chat Management API: SUCCESS', 'SUCCESS');
    
    log('\n🎯 CONCLUSION: Your messaging customer support system is working perfectly!', 'SUCCESS');
    
    return true;
    
  } catch (error) {
    log(`\n❌ TEST FAILED: ${error.message}`, 'ERROR');
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  log('🔧 Messaging Customer Support System Test', 'INFO');
  log('==========================================', 'INFO');
  
  runMessagingTest()
    .then((success) => {
      if (success) {
        log('\n🎉 All tests passed! Your messaging system is working perfectly.', 'SUCCESS');
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
  runMessagingTest,
  authenticateAdmin,
  testPublicChatWidget,
  testAdminChatManagement
};
