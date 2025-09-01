/**
 * Checklist Validation Schemas
 * Contains all validation rules for checklist-related endpoints
 */

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

module.exports = {
    createChecklistSchema,
    updateChecklistSchema,
    addItemSchema,
    updateItemSchema,
    reorderItemsSchema
};
