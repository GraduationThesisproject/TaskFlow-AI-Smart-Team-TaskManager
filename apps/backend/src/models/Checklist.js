const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Checklist must belong to a task']
  },
  title: {
    type: String,
    required: [true, 'Checklist title is required'],
    trim: true,
    maxlength: [200, 'Checklist title cannot exceed 200 characters']
  },
  items: [{
    text: {
      type: String,
      required: [true, 'Checklist item text is required'],
      trim: true,
      maxlength: [500, 'Checklist item cannot exceed 500 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    position: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Item description cannot exceed 1000 characters']
    },
    estimatedMinutes: {
      type: Number,
      min: [1, 'Estimated time must be at least 1 minute'],
      default: null
    },
    actualMinutes: {
      type: Number,
      min: [0, 'Actual time cannot be negative'],
      default: 0
    },
    attachments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    }],
    comments: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    isOverdue: {
      type: Boolean,
      default: false
    },
    reminders: [{
      reminderAt: {
        type: Date,
        required: true
      },
      method: {
        type: String,
        enum: ['email', 'push', 'sms'],
        default: 'push'
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date,
        default: null
      }
    }],
    dependencies: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      type: {
        type: String,
        enum: ['blocks', 'blocked_by', 'related_to'],
        default: 'blocks'
      }
    }],
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      voteType: {
        type: String,
        enum: ['upvote', 'downvote'],
        required: true
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  position: {
    type: Number,
    required: [true, 'Checklist position is required'],
    min: [0, 'Position cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Checklist creator is required']
  },
  settings: {
    showProgress: { type: Boolean, default: true },
    allowItemAssignment: { type: Boolean, default: true },
    allowItemComments: { type: Boolean, default: true },
    allowItemAttachments: { type: Boolean, default: true },
    requireCompleteOrder: { type: Boolean, default: false }, // Items must be completed in order
    autoCompleteWhenAllDone: { type: Boolean, default: false }, // Auto-complete parent task
    sendNotifications: { type: Boolean, default: true },
    template: {
      isTemplate: { type: Boolean, default: false },
      templateName: String,
      category: String
    }
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stats: {
    totalItems: { type: Number, default: 0 },
    completedItems: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    averageCompletionTime: { type: Number, default: 0 }, // in minutes
    overdueItems: { type: Number, default: 0 },
    lastCompletedAt: { type: Date, default: null },
    estimatedTotalTime: { type: Number, default: 0 }, // in minutes
    actualTotalTime: { type: Number, default: 0 } // in minutes
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

// Virtual for checklist progress
checklistSchema.virtual('progress').get(function() {
  return this.stats.completionPercentage;
});

// Virtual for is completed
checklistSchema.virtual('isCompleted').get(function() {
  return this.stats.completionPercentage === 100;
});

// Virtual for has overdue items
checklistSchema.virtual('hasOverdueItems').get(function() {
  return this.stats.overdueItems > 0;
});

// Virtual for remaining items
checklistSchema.virtual('remainingItems').get(function() {
  return this.stats.totalItems - this.stats.completedItems;
});

// Virtual for next incomplete item
checklistSchema.virtual('nextIncompleteItem').get(function() {
  if (this.settings.requireCompleteOrder) {
    return this.items.find(item => !item.completed);
  }
  return null;
});

// Indexes for better query performance
checklistSchema.index({ taskId: 1 });
checklistSchema.index({ createdBy: 1 });
checklistSchema.index({ position: 1 });
checklistSchema.index({ isArchived: 1 });
checklistSchema.index({ 'items.assignedTo': 1 });
checklistSchema.index({ 'items.dueDate': 1 });
checklistSchema.index({ 'items.completed': 1 });

// Method to add item
checklistSchema.methods.addItem = function(itemData, position = null) {
  const targetPosition = position !== null ? position : this.items.length;
  
  // Shift existing items if needed
  this.items.forEach(item => {
    if (item.position >= targetPosition) {
      item.position += 1;
    }
  });
  
  // Add new item
  const newItem = {
    ...itemData,
    position: targetPosition
  };
  
  this.items.push(newItem);
  this.updateStats();
  
  return this.save();
};

// Method to remove item
checklistSchema.methods.removeItem = function(itemId) {
  const itemIndex = this.items.findIndex(item => item._id.toString() === itemId.toString());
  
  if (itemIndex === -1) {
    throw new Error('Checklist item not found');
  }
  
  const removedPosition = this.items[itemIndex].position;
  
  // Remove item
  this.items.splice(itemIndex, 1);
  
  // Reorder remaining items
  this.items.forEach(item => {
    if (item.position > removedPosition) {
      item.position -= 1;
    }
  });
  
  this.updateStats();
  return this.save();
};

// Method to complete item
checklistSchema.methods.completeItem = function(itemId, userId) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  // Check if order completion is required
  if (this.settings.requireCompleteOrder) {
    const incompleteBeforeThis = this.items.some(i => 
      i.position < item.position && !i.completed
    );
    if (incompleteBeforeThis) {
      throw new Error('Previous items must be completed first');
    }
  }
  
  item.completed = true;
  item.completedAt = new Date();
  item.completedBy = userId;
  
  this.updateStats();
  
  // Auto-complete parent task if all items are done
  if (this.settings.autoCompleteWhenAllDone && this.isCompleted) {
    // This would trigger task completion - implementation depends on Task model
  }
  
  return this.save();
};

// Method to uncomplete item
checklistSchema.methods.uncompleteItem = function(itemId) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  item.completed = false;
  item.completedAt = null;
  item.completedBy = null;
  
  this.updateStats();
  return this.save();
};

// Method to assign item
checklistSchema.methods.assignItem = function(itemId, userId, assignedBy) {
  if (!this.settings.allowItemAssignment) {
    throw new Error('Item assignment is disabled for this checklist');
  }
  
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  item.assignedTo = userId;
  item.assignedAt = new Date();
  item.assignedBy = assignedBy;
  
  return this.save();
};

// Method to reorder items
checklistSchema.methods.reorderItems = function(orderedItemIds) {
  orderedItemIds.forEach((itemId, index) => {
    const item = this.items.id(itemId);
    if (item) {
      item.position = index;
    }
  });
  
  // Sort items array by position
  this.items.sort((a, b) => a.position - b.position);
  
  return this.save();
};

// Method to add comment to item
checklistSchema.methods.addItemComment = function(itemId, userId, content) {
  if (!this.settings.allowItemComments) {
    throw new Error('Item comments are disabled for this checklist');
  }
  
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  item.comments.push({
    author: userId,
    content: content
  });
  
  return this.save();
};

// Method to add attachment to item
checklistSchema.methods.addItemAttachment = function(itemId, fileId) {
  if (!this.settings.allowItemAttachments) {
    throw new Error('Item attachments are disabled for this checklist');
  }
  
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  if (!item.attachments.includes(fileId)) {
    item.attachments.push(fileId);
  }
  
  return this.save();
};

// Method to remove attachment from item
checklistSchema.methods.removeItemAttachment = function(itemId, fileId) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }
  
  item.attachments = item.attachments.filter(attachment => 
    attachment.toString() !== fileId.toString()
  );
  
  return this.save();
};

