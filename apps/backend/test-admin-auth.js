require('dotenv').config();
const axios = require('axios');

async function testAdminAuth() {
  try {
    console.log('🔐 Testing admin authentication...');
    
    const url = 'http://localhost:3001/api/admin/auth/login';
    console.log('🌐 Login URL:', url);
    
    // Test with default admin credentials
    const credentials = {
      email: 'superadmin.test@gmail.com',
      password: 'admin123'
    };
    
    console.log('👤 Using credentials:', credentials.email);
    
    const response = await axios.post(url, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.status === 200) {
      const data = response.data;
      console.log('✅ Login successful!');
      console.log('Token:', data.token ? data.token.substring(0, 20) + '...' : 'No token');
      
      if (data.token) {
        console.log('\n🧪 Now testing board templates API with this token...');
        
        const templatesResponse = await axios.get('http://localhost:3001/api/board-templates/admin', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Templates API status:', templatesResponse.status);
        
        if (templatesResponse.status === 200) {
          const templatesData = templatesResponse.data;
          console.log('✅ Templates API successful!');
          console.log('Found templates:', templatesData.data?.templates?.length || 0);
          
          if (templatesData.data?.templates) {
            templatesData.data.templates.forEach((template, index) => {
              console.log(`   ${index + 1}. ${template.name} (Active: ${template.isActive})`);
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminAuth();
