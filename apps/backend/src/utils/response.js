/**
 * Standardized API response utility
 */

// Send standardized JSON response
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };

    // Add data if provided
    if (data !== null) {
        response.data = data;
    }

    // Add metadata if provided (pagination, etc.)
    if (meta !== null) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

// Success response helpers
const success = (res, message = 'Success', data = null, meta = null) => {
    return sendResponse(res, 200, true, message, data, meta);
};

const created = (res, message = 'Resource created successfully', data = null) => {
    return sendResponse(res, 201, true, message, data);
};

const noContent = (res, message = 'No content') => {
    return sendResponse(res, 204, true, message);
};

// Error response helpers
const badRequest = (res, message = 'Bad request', errors = null) => {
    const data = errors ? { errors } : null;
    return sendResponse(res, 400, false, message, data);
};

const unauthorized = (res, message = 'Unauthorized') => {
    return sendResponse(res, 401, false, message);
};

const forbidden = (res, message = 'Forbidden') => {
    return sendResponse(res, 403, false, message);
};

const notFound = (res, message = 'Resource not found') => {
    return sendResponse(res, 404, false, message);
};

const conflict = (res, message = 'Conflict') => {
    return sendResponse(res, 409, false, message);
};

const validationError = (res, errors, message = 'Validation failed') => {
    return sendResponse(res, 422, false, message, { errors });
};

const tooManyRequests = (res, message = 'Too many requests') => {
    return sendResponse(res, 429, false, message);
};

const serverError = (res, message = 'Internal server error') => {
    return sendResponse(res, 500, false, message);
};

// Paginated response helper
const paginated = (res, data, pagination, message = 'Data retrieved successfully') => {
    const meta = {
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
            hasPrevPage: pagination.page > 1
        }
    };

    return sendResponse(res, 200, true, message, data, meta);
};

// Generic error response with proper error handling
const handleError = (res, error, defaultMessage = 'An error occurred') => {
    // Development vs Production error handling
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    let statusCode = 500;
    let message = defaultMessage;
    let data = null;

    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        data = {
            errors: Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }))
        };
    } else if (error.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    } else if (error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate entry';
        const field = Object.keys(error.keyValue)[0];
        data = { field, message: `${field} already exists` };
    } else if (error.statusCode) {
        statusCode = error.statusCode;
        message = error.message;
    } else if (error.message) {
        message = error.message;
    }

    // Include stack trace in development
    if (isDevelopment) {
        data = {
            ...data,
            stack: error.stack,
            name: error.name
        };
    }

    return sendResponse(res, statusCode, false, message, data);
};

// API versioning helper
const versionedResponse = (res, version, data, message = 'Success') => {
    const response = {
        version,
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
};

// Response with cache headers
const cachedResponse = (res, data, cacheTime = 300, message = 'Success') => {
    res.set({
        'Cache-Control': `public, max-age=${cacheTime}`,
        'ETag': `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`
    });

    return sendResponse(res, 200, true, message, data);
};

// JSONP response helper
const jsonpResponse = (res, data, callback, message = 'Success') => {
    const response = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };

    if (callback) {
        return res.jsonp(response);
    }

    return res.json(response);
};

// Stream response helper for large data
const streamResponse = (res, stream, contentType = 'application/octet-stream') => {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Transfer-Encoding', 'chunked');
    
    return stream.pipe(res);
};

module.exports = {
    sendResponse,
    success,
    created,
    noContent,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    validationError,
    tooManyRequests,
    serverError,
    paginated,
    handleError,
    versionedResponse,
    cachedResponse,
    jsonpResponse,
    streamResponse
};
