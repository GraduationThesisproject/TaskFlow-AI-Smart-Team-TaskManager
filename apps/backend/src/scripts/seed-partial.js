#!/usr/bin/env node

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const DatabaseSeeder = require('../seeders');

async function runPartialSeeder() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const availableOptions = [
      'users',
      'workspaces',
      'spaces',
      'projects',
      'boards',
      'tasks',
      'comments',
      'notifications',
      'clear'
    ];

    if (args.length === 0) {
      console.log('🌱 TaskFlow Database Seeder - Partial Mode');
      console.log('');
      console.log('Usage: npm run seed:partial <option>');
      console.log('');
      console.log('Available options:');
      availableOptions.forEach(option => {
        console.log(`  • ${option}`);
      });
      console.log('');
      console.log('Example: npm run seed:partial users');
      process.exit(0);
    }

    const option = args[0].toLowerCase();
    
    if (!availableOptions.includes(option)) {
      console.error(`❌ Invalid option: ${option}`);
      console.log('Available options:', availableOptions.join(', '));
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connected to MongoDB');
    
    const seeder = new DatabaseSeeder();
    
    console.log(`🌱 Running partial seeder: ${option}`);
    console.log('==========================================');
    
    switch (option) {
      case 'clear':
        await seeder.clearDatabase();
        break;
        
      case 'users':
        await seeder.createTestUsers();
        break;
        
      case 'workspaces':
        // Load existing users first
        seeder.createdUsers = await loadExistingUsers();
        await seeder.createWorkspaces();
        break;
        
      case 'spaces':
        seeder.createdUsers = await loadExistingUsers();
        seeder.createdWorkspaces = await loadExistingWorkspaces();
        await seeder.createSpaces();
        break;
        
      case 'projects':
        seeder.createdUsers = await loadExistingUsers();
        await seeder.createProjects();
        break;
        
      case 'boards':
        seeder.createdUsers = await loadExistingUsers();
        seeder.createdSpaces = await loadExistingSpaces();
        seeder.createdProjects = await loadExistingProjects();
        await seeder.createBoardsAndColumns();
        break;
        
      case 'tasks':
        seeder.createdUsers = await loadExistingUsers();
        seeder.createdBoards = await loadExistingBoards();
        seeder.createdColumns = await loadExistingColumns();
        seeder.createdProjects = await loadExistingProjects();
        seeder.createdTags = await loadExistingTags();
        await seeder.createTasks();
        break;
        
      case 'comments':
        seeder.createdUsers = await loadExistingUsers();
        seeder.createdTasks = await loadExistingTasks();
        await seeder.createComments();
        break;
        
      case 'notifications':
        seeder.createdUsers = await loadExistingUsers();
        seeder.createdTasks = await loadExistingTasks();
        await seeder.createNotifications();
        break;
        
      default:
        console.error(`❌ Option not implemented: ${option}`);
        process.exit(1);
    }
    
    console.log('==========================================');
    console.log(`✅ Partial seeding completed: ${option}`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Partial seeding failed:', error);
    process.exit(1);
  }
}

// Helper functions to load existing data
async function loadExistingUsers() {
  const User = require('../models/User');
  const UserPreferences = require('../models/UserPreferences');
  const UserRoles = require('../models/UserRoles');
  const UserSessions = require('../models/UserSessions');
  
  const users = await User.find();
  const result = [];
  
  for (let user of users) {
    const preferences = await UserPreferences.findOne({ userId: user._id });
    const roles = await UserRoles.findOne({ userId: user._id });
    const sessions = await UserSessions.findOne({ userId: user._id });
    
    result.push({ user, preferences, roles, sessions });
  }
  
  return result;
}

async function loadExistingWorkspaces() {
  const Workspace = require('../models/Workspace');
  return await Workspace.find();
}

async function loadExistingSpaces() {
  const Space = require('../models/Space');
  return await Space.find();
}

async function loadExistingProjects() {
  const Project = require('../models/Project');
  return await Project.find();
}

async function loadExistingBoards() {
  const Board = require('../models/Board');
  return await Board.find();
}

async function loadExistingColumns() {
  const Column = require('../models/Column');
  return await Column.find();
}

async function loadExistingTasks() {
  const Task = require('../models/Task');
  return await Task.find();
}

async function loadExistingTags() {
  const Tag = require('../models/Tag');
  return await Tag.find();
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

// Run the partial seeder
runPartialSeeder();
