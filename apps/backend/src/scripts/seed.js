#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DatabaseSeeder = require('../seeders');

async function runSeeder() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Run the seeder
    const seeder = new DatabaseSeeder();
    await seeder.seed();
    
    console.log('✅ Seeding completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT. Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM. Closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the seeder
runSeeder();
