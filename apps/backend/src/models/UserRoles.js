const mongoose = require('mongoose');

const userRolesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  systemRole: {
    type: String,
    enum: ['super_admin', 'admin', 'user'],
    default: 'user'
  },
  workspaces: [{
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      required: true
    },
    permissions: {
      canCreateSpaces: { type: Boolean, default: true },
      canManageMembers: { type: Boolean, default: false },
      canManageBilling: { type: Boolean, default: false },
      canDeleteWorkspace: { type: Boolean, default: false },
      canEditSettings: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  spaces: [{
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'contributor', 'member', 'viewer'],
      required: true
    },
    permissions: {
      canViewBoards: { type: Boolean, default: true },
      canCreateBoards: { type: Boolean, default: true },
      canEditBoards: { type: Boolean, default: false },
      canDeleteBoards: { type: Boolean, default: false },
      canCreateTasks: { type: Boolean, default: true },
      canEditTasks: { type: Boolean, default: true },
      canDeleteTasks: { type: Boolean, default: false },
      canManageMembers: { type: Boolean, default: false },
      canEditSettings: { type: Boolean, default: false },
      canDeleteSpace: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  boards: [{
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      required: true
    },
    permissions: {
      canView: { type: Boolean, default: true },
      canEdit: { type: Boolean, default: false },
      canCreateTasks: { type: Boolean, default: true },
      canEditTasks: { type: Boolean, default: true },
      canDeleteTasks: { type: Boolean, default: false },
      canManageColumns: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
// userId index is created automatically by 'unique: true' in schema
userRolesSchema.index({ 'workspaces.workspace': 1 });
userRolesSchema.index({ 'spaces.space': 1 });
userRolesSchema.index({ 'boards.board': 1 });

// Method to check workspace role
userRolesSchema.methods.hasWorkspaceRole = function(workspaceId, requiredRole = null) {
  const workspaceRole = this.workspaces.find(ws => 
    ws.workspace.toString() === workspaceId.toString()
  );
  
  if (!workspaceRole) return false;
  if (!requiredRole) return true;
  
  const roleHierarchy = ['member', 'admin', 'owner'];
  const userRoleIndex = roleHierarchy.indexOf(workspaceRole.role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  
  return userRoleIndex >= requiredRoleIndex? workspaceRole : null;
};

// Method to check space permission
userRolesSchema.methods.hasSpacePermission = function(spaceId, permission) {
  const spaceRole = this.spaces.find(space => 
    space.space.toString() === spaceId.toString()
  );
  
  if (!spaceRole) return false;
  
  return spaceRole.permissions[permission] || false;
};

// Method to check board permission
userRolesSchema.methods.hasBoardPermission = function(boardId, permission) {
  const boardRole = this.boards.find(board => 
    board.board.toString() === boardId.toString()
  );
  
  if (!boardRole) return false;
  
  return boardRole.permissions[permission] || false;
};

// Method to add workspace role
userRolesSchema.methods.addWorkspaceRole = function(workspaceId, role, permissions = {}) {
  const existingRole = this.workspaces.find(ws => 
    ws.workspace.toString() === workspaceId.toString()
  );
  
  if (existingRole) {
    existingRole.role = role;
    Object.assign(existingRole.permissions, permissions);
  } else {
    this.workspaces.push({
      workspace: workspaceId,
      role,
      permissions: {
        ...this.getDefaultWorkspacePermissions(role),
        ...permissions
      }
    });
  }
  
  return this.save();
};

// Method to remove workspace role
userRolesSchema.methods.removeWorkspaceRole = function(workspaceId) {
  this.workspaces = this.workspaces.filter(ws => 
    ws.workspace.toString() !== workspaceId.toString()
  );
  return this.save();
};

// Method to get default workspace permissions
userRolesSchema.methods.getDefaultWorkspacePermissions = function(role) {
  const defaultPermissions = {
    member: {
      canCreateSpaces: true,
      canManageMembers: false,
      canManageBilling: false,
      canDeleteWorkspace: false,
      canEditSettings: false
    },
    admin: {
      canCreateSpaces: true,
      canManageMembers: true,
      canManageBilling: false,
      canDeleteWorkspace: false,
      canEditSettings: true
    },
    owner: {
      canCreateSpaces: true,
      canManageMembers: true,
      canManageBilling: true,
      canDeleteWorkspace: true,
      canEditSettings: true
    }
  };
  
  return defaultPermissions[role] || defaultPermissions.member;
};

// Method to add space role
userRolesSchema.methods.addSpaceRole = function(spaceId, role, permissions = {}) {
  const existingRole = this.spaces.find(space => 
    space.space.toString() === spaceId.toString()
  );
  
  if (existingRole) {
    existingRole.role = role;
    Object.assign(existingRole.permissions, permissions);
  } else {
    this.spaces.push({
      space: spaceId,
      role,
      permissions: {
        ...this.getDefaultSpacePermissions(role),
        ...permissions
      }
    });
  }
  
  return this.save();
};

// Method to remove space role
userRolesSchema.methods.removeSpaceRole = function(spaceId) {
  this.spaces = this.spaces.filter(space => 
    space.space.toString() !== spaceId.toString()
  );
  return this.save();
};

// Method to get default space permissions
userRolesSchema.methods.getDefaultSpacePermissions = function(role) {
  const defaultPermissions = {
    owner: {
      canViewBoards: true,
      canCreateBoards: true,
      canEditBoards: true,
      canDeleteBoards: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageMembers: true,
      canEditSettings: true,
      canDeleteSpace: false
    },
    admin: {
      canViewBoards: true,
      canCreateBoards: true,
      canEditBoards: true,
      canDeleteBoards: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageMembers: true,
      canEditSettings: true,
      canDeleteSpace: false
    },
    contributor: {
      canViewBoards: true,
      canCreateBoards: true,
      canEditBoards: true,
      canDeleteBoards: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageMembers: true,
      canEditSettings: true,
      canDeleteSpace: false
    },
    member: {
      canViewBoards: true,
      canCreateBoards: true,
      canEditBoards: true,
      canDeleteBoards: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageMembers: true,
      canEditSettings: true,
      canDeleteSpace: false
    },
    viewer: {
      canViewBoards: true,
      canCreateBoards: false,
      canEditBoards: false,
      canDeleteBoards: false,
      canCreateTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canManageMembers: false,
      canEditSettings: false,
      canDeleteSpace: false
    }
  };
  
  return defaultPermissions[role] || defaultPermissions.member;
};

// Method to add board role
userRolesSchema.methods.addBoardRole = function(boardId, role, permissions = {}) {
  const existingRole = this.boards.find(board => 
    board.board.toString() === boardId.toString()
  );
  
  if (existingRole) {
    existingRole.role = role;
    Object.assign(existingRole.permissions, permissions);
  } else {
    this.boards.push({
      board: boardId,
      role,
      permissions: {
        ...this.getDefaultBoardPermissions(role),
        ...permissions
      }
    });
  }
  
  return this.save();
};

// Method to remove board role
userRolesSchema.methods.removeBoardRole = function(boardId) {
  this.boards = this.boards.filter(board => 
    board.board.toString() !== boardId.toString()
  );
  return this.save();
};

// Method to get default board permissions
userRolesSchema.methods.getDefaultBoardPermissions = function(role) {
  const defaultPermissions = {
    viewer: {
      canView: true,
      canEdit: false,
      canCreateTasks: false,
      canEditTasks: false,
      canDeleteTasks: false,
      canManageColumns: false
    },
    member: {
      canView: true,
      canEdit: false,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: false,
      canManageColumns: false
    },
    admin: {
      canView: true,
      canEdit: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canManageColumns: true
    }
  };
  
  return defaultPermissions[role] || defaultPermissions.member;
};

module.exports = mongoose.model('UserRoles', userRolesSchema);