/**
 * Script to fix manually inserted user password
 * Run this to hash the password for superadmin.test@gmail.com
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require('./src/models/User');

async function fixPassword() {
  try {
    console.log('🔍 Looking for superadmin.test@gmail.com...');
    
    // Find the user
    const user = await User.findOne({ email: 'superadmin.test@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.name);
    console.log('🔐 Current password field length:', user.password ? user.password.length : 'null');
    
    // Check if password is already hashed (bcrypt hashes are 60 characters)
    if (user.password && user.password.length === 60 && user.password.startsWith('$2a$')) {
      console.log('✅ Password is already properly hashed');
      return;
    }
    
    // Hash the password manually
    const plainPassword = '12345678A!';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Update the user with hashed password
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password has been hashed and updated');
    console.log('🔐 New password hash length:', user.password.length);
    
    // Test the password
    const isValid = await user.comparePassword(plainPassword);
    console.log('🧪 Password validation test:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixPassword();
