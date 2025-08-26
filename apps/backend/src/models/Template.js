const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Template description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['task', 'board', 'space', 'workflow', 'checklist'],
    required: [true, 'Template type is required']
  },
  
  // Template content - JSON structure
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Template content is required']
  },
  
  // Template structure for validation
  structure: {
    version: {
      type: String,
      default: '1.0'
    },
    schema: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    required: [String],
    optional: [String]
  },
  
  // Ownership and access control
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Template must be created by a user']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  
  // Template categorization
  category: {
    type: String,
    enum: [
      'Marketing',
      'Development',
      'Design',
      'Sales',
      'Support',
      'Operations',
      'HR',
      'Finance',
      'General',
      'Custom'
    ],
    default: 'General'
  },
  
  // Engagement metrics
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Track unique viewers to ensure one view per user
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: undefined
  }],
  
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Access control for private templates
  accessControl: {
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedWorkspaces: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace'
    }],
    allowedRoles: [{
      type: String,
      enum: ['user', 'manager', 'team_member', 'admin', 'superadmin']
    }]
  },
  
  // Usage statistics
  usage: {
    totalUses: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Template status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'deprecated'],
    default: 'draft'
  },
  
  // Version control
  version: {
    major: {
      type: Number,
      default: 1
    },
    minor: {
      type: Number,
      default: 0
    },
    patch: {
      type: Number,
      default: 0
    }
  },
  
  // Template preview
  preview: {
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null
    },
    screenshot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null
    }
  },
  
  // Template configuration
  config: {
    allowCustomization: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxInstances: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    expiryDate: {
      type: Date,
      default: null
    }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full version string
templateSchema.virtual('versionString').get(function() {
  return `${this.version.major}.${this.version.minor}.${this.version.patch}`;
});

// Virtual likes count
templateSchema.virtual('likesCount').get(function() {
  return Array.isArray(this.likedBy) ? this.likedBy.length : 0;
});

// Virtual for is expired
templateSchema.virtual('isExpired').get(function() {
  if (!this.config.expiryDate) return false;
  return new Date() > this.config.expiryDate;
});

// Virtual for can be used
templateSchema.virtual('canBeUsed').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Virtual for average rating
templateSchema.virtual('averageRating').get(function() {
  return this.usage.rating.average;
});

// Indexes for better query performance
templateSchema.index({ type: 1, status: 1 });
templateSchema.index({ category: 1, status: 1 });
templateSchema.index({ isPublic: 1, status: 1 });
templateSchema.index({ createdBy: 1, createdAt: -1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ 'usage.totalUses': -1 });
templateSchema.index({ 'usage.rating.average': -1 });
templateSchema.index({ name: 'text', description: 'text' });

// Method to increment usage
templateSchema.methods.incrementUsage = function() {
  this.usage.totalUses += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// Method to add rating
templateSchema.methods.addRating = function(rating) {
  if (rating < 0 || rating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }
  
  const currentTotal = this.usage.rating.average * this.usage.rating.count;
  this.usage.rating.count += 1;
  this.usage.rating.average = (currentTotal + rating) / this.usage.rating.count;
  
  return this.save();
};

// Method to check if user can access template
templateSchema.methods.canUserAccess = function(user, workspaceId = null) {
  // System templates are always accessible
  if (this.isSystem) return true;
  
  // Public templates are accessible to everyone
  if (this.isPublic) return true;
  
  // Check if user is in allowed users
  if (this.accessControl.allowedUsers.includes(user._id)) {
    return true;
  }
  
  // Check if user has allowed role
  if (this.accessControl.allowedRoles.includes(user.role)) {
    return true;
  }
  
  // Check if workspace is allowed
  if (workspaceId && this.accessControl.allowedWorkspaces.includes(workspaceId)) {
    return true;
  }
  
  return false;
};

// Method to grant access to user
templateSchema.methods.grantUserAccess = function(userId) {
  if (!this.accessControl.allowedUsers.includes(userId)) {
    this.accessControl.allowedUsers.push(userId);
  }
  return this.save();
};

// Method to revoke access from user
templateSchema.methods.revokeUserAccess = function(userId) {
  this.accessControl.allowedUsers = this.accessControl.allowedUsers.filter(
    id => id.toString() !== userId.toString()
  );
  return this.save();
};

// Method to grant access to workspace
templateSchema.methods.grantWorkspaceAccess = function(workspaceId) {
  if (!this.accessControl.allowedWorkspaces.includes(workspaceId)) {
    this.accessControl.allowedWorkspaces.push(workspaceId);
  }
  return this.save();
};

// Method to revoke access from workspace
templateSchema.methods.revokeWorkspaceAccess = function(workspaceId) {
  this.accessControl.allowedWorkspaces = this.accessControl.allowedWorkspaces.filter(
    id => id.toString() !== workspaceId.toString()
  );
  return this.save();
};

// Method to add tag
templateSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
templateSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Method to update version
templateSchema.methods.updateVersion = function(type = 'patch') {
  switch (type) {
    case 'major':
      this.version.major += 1;
      this.version.minor = 0;
      this.version.patch = 0;
      break;
    case 'minor':
      this.version.minor += 1;
      this.version.patch = 0;
      break;
    case 'patch':
      this.version.patch += 1;
      break;
  }
  return this.save();
};

// Method to archive template
templateSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to activate template
templateSchema.methods.activate = function() {
  this.status = 'active';
  return this.save();
};

// Method to deprecate template
templateSchema.methods.deprecate = function() {
  this.status = 'deprecated';
  return this.save();
};

// Method to validate content against schema
templateSchema.methods.validateContent = function() {
  // This would implement schema validation logic
  // For now, we'll just check if content exists
  return this.content && typeof this.content === 'object';
};

// Static method to find public templates
templateSchema.statics.findPublic = function(type = null, category = null) {
  const query = { isPublic: true, status: 'active' };
  if (type) query.type = type;
  if (category) query.category = category;
  
  return this.find(query).sort({ 'usage.totalUses': -1 });
};

// Static method to find templates by type
templateSchema.statics.findByType = function(type, status = 'active') {
  return this.find({ type, status }).sort({ 'usage.totalUses': -1 });
};

// Static method to find templates by category
templateSchema.statics.findByCategory = function(category, status = 'active') {
  return this.find({ category, status }).sort({ 'usage.totalUses': -1 });
};

// Static method to find system templates
templateSchema.statics.findSystem = function() {
  return this.find({ isSystem: true, status: 'active' }).sort({ name: 1 });
};

// Static method to find templates by creator
templateSchema.statics.findByCreator = function(adminId) {
  return this.find({ createdBy: adminId }).sort({ createdAt: -1 });
};

// Static method to find popular templates
templateSchema.statics.findPopular = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'usage.totalUses': -1 })
    .limit(limit);
};

