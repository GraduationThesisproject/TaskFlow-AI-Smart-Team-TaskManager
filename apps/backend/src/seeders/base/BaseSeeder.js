/**
 * Base Seeder Class
 * Provides common functionality for all seeders
 */

const { faker } = require('@faker-js/faker');
const SeederValidator = require('../utils/validator');
const { ProgressTracker } = require('../utils/progress');
const seederConfig = require('../config/seeder.config');

class BaseSeeder {
  constructor() {
    this.validator = new SeederValidator();
    this.progress = null;
    this.createdData = [];
    this.errors = [];
    this.warnings = [];
    
    // Set faker seed for reproducible data
    faker.seed(seederConfig.faker.seed);
  }

  /**
   * Initialize the seeder
   */
  async initialize(total = 0, title = 'Seeding') {
    this.progress = new ProgressTracker(total, title);
    this.validator.clear();
    this.createdData = [];
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Update progress
   */
  updateProgress(increment = 1, message = '') {
    if (this.progress) {
      this.progress.update(increment, message);
    }
  }

  /**
   * Complete progress
   */
  completeProgress(message = '') {
    if (this.progress) {
      this.progress.complete(message);
    }
  }

  /**
   * Log message
   */
  log(message) {
    if (this.progress) {
      this.progress.log(message);
    } else {
      console.log(message);
    }
  }

  /**
   * Log error
   */
  error(message) {
    this.errors.push(message);
    if (this.progress) {
      this.progress.error(message);
    } else {
      console.error(`❌ ${message}`);
    }
  }

  /**
   * Log warning
   */
  warning(message) {
    this.warnings.push(message);
    if (this.progress) {
      this.progress.warning(message);
    } else {
      console.warn(`⚠️  ${message}`);
    }
  }

  /**
   * Log success
   */
  success(message) {
    if (this.progress) {
      this.progress.success(message);
    } else {
      console.log(`✅ ${message}`);
    }
  }

  /**
   * Log info
   */
  info(message) {
    if (this.progress) {
      this.progress.info(message);
    } else {
      console.log(`ℹ️  ${message}`);
    }
  }

  /**
   * Validate data
   */
  validate(data, validationMethod) {
    if (typeof this.validator[validationMethod] === 'function') {
      const result = this.validator[validationMethod](data);
      
      if (result.errors.length > 0) {
        this.errors.push(...result.errors);
      }
      
      if (result.warnings.length > 0) {
        this.warnings.push(...result.warnings);
      }
      
      return result.errors.length === 0;
    }
    
    return true;
  }

  /**
   * Get random item from array
   */
  getRandomItem(array) {
    if (!Array.isArray(array) || array.length === 0) {
      return null;
    }
    return faker.helpers.arrayElement(array);
  }

  /**
   * Get random items from array
   */
  getRandomItems(array, options = {}) {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    
    const { min = 1, max = array.length } = options;
    const count = faker.number.int({ min: Math.min(min, array.length), max: Math.min(max, array.length) });
    
    return faker.helpers.arrayElements(array, { min: count, max: count });
  }

  /**
   * Generate random date between range
   */
  getRandomDate(startDate = new Date('2024-01-01'), endDate = new Date()) {
    return faker.date.between({ from: startDate, to: endDate });
  }

  /**
   * Generate random future date
   */
  getRandomFutureDate(daysFromNow = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysFromNow);
    return faker.date.between({ from: startDate, to: endDate });
  }

  /**
   * Generate random past date
   */
  getRandomPastDate(daysAgo = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    return faker.date.between({ from: startDate, to: endDate });
  }

  /**
   * Generate random boolean with probability
   */
  getRandomBoolean(probability = 0.5) {
    return faker.datatype.boolean(probability);
  }

  /**
   * Generate random number in range
   */
  getRandomNumber(min = 1, max = 100) {
    return faker.number.int({ min, max });
  }

  /**
   * Generate random text
   */
  getRandomText(type = 'sentence', options = {}) {
    switch (type) {
      case 'word':
        return faker.lorem.word();
      case 'words':
        return faker.lorem.words(options.count || 3);
      case 'sentence':
        return faker.lorem.sentence();
      case 'sentences':
        return faker.lorem.sentences(options.count || 2);
      case 'paragraph':
        return faker.lorem.paragraph();
      case 'paragraphs':
        return faker.lorem.paragraphs(options.count || 2);
      default:
        return faker.lorem.sentence();
    }
  }