// Method to update stats
checklistSchema.methods.updateStats = function() {
  this.stats.totalItems = this.items.length;
  this.stats.completedItems = this.items.filter(item => item.completed).length;
  this.stats.completionPercentage = this.stats.totalItems > 0 
    ? Math.round((this.stats.completedItems / this.stats.totalItems) * 100)
    : 0;
  
  // Update overdue items
  const now = new Date();
  this.stats.overdueItems = this.items.filter(item => 
    !item.completed && item.dueDate && item.dueDate < now
  ).length;
  
  // Update last completed date
  const completedItems = this.items.filter(item => item.completed && item.completedAt);
  if (completedItems.length > 0) {
    this.stats.lastCompletedAt = new Date(Math.max(...completedItems.map(item => item.completedAt)));
  }
  
  // Update estimated and actual time
  this.stats.estimatedTotalTime = this.items.reduce((sum, item) => 
    sum + (item.estimatedMinutes || 0), 0
  );
  this.stats.actualTotalTime = this.items.reduce((sum, item) => 
    sum + (item.actualMinutes || 0), 0
  );
  
  return this;
};

// Method to duplicate checklist
checklistSchema.methods.duplicate = function(targetTaskId, newTitle = null) {
  const duplicatedChecklist = new this.constructor({
    taskId: targetTaskId,
    title: newTitle || `${this.title} (Copy)`,
    items: this.items.map(item => ({
      text: item.text,
      description: item.description,
      priority: item.priority,
      position: item.position,
      estimatedMinutes: item.estimatedMinutes,
      tags: [...item.tags]
    })),
    position: this.position,
    createdBy: this.createdBy,
    settings: { ...this.settings },
    metadata: new Map(this.metadata)
  });
  
  return duplicatedChecklist.save();
};

// Method to create from template
checklistSchema.methods.createFromTemplate = function(taskId, createdBy) {
  if (!this.settings.template.isTemplate) {
    throw new Error('This is not a template checklist');
  }
  
  const newChecklist = new this.constructor({
    taskId: taskId,
    title: this.title,
    items: this.items.map(item => ({
      text: item.text,
      description: item.description,
      priority: item.priority,
      position: item.position,
      estimatedMinutes: item.estimatedMinutes,
      tags: [...item.tags]
    })),
    position: 0,
    createdBy: createdBy,
    settings: { ...this.settings, template: { isTemplate: false } },
    metadata: new Map(this.metadata)
  });
  
  return newChecklist.save();
};

// Method to archive checklist
checklistSchema.methods.archive = function(userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  return this.save();
};

// Method to unarchive checklist
checklistSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;
  return this.save();
};

// Static method to find checklists by task
checklistSchema.statics.findByTask = function(taskId, includeArchived = false) {
  const query = { taskId };
  if (!includeArchived) {
    query.isArchived = false;
  }
  return this.find(query).sort({ position: 1 });
};

// Static method to find checklists by user
checklistSchema.statics.findByUser = function(userId, role = 'any') {
  let query = { isArchived: false };
  
  switch (role) {
    case 'creator':
      query.createdBy = userId;
      break;
    case 'assignee':
      query['items.assignedTo'] = userId;
      break;
    case 'any':
    default:
      query = {
        $or: [
          { createdBy: userId },
          { 'items.assignedTo': userId }
        ],
        isArchived: false
      };
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find template checklists
checklistSchema.statics.findTemplates = function(category = null) {
  const query = { 'settings.template.isTemplate': true };
  if (category) {
    query['settings.template.category'] = category;
  }
  return this.find(query).sort({ 'settings.template.templateName': 1 });
};

// Static method to find overdue checklists
checklistSchema.statics.findWithOverdueItems = function(userId = null) {
  const query = { 'stats.overdueItems': { $gt: 0 }, isArchived: false };
  if (userId) {
    query['items.assignedTo'] = userId;
  }
  return this.find(query).sort({ 'stats.overdueItems': -1 });
};

// Pre-save middleware to update stats and check overdue items
checklistSchema.pre('save', function(next) {
  // Update stats
  this.updateStats();
  
  // Check for overdue items
  const now = new Date();
  this.items.forEach(item => {
    item.isOverdue = !item.completed && item.dueDate && item.dueDate < now;
  });
  
  next();
});

module.exports = mongoose.model('Checklist', checklistSchema);