// Static method to find highly rated templates
templateSchema.statics.findHighlyRated = function(minRating = 4.0, limit = 10) {
  return this.find({
    status: 'active',
    'usage.rating.average': { $gte: minRating },
    'usage.rating.count': { $gte: 5 } // At least 5 ratings
  })
    .sort({ 'usage.rating.average': -1 })
    .limit(limit);
};

// Static method to find templates by tags
templateSchema.statics.findByTags = function(tags, status = 'active') {
  return this.find({
    tags: { $in: tags },
    status
  }).sort({ 'usage.totalUses': -1 });
};

// Static method to search templates
templateSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: options.status || 'active'
  };
  
  if (options.type) searchQuery.type = options.type;
  if (options.category) searchQuery.category = options.category;
  if (options.isPublic !== undefined) searchQuery.isPublic = options.isPublic;
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

// Static method to get template statistics
templateSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalUses: { $sum: '$usage.totalUses' },
        avgRating: { $avg: '$usage.rating.average' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalUses: stat.totalUses,
      avgRating: stat.avgRating
    };
    return acc;
  }, {});
};

// Static method to create template
templateSchema.statics.createTemplate = function(data, adminId) {
  return new this({
    ...data,
    createdBy: adminId,
    version: {
      major: 1,
      minor: 0,
      patch: 0
    }
  });
};

// Pre-save middleware to validate content
templateSchema.pre('save', function(next) {
  if (!this.validateContent()) {
    return next(new Error('Template content is invalid'));
  }
  next();
});

// Auto-populate creator on all find queries
templateSchema.pre(/^find/, function(next) {
  this.populate('createdBy', 'name email displayName')
      .populate('likedBy', 'name displayName')
      .populate('viewedBy', 'name displayName');
  next();
});

module.exports = mongoose.model('Template', templateSchema);