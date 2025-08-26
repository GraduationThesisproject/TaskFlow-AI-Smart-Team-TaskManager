const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Core user information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    validate: {
      validator: function(name) {
        return name && name.length >= 2;
      },
      message: 'Name must be at least 2 characters long'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: function () {
      // Password is required if no OAuth providers are connected
      return !this.hasOAuthProviders;
    },
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
    validate: {
      validator: function(password) {
        if (!password) return true; // Will be caught by required validation
        // If password wasn't modified (e.g., second save after hashing), skip complexity validation
        if (typeof this.isModified === 'function' && !this.isModified('password')) {
          return true;
        }
        // Strong password: at least one letter, one number, one special char, min 8 chars
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
      },
      message: 'Password must contain at least one letter, one number, and one special character'
    }
  },
  avatar: {
    type: String,
    default: null,
    validate: {
      validator: function(avatar) {
        if (!avatar) return true; // null is valid
        if (avatar.startsWith('data:image/')) return true; // data URI is valid
        
        // Check if it's a valid URL
        if (validator.isURL(avatar)) return true;
        
        // Allow localhost URLs for development (common in dev environments)
        if (avatar.includes('localhost') || avatar.includes('127.0.0.1')) return true;
        
        // Allow relative paths (common in production)
        if (avatar.startsWith('/uploads/') || avatar.startsWith('./uploads/')) return true;
        
        return false;
      },
      message: 'Avatar must be a valid URL, data URI, localhost URL, or relative path'
    }
  },
  // Account status and verification
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Security and rate limiting
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  accountLockout: {
    maxAttempts: { type: Number, default: 5 },
    lockTime: { type: Number, default: 2 * 60 * 60 * 1000 }, // 2 hours
    enabled: { type: Boolean, default: true }
  },
  
  // Quick access flags for performance
  hasOAuthProviders: {
    type: Boolean,
    default: false
  },
  hasTwoFactorAuth: {
    type: Boolean,
    default: false
  },
  
  // References to separated models
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPreferences'
  },
  sessions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSessions'
  },
  roles: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserRoles'
  },
  
  // Metadata and audit trail
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  auditLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityLog'
  }],
  
  // Temporary fields for password reset and email verification
  tempTokens: {
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  workspaceId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }],
  // Notification references (keep for backward compatibility)
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function () {
  return `${this.name} (${this.email})`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for display name with fallback
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Virtual for initials (for avatar fallback)
userSchema.virtual('initials').get(function() {
  const names = this.name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return this.name.substring(0, 2).toUpperCase();
});

// Virtual to check if account needs verification
userSchema.virtual('needsVerification').get(function() {
  return !this.emailVerified;
});

// Indexes for better query performance
// Email index is created automatically by 'unique: true' in schema
userSchema.index({ isActive: 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ lastLogin: 1 });
userSchema.index({ lockUntil: 1 });
userSchema.index({ loginAttempts: 1 });
userSchema.index({ hasOAuthProviders: 1 });
userSchema.index({ hasTwoFactorAuth: 1 });

// Text search indexes for faster, ranked search
userSchema.index({ name: 'text', email: 'text' });

// Hash password before saving and handle account lockout
userSchema.pre('save', async function (next) {
  // Hash password if it's modified
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Handle account lockout logic
  if (this.isModified('loginAttempts')) {
    // If account is not locked and login attempts exceed max, lock account
    if (!this.lockUntil && this.loginAttempts >= this.accountLockout.maxAttempts && this.accountLockout.enabled) {
      this.lockUntil = new Date(Date.now() + this.accountLockout.lockTime);
    }
  }
  
  next();
});

// Method to compare password with rate limiting
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Check if account is locked
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  if (!isMatch) {
    // Increment failed login attempts
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    await this.save();
    return false;
  }
  
  // Reset login attempts on successful login
  if (this.loginAttempts > 0) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
  }
  this.lastLogin = new Date();
  await this.save();
  
  return true;
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    isActive: this.isActive,
    emailVerified: this.emailVerified,
    lastLogin: this.lastLogin,
    displayName: this.displayName,
    initials: this.initials,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get minimal profile for performance
userSchema.methods.getMinimalProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    displayName: this.displayName,
    initials: this.initials
  };
};

// Method to unlock account
userSchema.methods.unlockAccount = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  if (this.lockUntil) {
    this.lockUntil = undefined;
  }
  return this.save();
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
  this.tempTokens.emailVerificationToken = token;
  this.tempTokens.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const token = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
  this.tempTokens.passwordResetToken = token;
  this.tempTokens.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Method to verify email
userSchema.methods.verifyEmail = function(token) {
  if (this.tempTokens.emailVerificationToken !== token) {
    throw new Error('Invalid verification token');
  }
  if (this.tempTokens.emailVerificationExpires < new Date()) {
    throw new Error('Verification token has expired');
  }
  
  this.emailVerified = true;
  this.tempTokens.emailVerificationToken = undefined;
  this.tempTokens.emailVerificationExpires = undefined;
  return this.save();
};

// Method to get related models with lazy loading
userSchema.methods.getPreferences = async function() {
  const UserPreferences = mongoose.model('UserPreferences');
  
  // First try to find existing preferences in database
  let prefs = await UserPreferences.findOne({ userId: this._id });
  
  if (!prefs) {
    // Create default preferences if they don't exist
    prefs = new UserPreferences({ userId: this._id });
    await prefs.save();
    
    // Update user reference if not already set
    if (!this.preferences) {
      this.preferences = prefs._id;
      await this.save();
    }
  }
  
  return prefs;
};

