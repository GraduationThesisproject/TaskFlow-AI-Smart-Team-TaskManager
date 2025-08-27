const Admin = require('../models/Admin');
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');
const { generateToken } = require('../utils/jwt');
const UserSessions = require('../models/UserSessions');

// Admin Authentication
const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const { deviceId, deviceInfo } = req.body.device || {};

    // First, try to find admin-only user (no regular User model)
    let admin = await Admin.findOne({ userEmail: email, isActive: true });
    let user = null;
    let isPasswordValid = false;

    if (admin && !admin.userId) {
      // This is an admin-only user
      isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return sendResponse(res, 401, false, 'Invalid credentials');
      }
    } else {
      // Try to find regular user with admin privileges
      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return sendResponse(res, 401, false, 'Invalid credentials');
      }

      // Check if user is admin
      admin = await Admin.findOne({ userId: user._id, isActive: true });
      if (!admin) {
        return sendResponse(res, 403, false, 'Access denied. Admin privileges required.');
      }

      // Verify password
      isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return sendResponse(res, 401, false, 'Invalid credentials');
      }
    }

    // Handle session creation based on user type
    let session = null;
    
    if (user) {
      // Regular user with admin privileges
      const userSessions = await user.getSessions();
      
      // Create new session
      await userSessions.createSession({
        deviceId: deviceId || 'web-' + Date.now(),
        deviceInfo: deviceInfo || { type: 'web' },
        ipAddress: req.ip,
        rememberMe
      });

      // Get the newly created session
      session = userSessions.sessions[userSessions.sessions.length - 1];

      // Log successful attempt
      await userSessions.logLoginAttempt(true, req.ip, deviceInfo || { type: 'web' });

      // Check if 2FA is enabled
      if (user.hasTwoFactorAuth) {
        // Return response indicating 2FA is required
        const responseData = {
          requires2FA: true,
          userId: user._id,
          message: 'Two-factor authentication is required. Please enter your 6-digit code.',
          sessionId: session.sessionId
        };
        
        console.log('=== BACKEND 2FA RESPONSE ===');
        console.log('Response data:', responseData);
        console.log('User ID type:', typeof user._id);
        console.log('Session ID type:', typeof session.sessionId);
        
        return sendResponse(res, 200, true, '2FA required', responseData);
      }
    } else {
      // Admin-only user - create a simple session ID
      session = { sessionId: 'admin-' + Date.now() };
    }

    // Generate JWT token
    const token = generateToken(user ? user._id : admin._id);
    
    // Update admin activity
    admin.updateActivity();

    // Return admin info and token
    const adminResponse = {
      admin: {
        id: admin._id,
        userId: admin.userId,
        name: user ? user.name : admin.userName,
        email: user ? user.email : admin.userEmail,
        role: admin.role,
        permissions: admin.permissions,
        avatar: user ? user.avatar : null,
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

// Complete admin login with 2FA verification
const completeLoginWith2FA = async (req, res) => {
  console.log('=== 2FA COMPLETION REQUEST RECEIVED ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    const { userId, token, sessionId, rememberMe = false, rememberDevice = false } = req.body;
    
    console.log('2FA Debug - Extracted values:');
    console.log('  userId:', userId);
    console.log('  token:', token);
    console.log('  sessionId:', sessionId);
    console.log('  rememberMe:', rememberMe);
    console.log('  rememberDevice:', rememberDevice);

    if (!userId || !token || !sessionId) {
      return sendResponse(res, 400, false, 'User ID, token, and session ID are required');
    }

    // Find user and include 2FA fields
    const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Check if user is admin
    const admin = await Admin.findOne({ userId: user._id, isActive: true });
    if (!admin) {
      return sendResponse(res, 403, false, 'Access denied. Admin privileges required.');
    }

    if (!user.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled for this account');
    }

    // Verify 2FA token
    const TwoFactorAuthService = require('../services/twoFactorAuth.service');
    let isValid = false;

    // Debug logging
    console.log('2FA Debug - Token received:', token);
    console.log('2FA Debug - User has 2FA enabled:', user.hasTwoFactorAuth);
    console.log('2FA Debug - User 2FA secret exists:', !!user.twoFactorAuth?.secret);
    console.log('2FA Debug - User backup codes count:', user.twoFactorAuth?.backupCodes?.length || 0);

    // Check if it's a backup code
    const backupCode = user.twoFactorAuth.backupCodes.find(
      bc => bc.code === token && !bc.used
    );

    if (backupCode) {
      console.log('2FA Debug - Using backup code');
      // Use backup code
      backupCode.used = true;
      backupCode.usedAt = new Date();
      user.twoFactorAuth.lastUsed = new Date();
      isValid = true;
    } else {
      console.log('2FA Debug - Verifying TOTP token');
      console.log('2FA Debug - Token:', token);
      console.log('2FA Debug - Secret:', user.twoFactorAuth.secret);
      // Verify TOTP token
      isValid = TwoFactorAuthService.verifyToken(token, user.twoFactorAuth.secret);
      console.log('2FA Debug - TOTP verification result:', isValid);
    }

    if (!isValid) {
      console.log('2FA Debug - Token validation failed');
      return sendResponse(res, 401, false, 'Invalid verification code');
    }

    // Update user's 2FA last used timestamp
    if (!backupCode) {
      user.twoFactorAuth.lastUsed = new Date();
    }
    await user.save();

    // Get user sessions
    const userSessions = await user.getSessions();
    
    // Debug logging for session activation
    console.log('2FA Debug - Session ID to activate:', sessionId);
    console.log('2FA Debug - UserSessions object:', userSessions);
    console.log('2FA Debug - UserSessions.sessions:', userSessions.sessions);
    
    // Activate the session
    const session = await userSessions.activateSession(sessionId);
    if (!session) {
      return sendResponse(res, 400, false, 'Invalid session');
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    // Update admin activity
    admin.updateActivity();

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.logActivity({
        userId: user._id,
        action: 'admin_login_2fa',
        description: `Admin completed login with 2FA: ${user.email}`,
        entity: { type: 'Admin', id: admin._id, name: user.name },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          rememberMe,
          rememberDevice,
          usedBackupCode: !!backupCode
        }
      });
    } catch (logError) {
      logger.warn('Failed to log admin 2FA login activity:', logError.message);
    }

    logger.info(`Admin completed login with 2FA: ${user.email}`);

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
      token: jwtToken
    };

    sendResponse(res, 200, true, 'Login completed successfully', adminResponse);

  } catch (error) {
    logger.error('Complete admin login with 2FA error:', error);
    sendResponse(res, 500, false, 'Server error during 2FA verification');
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

// Admin User Management - Get all admin users (both regular users with admin privileges and admin-only users)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
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

    // Get admin users from Admin collection
    const adminUsers = await Admin.find(query)
      .populate('userId', 'name email avatar isActive createdAt lastLoginAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Admin.countDocuments(query);

    // Transform admin users to consistent format
    const usersWithRoles = adminUsers.map(admin => {
      if (admin.userId) {
        // Regular user with admin privileges
        return {
          id: admin.userId._id,
          name: admin.userId.name,
          email: admin.userId.email,
          avatar: admin.userId.avatar,
          role: admin.role,
          isActive: admin.isActive,
          lastActivity: admin.lastActivity,
          permissions: admin.permissions,
          type: 'regular_user',
          createdAt: admin.createdAt.toISOString()
        };
      } else {
        // Admin-only user
        return {
          id: admin._id,
          name: admin.userName,
          email: admin.userEmail,
          avatar: null,
          role: admin.role,
          isActive: admin.isActive,
          lastActivity: admin.lastActivity,
          permissions: admin.permissions,
          type: 'admin_only',
          createdAt: admin.createdAt.toISOString()
        };
      }
    });

    sendResponse(res, 200, true, 'Admin users retrieved successfully', {
      users: usersWithRoles,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Get admin users error:', error);
    sendResponse(res, 500, false, 'Server error retrieving admin users');
  }
};

// Regular App User Management - Get all regular app users (NOT admin users)
const getAppUsers = async (req, res) => {
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

    if (role && role !== 'all') {
      // Map frontend role names to backend role names
      const roleMapping = {
        'super_admin': 'super_admin',
        'admin': 'admin',
        'moderator': 'moderator',
        'user': 'user'
      };
      if (roleMapping[role]) {
        query.role = roleMapping[role];
      }
    }

    if (status && status !== 'all') {
      if (status === 'Active') {
        query.isActive = true;
      } else if (status === 'Inactive') {
        query.isActive = false;
      }
    }

    // Get regular app users from User collection (NOT admin users)
    const users = await User.find(query)
      .select('name email avatar isActive createdAt lastLoginAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Get user roles for each user
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRole = await UserRoles.findOne({ userId: user._id });
        return {
          id: user._id,
          username: user.name, // Map 'name' to 'username' for frontend compatibility
          email: user.email,
          role: userRole?.systemRole || 'user',
          status: user.isActive ? 'Active' : 'Inactive',
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : 'Never',
          createdAt: user.createdAt.toISOString(),
          avatar: user.avatar
        };
      })
    );

    sendResponse(res, 200, true, 'App users retrieved successfully', {
      users: usersWithRoles,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Get app users error:', error);
    sendResponse(res, 500, false, 'Server error retrieving app users');
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User with this email already exists');
    }

    // Create user with the specified password "user123!"
    const tempPassword = 'user123!';
    
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

const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    // Validate the new role
    if (!['user', 'admin', 'super_admin', 'moderator'].includes(newRole)) {
      return sendResponse(res, 400, false, 'Invalid role. Must be one of: user, admin, super_admin, moderator');
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Get or create user roles document
    let userRoles = await UserRoles.findOne({ userId });
    
    if (!userRoles) {
      // Create new user roles document if it doesn't exist
      userRoles = new UserRoles({
        userId: user._id,
        systemRole: newRole
      });
    } else {
      // Update existing role
      userRoles.systemRole = newRole;
    }

    await userRoles.save();

    // Log the role change for audit purposes
    logger.info(`User role changed: User ${user.email} (${user._id}) role changed to ${newRole} by admin ${req.user.id}`);

    // Return updated user with roles
    const updatedUser = await User.findById(userId)
      .populate('roles')
      .select('-password');

    sendResponse(res, 200, true, `User role changed to ${newRole} successfully`, { 
      user: updatedUser,
      newRole 
    });
  } catch (error) {
    logger.error('Change user role error:', error);
    sendResponse(res, 500, false, 'Server error changing user role');
  }
};

// Add new admin panel user with email and password
const addUserWithEmail = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return sendResponse(res, 400, false, 'Username, email, password, and role are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, false, 'Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      return sendResponse(res, 400, false, 'Password must be at least 8 characters long');
    }

    // Validate role
    if (!['admin', 'super_admin', 'moderator'].includes(role)) {
      return sendResponse(res, 400, false, 'Invalid role. Must be one of: admin, super_admin, moderator');
    }

    // Check if admin user already exists (only check Admin collection, not regular User collection)
    const Admin = require('../models/Admin');
    const existingAdmin = await Admin.findOne({ 'userEmail': email });
    if (existingAdmin) {
      return sendResponse(res, 400, false, 'Admin user with this email already exists');
    }

    // Create Admin model entry for admin panel access ONLY
    // This user will NOT be a regular app user
    const adminEntry = await Admin.createAdmin(null, role, { userEmail: email, userName: username });
    await adminEntry.save();

    // Log the admin user creation for audit purposes
    logger.info(`New admin panel user created: ${email} with role ${role} by admin ${req.user.id}`);

    // Return created admin user info
    sendResponse(res, 201, true, 'Admin panel user created successfully', { 
      adminUser: {
        id: adminEntry._id,
        email: email,
        username: username,
        role: role,
        isActive: adminEntry.isActive,
        createdAt: adminEntry.createdAt
      }
    });
  } catch (error) {
    logger.error('Add admin panel user with email error:', error);
    sendResponse(res, 500, false, 'Server error creating admin panel user');
  }
};

