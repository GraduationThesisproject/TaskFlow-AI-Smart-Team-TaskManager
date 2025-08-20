#!/usr/bin/env node

/**
 * Enhanced Database Seeder Script
 * Provides advanced seeding functionality with modular seeders
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DatabaseSeeder = require('../seeders');

async function runEnhancedSeeder() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = parseArguments(args);

    // Connect to MongoDB
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    // Create seeder instance
    const seeder = new DatabaseSeeder();
    
    // Run the seeder with options
    await seeder.seed(options);
    
    console.log('✅ Enhanced seeding completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Enhanced seeding failed:', error);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArguments(args) {
  const options = {
    skipBackup: false,
    skipValidation: false,
    skipProgress: false,
    modules: null,
    environment: process.env.NODE_ENV || 'development'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--skip-backup':
      case '-sb':
        options.skipBackup = true;
        break;
        
      case '--skip-validation':
      case '-sv':
        options.skipValidation = true;
        break;
        
      case '--skip-progress':
      case '-sp':
        options.skipProgress = true;
        break;
        
      case '--modules':
      case '-m':
        if (i + 1 < args.length) {
          options.modules = args[i + 1].split(',').map(m => m.trim());
          i++; // Skip next argument
        }
        break;
        
      case '--environment':
      case '-e':
        if (i + 1 < args.length) {
          options.environment = args[i + 1];
          i++; // Skip next argument
        }
        break;
        
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.warn(`⚠️  Unknown option: ${arg}`);
        }
    }
  }

  return options;
}

/**
 * Print help information
 */
function printHelp() {
  console.log(`
🌱 TaskFlow Enhanced Database Seeder

Usage: node seed-enhanced.js [options]

Options:
  --skip-backup, -sb          Skip creating backup before seeding
  --skip-validation, -sv      Skip data validation
  --skip-progress, -sp        Skip progress tracking
  --modules, -m <modules>     Comma-separated list of modules to seed
  --environment, -e <env>     Set environment (development, test, production)
  --help, -h                  Show this help message

Examples:
  # Seed all modules
  node seed-enhanced.js

  # Seed only users and workspaces
  node seed-enhanced.js --modules users,workspaces

  # Seed with custom environment
  node seed-enhanced.js --environment test

  # Seed without backup and progress
  node seed-enhanced.js --skip-backup --skip-progress

Available Modules:
  - users
  - workspaces
  - spaces
  - boards
  - tags
  - tasks
  - comments
  - notifications
  - reminders
  - files
  - invitations
  - analytics

Environment Configurations:
  - development: Full seeding with test data
  - test: Minimal seeding for testing
  - production: No seeding (disabled)
  `);
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

// Run the enhanced seeder
runEnhancedSeeder();
