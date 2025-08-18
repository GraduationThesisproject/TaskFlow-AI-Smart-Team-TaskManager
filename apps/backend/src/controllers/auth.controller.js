const User = require('../models/User');
const UserSessions = require('../models/UserSessions');
const UserPreferences = require('../models/UserPreferences');
const ActivityLog = require('../models/ActivityLog');
const Invitation = require('../models/Invitation');
const jwt = require('../utils/jwt');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, inviteToken } = req.body;
        const { userAgent, deviceId, deviceInfo } = req.body.device || {};

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, false, 'User already exists with this email');
        }

        // Handle invitation if token provided
        let invitation = null;
        if (inviteToken) {
            invitation = await Invitation.findByToken(inviteToken);
            if (!invitation || invitation.status !== 'pending' || invitation.isExpired) {
                return sendResponse(res, 400, false, 'Invalid or expired invitation');
            }
        }

        // Create new user with default related models
        const user = await User.createWithDefaults({
            name,
            email,
            password
        });

        // Create initial session
        const userSessions = await user.getSessions();
        await userSessions.createSession({
            deviceId: deviceId || 'web-' + Date.now(),
            deviceInfo: deviceInfo || { type: 'web' },
            ipAddress: req.ip,
            rememberMe: false
        });

        // Process invitation if exists
        if (invitation) {
            await invitation.accept(user._id);
            
            // Add user to the invited entity with proper role
            const userRoles = await user.getRoles();
            
            switch (invitation.targetEntity.type) {
                case 'Workspace':
                    await userRoles.addWorkspaceRole(invitation.targetEntity.id, invitation.role);
                    break;
                case 'Project':
                    await userRoles.addProjectRole(invitation.targetEntity.id, invitation.role);
                    break;
            }
        }

        // Generate JWT token
        const token = jwt.generateToken(user._id);

        // Send welcome email
        try {
            await sendEmail({
                to: user.email,
                template: 'welcome',
                data: { name: user.name }
            });
        } catch (emailError) {
            logger.warn('Welcome email failed:', emailError);
        }

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'user_register',
            description: `User registered: ${email}`,
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                deviceInfo,
                hasInvitation: !!invitation
            },
            severity: 'info'
        });

        logger.info(`User registered: ${email}`);

        sendResponse(res, 201, true, 'User registered successfully', {
            token,
            user: user.getPublicProfile(),
            invitation: invitation ? {
                entityType: invitation.targetEntity.type,
                entityName: invitation.targetEntity.name,
                role: invitation.role
            } : null
        });
    } catch (error) {
        logger.error('Register error:', error);
        sendResponse(res, 500, false, 'Server error during registration');
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, rememberMe = false } = req.body;
        const { deviceId, deviceInfo } = req.body.device || {};

        // Find user and include password
        const user = await User.findOne({ email, isActive: true }).select('+password');
        if (!user) {
            return sendResponse(res, 401, false, 'Invalid email or password');
        }

        // Get user sessions for logging
        const userSessions = await user.getSessions();

        try {
            // Compare password (this handles account lockout automatically)
            const isValidPassword = await user.comparePassword(password);
            
            if (!isValidPassword) {
                // Log failed attempt
                await userSessions.logLoginAttempt(
                    false, 
                    req.ip, 
                    deviceInfo, 
                    'Invalid password'
                );
                
                return sendResponse(res, 401, false, 'Invalid email or password');
            }

            // Check if account is locked
            if (user.isLocked) {
                return sendResponse(res, 423, false, 'Account is temporarily locked due to too many failed attempts');
            }

            // Create new session
            const session = await userSessions.createSession({
                deviceId: deviceId || 'web-' + Date.now(),
                deviceInfo: deviceInfo || { type: 'web' },
                ipAddress: req.ip,
                rememberMe
            });

            // Log successful attempt
            await userSessions.logLoginAttempt(true, req.ip, deviceInfo);

            // Generate JWT token
            const expiresIn = rememberMe ? '30d' : '7d';
            const token = jwt.generateToken(user._id, expiresIn);

            // Log activity
            await ActivityLog.logActivity({
                userId: user._id,
                action: 'user_login',
                description: `User logged in: ${email}`,
                entity: { type: 'User', id: user._id, name: user.name },
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    deviceInfo,
                    rememberMe
                }
            });

            logger.info(`User logged in: ${email}`);

            sendResponse(res, 200, true, 'Login successful', {
                token,
                user: user.getPublicProfile(),
                sessionInfo: {
                    rememberMe,
                    expiresIn,
                    deviceId: session.deviceId
                }
            });

        } catch (error) {
            if (error.message.includes('locked')) {
                await userSessions.logLoginAttempt(false, req.ip, deviceInfo, 'Account locked');
                return sendResponse(res, 423, false, error.message);
            }
            throw error;
        }

    } catch (error) {
        logger.error('Login error:', error);
        sendResponse(res, 500, false, 'Server error during login');
    }
};

