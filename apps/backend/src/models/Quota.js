const mongoose = require('mongoose');

const quotaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Quota must be associated with a user']
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  
  // Quota type and period
  type: {
    type: String,
    enum: ['api_requests', 'file_uploads', 'ai_jobs', 'storage', 'users', 'spaces'],
    required: [true, 'Quota type is required']
  },
  period: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
    required: [true, 'Quota period is required']
  },
  
  // Usage tracking
  currentUsage: {
    type: Number,
    default: 0,
    min: 0
  },
  limit: {
    type: Number,
    required: [true, 'Quota limit is required'],
    min: 0
  },
  
  // Period tracking
  periodStart: {
    type: Date,
    required: [true, 'Period start date is required']
  },
  periodEnd: {
    type: Date,
    required: [true, 'Period end date is required']
  },
  
  // Usage history for analytics
  usageHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true
    },
    description: String,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // Quota status
  isActive: {
    type: Boolean,
    default: true
  },
  isOverridden: {
    type: Boolean,
    default: false
  },
  
  // Override information
  override: {
    reason: String,
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    overriddenAt: Date,
    expiresAt: Date
  },
  
  // Alert thresholds
  alerts: {
    warningThreshold: {
      type: Number,
      default: 0.8 // 80% of limit
    },
    criticalThreshold: {
      type: Number,
      default: 0.95 // 95% of limit
    },
    warningSent: {
      type: Boolean,
      default: false
    },
    criticalSent: {
      type: Boolean,
      default: false
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

// Virtual for usage percentage
quotaSchema.virtual('usagePercentage').get(function() {
  if (this.limit === 0) return 0;
  return (this.currentUsage / this.limit) * 100;
});

// Virtual for remaining quota
quotaSchema.virtual('remaining').get(function() {
  return Math.max(0, this.limit - this.currentUsage);
});

// Virtual for is exceeded
quotaSchema.virtual('isExceeded').get(function() {
  return this.currentUsage >= this.limit;
});

// Virtual for is near limit
quotaSchema.virtual('isNearLimit').get(function() {
  return this.usagePercentage >= this.alerts.warningThreshold * 100;
});

// Virtual for is critical
quotaSchema.virtual('isCritical').get(function() {
  return this.usagePercentage >= this.alerts.criticalThreshold * 100;
});

// Virtual for is period active
quotaSchema.virtual('isPeriodActive').get(function() {
  const now = new Date();
  return now >= this.periodStart && now <= this.periodEnd;
});

// Virtual for is override active
quotaSchema.virtual('isOverrideActive').get(function() {
  if (!this.isOverridden || !this.override.expiresAt) return false;
  return new Date() <= this.override.expiresAt;
});

// Indexes for better query performance
quotaSchema.index({ userId: 1, type: 1, period: 1 });
quotaSchema.index({ workspaceId: 1, type: 1, period: 1 });
quotaSchema.index({ periodStart: 1, periodEnd: 1 });
quotaSchema.index({ isActive: 1, isExceeded: 1 });
quotaSchema.index({ 'alerts.warningSent': 1, 'alerts.criticalSent': 1 });

// Method to increment usage
quotaSchema.methods.incrementUsage = function(amount = 1, description = null, metadata = {}) {
  if (amount <= 0) {
    throw new Error('Usage increment must be positive');
  }
  
  this.currentUsage += amount;
  
  // Add to usage history
  this.usageHistory.push({
    timestamp: new Date(),
    amount,
    description,
    metadata
  });
  
  // Keep only last 1000 entries for performance
  if (this.usageHistory.length > 1000) {
    this.usageHistory = this.usageHistory.slice(-1000);
  }
  
  return this.save();
};

// Method to decrement usage
quotaSchema.methods.decrementUsage = function(amount = 1, description = null) {
  if (amount <= 0) {
    throw new Error('Usage decrement must be positive');
  }
  
  this.currentUsage = Math.max(0, this.currentUsage - amount);
  
  // Add to usage history
  this.usageHistory.push({
    timestamp: new Date(),
    amount: -amount,
    description,
    metadata: { action: 'decrement' }
  });
  
  return this.save();
};

// Method to reset usage
quotaSchema.methods.resetUsage = function() {
  this.currentUsage = 0;
  this.alerts.warningSent = false;
  this.alerts.criticalSent = false;
  this.usageHistory = [];
  return this.save();
};

// Method to check if usage is allowed
quotaSchema.methods.canUse = function(amount = 1) {
  // If quota is overridden and override is active, allow usage
  if (this.isOverrideActive) {
    return true;
  }
  
  // Check if adding the amount would exceed the limit
  return (this.currentUsage + amount) <= this.limit;
};

// Method to get available quota
quotaSchema.methods.getAvailable = function() {
  if (this.isOverrideActive) {
    return Infinity; // Unlimited when overridden
  }
  return Math.max(0, this.limit - this.currentUsage);
};

// Method to set override
quotaSchema.methods.setOverride = function(adminId, reason, expiresAt = null) {
  this.isOverridden = true;
  this.override.reason = reason;
  this.override.overriddenBy = adminId;
  this.override.overriddenAt = new Date();
  this.override.expiresAt = expiresAt;
  return this.save();
};

// Method to remove override
quotaSchema.methods.removeOverride = function() {
  this.isOverridden = false;
  this.override = {
    reason: null,
    overriddenBy: null,
    overriddenAt: null,
    expiresAt: null
  };
  return this.save();
};

// Method to update period
quotaSchema.methods.updatePeriod = function(startDate, endDate) {
  this.periodStart = startDate;
  this.periodEnd = endDate;
  this.currentUsage = 0;
  this.alerts.warningSent = false;
  this.alerts.criticalSent = false;
  this.usageHistory = [];
  return this.save();
};

// Method to set alert thresholds
quotaSchema.methods.setAlertThresholds = function(warningThreshold, criticalThreshold) {
  if (warningThreshold >= criticalThreshold) {
    throw new Error('Warning threshold must be less than critical threshold');
  }
  
  this.alerts.warningThreshold = warningThreshold;
  this.alerts.criticalThreshold = criticalThreshold;
  return this.save();
};

// Method to mark warning sent
quotaSchema.methods.markWarningSent = function() {
  this.alerts.warningSent = true;
  return this.save();
};

// Method to mark critical sent
quotaSchema.methods.markCriticalSent = function() {
  this.alerts.criticalSent = true;
  return this.save();
};

// Method to get usage statistics
quotaSchema.methods.getUsageStats = function() {
  const stats = {
    totalUsage: this.currentUsage,
    usagePercentage: this.usagePercentage,
    remaining: this.remaining,
    isExceeded: this.isExceeded,
    isNearLimit: this.isNearLimit,
    isCritical: this.isCritical,
    periodStart: this.periodStart,
    periodEnd: this.periodEnd,
    isPeriodActive: this.isPeriodActive
  };
  
  // Calculate daily averages if we have history
  if (this.usageHistory.length > 0) {
    const firstUsage = this.usageHistory[0].timestamp;
    const daysSinceStart = Math.max(1, (new Date() - firstUsage) / (1000 * 60 * 60 * 24));
    stats.dailyAverage = this.currentUsage / daysSinceStart;
  }
  
  return stats;
};

// Static method to find quotas by user
quotaSchema.statics.findByUser = function(userId, type = null) {
  const query = { userId };
  if (type) query.type = type;
  return this.find(query).sort({ type: 1, periodStart: -1 });
};

// Static method to find quotas by workspace
quotaSchema.statics.findByWorkspace = function(workspaceId, type = null) {
  const query = { workspaceId };
  if (type) query.type = type;
  return this.find(query).sort({ type: 1, periodStart: -1 });
};

// Static method to find exceeded quotas
quotaSchema.statics.findExceeded = function() {
  return this.find({
    isActive: true,
    currentUsage: { $gte: '$limit' }
  }).populate('userId', 'name email');
};

// Static method to find quotas near limit
quotaSchema.statics.findNearLimit = function(threshold = 0.8) {
  return this.find({
    isActive: true,
    $expr: {
      $gte: [
        { $divide: ['$currentUsage', '$limit'] },
        threshold
      ]
    }
  }).populate('userId', 'name email');
};

// Static method to find active quotas
quotaSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    periodStart: { $lte: now },
    periodEnd: { $gte: now }
  });
};

