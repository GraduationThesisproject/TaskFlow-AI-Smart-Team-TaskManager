const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Space name is required'],
    trim: true,
    maxlength: [200, 'Space name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'Space must belong to a workspace']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['viewer', 'member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      canViewBoards: { type: Boolean, default: true },
      canCreateBoards: { type: Boolean, default: true },
      canEditBoards: { type: Boolean, default: false },
      canDeleteBoards: { type: Boolean, default: false },
      canCreateTasks: { type: Boolean, default: true },
      canEditTasks: { type: Boolean, default: true },
      canDeleteTasks: { type: Boolean, default: false },
      canManageMembers: { type: Boolean, default: false },
      canEditSettings: { type: Boolean, default: false }
    }
  }],
  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  }],
  invitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation'
  }],
  permissions: {
    defaultMemberRole: {
      type: String,
      enum: ['viewer', 'member', 'admin'],
      default: 'member'
    },
    boardCreation: {
      type: String,
      enum: ['all_members', 'admins_only', 'space_admins_only'],
      default: 'all_members'
    },
    taskCreation: {
      type: String,
      enum: ['all_members', 'board_members_only', 'admins_only'],
      default: 'all_members'
    },
    memberInvitation: {
      type: String,
      enum: ['all_members', 'admins_only', 'space_admins_only'],
      default: 'admins_only'
    },
    boardVisibility: {
      type: String,
      enum: ['private', 'space_members', 'workspace_members', 'public'],
      default: 'space_members'
    },
    commentingRules: {
      type: String,
      enum: ['all_members', 'task_members_only', 'board_members_only'],
      default: 'all_members'
    }
  },
  settings: {
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    },
    icon: {
      type: String,
      default: '📋'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowGuestAccess: {
      type: Boolean,
      default: false
    },
    autoArchiveCompletedTasks: {
      type: Boolean,
      default: false
    },
    archiveAfterDays: {
      type: Number,
      default: 30,
      min: [1, 'Archive days must be at least 1']
    },
    defaultBoardTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      default: null
    },
    features: {
      timeTracking: { type: Boolean, default: true },
      aiSuggestions: { type: Boolean, default: true },
      customFields: { type: Boolean, default: true },
      fileAttachments: { type: Boolean, default: true },
      voting: { type: Boolean, default: true },
      dependencies: { type: Boolean, default: true }
    },
    notifications: {
      newTaskNotifications: { type: Boolean, default: true },
      taskUpdatesNotifications: { type: Boolean, default: true },
      taskCompletedNotifications: { type: Boolean, default: false },
      dueDateReminders: { type: Boolean, default: true },
      memberJoinedNotifications: { type: Boolean, default: true }
    }
  },
  activityLog: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityLog'
  }],
  stats: {
    totalBoards: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    overdueTasks: { type: Number, default: 0 },
    activeMembersCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for space statistics
spaceSchema.virtual('memberCount').get(function() {
  return Array.isArray(this.members) ? this.members.length : 0;
});

// Virtual for completion rate
spaceSchema.virtual('completionRate').get(function() {
  if (this.stats.totalTasks === 0) return 0;
  return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
});

// Virtual for space health status
spaceSchema.virtual('healthStatus').get(function() {
  const completionRate = this.completionRate;
  const overdueRatio = this.stats.totalTasks > 0 ? (this.stats.overdueTasks / this.stats.totalTasks) * 100 : 0;
  
  if (completionRate >= 80 && overdueRatio < 10) return 'excellent';
  if (completionRate >= 60 && overdueRatio < 20) return 'good';
  if (completionRate >= 40 && overdueRatio < 30) return 'fair';
  return 'needs_attention';
});

// Virtual for active members
spaceSchema.virtual('activeMembers').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return Array.isArray(this.members)
    ? this.members.filter(member => member.joinedAt > thirtyDaysAgo || member.role !== 'viewer')
    : [];
});

// Indexes for better query performance
spaceSchema.index({ workspace: 1 });
spaceSchema.index({ 'members.user': 1 });
spaceSchema.index({ isActive: 1 });
spaceSchema.index({ isArchived: 1 });
spaceSchema.index({ 'stats.lastActivityAt': -1 });

// Method to add member
spaceSchema.methods.addMember = function(userId, role = 'member', addedBy = null) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
    existingMember.addedBy = addedBy;
    existingMember.joinedAt = new Date();
  } else {
    const permissions = this.getDefaultPermissions(role);
    this.members.push({ user: userId, role, addedBy, permissions });
  }
  
  this.stats.activeMembersCount = this.members.length;
  return this.save();
};

// Method to remove member
spaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  this.stats.activeMembersCount = this.members.length;
  return this.save();
};

// Method to update member role
spaceSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found in space');
  }
  
  member.role = newRole;
  member.permissions = this.getDefaultPermissions(newRole);
  
  return this.save();
};

