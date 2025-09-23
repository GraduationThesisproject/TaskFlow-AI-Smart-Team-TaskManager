const mongoose = require('mongoose');
const crypto = require('crypto');

const config = require('../config/env');

const invitationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['workspace', 'space', 'board'],
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    email: {
      type: String,
      required: function() {
        // Email is required for direct invitations, but not for invite links
        return this.metadata?.invitationMethod !== 'link';
      },
      lowercase: true,
      trim: true
    },
    name: String, // Optional, for display purposes
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Will be set if user already exists
    }
  },
  targetEntity: {
    type: {
      type: String,
      enum: ['Workspace', 'Space', 'Board'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String // For display purposes
  },
  role: {
    type: String,
    enum: ['viewer', 'member', 'contributor', 'admin', 'owner'],
    default: 'member'
  },
  permissions: {
    type: Map,
    of: Boolean,
    default: {}
  },
  token: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [500, 'Invitation message cannot exceed 500 characters']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  declinedAt: {
    type: Date,
    default: null
  },
  remindersSent: {
    type: Number,
    default: 0
  },
  lastReminderAt: {
    type: Date,
    default: null
  },
  metadata: {
    inviteUrl: String,
    originalReferrer: String,
    invitationMethod: {
      type: String,
      enum: ['email', 'link', 'bulk', 'api'],
      default: 'email'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
// Token index is created automatically by 'unique: true' in schema
invitationSchema.index({ 'invitedUser.email': 1 });
invitationSchema.index({ 'invitedUser.userId': 1 });
invitationSchema.index({ invitedBy: 1 });
invitationSchema.index({ 'targetEntity.type': 1, 'targetEntity.id': 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ expiresAt: 1 });

// Compound unique index to prevent duplicate invitations
invitationSchema.index(
  { 
    'invitedUser.email': 1, 
    'targetEntity.type': 1, 
    'targetEntity.id': 1, 
    status: 1 
  }, 
  { 
    unique: true, 
    partialFilterExpression: { status: 'pending' }
  }
);

// Pre-save middleware to generate token
invitationSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Virtual for invitation URL
invitationSchema.virtual('inviteUrl').get(function() {
  const baseUrl = process.env.FRONTEND_URL || config.FRONTEND_URL;
  // Use the correct URL format that matches the invitation flow
  return `${baseUrl}/join-workspace?token=${this.token}&workspace=${this.targetEntity.id}`;
});

// Virtual for is expired
invitationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to accept invitation
invitationSchema.methods.accept = function(userId = null) {
  if (this.isExpired) {
    throw new Error('Invitation has expired');
  }
  
  if (this.status !== 'pending') {
    throw new Error('Invitation is no longer pending');
  }
  
  this.status = 'accepted';
  this.acceptedAt = new Date();
  
  if (userId && !this.invitedUser.userId) {
    this.invitedUser.userId = userId;
  }
  
  return this.save();
};

// Method to decline invitation
invitationSchema.methods.decline = function() {
  if (this.status !== 'pending') {
    throw new Error('Invitation is no longer pending');
  }
  
  this.status = 'declined';
  this.declinedAt = new Date();
  
  return this.save();
};

// Method to cancel invitation
invitationSchema.methods.cancel = function() {
  if (this.status === 'accepted') {
    throw new Error('Cannot cancel accepted invitation');
  }
  
  this.status = 'cancelled';
  
  return this.save();
};

// Method to send reminder
invitationSchema.methods.sendReminder = function() {
  if (this.status !== 'pending') {
    throw new Error('Cannot send reminder for non-pending invitation');
  }
  
  if (this.isExpired) {
    throw new Error('Cannot send reminder for expired invitation');
  }
  
  this.remindersSent += 1;
  this.lastReminderAt = new Date();
  
  return this.save();
};

// Method to extend expiration
invitationSchema.methods.extendExpiration = function(days = 7) {
  const newExpiryDate = new Date(this.expiresAt.getTime() + days * 24 * 60 * 60 * 1000);
  this.expiresAt = newExpiryDate;
  
  return this.save();
};

// Static method to find by token
invitationSchema.statics.findByToken = function(token) {
  return this.findOne({ token })
    .populate('invitedBy', 'name avatar')
    .populate('invitedUser.userId', 'name avatar');
};

// Static method to find pending invitations
invitationSchema.statics.findPending = function(email = null) {
  const query = { 
    status: 'pending',
    expiresAt: { $gt: new Date() }
  };
  
  if (email) {
    query['invitedUser.email'] = email;
  }
  
  return this.find(query)
    .populate('invitedBy', 'name avatar')
    .sort({ createdAt: -1 });
};

// Static method to find by entity
invitationSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({
    'targetEntity.type': entityType,
    'targetEntity.id': entityId
  })
  .populate('invitedBy', 'name avatar')
  .populate('invitedUser.userId', 'name avatar')
  .sort({ createdAt: -1 });
};

// Static method to cleanup expired invitations
invitationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { 
      status: 'pending',
      expiresAt: { $lt: new Date() }
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('Invitation', invitationSchema);