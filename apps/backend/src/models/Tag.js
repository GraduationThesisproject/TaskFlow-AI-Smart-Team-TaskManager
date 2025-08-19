const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true,
    maxlength: [50, 'Tag name cannot exceed 50 characters'],
    minlength: [1, 'Tag name must be at least 1 character']
  },
  color: {
    type: String,
    required: [true, 'Tag color is required'],
    default: '#6B7280',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  textColor: {
    type: String,
    default: '#FFFFFF',
    match: [/^#[0-9A-F]{6}$/i, 'Text color must be a valid hex color']
  },
  // Scope - where this tag can be used
  scope: {
    type: String,
    enum: ['global', 'workspace', 'space', 'board'],
    required: [true, 'Tag scope is required']
  },
  // Parent entity based on scope
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    default: null
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tag creator is required']
  },
  // Usage tracking
  assignedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  assignedComments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  assignedAttachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  assignedChecklists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checklist'
  }],
  // Tag metadata
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['priority', 'status', 'type', 'department', 'skill', 'custom', 'development', 'quality', 'ui'],
    default: 'custom'
  },
  icon: {
    type: String,
    maxlength: [20, 'Icon cannot exceed 20 characters']
  },
  // Tag settings
  settings: {
    isSystemTag: { type: Boolean, default: false }, // Cannot be deleted by users
    autoAssign: {
      enabled: { type: Boolean, default: false },
      rules: [{
        condition: String, // 'contains', 'starts_with', 'ends_with', 'regex'
        value: String,
        field: { type: String, enum: ['title', 'description', 'comment'] }
      }]
    },
    notifications: {
      onAssign: { type: Boolean, default: false },
      onRemove: { type: Boolean, default: false },
      notifyUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    permissions: {
      canUse: {
        type: String,
        enum: ['everyone', 'members', 'admins', 'creator'],
        default: 'everyone'
      },
      canEdit: {
        type: String,
        enum: ['creator', 'admins', 'everyone'],
        default: 'creator'
      },
      canDelete: {
        type: String,
        enum: ['creator', 'admins'],
        default: 'creator'
      }
    }
  },
  // Usage statistics
  stats: {
    totalUsage: { type: Number, default: 0 },
    taskUsage: { type: Number, default: 0 },
    commentUsage: { type: Number, default: 0 },
    attachmentUsage: { type: Number, default: 0 },
    checklistUsage: { type: Number, default: 0 },
    lastUsed: { type: Date, default: null },
    popularityScore: { type: Number, default: 0 }, // Calculated based on usage patterns
    usedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      count: { type: Number, default: 1 },
      lastUsed: { type: Date, default: Date.now }
    }]
  },
  // Status
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
  },
  // Grouping and relationships
  group: {
    type: String,
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  parentTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    default: null
  },
  childTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  relatedTags: [{
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    },
    relationship: {
      type: String,
      enum: ['similar', 'opposite', 'subset', 'superset'],
      default: 'similar'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total usage count
tagSchema.virtual('totalUsageCount').get(function() {
  return this.assignedTasks.length + this.assignedComments.length + 
         this.assignedAttachments.length + this.assignedChecklists.length;
});

// Virtual for popularity level
tagSchema.virtual('popularityLevel').get(function() {
  const usage = this.totalUsageCount;
  if (usage >= 100) return 'very_high';
  if (usage >= 50) return 'high';
  if (usage >= 20) return 'medium';
  if (usage >= 5) return 'low';
  return 'very_low';
});

// Virtual for is frequently used
tagSchema.virtual('isFrequentlyUsed').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.stats.lastUsed && this.stats.lastUsed > thirtyDaysAgo && this.totalUsageCount >= 10;
});

// Virtual for contrasting color (for text)
tagSchema.virtual('contrastColor').get(function() {
  // Simple implementation - in practice you'd use a proper contrast algorithm
  const hex = this.color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155 ? '#000000' : '#FFFFFF';
});

// Virtual for scope display name
tagSchema.virtual('scopeDisplay').get(function() {
  const displays = {
    global: 'Global',
    workspace: 'Workspace',
    space: 'Space', 
    board: 'Board'
  };
  return displays[this.scope] || this.scope;
});

