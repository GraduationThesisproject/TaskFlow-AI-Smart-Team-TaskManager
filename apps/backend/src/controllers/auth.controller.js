const User = require('../models/User');
const UserSessions = require('../models/UserSessions');
const UserPreferences = require('../models/UserPreferences');
const ActivityLog = require('../models/ActivityLog');
const Invitation = require('../models/Invitation');
const jwt = require('../utils/jwt');
const { generateToken } = require('../utils/jwt');
const { sendResponse } = require('../utils/response');
const { sendEmail } = require('../utils/email');
const logger = require('../config/logger');
const passport = require('passport');

// ============================================================================
// USER REGISTRATION & INVITATION
// ============================================================================

exports.register = async (req, res) => {
    try {
        const { name, email, password, inviteToken } = req.body;
        const { userAgent, deviceId, deviceInfo } = req.body.device || {};

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, false, 'User already exists with this email');
        }

        let invitation = null;
        if (inviteToken) {
            invitation = await Invitation.findByToken(inviteToken);
            if (!invitation || invitation.status !== 'pending' || invitation.isExpired) {
                return sendResponse(res, 400, false, 'Invalid or expired invitation');
            }
        }

        const user = await User.createWithDefaults({ name, email, password });

        const userSessions = await user.getSessions();
        await userSessions.createSession({
            deviceId: deviceId || 'web-' + Date.now(),
            deviceInfo: deviceInfo || { type: 'web' },
            ipAddress: req.ip,
            rememberMe: false
        });

        if (invitation) {
            await invitation.accept(user._id);
            const userRoles = await user.getRoles();
            switch (invitation.targetEntity.type) {
                case 'Workspace':
                    await userRoles.addWorkspaceRole(invitation.targetEntity.id, invitation.role);
                    break;
                case 'Space':
                    await userRoles.addSpaceRole(invitation.targetEntity.id, invitation.role);
                    break;
            }
        }

        const token = jwt.generateToken(user._id);

        try {
            await sendEmail({ to: user.email, template: 'welcome', data: { name: user.name } });
        } catch (emailError) {
            logger.warn('Welcome email failed:', emailError);
        }

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'user_register',
            description: `User registered: ${email}`,
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent'), deviceInfo, hasInvitation: !!invitation },
            severity: 'info'
        });

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

// ============================================================================
// OAUTH AUTHENTICATION
// ============================================================================

exports.googleLogin = (req, res, next) => {
    if (!passport._strategies?.google) {
        return sendResponse(res, 503, false, 'Google OAuth is not configured');
    }
    const scope = req.query.scope || 'profile email';
    passport.authenticate('google', { 
        scope: scope.split(' '), 
        accessType: req.query.access_type || 'offline', 
        prompt: req.query.prompt || 'consent' 
    })(req, res, next);
};

exports.googleCallback = async (req, res, next) => {
    if (!passport._strategies?.google) {
        return sendResponse(res, 503, false, 'Google OAuth is not configured');
    }

    passport.authenticate('google', { session: false }, async (err, user) => {
        if (err || !user) {
            return sendResponse(res, err ? 500 : 401, false, 'Authentication failed');
        }

        try {
            user.lastLogin = new Date();
            await user.save();
            const token = generateToken(user._id);
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&provider=google`;
            res.redirect(redirectUrl);
        } catch (error) {
            logger.error('Google callback error:', error);
            return sendResponse(res, 500, false, 'Authentication failed');
        }
    })(req, res, next);
};

exports.githubLogin = (req, res, next) => {
    if (!passport._strategies?.github) {
        return sendResponse(res, 503, false, 'GitHub OAuth is not configured');
    }
    const scope = req.query.scope || 'user:email';
    passport.authenticate('github', { scope: scope.split(' ') })(req, res, next);
};

exports.githubCallback = (req, res, next) => {
    if (!passport._strategies?.github) {
        logger.error('GitHub OAuth is not configured');
        return sendResponse(res, 503, false, 'GitHub OAuth is not configured');
    }

    return passport.authenticate('github', { session: false }, async (err, user, info) => {
        if (err) {
            logger.error('GitHub authentication error:', err);
            return sendResponse(res, 500, false, err.message || 'Authentication failed');
        }
        
        if (!user) {
            logger.error('GitHub authentication failed:', info);
            return sendResponse(res, 401, false, info?.message || 'Authentication failed');
        }

        try {
            user.lastLogin = new Date();
            await user.save();
            const token = generateToken(user._id);
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=github`;
            logger.info('GitHub authentication successful, redirecting to:', redirectUrl);
            return res.redirect(redirectUrl);
        } catch (error) {
            logger.error('GitHub callback error:', error);
            return sendResponse(res, 500, false, 'Failed to complete authentication process');
        }
    })(req, res, next);
};

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

