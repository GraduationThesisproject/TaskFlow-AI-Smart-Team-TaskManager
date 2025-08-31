const express = require('express');
const notificationController = require('../controllers/notification.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');
const { notification: notificationSchemas } = require('./validator');

const router = express.Router();



// Routes
router.get('/', notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);

router.post('/',
    requireSystemAdmin,
    validateMiddleware(notificationSchemas.createNotificationSchema),
    notificationController.createNotification
);

router.patch('/:id/read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);

router.patch('/bulk-read',
    validateMiddleware(notificationSchemas.bulkMarkReadSchema),
    notificationController.bulkMarkAsRead
);

router.delete('/:id', notificationController.deleteNotification);
router.post('/clear-read', notificationController.deleteReadNotifications);

router.put('/preferences',
    validateMiddleware(notificationSchemas.updatePreferencesSchema),
    notificationController.updatePreferences
);

// Test endpoint for real-time notifications (development only)
router.post('/test',
    requireSystemAdmin,
    notificationController.sendTestNotification
);

module.exports = router;
