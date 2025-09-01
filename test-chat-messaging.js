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
let chatId = null;

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
      message: data.message.content,
      sender: data.message.sender.name,
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
}

async function createTestChat() {
  try {
    console.log('\n🧪 Creating test chat...');
    
    const chatData = {
      name: 'Test User',
      email: 'admin.test@gmail.com',
      message: 'Hello! This is a test chat for real-time messaging support.',
      category: 'support',
      priority: 'medium'
    };

    const response = await axios.post(`${BASE_URL}/api/chat/widget/start`, chatData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test chat created:', response.data);
    chatId = response.data.data._id;
    return chatId;
  } catch (error) {
    console.error('❌ Failed to create test chat:', error.response?.data || error.message);
    throw error;
  }
}

async function testChatSocketOperations() {
  try {
    console.log('\n🧪 Testing chat socket operations...');
    
    // Join chat rooms
    socket.emit('chat:join-rooms');
    
    // Wait a bit for room joining
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Join specific chat if we have one
    if (chatId) {
      socket.emit('chat:join', { chatId });
    }
    
    console.log('✅ Chat socket operations initiated');
  } catch (error) {
    console.error('❌ Chat socket operations failed:', error.message);
    throw error;
  }
}

async function testMessageSending() {
  try {
    console.log('\n🧪 Testing message sending...');
    
    if (!chatId) {
      console.log('⚠️ No chat ID available, skipping message test');
      return;
    }

    const messageData = {
      content: 'Hello! This is a test message from the real-time messaging test.',
      name: 'Test User',
      email: 'admin.test@gmail.com'
    };

    const response = await axios.post(`${BASE_URL}/api/chat/widget/${chatId}/message`, messageData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Message sent successfully:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to send message:', error.response?.data || error.message);
    throw error;
  }
}

async function testTypingIndicator() {
  try {
    console.log('\n🧪 Testing typing indicator...');
    
    if (!chatId) {
      console.log('⚠️ No chat ID available, skipping typing test');
      return;
    }

    // Start typing
    socket.emit('chat:typing', { 
      chatId, 
      isTyping: true 
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Stop typing
    socket.emit('chat:typing', { 
      chatId, 
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
    
    if (!chatId) {
      console.log('⚠️ No chat ID available, skipping presence test');
      return;
    }

    // Set user as online
    socket.emit('chat:presence', { 
      chatId, 
      status: 'online' 
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Set user as away
    socket.emit('chat:presence', { 
      chatId, 
      status: 'away' 
    });

    console.log('✅ User presence test completed');
  } catch (error) {
    console.error('❌ User presence test failed:', error.message);
    throw error;
  }
}

async function testChatStatusUpdates() {
  try {
    console.log('\n🧪 Testing chat status updates...');
    
    if (!chatId) {
      console.log('⚠️ No chat ID available, skipping status test');
      return;
    }

    // For public chat, we can only test getting chat history
    const response = await axios.get(`${BASE_URL}/api/chat/widget/${chatId}/history`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Chat history retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get chat history:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Real-time Chat Messaging Tests\n');
    
    // Step 1: Login
    await login();
    
    // Step 2: Connect to Chat Socket.IO
    await connectChatSocket(authToken);
    
    // Step 3: Setup listeners
    setupChatListeners();
    
    // Step 4: Create test chat
    await createTestChat();
    
    // Step 5: Test socket operations
    await testChatSocketOperations();
    
    // Wait for initial setup
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Test message sending
    await testMessageSending();
    
    // Wait for message to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 7: Test typing indicator
    await testTypingIndicator();
    
    // Wait for typing events
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 8: Test user presence
    await testUserPresence();
    
    // Wait for presence events
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 9: Test chat status updates
    await testChatStatusUpdates();
    
    // Keep the connection alive to see all events
    console.log('\n⏳ Waiting for chat events to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n✅ All chat messaging tests completed!');
    
  } catch (error) {
    console.error('\n❌ Chat messaging test suite failed:', error.message);
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
