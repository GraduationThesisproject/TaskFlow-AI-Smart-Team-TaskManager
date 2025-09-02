const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['task', 'space', 'comment', 'checklist', 'board', 'user'],
    required: [true, 'Entity type is required']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  method: {
    type: [String],
    enum: ['push', 'email', 'sms', 'in_app', 'webhook'],
    default: ['push'],
    validate: {
      validator: function(methods) {
        return methods && methods.length > 0;
      },
      message: 'At least one notification method is required'
    }
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Scheduled time must be in the future'
    }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  // Recurrence settings
  repeat: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: 'daily'
    },
    interval: { type: Number, default: 1, min: 1 }, // Every X days/weeks/months
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    }],
    dayOfMonth: { type: Number, min: 1, max: 31 },
    endDate: Date,
    maxOccurrences: { type: Number, min: 1 },
    customPattern: String // For complex recurrence patterns
  },
  // Status and tracking
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'delivered', 'failed', 'cancelled', 'snoozed'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Delivery tracking
  deliveries: [{
    scheduledAt: Date,
    sentAt: Date,
    method: String,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'bounced']
    },
    error: String,
    messageId: String, // Provider-specific message ID
    deliveredAt: Date,
    readAt: Date,
    clickedAt: Date,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  // Snooze functionality
  snoozeInfo: {
    snoozedAt: Date,
    snoozedUntil: Date,
    snoozeCount: { type: Number, default: 0 },
    maxSnoozes: { type: Number, default: 3 }
  },
  // Advanced settings
  settings: {
    // Smart timing
    useSmartTiming: { type: Boolean, default: false }, // Use AI to optimize delivery time
    preferredTimeSlot: {
      start: String, // HH:MM format
      end: String    // HH:MM format
    },
    
    // Conditions
    conditions: [{
      type: {
        type: String,
        enum: ['task_status', 'due_date_approaching', 'user_online', 'location', 'custom']
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains']
      },
      value: String,
      active: { type: Boolean, default: true }
    }],
    
    // Escalation
    escalation: {
      enabled: { type: Boolean, default: false },
      steps: [{
        delay: Number, // minutes after first reminder
        methods: [String],
        recipients: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }],
        message: String
      }]
    },
    
    // Dependencies
    dependencies: [{
      type: {
        type: String,
        enum: ['before_task', 'after_task', 'if_task_incomplete', 'if_task_overdue']
      },
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      delay: Number // minutes
    }]
  },
  // Template and customization
  template: {
    isTemplate: { type: Boolean, default: false },
    templateName: String,
    category: String,
    variables: {
      type: Map,
      of: String
    }
  },
  // Context information (cached for performance)
  context: {
    entityTitle: String,
    entityType: String,
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace'
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space'
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board'
    }
  },
  // AI and automation
  ai: {
    generated: { type: Boolean, default: false },
    confidence: Number,
    reason: String,
    suggestions: [String]
  },
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'automatic', 'ai', 'integration', 'template'],
      default: 'manual'
    },
    tags: [String],
    custom: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  nextOccurrence: Date,
  lastTriggered: Date,
  triggerCount: { type: Number, default: 0 },
  
  // Cleanup
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-expire reminders after 1 year if not recurring
      if (!this.repeat?.enabled) {
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
      return null;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for time until reminder
reminderSchema.virtual('timeUntilReminder').get(function() {
  const now = new Date();
  const scheduled = new Date(this.scheduledAt);
  const diffMs = scheduled - now;
  
  if (diffMs <= 0) return 'Past due';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  return 'Less than 1 minute';
});

// Virtual for is due
reminderSchema.virtual('isDue').get(function() {
  return new Date() >= this.scheduledAt && this.status === 'scheduled';
});

// Virtual for is overdue
reminderSchema.virtual('isOverdue').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.scheduledAt < fiveMinutesAgo && this.status === 'scheduled';
});

