const mongoose = require('mongoose');
require('dotenv').config();

// Import the seeder
const { seedAdmins, getAdminStats } = require('./src/seeders/adminSeeder');

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

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Admin Seeder...');
    
    // Connect to database
    await connectDB();
    
    // Seed admins
    await seedAdmins();
    
    // Get statistics
    await getAdminStats();
    
    console.log('✅ Admin seeding completed successfully!');
    console.log('\n📋 Default Admin Credentials:');
    console.log('Email: admin@admin.com');
    console.log('Password: admin123!');
    console.log('Role: super_admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
main();
