/**
 * Board Validation Schemas
 * Contains all validation rules for board-related endpoints
 */

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

module.exports = {
    createBoardSchema,
    updateBoardSchema,
    addColumnSchema,
    updateColumnSchema
};