userSchema.methods.getSessions = async function() {
  const UserSessions = mongoose.model('UserSessions');
  
  // First try to find existing sessions in database
  let sessions = await UserSessions.findOne({ userId: this._id });
  
  if (!sessions) {
    // Create default sessions if they don't exist
    sessions = new UserSessions({ userId: this._id });
    await sessions.save();
    
    // Update user reference if not already set
    if (!this.sessions) {
      this.sessions = sessions._id;
      await this.save();
    }
  }
  
  return sessions;
};

userSchema.methods.getRoles = async function() {
  const UserRoles = mongoose.model('UserRoles');
  
  // First try to find existing roles
  let roles = await UserRoles.findOne({ userId: this._id });
  
  if (!roles) {
    // Create default roles if they don't exist
    roles = new UserRoles({ userId: this._id });
    await roles.save();
    
    // Update user reference if not already set
    if (!this.roles) {
      this.roles = roles._id;
      await this.save();
    }
  }
  
  return roles;
};

// Backward compatibility methods - delegate to separate models
userSchema.methods.updatePreferences = async function(preferenceSection, updates) {
  const prefs = await this.getPreferences();
  return await prefs.updateSection(preferenceSection, updates);
};

userSchema.methods.updateNestedPreference = async function(section, subsection, updates) {
  const prefs = await this.getPreferences();
  return await prefs.updateNestedSection(section, subsection, updates);
};

userSchema.methods.toggleNotificationCategory = async function(category, enabled) {
  const prefs = await this.getPreferences();
  return await prefs.toggleNotificationCategory(category, enabled);
};

userSchema.methods.connectApp = async function(appData) {
  const prefs = await this.getPreferences();
  return await prefs.connectApp(appData);
};

userSchema.methods.disconnectApp = async function(appName, appType) {
  const prefs = await this.getPreferences();
  return await prefs.disconnectApp(appName, appType);
};

userSchema.methods.shouldReceiveNotification = async function(type, category, method = 'push') {
  const prefs = await this.getPreferences();
  return prefs.shouldReceiveNotification(type, category, method);
};

// Method to add metadata
userSchema.methods.addMetadata = function(key, value) {
  this.metadata.set(key, value);
  return this.save();
};

// Method to remove metadata
userSchema.methods.removeMetadata = function(key) {
  this.metadata.delete(key);
  return this.save();
};

// Method to update avatar
userSchema.methods.updateAvatar = function(avatarUrl) {
  this.avatar = avatarUrl;
  return this.save();
};

// Method to remove avatar
userSchema.methods.removeAvatar = function() {
  this.avatar = null;
  return this.save();
};



// Method to check if user has workspace role - delegate to UserRoles model
userSchema.methods.hasWorkspaceRole = async function(workspaceId, requiredRole = null) {
  const roles = await this.getRoles();
  return roles.hasWorkspaceRole(workspaceId, requiredRole);
};

// Method to get session by device ID - delegate to UserSessions model
userSchema.methods.getSessionByDevice = async function(deviceId) {
  const sessions = await this.getSessions();
  return sessions.getSessionByDevice(deviceId);
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find users by email domain
userSchema.statics.findByEmailDomain = function(domain) {
  return this.find({
    email: new RegExp(`@${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    isActive: true
  });
};

// Static method to find users with locked accounts
userSchema.statics.findLocked = function() {
  return this.find({
    lockUntil: { $gte: new Date() },
    isActive: true
  });
};

// Static method to find unverified users
userSchema.statics.findUnverified = function() {
  return this.find({
    emailVerified: false,
    isActive: true
  });
};

// Static method for efficient user search with basic fields only
userSchema.statics.findMinimal = function(query = {}) {
  return this.find({ ...query, isActive: true })
    .select('name email avatar displayName initials emailVerified lastLogin')
    .lean();
};

// Static method to create user with related models
userSchema.statics.createWithDefaults = async function(userData) {
  // Create the user first
  const user = new this(userData);
  await user.save();
  
  // Create related models with default values
  const UserPreferences = mongoose.model('UserPreferences');
  const UserSessions = mongoose.model('UserSessions');
  const UserRoles = mongoose.model('UserRoles');
  
  const [preferences, sessions, roles] = await Promise.all([
    new UserPreferences({ userId: user._id }).save(),
    new UserSessions({ userId: user._id, sessions: [] }).save(),
    new UserRoles({ userId: user._id }).save()
  ]);
  
  // Update user with references
  user.preferences = preferences._id;
  user.sessions = sessions._id;
  user.roles = roles._id;
  await user.save();
  
  return user;
};

// Static method for bulk operations
userSchema.statics.findWithPreferences = function(query = {}) {
  return this.find({ ...query, isActive: true })
    .populate('preferences', 'theme notifications ai')
    .lean();
};

// Error handling middleware
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    if (error.keyPattern && error.keyPattern.email) {
      next(new Error('Email address is already registered'));
    } else {
      next(new Error('Duplicate key error'));
    }
  } else if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    next(new Error(`Validation failed: ${errors.join(', ')}`));
  } else {
    next(error);
  }
});

// Post-remove middleware to cleanup related models
userSchema.post('remove', async function(doc) {
  try {
    const UserPreferences = mongoose.model('UserPreferences');
    const UserSessions = mongoose.model('UserSessions');
    const UserRoles = mongoose.model('UserRoles');
    
    await Promise.all([
      UserPreferences.deleteOne({ userId: doc._id }),
      UserSessions.deleteOne({ userId: doc._id }),
      UserRoles.deleteOne({ userId: doc._id })
    ]);
  } catch (error) {
    console.error('Error cleaning up related models:', error);
  }
});

module.exports = mongoose.model('User', userSchema);
