const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Can be null for admin-only users
    unique: true,
    sparse: true // Allow multiple null values
  },
  // Admin-only user fields (when userId is null)
  userEmail: {
    type: String,
    required: function() {
      return !this.userId; // Required only when userId is null
    },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: function() {
      return !this.userId; // Required only when userId is null
    },
    trim: true,
    maxlength: [100, 'Username cannot exceed 100 characters']
  },
  userPassword: {
    type: String,
    required: function() {
      return !this.userId; // Required only when userId is null
    },
    select: false, // Don't include password in queries by default
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin', 'moderator'],
    default: 'admin',
    required: true
  },
  permissions: {
    manageUsers: {
      type: Boolean,
      default: false
    },
    manageWorkspaces: {
      type: Boolean,
      default: false
    },
    manageTemplates: {
      type: Boolean,
      default: false
    },
    viewAnalytics: {
      type: Boolean,
      default: false
    },
    systemSettings: {
      type: Boolean,
      default: false
    },
    manageAdmins: {
      type: Boolean,
      default: false
    },
    viewSystemLogs: {
      type: Boolean,
      default: false
    },
    manageQuotas: {
      type: Boolean,
      default: false
    },
    manageAIJobs: {
      type: Boolean,
      default: false
    }
  },
  assignedSpaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space'
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
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

// Virtual for admin level
adminSchema.virtual('isSuperAdmin').get(function() {
  return this.role === 'super_admin';
});

// Virtual for effective permissions (super_admin gets all permissions)
adminSchema.virtual('effectivePermissions').get(function() {
  if (this.role === 'super_admin') {
    return {
      manageUsers: true,
      manageWorkspaces: true,
      manageTemplates: true,
      viewAnalytics: true,
      systemSettings: true,
      manageAdmins: true,
      viewSystemLogs: true,
      manageQuotas: true,
      manageAIJobs: true
    };
  }
  return this.permissions;
});

// Indexes for better query performance
adminSchema.index({ userId: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ lastActivity: -1 });

// Method to check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'superadmin') {
    return true;
  }
  return this.permissions[permission] === true;
};

// Method to check if admin has any of the given permissions
adminSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'superadmin') {
    return true;
  }
  return permissions.some(permission => this.permissions[permission] === true);
};

// Method to check if admin has all of the given permissions
adminSchema.methods.hasAllPermissions = function(permissions) {
  if (this.role === 'superadmin') {
    return true;
  }
  return permissions.every(permission => this.permissions[permission] === true);
};

// Method to grant permission
adminSchema.methods.grantPermission = function(permission) {
  if (this.role !== 'superadmin') {
    this.permissions[permission] = true;
  }
  return this.save();
};

// Method to revoke permission
adminSchema.methods.revokePermission = function(permission) {
  if (this.role !== 'superadmin') {
    this.permissions[permission] = false;
  }
  return this.save();
};

// Method to update last activity
adminSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to assign space
adminSchema.methods.assignSpace = function(spaceId) {
  if (!this.assignedSpaces.includes(spaceId)) {
    this.assignedSpaces.push(spaceId);
  }
  return this.save();
};

// Method to unassign space
adminSchema.methods.unassignSpace = function(spaceId) {
  this.assignedSpaces = this.assignedSpaces.filter(
    id => id.toString() !== spaceId.toString()
  );
  return this.save();
};

// Method to get public profile
adminSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    userId: this.userId,
    userEmail: this.userEmail,
    userName: this.userName,
    role: this.role,
    isActive: this.isActive,
    lastActivity: this.lastActivity,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to compare password for admin-only users
adminSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.userPassword) {
    return false;
  }
  
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.userPassword);
  } catch (error) {
    return false;
  }
};

// Static method to find active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('userId', 'name email avatar');
};

// Static method to find superadmins
adminSchema.statics.findSuperAdmins = function() {
  return this.find({ role: 'superadmin', isActive: true }).populate('userId', 'name email avatar');
};

// Static method to find admins by permission
adminSchema.statics.findByPermission = function(permission) {
  return this.find({
    $or: [
      { role: 'superadmin' },
      { [`permissions.${permission}`]: true }
    ],
    isActive: true
  }).populate('userId', 'name email avatar');
};

// Static method to find inactive admins
adminSchema.statics.findInactive = function(daysThreshold = 30) {
  const thresholdDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  return this.find({
    lastActivity: { $lt: thresholdDate },
    isActive: true
  }).populate('userId', 'name email avatar');
};

// Static method to create admin with default permissions
adminSchema.statics.createAdmin = function(userId, role = 'admin', customData = {}) {
  const defaultPermissions = {
    manageUsers: false,
    manageWorkspaces: false,
    manageTemplates: false,
    viewAnalytics: false,
    systemSettings: false,
    manageAdmins: false,
    viewSystemLogs: false,
    manageQuotas: false,
    manageAIJobs: false
  };

  // Superadmin gets all permissions
  if (role === 'superadmin' || role === 'super_admin') {
    Object.keys(defaultPermissions).forEach(key => {
      defaultPermissions[key] = true;
    });
  }

  // Admin gets most permissions except managing other admins
  if (role === 'admin') {
    defaultPermissions.manageUsers = true;
    defaultPermissions.manageWorkspaces = true;
    defaultPermissions.manageTemplates = true;
    defaultPermissions.viewAnalytics = true;
    defaultPermissions.systemSettings = true;
    defaultPermissions.viewSystemLogs = true;
    defaultPermissions.manageQuotas = true;
    defaultPermissions.manageAIJobs = true;
  }

  // Moderator gets limited permissions
  if (role === 'moderator') {
    defaultPermissions.manageUsers = true;
    defaultPermissions.viewAnalytics = true;
    defaultPermissions.viewSystemLogs = true;
  }

  // Create admin object
  const adminData = {
    userId,
    role,
    permissions: { ...defaultPermissions, ...customData.permissions }
  };

  // If userId is null, this is an admin-only user
  if (!userId && customData.userEmail && customData.userName) {
    adminData.userEmail = customData.userEmail;
    adminData.userName = customData.userName;
    adminData.userPassword = customData.userPassword;
  }

  return new this(adminData);
};

// Pre-save middleware to ensure superadmin has all permissions
adminSchema.pre('save', async function(next) {
  // Ensure superadmin has all permissions
  if (this.role === 'superadmin') {
    Object.keys(this.permissions).forEach(key => {
      this.permissions[key] = true;
    });
  }

  // Hash password for admin-only users if it's modified
  if (this.isModified('userPassword') && this.userPassword) {
    try {
      const bcrypt = require('bcryptjs');
      this.userPassword = await bcrypt.hash(this.userPassword, 12);
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Post-save middleware to update user roles if needed
adminSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const UserRoles = mongoose.model('UserRoles');
    
    // Update user's global role
    await User.findByIdAndUpdate(doc.userId, {
      $set: { 'metadata.globalRole': doc.role }
    });
    
    // Ensure user has admin role in UserRoles
    const userRoles = await UserRoles.findOne({ userId: doc.userId });
    if (userRoles) {
      if (!userRoles.globalRoles.includes(doc.role)) {
        userRoles.globalRoles.push(doc.role);
        await userRoles.save();
      }
    }
  } catch (error) {
    console.error('Error updating user roles after admin save:', error);
  }
});

module.exports = mongoose.model('Admin', adminSchema);
