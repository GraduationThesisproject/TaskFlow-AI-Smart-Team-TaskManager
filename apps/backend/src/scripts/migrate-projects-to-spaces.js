const mongoose = require('mongoose');
const Space = require('../models/Space');
const Board = require('../models/Board');
const Task = require('../models/Task');
const Tag = require('../models/Tag');
const Analytics = require('../models/Analytics');
const File = require('../models/File');
const Reminder = require('../models/Reminder');
const UserRoles = require('../models/UserRoles');
const Invitation = require('../models/Invitation');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration script to convert projects to spaces
const migrateProjectsToSpaces = async () => {
  console.log('🚀 Starting migration from projects to spaces...');
  
  try {
    // Check if projects collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const projectCollectionExists = collections.some(col => col.name === 'projects');
    
    if (!projectCollectionExists) {
      console.log('✅ No projects collection found. Migration not needed.');
      return;
    }

    // Get all projects
    const projects = await mongoose.connection.db.collection('projects').find({}).toArray();
    console.log(`📊 Found ${projects.length} projects to migrate`);

    if (projects.length === 0) {
      console.log('✅ No projects to migrate');
      return;
    }

    // Create spaces from projects
    for (const project of projects) {
      console.log(`🔄 Migrating project: ${project.name}`);
      
      // Create space from project
      const spaceData = {
        name: project.name,
        description: project.description || '',
        workspace: project.workspace,
        members: project.team || [],
        settings: {
          color: project.color || '#6B7280',
          icon: project.icon || '📋',
          isPrivate: project.isPrivate || false,
          allowGuestAccess: project.allowGuestAccess || false,
          autoArchiveCompletedTasks: project.autoArchiveCompletedTasks || false,
          archiveAfterDays: project.archiveAfterDays || 30,
          features: {
            timeTracking: true,
            aiSuggestions: true,
            customFields: true,
            fileAttachments: true,
            voting: true,
            dependencies: true
          },
          notifications: {
            newTaskNotifications: true,
            taskUpdatesNotifications: true,
            taskCompletedNotifications: false,
            dueDateReminders: true,
            memberJoinedNotifications: true
          }
        },
        stats: {
          totalBoards: 0,
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          activeMembersCount: project.team ? project.team.length : 0,
          lastActivityAt: project.updatedAt || project.createdAt
        },
        isActive: project.status === 'active',
        isArchived: project.status === 'archived',
        archivedAt: project.archivedAt || null,
        archivedBy: project.archivedBy || null,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };

      const space = await Space.create(spaceData);
      console.log(`✅ Created space: ${space.name} (${space._id})`);

      // Update boards to reference the new space
      await Board.updateMany(
        { project: project._id },
        { 
          $set: { space: space._id },
          $unset: { project: 1 }
        }
      );

      // Update tasks to reference the new space
      await Task.updateMany(
        { project: project._id },
        { 
          $set: { space: space._id },
          $unset: { project: 1 }
        }
      );

      // Update tags to reference the new space
      await Tag.updateMany(
        { project: project._id },
        { 
          $set: { space: space._id, scope: 'space' },
          $unset: { project: 1 }
        }
      );

      // Update analytics to reference the new space
      await Analytics.updateMany(
        { project: project._id },
        { 
          $set: { scopeType: 'space', scopeId: space._id },
          $unset: { project: 1 }
        }
      );

      // Update files to reference the new space
      await File.updateMany(
        { project: project._id },
        { 
          $set: { space: space._id },
          $unset: { project: 1 }
        }
      );

      // Update reminders to reference the new space
      await Reminder.updateMany(
        { 'context.projectId': project._id },
        { 
          $set: { 'context.spaceId': space._id },
          $unset: { 'context.projectId': 1 }
        }
      );

      // Update user roles to reference the new space
      await UserRoles.updateMany(
        { 'spaces.spaceId': project._id },
        { 
          $set: { 'spaces.$.spaceId': space._id }
        }
      );

      // Update invitations to reference the new space
      await Invitation.updateMany(
        { 'targetEntity.id': project._id, 'targetEntity.type': 'Project' },
        { 
          $set: { 
            'targetEntity.id': space._id,
            'targetEntity.type': 'Space'
          }
        }
      );

      // Update activity logs to reference the new space
      await ActivityLog.updateMany(
        { entityId: project._id, entityType: 'Project' },
        { 
          $set: { 
            entityId: space._id,
            entityType: 'Space'
          }
        }
      );

      // Update notifications to reference the new space
      await Notification.updateMany(
        { 'relatedEntity.entityId': project._id, 'relatedEntity.entityType': 'Project' },
        { 
          $set: { 
            'relatedEntity.entityId': space._id,
            'relatedEntity.entityType': 'Space'
          }
        }
      );

      console.log(`✅ Updated all references for project: ${project.name}`);
    }

    // Update space statistics
    console.log('📊 Updating space statistics...');
    const spaces = await Space.find({});
    
    for (const space of spaces) {
      const boardCount = await Board.countDocuments({ space: space._id });
      const taskCount = await Task.countDocuments({ space: space._id });
      const completedTaskCount = await Task.countDocuments({ space: space._id, status: 'done' });
      const overdueTaskCount = await Task.countDocuments({ 
        space: space._id, 
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
      });

      await Space.updateOne(
        { _id: space._id },
        {
          $set: {
            'stats.totalBoards': boardCount,
            'stats.totalTasks': taskCount,
            'stats.completedTasks': completedTaskCount,
            'stats.overdueTasks': overdueTaskCount,
            'stats.lastActivityAt': new Date()
          }
        }
      );
    }

    // Drop the projects collection
    console.log('🗑️ Dropping projects collection...');
    await mongoose.connection.db.collection('projects').drop();
    console.log('✅ Projects collection dropped');

    console.log('🎉 Migration completed successfully!');
    console.log(`✅ Migrated ${projects.length} projects to spaces`);
    console.log('✅ Updated all related collections');
    console.log('✅ Updated space statistics');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  try {
    await connectDB();
    await migrateProjectsToSpaces();
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateProjectsToSpaces };
