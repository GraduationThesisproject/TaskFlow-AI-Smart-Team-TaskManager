const mongoose = require('mongoose');

const aiJobSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'task_suggestion',
      'risk_assessment',
      'deadline_prediction',
      'workflow_optimization',
      'team_recommendation',
      'content_generation',
      'code_review',
      'bug_prediction',
      'performance_analysis',
      'custom_analysis'
    ],
    required: [true, 'AI job type is required']
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'succeeded', 'failed', 'cancelled'],
    default: 'queued'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Input data
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Input data is required']
  },
  
  // Output data
  output: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Observability fields
  logs: [{
    at: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['debug', 'info', 'warn', 'error'],
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    meta: {
      type: Object,
      default: {}
    }
  }],
  usage: {
    tokensInput: {
      type: Number,
      default: 0
    },
    tokensOutput: {
      type: Number,
      default: 0
    },
    tokensTotal: {
      type: Number,
      default: 0
    },
    costEstimateUSD: {
      type: Number,
      default: 0
    },
    model: {
      type: String,
      default: 'gpt-4'
    }
  },
  retryCount: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: null
  },
  finishedAt: {
    type: Date,
    default: null
  },
  
  // Error information
  error: {
    message: String,
    code: String,
    stack: String
  },
  
  // Context information
  context: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      default: null
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      default: null
    }
  },
  
  // Processing information
  processingInfo: {
    startedAt: Date,
    completedAt: Date,
    processingTime: Number, // in milliseconds
    modelUsed: String,
    modelVersion: String,
    tokensUsed: Number,
    cost: Number // in cents
  },
  
  // Caching information
  cache: {
    isCached: {
      type: Boolean,
      default: false
    },
    cacheKey: String,
    cacheExpiry: Date,
    cacheHit: {
      type: Boolean,
      default: false
    }
  },
  
  // Retry configuration
  retryConfig: {
    maxRetries: {
      type: Number,
      default: 3
    },
    retryDelay: {
      type: Number,
      default: 5000 // 5 seconds
    },
    backoffMultiplier: {
      type: Number,
      default: 2
    }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Tags for categorization
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

// Virtual for job duration
aiJobSchema.virtual('duration').get(function() {
  if (this.processingInfo.startedAt && this.processingInfo.completedAt) {
    return this.processingInfo.completedAt - this.processingInfo.startedAt;
  }
  return null;
});

// Virtual for is retryable
aiJobSchema.virtual('isRetryable').get(function() {
  return this.status === 'failed' && 
         this.error.retryCount < this.retryConfig.maxRetries;
});

// Virtual for next retry time
aiJobSchema.virtual('nextRetryTime').get(function() {
  if (!this.isRetryable) return null;
  
  const delay = this.retryConfig.retryDelay * 
                Math.pow(this.retryConfig.backoffMultiplier, this.error.retryCount);
  return new Date(Date.now() + delay);
});

// Indexes for better query performance
aiJobSchema.index({ type: 1, status: 1 });
aiJobSchema.index({ 'context.userId': 1, createdAt: -1 });
aiJobSchema.index({ 'context.workspaceId': 1, createdAt: -1 });
aiJobSchema.index({ 'context.projectId': 1, createdAt: -1 });
aiJobSchema.index({ status: 1, priority: 1, createdAt: 1 });
aiJobSchema.index({ 'cache.cacheKey': 1 });
aiJobSchema.index({ 'processingInfo.startedAt': 1 });
aiJobSchema.index({ tags: 1 });

// Method to start processing
aiJobSchema.methods.startProcessing = function(modelInfo = {}) {
  this.status = 'running';
  this.startedAt = new Date();
  this.processingInfo.startedAt = new Date();
  this.processingInfo.modelUsed = modelInfo.model || 'unknown';
  this.processingInfo.modelVersion = modelInfo.version || '1.0';
  return this.save();
};

// Method to complete processing
aiJobSchema.methods.completeProcessing = function(output, processingInfo = {}) {
  this.status = 'succeeded';
  this.output = output;
  this.finishedAt = new Date();
  this.processingInfo.completedAt = new Date();
  this.processingInfo.processingTime = this.processingInfo.completedAt - this.processingInfo.startedAt;
  
  // Update additional processing info
  if (processingInfo.tokensUsed) {
    this.processingInfo.tokensUsed = processingInfo.tokensUsed;
  }
  if (processingInfo.cost) {
    this.processingInfo.cost = processingInfo.cost;
  }
  
  return this.save();
};

// Method to fail processing
aiJobSchema.methods.failProcessing = function(error) {
  this.status = 'failed';
  this.error.message = error.message || 'Unknown error';
  this.error.code = error.code || 'UNKNOWN_ERROR';
  this.error.stack = error.stack;
  this.error.retryCount += 1;
  this.finishedAt = new Date();
  
  if (this.processingInfo.startedAt) {
    this.processingInfo.processingTime = this.processingInfo.completedAt - this.processingInfo.startedAt;
  }
  
  return this.save();
};

// Method to retry job
aiJobSchema.methods.retry = function() {
  if (!this.isRetryable) {
    throw new Error('Job is not retryable');
  }
  
  this.status = 'queued';
  this.error.message = null;
  this.error.code = null;
  this.error.stack = null;
  this.processingInfo.startedAt = null;
  this.processingInfo.completedAt = null;
  this.processingInfo.processingTime = null;
  this.retryCount = 0; // Reset retry count
  
  return this.save();
};

// Method to cancel job
aiJobSchema.methods.cancel = function() {
  if (this.status === 'succeeded' || this.status === 'failed') {
    throw new Error('Cannot cancel succeeded or failed job');
  }
  
  this.status = 'cancelled';
  this.finishedAt = new Date();
  
  if (this.processingInfo.startedAt) {
    this.processingInfo.processingTime = this.processingInfo.completedAt - this.processingInfo.startedAt;
  }
  
  return this.save();
};

// Method to set cache information
aiJobSchema.methods.setCacheInfo = function(cacheKey, expiryMinutes = 60) {
  this.cache.isCached = true;
  this.cache.cacheKey = cacheKey;
  this.cache.cacheExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return this.save();
};

// Method to mark as cache hit
aiJobSchema.methods.markCacheHit = function() {
  this.cache.cacheHit = true;
  this.status = 'succeeded';
  this.finishedAt = new Date();
  return this.save();
};

// Method to add metadata
aiJobSchema.methods.addMetadata = function(key, value) {
  this.metadata.set(key, value);
  return this.save();
};

// Method to add tag
aiJobSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
aiJobSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to find pending jobs
aiJobSchema.statics.findPending = function(limit = 10) {
  return this.find({ status: 'queued' })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit);
};

