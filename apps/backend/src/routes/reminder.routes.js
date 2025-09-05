const express = require('express');
const reminderController = require('../controllers/reminder.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');
const { reminder: reminderSchemas } = require('./validator');

const router = express.Router();



// Routes
router.get('/', reminderController.getReminders);
router.get('/:id', reminderController.getReminder);

router.post('/',
    validateMiddleware.validateBody(reminderSchemas.createReminderSchema),
    reminderController.createReminder
);

router.put('/:id',
    validateMiddleware.validateBody(reminderSchemas.updateReminderSchema),
    reminderController.updateReminder
);

router.delete('/:id', reminderController.deleteReminder);

router.patch('/:id/snooze',
    validateMiddleware.validateBody(reminderSchemas.snoozeReminderSchema),
    reminderController.snoozeReminder
);

// Admin/system routes
router.post('/process-due',
    requireSystemAdmin,
    reminderController.processDueReminders
);

module.exports = router;
