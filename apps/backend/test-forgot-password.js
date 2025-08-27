const axios = require('axios');
const env = require('./src/config/env');

async function testForgotPassword() {
    console.log('🔐 Testing Forgot Password Functionality...\n');
    
    const baseURL = env.BASE_URL || 'http://localhost:3001';
    const testEmail = 'jessersekrii11@gmail.com';
    
    console.log(`📧 Testing with email: ${testEmail}`);
    console.log(`🌐 Backend URL: ${baseURL}\n`);
    
    try {
        console.log('📤 Sending password reset request...');
        
        const response = await axios.post(`${baseURL}/api/auth/forgot-password`, {
            email: testEmail
        });
        
        console.log('✅ Password reset request successful!');
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${response.data.message}\n`);
        
        if (response.data.success) {
            console.log('📬 Check your email for the password reset link');
            console.log('   The link should be sent to: ' + testEmail);
            console.log('   If you don\'t see it, check your spam folder\n');
            
            console.log('💡 Next steps:');
            console.log('   1. Check your email for the reset link');
            console.log('   2. Click the link to go to the reset password page');
            console.log('   3. Enter a new password');
            console.log('   4. Test logging in with the new password\n');
        }
        
    } catch (error) {
        console.log('❌ Password reset request failed:');
        
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
            console.log('   No response received - check if backend server is running');
        } else {
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure your backend server is running');
        console.log('   2. Check that SMTP configuration is correct in .env');
        console.log('   3. Verify the email address exists in your database');
        console.log('   4. Check server logs for detailed error messages\n');
    }
}

// Run the test
testForgotPassword().catch(console.error);
