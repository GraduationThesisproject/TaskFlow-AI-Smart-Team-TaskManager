const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test admin user creation and login
async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin User Creation and Login...\n');

    // Step 1: Create an admin user
    console.log('1️⃣ Creating admin user...');
    const createResponse = await axios.post(`${API_BASE}/admin/users/add-admin`, {
      email: 'testadmin@example.com',
      password: 'TestPassword123!',
      role: 'moderator'
    });

    console.log('✅ Admin user created successfully:', createResponse.data);
    const adminId = createResponse.data.data.admin.id;

    // Step 2: Try to login with the created admin user
    console.log('\n2️⃣ Testing login with created admin user...');
    const loginResponse = await axios.post(`${API_BASE}/admin/auth/login`, {
      email: 'testadmin@example.com',
      password: 'TestPassword123!'
    });

    console.log('✅ Login successful:', {
      token: loginResponse.data.data.token ? 'Token received' : 'No token',
      admin: loginResponse.data.data.admin
    });

    console.log('\n🎉 All tests passed! Admin user creation and login is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Debugging info:');
      console.log('- Check if password is being hashed correctly');
      console.log('- Check if password field is being selected in login query');
      console.log('- Check if comparePassword method is working');
    }
  }
}

// Run the test
testAdminLogin();
