require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3001,
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow',
    
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
    
    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    
    // AI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    
    // File Upload (Local Storage)
    BASE_URL: process.env.BASE_URL || 'http://localhost:3001',
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10485760', // 10MB in bytes
};
