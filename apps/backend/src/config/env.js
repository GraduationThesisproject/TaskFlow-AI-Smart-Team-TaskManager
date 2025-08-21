require('dotenv').config();
//Loads values from .env file into process.env.
module.exports = {
    //👉 Exports all the settings as an object so you can use them anywhere in your app.
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3001,
    //NODE_ENV → tells if your app is in "development", "production", or "test".
    //Default is development.
    //PORT → which port the server runs on. If not set, defaults to 3001.

    // Database
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow',
    /*DATABASE_URL → where MongoDB is located.
If .env doesn’t have it, it falls back to mongodb://localhost:27017/taskflow (local MongoDB).*/

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    /*JWT_SECRET → the "secret key" used to sign authentication tokens.
(Like a lock 🔐 – never share it).
JWT_EXPIRES_IN → how long a token lasts (e.g., 7d = 7 days).*/


    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
    
/*CORS_ORIGIN → list of allowed frontend URLs that can talk to your backend.
If .env has:

CORS_ORIGIN=http://myapp.com,http://admin.myapp.com


It will split that into an array:

['http://myapp.com', 'http://admin.myapp.com']


Default is localhost (your React apps).*/



    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    /*SMTP_HOST → your email server (e.g., Gmail, Outlook, SendGrid).

SMTP_PORT → port for sending email (default 587).

SMTP_USER → your email username.

SMTP_PASS → your email password or API key.

👉 Used for sending signup confirmation / password reset emails.*/







    // AI
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    //OPENAI_API_KEY → your API key for using AI (e.g., ChatGPT in your app)




    // File Upload (Local Storage)
    BASE_URL: process.env.BASE_URL || 'http://localhost:3001',
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10485760', // 10MB in bytes
    /*BASE_URL → the base URL of your backend (for file links).

UPLOAD_DIR → the folder where uploaded files are stored.

MAX_FILE_SIZE → maximum allowed file size (here 10 MB). */
};
