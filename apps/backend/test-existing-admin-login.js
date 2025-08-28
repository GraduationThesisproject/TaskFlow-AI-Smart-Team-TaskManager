const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test existing admin users from README
const adminUsers = [
  {
    email: 'admin@taskflow.com',
    password: 'Admin123!',
    role: 'admin',
    name: 'System Administrator'
  },
  {
    email: 'moderator@taskflow.com',
    password: 'Moderator123!',
    role: 'moderator',
    name: 'Content Moderator'
  },
  {
    email: 'viewer@taskflow.com',
    password: 'Viewer123!',
    role: 'viewer',
    name: 'Read-Only Viewer'
  }
];

async function testExistingAdminLogin() {
  try {
    console.log('🧪 Testing Existing Admin User Login...\n');
    
    for (const adminUser of adminUsers) {
      console.log(`🔐 Testing login for: ${adminUser.name} (${adminUser.email})`);
      
      try {
        const response = await axios.post(`${API_BASE}/admin/auth/login`, {
          email: adminUser.email,
          password: adminUser.password
        });
        
        if (response.data.success) {
          console.log(`✅ Login successful for ${adminUser.email}`);
          console.log(`   Role: ${response.data.data.admin.role}`);
          console.log(`   Token: ${response.data.data.token ? 'Received' : 'Not received'}`);
          
          if (response.data.data.requires2FA) {
            console.log(`   ⚠️  2FA required for this account`);
          }
        } else {
          console.log(`❌ Login failed for ${adminUser.email}: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ Login failed for ${adminUser.email}:`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Message: ${error.response.data.message || 'Unknown error'}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testExistingAdminLogin();
