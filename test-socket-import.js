const path = require('path');

console.log('🔍 Testing Socket Import...\n');

try {
  console.log('📁 Current directory:', process.cwd());
  console.log('📁 Target path:', path.resolve('./apps/backend/src/sockets/notification.socket.js'));
  
  console.log('\n🔌 Testing Admin model import...');
  const Admin = require('./apps/backend/src/models/Admin');
  console.log('✅ Admin model imported successfully');
  console.log('Admin model type:', typeof Admin);
  console.log('Admin model:', Admin);
  
  console.log('\n🔌 Testing notification socket import...');
  const notificationSocket = require('./apps/backend/src/sockets/notification.socket.js');
  console.log('✅ Notification socket imported successfully');
  console.log('Notification socket type:', typeof notificationSocket);
  
} catch (error) {
  console.error('❌ Import error:', error);
  console.error('Error stack:', error.stack);
}
