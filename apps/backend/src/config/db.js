const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/taskflow', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logger.info(`🗄️  MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
