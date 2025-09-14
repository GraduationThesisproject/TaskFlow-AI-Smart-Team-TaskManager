#!/usr/bin/env node

/**
 * Database Cleanup Script: Remove Null User References
 * 
 * This script identifies and removes invalid user references from:
 * - Space members with null user references
 * - Workspace members with null user references
 * - Orphaned user references (users that no longer exist)
 * 
 * Usage:
 *   node scripts/cleanup-null-users.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run    Show what would be cleaned without making changes
 *   --verbose    Show detailed information about each operation
 */

const mongoose = require('mongoose');
const Space = require('../src/models/Space');
const Workspace = require('../src/models/Workspace');
const User = require('../src/models/User');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

console.log('🧹 Database Cleanup: Null User References');
console.log('==========================================');
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be made)'}`);
console.log(`Verbose: ${isVerbose ? 'ON' : 'OFF'}`);
console.log('');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function cleanupSpaceMembers() {
  console.log('🔍 Checking Space Members...');
  
  const spaces = await Space.find({}).populate('members.user');
  let totalCleaned = 0;
  let spacesAffected = 0;
  
  for (const space of spaces) {
    const originalMemberCount = space.members.length;
    const invalidMembers = [];
    
    // Find members with null user references
    space.members.forEach((member, index) => {
      if (!member.user || member.user === null) {
        invalidMembers.push({
          index,
          memberId: member._id,
          role: member.role,
          joinedAt: member.joinedAt
        });
      }
    });
    
    if (invalidMembers.length > 0) {
      spacesAffected++;
      console.log(`  📁 Space "${space.name}" (${space._id}):`);
      console.log(`     Found ${invalidMembers.length} invalid member(s) out of ${originalMemberCount} total`);
      
      if (isVerbose) {
        invalidMembers.forEach(invalid => {
          console.log(`     - Member ${invalid.memberId}: role=${invalid.role}, joined=${invalid.joinedAt}`);
        });
      }
      
      if (!isDryRun) {
        // Remove invalid members
        space.members = space.members.filter(member => member.user !== null);
        space.stats.activeMembersCount = space.members.length;
        await space.save();
        console.log(`     ✅ Cleaned ${invalidMembers.length} invalid member(s)`);
      } else {
        console.log(`     🔍 Would clean ${invalidMembers.length} invalid member(s)`);
      }
      
      totalCleaned += invalidMembers.length;
    }
  }
  
  console.log(`📊 Space Members Summary:`);
  console.log(`   Spaces affected: ${spacesAffected}`);
  console.log(`   Invalid members found: ${totalCleaned}`);
  console.log('');
  
  return { spacesAffected, totalCleaned };
}

async function cleanupWorkspaceMembers() {
  console.log('🔍 Checking Workspace Members...');
  
  const workspaces = await Workspace.find({}).populate('members.user');
  let totalCleaned = 0;
  let workspacesAffected = 0;
  
  for (const workspace of workspaces) {
    const originalMemberCount = workspace.members.length;
    const invalidMembers = [];
    
    // Find members with null user references
    workspace.members.forEach((member, index) => {
      if (!member.user || member.user === null) {
        invalidMembers.push({
          index,
          memberId: member._id,
          role: member.role,
          joinedAt: member.joinedAt
        });
      }
    });
    
    if (invalidMembers.length > 0) {
      workspacesAffected++;
      console.log(`  🏢 Workspace "${workspace.name}" (${workspace._id}):`);
      console.log(`     Found ${invalidMembers.length} invalid member(s) out of ${originalMemberCount} total`);
      
      if (isVerbose) {
        invalidMembers.forEach(invalid => {
          console.log(`     - Member ${invalid.memberId}: role=${invalid.role}, joined=${invalid.joinedAt}`);
        });
      }
      
      if (!isDryRun) {
        // Remove invalid members
        workspace.members = workspace.members.filter(member => member.user !== null);
        await workspace.save();
        console.log(`     ✅ Cleaned ${invalidMembers.length} invalid member(s)`);
      } else {
        console.log(`     🔍 Would clean ${invalidMembers.length} invalid member(s)`);
      }
      
      totalCleaned += invalidMembers.length;
    }
  }
  
  console.log(`📊 Workspace Members Summary:`);
  console.log(`   Workspaces affected: ${workspacesAffected}`);
  console.log(`   Invalid members found: ${totalCleaned}`);
  console.log('');
  
  return { workspacesAffected, totalCleaned };
}

