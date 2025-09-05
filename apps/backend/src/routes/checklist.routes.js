const express = require('express');
const checklistController = require('../controllers/checklist.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { checklist: checklistSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);



// Routes
router.get('/task/:taskId', checklistController.getTaskChecklists);

router.post('/task/:taskId',
    validateMiddleware.validateBody(checklistSchemas.createChecklistSchema),
    checklistController.createChecklist
);

router.put('/:id',
    validateMiddleware.validateBody(checklistSchemas.updateChecklistSchema),
    checklistController.updateChecklist
);

router.delete('/:id', checklistController.deleteChecklist);

router.post('/:id/items',
    validateMiddleware.validateBody(checklistSchemas.addItemSchema),
    checklistController.addItem
);

router.put('/:id/items/:itemId',
    validateMiddleware.validateBody(checklistSchemas.updateItemSchema),
    checklistController.updateItem
);

router.delete('/:id/items/:itemId', checklistController.deleteItem);

router.patch('/:id/reorder',
    validateMiddleware.validateBody(checklistSchemas.reorderItemsSchema),
    checklistController.reorderItems
);

module.exports = router;
