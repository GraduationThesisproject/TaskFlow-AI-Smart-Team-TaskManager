const jwt = require('jsonwebtoken');
const env = require('../config/env');

// Generate JWT token
const generateToken = (userId, expiresIn = env.JWT_EXPIRES_IN) => {
    const payload = {
        id: userId,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn,
        issuer: 'taskflow-api',
        audience: 'taskflow-users'
    });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET, {
            issuer: 'taskflow-api',
            audience: 'taskflow-users'
        });
    } catch (error) {
        throw error;
    }
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    const payload = {
        id: userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: '30d', // Refresh tokens last longer
        issuer: 'taskflow-api',
        audience: 'taskflow-users'
    });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, {
            issuer: 'taskflow-api',
            audience: 'taskflow-users'
        });

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw error;
    }
};

// Generate temporary token (for password reset, email verification, etc.)
const generateTempToken = (data, expiresIn = '1h') => {
    return jwt.sign(data, env.JWT_SECRET, {
        expiresIn,
        issuer: 'taskflow-api',
        audience: 'taskflow-temp'
    });
};

// Verify temporary token
const verifyTempToken = (token) => {
    try {
        return jwt.verify(token, env.JWT_SECRET, {
            issuer: 'taskflow-api',
            audience: 'taskflow-temp'
        });
    } catch (error) {
        throw error;
    }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
    return jwt.decode(token, { complete: true });
};

// Check if token is expired
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

// Get token expiration date
const getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return null;
        
        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
    verifyRefreshToken,
    generateTempToken,
    verifyTempToken,
    decodeToken,
    isTokenExpired,
    getTokenExpiration
};
