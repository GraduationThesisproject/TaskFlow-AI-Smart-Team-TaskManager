const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAdminAuth() {
  try {
    console.log('🔍 Testing Admin Authentication...\n');
    
    // Test 1: Check if admin endpoint is accessible
    console.log('📡 Test 1: Checking admin endpoint accessibility...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }
    
    // Test 2: Try admin login with different credentials
    const testCredentials = [
      { email: 'admin@admin.com', password: 'admin123!' },
      { email: 'admin@admin.com', password: 'Admin123!' },
      { email: 'admin@taskflow.com', password: 'Admin123!' },
      { email: 'moderator@taskflow.com', password: 'Moderator123!' }
    ];
    
    for (let i = 0; i < testCredentials.length; i++) {
      const creds = testCredentials[i];
      console.log(`\n🔐 Test ${i + 2}: Trying ${creds.email} / ${creds.password}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/admin/auth/login`, creds, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Login successful!');
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.success && response.data.data && response.data.data.token) {
          console.log('🎉 Found working credentials!');
          console.log('Token:', response.data.data.token.substring(0, 20) + '...');
          console.log('Admin ID:', response.data.data.admin.id);
          return response.data.data;
        }
        
      } catch (error) {
        if (error.response) {
          console.log('❌ Login failed with status:', error.response.status);
          console.log('Error response:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.log('❌ Network error:', error.message);
        }
      }
    }
    
    console.log('\n❌ No working credentials found');
    
  } catch (error) {
    console.error('💥 Script error:', error.message);
  }
}

// Run the test
testAdminAuth();
