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

// Reset admin password
const resetAdminPassword = async () => {
  try {
    console.log('🔐 Resetting admin password...');
    
    // Import Admin model
    const Admin = require('./src/models/Admin');
    
    // Find the admin user
    const admin = await Admin.findOne({ userEmail: 'admin@admin.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin found:', admin.userName);
    
    // Hash new password
    const saltRounds = 12;
    const newPassword = 'admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Password updated successfully');
    console.log('📋 New credentials:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123!');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Admin Password Reset...');
    
    // Connect to database
    await connectDB();
    
    // Reset password
    await resetAdminPassword();
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
