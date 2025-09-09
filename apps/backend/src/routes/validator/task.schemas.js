/**
 * Task Validation Schemas
 * Contains all validation rules for task-related endpoints
 */

const createTaskSchema = {
    title: { required: true, minLength: 2, maxLength: 200 },
    description: { maxLength: 2000 },
    boardId: { required: true, objectId: true },
    columnId: { required: true, objectId: true },
    priority: { enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    assignees: { array: true, arrayOf: 'objectId' },
    labels: { array: true },
    estimatedHours: { number: true, min: 0 },
    dueDate: { date: true },
    startDate: { date: true },
    position: { number: true, min: 0 },
    color: { string: true, pattern: /^#[0-9A-F]{6}$/i }
};

const updateTaskSchema = {
    title: { minLength: 2, maxLength: 200 },
    description: { maxLength: 2000 },
    priority: { enum: ['low', 'medium', 'high', 'critical'] },
    status: { enum: ['todo', 'in_progress', 'review', 'done', 'archived'] },
    assignees: { array: true, arrayOf: 'objectId' },
    labels: { array: true },
    estimatedHours: { number: true, min: 0 },
    actualHours: { number: true, min: 0 },
    dueDate: { date: true },
    startDate: { date: true },
    color: { string: true, pattern: /^#[0-9A-F]{6}$/i }
};

const moveTaskSchema = {
    columnId: { required: true, objectId: true },
    position: { required: true, number: true, min: 0 }
};

const addCommentSchema = {
    content: { required: true, minLength: 1, maxLength: 2000 },
    mentions: { array: true, arrayOf: 'objectId' },
    parentCommentId: { objectId: true }
};

const updateCommentSchema = {
    content: { required: true, minLength: 1, maxLength: 2000 }
};

const addReactionSchema = {
    emoji: { required: true, string: true, maxLength: 10 }
};

const addWatcherSchema = {
    userId: { required: true, objectId: true }
};

const bulkUpdateSchema = {
    taskIds: { required: true, array: true, arrayOf: 'objectId', minItems: 1 },
    updates: { required: true, object: true }
};

module.exports = {
    createTaskSchema,
    updateTaskSchema,
    moveTaskSchema,
    addCommentSchema,
    updateCommentSchema,
    addReactionSchema,
    addWatcherSchema,
    bulkUpdateSchema
};
