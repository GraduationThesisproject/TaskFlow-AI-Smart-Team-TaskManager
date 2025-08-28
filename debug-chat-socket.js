const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Test user credentials
const TEST_USER = {
  email: 'admin@admin.com',
  password: 'Admin123!'
};

let adminToken = null;

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
    log(`   Token: ${adminToken.substring(0, 50)}...`, 'INFO');
    
    return true;
  } catch (error) {
    log(`❌ Admin authentication failed: ${error.response?.data?.message || error.message}`, 'ERROR');
    return false;
  }
}

// Step 2: Test Basic Socket Connection
async function testBasicSocketConnection() {
  try {
    log('🔌 Testing basic socket connection...');
    
    // Test 1: Connect without auth
    log('   📡 Test 1: Connecting without authentication...');
    const noAuthSocket = io(`${SOCKET_URL}/chat`, {
      timeout: 5000,
      reconnection: false
    });
    
    await new Promise((resolve, reject) => {
      noAuthSocket.on('connect', () => {
        log('     ✅ Connected without auth (this should not happen)', 'WARNING');
        noAuthSocket.disconnect();
        resolve();
      });
      
      noAuthSocket.on('connect_error', (error) => {
        log(`     ✅ Correctly rejected: ${error.message}`, 'SUCCESS');
        resolve();
      });
      
      setTimeout(() => {
        log('     ⚠️ No response (timeout)', 'WARNING');
        noAuthSocket.disconnect();
        resolve();
      }, 5000);
    });
    
    // Test 2: Connect with invalid token
    log('   📡 Test 2: Connecting with invalid token...');
    const invalidTokenSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token: 'invalid_token' },
      timeout: 5000,
      reconnection: false
    });
    
    await new Promise((resolve, reject) => {
      invalidTokenSocket.on('connect', () => {
        log('     ✅ Connected with invalid token (this should not happen)', 'WARNING');
        invalidTokenSocket.disconnect();
        resolve();
      });
      
      invalidTokenSocket.on('connect_error', (error) => {
        log(`     ✅ Correctly rejected: ${error.message}`, 'SUCCESS');
        resolve();
      });
      
      setTimeout(() => {
        log('     ⚠️ No response (timeout)', 'WARNING');
        invalidTokenSocket.disconnect();
        resolve();
      }, 5000);
    });
    
    // Test 3: Connect with valid token
    log('   📡 Test 3: Connecting with valid token...');
    const validTokenSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token: adminToken },
      timeout: 10000,
      reconnection: false
    });
    
    await new Promise((resolve, reject) => {
      validTokenSocket.on('connect', () => {
        log(`     ✅ Connected with valid token! Socket ID: ${validTokenSocket.id}`, 'SUCCESS');
        validTokenSocket.disconnect();
        resolve();
      });
      
      validTokenSocket.on('connect_error', (error) => {
        log(`     ❌ Connection failed: ${error.message}`, 'ERROR');
        reject(new Error(`Valid token connection failed: ${error.message}`));
      });
      
      setTimeout(() => {
        log('     ⚠️ No response (timeout)', 'WARNING');
        validTokenSocket.disconnect();
        reject(new Error('Valid token connection timeout'));
      }, 10000);
    });
    
    log('✅ Basic socket connection tests completed!', 'SUCCESS');
    return true;
    
  } catch (error) {
    log(`❌ Basic socket connection test failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Main debug function
async function debugChatSocket() {
  try {
    log('🚀 Starting Chat Socket Debug...', 'SUCCESS');
    
    // Step 1: Admin Authentication
    log('\n🔐 Step 1: Admin Authentication...');
    const authSuccess = await authenticateAdmin();
    if (!authSuccess) {
      throw new Error('Admin authentication failed - cannot proceed with tests');
    }
    
    // Step 2: Test Basic Socket Connection
    log('\n🔌 Step 2: Testing Basic Socket Connection...');
    const socketSuccess = await testBasicSocketConnection();
    if (!socketSuccess) {
      throw new Error('Basic socket connection tests failed');
    }
    
    log('\n🎉 CHAT SOCKET DEBUG COMPLETED!', 'SUCCESS');
    log('💡 This will help identify where the issue is occurring.', 'INFO');
    
    return true;
    
  } catch (error) {
    log(`\n❌ DEBUG FAILED: ${error.message}`, 'ERROR');
    return false;
  }
}

// Run the debug if this file is executed directly
if (require.main === module) {
  log('🔧 Chat Socket Debug', 'INFO');
  log('====================', 'INFO');
  
  debugChatSocket()
    .then((success) => {
      if (success) {
        log('\n🎉 Debug completed successfully!', 'SUCCESS');
        process.exit(0);
      } else {
        log('\n❌ Debug failed. Check the error messages above.', 'ERROR');
        process.exit(1);
      }
    })
    .catch((error) => {
      log(`\n💥 Debug execution crashed: ${error.message}`, 'ERROR');
      process.exit(1);
    });
}

module.exports = {
  debugChatSocket,
  authenticateAdmin,
  testBasicSocketConnection
};
