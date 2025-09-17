const Admin = require('../models/Admin');
const User = require('../models/User');
const UserRoles = require('../models/UserRoles');
const { sendResponse } = require('../utils/responseHandler');
const logger = require('../config/logger');
const { generateToken } = require('../utils/jwt');
const UserSessions = require('../models/UserSessions');
const TwoFactorAuthService = require('../services/twoFactorAuth.service');

// Admin Authentication
const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const { deviceId, deviceInfo } = req.body.device || {};

    console.log('=== ADMIN LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Remember me:', rememberMe);
    const testAdmin = await Admin.findOne({  isActive: true });
    console.log('Test admin:', testAdmin);
    // Find admin user
    const admin = await Admin.findOne({ userEmail: email, isActive: true }).select('+password');
    
    if (!admin) {
      console.log('Admin not found or inactive');
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    console.log('Admin found:', admin.userName, 'Role:', admin.role);

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return sendResponse(res, 401, false, 'Invalid credentials');
    }

    console.log('Password verified successfully');

    // Check if 2FA is enabled
    if (admin.hasTwoFactorAuth) {
      console.log('2FA is enabled for this admin');
      
      // For now, return a simple response indicating 2FA is required
      const responseData = {
        requires2FA: true,
        userId: admin._id,
        message: 'Two-factor authentication is required. Please enter your 6-digit code.',
        sessionId: 'admin-' + Date.now()
      };
      
      console.log('=== BACKEND 2FA RESPONSE ===');
      console.log('Response data:', responseData);
      
      return sendResponse(res, 200, true, '2FA required', responseData);
    }

    console.log('2FA not enabled, proceeding with login');

    // Generate JWT token
    const token = generateToken(admin._id);

    // Return admin info and token
    const adminResponse = {
      admin: {
        id: admin._id,
        userId: null, // Admin-only users don't have userId
        name: admin.userName,
        email: admin.userEmail,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar || null,
        isActive: admin.isActive,
        lastActivity: admin.lastActivityAt
      },
      token
    };

    console.log('Login successful, returning response');
    sendResponse(res, 200, true, 'Login successful', adminResponse);
  } catch (error) {
    console.error('Admin login error:', error);
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
    console.log('=== GET CURRENT ADMIN DEBUG ===');
    console.log('req.user.id:', req.user.id);
    console.log('req.user type:', typeof req.user.id);
    
    // Find admin by their own ID (not by userId reference)
    const admin = await Admin.findById(req.user.id).select('-password -twoFactorSecret -backupCodes -recoveryToken');

    if (!admin) {
      console.log('❌ Admin not found with ID:', req.user.id);
      return sendResponse(res, 404, false, 'Admin not found');
    }

    if (!admin.isActive) {
      console.log('❌ Admin is inactive:', admin.userName);
      return sendResponse(res, 403, false, 'Admin account is inactive');
    }

    console.log('✅ Admin found:', admin.userName, 'Role:', admin.role);

    const adminResponse = {
      admin: {
        id: admin._id,
        userId: null, // Admin-only users don't have userId reference
        name: admin.userName,
        email: admin.userEmail,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar || null,
        isActive: admin.isActive,
        lastActivity: admin.lastActivityAt
      }
    };

    console.log('✅ Admin response prepared:', adminResponse);
    sendResponse(res, 200, true, 'Admin info retrieved successfully', adminResponse);
  } catch (error) {
    console.error('❌ Get current admin error:', error);
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

    const adminId = req.user.id;
    const avatarUrl = req.uploadedFile.url; // Use the processed file URL

    logger.info('uploadAvatar: Processing avatar upload for adminId:', adminId);
    logger.info('uploadAvatar: Avatar URL:', avatarUrl);
    logger.info('uploadAvatar: Full uploadedFile object:', JSON.stringify(req.uploadedFile, null, 2));

    // Find and update admin directly
    const admin = await Admin.findById(adminId);
    if (!admin) {
      logger.error('uploadAvatar: Admin not found for adminId:', adminId);
      return sendResponse(res, 404, false, 'Admin not found');
    }

    logger.info('uploadAvatar: Admin found:', {
      userName: admin.userName,
      userEmail: admin.userEmail,
      hasUserId: !!admin.userId
    });

    // Update admin avatar directly
    admin.avatar = avatarUrl;
    await admin.save();

    logger.info('uploadAvatar: Admin avatar updated successfully');

    // If admin has a linked user, also update the user's avatar
    if (admin.userId) {
      try {
        const user = await User.findByIdAndUpdate(admin.userId, { avatar: avatarUrl }, { new: true });
        logger.info('uploadAvatar: Linked user avatar also updated');
      } catch (userError) {
        logger.warn('uploadAvatar: Failed to update linked user avatar:', userError.message);
        // Continue anyway, admin avatar is updated
      }
    }

    const adminResponse = {
      admin: {
        id: admin._id,
        userId: admin.userId || null,
        name: admin.userName,
        email: admin.userEmail,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
        isActive: admin.isActive,
        lastActivity: admin.lastActivityAt
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
    if (!['user', 'admin', 'super_admin', 'moderator', 'viewer'].includes(newRole)) {
      return sendResponse(res, 400, false, 'Invalid role. Must be one of: user, admin, super_admin, moderator, viewer');
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
    if (!['admin', 'super_admin', 'moderator', 'viewer'].includes(role)) {
      return sendResponse(res, 400, false, 'Invalid role. Must be one of: admin, super_admin, moderator, viewer');
    }

    // Check if admin user already exists (only check Admin collection, not regular User collection)
    const existingAdmin = await Admin.findOne({ 'userEmail': email });
    if (existingAdmin) {
      return sendResponse(res, 400, false, 'Admin user with this email already exists');
    }

    // Create Admin model entry for admin panel access ONLY
    // This user will NOT be a regular app user
    const adminEntry = new Admin({
      userEmail: email,
      userName: username,
      password: 'tempPassword123!', // Temporary password that should be changed
      role: role,
      isActive: true
    });
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

// Add new admin panel user with email, password, and role (for direct admin creation)
const addAdminUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return sendResponse(res, 400, false, 'Email, password, and role are required');
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
    if (!['admin', 'super_admin', 'moderator', 'viewer'].includes(role)) {
      return sendResponse(res, 400, false, 'Invalid role. Must be one of: admin, super_admin, moderator, viewer');
    }

    // Check if admin user already exists
    const existingAdmin = await Admin.findOne({ 'userEmail': email });
    if (existingAdmin) {
      return sendResponse(res, 400, false, 'Admin user with this email already exists');
    }

    // Create Admin model entry with password for admin panel access
    const adminEntry = new Admin({
      userEmail: email,
      userName: email.split('@')[0], // Use email prefix as username
      password: password, // This will be hashed by the pre-save middleware
      role: role,
      isActive: true
    });

    await adminEntry.save();

    // Log the admin user creation for audit purposes
    logger.info(`New admin panel user created: ${email} with role ${role} by admin ${req.user.id}`);

    // Return created admin user info
    sendResponse(res, 201, true, 'Admin panel user created successfully', { 
      admin: {
        id: adminEntry._id,
        email: email,
        role: role,
        isActive: adminEntry.isActive,
        createdAt: adminEntry.createdAt
      }
    });
  } catch (error) {
    logger.error('Add admin user error:', error);
    sendResponse(res, 500, false, 'Server error creating admin user');
  }
};

// Setup first admin user (public endpoint, only works when no admins exist)
const setupFirstAdmin = async (req, res) => {
  try {
    const { email, password, role = 'super_admin' } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(res, 400, false, 'Email and password are required');
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

    // Check if any admin users already exist
    const existingAdminCount = await Admin.countDocuments();
    
    if (existingAdminCount > 0) {
      return sendResponse(res, 403, false, 'First admin already exists. Use the protected endpoint to create additional admin users.');
    }

    // Check if admin user with this email already exists
    const existingAdmin = await Admin.findOne({ 'userEmail': email });
    if (existingAdmin) {
      return sendResponse(res, 400, false, 'Admin user with this email already exists');
    }

    // Create the first admin user
    const adminEntry = new Admin({
      userEmail: email,
      userName: email.split('@')[0], // Use email prefix as username
      password: password, // This will be hashed by the pre-save middleware
      role: role,
      isActive: true
    });

    await adminEntry.save();

    // Log the first admin user creation
    logger.info(`First admin user created: ${email} with role ${role}`);

    // Return created admin user info
    sendResponse(res, 201, true, 'First admin user created successfully', { 
      admin: {
        id: adminEntry._id,
        email: email,
        role: role,
        isActive: adminEntry.isActive,
        createdAt: adminEntry.createdAt
      }
    });
  } catch (error) {
    logger.error('Setup first admin error:', error);
    sendResponse(res, 500, false, 'Server error creating first admin user');
  }
};

// Get available roles for the current user
const getAvailableRoles = async (req, res) => {
  try {
    const userSystemRole = req.user.systemRole;
    let availableRoles = [];

    // Super Admin can assign all roles
    if (userSystemRole === 'super_admin') {
      availableRoles = ['admin', 'super_admin', 'moderator', 'viewer'];
    }
    // Admin can assign admin, moderator, and viewer roles
    else if (userSystemRole === 'admin') {
      availableRoles = ['admin', 'moderator', 'viewer'];
    }
    // Moderator can only assign moderator and viewer roles
    else if (userSystemRole === 'moderator') {
      availableRoles = ['moderator', 'viewer'];
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
    const Template = require('../models/Template');
    
    // Get project templates (board type templates)
    const templates = await Template.find({ 
      type: 'board',
      status: 'active'
    })
    .select('name description category content status usage createdAt updatedAt')
    .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedTemplates = templates.map(template => ({
      id: template._id,
      name: template.name,
      description: template.description,
      category: template.category,
      isActive: template.status === 'active',
      usageCount: template.usage?.totalUses || 0,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));

    sendResponse(res, 200, true, 'Project templates retrieved successfully', transformedTemplates);
  } catch (error) {
    logger.error('Get project templates error:', error);
    sendResponse(res, 500, false, 'Server error retrieving project templates');
  }
};

const createProjectTemplate = async (req, res) => {
  try {
    const Template = require('../models/Template');
    const { name, description, category, content, structure } = req.body;

    // Validate required fields
    if (!name || !description || !category || !content) {
      return sendResponse(res, 400, false, 'Missing required fields');
    }

    // Create new template
    const newTemplate = new Template({
      name,
      description,
      type: 'board',
      category,
      content,
      structure: structure || {
        version: '1.0',
        schema: {},
        required: ['name', 'description', 'category'],
        optional: []
      },
      createdBy: req.user.id,
      isPublic: true,
      status: 'active'
    });

    await newTemplate.save();

    // Transform response to match frontend expectations
    const responseTemplate = {
      id: newTemplate._id,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      isActive: newTemplate.status === 'active',
      usageCount: 0,
      createdAt: newTemplate.createdAt,
      updatedAt: newTemplate.updatedAt
    };

    sendResponse(res, 201, true, 'Project template created successfully', responseTemplate);
  } catch (error) {
    logger.error('Create project template error:', error);
    sendResponse(res, 500, false, 'Server error creating project template');
  }
};

const updateProjectTemplate = async (req, res) => {
  try {
    const Template = require('../models/Template');
    const { templateId } = req.params;
    const updateData = req.body;

    // Find and update template
    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return sendResponse(res, 404, false, 'Template not found');
    }

    // Transform response to match frontend expectations
    const responseTemplate = {
      id: updatedTemplate._id,
      name: updatedTemplate.name,
      description: updatedTemplate.description,
      category: updatedTemplate.category,
      isActive: updatedTemplate.status === 'active',
      usageCount: updatedTemplate.usage?.totalUses || 0,
      createdAt: updatedTemplate.createdAt,
      updatedAt: updatedTemplate.updatedAt
    };

    sendResponse(res, 200, true, 'Project template updated successfully', responseTemplate);
  } catch (error) {
    logger.error('Update project template error:', error);
    sendResponse(res, 500, false, 'Server error updating project template');
  }
};

const deleteProjectTemplate = async (req, res) => {
  try {
    const Template = require('../models/Template');
    const { templateId } = req.params;

    // Soft delete by setting status to archived
    const deletedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { status: 'archived', updatedAt: new Date() },
      { new: true }
    );

    if (!deletedTemplate) {
      return sendResponse(res, 404, false, 'Template not found');
    }

    sendResponse(res, 200, true, 'Project template deleted successfully', { id: templateId });
  } catch (error) {
    logger.error('Delete project template error:', error);
    sendResponse(res, 500, false, 'Server error deleting project template');
  }
};

const getTaskTemplates = async (req, res) => {
  try {
    const Template = require('../models/Template');
    
    // Get task templates
    const templates = await Template.find({ 
      type: 'task',
      status: 'active'
    })
    .select('name description category content status usage createdAt updatedAt')
    .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedTemplates = templates.map(template => ({
      id: template._id,
      name: template.name,
      description: template.description,
      category: template.category,
      estimatedHours: template.content?.estimatedHours || 0,
      isActive: template.status === 'active',
      usageCount: template.usage?.totalUses || 0,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }));

    sendResponse(res, 200, true, 'Task templates retrieved successfully', transformedTemplates);
  } catch (error) {
    logger.error('Get task templates error:', error);
    sendResponse(res, 500, false, 'Server error retrieving task templates');
  }
};

const getAIPrompts = async (req, res) => {
  try {
    const Template = require('../models/Template');
    
    // Get AI prompt templates (stored as workflow type)
    const prompts = await Template.find({ 
      type: 'workflow',
      category: 'Development',
      'content.prompt': { $exists: true },
      status: 'active'
    })
    .select('name description category content status usage createdAt updatedAt')
    .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedPrompts = prompts.map(prompt => ({
      id: prompt._id,
      name: prompt.name,
      prompt: prompt.content?.prompt || prompt.description,
      category: prompt.category,
      isActive: prompt.status === 'active',
      usageCount: prompt.usage?.totalUses || 0,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt
    }));

    sendResponse(res, 200, true, 'AI prompts retrieved successfully', transformedPrompts);
  } catch (error) {
    logger.error('Get AI prompts error:', error);
    sendResponse(res, 500, false, 'Server error retrieving AI prompts');
  }
};

const getBrandingAssets = async (req, res) => {
  try {
    const Template = require('../models/Template');
    
    // Get branding asset templates (stored as workflow type with Design category)
    const assets = await Template.find({ 
      type: 'workflow',
      category: 'Design',
      status: 'active'
    })
    .select('name description type category content status usage createdAt updatedAt')
    .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedAssets = assets.map(asset => ({
      id: asset._id,
      name: asset.name,
      type: 'design-asset', // Map workflow type to a more descriptive type
      value: JSON.stringify(asset.content).substring(0, 100) + '...',
      isActive: asset.status === 'active',
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    }));

    sendResponse(res, 200, true, 'Branding assets retrieved successfully', transformedAssets);
  } catch (error) {
    logger.error('Get branding assets error:', error);
    sendResponse(res, 500, false, 'Server error retrieving branding assets');
  }
};

// 2FA Management Functions
const get2FAStatus = async (req, res) => {
  try {
    console.log('=== GET 2FA STATUS DEBUG ===');
    console.log('req.user.id:', req.user.id);
    
    const admin = await Admin.findById(req.user.id).select('+twoFactorSecret +backupCodes +recoveryToken');
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      console.log('Admin not found');
      return sendResponse(res, 404, false, 'Admin not found');
    }

    console.log('Admin fields:', {
      hasTwoFactorAuth: admin.hasTwoFactorAuth,
      twoFactorAuthEnabledAt: admin.twoFactorAuthEnabledAt,
      twoFactorAuthLastUsed: admin.twoFactorAuthLastUsed,
      backupCodes: admin.backupCodes,
      recoveryToken: admin.recoveryToken
    });

    const status = {
      isEnabled: admin.hasTwoFactorAuth || false,
      enabledAt: admin.twoFactorAuthEnabledAt || null,
      lastUsed: admin.twoFactorAuthLastUsed || null,
      backupCodes: {
        total: (admin.backupCodes?.length || 0),
        remaining: (admin.backupCodes?.filter(bc => !bc.used)?.length || 0),
        used: (admin.backupCodes?.filter(bc => bc.used)?.length || 0)
      },
      hasRecoveryToken: !!admin.recoveryToken
    };

    console.log('Status object:', status);
    sendResponse(res, 200, true, '2FA status retrieved successfully', status);
  } catch (error) {
    console.error('=== 2FA STATUS ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    logger.error('Get 2FA status error:', error);
    sendResponse(res, 500, false, 'Server error retrieving 2FA status');
  }
};

const enable2FA = async (req, res) => {
  try {
    console.log('=== ENABLE 2FA DEBUG ===');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    
    // Validate user ID
    if (!req.user || !req.user.id) {
      console.log('No user found in request');
      return sendResponse(res, 401, false, 'Authentication required');
    }

    // Check if admin exists first
    const adminExists = await Admin.findById(req.user.id);
    if (!adminExists) {
      console.log('Admin not found');
      return sendResponse(res, 404, false, 'Admin not found');
    }

    if (adminExists.hasTwoFactorAuth) {
      console.log('2FA already enabled');
      return sendResponse(res, 400, false, '2FA is already enabled');
    }

    console.log('Generating 2FA secret...');
    const { secret, otpauthUrl, qrCode } = await TwoFactorAuthService.generateSecret(adminExists.userEmail);
    console.log('Secret generated:', !!secret);
    
    if (!secret || !otpauthUrl || !qrCode) {
      console.log('Failed to generate 2FA secret');
      return sendResponse(res, 500, false, 'Failed to generate 2FA secret');
    }
    
    console.log('Generating backup codes...');
    const backupCodes = TwoFactorAuthService.generateBackupCodes(10);
    console.log('Backup codes generated:', backupCodes.length);

    if (!backupCodes || backupCodes.length === 0) {
      console.log('Failed to generate backup codes');
      return sendResponse(res, 500, false, 'Failed to generate backup codes');
    }

    // Use findByIdAndUpdate to avoid version conflicts
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          twoFactorSecret: secret,
          backupCodes: backupCodes.map(code => ({
            code,
            used: false,
            usedAt: null
          })),
          lastActivityAt: new Date() // Explicitly set to avoid pre-save middleware conflicts
        }
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
        select: '+twoFactorSecret +backupCodes' // Include the fields we need
      }
    );

    if (!updatedAdmin) {
      console.log('Failed to update admin - document not found');
      return sendResponse(res, 500, false, 'Failed to update admin during 2FA setup');
    }

    console.log('Admin updated successfully');

    sendResponse(res, 200, true, '2FA setup initiated', {
      secret,
      otpauthUrl,
      qrCode,
      backupCodes
    });
  } catch (error) {
    console.error('=== ENABLE 2FA ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific Mongoose errors
    if (error.name === 'VersionError') {
      console.error('Version conflict detected - retrying...');
      // Retry once with a fresh document fetch
      try {
        const retryAdmin = await Admin.findById(req.user.id);
        if (!retryAdmin) {
          return sendResponse(res, 404, false, 'Admin not found during retry');
        }
        
        if (retryAdmin.hasTwoFactorAuth) {
          return sendResponse(res, 400, false, '2FA is already enabled');
        }

        const { secret, otpauthUrl, qrCode } = await TwoFactorAuthService.generateSecret(retryAdmin.userEmail);
        const backupCodes = TwoFactorAuthService.generateBackupCodes(10);

        if (!secret || !otpauthUrl || !qrCode || !backupCodes || backupCodes.length === 0) {
          console.log('Failed to generate 2FA data during retry');
          return sendResponse(res, 500, false, 'Failed to generate 2FA data during retry');
        }

        const finalUpdate = await Admin.findByIdAndUpdate(
          req.user.id,
          {
            $set: {
              twoFactorSecret: secret,
              backupCodes: backupCodes.map(code => ({
                code,
                used: false,
                usedAt: null
              })),
              lastActivityAt: new Date()
            }
          },
          {
            new: true,
            runValidators: true,
            select: '+twoFactorSecret +backupCodes'
          }
        );

        if (finalUpdate) {
          console.log('Admin updated successfully on retry');
          return sendResponse(res, 200, true, '2FA setup initiated', {
            secret,
            otpauthUrl,
            qrCode,
            backupCodes
          });
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        logger.error('Enable 2FA retry error:', retryError);
      }
    }
    
    // Handle other specific errors
    if (error.name === 'ValidationError') {
      console.error('Validation error:', error.message);
      return sendResponse(res, 400, false, `Validation error: ${error.message}`);
    }
    
    if (error.name === 'CastError') {
      console.error('Cast error:', error.message);
      return sendResponse(res, 400, false, 'Invalid admin ID format');
    }
    
    logger.error('Enable 2FA error:', error);
    sendResponse(res, 500, false, 'Server error enabling 2FA');
  }
};

const verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;
    const admin = await Admin.findById(req.user.id).select('+twoFactorSecret');
    
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin not found');
    }

    if (!admin.twoFactorSecret) {
      return sendResponse(res, 400, false, '2FA setup not initiated');
    }

    if (admin.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is already enabled');
    }

    const isValid = TwoFactorAuthService.verifyToken(token, admin.twoFactorSecret);
    
    if (!isValid) {
      return sendResponse(res, 400, false, 'Invalid verification code');
    }

    admin.hasTwoFactorAuth = true;
    admin.twoFactorAuthEnabledAt = new Date();
    admin.twoFactorAuthLastUsed = new Date();
    await admin.save();

    sendResponse(res, 200, true, '2FA enabled successfully');
  } catch (error) {
    console.error('=== VERIFY 2FA SETUP ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    logger.error('Verify 2FA setup error:', error);
    sendResponse(res, 500, false, 'Server error verifying 2FA setup');
  }
};

