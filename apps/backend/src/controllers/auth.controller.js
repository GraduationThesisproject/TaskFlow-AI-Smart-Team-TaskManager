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
const env = require('../config/env');
const oauthService = require('../services/oauth.service');

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

        // Generate 4-digit verification code and send via email
        try {
            const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

            // Store pending registration data (user will be created only after verification)
            pendingRegistrations.set(email, {
                name,
                email,
                password,
                deviceId: deviceId || 'web-' + Date.now(),
                deviceInfo: deviceInfo || { type: 'web' },
                ipAddress: req.ip,
                invitation,
                createdAt: new Date()
            });

            // Store verification code in memory (in production, use Redis)
            emailVerifyCodes.set(email, {
                code: verificationCode,
                expiresAt,
                attempts: 0
            });

            await sendEmail({
                to: email,
                template: 'email-verification-code',
                subject: 'Verify Your Email - TaskFlow',
                data: { 
                    name, 
                    code: verificationCode,
                    expiresIn: '10 minutes'
                }
            });
        } catch (emailError) {
            logger.warn('Verification email failed:', emailError);
        }

        sendResponse(res, 201, true, 'Registration initiated successfully. Please check your email for verification code.', {
            requiresVerification: true,
            email: email,
            invitation: invitation ? {
                entityType: invitation.targetEntity.type,
                entityName: invitation.targetEntity.name,
                role: invitation.role
            } : null
        });
    } catch (error) {
        logger.error('Register error:', error);
        // Map validation-like errors to 400 for clearer client feedback
        const msg = (error && error.message) ? error.message : 'Server error during registration';
        const isValidationError =
            typeof msg === 'string' && (
                msg.includes('Validation failed') ||
                msg.includes('already registered') ||
                msg.includes('already exists') ||
                msg.includes('Password must') ||
                msg.includes('Name must') ||
                msg.toLowerCase().includes('email')
            );

        sendResponse(res, isValidationError ? 400 : 500, false, isValidationError ? msg : 'Server error during registration');
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
            const redirectUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=google`;
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
    const scope = req.query.scope || 'user:email read:org repo';
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
            // Check if user has GitHub access token
            if (!user.github?.accessToken) {
                logger.error('GitHub access token not found for user:', user._id);
                return sendResponse(res, 500, false, 'GitHub access token not available');
            }

            user.lastLogin = new Date();
            await user.save();
            
            const token = generateToken(user._id);
            const redirectUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=github&githubLinked=true`;
            logger.info('GitHub authentication successful, redirecting to:', redirectUrl);
            return res.redirect(redirectUrl);
        } catch (error) {
            logger.error('GitHub callback error:', error);
            return sendResponse(res, 500, false, 'Failed to complete authentication process');
        }
    })(req, res, next);
};

// ============================================================================
// MOBILE OAUTH AUTHENTICATION
// ============================================================================

// Google OAuth for mobile - verify access token and authenticate
exports.googleMobile = async (req, res) => {
    try {
        const { access_token } = req.body;

        if (!access_token) {
            return sendResponse(res, 400, false, 'Access token is required');
        }

        // Verify the Google access token and get user info
        const googleProfile = await oauthService.verifyGoogleToken(access_token);
        
        // Find or create user
        const user = await oauthService.findOrCreateGoogleUser(googleProfile);
        
        // Generate auth response
        const response = oauthService.generateAuthResponse(user);
        
        logger.info(`Google mobile OAuth successful for user: ${user.email}`);
        return sendResponse(res, 200, true, response.message, response.data);
        
    } catch (error) {
        logger.error('Google mobile OAuth error:', error);
        return sendResponse(res, 500, false, error.message || 'Google authentication failed');
    }
};

