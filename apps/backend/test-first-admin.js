const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test first admin user creation and login
async function testFirstAdmin() {
  try {
    console.log('🧪 Testing First Admin User Creation and Login...\n');

    // Step 1: Create the first admin user using public endpoint
    console.log('1️⃣ Creating first admin user...');
    const createResponse = await axios.post(`${API_BASE}/admin/auth/setup-first-admin`, {
      email: 'firstadmin@example.com',
      password: 'FirstAdmin123!',
      role: 'super_admin'
    });

    console.log('✅ First admin user created successfully:', createResponse.data);
    const adminId = createResponse.data.data.admin.id;

    // Step 2: Try to login with the created admin user
    console.log('\n2️⃣ Testing login with created admin user...');
    const loginResponse = await axios.post(`${API_BASE}/admin/auth/login`, {
      email: 'firstadmin@example.com',
      password: 'FirstAdmin123!'
    });

    console.log('✅ Login successful:', {
      token: loginResponse.data.data.token ? 'Token received' : 'No token',
      admin: loginResponse.data.data.admin
    });

    console.log('\n🎉 All tests passed! First admin user creation and login is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Debugging info:');
      console.log('- Check if password is being hashed correctly');
      console.log('- Check if password field is being selected in login query');
      console.log('- Check if comparePassword method is working');
    } else if (error.response?.status === 403) {
      console.log('\n🔍 Debugging info:');
      console.log('- First admin already exists');
      console.log('- Use the protected endpoint to create additional admin users');
    }
  }
}

// Run the test
testFirstAdmin();
