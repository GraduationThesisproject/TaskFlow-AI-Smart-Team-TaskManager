const mongoose = require('mongoose');
const UserRoles = require('./UserRoles');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [200, 'Workspace name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Workspace owner is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      canCreateSpaces: { type: Boolean, default: true },
      canManageMembers: { type: Boolean, default: false },
      canEditSettings: { type: Boolean, default: false },
      canDeleteWorkspace: { type: Boolean, default: false }
    }
  }],
  spaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space'
  }],
  inviteTokens: [{
    token: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  settings: {
    permissions: {
      defaultMemberRole: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member'
      },
      allowMemberInvites: { type: Boolean, default: true },
      requireApprovalForMembers: { type: Boolean, default: false },
      maxMembers: { type: Number, default: null, min: 1 },
      publicJoin: { type: Boolean, default: false },
      // Board creation/deletion settings (legacy booleans kept for compatibility)
      allowMemberBoardCreation: { type: Boolean, default: true },
      allowMemberBoardDeletion: { type: Boolean, default: true },
      // New granular policies
      boardCreationPolicy: { type: String, enum: ['everyone', 'admins'], default: 'everyone' },
      boardDeletionPolicy: { type: String, enum: ['everyone', 'admins'], default: 'everyone' }
    },
    defaultBoardVisibility: {
      type: String,
      enum: ['private', 'workspace', 'public'],
      default: 'workspace'
    },
    features: {
      aiSuggestions: { type: Boolean, default: true },
      timeTracking: { type: Boolean, default: true },
      fileAttachments: { type: Boolean, default: true },
      customFields: { type: Boolean, default: true },
      integrations: { type: Boolean, default: true }
    },
    branding: {
      logo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
      },
      primaryColor: {
        type: String,
        default: '#3B82F6',
        match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
      },
      customDomain: String
    },
    notifications: {
      emailDigests: { type: Boolean, default: true },
      slackIntegration: { type: Boolean, default: false },
      webhooks: [{
        name: String,
        url: String,
        events: [String],
        active: { type: Boolean, default: true }
      }]
    }
  },
  githubOrg: {
    id: { type: Number, default: null },
    login: { type: String, default: null },
    name: { type: String, default: null },
    url: { type: String, default: null },
    avatar: { type: String, default: null },
    description: { type: String, default: null },
    isPrivate: { type: Boolean, default: null },
    linkedAt: { type: Date, default: null }
  },
  invitations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation'
  }],
  activityLog: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityLog'
  }],
  // Visibility: when true, all users can see this workspace (read-only unless they join/invited)
  isPublic: {
    type: Boolean,
    default: false
  },
  // Backward-compat: keep isActive but derive from status
  isActive: {
    type: Boolean,
    default: true
  },
  // New unified status for soft-delete and lifecycle
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  archivedAt: { type: Date, default: null },
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // When archived, the time after which the workspace may be auto-purged
  archiveExpiresAt: { type: Date, default: null },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  billing: {
    subscriptionId: String,
    nextBillingDate: Date,
    status: {
      type: String,
      enum: ['active', 'past_due', 'cancelled', 'trial'],
      default: 'trial'
    }
  },
  usage: {
    membersCount: { type: Number, default: 1 },
    spacesCount: { type: Number, default: 0 },
    boardsCount: { type: Number, default: 0 },
    tasksCount: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // in MB
    apiCalls: { type: Number, default: 0 }
  },
  limits: {
    maxMembers: { type: Number, default: 10 },
    maxSpaces: { type: Number, default: 5 },
    maxBoards: { type: Number, default: 50 },
    maxStorage: { type: Number, default: 1000 }, // in MB
    maxApiCalls: { type: Number, default: 10000 }
  },
  // Workspace rules
  rules: {
    content: {
      type: String,
      default: '',
      maxlength: 10000 // Limit content size
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    version: {
      type: Number,
      default: 1
    },
    fileReference: {
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      path: String,
      uploadedAt: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for workspace statistics
workspaceSchema.virtual('stats').get(function() {
  return {
    totalMembers: this.members ? this.members.length : 0,
    activeMembers: this.members ? this.members.filter(member => member.role === 'member' || member.role === 'admin').length : 0,
    totalSpaces: this.spaces ? this.spaces.length : 0,
    isOverLimit: this.usage && this.usage.membersCount > this.limits.maxMembers
  };
});

// Virtual for workspace health
workspaceSchema.virtual('health').get(function() {
  const memberRatio = this.usage.membersCount / this.limits.maxMembers;
  const spaceRatio = this.usage.spacesCount / this.limits.maxSpaces;
  const storageRatio = this.usage.storageUsed / this.limits.maxStorage;
  
  const avgUsage = (memberRatio + spaceRatio + storageRatio) / 3;
  
  if (avgUsage < 0.5) return 'healthy';
  if (avgUsage < 0.8) return 'warning';
  return 'critical';
});

// Virtual for available features
workspaceSchema.virtual('availableFeatures').get(function() {
  const planFeatures = {
    free: ['basic_boards', 'basic_tasks'],
    basic: ['basic_boards', 'basic_tasks', 'time_tracking', 'file_attachments'],
    premium: ['advanced_boards', 'advanced_tasks', 'time_tracking', 'file_attachments', 'ai_suggestions', 'custom_fields'],
    enterprise: ['all_features', 'api_access', 'sso', 'custom_branding', 'advanced_security']
  };
  
  return planFeatures[this.plan] || planFeatures.free;
});

// Virtual for formatted rules content
workspaceSchema.virtual('rulesFormattedContent').get(function() {
  if (!this.rules || !this.rules.content) return '';
  
  // Convert markdown-like formatting to HTML
  return this.rules.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n/g, '<br>');
});

// Virtual: seconds remaining until archive expiration (null if not archived or no expiry)
workspaceSchema.virtual('archiveCountdownSeconds').get(function () {
  if (!this.archiveExpiresAt) return null;
  const remainingMs = this.archiveExpiresAt.getTime() - Date.now();
  return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
});

// Indexes for better query performance
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ isActive: 1 });
workspaceSchema.index({ status: 1 });
workspaceSchema.index({ isPublic: 1 });
workspaceSchema.index({ plan: 1 });
workspaceSchema.index({ 'billing.status': 1 });

