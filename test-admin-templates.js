const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE = 'http://localhost:3001/api';

async function testAdminTemplates() {
  try {
    console.log('🧪 Testing Admin Templates API...\n');

    // Step 1: Try to login with existing admin first
    console.log('1️⃣ Trying to login with existing admin...');
    const loginResponse = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123456'
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
      
      // If login fails, try to create a new admin
      console.log('🔄 Trying to create new admin...');
      await createNewAdmin();
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful, token received');
    console.log('');

    // Step 2: Test templates endpoints
    console.log('2️⃣ Testing templates endpoints...');
    await testTemplatesEndpoints(token);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function createNewAdmin() {
  try {
    console.log('🔄 Creating first admin user...');
    const createAdminResponse = await fetch(`${API_BASE}/admin/auth/setup-first-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@taskflow.com',
        password: 'admin123456',
        role: 'super_admin'
      }),
    });

    if (!createAdminResponse.ok) {
      const errorData = await createAdminResponse.json();
      console.log('❌ Failed to create admin:', errorData);
      return;
    }

    const adminData = await createAdminResponse.json();
    console.log('✅ Admin created successfully:', adminData.data.admin.email);
    console.log('');

    // Try to login with the new admin
    await testAdminLogin('admin@taskflow.com', 'admin123456');

  } catch (error) {
    console.error('❌ Create admin failed:', error);
  }
}

async function testAdminLogin(email, password) {
  try {
    console.log('🔄 Testing admin login...');
    const loginResponse = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    });

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful, token received');
    console.log('');

    // Test templates endpoints
    await testTemplatesEndpoints(token);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testTemplatesEndpoints(token) {
  try {
    console.log('🧪 Testing templates endpoints...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Test Project Templates
    console.log('📁 Testing Project Templates...');
    const projectTemplatesResponse = await fetch(`${API_BASE}/admin/templates/projects`, { headers });
    const projectTemplatesData = await projectTemplatesResponse.json();
    console.log('Project Templates Response:', projectTemplatesData);
    console.log('');

    // Test Task Templates
    console.log('📋 Testing Task Templates...');
    const taskTemplatesResponse = await fetch(`${API_BASE}/admin/templates/tasks`, { headers });
    const taskTemplatesData = await taskTemplatesResponse.json();
    console.log('Task Templates Response:', taskTemplatesData);
    console.log('');

    // Test AI Prompts
    console.log('🤖 Testing AI Prompts...');
    const aiPromptsResponse = await fetch(`${API_BASE}/admin/templates/ai-prompts`, { headers });
    const aiPromptsData = await aiPromptsResponse.json();
    console.log('AI Prompts Response:', aiPromptsData);
    console.log('');

    // Test Branding Assets
    console.log('🎨 Testing Branding Assets...');
    const brandingAssetsResponse = await fetch(`${API_BASE}/admin/templates/branding`, { headers });
    const brandingAssetsData = await brandingAssetsResponse.json();
    console.log('Branding Assets Response:', brandingAssetsData);
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAdminTemplates();