// Virtual for can snooze
reminderSchema.virtual('canSnooze').get(function() {
  return !this.snoozeInfo.snoozeCount || this.snoozeInfo.snoozeCount < this.snoozeInfo.maxSnoozes;
});

// Virtual for delivery status
reminderSchema.virtual('deliveryStatus').get(function() {
  if (this.deliveries.length === 0) return 'not_sent';
  
  const latestDelivery = this.deliveries[this.deliveries.length - 1];
  return latestDelivery.status;
});

// Virtual for success rate
reminderSchema.virtual('successRate').get(function() {
  if (this.deliveries.length === 0) return 0;
  
  const successful = this.deliveries.filter(d => d.status === 'delivered').length;
  return Math.round((successful / this.deliveries.length) * 100);
});

// Indexes for better query performance
reminderSchema.index({ userId: 1 });
reminderSchema.index({ entityType: 1, entityId: 1 });
reminderSchema.index({ scheduledAt: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ isDue: 1 });
reminderSchema.index({ 'repeat.enabled': 1 });
reminderSchema.index({ nextOccurrence: 1 });
reminderSchema.index({ expiresAt: 1 }); // For TTL
reminderSchema.index({ isActive: 1 });
reminderSchema.index({ priority: 1 });

// Method to snooze reminder
reminderSchema.methods.snooze = function(snoozeMinutes = 15) {
  if (!this.canSnooze) {
    throw new Error('Maximum snoozes reached');
  }
  
  this.status = 'snoozed';
  this.snoozeInfo.snoozedAt = new Date();
  this.snoozeInfo.snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000);
  this.snoozeInfo.snoozeCount += 1;
  
  // Update scheduled time
  this.scheduledAt = this.snoozeInfo.snoozedUntil;
  this.status = 'scheduled';
  
  return this.save();
};

// Method to cancel reminder
reminderSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.isActive = false;
  return this.save();
};

// Method to mark as sent
reminderSchema.methods.markAsSent = function(method, messageId = null, metadata = {}) {
  this.status = 'sent';
  this.lastTriggered = new Date();
  this.triggerCount += 1;
  
  this.deliveries.push({
    scheduledAt: this.scheduledAt,
    sentAt: new Date(),
    method,
    status: 'sent',
    messageId,
    metadata
  });
  
  // Calculate next occurrence if recurring
  if (this.repeat.enabled) {
    this.calculateNextOccurrence();
  }
  
  return this.save();
};

// Method to update delivery status
reminderSchema.methods.updateDeliveryStatus = function(messageId, status, timestamp = null, metadata = {}) {
  const delivery = this.deliveries.find(d => d.messageId === messageId);
  if (!delivery) {
    throw new Error('Delivery record not found');
  }
  
  delivery.status = status;
  
  const now = timestamp || new Date();
  switch (status) {
    case 'delivered':
      delivery.deliveredAt = now;
      this.status = 'delivered';
      break;
    case 'failed':
    case 'bounced':
      this.status = 'failed';
      delivery.error = metadata.error;
      break;
  }
  
  Object.assign(delivery.metadata, metadata);
  
  return this.save();
};

