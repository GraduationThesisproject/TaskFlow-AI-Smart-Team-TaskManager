const mongoose = require('mongoose');
/*👉 Mongoose is a tool to connect your app to MongoDB (your database).

It also helps define "models" like User, Post, Order with rules.

Example:

const User = mongoose.model("User", { username: String, email: String });


📌 Without Mongoose, you’d have to write raw database queries (more complicated).*/
const logger = require('./logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow');
        logger.info(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
