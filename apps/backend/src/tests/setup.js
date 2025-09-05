// Global test setup
const mongoose = require('mongoose');

// Import all models to ensure they are registered
require('../models/User');
require('../models/UserRoles');
require('../models/UserSessions');
require('../models/UserPreferences');
require('../models/Workspace');
require('../models/Space');
require('../models/Board');
require('../models/Column');
require('../models/Task');
require('../models/Comment');
require('../models/File');
require('../models/Notification');
require('../models/Reminder');
require('../models/Tag');
require('../models/Invitation');
require('../models/Checklist');
require('../models/Analytics');
require('../models/ActivityLog');

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console.log during tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/taskflow_test';
process.env.PORT = '3002'; // Different port for tests

// Mock external services that might not be available in test environment
jest.mock('../services/ai.service', () => ({
  generateTaskSuggestions: jest.fn().mockResolvedValue({
    tasks: [
      { title: 'Mock suggested task 1', priority: 'high' },
      { title: 'Mock suggested task 2', priority: 'medium' }
    ],
    reasoning: 'Mock AI reasoning',
    estimatedTimeline: '2 weeks'
  }),
  parseNaturalLanguageTask: jest.fn().mockResolvedValue({
    title: 'Parsed task title',
    description: 'Parsed description',
    priority: 'medium',
    dueDate: new Date(),
    labels: ['frontend', 'ui']
  }),
  analyzeTaskRisks: jest.fn().mockResolvedValue({
    risks: [
      { type: 'overdue_tasks', severity: 'high', count: 2 }
    ],
    recommendations: [
      'Focus on overdue tasks first'
    ],
    summary: { totalTasks: 3, overdueTasks: 2, completedTasks: 0, riskScore: 5 }
  }),
  generateProjectTimeline: jest.fn().mockResolvedValue({
    phases: [
      { name: 'Planning', duration: '1 week' },
      { name: 'Development', duration: '6 weeks' },
      { name: 'Testing', duration: '2 weeks' }
    ],
    milestones: [
      { name: 'MVP Ready', date: new Date() }
    ],
    estimatedCompletion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  }),
  getSmartRecommendations: jest.fn().mockResolvedValue({
    taskOptimizations: [],
    workflowImprovements: [],
    teamSuggestions: []
  }),
  analyzeTeamPerformance: jest.fn().mockResolvedValue({
    teamEfficiency: 0.8,
    memberPerformance: [],
    bottlenecks: [],
    suggestions: [],
    period: 'last_30_days'
  }),
  analyzeProjectMetrics: jest.fn().mockResolvedValue([
    {
      title: 'Improve throughput',
      description: 'Focus on clearing in_progress tasks to improve flow',
      priority: 'medium',
      action: 'Hold daily standups to unblock tasks'
    }
  ])
}));

// Mock email service
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' }),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendInvitationEmail: jest.fn().mockResolvedValue(true),
  sendNotificationEmail: jest.fn().mockResolvedValue(true)
}));

// Mock global notification namespace for tests
global.notificationNamespace = {
  sendNotification: jest.fn().mockResolvedValue({
    _id: 'mock-notification-id',
    title: 'Mock Notification',
    message: 'Mock message',
    recipient: 'mock-recipient-id'
  }),
  sendBulkNotifications: jest.fn().mockResolvedValue([
    { success: true, notification: { _id: 'mock-1' } },
    { success: true, notification: { _id: 'mock-2' } }
  ]),
  broadcastSystemNotification: jest.fn().mockResolvedValue([
    { success: true, notification: { _id: 'mock-system-1' } }
  ])
};

// Suppress MongoDB deprecation warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('DeprecationWarning')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Global test teardown
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error('Error closing test database:', error);
  }
});
