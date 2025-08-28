const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test password comparison
const testPasswordComparison = async () => {
  try {
    console.log('🔐 Testing password comparison...');
    
    // Import Admin model
    const Admin = require('./src/models/Admin');
    
    // Find the admin user
    const admin = await Admin.findOne({ userEmail: 'admin@admin.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin found:', admin.userName);
    console.log('📧 Email:', admin.userEmail);
    console.log('🔑 Stored password hash:', admin.password);
    console.log('🔑 Password hash length:', admin.password ? admin.password.length : 0);
    
    // Test the comparePassword method
    const testPassword = 'admin123!';
    console.log('\n🧪 Testing password comparison...');
    console.log('Input password:', testPassword);
    
    try {
      const isMatch = await admin.comparePassword(testPassword);
      console.log('✅ comparePassword result:', isMatch);
    } catch (error) {
      console.log('❌ comparePassword error:', error.message);
    }
    
    // Test direct bcrypt comparison
    console.log('\n🧪 Testing direct bcrypt comparison...');
    try {
      const directMatch = await bcrypt.compare(testPassword, admin.password);
      console.log('✅ Direct bcrypt result:', directMatch);
    } catch (error) {
      console.log('❌ Direct bcrypt error:', error.message);
    }
    
    // Test with wrong password
    console.log('\n🧪 Testing wrong password...');
    try {
      const wrongMatch = await admin.comparePassword('wrongpassword');
      console.log('✅ Wrong password result:', wrongMatch);
    } catch (error) {
      console.log('❌ Wrong password error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing password:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Password Comparison Test...');
    
    // Connect to database
    await connectDB();
    
    // Test password comparison
    await testPasswordComparison();
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
main();