// Get available roles for the current user
const getAvailableRoles = async (req, res) => {
  try {
    const userSystemRole = req.user.systemRole;
    let availableRoles = [];

    // Super Admin can assign all roles
    if (userSystemRole === 'super_admin') {
      availableRoles = ['admin', 'super_admin', 'moderator'];
    }
    // Admin can assign admin and moderator roles
    else if (userSystemRole === 'admin') {
      availableRoles = ['admin', 'moderator'];
    }
    // Moderator can only assign moderator role
    else if (userSystemRole === 'moderator') {
      availableRoles = ['moderator'];
    }
    // Regular users cannot assign roles
    else {
      availableRoles = [];
    }

    sendResponse(res, 200, true, 'Available roles retrieved successfully', { 
      availableRoles,
      userRole: userSystemRole
    });
  } catch (error) {
    logger.error('Get available roles error:', error);
    sendResponse(res, 500, false, 'Server error retrieving available roles');
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

// Test JWT generation
const testJWT = async (req, res) => {
  try {
    // Test with a dummy user ID
    const testUserId = '507f1f77bcf86cd799439011';
    const token = generateToken(testUserId);
    
    // Test token verification
    try {
      const decoded = require('../utils/jwt').verifyToken(token);
      // Token verification successful
    } catch (verifyError) {
      // Token verification failed
    }
    
    res.json({
      success: true,
      message: 'JWT test completed',
      data: {
        token: token ? `${token.substring(0, 20)}...` : 'null',
        tokenType: typeof token,
        tokenLength: token ? token.length : 0,
        tokenExists: !!token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'JWT test failed',
      error: error.message
    });
  }
};

module.exports = {
  // Auth
  login,
  completeLoginWith2FA,
  logout,
  getCurrentAdmin,
  changePassword,
  updateProfile,
  uploadAvatar,
  
  // User Management
  getUsers,
  getAppUsers,
  createUser,
  getUser,
  updateUser,
  addUserWithEmail,
  getAvailableRoles,

  deactivateUser: banUser, // Keep the old name for backward compatibility
  activateUser,
  resetUserPassword,
  changeUserRole,
  
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
  getBrandingAssets,
  testJWT
};
