/**
 * Seeders Index
 * Main entry point for all seeding functionality
 */

const DatabaseSeeder = require('./DatabaseSeeder');

// Export the main seeder
module.exports = DatabaseSeeder;

// Also export individual components for advanced usage
module.exports.DatabaseSeeder = DatabaseSeeder;
module.exports.UserSeeder = require('./modules/UserSeeder');
module.exports.WorkspaceSeeder = require('./modules/WorkspaceSeeder');
module.exports.BoardSeeder = require('./modules/BoardSeeder');
module.exports.BoardTemplateSeeder = require('./modules/BoardTemplateSeeder');
module.exports.TagSeeder = require('./modules/TagSeeder');
module.exports.TaskSeeder = require('./modules/TaskSeeder');
module.exports.CommentSeeder = require('./modules/CommentSeeder');
module.exports.NotificationSeeder = require('./modules/NotificationSeeder');
module.exports.ReminderSeeder = require('./modules/ReminderSeeder');
module.exports.FileSeeder = require('./modules/FileSeeder');
module.exports.InvitationSeeder = require('./modules/InvitationSeeder');
module.exports.AnalyticsSeeder = require('./modules/AnalyticsSeeder');
module.exports.BaseSeeder = require('./base/BaseSeeder');
module.exports.BackupManager = require('./utils/backup');
module.exports.ProgressTracker = require('./utils/progress').ProgressTracker;
module.exports.MultiStepProgressTracker = require('./utils/progress').MultiStepProgressTracker;
module.exports.SeederValidator = require('./utils/validator');
module.exports.seederConfig = require('./config/seeder.config');
