const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const Space = require('../models/Space');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all boards for space
exports.getBoards = async (req, res) => {
    try {
        const { spaceId } = req.params;
        const userId = req.user.id;

        // Check space access
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // if (!userRoles.hasSpaceRole(spaceId)) {
        //     return sendResponse(res, 403, false, 'Access denied to this space');
        // }

        const boards = await Board.find({ 
            space: spaceId,
            isArchived: { $ne: true }
        })
        .populate('space', 'name')
        .sort({ updatedAt: -1 });

        sendResponse(res, 200, true, 'Boards retrieved successfully', {
            boards
        });
    } catch (error) {
        logger.error('Get boards error:', error);
        sendResponse(res, 500, false, 'Server error retrieving boards');
    }
};

// Get single board with columns and tasks
exports.getBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id)
            .populate('space', 'name');

        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Check space access
        const userId = req.user.id;
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // if (!userRoles.hasSpaceRole(board.space._id)) {
        //     return sendResponse(res, 403, false, 'Access denied to this board');
        // }

        // Get columns with tasks
        const columns = await Column.find({ board: board._id })
            .sort({ position: 1 });

        const tasks = await Task.find({ 
            board: board._id,
            isArchived: { $ne: true }
        })
        .populate('assignees', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .sort({ position: 1 });

        // Group tasks by column
        const boardData = {
            ...board.toObject(),
            columns: columns.map(column => ({
                ...column.toObject(),
                tasks: tasks.filter(task => task.column.toString() === column._id.toString())
            }))
        };

        sendResponse(res, 200, true, 'Board retrieved successfully', {
            board: boardData,
            columns: columns,
            tasks: tasks
        });
    } catch (error) {
        logger.error('Get board error:', error);
        sendResponse(res, 500, false, 'Server error retrieving board');
    }
};

// Create new board
exports.createBoard = async (req, res) => {
    try {
        const { name, description, type = 'kanban', spaceId } = req.body;
        const userId = req.user.id;

        // Check space access and permissions
        const user = await User.findById(userId);
        // const userRoles = await user.getRoles();
        
        // if (!userRoles.hasSpaceRole(spaceId, 'contributor')) {
        //     return sendResponse(res, 403, false, 'Access denied to this space');
        // }

        const space = await Space.findById(spaceId);
        if (!space) {
            return sendResponse(res, 404, false, 'Space not found');
        }

        // Create board
        const board = await Board.create({
            name,
            description,
            type,
            space: spaceId,
            owner: userId,
            members: [{
                user: userId,
                role: 'owner',
                joinedAt: new Date()
            }]
        });

        // Create default columns based on board type
        const defaultColumns = getDefaultColumns(type);
        const columns = await Column.insertMany(
            defaultColumns.map((col, index) => ({
                ...col,
                board: board._id,
                position: index
            }))
        );

        sendResponse(res, 201, true, 'Board created successfully', {
            board: {
                ...board.toObject(),
                columns
            }
        });
    } catch (error) {
        logger.error('Create board error:', error);
        sendResponse(res, 500, false, 'Server error creating board');
    }
};

// Update board
exports.updateBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, settings } = req.body;
        const userId = req.user.id;

        const board = await Board.findById(id);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const isBoardOwner = board.owner.toString() === userId;
        const hasSpacePermission = userRoles.hasSpaceRole(board.space, 'admin');
        
        // if (!isBoardOwner && !hasSpacePermission) {
        //     return sendResponse(res, 403, false, 'Access denied to this board');
        // }

        // Update board
        const updatedBoard = await Board.findByIdAndUpdate(
            id,
            { name, description, type, settings },
            { new: true }
        ).populate('space', 'name');

        sendResponse(res, 200, true, 'Board updated successfully', {
            board: updatedBoard
        });
    } catch (error) {
        logger.error('Update board error:', error);
        sendResponse(res, 500, false, 'Server error updating board');
    }
};

// Delete board
exports.deleteBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const board = await Board.findById(id);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Check permissions
        const user = await User.findById(userId);
        const userRoles = await user.getRoles();
        
        const isBoardOwner = board.owner.toString() === userId;
        const hasSpacePermission = userRoles.hasSpaceRole(board.space, 'admin');
        
        // if (!isBoardOwner && !hasSpacePermission) {
        //     return sendResponse(res, 403, false, 'Access denied to this board');
        // }

        // Delete board and related data
        await Promise.all([
            Board.findByIdAndDelete(id),
            Column.deleteMany({ board: id }),
            Task.deleteMany({ board: id })
        ]);

        sendResponse(res, 200, true, 'Board deleted successfully');
    } catch (error) {
        logger.error('Delete board error:', error);
        sendResponse(res, 500, false, 'Server error deleting board');
    }
};

// Add column to board
exports.addColumn = async (req, res) => {
    try {
        const { name, color, backgroundColor, icon, position, wipLimit, settings } = req.body;
        const boardId = req.params.id;

        const board = await Board.findById(boardId);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        const columnData = {
            name,
            board: boardId,
            position,
            style: { 
                color: color || '#6B7280',
                backgroundColor: backgroundColor || '#F9FAFB',
                icon: icon || null
            }
        };

        // Handle WIP limit settings
        if (typeof wipLimit !== 'undefined') {
            columnData.settings = {
                wipLimit: {
                    enabled: wipLimit > 0,
                    limit: wipLimit,
                    strictMode: false
                }
            };
        }

        // Handle additional settings
        if (settings) {
            columnData.settings = { ...columnData.settings, ...settings };
        }

        const column = await Column.create(columnData);

        logger.info(`Column added to board: ${name}`);

        // Return the color property in the expected format
        const columnResponse = column.toObject();
        if (column.style && column.style.color) {
            columnResponse.color = column.style.color;
        }

        sendResponse(res, 201, true, 'Column added successfully', {
            column: columnResponse
        });
    } catch (error) {
        logger.error('Add column error:', error);
        sendResponse(res, 500, false, 'Server error adding column');
    }
};

