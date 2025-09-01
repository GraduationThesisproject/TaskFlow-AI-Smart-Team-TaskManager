/**
 * Reminder Validation Schemas
 * Contains all validation rules for reminder-related endpoints
 */

const createReminderSchema = {
    title: { required: true, minLength: 1, maxLength: 200 },
    description: { maxLength: 500 },
    reminderDate: { required: true, date: true },
    type: { enum: ['email', 'push', 'both'], default: 'both' },
    taskId: { objectId: true },
    spaceId: { objectId: true },
    recurring: {
        enabled: { boolean: true },
        pattern: { enum: ['daily', 'weekly', 'monthly', 'yearly'] },
        interval: { number: true, min: 1 },
        endDate: { date: true }
    }
};

const updateReminderSchema = {
    title: { minLength: 1, maxLength: 200 },
    description: { maxLength: 500 },
    reminderDate: { date: true },
    type: { enum: ['email', 'push', 'both'] },
    recurring: {
        enabled: { boolean: true },
        pattern: { enum: ['daily', 'weekly', 'monthly', 'yearly'] },
        interval: { number: true, min: 1 },
        endDate: { date: true }
    }
};

const snoozeReminderSchema = {
    minutes: { number: true, min: 1, max: 43200 } // Max 30 days
};

module.exports = {
    createReminderSchema,
    updateReminderSchema,
    snoozeReminderSchema
};
