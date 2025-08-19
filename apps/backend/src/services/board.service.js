const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');

class BoardService {
    // Get board statistics
    async getBoardStats(boardId) {
        const [
            totalTasks,
            completedTasks,
            columns
        ] = await Promise.all([
            Task.countDocuments({ board: boardId, archived: false }),
            Task.countDocuments({ board: boardId, status: 'completed', archived: false }),
            Column.find({ board: boardId }).sort({ position: 1 })
        ]);

        // Get task distribution by column
        const columnStats = await Promise.all(
            columns.map(async (column) => {
                const taskCount = await Task.countDocuments({ 
                    column: column._id, 
                    archived: false 
                });
                
                return {
                    columnId: column._id,
                    name: column.name,
                    taskCount,
                    wipLimit: column.wipLimit,
                    isOverLimit: column.wipLimit && taskCount > column.wipLimit
                };
            })
        );

        return {
            totalTasks,
            completedTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            columnStats
        };
    }

    // Reorder columns
    async reorderColumns(boardId, columnOrders) {
        const updates = columnOrders.map(({ columnId, position }) =>
            Column.findByIdAndUpdate(columnId, { position }, { new: true })
        );

        await Promise.all(updates);
        
        return await Column.find({ board: boardId }).sort({ position: 1 });
    }

    // Reorder tasks within a column
    async reorderTasks(columnId, taskOrders) {
        const updates = taskOrders.map(({ taskId, position }) =>
            Task.findByIdAndUpdate(taskId, { position }, { new: true })
        );

        await Promise.all(updates);
        
        return await Task.find({ column: columnId }).sort({ position: 1 });
    }

    // Move task between columns
    async moveTaskBetweenColumns(taskId, sourceColumnId, targetColumnId, targetPosition) {
        const task = await Task.findById(taskId);
        
        if (!task) {
            throw new Error('Task not found');
        }

        // Update task column and position
        task.column = targetColumnId;
        task.position = targetPosition;
        
        // Auto-update status based on column (if configured)
        const targetColumn = await Column.findById(targetColumnId);
        if (targetColumn.name.toLowerCase().includes('done') || 
            targetColumn.name.toLowerCase().includes('completed')) {
            task.status = 'completed';
            task.completedAt = new Date();
        } else if (targetColumn.name.toLowerCase().includes('progress')) {
            task.status = 'in-progress';
        } else {
            task.status = 'todo';
        }

        await task.save();

        // Reorder other tasks in the target column
        const targetColumnTasks = await Task.find({ 
            column: targetColumnId,
            _id: { $ne: taskId }
        }).sort({ position: 1 });

        // Update positions of other tasks
        const updates = targetColumnTasks.map((t, index) => {
            const newPosition = index >= targetPosition ? index + 1 : index;
            return Task.findByIdAndUpdate(t._id, { position: newPosition });
        });

        await Promise.all(updates);

        return task;
    }

    // Bulk move tasks
    async bulkMoveTasks(taskIds, targetColumnId) {
        const tasks = await Task.find({ _id: { $in: taskIds } });
        
        if (tasks.length !== taskIds.length) {
            throw new Error('Some tasks not found');
        }

        // Get next available positions in target column
        const lastTask = await Task.findOne({ column: targetColumnId })
            .sort({ position: -1 });
        
        let nextPosition = lastTask ? lastTask.position + 1 : 0;

        const updates = tasks.map((task) => {
            task.column = targetColumnId;
            task.position = nextPosition++;
            return task.save();
        });

        await Promise.all(updates);

        return tasks;
    }

    // Archive board
    async archiveBoard(boardId) {
        const board = await Board.findById(boardId);
        
        if (!board) {
            throw new Error('Board not found');
        }

        board.archived = true;
        board.archivedAt = new Date();
        
        await board.save();

        // Archive all tasks in the board
        await Task.updateMany(
            { board: boardId },
            { archived: true, archivedAt: new Date() }
        );

        return board;
    }

    // Restore archived board
    async restoreBoard(boardId) {
        const board = await Board.findById(boardId);
        
        if (!board) {
            throw new Error('Board not found');
        }

        board.archived = false;
        board.archivedAt = undefined;
        
        await board.save();

        // Restore all tasks in the board
        await Task.updateMany(
            { board: boardId },
            { $unset: { archived: 1, archivedAt: 1 } }
        );

        return board;
    }

    // Clone board
    async cloneBoard(boardId, newBoardName, targetSpaceId) {
        const originalBoard = await Board.findById(boardId);
        
        if (!originalBoard) {
            throw new Error('Board not found');
        }

        // Create new board
        const newBoard = await Board.create({
            name: newBoardName,
            description: originalBoard.description,
            type: originalBoard.type,
            space: targetSpaceId || originalBoard.space,
            settings: originalBoard.settings
        });

        // Clone columns
        const columns = await Column.find({ board: boardId }).sort({ position: 1 });
        const columnMap = new Map();

        for (const column of columns) {
            const newColumn = await Column.create({
                name: column.name,
                board: newBoard._id,
                position: column.position,
                color: column.color,
                wipLimit: column.wipLimit
            });
            
            columnMap.set(column._id.toString(), newColumn._id);
        }

        // Clone tasks
        const tasks = await Task.find({ board: boardId }).sort({ position: 1 });
        
        for (const task of tasks) {
            await Task.create({
                title: task.title,
                description: task.description,
                board: newBoard._id,
                column: columnMap.get(task.column.toString()),
                position: task.position,
                priority: task.priority,
                labels: task.labels,
                dueDate: task.dueDate,
                estimatedHours: task.estimatedHours
            });
        }

        return newBoard;
    }

    // Get board activity
    async getBoardActivity(boardId, limit = 20) {
        const tasks = await Task.find({ board: boardId })
            .populate('reporter', 'name avatar')
            .populate('assignees', 'name avatar')
            .sort({ updatedAt: -1 })
            .limit(limit);

        const Comment = require('../models/Comment');
        const comments = await Comment.find({ task: { $in: tasks.map(t => t._id) } })
            .populate('author', 'name avatar')
            .populate('task', 'title')
            .sort({ createdAt: -1 })
            .limit(limit);

        const activities = [
            ...tasks.map(task => ({
                type: 'task',
                action: 'updated',
                data: task,
                timestamp: task.updatedAt
            })),
            ...comments.map(comment => ({
                type: 'comment',
                action: 'added',
                data: comment,
                timestamp: comment.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return activities.slice(0, limit);
    }
}

module.exports = new BoardService();
