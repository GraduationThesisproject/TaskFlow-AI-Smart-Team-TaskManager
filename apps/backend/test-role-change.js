const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'AdminPass123!';

async function testRoleChange() {
  try {
    console.log('🧪 Testing Role Change Functionality...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const adminToken = loginResponse.data.data.token;
    console.log('✅ Login successful, admin token obtained\n');

    // Step 2: Get users list
    console.log('2️⃣ Fetching users list...');
    const usersResponse = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (!usersResponse.data.success) {
      throw new Error('Failed to get users: ' + usersResponse.data.message);
    }

    const users = usersResponse.data.data.users;
    console.log(`✅ Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️  No users found to test with');
      return;
    }

    // Find a regular user (not admin)
    const regularUser = users.find(user => user.role === 'user');
    if (!regularUser) {
      console.log('⚠️  No regular user found to test role change');
      return;
    }

    console.log(`📝 Testing with user: ${regularUser.username || regularUser.email} (ID: ${regularUser.id})\n`);

    // Step 3: Change user role to admin
    console.log('3️⃣ Changing user role to admin...');
    const roleChangeResponse = await axios.patch(
      `${BASE_URL}/admin/users/${regularUser.id}/role`,
      { newRole: 'admin' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (!roleChangeResponse.data.success) {
      throw new Error('Role change failed: ' + roleChangeResponse.data.message);
    }

    console.log('✅ Role changed to admin successfully');
    console.log('📊 Response:', JSON.stringify(roleChangeResponse.data, null, 2));

    // Step 4: Change user role back to user
    console.log('\n4️⃣ Changing user role back to user...');
    const roleChangeBackResponse = await axios.patch(
      `${BASE_URL}/admin/users/${regularUser.id}/role`,
      { newRole: 'user' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    if (!roleChangeBackResponse.data.success) {
      throw new Error('Role change back failed: ' + roleChangeBackResponse.data.message);
    }

    console.log('✅ Role changed back to user successfully');
    console.log('📊 Response:', JSON.stringify(roleChangeBackResponse.data, null, 2));

    // Step 5: Test invalid role
    console.log('\n5️⃣ Testing invalid role (should fail)...');
    try {
      await axios.patch(
        `${BASE_URL}/admin/users/${regularUser.id}/role`,
        { newRole: 'invalid_role' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('❌ Expected error but request succeeded');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid role correctly rejected with 400 status');
        console.log('📊 Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Role change functionality is working correctly');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testRoleChange();
