const Admin = require('../models/Admin');
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const { generateToken } = require('../utils/jwt');

// Admin Authentication
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Check if user is admin
    const admin = await Admin.findOne({ userId: user._id, isActive: true });
    if (!admin) {
      return sendResponse(res, 403, false, 'Access denied. Admin privileges required.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Update admin activity
    admin.updateActivity();

    // Return admin info and token
    const adminResponse = {
      admin: {
        id: admin._id,
        userId: admin.userId,
        name: user.name,
        email: user.email,
        role: admin.role,
        permissions: admin.permissions,
        avatar: user.avatar,
        isActive: admin.isActive,
        lastActivity: admin.lastActivity
      },
      token
    };

    sendResponse(res, 200, true, 'Login successful', adminResponse);
  } catch (error) {
    logger.error('Admin login error:', error);
    sendResponse(res, 500, false, 'Server error during login');
  }
};

const logout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    sendResponse(res, 200, true, 'Logout successful');
  } catch (error) {
    logger.error('Admin logout error:', error);
    sendResponse(res, 500, false, 'Server error during logout');
  }
};

const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({ userId: req.user.id, isActive: true })
      .populate('userId', 'name email avatar');

    if (!admin) {
      return sendResponse(res, 404, false, 'Admin not found');
    }

    const adminResponse = {
      admin: {
        id: admin._id,
        userId: admin.userId._id,
        name: admin.userId.name,
        email: admin.userId.email,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.userId.avatar,
        isActive: admin.isActive,
        lastActivity: admin.lastActivity
      }
    };

    sendResponse(res, 200, true, 'Admin info retrieved successfully', adminResponse);
  } catch (error) {
    logger.error('Get current admin error:', error);
    sendResponse(res, 500, false, 'Server error retrieving admin info');
  }
};

// Admin Profile Management
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user and include password for verification
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendResponse(res, 400, false, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error) {
    logger.error('Change password error:', error);
    sendResponse(res, 500, false, 'Server error changing password');
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, location, phone } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return sendResponse(res, 400, false, 'Email is already taken');
      }
    }

    // Update user profile
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Get updated admin info
    const admin = await Admin.findOne({ userId: user._id, isActive: true });
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin not found');
    }

    const adminResponse = {
      admin: {
        id: admin._id,
        userId: admin.userId._id,
        name: user.name,
        email: user.email,
        role: admin.role,
        permissions: admin.permissions,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        isActive: admin.isActive,
        lastActivity: admin.lastActivity
      }
    };

    sendResponse(res, 200, true, 'Profile updated successfully', adminResponse);
  } catch (error) {
    logger.error('Update profile error:', error);
    sendResponse(res, 500, false, 'Server error updating profile');
  }
};

const uploadAvatar = async (req, res) => {
  try {
    logger.info('uploadAvatar: Request received');
    logger.info('uploadAvatar: Request headers:', req.headers);
    logger.info('uploadAvatar: Request body keys:', Object.keys(req.body || {}));
    logger.info('uploadAvatar: Request file:', req.file);
    logger.info('uploadAvatar: Request files:', req.files);
    logger.info('uploadAvatar: Request uploadedFile:', req.uploadedFile);
    logger.info('uploadAvatar: Request processedFiles:', req.processedFiles);
    
    if (!req.uploadedFile) {
      logger.error('uploadAvatar: No uploadedFile found in request');
      return sendResponse(res, 400, false, 'No file uploaded');
    }

    const userId = req.user.id;
    const avatarUrl = req.uploadedFile.url; // Use the processed file URL

    logger.info('uploadAvatar: Processing avatar upload for userId:', userId);
    logger.info('uploadAvatar: Avatar URL:', avatarUrl);
    logger.info('uploadAvatar: Full uploadedFile object:', JSON.stringify(req.uploadedFile, null, 2));

    // Update user avatar
    const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
    if (!user) {
      logger.error('uploadAvatar: User not found for userId:', userId);
      return sendResponse(res, 404, false, 'User not found');
    }

    logger.info('uploadAvatar: User avatar updated successfully');
    logger.info('uploadAvatar: Updated user object:', JSON.stringify(user, null, 2));

    // Get updated admin info
    const admin = await Admin.findOne({ userId: user._id, isActive: true });
    if (!admin) {
      logger.error('uploadAvatar: Admin not found for userId:', userId);
      return sendResponse(res, 404, false, 'Admin not found');
    }

    const adminResponse = {
      admin: {
        id: admin._id,
        userId: admin.userId._id,
        name: user.name,
        email: user.email,
        role: admin.role,
        permissions: admin.permissions,
        avatar: user.avatar,
        isActive: admin.isActive,
        lastActivity: admin.lastActivity
      }
    };

    logger.info('uploadAvatar: Avatar upload completed successfully');
    logger.info('uploadAvatar: Final admin response:', JSON.stringify(adminResponse, null, 2));
    sendResponse(res, 200, true, 'Avatar uploaded successfully', adminResponse);
  } catch (error) {
    logger.error('Upload avatar error:', error);
    sendResponse(res, 500, false, 'Server error uploading avatar');
  }
};

