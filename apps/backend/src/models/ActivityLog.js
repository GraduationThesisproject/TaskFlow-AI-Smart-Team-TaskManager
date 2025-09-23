const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      // User actions
      'user_login', 'user_logout', 'user_register', 'profile_update',
      // Project actions
      'project_create', 'project_update', 'project_delete', 'project_archive', 'project_restore',
      'project_member_add', 'project_member_remove', 'project_member_role_change',
      // Workspace actions
      'workspace_create', 'workspace_update', 'workspace_delete', 'workspace_restore',
      'workspace_member_add', 'workspace_member_remove',
      // Space actions
      'space_create', 'space_update', 'space_delete', 'space_archive', 'space_restore', 'space_permanent_delete',
      'space_member_add', 'space_member_remove',
      // Board actions
      'board_create', 'board_update', 'board_delete', 'board_archive', 'board_restore',
      'column_create', 'column_update', 'column_delete', 'column_reorder',
      // Task actions
      'task_create', 'task_update', 'task_delete', 'task_assign', 'task_unassign',
      'task_move', 'task_complete', 'task_reopen', 'task_archive', 'task_restore', 'task_duplicate',
      'time_tracking_start', 'time_tracking_stop', 'task_dependency_add', 'task_dependency_remove',
      // Comment actions
      'comment_create', 'comment_update', 'comment_delete', 'comment_resolve',
      // Template actions
      'template_create', 'template_update', 'template_delete',
      // Analytics actions
      'analytics_generate', 'analytics_export',
      // Other actions
      'file_upload', 'file_delete', 'settings_update'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  entity: {
    type: {
      type: String,
      enum: ['User', 'Project', 'Workspace', 'Space', 'Board', 'Task', 'Comment', 'File', 'Analytics', 'Template'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String // For easier querying without population
  },
  relatedEntities: [{
    type: {
      type: String,
      enum: ['User', 'Project', 'Workspace', 'Space', 'Board', 'Task', 'Comment', 'File', 'Analytics', 'Template']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: mongoose.Schema.Types.Mixed,
    oldValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    newValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    duration: Number, // for actions that take time
    fileSize: Number, // for file operations
    errorMessage: String // if action failed
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space'
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ 'entity.type': 1, 'entity.id': 1 });
activityLogSchema.index({ severity: 1 });
activityLogSchema.index({ isSuccessful: 1 });

// Static method to log activity
activityLogSchema.statics.logActivity = function({
  userId,
  action,
  description,
  entity,
  relatedEntities = [],
  metadata = {},
  workspaceId = null,
  projectId = null,
  spaceId = null,
  boardId = null,
  severity = 'info',
  isSuccessful = true
}) {
  return this.create({
    user: userId,
    action,
    description,
    entity,
    relatedEntities,
    metadata,
    workspace: workspaceId,
    project: projectId,
    space: spaceId,
    board: boardId,
    severity,
    isSuccessful
  }).then(async (activity) => {
    try {
      // Real-time emit to the actor's personal activity room
      if (global.io) {
        // Optionally populate lightweight user info for display
        const populated = await activity.populate('user', 'name avatar');
        global.io.to(`activities:${userId}`).emit('activity:new', {
          activity: populated.toObject()
        });

        // Future: emit to workspace/project/board activity streams if needed
        // e.g., global.io.to(`workspace:${workspaceId}:activities`).emit('activity:new', {...})
      }
    } catch (err) {
      // Do not block activity creation on emit errors
    }
    return activity;
  });
};

// Static method to find activities by entity
activityLogSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({
    'entity.type': entityType,
    'entity.id': entityId,
    isVisible: true
  })
  .populate('user', 'name avatar')
  .sort({ createdAt: -1 });
};

// Static method to find user activities
activityLogSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ user: userId, isVisible: true })
    .populate('entity.id')
    .populate({
      path: 'user',
      select: 'name avatar',
      populate: { path: 'avatar', select: 'url thumbnails' }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to find project activities
activityLogSchema.statics.findByProject = function(projectId, limit = 100) {
  return this.find({ project: projectId, isVisible: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find workspace activities
activityLogSchema.statics.findByWorkspace = function(workspaceId, limit = 100) {
  return this.find({ workspace: workspaceId, isVisible: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// TTL: expire activities ~24 hours after creation (increased for better debugging)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, name: 'ttl_createdAt_24h' });

module.exports = mongoose.model('ActivityLog', activityLogSchema);