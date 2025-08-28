const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3001';

console.log('🔍 Testing Socket Connection...\n');

// Test 1: Basic socket connection without auth
console.log('📡 Test 1: Basic socket connection without authentication...');
const basicSocket = io(SOCKET_URL, {
  timeout: 5000,
  reconnection: false
});

basicSocket.on('connect', () => {
  console.log('✅ Basic socket connected successfully!');
  console.log('Socket ID:', basicSocket.id);
  basicSocket.disconnect();
});

basicSocket.on('connect_error', (error) => {
  console.log('❌ Basic socket connection failed:', error.message);
});

basicSocket.on('error', (error) => {
  console.log('❌ Basic socket error:', error);
});

// Test 2: Socket connection with invalid token
console.log('\n📡 Test 2: Socket connection with invalid token...');
const invalidTokenSocket = io(SOCKET_URL, {
  auth: { token: 'invalid-token' },
  timeout: 5000,
  reconnection: false
});

invalidTokenSocket.on('connect', () => {
  console.log('✅ Invalid token socket connected (this should not happen)');
  invalidTokenSocket.disconnect();
});

invalidTokenSocket.on('connect_error', (error) => {
  console.log('❌ Invalid token socket connection failed:', error.message);
});

invalidTokenSocket.on('error', (error) => {
  console.log('❌ Invalid token socket error:', error);
});

// Test 3: Socket connection with valid token
console.log('\n📡 Test 3: Socket connection with valid token...');
const validTokenSocket = io(`${SOCKET_URL}/notifications`, {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjAyNWFkMGJkNzM3MWI0ODc0MTFjYSIsImlhdCI6MTc1NjM5MTk0NiwiZXhwIjoxNzU2OTk2NzQ2LCJhdWQiOiJ0YXNrZmxvdy11c2VycyIsImlzcyI6InRhc2tmbG93LWFwaSJ9.VPPZ6MdS0jzVL8zARcCjfP2rLjgJFzDf72O8VBEQALs' },
  timeout: 5000,
  reconnection: false
});

validTokenSocket.on('connect', () => {
  console.log('✅ Valid token socket connected successfully!');
  console.log('Socket ID:', validTokenSocket.id);
  
  // Test socket events
  console.log('📡 Testing socket events...');
  validTokenSocket.emit('notifications:getUnreadCount');
  
  validTokenSocket.on('notifications:unreadCount', (data) => {
    console.log('✅ Received unread count:', data);
  });
  
  validTokenSocket.on('error', (data) => {
    console.log('❌ Socket error event:', data);
  });
  
  // Wait a bit then disconnect
  setTimeout(() => {
    validTokenSocket.disconnect();
  }, 3000);
});

validTokenSocket.on('connect_error', (error) => {
  console.log('❌ Valid token socket connection failed:', error.message);
});

validTokenSocket.on('error', (error) => {
  console.log('❌ Valid token socket error:', error);
});

// Cleanup after 10 seconds
setTimeout(() => {
  console.log('\n🧹 Cleaning up...');
  basicSocket.disconnect();
  invalidTokenSocket.disconnect();
  validTokenSocket.disconnect();
  process.exit(0);
}, 10000);