// User Management
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'All Roles') {
      query.role = role;
    }

    if (status && status !== 'All Statuses') {
      if (status === 'Active') {
        query.isActive = true;
      } else if (status === 'Inactive') {
        query.isActive = false;
      }
    }

    const users = await User.find(query)
      .select('name email avatar isActive createdAt lastLoginAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRole = await UserRoles.findOne({ userId: user._id });
        return {
          id: user._id,
          username: user.name,
          email: user.email,
          role: userRole?.systemRole || 'User',
          status: user.isActive ? 'Active' : 'Inactive',
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
          createdAt: user.createdAt.toLocaleDateString(),
          avatar: user.avatar
        };
      })
    );

    sendResponse(res, 200, true, 'Users retrieved successfully', {
      users: usersWithRoles,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Get users error:', error);
    sendResponse(res, 500, false, 'Server error retrieving users');
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // SECURITY FIX: Validate role parameter
    const allowedRoles = ['user', 'admin', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      return sendResponse(res, 400, false, 'Invalid role specified');
    }

    // SECURITY FIX: Check if current user has permission to assign this role
    const currentUserSystemRole = req.user.systemRole;

    // Only super_admin can assign admin or super_admin roles
    if ((role === 'admin' || role === 'super_admin') && currentUserSystemRole !== 'super_admin') {
      return sendResponse(res, 403, false, 'Only super administrators can assign admin or super_admin roles');
    }

    // Regular admins can only assign user roles
    if (currentUserSystemRole === 'admin' && role !== 'user') {
      return sendResponse(res, 403, false, 'Admins can only assign user roles');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User with this email already exists');
    }

    // Create user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const user = new User({
      name: username,
      email,
      password: tempPassword
    });

    await user.save();

    // Set user role
    await UserRoles.findOneAndUpdate(
      { userId: user._id },
      { systemRole: role },
      { upsert: true, new: true }
    );

    // TODO: Send welcome email with temporary password

    sendResponse(res, 201, true, 'User created successfully', { user: { id: user._id, email } });
  } catch (error) {
    logger.error('Create user error:', error);
    sendResponse(res, 500, false, 'Server error creating user');
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    sendResponse(res, 200, true, 'User retrieved successfully', { user });
  } catch (error) {
    logger.error('Get user error:', error);
    sendResponse(res, 500, false, 'Server error retrieving user');
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    sendResponse(res, 200, true, 'User updated successfully', { user });
  } catch (error) {
    logger.error('Update user error:', error);
    sendResponse(res, 500, false, 'Server error updating user');
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    logger.error('Delete user error:', error);
    sendResponse(res, 500, false, 'Server error deleting user');
  }
};

const banUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.isActive = false;
    await user.save();

    sendResponse(res, 200, true, 'User deactivated successfully', { user });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    sendResponse(res, 500, false, 'Server error deactivating user');
  }
};

const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    user.isActive = true;
    await user.save();

    sendResponse(res, 200, true, 'User activated successfully', { user });
  } catch (error) {
    logger.error('Activate user error:', error);
    sendResponse(res, 500, false, 'Server error activating user');
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    // TODO: Send password reset email

    sendResponse(res, 200, true, 'Password reset email sent successfully');
  } catch (error) {
    logger.error('Reset password error:', error);
    sendResponse(res, 500, false, 'Server error resetting password');
  }
};

// Analytics
const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '6-months' } = req.query;

    // Get basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const activeUsers = await User.countDocuments({ 
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });

    // Mock data for now - in production, you'd aggregate from actual data
    const analyticsData = {
      totalUsers,
      activeUsers: {
        daily: activeUsers,
        weekly: Math.floor(totalUsers * 0.7),
        monthly: Math.floor(totalUsers * 0.9)
      },
      activeProjects: Math.floor(totalUsers * 0.1),
      completionRate: 87.3,
      projectCreationTrends: [
        { month: 'Jan', projects: 45 },
        { month: 'Feb', projects: 50 },
        { month: 'Mar', projects: 35 },
        { month: 'Apr', projects: 70 },
        { month: 'May', projects: 55 },
        { month: 'Jun', projects: 65 }
      ],
      taskCompletionData: {
        pending: 8,
        inProgress: 15,
        completed: 77
      },
      userGrowthData: [
        { month: 'Jan', signups: 280 },
        { month: 'Feb', signups: 320 },
        { month: 'Mar', signups: 380 },
        { month: 'Apr', signups: 420 },
        { month: 'May', signups: 480 },
        { month: 'Jun', signups: 550 }
      ],
      topTeams: [
        { id: '1', name: 'Design Team Alpha', members: 12, projects: 8, activityScore: 96.5 },
        { id: '2', name: 'Development Squad', members: 15, projects: 12, activityScore: 96.2 },
        { id: '3', name: 'Marketing Force', members: 9, projects: 6, activityScore: 94.8 }
      ],
      systemPerformance: {
        serverUptime: 99.97,
        apiResponseTime: 142,
        databaseHealth: 95
      }
    };

    sendResponse(res, 200, true, 'Analytics retrieved successfully', analyticsData);
  } catch (error) {
    logger.error('Get analytics error:', error);
    sendResponse(res, 500, false, 'Server error retrieving analytics');
  }
};

