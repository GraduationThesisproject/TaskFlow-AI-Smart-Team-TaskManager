const { sendResponse } = require('../utils/response');
const mongoose = require('mongoose');

// Main validation middleware factory
const validateMiddleware = (schema) => {
    return (req, res, next) => {
        const { body } = req;
        const errors = [];

        // Validate each field in the schema
        for (const [fieldName, rules] of Object.entries(schema)) {
            const value = body[fieldName];
            const fieldErrors = validateField(fieldName, value, rules);
            
            if (fieldErrors.length > 0) {
                errors.push(...fieldErrors);
            }
        }

        if (errors.length > 0) {
            return sendResponse(res, 400, false, 'Validation failed', {
                errors
            });
        }

        next();
    };
};

// Validate individual field
const validateField = (fieldName, value, rules) => {
    const errors = [];

    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
            field: fieldName,
            message: `${fieldName} is required`
        });
        return errors; // Stop further validation if required field is missing
    }

    // Skip other validations if field is not provided and not required
    if (value === undefined || value === null || value === '') {
        return errors;
    }

    // Type validations
    if (rules.string && typeof value !== 'string') {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be a string`
        });
    }

    if (rules.number && typeof value !== 'number') {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be a number`
        });
    }

    if (rules.boolean && typeof value !== 'boolean') {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be a boolean`
        });
    }

    if (rules.array && !Array.isArray(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be an array`
        });
    }

    if (rules.date && !isValidDate(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid date`
        });
    }

    if (rules.email && !isValidEmail(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid email address`
        });
    }

    if (rules.objectId && !isValidObjectId(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be a valid ObjectId`
        });
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be at least ${rules.minLength} characters long`
        });
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must not exceed ${rules.maxLength} characters`
        });
    }

    // Number range validations
    if (rules.min !== undefined && value < rules.min) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be at least ${rules.min}`
        });
    }

    if (rules.max !== undefined && value > rules.max) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must not exceed ${rules.max}`
        });
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} must be one of: ${rules.enum.join(', ')}`
        });
    }

    // Pattern validation
    if (rules.pattern && rules.pattern instanceof RegExp && !rules.pattern.test(value)) {
        errors.push({
            field: fieldName,
            message: `${fieldName} format is invalid`
        });
    }

    // Array validations
    if (rules.array && Array.isArray(value)) {
        if (rules.minItems && value.length < rules.minItems) {
            errors.push({
                field: fieldName,
                message: `${fieldName} must have at least ${rules.minItems} items`
            });
        }

        if (rules.maxItems && value.length > rules.maxItems) {
            errors.push({
                field: fieldName,
                message: `${fieldName} must have no more than ${rules.maxItems} items`
            });
        }

        // Validate array items
        if (rules.arrayOf) {
            value.forEach((item, index) => {
                const itemErrors = validateArrayItem(fieldName, item, index, rules.arrayOf);
                errors.push(...itemErrors);
            });
        }
    }

    return errors;
};

// Validate array items
const validateArrayItem = (fieldName, item, index, type) => {
    const errors = [];

    switch (type) {
        case 'string':
            if (typeof item !== 'string') {
                errors.push({
                    field: `${fieldName}[${index}]`,
                    message: `${fieldName}[${index}] must be a string`
                });
            }
            break;
        case 'number':
            if (typeof item !== 'number') {
                errors.push({
                    field: `${fieldName}[${index}]`,
                    message: `${fieldName}[${index}] must be a number`
                });
            }
            break;
        case 'objectId':
            if (!isValidObjectId(item)) {
                errors.push({
                    field: `${fieldName}[${index}]`,
                    message: `${fieldName}[${index}] must be a valid ObjectId`
                });
            }
            break;
        default:
            break;
    }

    return errors;
};

// Helper validation functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidDate = (date) => {
    if (typeof date === 'string') {
        return !isNaN(Date.parse(date));
    }
    return date instanceof Date && !isNaN(date);
};

const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Middleware for validating query parameters
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { query } = req;
        const errors = [];

        for (const [fieldName, rules] of Object.entries(schema)) {
            const value = query[fieldName];
            const fieldErrors = validateField(fieldName, value, rules);
            
            if (fieldErrors.length > 0) {
                errors.push(...fieldErrors);
            }
        }

        if (errors.length > 0) {
            return sendResponse(res, 400, false, 'Query validation failed', {
                errors
            });
        }

        next();
    };
};

// Middleware for validating URL parameters
const validateParams = (schema) => {
    return (req, res, next) => {
        const { params } = req;
        const errors = [];

        for (const [fieldName, rules] of Object.entries(schema)) {
            const value = params[fieldName];
            const fieldErrors = validateField(fieldName, value, rules);
            
            if (fieldErrors.length > 0) {
                errors.push(...fieldErrors);
            }
        }

        if (errors.length > 0) {
            return sendResponse(res, 400, false, 'Parameter validation failed', {
                errors
            });
        }

        next();
    };
};

module.exports = validateMiddleware;
module.exports.validateQuery = validateQuery;
module.exports.validateParams = validateParams;
module.exports.isValidObjectId = isValidObjectId;
module.exports.isValidEmail = isValidEmail;
module.exports.isValidDate = isValidDate;
