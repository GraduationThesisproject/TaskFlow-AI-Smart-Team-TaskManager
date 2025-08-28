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

// Reset admin password directly in database
const resetAdminPasswordDirect = async () => {
  try {
    console.log('🔐 Resetting admin password directly...');
    
    // Hash new password
    const newPassword = 'admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('🔑 New password hash:', hashedPassword);
    
    // Update password directly in database using updateOne to bypass middleware
    const result = await mongoose.connection.db.collection('admins').updateOne(
      { userEmail: 'admin@admin.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.matchedCount === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    if (result.modifiedCount === 0) {
      console.log('⚠️ Password was not modified (might be the same)');
    } else {
      console.log('✅ Password updated successfully in database');
    }
    
    console.log('📋 New credentials:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123!');
    
    // Verify the update
    const admin = await mongoose.connection.db.collection('admins').findOne({ userEmail: 'admin@admin.com' });
    if (admin) {
      console.log('🔍 Verification - Stored password hash:', admin.password);
      console.log('🔍 Verification - Hash matches:', admin.password === hashedPassword);
    }
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Direct Admin Password Reset...');
    
    // Connect to database
    await connectDB();
    
    // Reset password
    await resetAdminPasswordDirect();
    
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
