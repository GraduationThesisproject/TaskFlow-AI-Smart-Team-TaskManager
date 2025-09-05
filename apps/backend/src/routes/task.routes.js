const express = require('express');
const taskController = require('../controllers/task.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireBoardPermission } = require('../middlewares/permission.middleware');
const { uploadMiddlewares } = require('../middlewares/upload.middleware');
const { task: taskSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get('/', taskController.getTasks);
router.get('/recommendations', taskController.getTaskRecommendations);
router.get('/overdue', taskController.getOverdueTasks);
router.get('/:id', taskController.getTask);

router.post('/', 
    requireBoardPermission(),
    uploadMiddlewares.taskAttachment,
    validateMiddleware.validateBody(taskSchemas.createTaskSchema),
    taskController.createTask
);

router.put('/:id', 
    requireBoardPermission(),
    validateMiddleware.validateBody(taskSchemas.updateTaskSchema),
    taskController.updateTask
);

router.patch('/:id/move',
    requireBoardPermission(),
    validateMiddleware.validateBody(taskSchemas.moveTaskSchema),
    taskController.moveTask
);

router.delete('/:id', requireBoardPermission(), taskController.deleteTask);

router.patch('/bulk-update',
    requireBoardPermission(),
    validateMiddleware.validateBody(taskSchemas.bulkUpdateSchema),
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
    validateMiddleware.validateBody(taskSchemas.addCommentSchema),
    taskController.addComment
);

router.put('/comments/:commentId',
    validateMiddleware.validateBody(taskSchemas.updateCommentSchema),
    taskController.updateComment
);

router.delete('/comments/:commentId', taskController.deleteComment);

router.post('/comments/:commentId/reactions',
    validateMiddleware.validateBody(taskSchemas.addReactionSchema),
    taskController.addReaction
);

router.delete('/comments/:commentId/reactions',
    validateMiddleware.validateBody(taskSchemas.addReactionSchema),
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
    validateMiddleware.validateBody(taskSchemas.addWatcherSchema),
    taskController.addWatcher
);

router.delete('/:id/watchers',
    validateMiddleware.validateBody(taskSchemas.addWatcherSchema),
    taskController.removeWatcher
);

module.exports = router;
