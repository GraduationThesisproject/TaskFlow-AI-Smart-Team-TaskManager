const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Column name is required'],
    trim: true,
    maxlength: [100, 'Column name cannot exceed 100 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Column must belong to a board']
  },
  position: {
    type: Number,
    required: [true, 'Column position is required'],
    min: [0, 'Position cannot be negative']
  },
  taskIds: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    position: {
      type: Number,
      required: true,
      min: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  limit: {
    type: Number,
    default: null,
    min: [1, 'Column limit must be at least 1']
  },
  settings: {
    wipLimit: {
      enabled: { type: Boolean, default: false },
      limit: { type: Number, default: null, min: 1 },
      strictMode: { type: Boolean, default: false } // Prevents adding tasks beyond limit
    },
    sorting: {
      method: {
        type: String,
        enum: ['manual', 'priority', 'due_date', 'created_date', 'alphabetical'],
        default: 'manual'
      },
      direction: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'asc'
      },
      autoSort: { type: Boolean, default: false }
    },
    automation: {
      autoAssign: {
        enabled: { type: Boolean, default: false },
        assignTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null
        }
      },
      statusUpdate: {
        enabled: { type: Boolean, default: true },
        targetStatus: {
          type: String,
          enum: ['todo', 'in_progress', 'review', 'done', 'archived'],
          default: null
        }
      },
      notifications: {
        onTaskAdded: { type: Boolean, default: false },
        onTaskRemoved: { type: Boolean, default: false },
        onLimitReached: { type: Boolean, default: true }
      }
    },
    visibility: {
      isCollapsible: { type: Boolean, default: true },
      isCollapsed: { type: Boolean, default: false },
      showTaskCount: { type: Boolean, default: true },
      showProgressBar: { type: Boolean, default: false }
    }
  },
  statusMapping: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done', 'archived'],
    default: null
  },
  style: {
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    },
    backgroundColor: {
      type: String,
      default: '#F9FAFB',
      match: [/^#[0-9A-F]{6}$/i, 'Background color must be a valid hex color']
    },
    icon: {
      type: String,
      default: null
    },
    customCss: {
      type: String,
      maxlength: [1000, 'Custom CSS cannot exceed 1000 characters']
    }
  },
  activityLog: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityLog'
  }],
  stats: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    overdueTasks: { type: Number, default: 0 },
    highPriorityTasks: { type: Number, default: 0 },
    averageTaskAge: { type: Number, default: 0 }, // in days
    lastTaskAdded: { type: Date, default: null },
    lastTaskCompleted: { type: Date, default: null }
  },
  isDefault: {
    type: Boolean,
    default: false
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

// Virtual for column utilization
columnSchema.virtual('utilization').get(function() {
  if (!this.limit) return null;
  return Math.round((this.stats.totalTasks / this.limit) * 100);
});

// Virtual for column health
columnSchema.virtual('health').get(function() {
  const overflowRatio = this.limit ? (this.stats.totalTasks / this.limit) : 0;
  const overdueRatio = this.stats.totalTasks > 0 ? (this.stats.overdueTasks / this.stats.totalTasks) : 0;
  
  if (overflowRatio > 1 || overdueRatio > 0.3) return 'critical';
  if (overflowRatio > 0.8 || overdueRatio > 0.1) return 'warning';
  return 'healthy';
});

// Virtual for is over limit
columnSchema.virtual('isOverLimit').get(function() {
  return this.limit && this.stats.totalTasks > this.limit;
});

// Virtual for available capacity
columnSchema.virtual('availableCapacity').get(function() {
  if (!this.limit) return null;
  return Math.max(0, this.limit - this.stats.totalTasks);
});

// Virtual for completion rate
columnSchema.virtual('completionRate').get(function() {
  if (this.stats.totalTasks === 0) return 0;
  return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
});

// Indexes for better query performance
columnSchema.index({ board: 1 });
columnSchema.index({ position: 1 });
columnSchema.index({ 'taskIds.task': 1 });
columnSchema.index({ isArchived: 1 });
columnSchema.index({ isDefault: 1 });

// Method to add task
columnSchema.methods.addTask = function(taskId, position = null) {
  // Check WIP limit if strict mode is enabled
  if (this.settings.wipLimit.enabled && this.settings.wipLimit.strictMode && 
      this.stats.totalTasks >= this.settings.wipLimit.limit) {
    throw new Error('Column WIP limit exceeded');
  }
  
  // Remove task if it already exists in this column
  this.removeTask(taskId);
  
  // Determine position
  const targetPosition = position !== null ? position : this.taskIds.length;
  
  // Shift existing tasks if needed
  this.taskIds.forEach(taskEntry => {
    if (taskEntry.position >= targetPosition) {
      taskEntry.position += 1;
    }
  });
  
  // Add new task
  this.taskIds.push({
    task: taskId,
    position: targetPosition
  });
  
  // Update stats
  this.stats.totalTasks = this.taskIds.length;
  this.stats.lastTaskAdded = new Date();
  
  return this.save();
};

// Method to remove task
columnSchema.methods.removeTask = function(taskId) {
  const taskIndex = this.taskIds.findIndex(taskEntry => 
    taskEntry.task.toString() === taskId.toString()
  );
  
  if (taskIndex === -1) return this;
  
  const removedPosition = this.taskIds[taskIndex].position;
  
  // Remove task
  this.taskIds.splice(taskIndex, 1);
  
  // Reorder remaining tasks
  this.taskIds.forEach(taskEntry => {
    if (taskEntry.position > removedPosition) {
      taskEntry.position -= 1;
    }
  });
  
  // Update stats
  this.stats.totalTasks = this.taskIds.length;
  
  return this.save();
};

// Method to move task within column
columnSchema.methods.moveTask = function(taskId, newPosition) {
  const taskEntry = this.taskIds.find(entry => 
    entry.task.toString() === taskId.toString()
  );
  
  if (!taskEntry) {
    throw new Error('Task not found in column');
  }
  
  const oldPosition = taskEntry.position;
  
  // Update positions of affected tasks
  if (newPosition < oldPosition) {
    // Moving task up (to lower position number)
    this.taskIds.forEach(entry => {
      if (entry.position >= newPosition && entry.position < oldPosition) {
        entry.position += 1;
      }
    });
  } else if (newPosition > oldPosition) {
    // Moving task down (to higher position number)
    this.taskIds.forEach(entry => {
      if (entry.position > oldPosition && entry.position <= newPosition) {
        entry.position -= 1;
      }
    });
  }
  
  // Update task position
  taskEntry.position = newPosition;
  
  return this.save();
};

// Method to reorder all tasks
columnSchema.methods.reorderTasks = function(orderedTaskIds) {
  // Validate that all provided task IDs exist in the column
  const existingTaskIds = this.taskIds.map(entry => entry.task.toString());
  const invalidTasks = orderedTaskIds.filter(taskId => 
    !existingTaskIds.includes(taskId.toString())
  );
  
  if (invalidTasks.length > 0) {
    throw new Error('Some tasks do not exist in this column');
  }
  
  // Update positions
  orderedTaskIds.forEach((taskId, index) => {
    const taskEntry = this.taskIds.find(entry => 
      entry.task.toString() === taskId.toString()
    );
    if (taskEntry) {
      taskEntry.position = index;
    }
  });
  
  // Sort taskIds array by position
  this.taskIds.sort((a, b) => a.position - b.position);
  
  return this.save();
};

// Method to apply automatic sorting
columnSchema.methods.applySorting = function() {
  if (!this.settings.sorting.autoSort || this.settings.sorting.method === 'manual') {
    return this;
  }
  
  // This would require populated task data to sort properly
  // Implementation would depend on the specific sorting method
  // For now, we'll just ensure positions are sequential
  this.taskIds.sort((a, b) => a.position - b.position);
  this.taskIds.forEach((entry, index) => {
    entry.position = index;
  });
  
  return this.save();
};

// Method to update settings
columnSchema.methods.updateSettings = function(settingSection, updates) {
  if (this.settings[settingSection]) {
    Object.assign(this.settings[settingSection], updates);
  }
  return this.save();
};

// Method to update stats
columnSchema.methods.updateStats = function(statsUpdate) {
  Object.assign(this.stats, statsUpdate);
  return this.save();
};

// Method to check if can add task (considering WIP limits)
columnSchema.methods.canAddTask = function() {
  if (!this.settings.wipLimit.enabled) return true;
  
  return this.stats.totalTasks < this.settings.wipLimit.limit;
};

// Method to archive column
columnSchema.methods.archive = function(userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;
  return this.save();
};

// Method to unarchive column
columnSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;
  return this.save();
};

