#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Simple script to help set up network configuration for physical devices
 * Run this script to automatically generate the correct .env file
 */

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Common network interface names to check
  const preferredInterfaces = ['Wi-Fi', 'Ethernet', 'en0', 'eth0', 'wlan0'];
  
  // First, try to find the preferred interfaces
  for (const interfaceName of preferredInterfaces) {
    const networkInterface = interfaces[interfaceName];
    if (networkInterface) {
      for (const alias of networkInterface) {
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }
  
  // If no preferred interface found, check all interfaces
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    for (const alias of networkInterface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        // Skip common virtual/loopback addresses
        if (!alias.address.startsWith('169.254.') && 
            !alias.address.startsWith('127.') && 
            !alias.address.startsWith('192.168.1.1')) {
          return alias.address;
        }
      }
    }
  }
  
  // Fallback to localhost
  return 'localhost';
}

function generateEnvFile() {
  const localIP = getLocalIP();
  const port = process.env.PORT || 3001;
  const expoPort = process.env.EXPO_PORT || 8081;
  
  const envContent = `# TaskFlow Mobile App Environment Configuration
# Generated automatically - DO NOT EDIT MANUALLY
# Run 'npm run setup-network' to regenerate this file

# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://${localIP}:${port}/api
EXPO_PUBLIC_API_URL=http://${localIP}:${port}/api
EXPO_PUBLIC_BASE_URL=http://${localIP}:${port}
EXPO_PUBLIC_SOCKET_URL=http://${localIP}:${port}

# Development URLs
EXPO_PUBLIC_DEV_API_URL=http://${localIP}:${port}/api
EXPO_PUBLIC_STAGING_API_URL=https://staging-api.taskflow.com/api
EXPO_PUBLIC_PROD_API_URL=https://api.taskflow.com/api

# Expo Configuration
EXPO_PUBLIC_EXPO_URL=exp://${localIP}:${expoPort}

# Network Information
# Detected IP: ${localIP}
# Backend Port: ${port}
# Expo Port: ${expoPort}
# Generated: ${new Date().toISOString()}
`;

  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file generated successfully!');
    console.log(`📍 Detected IP: ${localIP}`);
    console.log(`🔗 API URL: http://${localIP}:${port}/api`);
    console.log(`📱 Expo URL: exp://${localIP}:${expoPort}`);
    console.log(`📁 File location: ${envPath}`);
    console.log('\n🚀 You can now run your mobile app on any device!');
  } catch (error) {
    console.error('❌ Error generating .env file:', error.message);
    process.exit(1);
  }
}

// Run the script
console.log('🌐 Setting up TaskFlow network configuration...');
generateEnvFile();

