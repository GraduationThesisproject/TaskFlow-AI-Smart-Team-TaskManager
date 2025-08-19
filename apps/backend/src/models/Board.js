const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [200, 'Board name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['kanban', 'list', 'calendar', 'timeline'],
    default: 'kanban'
  },
  visibility: {
    type: String,
    enum: ['private', 'workspace', 'public'],
    default: 'private'
  },
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'Board must belong to a space']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Owner is assigned when created via API; make optional for test factories
    required: false
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: [String],
      enum: ['view', 'edit', 'delete', 'manage_columns', 'manage_members'],
      default: ['view']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Inline columns are deprecated; use Column model
  columns: [],
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowAttachments: {
      type: Boolean,
      default: true
    },
    allowTimeTracking: {
      type: Boolean,
      default: false
    },
    defaultTaskPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    autoArchive: {
      type: Boolean,
      default: false
    },
    archiveAfterDays: {
      type: Number,
      default: 30,
      min: [1, 'Archive days must be at least 1']
    }
  },
  tags: [{
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters']
    },
    color: {
      type: String,
      default: '#6B7280',
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
    }
  }],
  archived: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for board statistics
boardSchema.virtual('taskCount').get(function() {
  // This will be populated when needed
  return 0;
});

// Virtual for board completion status
boardSchema.virtual('isCompleted').get(function() {
  // This will be calculated based on tasks
  return false;
});

// Indexes for better query performance
boardSchema.index({ space: 1 });
boardSchema.index({ owner: 1 });
boardSchema.index({ 'members.user': 1 });
boardSchema.index({ isActive: 1 });
boardSchema.index({ isTemplate: 1 });
// Composite indexes for common query patterns
boardSchema.index({ space: 1, isActive: 1 });
boardSchema.index({ owner: 1, isActive: 1 });
boardSchema.index({ 'members.user': 1, isActive: 1 });
boardSchema.index({ isTemplate: 1, isActive: 1 });

// Text search indexes for faster, ranked search
boardSchema.index({ name: 'text', description: 'text' });

// Method to add member with permissions
boardSchema.methods.addMember = function(userId, permissions = ['view']) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.permissions = permissions;
  } else {
    this.members.push({ user: userId, permissions });
  }
  return this.save();
};

// Method to remove member
boardSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add column
boardSchema.methods.addColumn = function(columnData) {
  const maxOrder = this.columns.length > 0 
    ? Math.max(...this.columns.map(col => col.order))
    : -1;
  
  const newColumn = {
    ...columnData,
    order: maxOrder + 1
  };
  
  this.columns.push(newColumn);
  return this.save();
};

// Method to reorder columns
boardSchema.methods.reorderColumns = function(columnIds) {
  columnIds.forEach((columnId, index) => {
    const column = this.columns.id(columnId);
    if (column) {
      column.order = index;
    }
  });
  
  // Sort columns by order
  this.columns.sort((a, b) => a.order - b.order);
  return this.save();
};

// Method to check user permissions
boardSchema.methods.hasPermission = function(userId, permission) {
  if (this.owner.toString() === userId.toString()) {
    return true; // Owner has all permissions
  }
  
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.permissions.includes(permission) : false;
};

// Method to get default columns
boardSchema.methods.getDefaultColumns = function() {
  return [
    { name: 'To Do', order: 0, color: '#6B7280', isDefault: true },
    { name: 'In Progress', order: 1, color: '#3B82F6', isDefault: true },
    { name: 'Review', order: 2, color: '#F59E0B', isDefault: true },
    { name: 'Done', order: 3, color: '#10B981', isDefault: true }
  ];
};

// Static method to create board from template
boardSchema.statics.createFromTemplate = async function(templateId, spaceId, ownerId, customizations = {}) {
  const template = await this.findById(templateId);
  if (!template || !template.isTemplate) {
    throw new Error('Invalid template');
  }
  
  const newBoard = new this({
    name: customizations.name || `${template.name} Copy`,
    description: customizations.description || template.description,
    space: spaceId,
    owner: ownerId,
    columns: template.columns.map(col => ({ ...col.toObject(), _id: undefined })),
    settings: { ...template.settings },
    tags: template.tags.map(tag => ({ ...tag.toObject(), _id: undefined })),
    templateSource: templateId
  });
  
  return newBoard.save();
};

// Static method to find boards by user
boardSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isActive: true
  });
};

module.exports = mongoose.model('Board', boardSchema);
