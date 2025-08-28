const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Default admin users from README
const adminUsers = [
  {
    email: 'admin@admin.com',
    password: 'Admin123!',
    role: 'super_admin',
    name: 'Super Administrator'
  },
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

async function createFirstAdmin() {
  try {
    console.log('🔐 Creating First Admin User...\n');
    
    // Try to create the first admin using the public endpoint
    const firstAdmin = adminUsers[0]; // Use the super admin as first
    
    console.log(`📝 Creating first admin: ${firstAdmin.name} (${firstAdmin.email})...`);
    
    const response = await axios.post(`${API_BASE}/admin/auth/setup-first-admin`, {
      email: firstAdmin.email,
      password: firstAdmin.password,
      role: firstAdmin.role
    });
    
    console.log(`✅ First admin created successfully!`);
    console.log(`   ID: ${response.data.data.admin.id}`);
    console.log(`   Role: ${response.data.data.admin.role}`);
    console.log(`   Email: ${response.data.data.admin.email}\n`);
    
    return response.data.data.admin;
    
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('⚠️  First admin already exists, skipping creation...\n');
      return null;
    } else {
      console.error('❌ Failed to create first admin:', error.response?.data?.message || error.message);
      return null;
    }
  }
}

async function createAdditionalAdmins(firstAdmin) {
  console.log('🔐 Creating Additional Admin Users...\n');
  
  // Skip the first admin if it was already created
  const additionalUsers = firstAdmin ? adminUsers.slice(1) : adminUsers;
  
  for (const user of additionalUsers) {
    try {
      console.log(`📝 Creating ${user.name} (${user.email})...`);
      
      // For additional admins, we need to use the protected endpoint
      // But since we don't have a token yet, we'll skip these for now
      console.log(`⚠️  Skipping ${user.email} - requires admin authentication\n`);
      
    } catch (error) {
      console.error(`❌ Failed to create ${user.name}:`, error.response?.data?.message || error.message);
      console.log('');
    }
  }
  
  console.log('📋 Note: Additional admin users require authentication to create.');
  console.log('   You can create them after logging in with the first admin.\n');
}

async function testLogin() {
  console.log('🧪 Testing Login with Created Users...\n');
  
  for (const user of adminUsers) {
    try {
      console.log(`🔑 Testing login for ${user.email}...`);
      
      const response = await axios.post(`${API_BASE}/admin/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      console.log(`✅ Login successful for ${user.email}`);
      console.log(`   Token: ${response.data.data.token ? '✅ Received' : '❌ Missing'}`);
      console.log(`   Role: ${response.data.data.admin.systemRole || response.data.data.admin.role}\n`);
      
    } catch (error) {
      console.error(`❌ Login failed for ${user.email}:`, error.response?.data?.message || error.message);
      console.log('');
    }
  }
}

async function main() {
  try {
    console.log('🚀 TaskFlow Admin User Setup\n');
    console.log('=====================================\n');
    
    // Step 1: Create first admin
    const firstAdmin = await createFirstAdmin();
    
    // Step 2: Try to create additional admins (will be skipped)
    await createAdditionalAdmins(firstAdmin);
    
    // Step 3: Test login
    await testLogin();
    
    console.log('🎉 Setup completed!');
    console.log('\n📋 Available Login Credentials:');
    console.log('=====================================');
    
    if (firstAdmin) {
      console.log(`✅ ${firstAdmin.email} | Admin123! | Role: ${firstAdmin.role}`);
      console.log('   (This user was created successfully)');
    } else {
      console.log(`⚠️  ${adminUsers[0].email} | Admin123! | Role: ${adminUsers[0].role}`);
      console.log('   (This user already exists)');
    }
    
    console.log('\n📝 To create additional admin users:');
    console.log('1. Login with an existing admin account');
    console.log('2. Use the admin management panel');
    console.log('3. Or use the protected API endpoints');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

main();
