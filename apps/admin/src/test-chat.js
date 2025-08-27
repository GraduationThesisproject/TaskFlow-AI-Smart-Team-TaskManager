// Simple test script for the new real-time chat system
// Run this in the browser console to test chat functionality

console.log('🧪 Testing Real-Time Chat System...');

// Test 1: Check if chat service is available
console.log('✅ Chat Service:', typeof chatService !== 'undefined' ? 'Available' : 'Not Available');

// Test 2: Check if chat socket hook is available
console.log('✅ Chat Socket Hook:', typeof useChatSocket !== 'undefined' ? 'Available' : 'Not Available');

// Test 3: Test localStorage functionality
console.log('✅ localStorage Test:');
try {
  localStorage.setItem('test-chat', 'test-value');
  const testValue = localStorage.getItem('test-chat');
  console.log('  - Set/Get:', testValue === 'test-value' ? 'PASS' : 'FAIL');
  localStorage.removeItem('test-chat');
} catch (error) {
  console.log('  - Error:', error.message);
}

// Test 4: Check authentication state
console.log('✅ Authentication State:');
const token = localStorage.getItem('adminToken');
console.log('  - Token exists:', !!token);
console.log('  - Token value:', token ? `${token.substring(0, 20)}...` : 'null');

// Test 5: Test API endpoints (if authenticated)
if (token) {
  console.log('✅ Testing API Endpoints...');
  
  // Test chat stats
  fetch('http://localhost:3001/api/chat/admin/stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('  - Chat Stats API:', data.success ? 'PASS' : 'FAIL');
    console.log('  - Stats data:', data.data?.stats);
  })
  .catch(error => {
    console.log('  - Chat Stats API Error:', error.message);
  });
  
  // Test active chats
  fetch('http://localhost:3001/api/chat/admin/active', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('  - Active Chats API:', data.success ? 'PASS' : 'FAIL');
    console.log('  - Active chats count:', data.data?.chats?.length || 0);
  })
  .catch(error => {
    console.log('  - Active Chats API Error:', error.message);
  });
} else {
  console.log('❌ Skipping API tests - no authentication token');
}

// Test 6: Test WebSocket connection
console.log('✅ Testing WebSocket Connection...');
try {
  const ws = new WebSocket('ws://localhost:3001/socket.io/?EIO=4&transport=websocket');
  
  ws.onopen = () => {
    console.log('  - WebSocket Connection: PASS');
    ws.close();
  };
  
  ws.onerror = (error) => {
    console.log('  - WebSocket Connection: FAIL');
    console.log('  - Error:', error);
  };
  
  ws.onclose = () => {
    console.log('  - WebSocket closed');
  };
} catch (error) {
  console.log('  - WebSocket Error:', error.message);
}

// Test 7: Check component state
console.log('✅ Component State Check:');
console.log('  - Chats array:', typeof chats !== 'undefined' ? 'Available' : 'Not Available');
console.log('  - Selected chat:', typeof selectedChat !== 'undefined' ? 'Available' : 'Not Available');
console.log('  - Messages array:', typeof messages !== 'undefined' ? 'Available' : 'Not Available');

console.log('🎯 Chat System Test Complete!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Check if all tests passed');
console.log('2. Try logging in as admin');
console.log('3. Navigate to Customer Support');
console.log('4. Test real-time chat functionality');
console.log('5. Check browser console for any errors');
