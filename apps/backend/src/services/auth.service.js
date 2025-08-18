const User = require('../models/User');
const UserSessions = require('../models/UserSessions');
const UserPreferences = require('../models/UserPreferences');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

class AuthService {
    // Verify JWT token with session validation
    async verifyToken(token, deviceId = null) {
        try {
            const decoded = jwt.verifyToken(token);
            const user = await User.findById(decoded.id);
            
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            // Validate active session if deviceId provided
            if (deviceId) {
                const userSessions = await user.getSessions();
                const session = userSessions.getSessionByDevice(deviceId);
                
                if (!session || !session.isActive) {
                    throw new Error('Session not found or expired');
                }

                // Update session activity
                await userSessions.updateActivity(session.sessionId);
            }

            return user;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    // Generate password reset token
    async generatePasswordResetToken(email) {
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new Error('User not found with this email');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token to user (you'd need to add these fields to User model)
        // user.passwordResetToken = resetToken;
        // user.passwordResetExpiry = resetTokenExpiry;
        // await user.save();

        // Send reset email
        await sendEmail({
            to: user.email,
            subject: 'Password Reset - TaskFlow',
            template: 'password-reset',
            data: {
                name: user.name,
                resetToken,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
            }
        });

        return { message: 'Password reset email sent' };
    }

    // Reset password with token
    async resetPassword(token, newPassword) {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;
        
        await user.save();

        return { message: 'Password reset successful' };
    }

    // Verify email address
    async verifyEmail(token) {
        const user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            throw new Error('Invalid verification token');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        
        await user.save();

        return { message: 'Email verified successfully' };
    }

    // Resend email verification
    async resendEmailVerification(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.isEmailVerified) {
            throw new Error('Email already verified');
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        await user.save();

        await sendEmail({
            to: user.email,
            subject: 'Verify Your Email - TaskFlow',
            template: 'email-verification',
            data: {
                name: user.name,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
            }
        });

        return { message: 'Verification email sent' };
    }

    // Get user profile with additional data
    async getProfile(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Get related data
        const [preferences, sessions, roles, stats] = await Promise.all([
            user.getPreferences(),
            user.getSessions(),
            user.getRoles(),
            this.getUserStats(userId)
        ]);

        return {
            user: user.getPublicProfile(),
            preferences,
            sessions: {
                active: sessions.sessions.filter(s => s.isActive).length,
                total: sessions.sessions.length
            },
            roles: {
                workspaces: roles.workspaces.length,
                projects: roles.projects.length,
                spaces: roles.spaces.length
            },
            stats
        };
    }

    // Get user statistics
    async getUserStats(userId) {
        const Task = require('../models/Task');
        const Project = require('../models/Project');

        const [
            totalTasks,
            completedTasks,
            totalProjects,
            tasksThisWeek
        ] = await Promise.all([
            Task.countDocuments({ assignees: userId }),
            Task.countDocuments({ assignees: userId, status: 'completed' }),
            Project.countDocuments({ 
                $or: [
                    { owner: userId },
                    { 'members.user': userId }
                ]
            }),
            Task.countDocuments({ 
                assignees: userId,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
        ]);

        return {
            totalTasks,
            completedTasks,
            totalProjects,
            tasksThisWeek,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }
}

module.exports = new AuthService();
