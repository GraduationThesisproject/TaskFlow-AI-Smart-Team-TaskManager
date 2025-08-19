const express = require('express');
const reminderController = require('../controllers/reminder.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireSystemAdmin } = require('../middlewares/permission.middleware');

const router = express.Router();

// Validation schemas
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

// Routes
router.get('/', reminderController.getReminders);
router.get('/stats', reminderController.getReminderStats);
router.get('/:id', reminderController.getReminderById);

router.post('/',
    validateMiddleware(createReminderSchema),
    reminderController.createReminder
);

router.put('/:id',
    validateMiddleware(updateReminderSchema),
    reminderController.updateReminder
);

router.delete('/:id', reminderController.deleteReminder);

router.patch('/:id/snooze',
    validateMiddleware(snoozeReminderSchema),
    reminderController.snoozeReminder
);

// Admin/system routes
router.post('/process-due',
    requireSystemAdmin,
    reminderController.processDueReminders
);

module.exports = router;
