#!/usr/bin/env node

/**
 * Create Admin Script
 * Simple script to create a single admin user
 */

require('dotenv').config();
const { createSingleAdmin } = require('../src/seeders/createAdmin');

const run = async () => {
  try {
    console.log('🚀 Creating admin user...');
    await createSingleAdmin();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Password: admin123!');
    console.log('🌐 Login at: http://localhost:3000/login');
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  }
};

run();
