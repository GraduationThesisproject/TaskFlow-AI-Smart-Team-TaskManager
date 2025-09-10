require('dotenv').config();

const LOCAL_IP = process.env.LOCAL_IP || 'localhost';
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_PORT = process.env.FRONTEND_PORT || '5173';
const DEFAULT_BASE = `http://${LOCAL_IP}:${PORT}`;
const DEFAULT_FRONTEND = `http://${LOCAL_IP}:${FRONTEND_PORT}`;

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT,

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || DEFAULT_FRONTEND,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  // CORS
  CORS_ORIGIN: [
    DEFAULT_FRONTEND,
    DEFAULT_BASE,
    `exp://${LOCAL_IP}:8081`,
    ...(process.env.NODE_ENV === 'development' ? ['*'] : []),
  ],

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // AI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // File uploads
  BASE_URL: DEFAULT_BASE,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),

  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: `${DEFAULT_BASE}/auth/google/callback`,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: `${DEFAULT_BASE}/api/auth/github/callback`,

  // Power BI
  POWERBI_CLIENT_ID: process.env.POWERBI_CLIENT_ID || '',
  POWERBI_CLIENT_SECRET: process.env.POWERBI_CLIENT_SECRET || '',
  POWERBI_TENANT_ID: process.env.POWERBI_TENANT_ID || '',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
