const logger = require('../config/logger');
const { sendResponse } = require('../utils/response');

// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error(err.message, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        user: req.user?.id
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        return sendResponse(res, 404, false, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        return sendResponse(res, 400, false, message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
        
        return sendResponse(res, 400, false, 'Validation Error', { errors });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendResponse(res, 401, false, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return sendResponse(res, 401, false, 'Token expired');
    }

    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_TOO_LARGE') {
        return sendResponse(res, 400, false, 'File too large');
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        return sendResponse(res, 400, false, 'Too many files');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return sendResponse(res, 400, false, 'Unexpected file field');
    }

    // Default to 500 server error
    return sendResponse(
        res, 
        error.statusCode || 500, 
        false, 
        error.message || 'Internal Server Error'
    );
};

// Async error handler wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = {
    errorMiddleware,
    asyncHandler,
    notFound
};

// Export errorMiddleware as default
module.exports.default = errorMiddleware;
module.exports = errorMiddleware;
