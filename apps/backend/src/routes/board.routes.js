const express = require('express');
const boardController = require('../controllers/board.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireBoardPermission } = require('../middlewares/permission.middleware');
const { board: boardSchemas } = require('./validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Routes
router.get('/space/:spaceId', boardController.getBoards);
router.get('/:id', boardController.getBoard);

router.post('/', 
    requireBoardPermission('/'),
    validateMiddleware.validateBody(boardSchemas.createBoardSchema),
    boardController.createBoard
);

router.put('/:id', 
    requireBoardPermission('/:id'),
    validateMiddleware.validateBody(boardSchemas.updateBoardSchema),
    boardController.updateBoard
);

router.delete('/:id', requireBoardPermission('/:id'), boardController.deleteBoard);

// Column routes
router.post('/:id/columns',
    validateMiddleware.validateBody(boardSchemas.addColumnSchema),
    boardController.addColumn
);

router.put('/:id/columns/:columnId',
    validateMiddleware.validateBody(boardSchemas.updateColumnSchema),
    boardController.updateColumn
);

router.delete('/:id/columns/:columnId', boardController.deleteColumn);

// Add missing column routes identified in analysis
router.get('/:id/columns', boardController.getColumns);

router.patch('/:id/columns/reorder', boardController.reorderColumns);

module.exports = router;
