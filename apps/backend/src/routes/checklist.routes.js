const express = require('express');
const checklistController = require('../controllers/checklist.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { checklist: checklistSchemas } = require('./validator');

const router = express.Router();



// Routes
router.get('/task/:taskId', checklistController.getTaskChecklists);

router.post('/task/:taskId',
    validateMiddleware(checklistSchemas.createChecklistSchema),
    checklistController.createChecklist
);

router.put('/:id',
    validateMiddleware(checklistSchemas.updateChecklistSchema),
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
