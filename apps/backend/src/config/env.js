require('dotenv').config();
const { getNetworkConfig } = require('../utils/network-detector');

// Get automatic network configuration
const networkConfig = getNetworkConfig();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  // Frontend URL - Auto-detected
  FRONTEND_URL: process.env.FRONTEND_URL || networkConfig.frontendURL,
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS Configuration - Auto-detected
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : [
    // Local development
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',

    // Mobile app connections
    'http://192.168.1.101:8080', // Expo dev server
    'http://192.168.1.101:8081', // Expo dev server
    'http://192.168.1.101:8082', // Expo dev server port 8082
    'http://192.168.1.101:8083', // Expo dev server port 8083
    'http://192.168.1.101:8084', // Expo dev server port 8084
    'http://192.168.1.101:3001', // Mobile app direct connection
    'exp://192.168.1.101:8081', // Expo protocol
    'exp://192.168.1.101:8082', // Expo protocol port 8082
    'exp://192.168.1.101:8083', // Expo protocol port 8083
    'exp://192.168.1.101:8084', // Expo protocol port 8084
    
    'http://192.168.1.14:8080', // Expo dev server
    'http://192.168.1.14:8081', // Expo dev server
    'http://192.168.1.14:8082', // Expo dev server port 8082
    'http://192.168.1.14:8083', // Expo dev server port 8083
    'http://192.168.1.14:8084', // Expo dev server port 8084
    'http://192.168.1.14:3001', // Mobile app direct connection
    'exp://192.168.1.14:8081', // Expo protocol
    'exp://192.168.1.14:8082', // Expo protocol port 8082
    'exp://192.168.1.14:8083', // Expo protocol port 8083
    'exp://192.168.1.14:8084', // Expo protocol port 8084
    
    // Allow all origins in development (be careful in production)
    ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
  ],

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // AI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // File Upload Configuration - Auto-detected
  BASE_URL: process.env.BASE_URL || networkConfig.baseURL,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
  
  // GitHub App Configuration
  GITHUB_APP_ID: process.env.GITHUB_APP_ID || '123456',
  GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY || '',

  // Power BI Configuration
  POWERBI_CLIENT_ID: process.env.POWERBI_CLIENT_ID || '',
  POWERBI_CLIENT_SECRET: process.env.POWERBI_CLIENT_SECRET || '',
  POWERBI_TENANT_ID: process.env.POWERBI_TENANT_ID || '',

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
};