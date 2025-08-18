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
    
    // Cloudinary File Upload
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dodvvsdzt',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '275559436125618',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'DTPID8ww2iUvjgGU83618lRP9QY',
    CLOUDINARY_URL: process.env.CLOUDINARY_URL || 'cloudinary://275559436125618:DTPID8ww2iUvjgGU83618lRP9QY@dodvvsdzt',
};
