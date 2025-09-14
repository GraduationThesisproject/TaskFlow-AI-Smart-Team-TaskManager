#!/usr/bin/env node

/**
 * Diagnostic Script: Investigate Member Count Issues
 * 
 * This script helps diagnose why some spaces show incorrect member counts
 * (e.g., showing 3 members when there should only be 2)
 * 
 * Usage:
 *   node scripts/diagnose-member-counts.js
 */

const mongoose = require('mongoose');
const Space = require('../src/models/Space');
const Workspace = require('../src/models/Workspace');
const User = require('../src/models/User');
require('dotenv').config();

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

async function diagnoseSpaceMembers() {
  console.log('🔍 Diagnosing Space Member Counts...\n');
  
  const spaces = await Space.find({}).populate('members.user');
  
  for (const space of spaces) {
    console.log(`📁 Space: "${space.name}" (${space._id})`);
    console.log(`   Total members in array: ${space.members.length}`);
    console.log(`   Active members count (stats): ${space.stats?.activeMembersCount || 'N/A'}`);
    
    // Analyze each member
    const memberAnalysis = [];
    const userIds = new Set();
    const duplicateUserIds = new Set();
    
    space.members.forEach((member, index) => {
      const userId = member.user?._id?.toString() || member.user?.toString() || 'null';
      const userName = member.user?.name || member.user?.email || 'Unknown';
      const isNull = !member.user || member.user === null;
      const isDuplicate = userIds.has(userId);
      
      if (isDuplicate) {
        duplicateUserIds.add(userId);
      }
      
      if (userId !== 'null') {
        userIds.add(userId);
      }
      
      memberAnalysis.push({
        index,
        memberId: member._id,
        userId,
        userName,
        role: member.role,
        isNull,
        isDuplicate,
        joinedAt: member.joinedAt
      });
    });
    
    console.log(`   Unique user IDs: ${userIds.size}`);
    console.log(`   Duplicate user IDs: ${duplicateUserIds.size}`);
    console.log(`   Null user references: ${memberAnalysis.filter(m => m.isNull).length}`);
    
    if (duplicateUserIds.size > 0 || memberAnalysis.some(m => m.isNull)) {
      console.log('   ⚠️  ISSUES FOUND:');
      
      if (duplicateUserIds.size > 0) {
        console.log('   🔄 Duplicate members:');
        memberAnalysis
          .filter(m => m.isDuplicate)
          .forEach(m => {
            console.log(`      - User ID: ${m.userId} (${m.userName}) - Index: ${m.index}`);
          });
      }
      
      if (memberAnalysis.some(m => m.isNull)) {
        console.log('   ❌ Null user references:');
        memberAnalysis
          .filter(m => m.isNull)
          .forEach(m => {
            console.log(`      - Member ID: ${m.memberId} - Index: ${m.index}`);
          });
      }
    } else {
      console.log('   ✅ No issues found');
    }
    
    console.log('   📋 All members:');
    memberAnalysis.forEach(m => {
      const status = m.isNull ? '❌ NULL' : m.isDuplicate ? '🔄 DUPLICATE' : '✅ OK';
      console.log(`      ${m.index}: ${m.userName} (${m.userId}) - ${m.role} - ${status}`);
    });
    
    console.log(''); // Empty line for readability
  }
}

async function diagnoseWorkspaceMembers() {
  console.log('🔍 Diagnosing Workspace Member Counts...\n');
  
  const workspaces = await Workspace.find({}).populate('members.user');
  
  for (const workspace of workspaces) {
    console.log(`🏢 Workspace: "${workspace.name}" (${workspace._id})`);
    console.log(`   Total members in array: ${workspace.members.length}`);
    
    // Analyze each member
    const memberAnalysis = [];
    const userIds = new Set();
    const duplicateUserIds = new Set();
    
    workspace.members.forEach((member, index) => {
      const userId = member.user?._id?.toString() || member.user?.toString() || 'null';
      const userName = member.user?.name || member.user?.email || 'Unknown';
      const isNull = !member.user || member.user === null;
      const isDuplicate = userIds.has(userId);
      
      if (isDuplicate) {
        duplicateUserIds.add(userId);
      }
      
      if (userId !== 'null') {
        userIds.add(userId);
      }
      
      memberAnalysis.push({
        index,
        memberId: member._id,
        userId,
        userName,
        role: member.role,
        isNull,
        isDuplicate,
        joinedAt: member.joinedAt
      });
    });
    
    console.log(`   Unique user IDs: ${userIds.size}`);
    console.log(`   Duplicate user IDs: ${duplicateUserIds.size}`);
    console.log(`   Null user references: ${memberAnalysis.filter(m => m.isNull).length}`);
    
    if (duplicateUserIds.size > 0 || memberAnalysis.some(m => m.isNull)) {
      console.log('   ⚠️  ISSUES FOUND:');
      
      if (duplicateUserIds.size > 0) {
        console.log('   🔄 Duplicate members:');
        memberAnalysis
          .filter(m => m.isDuplicate)
          .forEach(m => {
            console.log(`      - User ID: ${m.userId} (${m.userName}) - Index: ${m.index}`);
          });
      }
      
      if (memberAnalysis.some(m => m.isNull)) {
        console.log('   ❌ Null user references:');
        memberAnalysis
          .filter(m => m.isNull)
          .forEach(m => {
            console.log(`      - Member ID: ${m.memberId} - Index: ${m.index}`);
          });
      }
    } else {
      console.log('   ✅ No issues found');
    }
    
    console.log(''); // Empty line for readability
  }
}

