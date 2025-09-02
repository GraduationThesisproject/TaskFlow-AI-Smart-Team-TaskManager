const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

// Email templates with professional design
const templates = {
    'welcome': {
        subject: 'Welcome to TaskFlow! 🚀',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to TaskFlow</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">🎉 Welcome to TaskFlow!</h1>
                        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your journey to better project management starts now</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            Welcome to TaskFlow! We're thrilled to have you on board. TaskFlow is designed to help you and your team 
                            manage projects more efficiently, collaborate seamlessly, and achieve your goals faster.
                        </p>
                        
                        <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 30px 0;">
                            <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">🚀 Get Started</h3>
                            <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>Create your first project</li>
                                <li>Invite team members</li>
                                <li>Set up your first board</li>
                                <li>Start organizing tasks</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                🎯 Go to Dashboard
                            </a>
                        </div>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px;">
                            If you have any questions or need assistance, our support team is here to help. 
                            Don't hesitate to reach out!
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Best regards,</p>
                        <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 16px;">The TaskFlow Team</p>
                        <div style="margin-top: 20px;">
                            <a href="{{supportUrl}}" style="color: #667eea; text-decoration: none; font-size: 14px;">📧 Support</a>
                            <span style="color: #cbd5e1; margin: 0 10px;">•</span>
                            <a href="{{docsUrl}}" style="color: #667eea; text-decoration: none; font-size: 14px;">📚 Documentation</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    'password-reset': {
        subject: '🔐 Reset Your TaskFlow Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🔐 Password Reset Request</h1>
                        <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            We received a request to reset your TaskFlow password. If this was you, click the button below to create a new password.
                        </p>
                        
                        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="background-color: #ef4444; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                    <span style="color: #ffffff; font-size: 12px;">⚠️</span>
                                </div>
                                <h3 style="color: #991b1b; margin: 0; font-size: 16px;">Security Notice</h3>
                            </div>
                            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">
                                This link will expire in <strong>1 hour</strong> for your security. If you didn't request this reset, 
                                please ignore this email and your password will remain unchanged.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
                                🔑 Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{resetUrl}}" style="color: #667eea; word-break: break-all;">{{resetUrl}}</a>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Best regards,</p>
                        <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 16px;">The TaskFlow Team</p>
                        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    'email-verification': {
        subject: '✅ Verify Your TaskFlow Email',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">✅ Verify Your Email</h1>
                        <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">One step away from getting started</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            Thank you for creating your TaskFlow account! To complete your registration and start using our platform, 
                            please verify your email address by clicking the button below.
                        </p>
                        
                        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="background-color: #10b981; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                    <span style="color: #ffffff; font-size: 12px;">✓</span>
                                </div>
                                <h3 style="color: #166534; margin: 0; font-size: 16px;">Quick Verification</h3>
                            </div>
                            <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.5;">
                                This verification ensures your account security and helps us provide you with the best experience.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{verificationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                                ✅ Verify Email Address
                            </a>
                        </div>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">
                            If you didn't create a TaskFlow account, please ignore this email. 
                            If the button doesn't work, copy and paste this link:<br>
                            <a href="{{verificationUrl}}" style="color: #667eea; word-break: break-all;">{{verificationUrl}}</a>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Best regards,</p>
                        <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 16px;">The TaskFlow Team</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    'task-assigned': {
        subject: '📋 New Task Assigned - {{taskTitle}}',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Task Assigned</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">📋 New Task Assigned</h1>
                        <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">You have a new task to work on</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            You have been assigned a new task. Here are the details:
                        </p>
                        
                        <!-- Task Card -->
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                                    <span style="color: #ffffff; font-size: 18px;">📋</span>
                                </div>
                                <div>
                                    <h3 style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 600;">{{taskTitle}}</h3>
                                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Task ID: #{{taskId}}</p>
                                </div>
                            </div>
                            
                            <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">{{taskDescription}}</p>
                            
                            <!-- Task Details -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Priority</p>
                                    <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 14px;">{{priority}}</p>
                                </div>
                                {{#if dueDate}}
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0;">
                                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Due Date</p>
                                    <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 14px;">{{dueDate}}</p>
                                </div>
                                {{/if}}
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{taskUrl}}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                                👀 View Task Details
                            </a>
                        </div>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">
                            You can update the task status, add comments, or attach files directly from the task page.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Best regards,</p>
                        <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 16px;">The TaskFlow Team</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    'project-invitation': {
        subject: '🤝 You\'ve been invited to join {{projectName}}',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Project Invitation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🤝 Project Invitation</h1>
                        <p style="color: #ddd6fe; margin: 10px 0 0 0; font-size: 16px;">Join the team and start collaborating</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello {{name}},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            <strong>{{inviterName}}</strong> has invited you to join the project <strong>"{{projectName}}"</strong> on TaskFlow.
                        </p>
                        
                        <!-- Project Card -->
                        <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #e9d5ff; border-radius: 16px; padding: 24px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                                    <span style="color: #ffffff; font-size: 18px;">📁</span>
                                </div>
                                <div>
                                    <h3 style="color: #1e293b; margin: 0; font-size: 20px; font-weight: 600;">{{projectName}}</h3>
                                    <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Invited by {{inviterName}}</p>
                                </div>
                            </div>
                            
                            {{#if projectDescription}}
                            <p style="color: #475569; line-height: 1.6; margin: 0; font-size: 16px; font-style: italic;">{{projectDescription}}</p>
                            {{/if}}
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{invitationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);">
                                ✅ Accept Invitation
                            </a>
                        </div>
                        
                        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                                <span style="color: #0369a1; font-size: 16px; margin-right: 8px;">💡</span>
                                <h4 style="color: #0369a1; margin: 0; font-size: 14px;">New to TaskFlow?</h4>
                            </div>
                            <p style="color: #0c4a6e; margin: 0; font-size: 14px; line-height: 1.5;">
                                If you don't have a TaskFlow account yet, you'll be prompted to create one when you accept the invitation. 
                                It only takes a minute to get started!
                            </p>
                        </div>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">
                            This invitation will expire in 7 days. If you have any questions, feel free to reach out to {{inviterName}}.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Best regards,</p>
                        <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 16px;">The TaskFlow Team</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    'payment-confirmation': {
        subject: '💳 Payment Confirmed - Welcome to {{planName}}!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">🎉 Payment Successful!</h1>
                        <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Welcome to {{planName}} plan</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Hello {{customerName}},</h2>
                        
                        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            Thank you for your payment! Your subscription to the <strong>{{planName}}</strong> plan has been successfully activated. 
                            You now have access to all premium features.
                        </p>
                        
                        <!-- Payment Summary Card -->
                        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin: 30px 0;">
                            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                                    <span style="color: #ffffff; font-size: 18px;">💳</span>
                                </div>
                                <div>
                                    <h3 style="color: #166534; margin: 0; font-size: 20px; font-weight: 600;">Payment Summary</h3>
                                    <p style="color: #16a34a; margin: 5px 0 0 0; font-size: 14px;">Transaction completed successfully</p>
                                </div>
                            </div>
                            
                            <!-- Payment Details Grid -->
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #d1fae5;">
                                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Plan</p>
                                    <p style="color: #166534; margin: 0; font-weight: 600; font-size: 16px;">{{planName}}</p>
                                </div>
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #d1fae5;">
                                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Amount</p>
                                    <p style="color: #166534; margin: 0; font-weight: 600; font-size: 16px;">{{amount}}</p>
                                </div>
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #d1fae5;">
                                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Billing Cycle</p>
                                    <p style="color: #166534; margin: 0; font-weight: 600; font-size: 16px;">{{billingCycle}}</p>
                                </div>
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #d1fae5;">
                                    <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Transaction ID</p>
                                    <p style="color: #166534; margin: 0; font-weight: 600; font-size: 14px;">{{transactionId}}</p>
                                </div>
                            </div>
                            
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1fae5;">
                                <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; font-weight: 600;">Payment Date</p>
                                <p style="color: #166534; margin: 0; font-weight: 600; font-size: 14px;">{{paymentDate}}</p>
                            </div>
                        </div>
                        
                        <!-- Features Unlocked -->
                        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0;">
                            <h3 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">🚀 Features Now Available</h3>
                            <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
                                {{#if isPremium}}
                                <li>Unlimited projects and workspaces</li>
                                <li>Advanced analytics and reporting</li>
                                <li>Priority customer support</li>
                                <li>Custom integrations</li>
                                {{/if}}
                                {{#if isEnterprise}}
                                <li>Everything in Premium</li>
                                <li>Advanced security features</li>
                                <li>Dedicated account manager</li>
                                <li>Custom branding options</li>
                                <li>SSO integration</li>
                                {{/if}}
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); margin-right: 16px;">
                                🎯 Go to Dashboard
                            </a>
                            <a href="{{billingUrl}}" style="display: inline-block; background: #ffffff; color: #10b981; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #10b981;">
                                📄 View Receipt
                            </a>
                        </div>
                        
                        <p style="color: #64748b; line-height: 1.6; margin: 0; font-size: 14px;">
                            Your subscription is now active and will automatically renew on {{nextBillingDate}}. 
                            You can manage your subscription and billing details from your account settings.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Best regards,</p>
                        <p style="color: #1e293b; margin: 0; font-weight: 600; font-size: 16px;">The TaskFlow Team</p>
                        <div style="margin-top: 20px;">
                            <a href="{{supportUrl}}" style="color: #667eea; text-decoration: none; font-size: 14px;">📧 Support</a>
                            <span style="color: #cbd5e1; margin: 0 10px;">•</span>
                            <a href="{{billingUrl}}" style="color: #667eea; text-decoration: none; font-size: 14px;">💳 Billing</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
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

        // For development, use console logging if using placeholder password
        if (env.NODE_ENV === 'development' && 
            (env.SMTP_PASS === "epwj octj wqlk zsbc" || 
             env.SMTP_PASS.includes('your_') || 
             env.SMTP_PASS.includes('placeholder'))) {
            logger.warn('Using development mode - emails will be logged to console');
            return;
        }

        this.transporter = nodemailer.createTransport({
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
                // In development mode, log the email instead of sending it
                if (env.NODE_ENV === 'development') {
                    logger.info('📧 DEVELOPMENT MODE - Email would be sent:', {
                        to,
                        subject: template ? templates[template]?.subject : subject,
                        template,
                        data,
                        resetUrl: data.resetUrl || 'N/A'
                    });
                    
                    // For password reset, log the reset URL prominently
                    if (template === 'password-reset' && data.resetUrl) {
                        console.log('\n🔗 PASSWORD RESET URL (for testing):');
                        console.log('   ' + data.resetUrl);
                        console.log('   Copy this URL to test password reset\n');
                    }
                    
                    return { messageId: 'dev-mode-' + Date.now() };
                }
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
