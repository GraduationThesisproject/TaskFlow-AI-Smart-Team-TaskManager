const express = require('express');
const checklistController = require('../controllers/checklist.controller');
const validateMiddleware = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const createChecklistSchema = {
    title: { required: true, minLength: 1, maxLength: 100 },
    items: { 
        array: true,
        arrayOf: 'object'
    }
};

const updateChecklistSchema = {
    title: { minLength: 1, maxLength: 100 },
    hideCompletedItems: { boolean: true }
};

const addItemSchema = {
    text: { required: true, minLength: 1, maxLength: 200 },
    position: { number: true, min: 0 }
};

const updateItemSchema = {
    text: { minLength: 1, maxLength: 200 },
    completed: { boolean: true }
};

const reorderItemsSchema = {
    itemOrder: { required: true, array: true }
};

// Routes
router.get('/task/:taskId', checklistController.getTaskChecklists);

router.post('/task/:taskId',
    validateMiddleware(createChecklistSchema),
    checklistController.createChecklist
);

router.put('/:id',
    validateMiddleware(updateChecklistSchema),
    checklistController.updateChecklist
);

router.delete('/:id', checklistController.deleteChecklist);

router.post('/:id/items',
    validateMiddleware(addItemSchema),
    checklistController.addItem
);

router.put('/:id/items/:itemId',
    validateMiddleware(updateItemSchema),
    checklistController.updateItem
);

router.delete('/:id/items/:itemId', checklistController.deleteItem);

router.patch('/:id/reorder',
    validateMiddleware(reorderItemsSchema),
    checklistController.reorderItems
);

module.exports = router;
