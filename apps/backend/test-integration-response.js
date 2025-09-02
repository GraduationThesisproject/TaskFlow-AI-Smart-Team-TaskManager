const axios = require('axios');
const jwt = require('jsonwebtoken');
const Admin = require('./src/models/Admin');

// Test the integration API response structure
const testIntegrationResponse = async () => {
  console.log('🧪 Testing Integration API Response Structure...\n');
  
  try {
    // Create a test admin and token
    let admin = await Admin.findOne({ userEmail: 'test-admin@example.com' });
    
    if (!admin) {
      admin = new Admin({
        userEmail: 'test-admin@example.com',
        userName: 'Test Admin',
        password: 'testpassword123',
        role: 'admin',
        permissions: ['integration:read', 'integration:write', 'integration:delete'],
        isActive: true
      });
      await admin.save();
    }

    const { generateAdminToken } = require('./src/utils/jwt');
    const token = generateAdminToken(admin._id.toString());

    // Test the API
    const response = await axios.get('http://localhost:3001/api/integrations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response Structure:');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');

    // Check if the response has the expected structure
    if (response.data && typeof response.data === 'object') {
      console.log('✅ Response is an object');
      
      if (Array.isArray(response.data.data)) {
        console.log('✅ Response.data is an array');
        console.log('✅ Number of integrations:', response.data.data.length);
      } else {
        console.log('⚠️ Response.data is not an array:', typeof response.data.data);
      }
      
      if (response.data.success !== undefined) {
        console.log('✅ Response has success property');
      }
      
      if (response.data.message !== undefined) {
        console.log('✅ Response has message property');
      }
    } else {
      console.log('❌ Response is not an object');
    }

    console.log('');
    console.log('🎉 Integration API response structure test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

// Run the test
testIntegrationResponse();
