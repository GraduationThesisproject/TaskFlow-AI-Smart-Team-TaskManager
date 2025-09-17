// Import all models to ensure they are registered with Mongoose
require('./User');
require('./UserPreferences');
require('./UserSessions');
require('./UserRoles');
require('./Workspace');
require('./Space');
require('./Board');
require('./Column');
require('./Task');
require('./Comment');
require('./Checklist');
require('./Tag');
require('./File');
require('./Notification');
require('./Reminder');
require('./Invitation');
require('./Analytics');
require('./ActivityLog');
require('./Admin');
require('./AIJob');
require('./IntegrationAiToken');
require('./Template');
require('./BoardTemplate');
require('./Quota');
require('./PushSubscription');

module.exports = {
  User: require('./User'),
  UserPreferences: require('./UserPreferences'),
  UserSessions: require('./UserSessions'),
  UserRoles: require('./UserRoles'),
  Workspace: require('./Workspace'),
  Space: require('./Space'),
  Board: require('./Board'),
  Column: require('./Column'),
  Task: require('./Task'),
  Comment: require('./Comment'),
  Checklist: require('./Checklist'),
  Tag: require('./Tag'),
  File: require('./File'),
  Notification: require('./Notification'),
  Reminder: require('./Reminder'),
  Invitation: require('./Invitation'),
  Analytics: require('./Analytics'),
  ActivityLog: require('./ActivityLog'),
  Admin: require('./Admin'),
  AIJob: require('./AIJob'),
  IntegrationAiToken: require('./IntegrationAiToken'),
  Template: require('./Template'),
  BoardTemplate: require('./BoardTemplate'),
  Quota: require('./Quota'),
  PushSubscription: require('./PushSubscription')
};
