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

// Fix admin password
const fixAdminPassword = async () => {
  try {
    console.log('🔐 Fixing admin password...');
    
    // Hash the correct password
    const correctPassword = 'admin123!';
    const hashedPassword = await bcrypt.hash(correctPassword, 12);
    
    console.log('🔑 New password hash:', hashedPassword);
    
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
      console.log('⚠️ Password was not modified');
    } else {
      console.log('✅ Password updated successfully');
    }
    
    // Verify the update
    const admin = await mongoose.connection.db.collection('admins').findOne({ userEmail: 'admin@admin.com' });
    if (admin) {
      console.log('🔍 Verification - New password hash:', admin.password);
      
      // Test the password comparison
      const isMatch = await bcrypt.compare(correctPassword, admin.password);
      console.log('🔍 Password comparison test:', isMatch);
    }
    
    console.log('📋 Admin credentials:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123!');
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Admin Password Fix...');
    
    // Connect to database
    await connectDB();
    
    // Fix password
    await fixAdminPassword();
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Password fix failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
