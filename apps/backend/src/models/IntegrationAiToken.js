const mongoose = require('mongoose');

const integrationAiTokenSchema = new mongoose.Schema({
  // Token information
  token: {
    type: String,
    required: [true, 'AI token is required'],
    trim: true
  },
  
  // Provider information
  provider: {
    type: String,
    enum: ['google', 'openai', 'anthropic', 'azure'],
    default: 'google',
    required: true
  },
  
  // Token metadata
  name: {
    type: String,
    required: [true, 'Token name is required'],
    trim: true,
    maxlength: [100, 'Token name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Status management
  isActive: {
    type: Boolean,
    default: true
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // Usage tracking
  lastUsedAt: {
    type: Date,
    default: null
  },
  
  usageCount: {
    type: Number,
    default: 0
  },
  
  // Token validation
  isValid: {
    type: Boolean,
    default: true
  },
  
  validationError: {
    type: String,
    default: null
  },
  
  lastValidatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin who created/updated the token
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  
  // Token configuration
  config: {
    model: {
      type: String,
      default: 'gemini-1.5-flash'
    },
    maxTokens: {
      type: Number,
      default: 2000
    },
    temperature: {
      type: Number,
      default: 0.3,
      min: 0,
      max: 2
    },
    timeout: {
      type: Number,
      default: 30000 // 30 seconds
    }
  },
  
  // Metadata
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for masked token (for display purposes)
integrationAiTokenSchema.virtual('maskedToken').get(function() {
  if (!this.token) return '';
  return this.token.substring(0, 8) + '...' + this.token.substring(this.token.length - 4);
});

// Virtual for status display
integrationAiTokenSchema.virtual('status').get(function() {
  if (this.isArchived) return 'archived';
  if (!this.isValid) return 'invalid';
  if (this.isActive) return 'active';
  return 'inactive';
});

// Indexes
integrationAiTokenSchema.index({ provider: 1 });
integrationAiTokenSchema.index({ isActive: 1 });
integrationAiTokenSchema.index({ isArchived: 1 });
integrationAiTokenSchema.index({ createdBy: 1 });
integrationAiTokenSchema.index({ lastUsedAt: 1 });

// Pre-save middleware to ensure only one active token per provider
integrationAiTokenSchema.pre('save', async function(next) {
  // Only run this middleware if isActive is being set to true
  if (this.isModified('isActive') && this.isActive && !this.isArchived) {
    try {
      // Archive all other active tokens for the same provider
      await this.constructor.updateMany(
        { 
          provider: this.provider, 
          _id: { $ne: this._id },
          isArchived: false 
        },
        { 
          isActive: false,
          isArchived: true,
          updatedBy: this.createdBy
        }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get active token for provider
integrationAiTokenSchema.statics.getActiveToken = function(provider = 'google') {
  return this.findOne({ 
    provider, 
    isActive: true, 
    isArchived: false,
    isValid: true 
  });
};

// Static method to get all active tokens
integrationAiTokenSchema.statics.getActiveTokens = function() {
  return this.find({ 
    isActive: true, 
    isArchived: false,
    isValid: true 
  }).sort({ lastUsedAt: -1 });
};

// Static method to archive token
integrationAiTokenSchema.statics.archiveToken = function(tokenId, adminId) {
  return this.findByIdAndUpdate(
    tokenId,
    { 
      isActive: false,
      isArchived: true,
      updatedBy: adminId
    },
    { new: true }
  );
};

// Static method to activate token (will archive others)
integrationAiTokenSchema.statics.activateToken = function(tokenId, adminId) {
  return this.findByIdAndUpdate(
    tokenId,
    { 
      isActive: true,
      isArchived: false,
      updatedBy: adminId
    },
    { new: true }
  );
};

// Instance method to update usage
integrationAiTokenSchema.methods.updateUsage = function() {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  return this.save();
};

// Instance method to validate token
integrationAiTokenSchema.methods.validateToken = async function() {
  // This would typically make a test API call to validate the token
  // For now, we'll just mark it as valid
  this.isValid = true;
  this.validationError = null;
  this.lastValidatedAt = new Date();
  return this.save();
};

// Instance method to mark token as invalid
integrationAiTokenSchema.methods.markInvalid = function(error) {
  this.isValid = false;
  this.validationError = error;
  this.lastValidatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('IntegrationAiToken', integrationAiTokenSchema);
