const axios = require('axios');

async function createFirstAdmin() {
  try {
    console.log('🧪 Creating First Admin User...\n');
    
    const response = await axios.post('http://localhost:3001/api/admin/auth/setup-first-admin', {
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'super_admin'
    });
    
    console.log('✅ First admin created successfully!');
    console.log('Response:', response.data);
    
    console.log('\n🎯 Now you can:');
    console.log('1. Go to the login page');
    console.log('2. Login with: admin@example.com / Admin123!');
    console.log('3. The 401 error should be resolved!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

createFirstAdmin();
