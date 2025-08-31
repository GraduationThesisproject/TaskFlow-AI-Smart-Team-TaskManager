const express = require('express');
const boardController = require('../controllers/board.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const { requireBoardPermission } = require('../middlewares/permission.middleware');
const { board: boardSchemas } = require('./validator');

const router = express.Router();

// Routes
router.get('/space/:spaceId', boardController.getBoards);
router.get('/:id', boardController.getBoard);

router.post('/', 
    requireBoardPermission(),
    validateMiddleware(boardSchemas.createBoardSchema),
    boardController.createBoard
);

router.put('/:id', 
    requireBoardPermission(),
    validateMiddleware(boardSchemas.updateBoardSchema),
    boardController.updateBoard
);

router.delete('/:id', requireBoardPermission(), boardController.deleteBoard);

// Column routes
router.post('/:id/columns',
    validateMiddleware(boardSchemas.addColumnSchema),
    boardController.addColumn
);

router.put('/:id/columns/:columnId',
    validateMiddleware(boardSchemas.updateColumnSchema),
    boardController.updateColumn
);

router.delete('/:id/columns/:columnId', boardController.deleteColumn);

// Add missing column routes identified in analysis
router.get('/:id/columns', boardController.getColumns);

router.patch('/:id/columns/reorder', boardController.reorderColumns);

module.exports = router;
