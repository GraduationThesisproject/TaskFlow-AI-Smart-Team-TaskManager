const { io } = require('socket.io-client');

console.log('🔍 Testing socket connection...');

// Test basic socket connection to test namespace
const socket = io('http://localhost:3001/test', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!');
  console.log(`Socket ID: ${socket.id}`);
  
  // Test ping/pong
  console.log('Testing ping/pong...');
  socket.emit('ping');
});

socket.on('pong', (data) => {
  console.log('✅ Ping/pong successful:', data);
});

socket.on('connected', (data) => {
  console.log('✅ Connected event received:', data);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket connection error:', err.message);
});

socket.on('error', (err) => {
  console.error('❌ Socket error:', err);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

// Set timeout to close connection
setTimeout(() => {
  console.log('Closing connection...');
  socket.disconnect();
  process.exit(0);
}, 5000);
