const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

// Email templates
const templates = {
    'welcome': {
        subject: 'Welcome to TaskFlow!',
        html: `
            <h1>Welcome to TaskFlow, {{name}}!</h1>
            <p>Thank you for joining TaskFlow. We're excited to help you manage your projects and tasks more efficiently.</p>
            <p>Get started by creating your first project and inviting your team members.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <br>
            <p>Best regards,<br>The TaskFlow Team</p>
        `
    },
    'password-reset': {
        subject: 'Reset Your TaskFlow Password',
        html: `
            <h1>Password Reset Request</h1>
            <p>Hi {{name}},</p>
            <p>We received a request to reset your TaskFlow password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="{{resetUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The TaskFlow Team</p>
        `
    },
    'email-verification': {
        subject: 'Verify Your TaskFlow Email',
        html: `
            <h1>Verify Your Email Address</h1>
            <p>Hi {{name}},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="{{verificationUrl}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
            <p>If you didn't create a TaskFlow account, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The TaskFlow Team</p>
        `
    },
    'task-assigned': {
        subject: 'New Task Assigned - {{taskTitle}}',
        html: `
            <h1>New Task Assigned</h1>
            <p>Hi {{name}},</p>
            <p>You have been assigned a new task:</p>
            <div style="border-left: 4px solid #3B82F6; padding: 16px; margin: 16px 0; background-color: #F8FAFC;">
                <h3>{{taskTitle}}</h3>
                <p>{{taskDescription}}</p>
                <p><strong>Priority:</strong> {{priority}}</p>
                {{#if dueDate}}<p><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
            </div>
            <a href="{{taskUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Task</a>
            <br><br>
            <p>Best regards,<br>The TaskFlow Team</p>
        `
    },
    'project-invitation': {
        subject: 'You\'ve been invited to join {{projectName}}',
        html: `
            <h1>Project Invitation</h1>
            <p>Hi {{name}},</p>
            <p>{{inviterName}} has invited you to join the project "{{projectName}}" on TaskFlow.</p>
            <p>{{#if projectDescription}}<em>{{projectDescription}}</em>{{/if}}</p>
            <a href="{{invitationUrl}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
            <p>If you don't have a TaskFlow account yet, you'll be prompted to create one.</p>
            <br>
            <p>Best regards,<br>The TaskFlow Team</p>
        `
    }
};

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    // Initialize email transporter
    initializeTransporter() {
        if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
            logger.warn('Email configuration missing. Email features will be disabled.');
            return;
        }

        this.transporter = nodemailer.createTransporter({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        this.transporter.verify((error, success) => {
            if (error) {
                logger.error('Email transporter verification failed:', error);
            } else {
                logger.info('Email transporter verified successfully');
            }
        });
    }

    // Send email with template
    async sendEmail({ to, subject, template, data = {}, attachments = [] }) {
        try {
            if (!this.transporter) {
                throw new Error('Email transporter not configured');
            }

            let htmlContent;
            let emailSubject = subject;

            // Use template if provided
            if (template && templates[template]) {
                htmlContent = this.processTemplate(templates[template].html, data);
                emailSubject = subject || this.processTemplate(templates[template].subject, data);
            } else if (data.html) {
                htmlContent = data.html;
            } else {
                throw new Error('No email content provided');
            }

            const mailOptions = {
                from: `"TaskFlow" <${env.SMTP_USER}>`,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject: emailSubject,
                html: htmlContent,
                attachments
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            logger.info('Email sent successfully:', {
                to: mailOptions.to,
                subject: emailSubject,
                messageId: result.messageId
            });

            return {
                success: true,
                messageId: result.messageId
            };

        } catch (error) {
            logger.error('Email sending failed:', {
                to,
                subject,
                error: error.message
            });

            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    // Process template with data
    processTemplate(template, data) {
        let processed = template;
        
        // Simple template variable replacement
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, data[key] || '');
        });

        // Handle conditional blocks (simplified Handlebars-like syntax)
        processed = processed.replace(/{{#if (\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
            return data[condition] ? content : '';
        });

        return processed;
    }

    // Send bulk emails
    async sendBulkEmails(emails) {
        const results = [];
        
        for (const email of emails) {
            try {
                const result = await this.sendEmail(email);
                results.push({ ...email, result, success: true });
            } catch (error) {
                results.push({ ...email, error: error.message, success: false });
            }
        }

        return results;
    }

    // Send notification email
    async sendNotificationEmail(userId, type, data) {
        const User = require('../models/User');
        
        try {
            const user = await User.findById(userId);
            
            if (!user || !user.preferences.notifications.email) {
                return { success: false, reason: 'Email notifications disabled' };
            }

            return await this.sendEmail({
                to: user.email,
                template: type,
                data: {
                    name: user.name,
                    ...data
                }
            });

        } catch (error) {
            logger.error('Notification email failed:', error);
            throw error;
        }
    }

    // Queue email for later sending (useful for rate limiting)
    queueEmail(emailData) {
        // In a production app, you might use a job queue like Bull
        // For now, we'll just send immediately
        return this.sendEmail(emailData);
    }
}

// Create singleton instance
const emailService = new EmailService();

// Export functions
const sendEmail = (data) => emailService.sendEmail(data);
const sendBulkEmails = (emails) => emailService.sendBulkEmails(emails);
const sendNotificationEmail = (userId, type, data) => 
    emailService.sendNotificationEmail(userId, type, data);

module.exports = {
    EmailService,
    sendEmail,
    sendBulkEmails,
    sendNotificationEmail,
    templates
};