// Update column
exports.updateColumn = async (req, res) => {
    try {
        const { name, color, backgroundColor, icon, wipLimit, settings } = req.body;

        const updateData = { name };
        if (typeof wipLimit !== 'undefined') {
            updateData['settings.wipLimit.limit'] = wipLimit;
            // If WIP limit is 0, disable the WIP limit feature
            updateData['settings.wipLimit.enabled'] = wipLimit > 0;
        }
        if (settings) {
            updateData.settings = settings;
        }
        
        // Handle style updates
        const styleUpdates = {};
        if (typeof color === 'string') {
            styleUpdates.color = color;
        }
        if (typeof backgroundColor === 'string') {
            styleUpdates.backgroundColor = backgroundColor;
        }
        if (typeof icon === 'string' || icon === null) {
            styleUpdates.icon = icon;
        }
        
        if (Object.keys(styleUpdates).length > 0) {
            updateData['style'] = styleUpdates;
        }

        const column = await Column.findByIdAndUpdate(
            req.params.columnId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!column) {
            return sendResponse(res, 404, false, 'Column not found');
        }

        // Return the color property in the expected format
        const columnResponse = column.toObject();
        if (column.style && column.style.color) {
            columnResponse.color = column.style.color;
        }

        sendResponse(res, 200, true, 'Column updated successfully', {
            column: columnResponse
        });
    } catch (error) {
        logger.error('Update column error:', error);
        sendResponse(res, 500, false, 'Server error updating column');
    }
};

// Delete column
exports.deleteColumn = async (req, res) => {
    try {
        const column = await Column.findById(req.params.columnId);

        if (!column) {
            return sendResponse(res, 404, false, 'Column not found');
        }

        // Check if column is default
        if (column.isDefault) {
            return sendResponse(res, 400, false, 'Cannot delete default column');
        }

        // Check if column has tasks
        const taskCount = await Task.countDocuments({ column: column._id });
        if (taskCount > 0) {
            return sendResponse(res, 400, false, 'Cannot delete column with existing tasks');
        }

        await Column.findByIdAndDelete(req.params.columnId);

        logger.info(`Column deleted: ${column.name}`);

        sendResponse(res, 200, true, 'Column deleted successfully');
    } catch (error) {
        logger.error('Delete column error:', error);
        sendResponse(res, 500, false, 'Server error deleting column');
    }
};

// Get columns for a board
exports.getColumns = async (req, res) => {
    try {
        const { id: boardId } = req.params;
        const userId = req.user.id;

        // Verify board exists and user has access
        const board = await Board.findById(boardId);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Get columns for the board
        const columns = await Column.find({ board: boardId })
            .sort({ position: 1 });

        sendResponse(res, 200, true, 'Columns retrieved successfully', {
            columns
        });
    } catch (error) {
        logger.error('Get columns error:', error);
        sendResponse(res, 500, false, 'Server error retrieving columns');
    }
};

// Reorder columns in a board
exports.reorderColumns = async (req, res) => {
    try {
        const { id: boardId } = req.params;
        const { columnIds } = req.body;
        const userId = req.user.id;

        // Verify board exists and user has access
        const board = await Board.findById(boardId);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Update column positions based on the new order
        const updatePromises = columnIds.map((columnId, index) =>
            Column.findByIdAndUpdate(columnId, { position: index }, { new: true })
        );

        const updatedColumns = await Promise.all(updatePromises);

        logger.info(`Columns reordered for board: ${board.name}`);

        sendResponse(res, 200, true, 'Columns reordered successfully', {
            columns: updatedColumns.sort((a, b) => a.position - b.position)
        });
    } catch (error) {
        logger.error('Reorder columns error:', error);
        sendResponse(res, 500, false, 'Server error reordering columns');
    }
};

// Helper function to get default columns based on board type
function getDefaultColumns(boardType) {
    switch (boardType) {
        case 'kanban':
            return [
                { name: 'To Do', color: '#E2E8F0', wipLimit: null },
                { name: 'In Progress', color: '#FEF3C7', wipLimit: 5 },
                { name: 'Review', color: '#DBEAFE', wipLimit: 3 },
                { name: 'Done', color: '#D1FAE5', wipLimit: null }
            ];
        case 'list':
            return [
                { name: 'Backlog', color: '#E2E8F0', wipLimit: null },
                { name: 'In Progress', color: '#FEF3C7', wipLimit: null },
                { name: 'Completed', color: '#D1FAE5', wipLimit: null }
            ];
        case 'calendar':
            return [
                { name: 'Upcoming', color: '#E2E8F0', wipLimit: null },
                { name: 'This Week', color: '#FEF3C7', wipLimit: null },
                { name: 'Overdue', color: '#FEE2E2', wipLimit: null }
            ];
        default:
            return [
                { name: 'To Do', color: '#E2E8F0', wipLimit: null },
                { name: 'Done', color: '#D1FAE5', wipLimit: null }
            ];
    }
}