// Static method to find jobs by type
aiJobSchema.statics.findByType = function(type, status = null) {
  const query = { type };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find jobs by user
aiJobSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ 'context.userId': userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find jobs by workspace
aiJobSchema.statics.findByWorkspace = function(workspaceId, limit = 50) {
  return this.find({ 'context.workspaceId': workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find jobs by project
aiJobSchema.statics.findByProject = function(projectId, limit = 50) {
  return this.find({ 'context.projectId': projectId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find failed jobs
aiJobSchema.statics.findFailed = function(limit = 50) {
  return this.find({ status: 'failed' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find retryable jobs
aiJobSchema.statics.findRetryable = function() {
  return this.find({
    status: 'failed',
    'error.retryCount': { $lt: '$retryConfig.maxRetries' }
  });
};

// Static method to find cached results
aiJobSchema.statics.findCached = function(cacheKey) {
  return this.findOne({
    'cache.cacheKey': cacheKey,
    'cache.cacheExpiry': { $gt: new Date() },
    status: 'succeeded'
  });
};

// Static method to cleanup expired cache
aiJobSchema.statics.cleanupExpiredCache = function() {
  return this.updateMany(
    {
      'cache.cacheExpiry': { $lt: new Date() },
      'cache.isCached': true
    },
    {
      $set: {
        'cache.isCached': false,
        'cache.cacheKey': null,
        'cache.cacheExpiry': null
      }
    }
  );
};

// Static method to get job statistics
aiJobSchema.statics.getStats = async function(userId = null, workspaceId = null) {
  const matchStage = {};
  if (userId) matchStage['context.userId'] = userId;
  if (workspaceId) matchStage['context.workspaceId'] = workspaceId;

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$processingInfo.processingTime' },
        totalCost: { $sum: '$processingInfo.cost' }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      avgProcessingTime: stat.avgProcessingTime,
      totalCost: stat.totalCost
    };
    return acc;
  }, {});
};

// Static method to create job with context
aiJobSchema.statics.createJob = function(type, input, context, options = {}) {
  return new this({
    type,
    input,
    context,
    priority: options.priority || 'normal',
    retryConfig: {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 5000,
      backoffMultiplier: options.backoffMultiplier || 2
    },
    tags: options.tags || []
  });
};

module.exports = mongoose.model('AIJob', aiJobSchema);
