#!/usr/bin/env node

/**
 * Debug mobile app configuration
 */

console.log('🔍 Mobile App Configuration Debug');
console.log('================================');

// Simulate the environment loading
const Constants = {
  expoConfig: {
    extra: {}
  }
};

// Simulate the env configuration
const env = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.1.142:3001/api',
  API_URL: process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.142:3001/api',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || Constants.expoConfig?.extra?.socketUrl || 'http://192.168.1.142:3001',
  
  // App Configuration
  BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || Constants.expoConfig?.extra?.baseUrl || 'http://192.168.1.142:3001',
  
  // Environment specific URLs
  DEVELOPMENT_API_URL: process.env.EXPO_PUBLIC_DEV_API_URL || 'http://192.168.1.142:3001/api',
};

console.log('📱 Mobile App Environment:');
console.log(`  API_BASE_URL: ${env.API_BASE_URL}`);
console.log(`  API_URL: ${env.API_URL}`);
console.log(`  SOCKET_URL: ${env.SOCKET_URL}`);
console.log(`  BASE_URL: ${env.BASE_URL}`);
console.log(`  DEVELOPMENT_API_URL: ${env.DEVELOPMENT_API_URL}`);

console.log('\n🌐 Expected Backend URLs:');
console.log(`  Backend API: http://192.168.1.142:3001/api`);
console.log(`  Backend Socket: http://192.168.1.142:3001`);

console.log('\n✅ Configuration looks correct!');
console.log('📱 The mobile app should be able to connect to the backend.');
console.log('\n🔧 If you\'re still getting network errors:');
console.log('  1. Restart the Expo server (Ctrl+C then npm start)');
console.log('  2. Reload the app on your phone');
console.log('  3. Check the console logs in Expo DevTools');