async function generateSummary() {
  console.log('📊 Summary Report...\n');
  
  // Count spaces with issues
  const spaces = await Space.find({}).populate('members.user');
  let spacesWithDuplicates = 0;
  let spacesWithNulls = 0;
  let totalDuplicateMembers = 0;
  let totalNullMembers = 0;
  
  for (const space of spaces) {
    const userIds = new Set();
    let hasDuplicates = false;
    let hasNulls = false;
    
    space.members.forEach(member => {
      const userId = member.user?._id?.toString() || member.user?.toString() || 'null';
      
      if (userId === 'null') {
        hasNulls = true;
        totalNullMembers++;
      } else if (userIds.has(userId)) {
        hasDuplicates = true;
        totalDuplicateMembers++;
      } else {
        userIds.add(userId);
      }
    });
    
    if (hasDuplicates) spacesWithDuplicates++;
    if (hasNulls) spacesWithNulls++;
  }
  
  console.log(`📈 Space Issues:`);
  console.log(`   Spaces with duplicate members: ${spacesWithDuplicates}`);
  console.log(`   Spaces with null user references: ${spacesWithNulls}`);
  console.log(`   Total duplicate members: ${totalDuplicateMembers}`);
  console.log(`   Total null members: ${totalNullMembers}`);
  
  // Count workspaces with issues
  const workspaces = await Workspace.find({}).populate('members.user');
  let workspacesWithDuplicates = 0;
  let workspacesWithNulls = 0;
  let totalWorkspaceDuplicateMembers = 0;
  let totalWorkspaceNullMembers = 0;
  
  for (const workspace of workspaces) {
    const userIds = new Set();
    let hasDuplicates = false;
    let hasNulls = false;
    
    workspace.members.forEach(member => {
      const userId = member.user?._id?.toString() || member.user?.toString() || 'null';
      
      if (userId === 'null') {
        hasNulls = true;
        totalWorkspaceNullMembers++;
      } else if (userIds.has(userId)) {
        hasDuplicates = true;
        totalWorkspaceDuplicateMembers++;
      } else {
        userIds.add(userId);
      }
    });
    
    if (hasDuplicates) workspacesWithDuplicates++;
    if (hasNulls) workspacesWithNulls++;
  }
  
  console.log(`📈 Workspace Issues:`);
  console.log(`   Workspaces with duplicate members: ${workspacesWithDuplicates}`);
  console.log(`   Workspaces with null user references: ${workspacesWithNulls}`);
  console.log(`   Total duplicate members: ${totalWorkspaceDuplicateMembers}`);
  console.log(`   Total null members: ${totalWorkspaceNullMembers}`);
  
  const totalIssues = totalDuplicateMembers + totalNullMembers + totalWorkspaceDuplicateMembers + totalWorkspaceNullMembers;
  
  if (totalIssues === 0) {
    console.log('\n🎉 No issues found! Your database is clean.');
  } else {
    console.log(`\n⚠️  Total issues found: ${totalIssues}`);
    console.log('💡 Run the cleanup script to fix these issues:');
    console.log('   node scripts/cleanup-null-users.js --dry-run --verbose');
  }
}

async function main() {
  try {
    await connectToDatabase();
    
    console.log('🔍 Starting member count diagnosis...\n');
    
    await diagnoseSpaceMembers();
    await diagnoseWorkspaceMembers();
    await generateSummary();
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the diagnosis
main();
