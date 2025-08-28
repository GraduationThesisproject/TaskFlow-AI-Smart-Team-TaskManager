/**
 * Seeder Validation Utilities
 * Validates data before seeding to ensure quality
 */

const seederConfig = require('../config/seeder.config');

class SeederValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate user data
   */
  validateUser(userData) {
    const errors = [];
    const warnings = [];

    // Validate email
    if (!userData.email || !seederConfig.validation.email.pattern.test(userData.email)) {
      errors.push(`Invalid email: ${userData.email}`);
    }

    // Validate name
    if (!userData.name || userData.name.length < seederConfig.validation.name.minLength || 
        userData.name.length > seederConfig.validation.name.maxLength) {
      errors.push(`Invalid name length: ${userData.name}`);
    }

    if (userData.name && !seederConfig.validation.name.pattern.test(userData.name)) {
      warnings.push(`Name contains special characters: ${userData.name}`);
    }

    // Validate password
    if (userData.password && userData.password.length < seederConfig.validation.password.minLength) {
      errors.push(`Password too short: ${userData.password}`);
    }

    if (userData.password && !seederConfig.validation.password.pattern.test(userData.password)) {
      errors.push(`Password doesn't meet requirements: ${userData.password}`);
    }

    // Validate system role
    const validRoles = ['super_admin', 'admin', 'moderator'];
    if (userData.systemRole && !validRoles.includes(userData.systemRole)) {
      errors.push(`Invalid system role: ${userData.systemRole}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate workspace data
   */
  validateWorkspace(workspaceData) {
    const errors = [];
    const warnings = [];

    // Validate name
    if (!workspaceData.name || workspaceData.name.length < 2) {
      errors.push(`Invalid workspace name: ${workspaceData.name}`);
    }

    // Validate owner
    if (!workspaceData.owner) {
      errors.push('Workspace must have an owner');
    }

    // Validate members
    if (workspaceData.members && !Array.isArray(workspaceData.members)) {
      errors.push('Members must be an array');
    }

    return { errors, warnings };
  }

  /**
   * Validate space data
   */
  validateSpace(spaceData) {
    const errors = [];
    const warnings = [];

    // Validate name
    if (!spaceData.name || spaceData.name.length < 2) {
      errors.push(`Invalid space name: ${spaceData.name}`);
    }

    // Validate workspace reference
    if (!spaceData.workspace) {
      errors.push('Space must belong to a workspace');
    }

    // Validate members
    if (spaceData.members && !Array.isArray(spaceData.members)) {
      errors.push('Members must be an array');
    }

    return { errors, warnings };
  }

  /**
   * Validate board data
   */
  validateBoard(boardData) {
    const errors = [];
    const warnings = [];

    // Validate name
    if (!boardData.name || boardData.name.length < 2) {
      errors.push(`Invalid board name: ${boardData.name}`);
    }

    // Validate space reference
    if (!boardData.space) {
      errors.push('Board must belong to a space');
    }

    // Validate owner
    if (!boardData.owner) {
      errors.push('Board must have an owner');
    }

    // Validate columns
    if (boardData.columns && !Array.isArray(boardData.columns)) {
      errors.push('Columns must be an array');
    }

    return { errors, warnings };
  }

  /**
   * Validate task data
   */
  validateTask(taskData) {
    const errors = [];
    const warnings = [];

    // Validate title
    if (!taskData.title || taskData.title.length < 3) {
      errors.push(`Invalid task title: ${taskData.title}`);
    }

    // Validate board reference
    if (!taskData.board) {
      errors.push('Task must belong to a board');
    }

    // Validate assignee
    if (!taskData.assignee) {
      warnings.push('Task has no assignee');
    }

    // Validate reporter
    if (!taskData.reporter) {
      warnings.push('Task has no reporter');
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (taskData.priority && !validPriorities.includes(taskData.priority)) {
      errors.push(`Invalid priority: ${taskData.priority}`);
    }

    // Validate status
    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (taskData.status && !validStatuses.includes(taskData.status)) {
      errors.push(`Invalid status: ${taskData.status}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate comment data
   */
  validateComment(commentData) {
    const errors = [];
    const warnings = [];

    // Validate content
    if (!commentData.content || commentData.content.length < 1) {
      errors.push('Comment must have content');
    }

    // Validate task reference
    if (!commentData.task) {
      errors.push('Comment must belong to a task');
    }

    // Validate author
    if (!commentData.author) {
      errors.push('Comment must have an author');
    }

    return { errors, warnings };
  }

  /**
   * Validate tag data
   */
  validateTag(tagData) {
    const errors = [];
    const warnings = [];

    // Validate name
    if (!tagData.name || tagData.name.length < 2) {
      errors.push(`Invalid tag name: ${tagData.name}`);
    }

    // Validate color
    if (!tagData.color || !/^#[0-9A-F]{6}$/i.test(tagData.color)) {
      errors.push(`Invalid color format: ${tagData.color}`);
    }

    // Validate scope
    const validScopes = ['global', 'workspace', 'space'];
    if (tagData.scope && !validScopes.includes(tagData.scope)) {
      errors.push(`Invalid scope: ${tagData.scope}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate notification data
   */
  validateNotification(notificationData) {
    const errors = [];
    const warnings = [];

    // Validate recipient
    if (!notificationData.recipient) {
      errors.push('Notification must have a recipient');
    }

    // Validate type
    const validTypes = [
      'task_assigned', 'task_updated', 'task_completed',
      'comment_added', 'comment_mentioned', 'deadline_approaching',
      'space_update', 'board_update', 'mention_received'
    ];
    if (notificationData.type && !validTypes.includes(notificationData.type)) {
      errors.push(`Invalid notification type: ${notificationData.type}`);
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (notificationData.priority && !validPriorities.includes(notificationData.priority)) {
      errors.push(`Invalid priority: ${notificationData.priority}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate reminder data
   */
  validateReminder(reminderData) {
    const errors = [];
    const warnings = [];

    // Validate title
    if (!reminderData.title || reminderData.title.length < 3) {
      errors.push(`Invalid reminder title: ${reminderData.title}`);
    }

    // Validate scheduled date
    if (!reminderData.scheduledAt || !(reminderData.scheduledAt instanceof Date)) {
      errors.push('Reminder must have a valid scheduled date');
    }

    // Validate user
    if (!reminderData.userId) {
      errors.push('Reminder must have a user');
    }

    // Validate method
    const validMethods = ['email', 'push', 'in_app'];
    if (reminderData.method && !Array.isArray(reminderData.method)) {
      errors.push('Method must be an array');
    } else if (reminderData.method) {
      for (const method of reminderData.method) {
        if (!validMethods.includes(method)) {
          errors.push(`Invalid method: ${method}`);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate file data
   */
  validateFile(fileData) {
    const errors = [];
    const warnings = [];

    // Validate filename
    if (!fileData.filename || fileData.filename.length < 1) {
      errors.push(`Invalid filename: ${fileData.filename}`);
    }

    // Validate mime type
    if (!fileData.mimeType || fileData.mimeType.length < 1) {
      errors.push(`Invalid mime type: ${fileData.mimeType}`);
    }

    // Validate size
    if (fileData.size && (fileData.size <= 0 || fileData.size > 100 * 1024 * 1024)) {
      warnings.push(`File size may be too large: ${fileData.size} bytes`);
    }

    // Validate uploaded by
    if (!fileData.uploadedBy) {
      errors.push('File must have an uploader');
    }

    return { errors, warnings };
  }

  /**
   * Validate invitation data
   */
  validateInvitation(invitationData) {
    const errors = [];
    const warnings = [];

    // Validate email
    if (!invitationData.invitedUser?.email || 
        !seederConfig.validation.email.pattern.test(invitationData.invitedUser.email)) {
      errors.push(`Invalid invitation email: ${invitationData.invitedUser?.email}`);
    }

    // Validate type
    const validTypes = ['workspace', 'space', 'board'];
    if (invitationData.type && !validTypes.includes(invitationData.type)) {
      errors.push(`Invalid invitation type: ${invitationData.type}`);
    }

    // Validate role
    const validRoles = ['viewer', 'member', 'contributor', 'admin'];
    if (invitationData.role && !validRoles.includes(invitationData.role)) {
      errors.push(`Invalid role: ${invitationData.role}`);
    }

    // Validate target entity
    if (!invitationData.targetEntity?.id) {
      errors.push('Invitation must have a target entity');
    }

    return { errors, warnings };
  }

  /**
   * Get all validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get all validation warnings
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Clear all validation messages
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Check if there are any validation errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any validation warnings
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }

  /**
   * Print validation summary
   */
  printSummary() {
    if (this.errors.length > 0) {
      console.log(`❌ Validation Errors (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  Validation Warnings (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ No validation issues found');
    }
  }
}

module.exports = SeederValidator;