exports.login = async (req, res) => {
    try {
        const { email, password, rememberMe = false } = req.body;
        const { deviceId, deviceInfo } = req.body.device || {};

        const user = await User.findOne({ email, isActive: true }).select('+password');
        if (!user) {
            return sendResponse(res, 401, false, 'Invalid email or password');
        }

        const userSessions = await user.getSessions();

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await userSessions.logLoginAttempt(false, req.ip, deviceInfo, 'Invalid password');
            return sendResponse(res, 401, false, 'Invalid email or password');
        }

        if (user.isLocked) {
            return sendResponse(res, 423, false, 'Account is temporarily locked');
        }

        const session = await userSessions.createSession({
            deviceId: deviceId || 'web-' + Date.now(),
            deviceInfo: deviceInfo || { type: 'web' },
            ipAddress: req.ip,
            rememberMe
        });

        await userSessions.logLoginAttempt(true, req.ip, deviceInfo);

        if (user.hasTwoFactorAuth) {
            return sendResponse(res, 200, true, '2FA required', {
                requires2FA: true,
                userId: user._id,
                message: 'Two-factor authentication is required. Please enter your 6-digit code.',
                sessionId: session._id
            });
        }

        const expiresIn = rememberMe ? '30d' : '7d';
        const token = jwt.generateToken(user._id, expiresIn);

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'user_login',
            description: `User logged in: ${email}`,
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { ipAddress: req.ip, userAgent: req.get('User-Agent'), deviceInfo, rememberMe }
        });

        sendResponse(res, 200, true, 'Login successful', {
            token,
            user: user.getPublicProfile(),
            sessionInfo: { rememberMe, expiresIn, deviceId: session.deviceId }
        });
    } catch (error) {
        logger.error('Login error:', error);
        sendResponse(res, 500, false, 'Server error during login');
    }
};

exports.completeLoginWith2FA = async (req, res) => {
    try {
        const { userId, token, sessionId, rememberMe = false, rememberDevice = false } = req.body;

        if (!userId || !token || !sessionId) {
            return sendResponse(res, 400, false, 'User ID, token, and session ID are required');
        }

        const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        if (!user.hasTwoFactorAuth) {
            return sendResponse(res, 400, false, '2FA is not enabled for this account');
        }

        const TwoFactorAuthService = require('../services/twoFactorAuth.service');
        let isValid = false;

        const backupCode = user.twoFactorAuth.backupCodes.find(
            bc => bc.code === token && !bc.used
        );

        if (backupCode) {
            backupCode.used = true;
            backupCode.usedAt = new Date();
            user.twoFactorAuth.lastUsed = new Date();
            isValid = true;
        } else {
            isValid = TwoFactorAuthService.verifyToken(token, user.twoFactorAuth.secret);
        }

        if (!isValid) {
            return sendResponse(res, 401, false, 'Invalid verification code');
        }

        if (!backupCode) {
            user.twoFactorAuth.lastUsed = new Date();
        }
        await user.save();

        const userSessions = await user.getSessions();
        const session = await userSessions.activateSession(sessionId);
        if (!session) {
            return sendResponse(res, 400, false, 'Invalid session');
        }

        const expiresIn = rememberMe ? '30d' : '7d';
        const jwtToken = jwt.generateToken(user._id, expiresIn);

        let deviceToken = null;
        if (rememberDevice) {
            const deviceId = req.headers['x-device-id'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            deviceToken = TwoFactorAuthService.generateDeviceToken(deviceId, userAgent);
        }

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'user_login_2fa',
            description: `User completed login with 2FA: ${user.email}`,
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                rememberMe,
                rememberDevice,
                usedBackupCode: !!backupCode
            }
        });

        logger.info(`User completed login with 2FA: ${user.email}`);

        sendResponse(res, 200, true, 'Login completed successfully', {
            token: jwtToken,
            user: user.getPublicProfile(),
            sessionInfo: {
                rememberMe,
                expiresIn,
                deviceId: session.deviceId
            },
            deviceToken,
            requiresNewBackupCodes: user.twoFactorAuth.backupCodes.filter(bc => !bc.used).length < 3
        });

    } catch (error) {
        logger.error('Complete login with 2FA error:', error);
        sendResponse(res, 500, false, 'Server error during 2FA verification');
    }
};

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

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        const preferences = await user.getPreferences();
        const sessions = await user.getSessions();
        const roles = await user.getRoles();

        await user.populate({ path: 'avatar', select: 'url thumbnails' });

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
                spaces: roles.spaces.length
            }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        sendResponse(res, 500, false, 'Server error retrieving profile');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, avatar, preferences, metadata } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        const oldValues = {
            name: user.name,
            avatar: user.avatar
        };

        if (name) user.name = name;
        
        if (req.uploadedFile) {
            const File = require('../models/File');

            if (user.avatar) {
                try {
                    const oldFile = await File.findById(user.avatar);
                    if (oldFile && oldFile._id.toString() !== req.uploadedFile._id.toString()) {
                        await oldFile.deleteFromStorage();
                    }
                } catch (e) {
                    logger.warn('Failed to delete old avatar:', e.message);
                }
            }

            const file = req.uploadedFile;
            await file.attachTo('User', user._id);
            user.avatar = file._id;
        } else if (avatar) {
            user.avatar = avatar;
        }
        
        if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
                user.addMetadata(key, value);
            });
        }

        await user.save();

        if (preferences) {
            const userPrefs = await user.getPreferences();
            Object.entries(preferences).forEach(([section, updates]) => {
                if (userPrefs[section]) {
                    Object.assign(userPrefs[section], updates);
                }
            });
            await userPrefs.save();
        }

        await user.populate({ path: 'avatar', select: 'url thumbnails' });

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'User updated profile',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                oldValues: oldValues,
                newValues: { name, avatar: user.avatar },
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