// Indexes for better query performance
tagSchema.index({ name: 1, scope: 1 });
tagSchema.index({ workspace: 1 });
tagSchema.index({ space: 1 });
tagSchema.index({ board: 1 });
tagSchema.index({ createdBy: 1 });
tagSchema.index({ category: 1 });
tagSchema.index({ isActive: 1 });
tagSchema.index({ isArchived: 1 });
tagSchema.index({ 'stats.totalUsage': -1 });
tagSchema.index({ 'stats.popularityScore': -1 });

// Compound indexes for common queries
tagSchema.index({ scope: 1, workspace: 1, isActive: 1 });
tagSchema.index({ scope: 1, board: 1, isActive: 1 });
tagSchema.index({ name: 'text', description: 'text' });

// Method to assign to task
tagSchema.methods.assignToTask = function(taskId, userId = null) {
  if (!this.assignedTasks.includes(taskId)) {
    this.assignedTasks.push(taskId);
    this.updateUsageStats('task', userId);
  }
  return this.save();
};

// Method to remove from task
tagSchema.methods.removeFromTask = function(taskId) {
  this.assignedTasks = this.assignedTasks.filter(id => id.toString() !== taskId.toString());
  this.stats.taskUsage = Math.max(0, this.stats.taskUsage - 1);
  this.stats.totalUsage = this.totalUsageCount;
  return this.save();
};

// Method to assign to comment
tagSchema.methods.assignToComment = function(commentId, userId = null) {
  if (!this.assignedComments.includes(commentId)) {
    this.assignedComments.push(commentId);
    this.updateUsageStats('comment', userId);
  }
  return this.save();
};

// Method to remove from comment
tagSchema.methods.removeFromComment = function(commentId) {
  this.assignedComments = this.assignedComments.filter(id => id.toString() !== commentId.toString());
  this.stats.commentUsage = Math.max(0, this.stats.commentUsage - 1);
  this.stats.totalUsage = this.totalUsageCount;
  return this.save();
};

// Method to assign to attachment
tagSchema.methods.assignToAttachment = function(attachmentId, userId = null) {
  if (!this.assignedAttachments.includes(attachmentId)) {
    this.assignedAttachments.push(attachmentId);
    this.updateUsageStats('attachment', userId);
  }
  return this.save();
};

// Method to assign to checklist
tagSchema.methods.assignToChecklist = function(checklistId, userId = null) {
  if (!this.assignedChecklists.includes(checklistId)) {
    this.assignedChecklists.push(checklistId);
    this.updateUsageStats('checklist', userId);
  }
  return this.save();
};

// Method to update usage statistics
tagSchema.methods.updateUsageStats = function(type, userId = null) {
  // Update type-specific usage
  const typeField = `${type}Usage`;
  if (this.stats[typeField] !== undefined) {
    this.stats[typeField] += 1;
  }
  
  // Update total usage
  this.stats.totalUsage = this.totalUsageCount;
  this.stats.lastUsed = new Date();
  
  // Update user-specific usage
  if (userId) {
    const existingUser = this.stats.usedBy.find(u => u.user.toString() === userId.toString());
    if (existingUser) {
      existingUser.count += 1;
      existingUser.lastUsed = new Date();
    } else {
      this.stats.usedBy.push({
        user: userId,
        count: 1,
        lastUsed: new Date()
      });
    }
  }
  
  // Update popularity score (simple algorithm)
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  this.stats.popularityScore = this.stats.totalUsage / Math.max(daysSinceCreation, 1);
  
  return this;
};

// Method to archive tag
tagSchema.methods.archive = function(userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  this.isActive = false;
  return this.save();
};

// Method to restore from archive
tagSchema.methods.restore = function() {
  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;
  this.isActive = true;
  return this.save();
};

// Method to add related tag
tagSchema.methods.addRelatedTag = function(tagId, relationship = 'similar') {
  const existing = this.relatedTags.find(rt => rt.tag.toString() === tagId.toString());
  if (!existing) {
    this.relatedTags.push({ tag: tagId, relationship });
  } else {
    existing.relationship = relationship;
  }
  return this.save();
};

// Method to remove related tag
tagSchema.methods.removeRelatedTag = function(tagId) {
  this.relatedTags = this.relatedTags.filter(rt => rt.tag.toString() !== tagId.toString());
  return this.save();
};

