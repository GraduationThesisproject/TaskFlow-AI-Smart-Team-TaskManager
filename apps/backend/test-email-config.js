const { sendEmail } = require('./src/utils/email');
const env = require('./src/config/env');

async function testEmailConfiguration() {
    console.log('🔧 Testing Email Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`   NODE_ENV: ${env.NODE_ENV}`);
    console.log(`   SMTP_HOST: ${env.SMTP_HOST || 'NOT SET'}`);
    console.log(`   SMTP_PORT: ${env.SMTP_PORT || 'NOT SET'}`);
    console.log(`   SMTP_USER: ${env.SMTP_USER || 'NOT SET'}`);
    console.log(`   SMTP_PASS: ${env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET'}`);
    console.log(`   FRONTEND_URL: ${env.FRONTEND_URL}\n`);
    
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
        console.log('❌ Email configuration is incomplete!');
        console.log('   Please add SMTP settings to your .env file:\n');
        console.log('   SMTP_HOST=smtp.gmail.com');
        console.log('   SMTP_PORT=587');
        console.log('   SMTP_USER=jessersekrii11@gmail.com');
        console.log('   SMTP_PASS=your-gmail-app-password\n');
        return;
    }
    
    console.log('✅ Email configuration looks good!\n');
    
    // Test sending a password reset email
    try {
        console.log('📧 Testing password reset email...');
        
        const testData = {
            name: 'Test User',
            resetToken: 'test-token-12345',
            resetUrl: `${env.FRONTEND_URL}/reset-password?token=test-token-12345`
        };
        
        const result = await sendEmail({
            to: 'jessersekrii11@gmail.com',
            template: 'password-reset',
            data: testData
        });
        
        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Reset URL: ${testData.resetUrl}\n`);
        
        if (env.NODE_ENV === 'development') {
            console.log('💡 Development Mode: Email was logged to console instead of being sent');
            console.log('   Check the server logs above for the email content\n');
        }
        
    } catch (error) {
        console.log('❌ Failed to send email:');
        console.log(`   Error: ${error.message}\n`);
        
        if (error.message.includes('authentication')) {
            console.log('🔐 Authentication Error - Check your Gmail credentials:');
            console.log('   1. Make sure you\'re using an App Password (not regular password)');
            console.log('   2. Enable 2-Factor Authentication on your Google account');
            console.log('   3. Generate App Password: Google Account → Security → App passwords\n');
        }
    }
}

// Run the test
testEmailConfiguration().catch(console.error);
