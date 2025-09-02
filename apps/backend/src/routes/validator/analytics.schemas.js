/**
 * Analytics Validation Schemas
 * Contains all validation rules for analytics-related endpoints
 */

const generateAnalyticsSchema = {
    periodType: { enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'] },
    startDate: { date: true },
    endDate: { date: true },
    includeAI: { boolean: true }
};

module.exports = {
    generateAnalyticsSchema
};
