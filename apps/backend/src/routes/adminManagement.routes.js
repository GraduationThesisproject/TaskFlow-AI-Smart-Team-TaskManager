const express = require('express');
const router = express.Router();
const adminManagementController = require('../controllers/adminManagement.controller');
const { authenticateAdmin } = require('../middlewares/adminAuth.middleware');
const { validateAdminCreation, validateAdminUpdate } = require('../middlewares/validation');

/**
 * Admin Management Routes
 * All routes require admin authentication and admin_management permission
 */

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// Create new admin user
router.post('/create', validateAdminCreation, adminManagementController.createAdmin);

// Get all admin users with pagination and filtering
router.get('/list', adminManagementController.getAllAdmins);

// Get admin user by ID
router.get('/:id', adminManagementController.getAdminById);

// Update admin user
router.put('/:id', validateAdminUpdate, adminManagementController.updateAdmin);

// Delete admin user
router.delete('/:id', adminManagementController.deleteAdmin);

// Change admin password
router.patch('/:id/password', adminManagementController.changeAdminPassword);

// Toggle admin status (activate/deactivate)
router.patch('/:id/toggle-status', adminManagementController.toggleAdminStatus);

// Get admin statistics
router.get('/stats/overview', adminManagementController.getAdminStats);

module.exports = router;
