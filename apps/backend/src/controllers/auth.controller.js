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

            // Create new session
            const session = await userSessions.createSession({
                deviceId: deviceId || 'web-' + Date.now(),
                deviceInfo: deviceInfo || { type: 'web' },
                ipAddress: req.ip,
                rememberMe
            });
            // Log successful attempt
            await userSessions.logLoginAttempt(true, req.ip, deviceInfo);

            // Check if 2FA is enabled
            if (user.hasTwoFactorAuth) {
                // Return response indicating 2FA is required
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

// Complete login with 2FA verification
exports.completeLoginWith2FA = async (req, res) => {
    try {
        const { userId, token, sessionId, rememberMe = false, rememberDevice = false } = req.body;

        if (!userId || !token || !sessionId) {
            return sendResponse(res, 400, false, 'User ID, token, and session ID are required');
        }

        // Find user and include 2FA fields
        const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        if (!user.hasTwoFactorAuth) {
            return sendResponse(res, 400, false, '2FA is not enabled for this account');
        }

        // Verify 2FA token
        const TwoFactorAuthService = require('../services/twoFactorAuth.service');
        let isValid = false;

        // Check if it's a backup code
        const backupCode = user.twoFactorAuth.backupCodes.find(
            bc => bc.code === token && !bc.used
        );

        if (backupCode) {
            // Use backup code
            backupCode.used = true;
            backupCode.usedAt = new Date();
            user.twoFactorAuth.lastUsed = new Date();
            isValid = true;
        } else {
            // Verify TOTP token
            isValid = TwoFactorAuthService.verifyToken(token, user.twoFactorAuth.secret);
        }

        if (!isValid) {
            return sendResponse(res, 401, false, 'Invalid verification code');
        }

        // Update user's 2FA last used timestamp
        if (!backupCode) {
            user.twoFactorAuth.lastUsed = new Date();
        }
        await user.save();

        // Get user sessions
        const userSessions = await user.getSessions();
        
        // Activate the session
        const session = await userSessions.activateSession(sessionId);
        if (!session) {
            return sendResponse(res, 400, false, 'Invalid session');
        }

        // Generate JWT token
        const expiresIn = rememberMe ? '30d' : '7d';
        const jwtToken = jwt.generateToken(user._id, expiresIn);

        // Generate device token if remember device is requested
        let deviceToken = null;
        if (rememberDevice) {
            const deviceId = req.headers['x-device-id'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            deviceToken = TwoFactorAuthService.generateDeviceToken(deviceId, userAgent);
        }

        // Log activity
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

// Get current user with full profile
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
        
        // Handle avatar upload (Multer + local File model)
        if (req.uploadedFile) {
            const File = require('../models/File');

            // Delete old avatar file if exists (user.avatar is stored as URL string)
            if (user.avatar) {
                try {
                    const oldFile = await File.findOne({ url: user.avatar });
                    if (oldFile && oldFile._id.toString() !== req.uploadedFile._id.toString()) {
                        await oldFile.deleteFromStorage();
                    }
                } catch (e) {
                    logger.warn('Failed to delete old avatar:', e.message);
                }
            }

            // Attach the uploaded file to the user and set avatar URL (string)
            const file = req.uploadedFile; // Mongoose doc created in processUploadedFiles
            await file.attachTo('User', user._id);
            user.avatar = file.url;
        } else if (avatar) {
            // Accept either a direct URL string or a File ID; convert ID to URL
            try {
                const File = require('../models/File');
                const isObjectId = typeof avatar === 'string' && /^[a-f\d]{24}$/i.test(avatar);
                if (isObjectId) {
                    const f = await File.findById(avatar);
                    if (f) {
                        user.avatar = f.url;
                    } else {
                        // Fallback: if not found by ID, try storing as provided (may be URL)
                        user.avatar = avatar;
                    }
                } else {
                    user.avatar = avatar; // expected to be a URL or data URI per schema validator
                }
            } catch (e) {
                logger.warn('Failed to resolve provided avatar value, storing as-is:', e.message);
                user.avatar = avatar;
            }
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

        // Populate avatar so response contains URL
        await user.populate({ path: 'avatar', select: 'url thumbnails' });

        // Log activity
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

// Secure profile update with password verification and optional avatar upload
exports.updateProfileSecure = async (req, res) => {
  const traceId = `UPS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
        const { currentPassword, name } = req.body;

        // Incoming request metadata
        logger.info(`[${traceId}] updateProfileSecure: start; headers.content-type=${req.headers['content-type']}; bodyKeys=${Object.keys(req.body || {}).join(',')}`);
        if (req.file || req.files) {
            logger.info(`[${traceId}] updateProfileSecure: multer received -> file=${!!req.file}, filesCount=${req.files?.length || 0}`);
        }
        // Debug: log presence of uploaded file
        try {
            const f = req.uploadedFile;
            if (f) {
                logger.info(`[${traceId}] updateProfileSecure: uploadedFile present id=${f._id?.toString?.()} name=${f.filename} path=${f.path}`);
            } else {
                logger.info(`[${traceId}] updateProfileSecure: no uploadedFile present`);
            }
        } catch (e) {
            logger.warn(`[${traceId}] updateProfileSecure: failed to log uploadedFile info: ${e.message}`);
        }

        // Load user with password for verification
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        const isValid = await user.comparePassword(currentPassword || '');
        if (!isValid) {
            // Cleanup: if a file was uploaded before validation, delete it to avoid orphans
            if (req.uploadedFile) {
                try {
                    await req.uploadedFile.deleteFromStorage();
                    await req.uploadedFile.deleteOne();
                } catch (e) {
                    logger.warn(`[${traceId}] Cleanup failed for uploaded file on password error: ${e.message}`);
                }
            }
            return sendResponse(res, 400, false, 'Current password is incorrect');
        }

        const oldValues = {
            name: user.name,
            avatar: user.avatar
        };

        // Normalize and validate name only if provided
        const normalizedName = typeof name === 'string' ? name.trim() : undefined;

        // If neither name nor avatar is provided, return a 400
        if (!normalizedName && !req.uploadedFile) {
            return sendResponse(res, 400, false, 'No changes provided');
        }

        // Update name if a non-empty value is provided
        if (normalizedName) {
            if (normalizedName.length < 2 || normalizedName.length > 100) {
                return sendResponse(res, 400, false, 'Name must be between 2 and 100 characters');
            }
            user.name = normalizedName;
        }

        // Handle avatar if a new file was uploaded
        if (req.uploadedFile) {
            const File = require('../models/File');
            // Preserve old avatar URL before overwriting
            const oldAvatarUrl = user.avatar;
            try {
                if (oldAvatarUrl) {
                    // Find previous avatar by URL since user.avatar is a String URL
                    const oldFile = await File.findOne({ url: oldAvatarUrl });
                    if (oldFile && oldFile._id.toString() !== req.uploadedFile._id.toString()) {
                        await oldFile.deleteFromStorage();
                    }
                }
            } catch (e) {
                logger.warn(`[${traceId}] updateProfileSecure: Failed to delete old avatar: ${e.message}`);
            }

            try {
                const file = req.uploadedFile;
                await file.attachTo('User', user._id);
                // user.avatar must be a URL/String per schema validation
                user.avatar = file.url;
                logger.info(`[${traceId}] updateProfileSecure: avatar set to url ${file.url}`);
            } catch (e) {
                logger.error(`[${traceId}] updateProfileSecure: error attaching new avatar: ${e.message}`);
                return sendResponse(res, 500, false, 'Failed to attach avatar');
            }
        }

        try {
            await user.save();
        } catch (e) {
            logger.error(`[${traceId}] updateProfileSecure: error saving user: ${e.message}`);
            return sendResponse(res, 500, false, 'Failed to save user profile');
        }

        // Populate avatar so response contains URL
        try {
            await user.populate({ path: 'avatar', select: 'url thumbnails' });
            logger.info(`[${traceId}] updateProfileSecure: response avatar url=${user.avatar?.url || user.avatar}`);
        } catch (e) {
            logger.warn(`[${traceId}] updateProfileSecure: populate avatar failed: ${e.message}`);
        }

        // Log activity
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

        logger.info(`[${traceId}] updateProfileSecure: success`);
        return sendResponse(res, 200, true, 'Profile updated successfully', {
            user: user.getPublicProfile()
        });
  } catch (error) {
        logger.error(`[${traceId}] Secure update profile error: ${error.message}`);
        if (error && error.stack) {
            logger.error(`[${traceId}] Secure update profile error stack: ${error.stack}`);
        }
        return sendResponse(res, 500, false, 'Server error updating profile');
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
        const { limit = 50, page = 1, userId } = req.query;
        const lim = parseInt(limit) || 50;
        const skip = (parseInt(page) - 1) * lim;

        // Global activity feed by default; optionally filter by userId if provided
        const filter = { isVisible: true };
        if (userId) filter.user = userId;

        const query = ActivityLog.find(filter)
            .populate('entity.id')
            .populate({
                path: 'user',
                select: 'name email avatar'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(lim);

        const [activities, total] = await Promise.all([
            query.lean(),
            ActivityLog.countDocuments(filter)
        ]);

        sendResponse(res, 200, true, 'Activity log retrieved successfully', {
            activities,
            count: activities.length,
            total
        });
    } catch (error) {
        logger.error('Get activity log error:', error);
        sendResponse(res, 500, false, 'Server error retrieving activity log');
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