// Method to add member
workspaceSchema.methods.addMember = function(userId, role = 'member', invitedBy = null) {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    existingMember.role = role;
    existingMember.invitedBy = invitedBy;
    existingMember.joinedAt = new Date();
  } else {
    if (this.usage.membersCount >= this.limits.maxMembers) {
      throw new Error('Workspace member limit reached');
    }
    
    this.members.push({ user: userId, role, invitedBy });
    this.usage.membersCount = this.members.length;
  }
  
  return this.save();
};

// Method to remove member
workspaceSchema.methods.removeMember = function(userId) {
  if (this.owner.toString() === userId.toString()) {
    throw new Error('Cannot remove workspace owner');
  }
  
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  this.usage.membersCount = this.members.length;
  
  return this.save();
};

// Method to update member role
workspaceSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.role = newRole;
  
  // Update permissions based on role
  if (newRole === 'admin') {
    member.permissions = {
      canCreateSpaces: true,
      canManageMembers: true,
      canEditSettings: true,
      canDeleteWorkspace: false
    };
  } else {
    member.permissions = {
      canCreateSpaces: true,
      canManageMembers: false,
      canEditSettings: false,
      canDeleteWorkspace: false
    };
  }
  
  return this.save();
};

// Method to add space
workspaceSchema.methods.addSpace = function(spaceId) {
  if (this.usage.spacesCount >= this.limits.maxSpaces) {
    throw new Error('Workspace space limit reached');
  }
  
  if (!this.spaces.includes(spaceId)) {
    this.spaces.push(spaceId);
    this.usage.spacesCount = this.spaces.length;
  }
  
  return this.save();
};