  /**
   * Generate random email
   */
  getRandomEmail() {
    return faker.internet.email();
  }

  /**
   * Generate random name
   */
  getRandomName() {
    return faker.person.fullName();
  }

  /**
   * Generate random company name
   */
  getRandomCompanyName() {
    return faker.company.name();
  }

  /**
   * Generate random color
   */
  getRandomColor() {
    return faker.internet.color();
  }

  /**
   * Generate random avatar URL
   */
  getRandomAvatar() {
    return faker.image.avatar();
  }

  /**
   * Generate random file name
   */
  getRandomFileName(extension = 'pdf') {
    return faker.system.fileName(extension);
  }

  /**
   * Generate random MIME type
   */
  getRandomMimeType() {
    const mimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return faker.helpers.arrayElement(mimeTypes);
  }

  /**
   * Generate random file size
   */
  getRandomFileSize(minBytes = 1000, maxBytes = 10000000) {
    return faker.number.int({ min: minBytes, max: maxBytes });
  }

  /**
   * Generate random task title
   */
  getRandomTaskTitle() {
    const titles = seederConfig.faker.options.taskTitles;
    return faker.helpers.arrayElement(titles);
  }

  /**
   * Generate random task description
   */
  getRandomTaskDescription() {
    const descriptions = seederConfig.faker.options.taskDescriptions;
    return faker.helpers.arrayElement(descriptions);
  }

  /**
   * Generate random priority
   */
  getRandomPriority() {
    return faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']);
  }

  /**
   * Generate random status
   */
  getRandomStatus() {
    return faker.helpers.arrayElement(['todo', 'in_progress', 'review', 'done']);
  }

  /**
   * Generate random role
   */
  getRandomRole() {
    return faker.helpers.arrayElement(['viewer', 'member', 'contributor', 'admin']);
  }

  /**
   * Generate random notification type
   */
  getRandomNotificationType() {
    return faker.helpers.arrayElement([
      'task_assigned', 'task_updated', 'task_completed',
      'comment_added', 'comment_mentioned', 'deadline_approaching'
    ]);
  }

  /**
   * Generate random reminder method
   */
  getRandomReminderMethod() {
    return faker.helpers.arrayElements(['email', 'push', 'in_app'], { min: 1, max: 3 });
  }

  /**
   * Get random user ID from created users
   */
  getRandomUserId() {
    // This method should be overridden by seeders that have access to user data
    // For now, return a placeholder ObjectId
    const mongoose = require('mongoose');
    return new mongoose.Types.ObjectId();
  }

  /**
   * Add created data
   */
  addCreatedData(type, data) {
    this.createdData.push({
      type,
      data,
      timestamp: new Date()
    });
  }

  /**
   * Get created data by type
   */
  getCreatedData(type) {
    return this.createdData.filter(item => item.type === type).map(item => item.data);
  }

  /**
   * Get all created data
   */
  getAllCreatedData() {
    return this.createdData;
  }

  /**
   * Get summary of created data
   */
  getCreatedDataSummary() {
    const summary = {};
    
    this.createdData.forEach(item => {
      if (!summary[item.type]) {
        summary[item.type] = 0;
      }
      summary[item.type]++;
    });
    
    return summary;
  }

  /**
   * Print summary
   */
  printSummary() {
    const summary = this.getCreatedDataSummary();
    
    console.log('\n📊 Seeding Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count}`);
    });
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
  }

  /**
   * Check if seeder has errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Check if seeder has warnings
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }

  /**
   * Get error count
   */
  getErrorCount() {
    return this.errors.length;
  }

  /**
   * Get warning count
   */
  getWarningCount() {
    return this.warnings.length;
  }

  /**
   * Clear all data
   */
  clear() {
    this.createdData = [];
    this.errors = [];
    this.warnings = [];
    this.validator.clear();
  }

  /**
   * Abstract method that must be implemented by subclasses
   */
  async seed() {
    throw new Error('seed() method must be implemented by subclass');
  }

  /**
   * Abstract method for cleanup
   */
  async cleanup() {
    // Default implementation - can be overridden by subclasses
    this.clear();
  }
}

module.exports = BaseSeeder;
