const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Basic admin info
  userName: {
    type: String,
    required: [true, 'Admin username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  
  userEmail: {
    type: String,
    required: [true, 'Admin email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  
  password: {
    type: String,
    required: [true, 'Admin password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'viewer'],
    default: 'admin',
    required: true
  },
  
  permissions: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    allowed: {
      type: Boolean,
      default: true
    }
  }],
  
  // Status and activity
  isActive: {
    type: Boolean,
    default: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // 2FA settings
  hasTwoFactorAuth: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  
  recoveryToken: {
    type: String,
    select: false
  },
  
  // Profile info
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  phoneNumber: {
    type: String,
    trim: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    ref: 'Admin',
    default: null
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.userName;
});

// Virtual for display name
adminSchema.virtual('displayName').get(function() {
  return this.fullName || this.userName;
});

// Indexes
adminSchema.index({ userEmail: 1 });
adminSchema.index({ userName: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ lastActivityAt: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastActivityAt
adminSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

// Instance method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permissionName) {
  if (this.role === 'super_admin') return true;
  
  const permission = this.permissions.find(p => p.name === permissionName);
  return permission ? permission.allowed : false;
};

// Instance method to check if admin has any of the given permissions
adminSchema.methods.hasAnyPermission = function(permissionNames) {
  if (this.role === 'super_admin') return true;
  
  return permissionNames.some(permissionName => this.hasPermission(permissionName));
};

// Instance method to check if admin has all of the given permissions
adminSchema.methods.hasAllPermissions = function(permissionNames) {
  if (this.role === 'super_admin') return true;
  
  return permissionNames.every(permissionName => this.hasPermission(permissionName));
};

// Static method to get admin by email
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ userEmail: email, isActive: true });
};

// Static method to get admin by username
adminSchema.statics.findByUsername = function(username) {
  return this.findOne({ userName: username, isActive: true });
};

// Static method to get all active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get admins by role
adminSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true }).sort({ createdAt: -1 });
};

// Static method to create default permissions for a role
adminSchema.statics.getDefaultPermissions = function(role) {
  const defaultPermissions = {
    super_admin: [
      { name: 'user_management', description: 'Manage all users', allowed: true },
      { name: 'admin_management', description: 'Manage admin users', allowed: true },
      { name: 'system_settings', description: 'Access system settings', allowed: true },
      { name: 'data_export', description: 'Export data', allowed: true },
      { name: 'audit_logs', description: 'View audit logs', allowed: true },
      { name: 'backup_restore', description: 'Backup and restore data', allowed: true }
    ],
    admin: [
      { name: 'user_management', description: 'Manage users', allowed: true },
      { name: 'admin_management', description: 'View admin users', allowed: true },
      { name: 'system_settings', description: 'Access system settings', allowed: true },
      { name: 'data_export', description: 'Export data', allowed: true },
      { name: 'audit_logs', description: 'View audit logs', allowed: true }
    ],
    moderator: [
      { name: 'user_management', description: 'Moderate users', allowed: true },
      { name: 'content_moderation', description: 'Moderate content', allowed: true },
      { name: 'reports', description: 'Handle reports', allowed: true }
    ],
    viewer: [
      { name: 'dashboard_view', description: 'View dashboard', allowed: true },
      { name: 'reports_view', description: 'View reports', allowed: true }
    ]
  };
  
  return defaultPermissions[role] || defaultPermissions.viewer;
};

module.exports = mongoose.model('Admin', adminSchema);