// Get current user with full profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Get related data
        const [preferences, sessions, roles] = await Promise.all([
            user.getPreferences(),
            user.getSessions(),
            user.getRoles()
        ]);

        // Get active sessions count
        const activeSessions = sessions.sessions.filter(s => s.isActive).length;

        sendResponse(res, 200, true, 'User profile retrieved', {
            user: user.getPublicProfile(),
            preferences,
            security: {
                activeSessions,
                emailVerified: user.emailVerified,
                twoFactorEnabled: user.hasTwoFactorAuth,
                lastLogin: user.lastLogin,
                hasOAuthProviders: user.hasOAuthProviders
            },
            roles: {
                workspaces: roles.workspaces.length,
                projects: roles.projects.length,
                spaces: roles.spaces.length
            }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        sendResponse(res, 500, false, 'Server error retrieving profile');
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, preferences, metadata } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Store old values for audit log
        const oldValues = {
            name: user.name,
            avatar: user.avatar
        };

        // Update basic profile
        if (name) user.name = name;
        
        // Handle avatar upload
        if (req.uploadedFile) {
            // Delete old avatar file if exists
            if (user.avatar) {
                const File = require('../models/File');
                const oldFile = await File.findOne({ 
                    url: user.avatar,
                    uploadedBy: user._id,
                    category: 'avatar'
                });
                
                if (oldFile) {
                    await oldFile.deleteFromCloudinary();
                }
            }

            // Create new file record
            const File = require('../models/File');
            const file = await File.create({
                publicId: req.uploadedFile.publicId,
                url: req.uploadedFile.url,
                secureUrl: req.uploadedFile.url,
                originalName: req.uploadedFile.originalName,
                mimeType: req.uploadedFile.mimeType,
                size: req.uploadedFile.size,
                format: req.uploadedFile.format,
                resourceType: req.uploadedFile.resourceType,
                category: 'avatar',
                uploadedBy: user._id,
                dimensions: {
                    width: req.uploadedFile.width,
                    height: req.uploadedFile.height
                }
            });

            await file.attachTo('User', user._id);
            user.avatar = file.url;
        } else if (avatar) {
            user.avatar = avatar;
        }
        
        // Update metadata if provided
        if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
                user.addMetadata(key, value);
            });
        }

        await user.save();

        // Update preferences if provided
        if (preferences) {
            const userPrefs = await user.getPreferences();
            Object.entries(preferences).forEach(([section, updates]) => {
                if (userPrefs[section]) {
                    Object.assign(userPrefs[section], updates);
                }
            });
            await userPrefs.save();
        }

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'User updated profile',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                oldValues: oldValues,
                newValues: { name, avatar },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        logger.info(`Profile updated: ${user.email}`);

        sendResponse(res, 200, true, 'Profile updated successfully', {
            user: user.getPublicProfile()
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        sendResponse(res, 500, false, 'Server error updating profile');
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const { deviceId, allDevices = false } = req.body;
        
        const user = await User.findById(req.user.id);
        const userSessions = await user.getSessions();

        if (allDevices) {
            await userSessions.endAllSessions();
        } else if (deviceId) {
            const session = userSessions.getSessionByDevice(deviceId);
            if (session) {
                await userSessions.endSession(session.sessionId);
            }
        }

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'user_logout',
            description: allDevices ? 'User logged out from all devices' : 'User logged out',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                deviceId,
                allDevices,
                ipAddress: req.ip
            }
        });

        logger.info(`User logged out: ${req.user.id}`);
        sendResponse(res, 200, true, 'Logout successful');
    } catch (error) {
        logger.error('Logout error:', error);
        sendResponse(res, 500, false, 'Server error during logout');
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user with password
        const user = await User.findById(req.user.id).select('+password');
        
        // Check current password
        if (!(await user.comparePassword(currentPassword))) {
            return sendResponse(res, 400, false, 'Current password is incorrect');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // End all other sessions for security
        const userSessions = await user.getSessions();
        await userSessions.endAllSessions();

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'User changed password',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                endedAllSessions: true
            },
            severity: 'warning'
        });

        logger.info(`Password changed: ${user.email}`);

        sendResponse(res, 200, true, 'Password changed successfully. Please log in again.');
    } catch (error) {
        logger.error('Change password error:', error);
        sendResponse(res, 500, false, 'Server error changing password');
    }
};