async function cleanupOrphanedReferences() {
  console.log('🔍 Checking for Orphaned User References...');
  
  // Get all user IDs that exist
  const existingUserIds = new Set();
  const users = await User.find({}, '_id');
  users.forEach(user => existingUserIds.add(user._id.toString()));
  
  console.log(`   Found ${existingUserIds.size} existing users in database`);
  
  // Check space members for orphaned references
  const spaces = await Space.find({});
  let orphanedSpaceMembers = 0;
  let spacesWithOrphans = 0;
  
  for (const space of spaces) {
    const invalidMembers = space.members.filter(member => {
      const userId = member.user.toString();
      return !existingUserIds.has(userId);
    });
    
    if (invalidMembers.length > 0) {
      spacesWithOrphans++;
      orphanedSpaceMembers += invalidMembers.length;
      
      console.log(`  📁 Space "${space.name}": ${invalidMembers.length} orphaned references`);
      
      if (!isDryRun) {
        space.members = space.members.filter(member => {
          const userId = member.user.toString();
          return existingUserIds.has(userId);
        });
        space.stats.activeMembersCount = space.members.length;
        await space.save();
        console.log(`     ✅ Cleaned ${invalidMembers.length} orphaned reference(s)`);
      } else {
        console.log(`     🔍 Would clean ${invalidMembers.length} orphaned reference(s)`);
      }
    }
  }
  
  // Check workspace members for orphaned references
  const workspaces = await Workspace.find({});
  let orphanedWorkspaceMembers = 0;
  let workspacesWithOrphans = 0;
  
  for (const workspace of workspaces) {
    const invalidMembers = workspace.members.filter(member => {
      const userId = member.user.toString();
      return !existingUserIds.has(userId);
    });
    
    if (invalidMembers.length > 0) {
      workspacesWithOrphans++;
      orphanedWorkspaceMembers += invalidMembers.length;
      
      console.log(`  🏢 Workspace "${workspace.name}": ${invalidMembers.length} orphaned references`);
      
      if (!isDryRun) {
        workspace.members = workspace.members.filter(member => {
          const userId = member.user.toString();
          return existingUserIds.has(userId);
        });
        await workspace.save();
        console.log(`     ✅ Cleaned ${invalidMembers.length} orphaned reference(s)`);
      } else {
        console.log(`     🔍 Would clean ${invalidMembers.length} orphaned reference(s)`);
      }
    }
  }
  
  console.log(`📊 Orphaned References Summary:`);
  console.log(`   Spaces with orphans: ${spacesWithOrphans}`);
  console.log(`   Orphaned space members: ${orphanedSpaceMembers}`);
  console.log(`   Workspaces with orphans: ${workspacesWithOrphans}`);
  console.log(`   Orphaned workspace members: ${orphanedWorkspaceMembers}`);
  console.log('');
  
  return {
    spacesWithOrphans,
    orphanedSpaceMembers,
    workspacesWithOrphans,
    orphanedWorkspaceMembers
  };
}

async function generateReport() {
  console.log('📈 Generating Database Health Report...');
  
  const totalSpaces = await Space.countDocuments();
  const totalWorkspaces = await Workspace.countDocuments();
  const totalUsers = await User.countDocuments();
  
  // Count space members
  const spaceMembersResult = await Space.aggregate([
    { $unwind: '$members' },
    { $count: 'totalSpaceMembers' }
  ]);
  const totalSpaceMembers = spaceMembersResult[0]?.totalSpaceMembers || 0;
  
  // Count workspace members
  const workspaceMembersResult = await Workspace.aggregate([
    { $unwind: '$members' },
    { $count: 'totalWorkspaceMembers' }
  ]);
  const totalWorkspaceMembers = workspaceMembersResult[0]?.totalWorkspaceMembers || 0;
  
  console.log('📊 Database Statistics:');
  console.log(`   Users: ${totalUsers}`);
  console.log(`   Workspaces: ${totalWorkspaces}`);
  console.log(`   Spaces: ${totalSpaces}`);
  console.log(`   Space Members: ${totalSpaceMembers}`);
  console.log(`   Workspace Members: ${totalWorkspaceMembers}`);
  console.log('');
}

async function main() {
  try {
    await connectToDatabase();
    
    console.log('Starting cleanup process...\n');
    
    // Generate initial report
    await generateReport();
    
    // Clean up null user references
    const spaceResults = await cleanupSpaceMembers();
    const workspaceResults = await cleanupWorkspaceMembers();
    const orphanResults = await cleanupOrphanedReferences();
    
    // Generate final report
    console.log('🏁 Cleanup Complete!');
    console.log('===================');
    
    if (isDryRun) {
      console.log('🔍 DRY RUN RESULTS (no changes made):');
    } else {
      console.log('✅ CLEANUP RESULTS:');
    }
    
    console.log(`   Space members cleaned: ${spaceResults.totalCleaned}`);
    console.log(`   Workspaces members cleaned: ${workspaceResults.totalCleaned}`);
    console.log(`   Orphaned space members cleaned: ${orphanResults.orphanedSpaceMembers}`);
    console.log(`   Orphaned workspace members cleaned: ${orphanResults.orphanedWorkspaceMembers}`);
    
    const totalCleaned = spaceResults.totalCleaned + 
                        workspaceResults.totalCleaned + 
                        orphanResults.orphanedSpaceMembers + 
                        orphanResults.orphanedWorkspaceMembers;
    
    console.log(`   Total records cleaned: ${totalCleaned}`);
    
    if (totalCleaned === 0) {
      console.log('🎉 Database is clean! No null user references found.');
    } else if (isDryRun) {
      console.log('💡 Run without --dry-run to apply these changes.');
    } else {
      console.log('✨ Database cleanup completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
main();
