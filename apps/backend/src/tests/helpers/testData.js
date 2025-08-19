const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');

// Test data factories
const createTestUser = (overrides = {}) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'TestPass123!',
  emailVerified: true,
  ...overrides
});

const createTestWorkspace = (ownerId, overrides = {}) => ({
  name: faker.company.name(),
  description: faker.lorem.sentence(),
  owner: ownerId,
  plan: 'free',
  members: [], // Owner is not included in members array in the actual app
  ...overrides
});

const createTestSpace = (workspaceId, overrides = {}) => ({
  name: faker.lorem.words(2),
  description: faker.lorem.sentence(),
  workspace: workspaceId,
  members: [],
  ...overrides
});

const createTestBoard = (spaceId, overrides = {}) => ({
  name: faker.lorem.words(2),
  description: faker.lorem.sentence(),
  space: spaceId,
  type: 'kanban',
  visibility: 'private',
  ...overrides
});

const createTestColumn = (boardId, position = 0, overrides = {}) => ({
  name: faker.lorem.word(),
  board: boardId,
  position,
  isDefault: position === 0,
  ...overrides
});

const createTestTask = (boardId, columnId, reporterId, spaceId, overrides = {}) => ({
  title: faker.lorem.words(4),
  description: faker.lorem.paragraph(),
  board: boardId,
  space: spaceId,
  column: columnId,
  reporter: reporterId,
  priority: 'medium',
  status: 'todo',
  position: 0,
  ...overrides
});

const createTestTag = (spaceId, createdBy, overrides = {}) => ({
  name: faker.lorem.word(),
  color: faker.internet.color(),
  space: spaceId,
  scope: 'space',
  createdBy,
  ...overrides
});

const createTestReminder = (userId, entityId, overrides = {}) => ({
  title: faker.lorem.words(3),
  message: faker.lorem.sentence(),
  userId,
  entityType: 'task',
  entityId,
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  method: ['email'],
  priority: 'normal',
  status: 'scheduled',
  repeat: { enabled: false, frequency: 'daily', interval: 1 },
  snoozeInfo: { snoozeCount: 0, maxSnoozes: 3 },
  ...overrides
});

const createTestInvitation = (invitedBy, targetEntity, overrides = {}) => ({
  invitedUser: {
    email: faker.internet.email(),
    name: faker.person.fullName()
  },
  invitedBy,
  targetEntity,
  role: 'member',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  ...overrides
});

const createTestNotification = (recipientId, overrides = {}) => ({
  recipient: recipientId,
  title: faker.lorem.words(4),
  message: faker.lorem.sentence(),
  type: 'task_assigned',
  priority: 'medium',
  relatedEntity: {
    entityType: 'task',
    entityId: new mongoose.Types.ObjectId()
  },
  ...overrides
});

const createTestFile = (uploadedBy, overrides = {}) => ({
  filename: `${faker.system.fileName()}.jpg`,
  originalName: faker.system.fileName() + '.jpg',
  mimeType: 'image/jpeg',
  size: faker.number.int({ min: 1000, max: 1000000 }),
  path: `/uploads/${faker.system.fileName()}.jpg`,
  extension: 'jpg',
  uploadedBy,
  category: 'general',
  ...overrides
});

// Helper function to create workspace with proper user roles
const createWorkspaceWithRoles = async (ownerId, overrides = {}) => {
  const User = require('../../models/User');
  const Workspace = require('../../models/Workspace');
  const mongoose = require('mongoose');
  
  // Ensure ownerId is an ObjectId
  const ownerObjectId = mongoose.Types.ObjectId.isValid(ownerId) ? ownerId : new mongoose.Types.ObjectId(ownerId);
  
  // Create workspace
  const workspaceData = createTestWorkspace(ownerObjectId, overrides);
  const workspace = await Workspace.create(workspaceData);
  
  // Add owner role to user
  const user = await User.findById(ownerObjectId);
  if (!user) {
    throw new Error(`User with ID ${ownerObjectId} not found`);
  }
  const userRoles = await user.getRoles();
  await userRoles.addWorkspaceRole(workspace._id, 'owner');
  
  return workspace;
};

// Helper function to set up board permissions for a user
const setupBoardPermissions = async (userId, boardId, role = 'member') => {
  // Note: Board role management is not implemented in the current UserRoles model
  // This is a mock function that returns a mock userRoles object
  return {
    hasBoardPermission: (boardId, permission) => {
      // Mock implementation - always return true for testing
      return true;
    }
  };
};

// Helper function to create space with proper user roles
const createSpaceWithRoles = async (ownerId, workspaceId, overrides = {}) => {
  const User = require('../../models/User');
  const Space = require('../../models/Space');
  const mongoose = require('mongoose');
  
  // Ensure IDs are ObjectIds
  const ownerObjectId = mongoose.Types.ObjectId.isValid(ownerId) ? ownerId : new mongoose.Types.ObjectId(ownerId);
  const workspaceObjectId = mongoose.Types.ObjectId.isValid(workspaceId) ? workspaceId : new mongoose.Types.ObjectId(workspaceId);
  
  // Create space
  const spaceData = createTestSpace(workspaceObjectId, overrides);
  const space = await Space.create(spaceData);
  
  // Add owner as admin member to space
  await space.addMember(ownerObjectId, 'admin', ownerObjectId);
  
  // Add owner role to user
  const user = await User.findById(ownerObjectId);
  if (!user) {
    throw new Error(`User with ID ${ownerObjectId} not found`);
  }
  const userRoles = await user.getRoles();
  await userRoles.addSpaceRole(space._id, 'admin');
  
  return space;
};

module.exports = {
  createTestUser,
  createTestWorkspace,
  createTestSpace,
  createTestBoard,
  createTestColumn,
  createTestTask,
  createTestTag,
  createTestReminder,
  createTestInvitation,
  createTestNotification,
  createTestFile,
  createWorkspaceWithRoles,
  createSpaceWithRoles,
  setupBoardPermissions
};
