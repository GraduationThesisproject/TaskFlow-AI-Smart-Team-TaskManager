const logger = require('../config/logger');

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Socket Rate Limiting Middleware
 * Prevents abuse by limiting the number of events per user per time window
 */
const socketRateLimit = (options = {}) => {
    const {
        windowMs = 60000, // 1 minute window
        maxEvents = 100,  // max events per window
        message = 'Rate limit exceeded. Please slow down your requests.',
        skipSuccessfulRequests = false,
        skipFailedRequests = false
    } = options;

    return (socket, next) => {
        const userId = socket.userId || socket.handshake.address;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get or create user's rate limit data
        if (!rateLimitStore.has(userId)) {
            rateLimitStore.set(userId, {
                events: [],
                blocked: false,
                blockUntil: 0
            });
        }

        const userData = rateLimitStore.get(userId);

        // Check if user is currently blocked
        if (userData.blocked && now < userData.blockUntil) {
            logger.warn(`Rate limit exceeded for user ${userId}`);
            return next(new Error(message));
        }

        // Remove old events outside the window
        userData.events = userData.events.filter(timestamp => timestamp > windowStart);

        // Check if user has exceeded the limit
        if (userData.events.length >= maxEvents) {
            // Block user for 5 minutes
            userData.blocked = true;
            userData.blockUntil = now + (5 * 60 * 1000);
            
            logger.warn(`Rate limit exceeded for user ${userId}, blocking for 5 minutes`);
            return next(new Error(message));
        }

        // Add current event
        userData.events.push(now);

        // Reset block status if user was previously blocked
        if (userData.blocked && now >= userData.blockUntil) {
            userData.blocked = false;
            userData.blockUntil = 0;
        }

        next();
    };
};

/**
 * Clean up old rate limit data periodically
 */
const cleanupRateLimitStore = () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const [userId, userData] of rateLimitStore.entries()) {
        // Remove events older than 1 hour
        userData.events = userData.events.filter(timestamp => timestamp > oneHourAgo);
        
        // Remove user data if no recent events and not blocked
        if (userData.events.length === 0 && !userData.blocked) {
            rateLimitStore.delete(userId);
        }
    }
};

// Clean up rate limit store every hour
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);

/**
 * Get rate limit statistics
 */
const getRateLimitStats = () => {
    const stats = {
        totalUsers: rateLimitStore.size,
        blockedUsers: 0,
        totalEvents: 0
    };

    for (const userData of rateLimitStore.values()) {
        if (userData.blocked) {
            stats.blockedUsers++;
        }
        stats.totalEvents += userData.events.length;
    }

    return stats;
};

module.exports = {
    socketRateLimit,
    getRateLimitStats,
    cleanupRateLimitStore
};