// Update preferences
exports.updatePreferences = async (req, res) => {
    try {
        const { section, updates } = req.body;
        
        const user = await User.findById(req.user.id);
        const preferences = await user.getPreferences();

        if (section && updates) {
            await preferences.updateSection(section, updates);
        } else {
            // Update multiple sections
            Object.entries(req.body).forEach(([key, value]) => {
                if (preferences[key] && typeof value === 'object') {
                    Object.assign(preferences[key], value);
                }
            });
            await preferences.save();
        }

        sendResponse(res, 200, true, 'Preferences updated successfully', {
            preferences
        });
    } catch (error) {
        logger.error('Update preferences error:', error);
        sendResponse(res, 500, false, 'Server error updating preferences');
    }
};

// Get user sessions
exports.getSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const userSessions = await user.getSessions();

        const sessions = userSessions.sessions
            .filter(session => session.isActive)
            .map(session => ({
                deviceId: session.deviceId,
                deviceInfo: session.deviceInfo,
                ipAddress: session.ipAddress,
                loginAt: session.loginAt,
                lastActivityAt: session.lastActivityAt,
                isCurrent: session.deviceId === req.body.currentDeviceId
            }));

        sendResponse(res, 200, true, 'Sessions retrieved successfully', {
            sessions,
            total: sessions.length
        });
    } catch (error) {
        logger.error('Get sessions error:', error);
        sendResponse(res, 500, false, 'Server error retrieving sessions');
    }
};

// End specific session
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const user = await User.findById(req.user.id);
        const userSessions = await user.getSessions();

        await userSessions.endSession(sessionId);

        sendResponse(res, 200, true, 'Session ended successfully');
    } catch (error) {
        logger.error('End session error:', error);
        sendResponse(res, 500, false, 'Server error ending session');
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        const user = await User.findOne({
            'tempTokens.emailVerificationToken': token,
            'tempTokens.emailVerificationExpires': { $gt: new Date() }
        });

        if (!user) {
            return sendResponse(res, 400, false, 'Invalid or expired verification token');
        }

        await user.verifyEmail(token);

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'User verified email address',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { ipAddress: req.ip }
        });

        logger.info(`Email verified: ${user.email}`);

        sendResponse(res, 200, true, 'Email verified successfully');
    } catch (error) {
        logger.error('Verify email error:', error);
        sendResponse(res, 500, false, 'Server error verifying email');
    }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            // Don't reveal if email exists for security
            return sendResponse(res, 200, true, 'If an account with that email exists, a reset link has been sent');
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send reset email
        await sendEmail({
            to: user.email,
            template: 'password-reset',
            data: {
                name: user.name,
                resetToken,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'Password reset requested',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { ipAddress: req.ip, email }
        });

        sendResponse(res, 200, true, 'If an account with that email exists, a reset link has been sent');
    } catch (error) {
        logger.error('Password reset request error:', error);
        sendResponse(res, 500, false, 'Server error processing password reset request');
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            'tempTokens.passwordResetToken': token,
            'tempTokens.passwordResetExpires': { $gt: new Date() }
        });

        if (!user) {
            return sendResponse(res, 400, false, 'Invalid or expired reset token');
        }

        // Update password
        user.password = newPassword;
        user.tempTokens.passwordResetToken = undefined;
        user.tempTokens.passwordResetExpires = undefined;
        await user.save();

        // End all sessions for security
        const userSessions = await user.getSessions();
        await userSessions.endAllSessions();

        // Log activity
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'Password reset completed',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { 
                ipAddress: req.ip,
                endedAllSessions: true 
            },
            severity: 'warning'
        });

        logger.info(`Password reset: ${user.email}`);

        sendResponse(res, 200, true, 'Password reset successful. Please log in with your new password.');
    } catch (error) {
        logger.error('Reset password error:', error);
        sendResponse(res, 500, false, 'Server error resetting password');
    }
};

// Get user activity log
exports.getActivityLog = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        
        const activities = await ActivityLog.findByUser(
            req.user.id, 
            parseInt(limit)
        );

        sendResponse(res, 200, true, 'Activity log retrieved successfully', {
            activities,
            total: activities.length
        });
    } catch (error) {
        logger.error('Get activity log error:', error);
        sendResponse(res, 500, false, 'Server error retrieving activity log');
    }
};