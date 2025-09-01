const io = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

const adminUser = {
  email: 'admin.test@gmail.com',
  password: '12345678A!'
};

async function testAdminNotification() {
  console.log('🧪 Testing Admin Chat Notification\n');
  
  let adminSocket = null;
  let adminToken = null;
  
  try {
    // 1. Login as admin
    console.log('1️⃣ Admin login...');
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, adminUser);
    adminToken = adminLogin.data.data.token;
    console.log('✅ Admin logged in');
    
    // 2. Connect admin socket
    console.log('2️⃣ Connecting admin socket...');
    adminSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token: adminToken },
      transports: ['websocket']
    });
    
    // 3. Set up admin notification listener
    let notificationReceived = false;
    adminSocket.on('admin:new-chat-request', (data) => {
      console.log('🎉 Admin received notification!', {
        chatId: data.chatId,
        user: data.user?.name,
        message: data.message
      });
      notificationReceived = true;
    });
    
    adminSocket.on('connect', () => {
      console.log('✅ Admin socket connected, rooms joined:', adminSocket.rooms || 'unknown');
    });
    
    adminSocket.on('connect_error', (error) => {
      console.log('❌ Admin socket error:', error.message);
    });
    
    // 4. Wait for connection
    await new Promise((resolve, reject) => {
      adminSocket.on('connect', resolve);
      adminSocket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    console.log('3️⃣ Admin socket connected successfully');
    
    // 5. Wait a moment for socket setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 6. Create a test chat
    console.log('4️⃣ Creating test chat...');
    const chatData = {
      name: 'Test User for Admin Notification',
      email: 'testnotif@example.com',
      message: 'Hello admin, this is a test notification!',
      category: 'general',
      priority: 'high'
    };
    
    const response = await axios.post(`${BASE_URL}/api/chat/widget/start`, chatData);
    console.log('✅ Chat created:', response.data.success);
    
    // 7. Wait for notification
    console.log('5️⃣ Waiting for admin notification...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 8. Check result
    if (notificationReceived) {
      console.log('🎉 SUCCESS: Admin notification system is working!');
    } else {
      console.log('❌ FAILED: Admin did not receive notification');
      
      // Debug: Check socket rooms
      console.log('🔍 Debug info:');
      console.log('- Socket ID:', adminSocket.id);
      console.log('- Connected:', adminSocket.connected);
      
      // Try emitting a test event to see if socket is working
      adminSocket.emit('test-event', { message: 'test' });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (adminSocket) {
      adminSocket.disconnect();
    }
  }
}

testAdminNotification();
