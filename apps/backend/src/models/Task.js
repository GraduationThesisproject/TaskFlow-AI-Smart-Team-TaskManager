const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Task must belong to a board']
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'Task must belong to a space']
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Column',
    required: [true, 'Task must be in a column']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#6B7280',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task reporter is required']
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  dueDate: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    default: null
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  position: {
    type: Number,
    default: 0,
    min: [0, 'Position cannot be negative']
  },
  movedAt: {
    type: Date,
    default: null
  },
  timeEntries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Time entry description cannot exceed 500 characters']
    }
  }],
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  checklist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Checklist',
    default: null
  },
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related_to'],
      default: 'blocks'
    }
  }],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiSuggestions: {
    estimatedDeadline: Date,
    suggestedPriority: String,
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex'],
      default: 'medium'
    },
    similarTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }]
  },
  naturalLanguageInput: {
    type: String,
    trim: true,
    maxlength: [1000, 'Natural language input cannot exceed 1000 characters']
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  retentionPolicy: {
    deleteAfterDays: { type: Number, default: 365 },
    autoArchive: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for task progress based on column
taskSchema.virtual('progress').get(function() {
  // Progress will be determined by the column the task is in
  // This should be populated when the column is populated
  if (this.populated('column') && this.column) {
    const columnName = this.column.name ? this.column.name.toLowerCase() : '';
    if (columnName.includes('done') || columnName.includes('complete')) return 100;
    if (columnName.includes('review') || columnName.includes('testing')) return 75;
    if (columnName.includes('progress') || columnName.includes('doing')) return 50;
    return 25; // Default for new/todo columns
  }
  return 0;
});

// Virtual for time tracking status
taskSchema.virtual('isTimeTracking').get(function() {
  return this.timeEntries && this.timeEntries.some(entry => entry.endTime === null);
});

// Virtual for overdue status
taskSchema.virtual('overdueDays').get(function() {
  if (!this.dueDate) return 0;
  
  // Check if task is in a "done" or "complete" column
  if (this.populated('column') && this.column) {
    const columnName = this.column.name ? this.column.name.toLowerCase() : '';
    if (columnName.includes('done') || columnName.includes('complete')) return 0;
  }
  
  const now = new Date();
  const due = new Date(this.dueDate);
  return Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
});

// Add isActive virtual to timeEntries
taskSchema.methods.getActiveTimeEntry = function(userId) {
  return this.timeEntries.find(entry => 
    entry.user.toString() === userId.toString() && (!entry.endTime || entry.endTime === null)
  );
};

// Indexes for better query performance
taskSchema.index({ board: 1 });
taskSchema.index({ space: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'tags': 1 });
taskSchema.index({ isOverdue: 1 });
// Composite indexes for common query patterns
taskSchema.index({ board: 1, column: 1 });
taskSchema.index({ space: 1, column: 1 });
taskSchema.index({ assignees: 1, column: 1 });
taskSchema.index({ board: 1, assignees: 1, column: 1 });
taskSchema.index({ dueDate: 1, column: 1 });
taskSchema.index({ priority: 1, column: 1 });
// Additional indexes for common filters
taskSchema.index({ space: 1, board: 1, column: 1, assignees: 1, dueDate: 1 });

// Text search indexes for faster, ranked search
taskSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Method to move task to different column
taskSchema.methods.moveToColumn = function(columnId) {
  this.column = columnId;
  this.movedAt = new Date();
  return this.save();
};

// Method to assign task
taskSchema.methods.assignTo = function(userId) {
  if (!this.assignees.includes(userId)) {
    this.assignees.push(userId);
  }
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  return this.save();
};

// Method to add time entry
taskSchema.methods.addTimeEntry = function(userId, startTime, description = '') {
  const timeEntry = {
    user: userId,
    startTime,
    description
  };
  
  if (!this.timeEntries) this.timeEntries = [];
  this.timeEntries.push(timeEntry);
  return this.save();
};

// Method to stop time tracking
taskSchema.methods.stopTimeTracking = function(userId) {
  if (!this.timeEntries) this.timeEntries = [];
  const activeEntry = this.timeEntries.find(entry => 
    entry.user.toString() === userId.toString() && entry.endTime === null
  );
  
  if (activeEntry) {
    activeEntry.endTime = new Date();
    activeEntry.duration = Math.round((activeEntry.endTime - activeEntry.startTime) / (1000 * 60));
    this.actualHours += activeEntry.duration / 60;
  }
  
  return this.save();
};

// Method to add watcher
taskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
  return this.save();
};

// Method to remove watcher
taskSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(watcher => 
    watcher.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add dependency
taskSchema.methods.addDependency = function(taskId, type = 'blocks') {
  const existingDependency = this.dependencies.find(dep => 
    dep.task.toString() === taskId.toString()
  );
  
  if (existingDependency) {
    existingDependency.type = type;
  } else {
    this.dependencies.push({ task: taskId, type });
  }
  
  return this.save();
};

// Method to add attachment
taskSchema.methods.addAttachment = function(fileId) {
  if (!this.attachments.includes(fileId)) {
    this.attachments.push(fileId);
  }
  return this.save();
};

// Method to remove attachment
taskSchema.methods.removeAttachment = function(fileId) {
  this.attachments = this.attachments.filter(attachment => 
    attachment.toString() !== fileId.toString()
  );
  return this.save();
};

// Method to check if overdue
taskSchema.methods.checkOverdue = function() {
  if (this.dueDate) {
    // Check if task is in a "done" or "complete" column
    let isComplete = false;
    if (this.populated('column') && this.column) {
      const columnName = this.column.name ? this.column.name.toLowerCase() : '';
      isComplete = columnName.includes('done') || columnName.includes('complete');
    }
    
    this.isOverdue = !isComplete && (new Date() > this.dueDate);
  } else {
    this.isOverdue = false;
  }
  return this;
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() }
  }).populate('column');
};

// Static method to find tasks by assignee
taskSchema.statics.findByAssignee = function(userId) {
  return this.find({ assignees: userId });
};

// Static method to find tasks by column
taskSchema.statics.findByColumn = function(columnId) {
  return this.find({ column: columnId });
};

// Static method to find tasks by priority
taskSchema.statics.findByPriority = function(priority) {
  return this.find({ priority });
};

// Pre-save middleware to check overdue status
taskSchema.pre('save', function(next) {
  this.checkOverdue();
  next();
});

// Database indexes for performance
taskSchema.index({ board: 1, column: 1, position: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
