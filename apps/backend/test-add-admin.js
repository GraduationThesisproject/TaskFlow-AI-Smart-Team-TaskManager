#!/usr/bin/env node

const axios = require('axios');

async function testAddAdmin() {
  try {
    console.log('🧪 Testing add-admin endpoint...');
    
    // Test data
    const adminData = {
      email: 'testadmin@example.com',
      password: 'TestPassword123!',
      role: 'admin'
    };
    
    console.log('📤 Sending request to add-admin endpoint...');
    console.log('Data:', adminData);
    
    const response = await axios.post('http://localhost:3001/api/admin/users/add-admin', adminData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need a valid token
      }
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testAddAdmin();
