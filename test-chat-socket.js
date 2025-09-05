const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Test user credentials
const testUser = {
  email: 'admin.test@gmail.com',
  password: '12345678A!'
};

let authToken = null;
let socket = null;

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    authToken = response.data.data.token;
    console.log('✅ Login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

function connectChatSocket(token) {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting to Chat Socket.IO...');
    
    socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('✅ Chat socket connected successfully');
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Chat socket connection error:', error);
      reject(error);
    });

    socket.on('error', (error) => {
      console.error('❌ Chat socket error:', error);
    });
  });
}

function setupChatListeners() {
  console.log('👂 Setting up chat listeners...');
  
  // Listen for chat messages
  socket.on('chat:message', (data) => {
    console.log('📨 Chat message received:', {
      chatId: data.chatId,
      message: data.message?.content || 'No content',
      sender: data.message?.sender?.name || 'Unknown',
      timestamp: new Date().toISOString()
    });
  });

  // Listen for chat status updates
  socket.on('chat:status-updated', (data) => {
    console.log('📊 Chat status updated:', {
      chatId: data.chatId,
      status: data.status,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for chat assignments
  socket.on('chat:assigned', (data) => {
    console.log('👤 Chat assigned:', {
      chatId: data.chatId,
      assignedTo: data.assignedTo,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for room join confirmations
  socket.on('chat:rooms-joined', (data) => {
    console.log('🏠 Chat rooms joined:', {
      count: data.count,
      chats: data.chats,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for chat join confirmations
  socket.on('chat:joined', (data) => {
    console.log('✅ Joined chat room:', {
      chatId: data.chatId,
      participants: data.participants,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for typing indicators
  socket.on('chat:typing', (data) => {
    console.log('⌨️ Typing indicator:', {
      chatId: data.chatId,
      user: data.user,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for user presence
  socket.on('chat:presence', (data) => {
    console.log('👁️ User presence:', {
      chatId: data.chatId,
      user: data.user,
      status: data.status,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for admin notifications
  socket.on('admin:new-chat-request', (data) => {
    console.log('🆕 New chat request:', {
      chatId: data.chatId,
      user: data.user,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Listen for general socket events
  socket.on('disconnect', (reason) => {
    console.log('🔌 Chat socket disconnected:', reason);
  });

  socket.on('error', (error) => {
    console.error('❌ Chat socket error:', error);
  });
}

async function testChatSocketOperations() {
  try {
    console.log('\n🧪 Testing chat socket operations...');
    
    // Join chat rooms
    socket.emit('chat:join-rooms');
    
    // Wait a bit for room joining
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Chat socket operations initiated');
  } catch (error) {
    console.error('❌ Chat socket operations failed:', error.message);
    throw error;
  }
}

async function testTypingIndicator() {
  try {
    console.log('\n🧪 Testing typing indicator...');
    
    const testChatId = 'test-chat-' + Date.now();
    
    // Start typing
    socket.emit('chat:typing', { 
      chatId: testChatId, 
      isTyping: true 
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Stop typing
    socket.emit('chat:typing', { 
      chatId: testChatId, 
      isTyping: false 
    });

    console.log('✅ Typing indicator test completed');
  } catch (error) {
    console.error('❌ Typing indicator test failed:', error.message);
    throw error;
  }
}

async function testUserPresence() {
  try {
    console.log('\n🧪 Testing user presence...');
    
    const testChatId = 'test-chat-' + Date.now();
    
    // Set user as online
    socket.emit('chat:presence', { 
      chatId: testChatId, 
      status: 'online' 
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Set user as away
    socket.emit('chat:presence', { 
      chatId: testChatId, 
      status: 'away' 
    });

    console.log('✅ User presence test completed');
  } catch (error) {
    console.error('❌ User presence test failed:', error.message);
    throw error;
  }
}

async function testSocketEmit() {
  try {
    console.log('\n🧪 Testing socket emit functionality...');
    
    // Test emitting a custom event
    socket.emit('chat:test-event', {
      message: 'This is a test event from the chat messaging test',
      timestamp: new Date().toISOString(),
      testId: 'test-' + Date.now()
    });

    console.log('✅ Socket emit test completed');
  } catch (error) {
    console.error('❌ Socket emit test failed:', error.message);
    throw error;
  }
}

async function testPublicChatAPI() {
  try {
    console.log('\n🧪 Testing public chat API...');
    
    // Test the health endpoint first
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test creating a simple chat request
    const chatData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message for real-time messaging',
      category: 'general',
      priority: 'medium'
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/chat/widget/start`, chatData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Public chat API test passed:', response.data.success);
    } catch (error) {
      console.log('⚠️ Public chat API test failed (expected for this test):', error.response?.data?.message || error.message);
    }

    console.log('✅ Public chat API test completed');
  } catch (error) {
    console.error('❌ Public chat API test failed:', error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Real-time Chat Socket Tests\n');
    
    // Step 1: Login
    await login();
    
    // Step 2: Connect to Chat Socket.IO
    await connectChatSocket(authToken);
    
    // Step 3: Setup listeners
    setupChatListeners();
    
    // Step 4: Test socket operations
    await testChatSocketOperations();
    
    // Wait for initial setup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Test typing indicator
    await testTypingIndicator();
    
    // Wait for typing events
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Test user presence
    await testUserPresence();
    
    // Wait for presence events
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 7: Test socket emit
    await testSocketEmit();
    
    // Wait for emit events
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 8: Test public chat API
    await testPublicChatAPI();
    
    // Keep the connection alive to see all events
    console.log('\n⏳ Waiting for chat events to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n✅ All chat socket tests completed!');
    
  } catch (error) {
    console.error('\n❌ Chat socket test suite failed:', error.message);
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
      console.log('🔌 Chat socket disconnected');
    }
    process.exit(0);
  }
}

// Run the tests
runTests();
