const passport = require('passport');
let GoogleStrategy, GitHubStrategy;

// Try to load OAuth strategies, but don't crash if they're not available
try {
    GoogleStrategy = require('passport-google-oauth20').Strategy;
} catch (error) {
    console.warn('Google OAuth package not installed - Google OAuth disabled');
}

try {
    GitHubStrategy = require('passport-github2').Strategy;
} catch (error) {
    console.warn('GitHub OAuth package not installed - GitHub OAuth disabled');
}

const User = require('../models/User');
const logger = require('./logger');
const env = require('./env');

// Configuration check function
const checkOAuthConfig = (provider, clientId, clientSecret) => {
    if (!clientId || !clientSecret) {
        return { available: false, reason: 'Missing credentials' };
    }
    if (clientId === `placeholder-${provider}-client-id` || clientSecret === `placeholder-${provider}-client-secret`) {
        return { available: false, reason: 'Using placeholder values' };
    }
    return { available: true, reason: 'Configured' };
};

// Google OAuth Strategy - only initialize if credentials are provided and package is available
const googleConfig = checkOAuthConfig('google', env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);

if (GoogleStrategy && googleConfig.available) {
    passport.use(new GoogleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('🔵 Google OAuth Strategy - Profile received');
        console.log('🔵 Profile ID:', profile.id);
        console.log('🔵 Profile emails:', profile.emails);
        console.log('🔵 Profile display name:', profile.displayName);
        console.log('🔵 Profile photos:', profile.photos);
        
        try {
            // Check if user already exists
            const userEmail = profile.emails[0].value;
            console.log('🔵 Looking for existing user with email:', userEmail);
            
            let user = await User.findOne({ email: userEmail });
            
            if (user) {
                console.log('✅ Existing user found:', {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    oauthProviders: user.oauthProviders
                });
                
                // Update OAuth info if needed
                if (!user.oauthProviders || !Array.isArray(user.oauthProviders)) {
                    console.log('🔵 Initializing oauthProviders array');
                    user.oauthProviders = [];
                }
                if (!user.oauthProviders.includes('google')) {
                    console.log('🔵 Adding Google to oauthProviders');
                    user.oauthProviders.push('google');
                    user.googleId = profile.id;
                    await user.save();
                    console.log('✅ User updated with Google OAuth info');
                }
                return done(null, user);
            }
            
            console.log('🔵 No existing user found, creating new user');
            
            // Create new user
            const newUserData = {
                email: userEmail,
                name: profile.displayName,
                avatar: profile.photos[0]?.value,
                googleId: profile.id,
                oauthProviders: ['google'],
                emailVerified: true, // OAuth users are pre-verified
                password: null // No password for OAuth users
            };
            
            console.log('🔵 Creating new user with data:', newUserData);
            
            user = await User.create(newUserData);
            
            console.log('✅ New Google OAuth user created successfully:', {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                oauthProviders: user.oauthProviders
            });
            
            logger.info(`New Google OAuth user created: ${user.email}`);
            return done(null, user);
        } catch (error) {
            console.log('❌ Google OAuth error in strategy:', error);
            logger.error('Google OAuth error:', error);
            return done(error, null);
        }
    }));
    logger.info('Google OAuth strategy initialized');
} else {
    if (!GoogleStrategy) {
        logger.warn('Google OAuth package not available - Google OAuth disabled');
    } else {
        logger.warn(`Google OAuth disabled: ${googleConfig.reason}`);
    }
}

// GitHub OAuth Strategy - only initialize if credentials are provided and package is available
const githubConfig = checkOAuthConfig('github', env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);

console.log('🔍 GitHub OAuth Configuration Check:', {
    hasStrategy: !!GitHubStrategy,
    clientId: env.GITHUB_CLIENT_ID ? `${env.GITHUB_CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
    clientSecret: env.GITHUB_CLIENT_SECRET ? `${env.GITHUB_CLIENT_SECRET.substring(0, 10)}...` : 'NOT SET',
    callbackURL: env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    configAvailable: githubConfig.available,
    reason: githubConfig.reason
});

if (GitHubStrategy && githubConfig.available) {
    console.log('🔵 Initializing GitHub OAuth Strategy with config:', {
        clientID: env.GITHUB_CLIENT_ID,
        callbackURL: env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email']
    });
    
    passport.use(new GitHubStrategy({
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('🟣 GitHub OAuth Strategy - Profile received');
        console.log('🟣 Profile ID:', profile.id);
        console.log('🟣 Profile username:', profile.username);
        console.log('🟣 Profile display name:', profile.displayName);
        console.log('🟣 Profile photos:', profile.photos);
        
        try {
            // Get user email from GitHub
            console.log('🔵 Checking GitHub emails...');
            if (!profile.emails || !profile.emails.length) {
                console.log('❌ No emails found in GitHub profile');
                return done(new Error('No email found from GitHub profile'), null);
            }
            
            console.log('🔵 GitHub emails:', profile.emails);
            const primaryEmail = profile.emails.find(email => email.primary) || profile.emails[0];
            
            if (!primaryEmail) {
                console.log('❌ No usable email found from GitHub profile');
                return done(new Error('No usable email found from GitHub profile'), null);
            }
            
            console.log('🔵 Using email:', primaryEmail.value);
            
            // Check if user already exists
            console.log('🔵 Looking for existing user with email:', primaryEmail.value);
            
            let user = await User.findOne({ email: primaryEmail.value });
            
            if (user) {
                console.log('✅ Existing user found:', {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    oauthProviders: user.oauthProviders
                });
                
                // Update OAuth info if needed
                if (!user.oauthProviders || !Array.isArray(user.oauthProviders)) {
                    console.log('🔵 Initializing oauthProviders array');
                    user.oauthProviders = [];
                }
                if (!user.oauthProviders.includes('github')) {
                    console.log('🔵 Adding GitHub to oauthProviders');
                    user.oauthProviders.push('github');
                    user.githubId = profile.id;
                    await user.save();
                    console.log('✅ User updated with GitHub OAuth info');
                }
                return done(null, user);
            }
            
            console.log('🔵 No existing user found, creating new user');
            
            // Create new user
            const newUserData = {
                email: primaryEmail.value,
                name: profile.displayName || profile.username,
                avatar: profile.photos[0]?.value,
                githubId: profile.id,
                oauthProviders: ['github'],
                emailVerified: true, // OAuth users are pre-verified
                password: null // No password for OAuth users
            };
            
            console.log('🔵 Creating new user with data:', newUserData);
            
            user = await User.create(newUserData);
            
            console.log('✅ New GitHub OAuth user created successfully:', {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                oauthProviders: user.oauthProviders
            });
            
            logger.info(`New GitHub OAuth user created: ${user.email}`);
            return done(null, user);
        } catch (error) {
            console.log('❌ GitHub OAuth error in strategy:', error);
            logger.error('GitHub OAuth error:', error);
            return done(error, null);
        }
    }));
    logger.info('GitHub OAuth strategy initialized');
} else {
    if (!GitHubStrategy) {
        logger.warn('GitHub OAuth package not available - GitHub OAuth disabled');
    } else {
        logger.warn(`GitHub OAuth disabled: ${githubConfig.reason}`);
    }
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Log OAuth configuration summary
const oauthStatus = {
    google: GoogleStrategy && googleConfig.available ? 'enabled' : 'disabled',
    github: GitHubStrategy && githubConfig.available ? 'enabled' : 'disabled'
};

logger.info('OAuth Configuration Status:', oauthStatus);

module.exports = passport;