const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const admin = await Admin.findById(req.user.id).select('+twoFactorSecret +backupCodes +recoveryToken');
    
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin not found');
    }

    if (!admin.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled');
    }

    // Verify the token before disabling
    let isValid = false;

    // Check if it's a backup code
    const backupCode = admin.backupCodes.find(
      bc => bc.code === token && !bc.used
    );

    if (backupCode) {
      backupCode.used = true;
      backupCode.usedAt = new Date();
      isValid = true;
    } else {
      isValid = TwoFactorAuthService.verifyToken(token, admin.twoFactorSecret);
    }

    if (!isValid) {
      return sendResponse(res, 400, false, 'Invalid verification code');
    }

    admin.hasTwoFactorAuth = false;
    admin.twoFactorSecret = null;
    admin.backupCodes = [];
    admin.recoveryToken = null;
    admin.twoFactorAuthEnabledAt = null;
    admin.twoFactorAuthLastUsed = null;
    await admin.save();

    sendResponse(res, 200, true, '2FA disabled successfully');
  } catch (error) {
    logger.error('Disable 2FA error:', error);
    sendResponse(res, 500, false, 'Server error disabling 2FA');
  }
};

const generateBackupCodes = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('+backupCodes');
    
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin not found');
    }

    if (!admin.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled');
    }

    const newBackupCodes = TwoFactorAuthService.generateBackupCodes(10);

    admin.backupCodes = newBackupCodes.map(code => ({
      code,
      used: false,
      usedAt: null
    }));
    await admin.save();

    sendResponse(res, 200, true, 'New backup codes generated successfully', {
      backupCodes: newBackupCodes
    });
  } catch (error) {
    logger.error('Generate backup codes error:', error);
    sendResponse(res, 500, false, 'Server error generating backup codes');
  }
};

const generateRecoveryToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('+recoveryToken +recoveryTokenExpires');
    
    if (!admin) {
      return sendResponse(res, 404, false, 'Admin not found');
    }

    if (!admin.hasTwoFactorAuth) {
      return sendResponse(res, 400, false, '2FA is not enabled');
    }

    const { token, expiresAt } = TwoFactorAuthService.generateRecoveryToken();

    admin.recoveryToken = token;
    admin.recoveryTokenExpires = expiresAt;
    await admin.save();

    sendResponse(res, 200, true, 'Recovery token generated successfully', {
      token,
      expiresAt
    });
  } catch (error) {
    logger.error('Generate recovery token error:', error);
    sendResponse(res, 500, false, 'Server error generating recovery token');
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
  setupFirstAdmin,
  
  // 2FA Management
  get2FAStatus,
  enable2FA,
  verify2FASetup,
  disable2FA,
  generateBackupCodes,
  generateRecoveryToken,
  
  // User Management
  getUsers,
  getAppUsers,
  createUser,
  getUser,
  updateUser,
  addUserWithEmail,
  addAdminUser,
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