// GitHub OAuth for mobile - exchange code for token and authenticate
exports.githubMobile = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return sendResponse(res, 400, false, 'Authorization code is required');
        }

        // Exchange code for access token
        const tokenData = await oauthService.exchangeGitHubCodeForToken(code);
        
        // Get GitHub user profile
        const githubProfile = await oauthService.getGitHubUserProfile(tokenData.access_token);
        
        // Find or create user
        const user = await oauthService.findOrCreateGitHubUser(githubProfile);
        
        // Generate auth response
        const response = oauthService.generateAuthResponse(user);
        
        logger.info(`GitHub mobile OAuth successful for user: ${user.email}`);
        return sendResponse(res, 200, true, response.message, response.data);
        
    } catch (error) {
        logger.error('GitHub mobile OAuth error:', error);
        return sendResponse(res, 500, false, error.message || 'GitHub authentication failed');
    }
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

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;
        
        // Verify password before deletion
        const user = await User.findById(userId);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        // Check password if user has password authentication
        if (user.password && !password) {
            return sendResponse(res, 400, false, 'Password required for account deletion');
        }

        if (user.password && password) {
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return sendResponse(res, 400, false, 'Invalid password');
            }
        }

        // Log the deletion activity before deleting
        await ActivityLog.logActivity({
            userId: user._id,
            action: 'account_deleted',
            description: 'User permanently deleted their account',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: {
                email: user.email,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            }
        });

        // Delete all user data using the User model's deleteAccount method
        await user.deleteAccount();

        logger.info(`User account deleted: ${userId}`);
        sendResponse(res, 200, true, 'Account successfully deleted');
    } catch (error) {
        logger.error('Delete account error:', error);
        sendResponse(res, 500, false, 'Server error during account deletion');
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
                    const oldFile = await File.findOne({ url: user.avatar });
                    if (oldFile && oldFile._id.toString() !== req.uploadedFile._id.toString()) {
                        await oldFile.deleteFromStorage();
                    }
                } catch (e) {
                    logger.warn('Failed to delete old avatar:', e.message);
                }
            }

            const file = req.uploadedFile;
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
// 4-DIGIT CODE PASSWORD RESET FLOW
// ============================================================================

// In-memory store for reset codes (in production, use Redis or database)
const resetCodes = new Map();

// Clean up expired codes every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of resetCodes.entries()) {
        if (now > data.expiresAt) {
            resetCodes.delete(key);
        }
    }
}, 5 * 60 * 1000);

exports.sendForgotPasswordCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            // Don't reveal if user exists for security
            return sendResponse(res, 200, true, 'If an account with that email exists, a reset code has been sent');
        }

        // Generate 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

        // Store code in memory with email as key
        resetCodes.set(email, {
            code,
            expiresAt,
            attempts: 0
        });

        // Send email with code
        await sendEmail({
            to: user.email,
            template: 'forgot-password-code',
            data: {
                name: user.name,
                code: code,
                expiresIn: '10 minutes'
            }
        });

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'Password reset code requested',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { ipAddress: req.ip, email }
        });

        sendResponse(res, 200, true, 'If an account with that email exists, a reset code has been sent');
    } catch (error) {
        logger.error('Send forgot password code error:', error);
        sendResponse(res, 500, false, 'Server error sending reset code');
    }
};

exports.verifyForgotPasswordCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const resetData = resetCodes.get(email);
        if (!resetData) {
            return sendResponse(res, 400, false, 'Invalid or expired reset code');
        }

        // Check if code has expired
        if (Date.now() > resetData.expiresAt) {
            resetCodes.delete(email);
            return sendResponse(res, 400, false, 'Reset code has expired');
        }

        // Check attempts limit
        if (resetData.attempts >= 3) {
            resetCodes.delete(email);
            return sendResponse(res, 400, false, 'Too many failed attempts. Please request a new code.');
        }

        // Verify code
        if (resetData.code !== code) {
            resetData.attempts += 1;
            resetCodes.set(email, resetData);
            return sendResponse(res, 400, false, 'Invalid reset code');
        }

        // Code is valid, keep it for password reset
        sendResponse(res, 200, true, 'Reset code verified successfully');
    } catch (error) {
        logger.error('Verify forgot password code error:', error);
        sendResponse(res, 500, false, 'Server error verifying reset code');
    }
};

