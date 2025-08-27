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


// ------------------ REGISTER ------------------
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

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
    try {
        const { email, password, rememberMe = false } = req.body;
        const { deviceId, deviceInfo } = req.body.device || {};

        const user = await User.findOne({ email, isActive: true }).select('+password');
        if (!user) return sendResponse(res, 401, false, 'Invalid email or password');

        const userSessions = await user.getSessions();

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await userSessions.logLoginAttempt(false, req.ip, deviceInfo, 'Invalid password');
            return sendResponse(res, 401, false, 'Invalid email or password');
        }

        if (user.isLocked) return sendResponse(res, 423, false, 'Account is temporarily locked');

        const session = await userSessions.createSession({
            deviceId: deviceId || 'web-' + Date.now(),
            deviceInfo: deviceInfo || { type: 'web' },
            ipAddress: req.ip,
            rememberMe
        });

        await userSessions.logLoginAttempt(true, req.ip, deviceInfo);

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

// ------------------ GOOGLE OAUTH ------------------
exports.googleLogin = (req, res, next) => {
    if (!passport._strategies?.google) return sendResponse(res, 503, false, 'Google OAuth is not configured');
    const scope = req.query.scope || 'profile email';
    passport.authenticate('google', { scope: scope.split(' '), accessType: req.query.access_type || 'offline', prompt: req.query.prompt || 'consent' })(req, res, next);
};

exports.googleCallback = async (req, res, next) => {
    if (!passport._strategies?.google) return sendResponse(res, 503, false, 'Google OAuth is not configured');

    passport.authenticate('google', { session: false }, async (err, user) => {
        if (err || !user) return sendResponse(res, err ? 500 : 401, false, 'Authentication failed');

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

// ------------------ GITHUB OAUTH ------------------
exports.githubLogin = (req, res, next) => {
    if (!passport._strategies?.github) return sendResponse(res, 503, false, 'GitHub OAuth is not configured');
    const scope = req.query.scope || 'user:email';
    passport.authenticate('github', { scope: scope.split(' ') })(req, res, next);
};

exports.githubCallback = async (req, res, next) => {
    if (!passport._strategies?.github) return sendResponse(res, 503, false, 'GitHub OAuth is not configured');

    passport.authenticate('github', { session: false }, async (err, user) => {
        if (err || !user) return sendResponse(res, err ? 500 : 401, false, 'Authentication failed');

        try {
            user.lastLogin = new Date();
            await user.save();
            const token = generateToken(user._id);
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&provider=github`;
            res.redirect(redirectUrl);
        } catch (error) {
            logger.error('GitHub callback error:', error);
            return sendResponse(res, 500, false, 'Authentication failed');
        }
    })(req, res, next);
};

// ------------------ CHANGE PASSWORD ------------------
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


// ------------------ UPDATE PREFERENCES ------------------
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

// ------------------ GET SESSIONS ------------------
exports.getSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const userSessions = await user.getSessions();
        console.log("userSessions",userSessions);

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

// ------------------ END SESSION ------------------
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

// ------------------ VERIFY EMAIL ------------------
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

// ------------------ REQUEST PASSWORD RESET ------------------
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

// ------------------ RESET PASSWORD ------------------
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

// ------------------ GET ACTIVITY LOG ------------------
exports.getActivityLog = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const lim = parseInt(limit) || 50;
        const skip = (parseInt(page) - 1) * lim;
        
        // Explicit populate to guarantee avatar URLs
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

        // Debug logging
        console.log('First activity user:', JSON.stringify(activities[0]?.user, null, 2));
        console.log('User avatar type:', typeof activities[0]?.user?.avatar);

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

// ------------------ GET ME ------------------
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Get related data sequentially to avoid parallel save conflicts
        const preferences = await user.getPreferences();
        const sessions = await user.getSessions();
        const roles = await user.getRoles();

        // Ensure avatar is populated so client gets URL
        await user.populate({ path: 'avatar', select: 'url thumbnails' });

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
                spaces: roles.spaces.length
            }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        sendResponse(res, 500, false, 'Server error retrieving profile');
    }
};

// ------------------ LOGOUT ------------------
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
// ------------------ UPDATE PROFILE SECURE ------------------

exports.updateProfileSecure = async (req, res) => {
    try {
      const userId = req.user._id;
      const { name, currentPassword } = req.body;
      const avatarFile = req.file;
  
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      if (name && (name.length < 2 || name.length > 100)) return res.status(400).json({ message: 'Name invalid' });
  
      const user = await User.findById(userId);
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
  
      if (name) user.name = name;
      if (avatarFile) user.avatar = {
        url: `/uploads/avatars/${avatarFile.filename}`,
        filename: avatarFile.filename
      };
  
      await user.save();
      res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };