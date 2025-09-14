const os = require('os');

/**
 * Automatically detect the local network IP address
 * This eliminates the need to manually update IP addresses when switching devices
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
            !alias.address.startsWith('10.0.2.2') &&
            !alias.address.startsWith('192.168.1.') &&
            !alias.address.startsWith('192.168.1.1')) {
          return alias.address;
        }
      }
    }
  }
  
  // Fallback to localhost
  return 'localhost';
}

/**
 * Get the current network configuration
 */
function getNetworkConfig() {
  const localIP = getLocalIP();
  
  return {
    localIP,
    port: process.env.PORT || 3001,
    frontendPort: process.env.FRONTEND_PORT || 5173,
    expoPort: process.env.EXPO_PORT || 8081,
    baseURL: `http://${localIP}:${process.env.PORT || 3001}`,
    frontendURL: `http://${localIP}:${process.env.FRONTEND_PORT || 5173}`,
    expoURL: `exp://${localIP}:${process.env.EXPO_PORT || 8081}`,
    // Android emulator uses 10.0.2.2 to access host machine
    androidEmulatorURL: `http://10.0.2.2:${process.env.PORT || 3001}`,
  };
}

module.exports = {
  getLocalIP,
  getNetworkConfig
};
