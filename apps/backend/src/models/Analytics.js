const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Modular analytics structure
  scopeType: {
    type: String,
    enum: ['workspace', 'space', 'board', 'user'],
    required: [true, 'Analytics scope type is required']
  },
  scopeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Scope ID is required']
  },
  kind: {
    type: String,
    enum: ['velocity', 'wip', 'leadTime', 'cycleTime', 'burndown', 'custom'],
    required: [true, 'Analytics kind is required']
  },
  data: {
    type: Object,
    required: [true, 'Analytics data is required']
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      default: 'weekly'
    }
  },
  
  // Legacy fields for backward compatibility
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    default: null
  },
  taskMetrics: {
    total: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    overdue: {
      type: Number,
      default: 0
    },
    blocked: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageCompletionTime: {
      type: Number, // in hours
      default: 0
    },
    velocity: {
      type: Number, // tasks completed per period
      default: 0
    }
  },
  timeMetrics: {
    totalEstimated: {
      type: Number, // in hours
      default: 0
    },
    totalActual: {
      type: Number, // in hours
      default: 0
    },
    averageAccuracy: {
      type: Number, // percentage
      default: 0,
      min: 0,
      max: 100
    },
    totalOvertime: {
      type: Number, // in hours
      default: 0
    }
  },
  teamMetrics: {
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    memberProductivity: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      tasksCompleted: {
        type: Number,
        default: 0
      },
      totalHours: {
        type: Number,
        default: 0
      },
      averageTaskTime: {
        type: Number, // in hours
        default: 0
      },
      onTimeCompletion: {
        type: Number, // percentage
        default: 0
      }
    }],
    topPerformers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      score: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: 0
      }
    }]
  },
  qualityMetrics: {
    totalBugs: {
      type: Number,
      default: 0
    },
    resolvedBugs: {
      type: Number,
      default: 0
    },
    bugResolutionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageBugResolutionTime: {
      type: Number, // in hours
      default: 0
    },
    customerSatisfaction: {
      type: Number, // rating 1-5
      default: 1,
      min: 1,
      max: 5
    }
  },
  // Generic data payload for exports and ad-hoc analytics
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiInsights: {
    predictedCompletionDate: {
      type: Date,
      default: null
    },
    riskFactors: [{
      factor: {
        type: String,
        enum: ['team_overload', 'resource_shortage', 'scope_creep', 'technical_debt', 'communication_issues'],
        required: true
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
      },
      description: String,
      suggestedActions: [String]
    }],
    optimizationSuggestions: [{
      area: {
        type: String,
        enum: ['workflow', 'resource_allocation', 'communication', 'process', 'technology'],
        required: true
      },
      suggestion: String,
      expectedImpact: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
      },
      implementationEffort: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
      }
    }],
    trendAnalysis: {
      completionTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
        default: 'stable'
      },
      velocityTrend: {
        type: String,
        enum: ['increasing', 'stable', 'decreasing'],
        default: 'stable'
      },
      qualityTrend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
        default: 'stable'
      }
    }
  },
  
  // Enhanced trend tracking for AI analysis
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  trendStrength: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  trendConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  customMetrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isCalculated: {
    type: Boolean,
    default: false
  },
  calculationDuration: {
    type: Number, // in milliseconds
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for period duration
analyticsSchema.virtual('periodDuration').get(function() {
  const start = new Date(this.period.startDate);
  const end = new Date(this.period.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

    // Virtual for overall space health
    analyticsSchema.virtual('spaceHealth').get(function() {
  const completionRate = this.taskMetrics.completionRate;
  const onTimeRate = this.teamMetrics.memberProductivity.reduce((acc, member) => 
    acc + member.onTimeCompletion, 0) / Math.max(this.teamMetrics.memberProductivity.length, 1);
  const qualityScore = this.qualityMetrics.bugResolutionRate;
  
  const healthScore = (completionRate * 0.4) + (onTimeRate * 0.3) + (qualityScore * 0.3);
  
  if (healthScore >= 80) return 'excellent';
  if (healthScore >= 60) return 'good';
  if (healthScore >= 40) return 'fair';
  return 'poor';
});

// Virtual for trend indicators
analyticsSchema.virtual('trendIndicators').get(function() {
  const indicators = [];
  
  if (this.taskMetrics.completionRate > 80) indicators.push('high_completion');
  if (this.taskMetrics.overdue > 0) indicators.push('overdue_tasks');
  if (this.timeMetrics.totalOvertime > 0) indicators.push('overtime_work');
  if (this.qualityMetrics.bugResolutionRate < 90) indicators.push('quality_concerns');
  
  return indicators;
});

// Indexes for better query performance
analyticsSchema.index({ scopeType: 1, scopeId: 1, kind: 1 });
analyticsSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
analyticsSchema.index({ 'period.type': 1 });
analyticsSchema.index({ lastUpdated: -1 });
analyticsSchema.index({ isCalculated: 1 });

// Method to calculate completion rate
analyticsSchema.methods.calculateCompletionRate = function() {
  if (this.taskMetrics.total > 0) {
    this.taskMetrics.completionRate = Math.round((this.taskMetrics.completed / this.taskMetrics.total) * 100);
  }
  return this.save();
};

// Method to calculate average completion time
analyticsSchema.methods.calculateAverageCompletionTime = function() {
  // This would need to be implemented based on actual task completion data
  // For now, we'll keep the default value
  return this.save();
};

// Method to calculate velocity
analyticsSchema.methods.calculateVelocity = function() {
  const periodDays = this.periodDuration;
  if (periodDays > 0) {
    this.taskMetrics.velocity = this.taskMetrics.completed / periodDays;
  }
  return this.save();
};

// Method to calculate time accuracy
analyticsSchema.methods.calculateTimeAccuracy = function() {
  if (this.timeMetrics.totalEstimated > 0) {
    const accuracy = ((this.timeMetrics.totalEstimated - this.timeMetrics.totalActual) / this.timeMetrics.totalEstimated) * 100;
    this.timeMetrics.averageAccuracy = Math.abs(Math.round(accuracy));
  }
  return this.save();
};

// Method to update member productivity
analyticsSchema.methods.updateMemberProductivity = function(userId, metrics) {
  const existingMember = this.teamMetrics.memberProductivity.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    Object.assign(existingMember, metrics);
  } else {
    this.teamMetrics.memberProductivity.push({
      user: userId,
      ...metrics
    });
  }
  
  return this.save();
};

// Method to calculate top performers
analyticsSchema.methods.calculateTopPerformers = function() {
  const members = this.teamMetrics.memberProductivity
    .map(member => ({
      user: member.user,
      score: (member.tasksCompleted * 0.4) + (member.onTimeCompletion * 0.3) + (member.averageTaskTime * 0.3)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  this.teamMetrics.topPerformers = members.map((member, index) => ({
    user: member.user,
    score: member.score,
    rank: index + 1
  }));
  
  return this.save();
};

// Method to add custom metric
analyticsSchema.methods.addCustomMetric = function(key, value) {
  this.customMetrics.set(key, value);
  return this.save();
};

// Method to remove custom metric
analyticsSchema.methods.removeCustomMetric = function(key) {
  this.customMetrics.delete(key);
  return this.save();
};

// Method to mark as calculated
analyticsSchema.methods.markAsCalculated = function(duration) {
  this.isCalculated = true;
  this.lastUpdated = new Date();
  this.calculationDuration = duration || 0;
  return this.save();
};

// Static method to find analytics by scope and reference
analyticsSchema.statics.findByScope = function(scopeType, scopeId, kind = null) {
  const query = { scopeType, scopeId };
  if (kind) {
    query.kind = kind;
  }
  return this.find(query).sort({ 'period.startDate': -1 });
};

// Static method to create analytics for scope
analyticsSchema.statics.createForScope = function(scopeType, scopeId, kind, startDate, endDate) {
  return new this({
    scopeType,
    scopeId,
    kind,
    period: {
      startDate,
      endDate
    }
  });
};

module.exports = mongoose.model('Analytics', analyticsSchema);