// Method to remove space
workspaceSchema.methods.removeSpace = function(spaceId) {
  this.spaces = this.spaces.filter(space => 
    space.toString() !== spaceId.toString()
  );
  this.usage.spacesCount = this.spaces.length;
  
  return this.save();
};

// Method to check user permission
workspaceSchema.methods.hasPermission = function(userId, permission) {
  if (this.owner.toString() === userId.toString()) {
    return true; // Owner has all permissions
  }
  
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;
  
  if (member.role === 'admin') return true; // Admin has all permissions except delete
  
  return member.permissions[permission] || false;
};

// Method to update settings
workspaceSchema.methods.updateSettings = function(settingSection, updates) {
  if (this.settings[settingSection]) {
    Object.assign(this.settings[settingSection], updates);
  }
  return this.save();
};

// Method to update usage statistics
workspaceSchema.methods.updateUsage = function(metric, value) {
  if (this.usage[metric] !== undefined) {
    this.usage[metric] = value;
  }
  return this.save();
};

// Method to check if feature is available
workspaceSchema.methods.hasFeature = function(feature) {
  return this.availableFeatures.includes(feature) || this.availableFeatures.includes('all_features');
};

// Method to update workspace rules
workspaceSchema.methods.updateRules = function(content, userId) {
  this.rules = this.rules || {};
  this.rules.content = content;
  this.rules.lastUpdatedBy = userId;
  this.rules.version = (this.rules.version || 0) + 1;
  return this.save();
};

// Method to upload rules file
workspaceSchema.methods.uploadRulesFile = function(file, userId) {
  this.rules = this.rules || {};
  this.rules.content = `# Workspace Rules\n\nRules document uploaded as PDF file.\n\nFile: ${file.originalname}\nUploaded: ${new Date().toISOString()}`;
  this.rules.lastUpdatedBy = userId;
  this.rules.version = (this.rules.version || 0) + 1;
  this.rules.fileReference = {
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    uploadedAt: new Date()
  };
  return this.save();
};

// Method to delete workspace rules
workspaceSchema.methods.deleteRules = function() {
  this.rules = {
    content: '',
    lastUpdatedBy: null,
    version: 1,
    fileReference: null
  };
  return this.save();
};