// Method to get default permissions for role
spaceSchema.methods.getDefaultPermissions = function(role) {
  const permissionSets = {
    viewer: {
      canViewBoards: true,
      canCreateBoards: false,
      canEditBoards: false,
      canDeleteBoards: false,
      canCreateTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canManageMembers: false,
      canEditSettings: false
    },
    member: {
      canViewBoards: true,
      canCreateBoards: true,
      canEditBoards: false,
      canDeleteBoards: false,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: false,
      canManageMembers: false,
      canEditSettings: false
    },
    admin: {
      canViewBoards: true,
      canCreateBoards: true,
      canEditBoards: true,
      canDeleteBoards: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageMembers: true,
      canEditSettings: true
    }
  };
  
  return permissionSets[role] || permissionSets.member;
};

// Method to check user permission
spaceSchema.methods.hasPermission = function(userId, permission) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;
  
  if (member.role === 'admin') return true; // Admin has all permissions
  
  return member.permissions[permission] || false;
};

// Method to add board
spaceSchema.methods.addBoard = function(boardId) {
  if (!this.boards.includes(boardId)) {
    this.boards.push(boardId);
    this.stats.totalBoards = this.boards.length;
  }
  return this.save();
};

// Method to remove board
spaceSchema.methods.removeBoard = function(boardId) {
  this.boards = this.boards.filter(board => 
    board.toString() !== boardId.toString()
  );
  this.stats.totalBoards = this.boards.length;
  return this.save();
};

// Method to update statistics
spaceSchema.methods.updateStats = function(statsUpdate) {
  Object.assign(this.stats, statsUpdate);
  this.stats.lastActivityAt = new Date();
  return this.save();
};

// Method to archive space
spaceSchema.methods.archive = function(userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  return this.save();
};

// Method to unarchive space
spaceSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;
  return this.save();
};

// Method to update settings
spaceSchema.methods.updateSettings = function(settingSection, updates) {
  if (this.settings[settingSection]) {
    Object.assign(this.settings[settingSection], updates);
  }
  return this.save();
};

// Method to update permissions
spaceSchema.methods.updatePermissions = function(permissionUpdates) {
  Object.assign(this.permissions, permissionUpdates);
  return this.save();
};

// Method to check if user can perform action based on space permissions
spaceSchema.methods.canUserPerformAction = function(userId, action) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;
  
  switch (action) {
    case 'create_board':
      return this.permissions.boardCreation === 'all_members' || 
             (this.permissions.boardCreation === 'admins_only' && member.role === 'admin');
    case 'create_task':
      return this.permissions.taskCreation === 'all_members' || 
             (this.permissions.taskCreation === 'admins_only' && member.role === 'admin');
    case 'invite_member':
      return this.permissions.memberInvitation === 'all_members' || 
             (this.permissions.memberInvitation === 'admins_only' && member.role === 'admin');
    default:
      return false;
  }
};

// Static method to find spaces by workspace
spaceSchema.statics.findByWorkspace = function(workspaceId) {
  return this.find({ workspace: workspaceId, isActive: true, isArchived: false });
};

// Static method to find spaces by user
spaceSchema.statics.findByUser = function(userId) {
  return this.find({ 
    'members.user': userId, 
    isActive: true, 
    isArchived: false 
  }).populate('workspace', 'name');
};

// Static method to find spaces by user role
spaceSchema.statics.findByUserRole = function(userId, role) {
  return this.find({
    'members.user': userId,
    'members.role': role,
    isActive: true,
    isArchived: false
  });
};

// Static method to find archived spaces
spaceSchema.statics.findArchived = function(workspaceId = null) {
  const query = { isArchived: true };
  if (workspaceId) {
    query.workspace = workspaceId;
  }
  return this.find(query).sort({ archivedAt: -1 });
};

// Static method to find spaces needing attention
spaceSchema.statics.findNeedingAttention = function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.find({
    $or: [
      { 'stats.overdueTasks': { $gt: 0 } },
      { 'stats.lastActivityAt': { $lt: thirtyDaysAgo } }
    ],
    isActive: true,
    isArchived: false
  });
};

// Static method to get space with boards and columns
spaceSchema.statics.getSpaceWithStats = async function(spaceId, userId) {
  const space = await this.findById(spaceId)
    .populate('workspace', 'name')
    .populate('members.user', 'name email avatar')
    .lean();

  if (!space) {
    throw new Error('Space not found');
  }

  // Get boards for this space
  const Board = require('./Board');
  const boards = await Board.find({ 
    space: spaceId, 
    isArchived: { $ne: true } 
  }).lean();

  const boardIds = boards.map(b => b._id);
  
  // Get columns for all boards
  const Column = require('./Column');
  const columns = await Column.find({ 
    board: { $in: boardIds } 
  }).lean();

  // Group columns by board
  const columnsByBoard = columns.reduce((acc, column) => {
    if (!acc[column.board]) {
      acc[column.board] = [];
    }
    acc[column.board].push(column);
    return acc;
  }, {});

  // Attach columns to boards
  const boardsWithColumns = boards.map(board => ({
    ...board,
    columns: columnsByBoard[board._id] || []
  }));

  return {
    ...space,
    boards: boardsWithColumns
  };
};

// Pre-save middleware to update member count
spaceSchema.pre('save', function(next) {
  this.stats.activeMembersCount = this.members.length;
  next();
});

module.exports = mongoose.model('Space', spaceSchema);
