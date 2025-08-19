const express = require('express');
const taskController = require('../controllers/task.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireBoardPermission } = require('../middlewares/permission.middleware');
const { uploadMiddlewares } = require('../middlewares/upload.middleware');

const router = express.Router();

// Validation schemas
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
    position: { number: true, min: 0 }
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
    startDate: { date: true }
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

// Routes
router.get('/', taskController.getTasks);
router.get('/recommendations', taskController.getTaskRecommendations);
router.get('/overdue', taskController.getOverdueTasks);
router.get('/:id', taskController.getTask);

router.post('/', 
    uploadMiddlewares.taskAttachment,
    validateMiddleware(createTaskSchema),
    taskController.createTask
);

router.put('/:id', 
    validateMiddleware(updateTaskSchema),
    taskController.updateTask
);

router.patch('/:id/move',
    validateMiddleware(moveTaskSchema),
    taskController.moveTask
);

router.delete('/:id', taskController.deleteTask);

router.patch('/bulk-update',
    validateMiddleware(bulkUpdateSchema),
    taskController.bulkUpdateTasks
);

// Time tracking routes
router.post('/:id/time-tracking', taskController.startTimeTracking);
router.post('/:id/time-tracking/stop', taskController.stopTimeTracking);

// Duplicate route
router.post('/:id/duplicate', taskController.duplicateTask);

// History route
router.get('/:id/history', taskController.getTaskHistory);

// Dependencies route
router.post('/:id/dependencies', taskController.addTaskDependency);
router.delete('/:id/dependencies/:dependencyId', taskController.removeTaskDependency);

// Comment routes
router.post('/:id/comments',
    uploadMiddlewares.commentAttachment,
    validateMiddleware(addCommentSchema),
    taskController.addComment
);

router.put('/comments/:commentId',
    validateMiddleware(updateCommentSchema),
    taskController.updateComment
);

router.delete('/comments/:commentId', taskController.deleteComment);

router.post('/comments/:commentId/reactions',
    validateMiddleware(addReactionSchema),
    taskController.addReaction
);

router.delete('/comments/:commentId/reactions',
    validateMiddleware(addReactionSchema),
    taskController.removeReaction
);

router.post('/comments/:commentId/pin',
    taskController.toggleCommentPin
);

router.post('/comments/:commentId/resolve',
    taskController.toggleCommentResolve
);

// Watcher routes
router.post('/:id/watchers',
    validateMiddleware(addWatcherSchema),
    taskController.addWatcher
);

router.delete('/:id/watchers',
    validateMiddleware(addWatcherSchema),
    taskController.removeWatcher
);

module.exports = router;