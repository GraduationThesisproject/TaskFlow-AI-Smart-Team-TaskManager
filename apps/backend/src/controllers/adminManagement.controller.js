const Admin = require('../models/Admin');
const { sendResponse } = require('../utils/responseHandler');
const logger = require('../config/logger');

/**
 * Admin Management Controller
 * Handles CRUD operations for admin users
 */

// Create a new admin user
const createAdmin = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      notes,
      permissions
    } = req.body;

    // Check if current user has permission to create admins
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to create admin users');
    }

    // Check if email already exists
    const existingAdmin = await Admin.findByEmail(userEmail);
    if (existingAdmin) {
      return sendResponse(res, 400, false, 'Admin with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await Admin.findByUsername(userName);
    if (existingUsername) {
      return sendResponse(res, 400, false, 'Admin with this username already exists');
    }

    // Get default permissions for the role
    const defaultPermissions = Admin.getDefaultPermissions(role);
    
    // Merge default permissions with custom permissions if provided
    const finalPermissions = permissions ? 
      defaultPermissions.map(defaultPerm => {
        const customPerm = permissions.find(p => p.name === defaultPerm.name);
        return customPerm ? { ...defaultPerm, allowed: customPerm.allowed } : defaultPerm;
      }) : defaultPermissions;

    // Create new admin
    const newAdmin = new Admin({
      userName,
      userEmail,
      password,
      role,
      firstName,
      lastName,
      phoneNumber,
      notes,
      permissions: finalPermissions,
      createdBy: req.admin._id
    });

    await newAdmin.save();

    // Remove password from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    logger.info(`Admin user created: ${userEmail} by ${req.admin.userEmail}`);

    sendResponse(res, 201, true, 'Admin user created successfully', {
      admin: adminResponse
    });

  } catch (error) {
    logger.error('Error creating admin user:', error);
    sendResponse(res, 500, false, 'Failed to create admin user', null, error.message);
  }
};

// Get all admin users
const getAllAdmins = async (req, res) => {
  try {
    // Check if current user has permission to view admins
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to view admin users');
    }

    const { role, isActive, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const admins = await Admin.find(query)
      .select('-password -twoFactorSecret -backupCodes -recoveryToken')
      .populate('createdBy', 'userName userEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(query);

    sendResponse(res, 200, true, 'Admin users retrieved successfully', {
      admins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error retrieving admin users:', error);
    sendResponse(res, 500, false, 'Failed to retrieve admin users', null, error.message);
  }
};

// Get admin user by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if current user has permission to view admins
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to view admin users');
    }

    const admin = await Admin.findById(id)
      .select('-password -twoFactorSecret -backupCodes -recoveryToken')
      .populate('createdBy', 'userName userEmail');

    if (!admin) {
      return sendResponse(res, 404, false, 'Admin user not found');
    }

    sendResponse(res, 200, true, 'Admin user retrieved successfully', {
      admin
    });

  } catch (error) {
    logger.error('Error retrieving admin user:', error);
    sendResponse(res, 500, false, 'Failed to retrieve admin user', null, error.message);
  }
};

// Update admin user
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if current user has permission to update admins
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to update admin users');
    }

    // Prevent updating own role to prevent privilege escalation
    if (id === req.admin._id.toString() && updateData.role) {
      return sendResponse(res, 400, false, 'Cannot change your own role');
    }

    // Check if email already exists (if updating email)
    if (updateData.userEmail) {
      const existingAdmin = await Admin.findOne({ 
        userEmail: updateData.userEmail, 
        _id: { $ne: id } 
      });
      if (existingAdmin) {
        return sendResponse(res, 400, false, 'Admin with this email already exists');
      }
    }

    // Check if username already exists (if updating username)
    if (updateData.userName) {
      const existingAdmin = await Admin.findOne({ 
        userName: updateData.userName, 
        _id: { $ne: id } 
      });
      if (existingAdmin) {
        return sendResponse(res, 400, false, 'Admin with this username already exists');
      }
    }

    // If updating role, update permissions accordingly
    if (updateData.role) {
      const defaultPermissions = Admin.getDefaultPermissions(updateData.role);
      updateData.permissions = defaultPermissions;
    }

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.twoFactorSecret;
    delete updateData.backupCodes;
    delete updateData.recoveryToken;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -backupCodes -recoveryToken');

    if (!updatedAdmin) {
      return sendResponse(res, 404, false, 'Admin user not found');
    }

    logger.info(`Admin user updated: ${updatedAdmin.userEmail} by ${req.admin.userEmail}`);

    sendResponse(res, 200, true, 'Admin user updated successfully', {
      admin: updatedAdmin
    });

  } catch (error) {
    logger.error('Error updating admin user:', error);
    sendResponse(res, 500, false, 'Failed to update admin user', null, error.message);
  }
};

