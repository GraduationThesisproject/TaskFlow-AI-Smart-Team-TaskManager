# 🌱 TaskFlow Database Seeder System

A comprehensive, modular database seeding system for TaskFlow with advanced features including validation, progress tracking, backup/rollback, and environment-specific configurations.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Modular Seeders](#modular-seeders)
- [Advanced Features](#advanced-features)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Features
- **Modular Architecture**: Separate seeders for each entity type
- **Environment-Specific Configurations**: Different settings for development, test, and production
- **Data Validation**: Comprehensive validation before seeding
- **Progress Tracking**: Real-time progress bars with ETA
- **Backup & Rollback**: Automatic backups and rollback functionality
- **Error Handling**: Detailed error reporting and recovery
- **Configuration Management**: Centralized configuration system

### Advanced Features
- **Cross-Seeder Dependencies**: Handle relationships between entities
- **Customizable Data Generation**: Configurable faker options
- **Selective Seeding**: Seed specific modules only
- **Statistics & Reporting**: Detailed seeding summaries
- **Performance Optimization**: Efficient batch operations
- **Extensible Design**: Easy to add new seeders

## 🏗 Architecture

```
src/seeders/
├── config/
│   └── seeder.config.js          # Centralized configuration
├── base/
│   └── BaseSeeder.js             # Base class for all seeders
├── modules/
│   ├── UserSeeder.js             # User seeding module
│   ├── WorkspaceSeeder.js        # Workspace seeding module
│   ├── SpaceSeeder.js            # Space seeding module
│   ├── BoardSeeder.js            # Board seeding module
│   ├── TaskSeeder.js             # Task seeding module
│   └── ...                       # Other entity seeders
├── utils/
│   ├── validator.js              # Data validation utilities
│   ├── progress.js               # Progress tracking utilities
│   └── backup.js                 # Backup and rollback utilities
├── DatabaseSeeder.js             # Main orchestrator
└── index.js                      # Main entry point
```

## 🚀 Quick Start

### Basic Usage

```bash
# Install dependencies
npm install

# Run full seeding
npm run seed:enhanced

# Seed specific modules
npm run seed:enhanced -- --modules users,workspaces

# Seed with custom environment
npm run seed:enhanced -- --environment test
```

### Available Scripts

```bash
# Enhanced seeding (recommended)
npm run seed:enhanced

# Legacy seeding
npm run seed

# Partial seeding
npm run seed:partial users

# Clear database
npm run seed:clear

# Show test users
npm run seed:users

# List backups
npm run seed:backup

# Rollback to previous backup
npm run seed:rollback

# Validate configuration
npm run seed:validate
```

## ⚙️ Configuration

### Environment Configurations

The seeder supports different configurations for each environment:

#### Development Environment
```javascript
{
  users: {
    count: 20,
    testUsers: [
      {
        name: 'Super Admin User',
        email: 'superadmin.test@gmail.com',
        password: '12345678A!',
        systemRole: 'super_admin'
      }
      // ... more test users
    ]
  },
  workspaces: {
    count: 5,
    membersPerWorkspace: { min: 2, max: 8 }
  },
  spaces: {
    perWorkspace: { min: 2, max: 5 }
  }
  // ... more configurations
}
```

#### Test Environment
```javascript
{
  users: {
    count: 10,
    testUsers: [
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: '12345678A!',
        systemRole: 'admin'
      }
    ]
  },
  workspaces: {
    count: 2,
    membersPerWorkspace: { min: 1, max: 3 }
  }
  // ... minimal configurations
}
```

#### Production Environment
```javascript
{
  users: {
    count: 0, // No seeding in production
    testUsers: []
  },
  workspaces: {
    count: 0
  }
  // ... all counts set to 0
}
```

### Customizing Configuration

Edit `src/seeders/config/seeder.config.js` to customize:

- **Data Generation**: Modify faker options and data patterns
- **Validation Rules**: Adjust validation criteria
- **Progress Settings**: Configure progress bar appearance
- **Backup Settings**: Set backup retention and storage options

## 📖 Usage

### Command Line Options

```bash
# Basic seeding
node src/scripts/seed-enhanced.js

# Seed specific modules
node src/scripts/seed-enhanced.js --modules users,workspaces,spaces

# Skip backup creation
node src/scripts/seed-enhanced.js --skip-backup

# Skip validation
node src/scripts/seed-enhanced.js --skip-validation

# Skip progress tracking
node src/scripts/seed-enhanced.js --skip-progress

# Custom environment
node src/scripts/seed-enhanced.js --environment test

# Show help
node src/scripts/seed-enhanced.js --help
```

### Programmatic Usage

```javascript
const DatabaseSeeder = require('./src/seeders');

// Create seeder instance
const seeder = new DatabaseSeeder();

// Run full seeding
await seeder.seed();

// Run with options
await seeder.seed({
  skipBackup: false,
  skipValidation: false,
  skipProgress: false,
  modules: ['users', 'workspaces']
});

// Get seeding statistics
const stats = seeder.getSeedingStats();

// List backups
const backups = await seeder.listBackups();

// Rollback to backup
await seeder.rollback('backup-id');
```

## 🔧 Modular Seeders

### UserSeeder

Handles user creation with preferences, roles, and sessions.

```javascript
const UserSeeder = require('./src/seeders/modules/UserSeeder');

const userSeeder = new UserSeeder();
const users = await userSeeder.seed();
```

**Features:**
- Creates test users with predefined credentials
- Generates random users with realistic data
- Creates user preferences, roles, and sessions
- Validates user data before creation

### Creating Custom Seeders

Extend `BaseSeeder` to create custom seeders:

```javascript
const BaseSeeder = require('./src/seeders/base/BaseSeeder');

class CustomSeeder extends BaseSeeder {
  async seed() {
    await this.initialize(total, 'Custom Seeding');
    
    try {
      // Your seeding logic here
      for (let i = 0; i < total; i++) {
        const data = this.generateData();
        
        if (this.validate(data, 'validateCustom')) {
          const result = await this.createEntity(data);
          this.addCreatedData('custom', result);
          this.updateProgress(1, `Created item ${i + 1}`);
        }
      }
      
      this.completeProgress('Custom seeding completed');
      return this.getCreatedData('custom');
      
    } catch (error) {
      this.error(`Custom seeding failed: ${error.message}`);
      throw error;
    }
  }
  
  generateData() {
    return {
      name: this.getRandomText('word'),
      description: this.getRandomText('sentence'),
      // ... more fields
    };
  }
}
```

## 🔥 Advanced Features

### Backup and Rollback

```javascript
// Create backup
const backupId = await seeder.backupManager.createBackup('Pre-seeding backup');

// List backups
const backups = await seeder.backupManager.listBackups();

// Restore backup
await seeder.backupManager.restoreBackup(backupId);

// Get backup statistics
const stats = await seeder.backupManager.getBackupStats();

// Cleanup old backups
await seeder.backupManager.cleanupOldBackups(7 * 24 * 60 * 60 * 1000); // 7 days
```

### Progress Tracking

```javascript
// Create progress tracker
const progress = new ProgressTracker(100, 'Custom Operation');

// Update progress
progress.update(1, 'Processing item');

// Complete progress
progress.complete('Operation completed');

// Multi-step progress
const multiProgress = new MultiStepProgressTracker(['Step 1', 'Step 2', 'Step 3']);
multiProgress.startStep(0, 50);
multiProgress.updateStep(1, 'Processing');
multiProgress.completeStep('Step 1 completed');
```

### Data Validation

```javascript
const validator = new SeederValidator();

// Validate user data
const result = validator.validateUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: '12345678A!'
});

if (result.errors.length > 0) {
  console.error('Validation errors:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('Validation warnings:', result.warnings);
}
```

## 📚 API Reference

### DatabaseSeeder

#### Methods

- `seed(options)` - Run the main seeding process
- `rollback(backupId)` - Rollback to a specific backup
- `listBackups()` - List available backups
- `getBackupStats()` - Get backup statistics
- `cleanupBackups(maxAge)` - Cleanup old backups
- `validateConfiguration()` - Validate seeding configuration
- `getCreatedData(type)` - Get created data by type
- `getAllCreatedData()` - Get all created data
- `getSeedingStats()` - Get seeding statistics

#### Options

- `skipBackup` (boolean) - Skip backup creation
- `skipValidation` (boolean) - Skip data validation
- `skipProgress` (boolean) - Skip progress tracking
- `modules` (array) - Specific modules to seed

### BaseSeeder

#### Methods

- `initialize(total, title)` - Initialize the seeder
- `updateProgress(increment, message)` - Update progress
- `completeProgress(message)` - Complete progress
- `log(message)` - Log message
- `error(message)` - Log error
- `warning(message)` - Log warning
- `success(message)` - Log success
- `validate(data, method)` - Validate data
- `getRandomItem(array)` - Get random item from array
- `getRandomItems(array, options)` - Get random items from array
- `getRandomDate(start, end)` - Get random date
- `getRandomText(type, options)` - Get random text
- `addCreatedData(type, data)` - Add created data
- `getCreatedData(type)` - Get created data by type
- `printSummary()` - Print seeding summary

## 💡 Examples

### Example 1: Seed Only Users

```bash
npm run seed:enhanced -- --modules users
```

### Example 2: Custom Environment Configuration

```javascript
// Create custom configuration
const customConfig = {
  users: {
    count: 5,
    testUsers: [
      {
        name: 'Custom User',
        email: 'custom@example.com',
        password: 'password123!',
        systemRole: 'user'
      }
    ]
  }
};

// Override configuration
const seeder = new DatabaseSeeder();
seeder.config = customConfig;
await seeder.seed();
```

### Example 3: Custom Data Generation

```javascript
class CustomUserSeeder extends UserSeeder {
  generateRandomUserData() {
    return {
      name: this.getRandomName(),
      email: this.getRandomEmail(),
      password: 'custom-password!',
      systemRole: 'user',
      emailVerified: true,
      avatar: this.getRandomAvatar(),
      // Add custom fields
      department: this.getRandomItem(['Engineering', 'Marketing', 'Sales']),
      joinDate: this.getRandomPastDate(365)
    };
  }
}
```

### Example 4: Cross-Seeder Dependencies

```javascript
class WorkspaceSeeder extends BaseSeeder {
  constructor(userSeeder) {
    super();
    this.userSeeder = userSeeder;
  }
  
  async seed() {
    const users = this.userSeeder.getCreatedUsers();
    if (users.length === 0) {
      throw new Error('No users available for workspace creation');
    }
    
    // Create workspaces using existing users
    // ...
  }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MongoDB connection
mongosh --eval "db.adminCommand('ismaster')"

# Verify connection string
echo $DATABASE_URL
```

#### 2. Validation Errors
```bash
# Run validation only
npm run seed:validate

# Skip validation
npm run seed:enhanced -- --skip-validation
```

#### 3. Backup Issues
```bash
# List available backups
npm run seed:backup

# Check backup directory permissions
ls -la ./backups/
```

#### 4. Progress Tracking Issues
```bash
# Skip progress tracking
npm run seed:enhanced -- --skip-progress

# Check terminal compatibility
echo $TERM
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=seeder:* npm run seed:enhanced

# Verbose output
npm run seed:enhanced -- --verbose
```

### Performance Optimization

```bash
# Seed without backup for faster execution
npm run seed:enhanced -- --skip-backup

# Seed specific modules only
npm run seed:enhanced -- --modules users,workspaces

# Use test environment for minimal data
npm run seed:enhanced -- --environment test
```

## 🤝 Contributing

### Adding New Seeders

1. Create a new seeder file in `src/seeders/modules/`
2. Extend `BaseSeeder` class
3. Implement the `seed()` method
4. Add validation methods if needed
5. Update `DatabaseSeeder.js` to include the new seeder
6. Add configuration options in `seeder.config.js`

### Testing Seeders

```bash
# Test specific seeder
node -e "const seeder = require('./src/seeders/modules/UserSeeder'); new seeder().seed().then(console.log)"

# Test with validation
node -e "const seeder = require('./src/seeders/modules/UserSeeder'); const s = new seeder(); s.validateConfiguration().then(console.log)"
```

## 📄 License

This seeder system is part of the TaskFlow project and follows the same license terms.

---

## 🎯 Summary

The new TaskFlow Database Seeder System provides:

✅ **Modular Architecture** - Separate seeders for each entity  
✅ **Environment Support** - Different configs for dev/test/prod  
✅ **Data Validation** - Comprehensive validation before seeding  
✅ **Progress Tracking** - Real-time progress with ETA  
✅ **Backup & Rollback** - Automatic backups and recovery  
✅ **Error Handling** - Detailed error reporting  
✅ **Extensible Design** - Easy to add new seeders  
✅ **Performance Optimized** - Efficient batch operations  

**Ready to use with enhanced functionality!** 🚀
