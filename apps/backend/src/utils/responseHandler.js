/**
 * Response Handler Utility
 * Provides standardized API response formatting for consistent API responses
 */

/**
 * Send a standardized API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {*} data - Response data (optional)
 * @param {string} error - Error details (optional)
 */
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  // Add data if provided
  if (data !== null) {
    response.data = data;
  }

  // Add error details if provided
  if (error !== null) {
    response.error = error;
  }

  // Set status code and send response
  res.status(statusCode).json(response);
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Response data (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  sendResponse(res, statusCode, true, message, data);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} error - Error details (optional)
 */
const sendError = (res, statusCode, message, error = null) => {
  sendResponse(res, statusCode, false, message, null, error);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @param {Array} errors - Validation errors array
 */
const sendValidationError = (res, message, errors) => {
  sendResponse(res, 400, false, message, null, {
    type: 'validation_error',
    details: errors
  });
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const sendNotFound = (res, message = 'Resource not found') => {
  sendError(res, 404, message);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  sendError(res, 401, message);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  sendError(res, 403, message);
};

/**
 * Send internal server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {string} error - Error details (optional)
 */
const sendInternalError = (res, message = 'Internal server error', error = null) => {
  sendError(res, 500, message, error);
};

/**
 * Send bad request response
 * @param {Object} res - Express response object
 * @param {string} message - Bad request message
 * @param {string} error - Error details (optional)
 */
const sendBadRequest = (res, message = 'Bad request', error = null) => {
  sendError(res, 400, message, error);
};

/**
 * Send conflict response (for duplicate resources)
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 * @param {string} error - Error details (optional)
 */
const sendConflict = (res, message = 'Resource conflict', error = null) => {
  sendError(res, 409, message, error);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {string} message - Created message
 * @param {*} data - Created resource data
 */
const sendCreated = (res, message, data) => {
  sendSuccess(res, message, data, 201);
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
  res.status(204).end();
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination metadata
 */
const sendPaginated = (res, message, items, pagination) => {
  sendSuccess(res, message, {
    items,
    pagination
  });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendInternalError,
  sendBadRequest,
  sendConflict,
  sendCreated,
  sendNoContent,
  sendPaginated
};
