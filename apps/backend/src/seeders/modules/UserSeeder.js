/**
 * User Seeder
 * Handles seeding of users, user preferences, roles, and sessions
 */

const BaseSeeder = require('../base/BaseSeeder');
const seederConfig = require('../config/seeder.config');

// Import models
const User = require('../../models/User');
const UserPreferences = require('../../models/UserPreferences');
const UserRoles = require('../../models/UserRoles');
const UserSessions = require('../../models/UserSessions');

class UserSeeder extends BaseSeeder {
  constructor() {
    super();
    this.environment = process.env.NODE_ENV || 'development';
    this.config = seederConfig.environments[this.environment];
  }

  /**
   * Seed users
   */
  async seed() {
    const totalUsers = this.config.users.count;
    
    await this.initialize(totalUsers, 'Creating Users');
    
    try {
      this.log('👥 Starting user seeding...');
      
      const createdUsers = [];
      
      // Create test users first
      for (const testUserData of this.config.users.testUsers) {
        const userData = await this.createUser(testUserData);
        createdUsers.push(userData);
        this.updateProgress(1, `Created test user: ${testUserData.email}`);
      }
      
      // Create additional random users
      const remainingUsers = totalUsers - this.config.users.testUsers.length;
      
      for (let i = 0; i < remainingUsers; i++) {
        const randomUserData = this.generateRandomUserData();
        const userData = await this.createUser(randomUserData);
        createdUsers.push(userData);
        this.updateProgress(1, `Created random user: ${randomUserData.email}`);
      }
      
      this.completeProgress('All users created successfully');
      this.success(`✅ Created ${createdUsers.length} users`);
      
      return createdUsers;
      
    } catch (error) {
      this.error(`Failed to seed users: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a single user with all related data
   */
  async createUser(userData) {
    try {
      // Validate user data
      if (!this.validate(userData, 'validateUser')) {
        throw new Error(`Invalid user data: ${userData.email}`);
      }

      // Create user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        avatar: userData.avatar || null,
        emailVerified: userData.emailVerified || false,
        isActive: true,
        lastLogin: this.getRandomPastDate(7)
      });

      // Create user preferences
      const preferences = await this.createUserPreferences(user._id);

      // Create user roles
      const roles = await this.createUserRoles(user._id, userData.systemRole);

      // Create user sessions
      const sessions = await this.createUserSessions(user._id);

      // Update user with references
      user.preferences = preferences._id;
      user.roles = roles._id;
      user.sessions = sessions._id;
      await user.save();

      const result = { user, preferences, roles, sessions };
      this.addCreatedData('user', result);

      return result;

    } catch (error) {
      this.error(`Failed to create user ${userData.email}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create user preferences
   */
  async createUserPreferences(userId) {
    const preferences = await UserPreferences.create({
      userId: userId,
      theme: {
        mode: this.getRandomItem(['light', 'dark', 'auto']),
        primaryColor: this.getRandomColor(),
        sidebarCollapsed: this.getRandomBoolean()
      },
      notifications: {
        email: {
          taskAssigned: this.getRandomBoolean(),
          taskCompleted: this.getRandomBoolean(),
          taskOverdue: true,
          commentAdded: this.getRandomBoolean(),
          mentionReceived: true,
          spaceUpdates: this.getRandomBoolean(),
          weeklyDigest: this.getRandomBoolean()
        },
        push: {
          taskAssigned: true,
          taskCompleted: this.getRandomBoolean(),
          taskOverdue: true,
          commentAdded: this.getRandomBoolean(),
          mentionReceived: true,
          spaceUpdates: this.getRandomBoolean()
        },
        inApp: {
          taskAssigned: true,
          taskCompleted: true,
          taskOverdue: true,
          commentAdded: true,
          mentionReceived: true,
          spaceUpdates: true
        }
      },
      ai: {
        enableSuggestions: this.getRandomBoolean(),
        enableRiskAnalysis: this.getRandomBoolean(),
        enableAutoDescription: this.getRandomBoolean(),
        suggestionFrequency: this.getRandomItem(['realtime', 'daily', 'weekly', 'never'])
      },
      dashboard: {
        defaultView: this.getRandomItem(['overview', 'tasks', 'calendar', 'analytics']),
        widgets: [
          {
            type: 'tasks_overview',
            position: 0,
            settings: new Map([['showCompleted', this.getRandomBoolean()]])
          },
          {
            type: 'recent_activity',
            position: 1,
            settings: new Map([['limit', this.getRandomNumber(5, 20)]])
          }
        ]
      }
    });

    this.addCreatedData('userPreferences', preferences);
    return preferences;
  }

  /**
   * Create user roles
   */
  async createUserRoles(userId, systemRole = 'user') {
    const roles = await UserRoles.create({
      userId: userId,
      systemRole: systemRole
    });

    this.addCreatedData('userRoles', roles);
    return roles;
  }

  /**
   * Create user sessions
   */
  async createUserSessions(userId) {
    const sessions = await UserSessions.create({
      userId: userId,
      sessions: [{
        sessionId: this.getRandomUUID(),
        deviceId: this.getRandomUUID(),
        deviceInfo: {
          type: this.getRandomItem(['web', 'mobile', 'desktop']),
          os: this.getRandomItem(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
          browser: this.getRandomItem(['Chrome', 'Firefox', 'Safari', 'Edge']),
          version: this.getRandomSemver(),
          userAgent: this.getRandomUserAgent()
        },
        ipAddress: this.getRandomIP(),
        location: {
          country: this.getRandomCountry(),
          city: this.getRandomCity(),
          timezone: this.getRandomTimezone()
        },
        isActive: true,
        loginAt: this.getRandomPastDate(7),
        lastActivityAt: this.getRandomPastDate(1)
      }]
    });

    this.addCreatedData('userSessions', sessions);
    return sessions;
  }

  /**
   * Generate random user data
   */
  generateRandomUserData() {
    return {
      name: this.getRandomName(),
      email: this.getRandomEmail(),
      password: '12345678A!', // Default password for all seeded users
      systemRole: 'user',
      emailVerified: this.getRandomBoolean(0.8), // 80% verified
      avatar: null // Avatar will be set to null for now, can be updated later with File references
    };
  }

  /**
   * Get random UUID
   */
  getRandomUUID() {
    return this.getRandomText('word') + '-' + Date.now() + '-' + this.getRandomNumber(1000, 9999);
  }

  /**
   * Get random semver
   */
  getRandomSemver() {
    return `${this.getRandomNumber(1, 9)}.${this.getRandomNumber(0, 9)}.${this.getRandomNumber(0, 9)}`;
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
    return this.getRandomItem(userAgents);
  }

  /**
   * Get random IP address
   */
  getRandomIP() {
    return `${this.getRandomNumber(192, 223)}.${this.getRandomNumber(0, 255)}.${this.getRandomNumber(0, 255)}.${this.getRandomNumber(1, 254)}`;
  }

  /**
   * Get random country
   */
  getRandomCountry() {
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'India'];
    return this.getRandomItem(countries);
  }

  /**
   * Get random city
   */
  getRandomCity() {
    const cities = ['New York', 'London', 'Toronto', 'Berlin', 'Paris', 'Sydney', 'Tokyo', 'Mumbai'];
    return this.getRandomItem(cities);
  }

  /**
   * Get random timezone
   */
  getRandomTimezone() {
    const timezones = ['America/New_York', 'Europe/London', 'America/Toronto', 'Europe/Berlin', 'Europe/Paris', 'Australia/Sydney', 'Asia/Tokyo', 'Asia/Kolkata'];
    return this.getRandomItem(timezones);
  }

  /**
   * Get created users
   */
  getCreatedUsers() {
    return this.getCreatedData('user');
  }

  /**
   * Get created user preferences
   */
  getCreatedUserPreferences() {
    return this.getCreatedData('userPreferences');
  }

  /**
   * Get created user roles
   */
  getCreatedUserRoles() {
    return this.getCreatedData('userRoles');
  }

  /**
   * Get created user sessions
   */
  getCreatedUserSessions() {
    return this.getCreatedData('userSessions');
  }

  /**
   * Print user seeding summary
   */
  printUserSummary() {
    const users = this.getCreatedUsers();
    const testUsers = this.config.users.testUsers;
    
    console.log('\n👥 User Seeding Summary:');
    console.log(`  • Total Users Created: ${users.length}`);
    console.log(`  • Test Users: ${testUsers.length}`);
    console.log(`  • Random Users: ${users.length - testUsers.length}`);
    
    console.log('\n📧 Test User Credentials:');
    testUsers.forEach(user => {
      console.log(`  • ${user.email} (password: ${user.password})`);
    });
    
    this.printSummary();
  }
}

module.exports = UserSeeder;
