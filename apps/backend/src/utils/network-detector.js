const os = require('os');

/**
 * Automatically detect the local network IP address
 * This eliminates the need to manually update IP addresses when switching devices
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // Gather all IPv4 candidates (non-internal, non-link-local, non-loopback)
  const candidates = [];
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName] || [];
    for (const alias of networkInterface) {
      if (alias && alias.family === 'IPv4' && !alias.internal) {
        const ip = alias.address || '';
        if (!ip.startsWith('127.') && !ip.startsWith('169.254.')) {
          candidates.push(ip);
        }
      }
    }
  }

  if (candidates.length === 0) return 'localhost';

  // Prefer common LAN ranges: 192.168.x.x, then 10.x.x.x, then 172.16-31.x.x
  const pick = (regex) => candidates.find((ip) => regex.test(ip));
  return (
    pick(/^192\.168\./) ||
    pick(/^10\./) ||
    pick(/^172\.(1[6-9]|2\d|3[0-1])\./) ||
    // Fallback to the first candidate
    candidates[0]
  );
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