const exportAnalytics = async (req, res) => {
  try {
    // TODO: Implement analytics export functionality
    sendResponse(res, 200, true, 'Analytics export functionality coming soon');
  } catch (error) {
    logger.error('Export analytics error:', error);
    sendResponse(res, 500, false, 'Server error exporting analytics');
  }
};

// System Health
const getSystemHealth = async (req, res) => {
  try {
    // Mock system health data - in production, you'd get this from actual system monitoring
    const systemHealth = {
      systemPerformance: {
        serverUptime: 99.97,
        apiResponseTime: 142,
        databaseHealth: 95
      },
      database: {
        connection: 'Connected',
        size: '2.4 GB',
        performance: 'Optimal'
      },
      queue: {
        emailQueue: 45,
        backgroundJobs: 90,
        failedJobs: 12
      },
      security: {
        sslCertificate: 'Valid',
        firewall: 'Active',
        lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    };

    sendResponse(res, 200, true, 'System health retrieved successfully', systemHealth);
  } catch (error) {
    logger.error('Get system health error:', error);
    sendResponse(res, 500, false, 'Server error retrieving system health');
  }
};

// Templates (placeholder implementations)
const getProjectTemplates = async (req, res) => {
  try {
    // Mock data for now
    const templates = [
      {
        id: '1',
        name: 'Kanban Board',
        description: 'Visual project management with drag-and-drop cards',
        type: 'Kanban',
        stages: ['To Do', 'In Progress', 'Review', 'Done'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sendResponse(res, 200, true, 'Project templates retrieved successfully', templates);
  } catch (error) {
    logger.error('Get project templates error:', error);
    sendResponse(res, 500, false, 'Server error retrieving project templates');
  }
};

const createProjectTemplate = async (req, res) => {
  try {
    // TODO: Implement template creation
    sendResponse(res, 200, true, 'Template creation functionality coming soon');
  } catch (error) {
    logger.error('Create project template error:', error);
    sendResponse(res, 500, false, 'Server error creating project template');
  }
};

const updateProjectTemplate = async (req, res) => {
  try {
    // TODO: Implement template update
    sendResponse(res, 200, true, 'Template update functionality coming soon');
  } catch (error) {
    logger.error('Update project template error:', error);
    sendResponse(res, 500, false, 'Server error updating project template');
  }
};

const deleteProjectTemplate = async (req, res) => {
  try {
    // TODO: Implement template deletion
    sendResponse(res, 200, true, 'Template deletion functionality coming soon');
  } catch (error) {
    logger.error('Delete project template error:', error);
    sendResponse(res, 500, false, 'Server error deleting project template');
  }
};

const getTaskTemplates = async (req, res) => {
  try {
    // Mock data for now
    const templates = [
      {
        id: '1',
        name: 'Basic Workflow',
        stages: ['To Do', 'In Progress', 'Review', 'Done'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sendResponse(res, 200, true, 'Task templates retrieved successfully', templates);
  } catch (error) {
    logger.error('Get task templates error:', error);
    sendResponse(res, 500, false, 'Server error retrieving task templates');
  }
};

const getAIPrompts = async (req, res) => {
  try {
    // Mock data for now
    const prompts = [
      {
        id: '1',
        name: 'Sprint Backlog Generator',
        promptText: 'Generate a comprehensive sprint backlog...',
        category: 'Project Management',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sendResponse(res, 200, true, 'AI prompts retrieved successfully', prompts);
  } catch (error) {
    logger.error('Get AI prompts error:', error);
    sendResponse(res, 500, false, 'Server error retrieving AI prompts');
  }
};

const getBrandingAssets = async (req, res) => {
  try {
    // Mock data for now
    const assets = [
      {
        id: '1',
        customerName: 'TechCorp Solutions',
        primaryColor: '#3B82F6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sendResponse(res, 200, true, 'Branding assets retrieved successfully', assets);
  } catch (error) {
    logger.error('Get branding assets error:', error);
    sendResponse(res, 500, false, 'Server error retrieving branding assets');
  }
};

module.exports = {
  // Auth
  login,
  logout,
  getCurrentAdmin,
  changePassword,
  updateProfile,
  uploadAvatar,
  
  // User Management
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  deactivateUser: banUser, // Keep the old name for backward compatibility
  activateUser,
  resetUserPassword,
  
  // Analytics
  getAnalytics,
  exportAnalytics,
  
  // System Health
  getSystemHealth,
  
  // Templates
  getProjectTemplates,
  createProjectTemplate,
  updateProjectTemplate,
  deleteProjectTemplate,
  getTaskTemplates,
  getAIPrompts,
  getBrandingAssets
};
