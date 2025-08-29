const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: [
      'task_assigned',
      'task_updated',
      'task_completed',
      'task_overdue',
      'comment_added',
      'comment_mentioned',
      'board_invited',
      'space_invited',
      'deadline_approaching',
      'ai_suggestion',
      'system_alert',
      'space_update',
      'workspace_invitation',
      'space_invitation',
      'invitation_accepted',
      'due_date_reminder',
      'mention',
      'template_created',
      'workspace_created',
      'workspace_archived',
      'workspace_restored',
      'workspace_deleted'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['task', 'board', 'space', 'comment', 'user', 'workspace', 'template'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Action URL cannot exceed 500 characters']
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [100, 'Action text cannot exceed 100 characters']
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date,
    default: null
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  smsSentAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'system', 'reminder', 'collaboration'],
    default: 'work'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
});

// Virtual for notification status
notificationSchema.virtual('status').get(function() {
  if (this.isArchived) return 'archived';
  if (this.isRead) return 'read';
  return 'unread';
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ isArchived: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Method to archive
notificationSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Method to unarchive
notificationSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  return this.save();
};

// Method to mark push as sent
notificationSchema.methods.markPushSent = function() {
  this.pushSent = true;
  this.pushSentAt = new Date();
  return this.save();
};

// Method to mark email as sent
notificationSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Method to mark SMS as sent
notificationSchema.methods.markSMSSent = function() {
  this.smsSent = true;
  this.smsSentAt = new Date();
  return this.save();
};

// Method to add metadata
notificationSchema.methods.addMetadata = function(key, value) {
  this.metadata.set(key, value);
  return this.save();
};

// Method to remove metadata
notificationSchema.methods.removeMetadata = function(key) {
  this.metadata.delete(key);
  return this.save();
};

// Method to check if expired
notificationSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(userId) {
  return this.find({
    recipient: userId,
    isRead: false,
    isArchived: false
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to find notifications by type
notificationSchema.statics.findByType = function(userId, type) {
  return this.find({
    recipient: userId,
    type,
    isArchived: false
  }).sort({ createdAt: -1 });
};

// Static method to find high priority notifications
notificationSchema.statics.findHighPriority = function(userId) {
  return this.find({
    recipient: userId,
    priority: { $in: ['high', 'urgent'] },
    isArchived: false
  }).sort({ createdAt: -1 });
};

// Static method to find action required notifications
notificationSchema.statics.findActionRequired = function(userId) {
  return this.find({
    recipient: userId,
    actionRequired: true,
    isArchived: false
  }).sort({ priority: -1, createdAt: -1 });
};

// Static method to find expired notifications
notificationSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to create task assignment notification
notificationSchema.statics.createTaskAssignment = function(taskId, assigneeId, assignerId, taskTitle) {
  return new this({
    recipient: assigneeId,
    sender: assignerId,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `You have been assigned a new task: "${taskTitle}"`,
    relatedEntity: {
      entityType: 'task',
      entityId: taskId
    },
    priority: 'medium',
    actionRequired: true,
    actionUrl: `/tasks/${taskId}`,
    actionText: 'View Task',
    category: 'work'
  });
};

// Static method to create task overdue notification
notificationSchema.statics.createTaskOverdue = function(taskId, assigneeId, taskTitle, overdueDays) {
  return new this({
    recipient: assigneeId,
    type: 'task_overdue',
    title: 'Task Overdue',
    message: `Task "${taskTitle}" is ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`,
    relatedEntity: {
      entityType: 'task',
      entityId: taskId
    },
    priority: 'urgent',
    actionRequired: true,
    actionUrl: `/tasks/${taskId}`,
    actionText: 'Update Task',
    category: 'reminder'
  });
};

// Static method to create comment mention notification
notificationSchema.statics.createCommentMention = function(commentId, mentionedUserId, commenterId, taskTitle) {
  return new this({
    recipient: mentionedUserId,
    sender: commenterId,
    type: 'comment_mentioned',
    title: 'You were mentioned',
    message: `You were mentioned in a comment on task "${taskTitle}"`,
    relatedEntity: {
      entityType: 'comment',
      entityId: commentId
    },
    priority: 'medium',
    actionRequired: true,
    actionUrl: `/tasks/${commentId}`,
    actionText: 'View Comment',
    category: 'collaboration'
  });
};

// Pre-save middleware to set default expiration
notificationSchema.pre('save', function(next) {
  // Set default expiration to 30 days for non-urgent notifications
  if (!this.expiresAt && this.priority !== 'urgent') {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
