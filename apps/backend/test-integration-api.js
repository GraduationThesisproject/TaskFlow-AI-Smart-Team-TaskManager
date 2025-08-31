const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:3001/api';
const Integration = require('./src/models/Integration');
const Admin = require('./src/models/Admin');

// Create a test admin token using the JWT utility
const createTestToken = async () => {
  // First, create or find a test admin
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

  // Generate token using the JWT utility
  const { generateAdminToken } = require('./src/utils/jwt');
  return generateAdminToken(admin._id.toString());
};

const testIntegrationAPI = async () => {
  console.log('🧪 Testing Integration API...\n');
  
  try {
    const token = await createTestToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Get integrations (should return empty array initially)
    console.log('📋 Test 1: Getting integrations...');
    const getResponse = await axios.get(`${API_BASE_URL}/integrations`, { headers });
    console.log('✅ GET /integrations:', getResponse.data);
    console.log('');

    // Test 2: Create a test integration
    console.log('📝 Test 2: Creating test integration...');
    const createData = {
      name: 'Test Slack Integration',
      description: 'Test integration for Slack communication',
      category: 'communication',
      status: 'active',
      config: {
        webhookUrl: 'https://hooks.slack.com/test',
        channel: '#general'
      }
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/integrations`, createData, { headers });
    console.log('✅ POST /integrations:', createResponse.data);
    const integrationId = createResponse.data.data._id;
    console.log('');

    // Test 3: Get the created integration
    console.log('🔍 Test 3: Getting specific integration...');
    const getOneResponse = await axios.get(`${API_BASE_URL}/integrations/${integrationId}`, { headers });
    console.log('✅ GET /integrations/:id:', getOneResponse.data);
    console.log('');

    // Test 4: Test connection
    console.log('🔗 Test 4: Testing connection...');
    const testResponse = await axios.post(`${API_BASE_URL}/integrations/${integrationId}/test`, {}, { headers });
    console.log('✅ POST /integrations/:id/test:', testResponse.data);
    console.log('');

    // Test 5: Sync integration
    console.log('🔄 Test 5: Syncing integration...');
    const syncResponse = await axios.post(`${API_BASE_URL}/integrations/${integrationId}/sync`, {}, { headers });
    console.log('✅ POST /integrations/:id/sync:', syncResponse.data);
    console.log('');

    // Test 6: Toggle integration
    console.log('🔄 Test 6: Toggling integration...');
    const toggleResponse = await axios.patch(`${API_BASE_URL}/integrations/${integrationId}/toggle`, {}, { headers });
    console.log('✅ PATCH /integrations/:id/toggle:', toggleResponse.data);
    console.log('');

    // Test 7: Get statistics
    console.log('📊 Test 7: Getting statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/integrations/stats`, { headers });
    console.log('✅ GET /integrations/stats:', statsResponse.data);
    console.log('');

    // Test 8: Update integration
    console.log('✏️ Test 8: Updating integration...');
    const updateData = {
      name: 'Updated Test Slack Integration',
      description: 'Updated test integration for Slack communication'
    };
    const updateResponse = await axios.put(`${API_BASE_URL}/integrations/${integrationId}`, updateData, { headers });
    console.log('✅ PUT /integrations/:id:', updateResponse.data);
    console.log('');

    // Test 9: Delete integration
    console.log('🗑️ Test 9: Deleting integration...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/integrations/${integrationId}`, { headers });
    console.log('✅ DELETE /integrations/:id:', deleteResponse.data);
    console.log('');

    console.log('🎉 All API tests passed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  ✅ GET /integrations - List integrations');
    console.log('  ✅ POST /integrations - Create integration');
    console.log('  ✅ GET /integrations/:id - Get specific integration');
    console.log('  ✅ POST /integrations/:id/test - Test connection');
    console.log('  ✅ POST /integrations/:id/sync - Sync integration');
    console.log('  ✅ PATCH /integrations/:id/toggle - Toggle integration');
    console.log('  ✅ GET /integrations/stats - Get statistics');
    console.log('  ✅ PUT /integrations/:id - Update integration');
    console.log('  ✅ DELETE /integrations/:id - Delete integration');

  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
};

// Run the test
testIntegrationAPI();