// Method to get or create default rules
workspaceSchema.methods.getOrCreateRules = function(userId) {
  console.log('getOrCreateRules called:', {
    workspaceId: this._id,
    hasRules: !!this.rules,
    hasContent: !!this.rules?.content,
    contentLength: this.rules?.content?.length || 0,
    contentValue: this.rules?.content
  });
  
  // If rules don't exist or content is empty, create default rules
  if (!this.rules || !this.rules.content || this.rules.content.trim() === '') {
    const defaultContent = `# Workspace Rules

Welcome to **${this.name}**! Please follow these guidelines to ensure a productive and respectful environment.

## General Guidelines
- Be respectful and professional in all communications
- Use clear and concise language
- Keep discussions relevant to the workspace goals

## Task Management
- Update task status regularly
- Provide clear descriptions and requirements
- Use appropriate priority levels

## Collaboration
- Share knowledge and help team members
- Provide constructive feedback
- Respect different perspectives and working styles

## Communication
- Use appropriate channels for different types of communication
- Respond to messages in a timely manner
- Keep sensitive information confidential

*These rules can be updated by workspace admins and owners.*`;

    this.rules = {
      content: defaultContent,
      lastUpdatedBy: userId,
      version: 1,
      fileReference: null
    };
    console.log('Creating default rules for workspace:', this._id);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to update logo
workspaceSchema.methods.updateLogo = function(fileId) {
  this.settings.branding.logo = fileId;
  return this.save();
};

// Method to remove logo
workspaceSchema.methods.removeLogo = function() {
  this.settings.branding.logo = null;
  return this.save();
};

// Method to transfer ownership (also syncs UserRoles)
workspaceSchema.methods.transferOwnership = async function(newOwnerId) {
  const newOwner = this.members.find(m => m.user.toString() === newOwnerId.toString());
  if (!newOwner) {
    throw new Error('New owner must be a member of the workspace');
  }

  const oldOwnerId = this.owner;

  // Add current owner as admin member (if not already)
  const alreadyAdmin = this.members.some(m => m.user.toString() === oldOwnerId.toString() && m.role === 'admin');
  if (!alreadyAdmin) {
    this.members.push({
      user: oldOwnerId,
      role: 'admin',
      joinedAt: new Date()
    });
  }

  // Remove new owner from members and set as owner
  this.members = this.members.filter(m => m.user.toString() !== newOwnerId.toString());
  this.owner = newOwnerId;

  // Persist workspace changes first
  await this.save();

  // Sync UserRoles: old owner -> admin, new owner -> owner
  await UserRoles.updateOne(
    { userId: oldOwnerId, 'workspaces.workspace': this._id },
    { $set: { 'workspaces.$.role': 'admin' } },
    { upsert: false }
  );

  // Ensure document exists for old owner; if none with this workspace, push admin
  await UserRoles.updateOne(
    { userId: oldOwnerId, 'workspaces.workspace': { $ne: this._id } },
    { $push: { workspaces: { workspace: this._id, role: 'admin', permissions: {} } } },
    { upsert: true }
  );

  // New owner set to owner
  await UserRoles.updateOne(
    { userId: newOwnerId, 'workspaces.workspace': this._id },
    { $set: { 'workspaces.$.role': 'owner' } },
    { upsert: false }
  );
  await UserRoles.updateOne(
    { userId: newOwnerId, 'workspaces.workspace': { $ne: this._id } },
    { $push: { workspaces: { workspace: this._id, role: 'owner', permissions: {} } } },
    { upsert: true }
  );

  return this;
};

// Static method to find workspaces by user
workspaceSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isActive: true
  });
};

// Static method to find workspaces by plan
workspaceSchema.statics.findByPlan = function(plan) {
  return this.find({ plan, isActive: true });
};

// Static method to find workspaces needing upgrade
workspaceSchema.statics.findNeedingUpgrade = function() {
  return this.find({
    $or: [
      { 'usage.membersCount': { $gte: { $ref: 'limits.maxMembers' } } },
      { 'usage.spacesCount': { $gte: { $ref: 'limits.maxSpaces' } } },
      { 'usage.storageUsed': { $gte: { $ref: 'limits.maxStorage' } } }
    ],
    isActive: true
  });
};

// Static method to find workspaces by billing status
workspaceSchema.statics.findByBillingStatus = function(status) {
  return this.find({ 'billing.status': status, isActive: true });
};

// Pre-save middleware to update member count
workspaceSchema.pre('save', function(next) {
  // Sync isActive with status for backward compatibility
  if (this.status === 'archived') {
    this.isActive = false;
  } else if (this.status === 'active') {
    this.isActive = true;
  }
  this.usage.membersCount = this.members.length + 1; // +1 for owner
  next();
});

// Post-save hook: ensure owner has an 'owner' role in UserRoles for this workspace
workspaceSchema.post('save', async function(doc) {
  try {
    // Set or add owner role for current owner
    const updated = await UserRoles.updateOne(
      { userId: doc.owner, 'workspaces.workspace': doc._id },
      { $set: { 'workspaces.$.role': 'owner' } }
    );

    // If no matching workspace entry was updated, push a new one
    if (updated.modifiedCount === 0 && updated.matchedCount === 0) {
      await UserRoles.updateOne(
        { userId: doc.owner },
        { $push: { workspaces: { workspace: doc._id, role: 'owner', permissions: {} } } },
        { upsert: true }
      );
    }
  } catch (e) {
    // Do not block the save on role sync errors; log if logger available
    // console.error('Workspace post-save role sync error', e);
  }
});

// Ensure virtuals are serialized
workspaceSchema.set('toJSON', { virtuals: true });
workspaceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