// Static method to create quota
quotaSchema.statics.createQuota = function(data) {
  const { userId, workspaceId, type, period, limit, periodStart, periodEnd } = data;
  
  return new this({
    userId,
    workspaceId,
    type,
    period,
    limit,
    periodStart,
    periodEnd,
    currentUsage: 0,
    alerts: {
      warningThreshold: 0.8,
      criticalThreshold: 0.95,
      warningSent: false,
      criticalSent: false
    }
  });
};

// Static method to get quota statistics
quotaSchema.statics.getStats = async function(userId = null, workspaceId = null) {
  const matchStage = {};
  if (userId) matchStage.userId = userId;
  if (workspaceId) matchStage.workspaceId = workspaceId;

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalQuotas: { $sum: 1 },
        totalUsage: { $sum: '$currentUsage' },
        totalLimit: { $sum: '$limit' },
        exceededQuotas: {
          $sum: {
            $cond: [{ $gte: ['$currentUsage', '$limit'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      totalQuotas: stat.totalQuotas,
      totalUsage: stat.totalUsage,
      totalLimit: stat.totalLimit,
      exceededQuotas: stat.exceededQuotas,
      usagePercentage: stat.totalLimit > 0 ? (stat.totalUsage / stat.totalLimit) * 100 : 0
    };
    return acc;
  }, {});
};

// Pre-save middleware to validate period dates
quotaSchema.pre('save', function(next) {
  if (this.periodStart >= this.periodEnd) {
    return next(new Error('Period start must be before period end'));
  }
  
  if (this.currentUsage < 0) {
    this.currentUsage = 0;
  }
  
  next();
});

module.exports = mongoose.model('Quota', quotaSchema);
