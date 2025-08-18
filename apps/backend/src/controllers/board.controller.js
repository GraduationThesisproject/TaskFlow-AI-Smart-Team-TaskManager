const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Get all boards for project
exports.getBoards = async (req, res) => {
    try {
        const { projectId } = req.params;

        const boards = await Board.find({ 
            project: projectId,
            archived: false
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
            .populate('space', 'name')
            .populate('project', 'name');

        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Get columns with tasks
        const columns = await Column.find({ board: board._id })
            .sort({ position: 1 });

        const tasks = await Task.find({ 
            board: board._id,
            archived: false
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
            board: boardData
        });
    } catch (error) {
        logger.error('Get board error:', error);
        sendResponse(res, 500, false, 'Server error retrieving board');
    }
};

// Create new board
exports.createBoard = async (req, res) => {
    try {
        const { name, description, type, spaceId, projectId } = req.body;

        const board = await Board.create({
            name,
            description,
            type,
            space: spaceId,
            project: projectId
        });

        // Create default columns for kanban boards
        if (type === 'kanban') {
            const defaultColumns = [
                { name: 'To Do', position: 0, color: '#6B7280' },
                { name: 'In Progress', position: 1, color: '#3B82F6' },
                { name: 'Done', position: 2, color: '#10B981' }
            ];

            for (const columnData of defaultColumns) {
                await Column.create({
                    ...columnData,
                    board: board._id
                });
            }
        }

        await board.populate('space', 'name');

        logger.info(`Board created: ${name}`);

        sendResponse(res, 201, true, 'Board created successfully', {
            board
        });
    } catch (error) {
        logger.error('Create board error:', error);
        sendResponse(res, 500, false, 'Server error creating board');
    }
};

// Update board
exports.updateBoard = async (req, res) => {
    try {
        const { name, description, settings } = req.body;

        const board = await Board.findByIdAndUpdate(
            req.params.id,
            { name, description, settings },
            { new: true, runValidators: true }
        ).populate('space', 'name');

        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        logger.info(`Board updated: ${board.name}`);

        sendResponse(res, 200, true, 'Board updated successfully', {
            board
        });
    } catch (error) {
        logger.error('Update board error:', error);
        sendResponse(res, 500, false, 'Server error updating board');
    }
};

// Delete board
exports.deleteBoard = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        // Delete all columns and tasks associated with this board
        await Column.deleteMany({ board: board._id });
        await Task.deleteMany({ board: board._id });
        await Board.findByIdAndDelete(req.params.id);

        logger.info(`Board deleted: ${board.name}`);

        sendResponse(res, 200, true, 'Board deleted successfully');
    } catch (error) {
        logger.error('Delete board error:', error);
        sendResponse(res, 500, false, 'Server error deleting board');
    }
};

// Add column to board
exports.addColumn = async (req, res) => {
    try {
        const { name, color, position } = req.body;
        const boardId = req.params.id;

        const board = await Board.findById(boardId);
        if (!board) {
            return sendResponse(res, 404, false, 'Board not found');
        }

        const column = await Column.create({
            name,
            color,
            position,
            board: boardId
        });

        logger.info(`Column added to board: ${name}`);

        sendResponse(res, 201, true, 'Column added successfully', {
            column
        });
    } catch (error) {
        logger.error('Add column error:', error);
        sendResponse(res, 500, false, 'Server error adding column');
    }
};

// Update column
exports.updateColumn = async (req, res) => {
    try {
        const { name, color, wipLimit } = req.body;

        const column = await Column.findByIdAndUpdate(
            req.params.columnId,
            { name, color, wipLimit },
            { new: true, runValidators: true }
        );

        if (!column) {
            return sendResponse(res, 404, false, 'Column not found');
        }

        sendResponse(res, 200, true, 'Column updated successfully', {
            column
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
