const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Test admin and user credentials
const adminUser = {
  email: 'admin.test@gmail.com',
  password: '12345678A!'
};

const testUser = {
  email: 'user.test@gmail.com',
  password: '12345678A!'
};

const mockUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  message: 'Hello, I need help with my account!'
};

let adminToken = null;
let userToken = null;
let adminSocket = null;
let userSocket = null;
let testChatId = null;

async function loginAsAdmin() {
  try {
    console.log('🔐 Admin logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, adminUser);
    adminToken = response.data.data.token;
    console.log('✅ Admin login successful');
    return adminToken;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function loginAsUser() {
  try {
    console.log('🔐 User logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    userToken = response.data.data.token;
    console.log('✅ User login successful');
    return userToken;
  } catch (error) {
    console.error('❌ User login failed:', error.response?.data || error.message);
    throw error;
  }
}

function connectAdminSocket(token) {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting admin to Chat Socket.IO...');
    
    adminSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    adminSocket.on('connect', () => {
      console.log('✅ Admin socket connected successfully');
      // Join admin room
      adminSocket.emit('admin:join', {});
      resolve(adminSocket);
    });

    adminSocket.on('connect_error', (error) => {
      console.error('❌ Admin socket connection error:', error);
      reject(error);
    });
  });
}

function connectUserSocket(token) {
  return new Promise((resolve, reject) => {
    console.log('🔌 Connecting user to Chat Socket.IO...');
    
    userSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    userSocket.on('connect', () => {
      console.log('✅ User socket connected successfully');
      resolve(userSocket);
    });

    userSocket.on('connect_error', (error) => {
      console.error('❌ User socket connection error:', error);
      reject(error);
    });
  });
}

function setupAdminListeners() {
  console.log('👂 Setting up admin listeners...');
  
  adminSocket.on('admin:new-chat-request', (data) => {
    console.log('🆕 Admin received new chat request:', {
      chatId: data.chatId,
      user: data.user.name,
      message: data.message,
      category: data.category,
      priority: data.priority
    });
    
    // Store chat ID for further testing
    testChatId = data.chatId;
    
    // Simulate admin accepting the chat
    setTimeout(() => {
      adminSocket.emit('admin:accept-chat', { chatId: data.chatId });
      console.log('👍 Admin accepted chat:', data.chatId);
    }, 2000);
  });

  adminSocket.on('chat:message', (data) => {
    console.log('📨 Admin received message:', {
      chatId: data.chatId,
      content: data.message.content,
      sender: data.message.sender.name
    });
  });

  adminSocket.on('admin:chat-accepted', (data) => {
    console.log('✅ Chat accepted by admin:', data);
  });
}

function setupUserListeners() {
  console.log('👂 Setting up user listeners...');
  
  userSocket.on('chat:message', (data) => {
    console.log('📨 User received message:', {
      chatId: data.chatId,
      content: data.message.content,
      sender: data.message.sender.name
    });
  });

  userSocket.on('chat:status-updated', (data) => {
    console.log('📊 User received status update:', {
      chatId: data.chatId,
      status: data.status
    });
  });

  userSocket.on('admin:chat-accepted', (data) => {
    console.log('✅ User notified - chat accepted by admin:', data);
  });
}

async function simulateUserStartingChat() {
  try {
    console.log('\n🧪 Simulating user starting chat...');
    
    const response = await axios.post(`${BASE_URL}/api/chat/widget/start`, mockUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User chat started successfully:', {
      success: response.data.success,
      chatId: response.data.data?.chat?._id
    });
    
    return response.data.data?.chat?._id;
  } catch (error) {
    console.error('❌ User chat start failed:', error.response?.data || error.message);
    throw error;
  }
}

async function simulateAdminReply() {
  if (!testChatId) {
    console.log('⚠️ No test chat ID available for admin reply');
    return;
  }

  try {
    console.log('\n🧪 Simulating admin reply...');
    
    const adminMessage = {
      chatId: testChatId,
      content: 'Hello! I received your message. How can I help you today?',
      messageType: 'text'
    };

    adminSocket.emit('chat:send-message', adminMessage);
    console.log('✅ Admin sent reply:', adminMessage.content);
  } catch (error) {
    console.error('❌ Admin reply failed:', error.message);
  }
}

async function simulateUserReply() {
  if (!testChatId) {
    console.log('⚠️ No test chat ID available for user reply');
    return;
  }

  try {
    console.log('\n🧪 Simulating user reply...');
    
    const userMessage = {
      content: 'Thank you! I have a question about billing.',
      name: mockUser.name,
      email: mockUser.email
    };

    const response = await axios.post(`${BASE_URL}/api/chat/widget/${testChatId}/message`, userMessage, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User sent reply:', userMessage.content);
  } catch (error) {
    console.error('❌ User reply failed:', error.response?.data || error.message);
  }
}

async function testChatStats() {
  try {
    console.log('\n🧪 Testing admin chat stats...');
    
    const response = await axios.get(`${BASE_URL}/api/chat/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Chat stats retrieved:', {
      totalChats: response.data.data?.totalChats || 0,
      activeChats: response.data.data?.activeChats || 0,
      avgResponseTime: response.data.data?.avgResponseTime || 'N/A'
    });
  } catch (error) {
    console.error('❌ Chat stats test failed:', error.response?.data || error.message);
  }
}

async function testGetActiveChats() {
  try {
    console.log('\n🧪 Testing get active chats...');
    
    const response = await axios.get(`${BASE_URL}/api/chat/admin/active`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Active chats retrieved:', {
      count: response.data.data?.length || 0,
      chats: response.data.data?.map(chat => ({
        id: chat._id,
        status: chat.status,
        participant: chat.participants?.[0]?.name
      })) || []
    });
  } catch (error) {
    console.error('❌ Get active chats test failed:', error.response?.data || error.message);
  }
}

async function runIntegrationTests() {
  try {
    console.log('🚀 Starting Admin-User Chat Integration Tests\n');
    
    // Step 1: Login as admin
    await loginAsAdmin();
    
    // Step 2: Login as user
    await loginAsUser();
    
    // Step 3: Connect admin socket
    await connectAdminSocket(adminToken);
    
    // Step 4: Connect user socket
    await connectUserSocket(userToken);
    
    // Step 5: Setup listeners
    setupAdminListeners();
    setupUserListeners();
    
    // Wait for connections to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Test chat stats (before any chats)
    await testChatStats();
    
    // Step 7: User starts chat
    await simulateUserStartingChat();
    
    // Step 8: Wait for admin to receive notification and accept
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Step 9: Admin replies
    await simulateAdminReply();
    
    // Step 10: Wait for message processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 11: User replies back
    await simulateUserReply();
    
    // Step 12: Wait for message processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 13: Test get active chats
    await testGetActiveChats();
    
    // Step 14: Test updated chat stats
    await testChatStats();
    
    // Keep connections alive to see final events
    console.log('\n⏳ Waiting for final events...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n✅ All admin-user chat integration tests completed!');
    
  } catch (error) {
    console.error('\n❌ Chat integration test suite failed:', error.message);
  } finally {
    // Cleanup
    if (adminSocket) {
      adminSocket.disconnect();
      console.log('🔌 Admin socket disconnected');
    }
    if (userSocket) {
      userSocket.disconnect();
      console.log('🔌 User socket disconnected');
    }
    process.exit(0);
  }
}

// Run the tests
runIntegrationTests();