exports.resetPasswordWithCode = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        const resetData = resetCodes.get(email);
        if (!resetData) {
            return sendResponse(res, 400, false, 'Invalid or expired reset code');
        }

        // Check if code has expired
        if (Date.now() > resetData.expiresAt) {
            resetCodes.delete(email);
            return sendResponse(res, 400, false, 'Reset code has expired');
        }

        // Verify code one more time
        if (resetData.code !== code) {
            resetCodes.delete(email);
            return sendResponse(res, 400, false, 'Invalid reset code');
        }

        // Find user and update password
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            resetCodes.delete(email);
            return sendResponse(res, 400, false, 'User not found');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // End all user sessions
        const userSessions = await user.getSessions();
        await userSessions.endAllSessions();

        // Clean up reset code
        resetCodes.delete(email);

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'profile_update',
            description: 'Password reset completed with code',
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { 
                ipAddress: req.ip,
                endedAllSessions: true 
            },
            severity: 'warning'
        });

        logger.info(`Password reset with code: ${user.email}`);

        sendResponse(res, 200, true, 'Password reset successful. Please log in with your new password.');
    } catch (error) {
        logger.error('Reset password with code error:', error);
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
// EMAIL VERIFICATION (LINK-BASED)
// ============================================================================

exports.verifyEmail = async (req, res) => {
    try {
        const token = req.query.token || req.params.token;
        
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
// EMAIL VERIFICATION (4-DIGIT CODE FLOW for Mobile)
// ============================================================================

// In-memory store for email verification codes (use Redis/DB in production)
const emailVerifyCodes = new Map();

// In-memory store for pending registrations (use Redis/DB in production)
const pendingRegistrations = new Map();

// Export for testing
exports.emailVerifyCodes = emailVerifyCodes;
exports.pendingRegistrations = pendingRegistrations;

exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return sendResponse(res, 400, false, 'Email is required');
        }

        // Check if there's a pending registration
        const pendingData = pendingRegistrations.get(email);
        if (!pendingData) {
            // Do not reveal existence
            return sendResponse(res, 200, true, 'If a registration with that email exists, a code has been sent');
        }

        // Check if registration data is not too old
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - pendingData.createdAt.getTime() > maxAge) {
            pendingRegistrations.delete(email);
            return sendResponse(res, 400, false, 'Registration data has expired. Please register again.');
        }

        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
        emailVerifyCodes.set(email, { code, expiresAt, attempts: 0 });

        try {
            await sendEmail({
                to: email,
                template: 'email-verification-code',
                subject: 'Your verification code',
                data: { name: pendingData.name, code, expiresIn: '10 minutes' }
            });
        } catch (emailErr) {
            // Log but do not fail the request; code is generated and valid
            logger.warn('Email send failed for verification code, continuing:', emailErr?.message || emailErr);
        }

        return sendResponse(res, 200, true, 'Verification code sent');
    } catch (error) {
        logger.error('Resend verification code error:', error);
        return sendResponse(res, 500, false, 'Server error resending verification code');
    }
};

exports.verifyEmailCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return sendResponse(res, 400, false, 'Email and code are required');
        }

        const record = emailVerifyCodes.get(email);
        if (!record) {
            return sendResponse(res, 400, false, 'Invalid or expired verification code');
        }
        if (Date.now() > record.expiresAt) {
            emailVerifyCodes.delete(email);
            return sendResponse(res, 400, false, 'Verification code has expired');
        }
        if (record.attempts >= 5) {
            emailVerifyCodes.delete(email);
            return sendResponse(res, 400, false, 'Too many failed attempts');
        }
        if (record.code !== code) {
            record.attempts += 1;
            emailVerifyCodes.set(email, record);
            return sendResponse(res, 400, false, 'Invalid verification code');
        }

        // Get pending registration data
        const pendingData = pendingRegistrations.get(email);
        if (!pendingData) {
            emailVerifyCodes.delete(email);
            return sendResponse(res, 404, false, 'No pending registration found for this email');
        }

        // Check if registration data is not too old (e.g., 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - pendingData.createdAt.getTime() > maxAge) {
            pendingRegistrations.delete(email);
            emailVerifyCodes.delete(email);
            return sendResponse(res, 400, false, 'Registration data has expired. Please register again.');
        }

        // Create user only after successful verification
        const user = await User.createWithDefaults({ 
            name: pendingData.name, 
            email: pendingData.email, 
            password: pendingData.password 
        });
        user.emailVerified = true;
        await user.save();

        // Create user session
        const userSessions = await user.getSessions();
        await userSessions.createSession({
            deviceId: pendingData.deviceId,
            deviceInfo: pendingData.deviceInfo,
            ipAddress: pendingData.ipAddress,
            rememberMe: false
        });

        // Handle invitation if present
        if (pendingData.invitation) {
            await pendingData.invitation.accept(user._id);
            const userRoles = await user.getRoles();
            switch (pendingData.invitation.targetEntity.type) {
                case 'Workspace':
                    await userRoles.addWorkspaceRole(pendingData.invitation.targetEntity.id, pendingData.invitation.role);
                    break;
                case 'Space':
                    await userRoles.addSpaceRole(pendingData.invitation.targetEntity.id, pendingData.invitation.role);
                    break;
            }
        }

        // Clean up pending data
        pendingRegistrations.delete(email);
        emailVerifyCodes.delete(email);

        await ActivityLog.logActivity({
            userId: user._id,
            action: 'user_register',
            description: `User registered and verified: ${email}`,
            entity: { type: 'User', id: user._id, name: user.name },
            metadata: { ipAddress: pendingData.ipAddress, userAgent: req.get('User-Agent'), deviceInfo: pendingData.deviceInfo, hasInvitation: !!pendingData.invitation, via: 'code' },
            severity: 'info'
        });

        return sendResponse(res, 200, true, 'Email verified successfully. Please login to continue.', {
            user: user.getPublicProfile()
        });
    } catch (error) {
        logger.error('Verify email code error:', error);
        return sendResponse(res, 500, false, 'Server error verifying email code');
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
        sendResponse(res, 500, false, 'Server error retrieving activity log');
    }
};