// Method to calculate next occurrence
reminderSchema.methods.calculateNextOccurrence = function() {
  if (!this.repeat.enabled) {
    this.nextOccurrence = null;
    return this;
  }
  
  const current = new Date(this.scheduledAt);
  let next;
  
  switch (this.repeat.frequency) {
    case 'daily':
      next = new Date(current.getTime() + this.repeat.interval * 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      next = new Date(current.getTime() + this.repeat.interval * 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      next = new Date(current);
      next.setMonth(next.getMonth() + this.repeat.interval);
      break;
    case 'yearly':
      next = new Date(current);
      next.setFullYear(next.getFullYear() + this.repeat.interval);
      break;
    default:
      next = null;
  }
  
  // Check if we've reached the end date or max occurrences
  if (next) {
    if (this.repeat.endDate && next > this.repeat.endDate) {
      next = null;
      this.isActive = false;
    } else if (this.repeat.maxOccurrences && this.triggerCount >= this.repeat.maxOccurrences) {
      next = null;
      this.isActive = false;
    }
  }
  
  this.nextOccurrence = next;
  this.scheduledAt = next;
  
  if (next) {
    this.status = 'scheduled';
  }
  
  return this;
};

// Method to create recurring instance
reminderSchema.methods.createRecurringInstance = function() {
  if (!this.repeat.enabled || !this.nextOccurrence) {
    return null;
  }
  
  const newReminder = new this.constructor({
    entityType: this.entityType,
    entityId: this.entityId,
    userId: this.userId,
    title: this.title,
    message: this.message,
    method: this.method,
    scheduledAt: this.nextOccurrence,
    timezone: this.timezone,
    repeat: { ...this.repeat },
    priority: this.priority,
    settings: { ...this.settings },
    context: { ...this.context },
    metadata: { ...this.metadata }
  });
  
  return newReminder.save();
};

// Method to check conditions
reminderSchema.methods.checkConditions = async function() {
  if (!this.settings.conditions || this.settings.conditions.length === 0) {
    return true;
  }
  
  for (const condition of this.settings.conditions) {
    if (!condition.active) continue;
    
    // This would need to be implemented based on specific condition types
    // For now, we'll return true as a placeholder
    const conditionMet = await this.evaluateCondition(condition);
    if (!conditionMet) {
      return false;
    }
  }
  
  return true;
};

// Method to evaluate individual condition
reminderSchema.methods.evaluateCondition = async function(condition) {
  // Placeholder implementation - would need to be expanded based on condition types
  switch (condition.type) {
    case 'task_status':
      // Check task status
      return true;
    case 'due_date_approaching':
      // Check if due date is approaching
      return true;
    case 'user_online':
      // Check if user is online
      return true;
    default:
      return true;
  }
};

// Static method to find due reminders
reminderSchema.statics.findDue = function(includeOverdue = true) {
  const now = new Date();
  const query = { 
    scheduledAt: { $lte: now },
    status: 'scheduled',
    isActive: true
  };
  
  if (!includeOverdue) {
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    query.scheduledAt = { $gte: fiveMinutesAgo, $lte: now };
  }
  
  return this.find(query).sort({ priority: -1, scheduledAt: 1 });
};

// Static method to find user reminders
reminderSchema.statics.findByUser = function(userId, status = null, limit = 50) {
  const query = { userId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ scheduledAt: 1 })
    .limit(limit);
};

// Static method to find entity reminders
reminderSchema.statics.findByEntity = function(entityType, entityId, status = null) {
  const query = { entityType, entityId, isActive: true };
  if (status) {
    query.status = status;
  }
  
  return this.find(query).sort({ scheduledAt: 1 });
};

// Static method to find recurring reminders
reminderSchema.statics.findRecurring = function(activeOnly = true) {
  const query = { 'repeat.enabled': true };
  if (activeOnly) {
    query.isActive = true;
  }
  
  return this.find(query).sort({ nextOccurrence: 1 });
};

// Static method to cleanup expired reminders
reminderSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { expiresAt: { $lt: new Date() } },
    { $set: { isActive: false, status: 'cancelled' } }
  );
};

// Static method to get reminder statistics
reminderSchema.statics.getStats = function(userId = null, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const matchQuery = { createdAt: { $gte: since } };
  
  if (userId) {
    matchQuery.userId = userId;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDeliveryTime: {
          $avg: {
            $subtract: ['$lastTriggered', '$scheduledAt']
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Pre-save middleware
reminderSchema.pre('save', function(next) {
  // Set recurring flag
  this.isRecurring = this.repeat.enabled;
  
  // Calculate next occurrence for new recurring reminders
  if (this.repeat.enabled && this.isNew) {
    this.calculateNextOccurrence();
  }
  
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);
