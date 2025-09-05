const mongoose = require('mongoose');
const { sendResponse } = require('../utils/response');

// Helper validation functions
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate date format
const isValidDate = (date) => {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

// Main validation function for individual fields
const validateField = (fieldName, value, rules) => {
    const errors = [];
    
    // Skip validation if value is undefined and field is not required
    if (value === undefined && !rules.required) {
        return errors;
    }
    
    // Required field validation
    if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${fieldName} is required`);
        return errors;
    }
    
    // Skip further validation if value is undefined
    if (value === undefined || value === null) {
        return errors;
    }
    
    // String validation
    if (rules.string) {
        if (typeof value !== 'string') {
            errors.push(`${fieldName} must be a string`);
        } else {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
            }
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${fieldName} format is invalid`);
            }
        }
    }
    
    // Number validation
    if (rules.number) {
        let numValue = value;
        
        // Handle string to number transformation
        if (typeof value === 'string' && rules.transform) {
            numValue = rules.transform(value);
        }
        
        if (isNaN(numValue) || typeof numValue !== 'number') {
            errors.push(`${fieldName} must be a valid number`);
        } else {
            if (rules.min !== undefined && numValue < rules.min) {
                errors.push(`${fieldName} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && numValue > rules.max) {
                errors.push(`${fieldName} must be no more than ${rules.max}`);
            }
        }
    }
    
    // Boolean validation
    if (rules.boolean) {
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push(`${fieldName} must be a boolean`);
        }
    }
    
    // Object validation
    if (rules.object) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            errors.push(`${fieldName} must be an object`);
        }
    }
    
    // Array validation
    if (rules.array) {
        if (!Array.isArray(value)) {
            errors.push(`${fieldName} must be an array`);
        } else {
            if (rules.minItems && value.length < rules.minItems) {
                errors.push(`${fieldName} must have at least ${rules.minItems} items`);
            }
            if (rules.maxItems && value.length > rules.maxItems) {
                errors.push(`${fieldName} must have no more than ${rules.maxItems} items`);
            }
            if (rules.arrayOf) {
                const validTypes = {
                    'string': (item) => typeof item === 'string',
                    'number': (item) => typeof item === 'number' && !isNaN(item),
                    'boolean': (item) => typeof item === 'boolean',
                    'object': (item) => typeof item === 'object' && item !== null && !Array.isArray(item)
                };
                
                const validator = validTypes[rules.arrayOf];
                if (validator) {
                    const invalidItems = value.filter(item => !validator(item));
                    if (invalidItems.length > 0) {
                        errors.push(`${fieldName} must contain only ${rules.arrayOf} values`);
                    }
                }
            }
        }
    }
    
    // Enum validation
    if (rules.enum) {
        if (!rules.enum.includes(value)) {
            errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`);
        }
    }
    
    // ObjectId validation
    if (rules.objectId) {
        if (!isValidObjectId(value)) {
            errors.push(`${fieldName} must be a valid ObjectId`);
        }
    }
    
    // Date validation
    if (rules.date) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            errors.push(`${fieldName} must be a valid date`);
        }
    }
    
    // Email validation
    if (rules.email) {
        if (!isValidEmail(value)) {
            errors.push(`${fieldName} must be a valid email address`);
        }
    }
    
    return errors;
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

// Middleware for validating request body
const validateBody = (schema) => {
    return (req, res, next) => {
        const { body } = req;
        const errors = [];

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

module.exports = {
    validateQuery,
    validateParams,
    validateBody,
    isValidObjectId,
    isValidEmail,
    isValidDate
};