// Method to check if user can use tag
tagSchema.methods.canUserUse = function(userId, userRole = 'member') {
  if (!this.isActive) return false;
  
  const permission = this.settings.permissions.canUse;
  
  switch (permission) {
    case 'everyone':
      return true;
    case 'creator':
      return this.createdBy.toString() === userId.toString();
    case 'admins':
      return ['admin', 'owner'].includes(userRole);
    case 'members':
      return true; // All authenticated users are considered members
    default:
      return false;
  }
};

// Method to check if user can edit tag
tagSchema.methods.canUserEdit = function(userId, userRole = 'member') {
  if (!this.isActive || this.settings.isSystemTag) return false;
  
  const permission = this.settings.permissions.canEdit;
  
  switch (permission) {
    case 'creator':
      return this.createdBy.toString() === userId.toString();
    case 'admins':
      return ['admin', 'owner'].includes(userRole);
    case 'everyone':
      return true;
    default:
      return false;
  }
};

// Method to check if user can delete tag
tagSchema.methods.canUserDelete = function(userId, userRole = 'member') {
  if (this.settings.isSystemTag) return false;
  
  const permission = this.settings.permissions.canDelete;
  
  switch (permission) {
    case 'creator':
      return this.createdBy.toString() === userId.toString();
    case 'admins':
      return ['admin', 'owner'].includes(userRole);
    default:
      return false;
  }
};

// Static method to find by scope
tagSchema.statics.findByScope = function(scope, entityId = null, includeArchived = false) {
  const query = { scope };
  
  if (entityId) {
    switch (scope) {
      case 'workspace':
        query.workspace = entityId;
        break;
      case 'space':
        query.space = entityId;
        break;
      case 'board':
        query.board = entityId;
        break;
    }
  }
  
  if (!includeArchived) {
    query.isActive = true;
  }
  
  return this.find(query).sort({ 'stats.popularityScore': -1, name: 1 });
};

// Static method to find popular tags
tagSchema.statics.findPopular = function(scope = null, entityId = null, limit = 20) {
  const query = { isActive: true };
  
  if (scope) {
    query.scope = scope;
    if (entityId) {
      query[scope] = entityId;
    }
  }
  
  return this.find(query)
    .sort({ 'stats.popularityScore': -1 })
    .limit(limit);
};

// Static method to find by category
tagSchema.statics.findByCategory = function(category, scope = null, entityId = null) {
  const query = { category, isActive: true };
  
  if (scope) {
    query.scope = scope;
    if (entityId) {
      query[scope] = entityId;
    }
  }
  
  return this.find(query).sort({ name: 1 });
};

// Static method to find unused tags
tagSchema.statics.findUnused = function(scope = null, days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const query = {
    $or: [
      { 'stats.totalUsage': 0 },
      { 'stats.lastUsed': { $lt: cutoffDate } }
    ],
    isActive: true
  };
  
  if (scope) {
    query.scope = scope;
  }
  
  return this.find(query).sort({ 'stats.lastUsed': 1 });
};

// Static method to search tags
tagSchema.statics.searchTags = function(searchTerm, scope = null, entityId = null) {
  const query = {
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ],
    isActive: true
  };
  
  if (scope) {
    query.scope = scope;
    if (entityId) {
      query[scope] = entityId;
    }
  }
  
  return this.find(query).sort({ 'stats.popularityScore': -1, name: 1 });
};

// Static method to get tag statistics
tagSchema.statics.getTagStats = function(scope = null, entityId = null) {
  const matchQuery = { isActive: true };
  
  if (scope) {
    matchQuery.scope = scope;
    if (entityId) {
      matchQuery[scope] = entityId;
    }
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        totalTags: { $sum: 1 },
        totalUsage: { $sum: '$stats.totalUsage' },
        avgUsage: { $avg: '$stats.totalUsage' },
        mostPopular: { $max: '$stats.popularityScore' }
      }
    },
    { $sort: { totalUsage: -1 } }
  ]);
};

// Pre-save middleware to validate scope relationships
tagSchema.pre('save', function(next) {
  // Ensure only appropriate entity ID is set based on scope
  if (this.scope === 'global') {
    this.workspace = null;
    this.space = null;
    this.board = null;
  } else if (this.scope === 'workspace') {
    this.space = null;
    this.board = null;
  } else if (this.scope === 'space') {
    this.board = null;
  }
  
  // Update total usage count
  this.stats.totalUsage = this.totalUsageCount;
  
  next();
});

module.exports = mongoose.model('Tag', tagSchema);