exports.updateProfileSecure = async (req, res) => {
    try {
        const { currentPassword, name } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        const isValid = await user.comparePassword(currentPassword || '');
        if (!isValid) {
            if (req.uploadedFile) {
                try {
                    await req.uploadedFile.deleteFromStorage();
                    await req.uploadedFile.deleteOne();
                } catch (e) {
                    logger.warn('Cleanup failed for uploaded file on password error:', e.message);
                }
            }
            return sendResponse(res, 400, false, 'Current password is incorrect');
        }

        const oldValues = {
            name: user.name,
            avatar: user.avatar
        };

        if (name) user.name = name;

        if (req.uploadedFile) {
            const File = require('../models/File');
            try {
                if (user.avatar) {
                    const oldFile = await File.findById(user.avatar);
                    if (oldFile && oldFile._id.toString() !== req.uploadedFile._id.toString()) {
                        await oldFile.deleteFromStorage();
                    }
                }
            } catch (e) {
                logger.warn('Failed to delete old avatar:', e.message);
            }

            const file = req.uploadedFile;
            await file.attachTo('User', user._id);
            user.avatar = file._id;
            logger.info(`updateProfileSecure: user ${user._id.toString()} avatar set to file ${file._id.toString()}`);
        }

        await user.save();

        await user.populate({ path: 'avatar', select: 'url thumbnails' });
        logger.info(`updateProfileSecure: response avatar url=${user.avatar?.url || user.avatar}`);

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'User updated profile (secure)',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                oldValues,
                newValues: { name: user.name, avatar: user.avatar },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                verifiedByPassword: true
            }
        });

        return sendResponse(res, 200, true, 'Profile updated successfully', {
            user: user.getPublicProfile()
        });
    } catch (error) {
        logger.error('Secure update profile error:', error);
        return sendResponse(res, 500, false, 'Server error updating profile');
    }
};

// ============================================================================
// PASSWORD & SECURITY MANAGEMENT
// ============================================================================

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        
        if (!(await user.comparePassword(currentPassword))) {
            return sendResponse(res, 400, false, 'Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();

        const userSessions = await user.getSessions();
        await userSessions.endAllSessions();

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

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return sendResponse(res, 200, true, 'If an account with that email exists, a reset link has been sent');
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        await sendEmail({
            to: user.email,
            template: 'password-reset',
            data: {
                name: user.name,
                resetToken,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });

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

        user.password = newPassword;
        user.tempTokens.passwordResetToken = undefined;
        user.tempTokens.passwordResetExpires = undefined;
        await user.save();

        const userSessions = await user.getSessions();
        await userSessions.endAllSessions();

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

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

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

// ============================================================================
// USER PREFERENCES & SETTINGS
// ============================================================================

exports.updatePreferences = async (req, res) => {
    try {
        const { section, updates } = req.body;
        
        const user = await User.findById(req.user.id);
        const preferences = await user.getPreferences();

        if (section && updates) {
            await preferences.updateSection(section, updates);
        } else {
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

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

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

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

exports.getActivityLog = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const lim = parseInt(limit) || 50;
        const skip = (parseInt(page) - 1) * lim;
        
        const query = ActivityLog.find({ user: req.user.id, isVisible: true })
            .populate('entity.id')
            .populate({
                path: 'user',
                select: 'name email avatar',
                populate: { path: 'avatar', select: 'url thumbnails' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(lim);

        const [activities, total] = await Promise.all([
            query.lean(),
            ActivityLog.countDocuments({ user: req.user.id, isVisible: true })
        ]);

        sendResponse(res, 200, true, 'Activity log retrieved successfully', {
            activities,
            count: activities.length,
            total
        });
    } catch (error) {
        logger.error('Get activity log error:', error);
        sendResponse(res, 500, false, 'Server error retrieving profile');
    }
};