const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function migrateAdmin2FA() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('Connected to MongoDB');

    // Find all admin users
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin users`);

    // Update each admin with default 2FA fields if they don't exist
    for (const admin of admins) {
      const updates = {};
      
      if (admin.twoFactorAuthEnabledAt === undefined) {
        updates.twoFactorAuthEnabledAt = null;
      }
      
      if (admin.twoFactorAuthLastUsed === undefined) {
        updates.twoFactorAuthLastUsed = null;
      }
      
      if (admin.recoveryTokenExpires === undefined) {
        updates.recoveryTokenExpires = null;
      }
      
      if (Object.keys(updates).length > 0) {
        await Admin.updateOne(
          { _id: admin._id },
          { $set: updates }
        );
        console.log(`Updated admin ${admin.userEmail} with new 2FA fields`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAdmin2FA();
