/**
 * AI Validation Schemas
 * Contains all validation rules for AI-related endpoints
 */

const taskSuggestionsSchema = {
    spaceGoal: { required: true, minLength: 10, maxLength: 1000 },
    spaceContext: { maxLength: 2000 },
    boardType: { enum: ['kanban', 'list', 'calendar', 'timeline'], default: 'kanban' }
};

const naturalLanguageSchema = {
    input: { required: true, minLength: 3, maxLength: 500 },
    boardId: { required: true, objectId: true }
};

const timelineSchema = {
    startDate: { date: true },
    targetEndDate: { date: true },
    priorities: { array: true }
};

const taskDescriptionSchema = {
    title: { required: true, minLength: 2, maxLength: 200 },
    spaceContext: { maxLength: 500 },
    taskType: { maxLength: 100 }
};

module.exports = {
    taskSuggestionsSchema,
    naturalLanguageSchema,
    timelineSchema,
    taskDescriptionSchema
};
