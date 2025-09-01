require('dotenv').config();
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing board templates API...');
    
    // Get admin token from environment
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      console.error('❌ No ADMIN_TOKEN found in environment');
      return;
    }
    
    console.log('🔑 Using admin token:', adminToken.substring(0, 20) + '...');
    
    const url = 'http://localhost:3001/api/board-templates/admin';
    console.log('🌐 Testing URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success && data.data && data.data.templates) {
        console.log(`\n📊 Found ${data.data.templates.length} templates`);
        data.data.templates.forEach((template, index) => {
          console.log(`   ${index + 1}. ${template.name} (Active: ${template.isActive})`);
        });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