// Method to get tasks in order
columnSchema.methods.getOrderedTasks = function() {
  return this.taskIds
    .sort((a, b) => a.position - b.position)
    .map(entry => entry.task);
};

// Method to duplicate column
columnSchema.methods.duplicate = function(targetBoardId, newName = null) {
  const duplicatedColumn = new this.constructor({
    name: newName || `${this.name} (Copy)`,
    board: targetBoardId,
    position: 0, // Will be adjusted by the board
    settings: { ...this.settings },
    style: { ...this.style },
    limit: this.limit,
    isDefault: false
  });
  
  return duplicatedColumn.save();
};

// Static method to find columns by board
columnSchema.statics.findByBoard = function(boardId, includeArchived = false) {
  const query = { board: boardId };
  if (!includeArchived) {
    query.isArchived = false;
  }
  return this.find(query).sort({ position: 1 });
};

// Static method to find columns over WIP limit
columnSchema.statics.findOverLimit = function(boardId = null) {
  const query = {
    'settings.wipLimit.enabled': true,
    $expr: { $gt: ['$stats.totalTasks', '$settings.wipLimit.limit'] },
    isArchived: false
  };
  
  if (boardId) {
    query.board = boardId;
  }
  
  return this.find(query);
};

// Static method to find default columns
columnSchema.statics.findDefault = function(boardId = null) {
  const query = { isDefault: true };
  if (boardId) {
    query.board = boardId;
  }
  return this.find(query).sort({ position: 1 });
};

// Static method to create default columns for a board
columnSchema.statics.createDefaultColumns = function(boardId) {
  const defaultColumns = [
    { name: 'To Do', position: 0, color: '#6B7280', isDefault: true },
    { name: 'In Progress', position: 1, color: '#3B82F6', isDefault: true },
    { name: 'Review', position: 2, color: '#F59E0B', isDefault: true },
    { name: 'Done', position: 3, color: '#10B981', isDefault: true }
  ];
  
  const columns = defaultColumns.map(columnData => new this({
    ...columnData,
    board: boardId
  }));
  
  return Promise.all(columns.map(column => column.save()));
};

// Pre-save middleware to ensure position integrity
columnSchema.pre('save', function(next) {
  // Update total tasks count based on taskIds array
  this.stats.totalTasks = this.taskIds.length;
  
  // Ensure positions are sequential within taskIds
  this.taskIds.sort((a, b) => a.position - b.position);
  this.taskIds.forEach((entry, index) => {
    if (entry.position !== index) {
      entry.position = index;
    }
  });
  
  next();
});

module.exports = mongoose.model('Column', columnSchema);
