const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['communication', 'storage', 'analytics', 'development', 'marketing'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'pending'],
    default: 'pending'
  },
  apiKey: {
    type: String,
    required: false,
    select: false // Don't include in queries by default for security
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastSync: {
    type: Date,
    default: null
  },
  syncStatus: {
    type: String,
    enum: ['success', 'warning', 'error'],
    default: 'error'
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: null
  },
  syncInterval: {
    type: Number, // minutes
    default: 60
  },
  lastError: {
    type: Date,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  webhookUrl: {
    type: String,
    default: null
  },
  webhookSecret: {
    type: String,
    default: null,
    select: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
integrationSchema.index({ category: 1, status: 1 });
integrationSchema.index({ isEnabled: 1 });
integrationSchema.index({ lastSync: 1 });

// Virtual for formatted last sync time
integrationSchema.virtual('lastSyncFormatted').get(function() {
  if (!this.lastSync) return 'Never';
  
  const now = new Date();
  const diffMs = now - this.lastSync;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
});

// Method to update sync status
integrationSchema.methods.updateSyncStatus = function(status, errorMessage = null) {
  this.syncStatus = status;
  this.lastSync = new Date();
  
  if (status === 'error') {
    this.lastError = new Date();
    this.errorMessage = errorMessage;
    this.retryCount = Math.min(this.retryCount + 1, this.maxRetries);
  } else if (status === 'success') {
    this.retryCount = 0;
    this.errorMessage = null;
  }
  
  return this.save();
};

// Method to test connection
integrationSchema.methods.testConnection = async function() {
  try {
    // This will be implemented in the service layer
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Pre-save middleware to encrypt sensitive data
integrationSchema.pre('save', function(next) {
  // TODO: Add encryption for apiKey and webhookSecret
  next();
});

module.exports = mongoose.model('Integration', integrationSchema);
