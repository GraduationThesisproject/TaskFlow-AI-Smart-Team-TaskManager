const mongoose = require('mongoose');
const User = require('./src/models/User');
const UserRoles = require('./src/models/UserRoles');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testUserCreation() {
  try {
    console.log('Testing user creation...');
    
    // Test 1: Create user with password "user123!"
    console.log('\n--- Test 1: Creating user with password "user123!" ---');
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'user123!'
    };
    
    console.log('User data:', userData);
    console.log('Password validation test:');
    console.log('- Length:', userData.password.length);
    console.log('- Has letters:', /[A-Za-z]/.test(userData.password));
    console.log('- Has numbers:', /\d/.test(userData.password));
    console.log('- Has special chars:', /[@$!%*#?&]/.test(userData.password));
    
    const user = new User(userData);
    console.log('User object created successfully');
    
    // Validate the user object
    const validationError = user.validateSync();
    if (validationError) {
      console.log('Validation errors:', validationError.errors);
      return;
    }
    
    console.log('User validation passed');
    
    // Save the user
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);
    
    // Test 2: Create user role
    console.log('\n--- Test 2: Creating user role ---');
    const userRole = new UserRoles({
      userId: savedUser._id,
      systemRole: 'user'
    });
    
    const savedRole = await userRole.save();
    console.log('User role saved successfully:', savedRole._id);
    
    console.log('\n✅ All tests passed! User creation is working.');
    
    // Clean up
    await User.deleteOne({ _id: savedUser._id });
    await UserRoles.deleteOne({ _id: savedRole._id });
    console.log('Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      console.log('Validation errors:', error.errors);
    }
    
    if (error.code === 11000) {
      console.log('Duplicate key error - email already exists');
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

testUserCreation();
