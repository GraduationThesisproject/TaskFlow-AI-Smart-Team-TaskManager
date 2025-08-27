const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFirstAdmin() {
  try {
    console.log('🧪 Testing First Admin Creation...\n');

    // Create first admin user
    console.log('1️⃣ Creating first admin user...');
    const response = await axios.post(`${API_BASE}/admin/auth/setup-first-admin`, {
      email: 'testadmin@example.com',
      password: 'TestPassword123!',
      role: 'moderator'
    });

    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testFirstAdmin();