// Delete admin user
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if current user has permission to delete admins
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to delete admin users');
    }

    // Prevent deleting own account
    if (id === req.admin._id.toString()) {
      return sendResponse(res, 400, false, 'Cannot delete your own account');
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin user not found');
    }

    // Prevent deleting super_admin users
    if (admin.role === 'super_admin') {
      return sendResponse(res, 400, false, 'Cannot delete super admin users');
    }

    await Admin.findByIdAndDelete(id);

    logger.info(`Admin user deleted: ${admin.userEmail} by ${req.admin.userEmail}`);

    sendResponse(res, 200, true, 'Admin user deleted successfully');

  } catch (error) {
    logger.error('Error deleting admin user:', error);
    sendResponse(res, 500, false, 'Failed to delete admin user', null, error.message);
  }
};

// Change admin password
const changeAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check if current user has permission to change admin passwords
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to change admin passwords');
    }

    const admin = await Admin.findById(id).select('+password');
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin user not found');
    }

    // If changing own password, verify current password
    if (id === req.admin._id.toString()) {
      if (!currentPassword) {
        return sendResponse(res, 400, false, 'Current password is required');
      }
      
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return sendResponse(res, 400, false, 'Current password is incorrect');
      }
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    logger.info(`Admin password changed: ${admin.userEmail} by ${req.admin.userEmail}`);

    sendResponse(res, 200, true, 'Admin password changed successfully');

  } catch (error) {
    logger.error('Error changing admin password:', error);
    sendResponse(res, 500, false, 'Failed to change admin password', null, error.message);
  }
};

// Toggle admin status (activate/deactivate)
const toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if current user has permission to manage admins
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to manage admin users');
    }

    // Prevent deactivating own account
    if (id === req.admin._id.toString()) {
      return sendResponse(res, 400, false, 'Cannot deactivate your own account');
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin user not found');
    }

    // Prevent deactivating super_admin users
    if (admin.role === 'super_admin') {
      return sendResponse(res, 400, false, 'Cannot deactivate super admin users');
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    const status = admin.isActive ? 'activated' : 'deactivated';
    logger.info(`Admin user ${status}: ${admin.userEmail} by ${req.admin.userEmail}`);

    sendResponse(res, 200, true, `Admin user ${status} successfully`, {
      admin: {
        _id: admin._id,
        userName: admin.userName,
        userEmail: admin.userEmail,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    logger.error('Error toggling admin status:', error);
    sendResponse(res, 500, false, 'Failed to toggle admin status', null, error.message);
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    // Check if current user has permission to view admin stats
    if (!req.admin.hasPermission('admin_management')) {
      return sendResponse(res, 403, false, 'Insufficient permissions to view admin statistics');
    }

    const stats = await Admin.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          byRole: {
            $push: {
              role: '$role',
              isActive: '$isActive'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          active: 1,
          inactive: 1,
          roleBreakdown: {
            $reduce: {
              input: '$byRole',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $cond: [
                      { $eq: ['$$this.isActive', true] },
                      {
                        $mergeObjects: [
                          '$$value',
                          {
                            $literal: {
                              $concat: ['$$this.role', '_active']
                            }
                          }
                        ]
                      },
                      {
                        $mergeObjects: [
                          '$$value',
                          {
                            $literal: {
                              $concat: ['$$this.role', '_inactive']
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    // Process role breakdown
    const roleBreakdown = {};
    if (stats.length > 0) {
      const byRole = stats[0].byRole;
      byRole.forEach(item => {
        const key = `${item.role}_${item.isActive ? 'active' : 'inactive'}`;
        roleBreakdown[key] = (roleBreakdown[key] || 0) + 1;
      });
    }

    const result = {
      total: stats[0]?.total || 0,
      active: stats[0]?.active || 0,
      inactive: stats[0]?.inactive || 0,
      roleBreakdown
    };

    sendResponse(res, 200, true, 'Admin statistics retrieved successfully', {
      stats: result
    });

  } catch (error) {
    logger.error('Error retrieving admin statistics:', error);
    sendResponse(res, 500, false, 'Failed to retrieve admin statistics', null, error.message);
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  changeAdminPassword,
  toggleAdminStatus,
  getAdminStats
};
