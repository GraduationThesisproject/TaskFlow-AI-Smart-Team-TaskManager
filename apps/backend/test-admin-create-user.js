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

async function testAdminCreateUser() {
  try {
    console.log('Testing admin user creation...');
    
    // Find an existing admin user
    const adminUser = await User.findOne({ email: 'admin@admin.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please check if the database is seeded.');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Generate token
    const token = generateToken(adminUser._id);
    console.log('✅ Token generated successfully');
    
    // Test creating a user via the admin endpoint
    console.log('\n--- Testing user creation via admin endpoint ---');
    
    const userData = {
      username: 'testuser123',
      email: 'testuser123@example.com',
      role: 'user'
    };
    
    console.log('Creating user with data:', userData);
    
    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ User created successfully:', data.data);
      
      // Clean up - delete the test user
      const createdUser = await User.findOne({ email: userData.email });
      if (createdUser) {
        await User.deleteOne({ _id: createdUser._id });
        await UserRoles.deleteOne({ userId: createdUser._id });
        console.log('✅ Test user cleaned up');
      }
    } else {
      const errorData = await response.json();
      console.log('❌ User creation failed:', response.status, errorData.message);
      
      // Check if it's a validation error
      if (errorData.data && errorData.data.errors) {
        console.log('Validation errors:', errorData.data.errors);
      }
    }
    
    console.log('\n✅ Admin user creation test completed');
    
  } catch (error) {
    console.error('❌ Error during admin user creation test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testAdminCreateUser();
