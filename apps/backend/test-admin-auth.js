const mongoose = require('mongoose');
const User = require('./src/models/User');
const Admin = require('./src/models/Admin');
const UserRoles = require('./src/models/UserRoles');
const { generateToken } = require('./src/utils/jwt');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAdminAuth() {
  try {
    console.log('Testing admin authentication...');
    
    // Find an existing admin user
    const adminUser = await User.findOne({ email: 'admin@admin.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please check if the database is seeded.');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Check admin record
    const adminRecord = await Admin.findOne({ userId: adminUser._id });
    if (!adminRecord) {
      console.log('❌ Admin record not found for user');
      return;
    }
    
    console.log('✅ Admin record found, role:', adminRecord.role);
    
    // Check user roles
    const userRoles = await UserRoles.findOne({ userId: adminUser._id });
    if (!userRoles) {
      console.log('❌ User roles not found');
      return;
    }
    
    console.log('✅ User roles found, systemRole:', userRoles.systemRole);
    
    // Generate token
    const token = generateToken(adminUser._id);
    console.log('✅ Token generated successfully');
    
    // Test the token by making a request to the admin endpoint
    console.log('\n--- Testing admin endpoint with token ---');
    
    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin endpoint working, users count:', data.data?.users?.length || 0);
    } else {
      const errorData = await response.json();
      console.log('❌ Admin endpoint failed:', response.status, errorData.message);
    }
    
    console.log('\n✅ Admin authentication test completed');
    
  } catch (error) {
    console.error('❌ Error during admin auth test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testAdminAuth();
