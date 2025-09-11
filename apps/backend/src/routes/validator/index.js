/**
 * Validation Schemas Index
 * Central export point for all route validation schemas
 */

// Import all validation schemas
const authSchemas = require('./auth.schemas');
const workspaceSchemas = require('./workspace.schemas');
const spaceSchemas = require('./space.schemas');
const boardSchemas = require('./board.schemas');
const taskSchemas = require('./task.schemas');
const tagSchemas = require('./tag.schemas');
const checklistSchemas = require('./checklist.schemas');
const invitationSchemas = require('./invitation.schemas');
const notificationSchemas = require('./notification.schemas');
const reminderSchemas = require('./reminder.schemas');
const aiSchemas = require('./ai.schemas');
const analyticsSchemas = require('./analytics.schemas');
const githubSchemas = require('./github.schemas');

// Export all schemas
module.exports = {
    auth: authSchemas,
    workspace: workspaceSchemas,
    space: spaceSchemas,
    board: boardSchemas,
    task: taskSchemas,
    tag: tagSchemas,
    checklist: checklistSchemas,
    invitation: invitationSchemas,
    notification: notificationSchemas,
    reminder: reminderSchemas,
    ai: aiSchemas,
    analytics: analyticsSchemas,
    github: githubSchemas,
    
};
