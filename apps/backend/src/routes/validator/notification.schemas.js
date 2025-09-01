/**
 * Notification Validation Schemas
 * Contains all validation rules for notification-related endpoints
 */

const createNotificationSchema = {
    title: { required: true, minLength: 1, maxLength: 200 },
    message: { required: true, minLength: 1, maxLength: 500 },
    type: { enum: ['task_assigned', 'task_completed', 'comment_added', 'due_date_reminder', 'project_update', 'mention'] },
    recipientId: { required: true, objectId: true },
    relatedEntity: {
        entityType: { enum: ['Task', 'Project', 'Comment', 'Board'] },
        entityId: { objectId: true }
    },
    priority: { enum: ['low', 'medium', 'high'] },
    deliveryMethods: { object: true }
};

const updatePreferencesSchema = {
    preferences: { 
        required: true,
        object: true
    }
};

const bulkMarkReadSchema = {
    notificationIds: { required: true, array: true, arrayOf: 'objectId' }
};

module.exports = {
    createNotificationSchema,
    updatePreferencesSchema,
    bulkMarkReadSchema
};
