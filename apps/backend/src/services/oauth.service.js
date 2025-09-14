const axios = require('axios');
const logger = require('../config/logger');
const env = require('../config/env');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { encryptToken } = require('../utils/github');

class OAuthService {
  constructor() {
    this.googleApiUrl = 'https://www.googleapis.com/oauth2/v2';
    this.githubApiUrl = 'https://api.github.com';
  }

  // Google OAuth for mobile - verify access token and get user info
  async verifyGoogleToken(accessToken) {
    try {
      const response = await axios.get(`${this.googleApiUrl}/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
        verified_email: response.data.verified_email
      };
    } catch (error) {
      logger.error('Error verifying Google token:', error.response?.data || error.message);
      throw new Error(`Failed to verify Google token: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // GitHub OAuth for mobile - exchange code for access token and get user info
  async exchangeGitHubCodeForToken(code) {
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error) {
        throw new Error(`GitHub token exchange failed: ${response.data.error_description || response.data.error}`);
      }

      return response.data;
    } catch (error) {
      logger.error('Error exchanging GitHub code for token:', error.response?.data || error.message);
      throw new Error(`Failed to exchange GitHub code: ${error.response?.data?.error_description || error.message}`);
    }
  }

  // Get GitHub user profile using access token
  async getGitHubUserProfile(accessToken) {
    try {
      const response = await axios.get(`${this.githubApiUrl}/user`, {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskFlow-AI'
        }
      });

      // Get user's primary email
      let email = response.data.email;
      if (!email) {
        const emailResponse = await axios.get(`${this.githubApiUrl}/user/emails`, {
          headers: {
            'Authorization': `token ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'TaskFlow-AI'
          }
        });
        const primaryEmail = emailResponse.data.find(e => e.primary);
        email = primaryEmail ? primaryEmail.email : emailResponse.data[0]?.email;
      }

      return {
        id: response.data.id,
        login: response.data.login,
        email: email,
        name: response.data.name || response.data.login,
        avatar: response.data.avatar_url,
        bio: response.data.bio,
        company: response.data.company,
        location: response.data.location,
        blog: response.data.blog,
        twitter_username: response.data.twitter_username,
        public_repos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };
    } catch (error) {
      logger.error('Error getting GitHub user profile:', error.response?.data || error.message);
      throw new Error(`Failed to get GitHub user profile: ${error.response?.data?.message || error.message}`);
    }
  }

  // Find or create user for Google OAuth
  async findOrCreateGoogleUser(googleProfile) {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ 'google.id': googleProfile.id });
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return user;
      }

      // Check if user exists with this email
      user = await User.findOne({ email: googleProfile.email });
      
      if (user) {
        // Link Google account to existing user
        user.google = {
          id: googleProfile.id,
          email: googleProfile.email,
          name: googleProfile.name,
          picture: googleProfile.picture,
          verified: googleProfile.verified_email
        };
        
        // Add Google to OAuth providers
        if (!user.oauthProviders) {
          user.oauthProviders = [];
        }
        if (!user.oauthProviders.includes('google')) {
          user.oauthProviders.push('google');
        }
        
        user.lastLogin = new Date();
        await user.save();
        return user;
      }

      // Create new user
      user = new User({
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.picture,
        isEmailVerified: googleProfile.verified_email,
        google: {
          id: googleProfile.id,
          email: googleProfile.email,
          name: googleProfile.name,
          picture: googleProfile.picture,
          verified: googleProfile.verified_email
        },
        oauthProviders: ['google'],
        lastLogin: new Date()
      });

      await user.save();
      return user;
    } catch (error) {
      logger.error('Error finding/creating Google user:', error);
      throw new Error('Failed to process Google user data');
    }
  }

  // Find or create user for GitHub OAuth
  async findOrCreateGitHubUser(githubProfile) {
    try {
      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ 'github.githubId': githubProfile.id });
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return user;
      }

      // Check if user exists with this email
      user = await User.findOne({ email: githubProfile.email });
      
      if (user) {
        // Link GitHub account to existing user
        user.github = {
          githubId: githubProfile.id,
          username: githubProfile.login,
          email: githubProfile.email,
          avatar: githubProfile.avatar,
          name: githubProfile.name,
          bio: githubProfile.bio,
          company: githubProfile.company,
          location: githubProfile.location,
          blog: githubProfile.blog,
          twitter_username: githubProfile.twitter_username,
          public_repos: githubProfile.public_repos,
          followers: githubProfile.followers,
          following: githubProfile.following,
          lastSync: new Date()
        };
        
        // Add GitHub to OAuth providers
        if (!user.oauthProviders) {
          user.oauthProviders = [];
        }
        if (!user.oauthProviders.includes('github')) {
          user.oauthProviders.push('github');
        }
        
        user.lastLogin = new Date();
        await user.save();
        return user;
      }

      // Create new user
      user = new User({
        email: githubProfile.email,
        name: githubProfile.name || githubProfile.login,
        avatar: githubProfile.avatar,
        isEmailVerified: true, // GitHub emails are typically verified
        github: {
          githubId: githubProfile.id,
          username: githubProfile.login,
          email: githubProfile.email,
          avatar: githubProfile.avatar,
          name: githubProfile.name,
          bio: githubProfile.bio,
          company: githubProfile.company,
          location: githubProfile.location,
          blog: githubProfile.blog,
          twitter_username: githubProfile.twitter_username,
          public_repos: githubProfile.public_repos,
          followers: githubProfile.followers,
          following: githubProfile.following,
          lastSync: new Date()
        },
        oauthProviders: ['github'],
        lastLogin: new Date()
      });

      await user.save();
      return user;
    } catch (error) {
      logger.error('Error finding/creating GitHub user:', error);
      throw new Error('Failed to process GitHub user data');
    }
  }

  // Generate authentication response
  generateAuthResponse(user) {
    const token = generateToken(user._id);
    
    return {
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          oauthProviders: user.oauthProviders || [],
          lastLogin: user.lastLogin
        }
      }
    };
  }
}

module.exports = new OAuthService();
