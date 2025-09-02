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
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    if (meta !== null) {
        response.meta = meta;
    }

    return res.status(200).json(response);
};

const created = (res, message = 'Resource created successfully', data = null) => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(201).json(response);
};

const noContent = (res, message = 'No content') => {
    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(204).json(response);
};

// Error response helpers
const badRequest = (res, message = 'Bad request', errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (errors) {
        response.data = { errors };
    }

    return res.status(400).json(response);
};

const unauthorized = (res, message = 'Unauthorized') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(401).json(response);
};

const forbidden = (res, message = 'Forbidden') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(403).json(response);
};

const notFound = (res, message = 'Resource not found') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(404).json(response);
};

const conflict = (res, message = 'Conflict') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(409).json(response);
};

const validationError = (res, errors, message = 'Validation failed') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        data: { errors }
    };

    return res.status(422).json(response);
};

const tooManyRequests = (res, message = 'Too many requests') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(429).json(response);
};

const serverError = (res, message = 'Internal server error') => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    return res.status(500).json(response);
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

    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString(),
        data,
        meta
    };

    return res.status(200).json(response);
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

    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
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

    const response = {
        success: true,
        message,
        timestamp: new Date().toISOString(),
        data
    };

    return res.status(200).json(response);
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
