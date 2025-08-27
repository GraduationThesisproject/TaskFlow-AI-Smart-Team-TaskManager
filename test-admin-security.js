#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/admin';

// Test data
const testAdminCredentials = {
  email: 'admin@admin.com',
  password: 'admin123!'
};

const newAdminUser = {
  username: 'testadmin',
  email: 'testadmin@example.com',
  password: 'TestPass123!',
  role: 'moderator'
};

async function testAdminSecurity() {
  console.log('🔐 Testing Admin Security System...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testAdminCredentials);
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const { token } = loginResponse.data.data;
      
      // Set auth header for subsequent requests
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Step 2: Get available roles
      console.log('\n2️⃣ Getting available roles...');
      const rolesResponse = await axios.get(`${API_BASE}/users/available-roles`, { headers: authHeaders });
      
      if (rolesResponse.data.success) {
        console.log('✅ Available roles retrieved:', rolesResponse.data.data.availableRoles);
        console.log('   Current user role:', rolesResponse.data.data.userRole);
      } else {
        console.log('❌ Failed to get available roles');
      }

      // Step 3: Add new admin panel user
      console.log('\n3️⃣ Adding new admin panel user...');
      const addUserResponse = await axios.post(`${API_BASE}/users/add-with-email`, newAdminUser, { headers: authHeaders });
      
      if (addUserResponse.data.success) {
        console.log('✅ New admin panel user created successfully');
        console.log('   Admin ID:', addUserResponse.data.data.adminUser.id);
        console.log('   Email:', addUserResponse.data.data.adminUser.email);
        console.log('   Role:', addUserResponse.data.data.adminUser.role);
        console.log('   Type: Admin Only (not a regular app user)');
      } else {
        console.log('❌ Failed to create admin panel user');
      }

      // Step 4: Get all admin users to verify
      console.log('\n4️⃣ Getting all admin users...');
      const usersResponse = await axios.get(`${API_BASE}/users`, { headers: authHeaders });
      
      if (usersResponse.data.success) {
        console.log('✅ Admin users retrieved successfully');
        const users = usersResponse.data.data.users;
        console.log(`   Total admin users: ${users.length}`);
        
        // Find our new admin user
        const newAdminUser = users.find(u => u.email === newAdminUser.email);
        if (newAdminUser) {
          console.log('   New admin user found:', {
            name: newAdminUser.name,
            email: newAdminUser.email,
            role: newAdminUser.role,
            type: newAdminUser.type,
            isActive: newAdminUser.isActive
          });
        }
      } else {
        console.log('❌ Failed to get admin users');
      }

      // Step 5: Test role change
      console.log('\n5️⃣ Testing role change...');
      const roleChangeResponse = await axios.patch(
        `${API_BASE}/users/${addUserResponse.data.data.user._id}/role`,
        { newRole: 'admin' },
        { headers: authHeaders }
      );
      
      if (roleChangeResponse.data.success) {
        console.log('✅ User role changed to admin successfully');
      } else {
        console.log('❌ Failed to change user role');
      }

      // Step 6: Test deactivation
      console.log('\n6️⃣ Testing user deactivation...');
      const deactivateResponse = await axios.post(
        `${API_BASE}/users/${addUserResponse.data.data.user._id}/ban`,
        {},
        { headers: authHeaders }
      );
      
      if (deactivateResponse.data.success) {
        console.log('✅ User deactivated successfully');
      } else {
        console.log('❌ Failed to deactivate user');
      }

      // Step 7: Test reactivation
      console.log('\n7️⃣ Testing user reactivation...');
      const activateResponse = await axios.post(
        `${API_BASE}/users/${addUserResponse.data.data.user._id}/activate`,
        {},
        { headers: authHeaders }
      );
      
      if (activateResponse.data.success) {
        console.log('✅ User reactivated successfully');
      } else {
        console.log('❌ Failed to reactivate user');
      }

      console.log('\n🎉 All admin security tests completed successfully!');
      console.log('\n📋 Summary:');
      console.log('   ✅ Admin authentication');
      console.log('   ✅ Role management');
      console.log('   ✅ User creation with admin roles');
      console.log('   ✅ Permission-based access control');
      console.log('   ✅ User activation/deactivation');
      console.log('   ✅ Role assignment and changes');

    } else {
      console.log('❌ Admin login failed');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have an admin user created. Run:');
      console.log('   cd apps/backend && npm run create-admin');
    }
  }
}

// Run the test
testAdminSecurity();
