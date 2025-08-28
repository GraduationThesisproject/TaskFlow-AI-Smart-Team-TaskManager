const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Fix admin password to match README
const fixAdminPassword = async () => {
  try {
    console.log('🔐 Fixing admin password to match README...');
    
    // Use the password from README: Admin123!
    const correctPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(correctPassword, 12);
    
    console.log('🔑 New password hash created for:', correctPassword);
    
    // Update the admin password directly in the database
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
      console.log('✅ Password updated successfully');
    }
    
    // Verify the update
    const admin = await mongoose.connection.db.collection('admins').findOne({ userEmail: 'admin@admin.com' });
    if (admin) {
      console.log('🔍 Verification - New password hash stored');
      
      // Test the password comparison
      const isMatch = await bcrypt.compare(correctPassword, admin.password);
      console.log('🔍 Password comparison test:', isMatch ? '✅ PASSED' : '❌ FAILED');
    }
    
    console.log('\n📋 Updated Admin Credentials:');
    console.log('Email: admin@admin.com');
    console.log('Password: Admin123! (matches README)');
    console.log('Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await fixAdminPassword();
    console.log('\n🎉 Password fix completed!');
    console.log('You can now login with the credentials from your README.');
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

main();
