const { body, validationResult } = require('express-validator');
const { sendResponse } = require('../utils/responseHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
    return sendResponse(res, 400, false, 'Validation failed', null, errorMessages);
  }
  next();
};

// Admin creation validation
const validateAdminCreation = [
  body('userName')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('userEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .isIn(['super_admin', 'admin', 'moderator', 'viewer'])
    .withMessage('Invalid role. Must be one of: super_admin, admin, moderator, viewer'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  
  body('permissions.*.name')
    .optional()
    .isString()
    .withMessage('Permission name must be a string'),
  
  body('permissions.*.allowed')
    .optional()
    .isBoolean()
    .withMessage('Permission allowed must be a boolean'),
  
  handleValidationErrors
];

// Admin update validation
const validateAdminUpdate = [
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('userEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'moderator', 'viewer'])
    .withMessage('Invalid role. Must be one of: super_admin, admin, moderator, viewer'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Current password is required when changing your own password'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

module.exports = {
  validateAdminCreation,
  validateAdminUpdate,
  validatePasswordChange,
  handleValidationErrors
};
