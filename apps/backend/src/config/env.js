require('dotenv').config();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://192.168.1.11:8081', // Expo dev server
    'http://192.168.1.11:3001', // Mobile app direct connection
    'http://192.168.1.11:3001', // Alternative network IP
    'http://192.168.1.11:8081', // Alternative Expo dev server
    'exp://192.168.1.11:8081', // Expo protocol
    'exp://192.168.1.11:8081', // Alternative Expo protocol
    // Allow all origins in development (be careful in production)
    ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
  ],

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || 'taskflow.service.team@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'moui lqyz mqag kslm',

  // AI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key',

  // File Upload Configuration
  BASE_URL: process.env.BASE_URL || 'http://localhost:3001',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),

  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '625288272720-qem1ue46j75pt272mab8f35baimqgeag.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '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',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'Ov23liwZN5YwJ4eZvffU',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '1b3a20e1252907cce61a9e382c33f90142a8e73b',
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',

  // Power BI Configuration
  POWERBI_CLIENT_ID: process.env.POWERBI_CLIENT_ID || '',
  POWERBI_CLIENT_SECRET: process.env.POWERBI_CLIENT_SECRET || '',
  POWERBI_TENANT_ID: process.env.POWERBI_TENANT_ID || '',

  // Stripe Configuration
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY||"sk_test_51S0u5XQnbFIuhN9UKC4JnYCbkNV8z7e98bBeI6GekB7zynMKHCriJDHLO8x3bjpefaIhG2QMV1VpyLwAXu4FhQKu00xqTpMdX4",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET||"whsec_1a0bc2cc583042182266c1adb264164b0928717f151bee02a0fdb5f470e33fd9"
};