const mongoose = require('mongoose');

const boardTemplateSchema = new mongoose.Schema({
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
  categories: [{
    type: String,
    enum: [
      'Business',
      'IT',
      'Personal',
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
    default: ['General']
  }],
  defaultLists: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'List title cannot exceed 100 characters']
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    color: {
      type: String,
      default: '#3B82F6' // Default blue color
    }
  }],
  defaultCards: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Card title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Card description cannot exceed 1000 characters']
    },
    listId: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true,
      min: 0
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    estimatedHours: {
      type: Number,
      min: 0,
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }]
  }],
  thumbnail: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Template must be created by an admin']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
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

// Virtual for average rating
boardTemplateSchema.virtual('averageRating').get(function() {
  return this.rating.average;
});

// Virtual for total lists count
boardTemplateSchema.virtual('totalLists').get(function() {
  return this.defaultLists.length;
});

// Virtual for total cards count
boardTemplateSchema.virtual('totalCards').get(function() {
  return this.defaultCards.length;
});

// Indexes for better query performance
boardTemplateSchema.index({ name: 'text', description: 'text' });
boardTemplateSchema.index({ categories: 1, isActive: 1 });
boardTemplateSchema.index({ isPublic: 1, isActive: 1 });
boardTemplateSchema.index({ createdBy: 1, createdAt: -1 });
boardTemplateSchema.index({ tags: 1 });
boardTemplateSchema.index({ usageCount: -1 });
boardTemplateSchema.index({ 'rating.average': -1 });

// Method to increment usage
boardTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Method to add rating
boardTemplateSchema.methods.addRating = function(rating) {
  if (rating < 0 || rating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }
  
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + rating) / this.rating.count;
  
  return this.save();
};

// Method to check if template is usable
boardTemplateSchema.methods.isUsable = function() {
  return this.isActive && this.defaultLists.length > 0;
};

// Static method to find active public templates
boardTemplateSchema.statics.findActivePublic = function(categories = null) {
  const query = { isActive: true, isPublic: true };
  if (categories && categories.length > 0) {
    query.categories = { $in: categories };
  }
  
  return this.find(query)
    .sort({ usageCount: -1, 'rating.average': -1 })
    .populate('createdBy', 'name email');
};

// Static method to find templates by category
boardTemplateSchema.statics.findByCategory = function(category) {
  return this.find({
    categories: category,
    isActive: true,
    isPublic: true
  }).sort({ usageCount: -1, 'rating.average': -1 });
};

// Static method to find popular templates
boardTemplateSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true, isPublic: true })
    .sort({ usageCount: -1, 'rating.average': -1 })
    .limit(limit)
    .populate('createdBy', 'name email');
};

// Static method to find highly rated templates
boardTemplateSchema.statics.findHighlyRated = function(minRating = 4.0, limit = 10) {
  return this.find({
    isActive: true,
    isPublic: true,
    'rating.average': { $gte: minRating },
    'rating.count': { $gte: 3 } // At least 3 ratings
  })
    .sort({ 'rating.average': -1, usageCount: -1 })
    .limit(limit)
    .populate('createdBy', 'name email');
};

// Static method to search templates
boardTemplateSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    isPublic: true
  };
  
  if (options.categories && options.categories.length > 0) {
    searchQuery.categories = { $in: options.categories };
  }
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .populate('createdBy', 'name email');
};

// Static method to get template statistics
boardTemplateSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalTemplates: { $sum: 1 },
        activeTemplates: { $sum: { $cond: ['$isActive', 1, 0] } },
        publicTemplates: { $sum: { $cond: ['$isPublic', 1, 0] } },
        totalUsage: { $sum: '$usageCount' },
        avgRating: { $avg: '$rating.average' }
      }
    }
  ]);
  
  return stats[0] || {
    totalTemplates: 0,
    activeTemplates: 0,
    publicTemplates: 0,
    totalUsage: 0,
    avgRating: 0
  };
};

// Pre-save middleware to validate template structure
boardTemplateSchema.pre('save', function(next) {
  // Ensure at least one list exists
  if (!this.defaultLists || this.defaultLists.length === 0) {
    return next(new Error('Template must have at least one default list'));
  }
  
  // Ensure list orders are unique and sequential
  const listOrders = this.defaultLists.map(list => list.order).sort((a, b) => a - b);
  for (let i = 0; i < listOrders.length; i++) {
    if (listOrders[i] !== i) {
      return next(new Error('List orders must be sequential starting from 0'));
    }
  }
  
  // Ensure cards reference valid list IDs
  if (this.defaultCards && this.defaultCards.length > 0) {
    const validListIds = this.defaultLists.map(list => list.title);
    const invalidCards = this.defaultCards.filter(card => !validListIds.includes(card.listId));
    if (invalidCards.length > 0) {
      return next(new Error('All cards must reference valid list titles'));
    }
  }
  
  next();
});

// Auto-populate creator on all find queries
boardTemplateSchema.pre(/^find/, function(next) {
  this.populate('createdBy', 'name email');
  next();
});

module.exports = mongoose.model('BoardTemplate', boardTemplateSchema);
