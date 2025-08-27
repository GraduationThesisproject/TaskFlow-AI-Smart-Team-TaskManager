const { io } = require('socket.io-client');

// Test socket connection without authentication
async function testSocketWithoutAuth() {
  console.log('🔍 Testing socket connection WITHOUT authentication...');
  
  return new Promise((resolve) => {
    const socket = io('http://localhost:3001', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('❌ Unexpected: Socket connected without auth!');
      socket.disconnect();
      resolve({ success: false, error: 'Connected without authentication' });
    });

    socket.on('connect_error', (err) => {
      console.log('✅ Expected: Socket connection failed without auth');
      console.log('   Error:', err.message);
      socket.disconnect();
      resolve({ success: true, error: err.message });
    });

    socket.on('error', (err) => {
      console.log('❌ Socket error:', err);
      socket.disconnect();
      resolve({ success: false, error: err.toString() });
    });

    socket.connect();
  });
}

// Test socket connection with invalid token
async function testSocketWithInvalidToken() {
  console.log('🔍 Testing socket connection with INVALID token...');
  
  return new Promise((resolve) => {
    const socket = io('http://localhost:3001', {
      autoConnect: false,
      auth: { token: 'invalid-token-here' },
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('❌ Unexpected: Socket connected with invalid token!');
      socket.disconnect();
      resolve({ success: false, error: 'Connected with invalid token' });
    });

    socket.on('connect_error', (err) => {
      console.log('✅ Expected: Socket connection failed with invalid token');
      console.log('   Error:', err.message);
      socket.disconnect();
      resolve({ success: true, error: err.message });
    });

    socket.on('error', (err) => {
      console.log('❌ Socket error:', err);
      socket.disconnect();
      resolve({ success: false, error: err.toString() });
    });

    socket.connect();
  });
}

// Test HTTP health endpoint
async function testHealthEndpoint() {
  console.log('🔍 Testing HTTP health endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health endpoint working:', data);
      return { success: true, data };
    } else {
      console.log('❌ Health endpoint failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (err) {
    console.log('❌ Health endpoint error:', err.message);
    return { success: false, error: err.message };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Socket.IO Authentication Tests...\n');
  
  // Test 1: Health endpoint
  const healthResult = await testHealthEndpoint();
  console.log(`Health Test: ${healthResult.success ? 'PASS' : 'FAIL'}\n`);
  
  // Test 2: Socket without auth
  const noAuthResult = await testSocketWithoutAuth();
  console.log(`No Auth Test: ${noAuthResult.success ? 'PASS' : 'FAIL'}\n`);
  
  // Test 3: Socket with invalid token
  const invalidTokenResult = await testSocketWithInvalidToken();
  console.log(`Invalid Token Test: ${invalidTokenResult.success ? 'PASS' : 'FAIL'}\n`);
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`Health Endpoint: ${healthResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`No Authentication: ${noAuthResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid Token: ${invalidTokenResult.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = healthResult.success && noAuthResult.success && invalidTokenResult.success;
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\n🔍 Debug Information:');
    if (!healthResult.success) console.log('Health endpoint issue:', healthResult.error);
    if (!noAuthResult.success) console.log('No auth issue:', noAuthResult.error);
    if (!invalidTokenResult.success) console.log('Invalid token issue:', invalidTokenResult.error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testHealthEndpoint, testSocketWithoutAuth, testSocketWithInvalidToken };
