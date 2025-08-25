const express = require('express');
const notificationController = require('../controllers/notification.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
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

// Routes
router.get('/', notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);

router.post('/',
    requireSystemAdmin,
    validateMiddleware(createNotificationSchema),
    notificationController.createNotification
);

router.patch('/:id/read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);

router.patch('/bulk-read',
    validateMiddleware(bulkMarkReadSchema),
    notificationController.bulkMarkAsRead
);

router.delete('/:id', notificationController.deleteNotification);
router.post('/clear-read', notificationController.deleteReadNotifications);

router.put('/preferences',
    validateMiddleware(updatePreferencesSchema),
    notificationController.updatePreferences
);

// Test endpoint for real-time notifications (development only)
router.post('/test',
    requireSystemAdmin,
    notificationController.sendTestNotification
);

module.exports = router;
