const express = require('express');
const boardController = require('../controllers/board.controller');
const validateMiddleware = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const createBoardSchema = {
    name: { required: true, minLength: 2, maxLength: 100 },
    description: { maxLength: 500 },
    type: { enum: ['kanban', 'list', 'calendar', 'timeline'], default: 'kanban' },
    spaceId: { required: true, objectId: true }
};

const updateBoardSchema = {
    name: { minLength: 2, maxLength: 100 },
    description: { maxLength: 500 }
};

const addColumnSchema = {
    name: { required: true, minLength: 1, maxLength: 100 },
    color: { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ },
    position: { required: true, number: true, min: 0 }
};

const updateColumnSchema = {
    name: { minLength: 1, maxLength: 100 },
    color: { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ },
    wipLimit: { number: true, min: 0 }
};

// Routes
router.get('/space/:spaceId', boardController.getBoards);
router.get('/:id', boardController.getBoard);

router.post('/', 
    validateMiddleware(createBoardSchema),
    boardController.createBoard
);

router.put('/:id', 
    validateMiddleware(updateBoardSchema),
    boardController.updateBoard
);

router.delete('/:id', boardController.deleteBoard);

// Column routes
router.post('/:id/columns',
    validateMiddleware(addColumnSchema),
    boardController.addColumn
);

router.put('/:id/columns/:columnId',
    validateMiddleware(updateColumnSchema),
    boardController.updateColumn
);

router.delete('/:id/columns/:columnId', boardController.deleteColumn);

module.exports = router;
