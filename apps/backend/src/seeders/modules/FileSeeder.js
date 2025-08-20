/**
 * File Seeder
 * Handles seeding of files for tasks and workspaces
 */

const BaseSeeder = require('../base/BaseSeeder');
const { faker } = require('@faker-js/faker');
const File = require('../../models/File');
const User = require('../../models/User');
const Task = require('../../models/Task');

class FileSeeder extends BaseSeeder {
  constructor(userSeeder = null, taskSeeder = null) {
    super();
    this.userSeeder = userSeeder;
    this.taskSeeder = taskSeeder;
    this.fileModel = File;
    this.userModel = User;
    this.taskModel = Task;
  }

  /**
   * Main seeding method for files
   */
  async seed() {
    const config = this.getConfig('files');
    const total = config.count || 50;
    
    if (total === 0) {
      this.log('Skipping file seeding (count: 0)');
      return [];
    }

    await this.initialize(total, 'File Seeding');

    try {
      const createdFiles = [];

      for (let i = 0; i < total; i++) {
        const fileData = await this.generateFileData();
        
        if (this.validate(fileData, 'validateFile')) {
          const file = await this.createFile(fileData);
          createdFiles.push(file);
          
          this.addCreatedData('files', file);
          this.updateProgress(1, `Created file: ${file.name}`);
        }
      }

      this.completeProgress('File seeding completed');
      this.printSummary();
      
      return createdFiles;

    } catch (error) {
      this.error(`File seeding failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate file data
   */
  async generateFileData() {
    const users = await this.getAvailableUsers();
    const tasks = await this.getAvailableTasks();
    const user = users.length > 0 ? this.getRandomItem(users) : null;
    const task = tasks.length > 0 ? this.getRandomItem(tasks) : null;
    const fileType = this.getRandomFileType();

    return {
      name: this.generateFileName(fileType),
      originalName: this.generateOriginalFileName(fileType),
      description: this.generateFileDescription(fileType),
      type: fileType,
      mimeType: this.getMimeType(fileType),
      size: this.generateFileSize(fileType),
      path: this.generateFilePath(fileType),
      url: this.generateFileUrl(fileType),
      uploadedBy: user ? user._id : null,
      task: task ? task._id : null,
      workspace: task ? task.workspace : null,
      space: task ? task.space : null,
      board: task ? task.board : null,
      tags: this.generateFileTags(fileType),
      metadata: {
        width: this.getImageWidth(fileType),
        height: this.getImageHeight(fileType),
        duration: this.getVideoDuration(fileType),
        pages: this.getDocumentPages(fileType),
        encoding: this.getFileEncoding(fileType),
        checksum: this.generateChecksum(),
        virusScanned: faker.datatype.boolean({ probability: 0.9 }),
        virusFree: faker.datatype.boolean({ probability: 0.95 })
      },
      permissions: {
        isPublic: faker.datatype.boolean({ probability: 0.3 }),
        allowDownload: faker.datatype.boolean({ probability: 0.8 }),
        allowEdit: faker.datatype.boolean({ probability: 0.4 }),
        allowDelete: faker.datatype.boolean({ probability: 0.2 }),
        allowedUsers: this.getRandomAllowedUsers(users)
      },
      versions: this.generateFileVersions(fileType),
      downloads: faker.number.int({ min: 0, max: 100 }),
      views: faker.number.int({ min: 0, max: 500 }),
      isArchived: faker.datatype.boolean({ probability: 0.1 }),
      createdAt: this.getRandomPastDate(90),
      updatedAt: new Date()
    };
  }

  /**
   * Get random file type
   */
  getRandomFileType() {
    const fileTypes = [
      'image', 'document', 'video', 'audio', 'archive', 'code', 'spreadsheet', 'presentation'
    ];

    return this.getRandomItem(fileTypes);
  }

  /**
   * Generate file name
   */
  generateFileName(fileType) {
    const prefixes = {
      'image': ['screenshot', 'photo', 'image', 'design', 'mockup'],
      'document': ['document', 'report', 'proposal', 'contract', 'manual'],
      'video': ['video', 'recording', 'demo', 'tutorial', 'presentation'],
      'audio': ['audio', 'recording', 'podcast', 'music', 'sound'],
      'archive': ['backup', 'archive', 'package', 'bundle', 'compressed'],
      'code': ['script', 'module', 'component', 'library', 'config'],
      'spreadsheet': ['data', 'report', 'analysis', 'budget', 'inventory'],
      'presentation': ['slides', 'presentation', 'deck', 'pitch', 'report']
    };

    const prefix = this.getRandomItem(prefixes[fileType] || ['file']);
    const timestamp = Date.now();
    const randomId = faker.string.alphanumeric(8);
    
    return `${prefix}_${timestamp}_${randomId}`;
  }

  /**
   * Generate original file name
   */
  generateOriginalFileName(fileType) {
    const names = {
      'image': ['screenshot.png', 'design-mockup.jpg', 'photo-2024.png', 'ui-wireframe.png'],
      'document': ['project-proposal.pdf', 'technical-spec.docx', 'meeting-notes.txt', 'requirements.pdf'],
      'video': ['demo-recording.mp4', 'tutorial-video.mov', 'presentation.mp4', 'walkthrough.webm'],
      'audio': ['meeting-recording.mp3', 'podcast-episode.wav', 'voice-note.m4a', 'music-track.mp3'],
      'archive': ['backup-2024.zip', 'project-files.tar.gz', 'data-export.rar', 'source-code.zip'],
      'code': ['main.js', 'component.tsx', 'config.json', 'utils.py', 'styles.css'],
      'spreadsheet': ['budget-2024.xlsx', 'data-analysis.csv', 'inventory.xls', 'reports.xlsx'],
      'presentation': ['project-pitch.pptx', 'quarterly-review.key', 'team-update.pdf', 'strategy-deck.pptx']
    };

    return this.getRandomItem(names[fileType] || ['file.txt']);
  }

  /**
   * Generate file description
   */
  generateFileDescription(fileType) {
    const descriptions = {
      'image': [
        'Screenshot of the current implementation',
        'Design mockup for the new feature',
        'UI wireframe for the dashboard',
        'Photo documentation of the setup process'
      ],
      'document': [
        'Project proposal and requirements document',
        'Technical specification for the new feature',
        'Meeting notes from the planning session',
        'Requirements document for the upcoming sprint'
      ],
      'video': [
        'Demo recording of the new functionality',
        'Tutorial video for the onboarding process',
        'Presentation recording from the team meeting',
        'Walkthrough of the updated interface'
      ],
      'audio': [
        'Recording of the project planning meeting',
        'Podcast episode about the latest updates',
        'Voice note with important reminders',
        'Background music for the presentation'
      ],
      'archive': [
        'Backup of the current project files',
        'Compressed archive of all source code',
        'Data export from the previous version',
        'Source code bundle for deployment'
      ],
      'code': [
        'Main application script',
        'React component for the dashboard',
        'Configuration file for the project',
        'Utility functions for data processing'
      ],
      'spreadsheet': [
        'Budget analysis for the current quarter',
        'Data analysis results and insights',
        'Inventory tracking spreadsheet',
        'Monthly reports and metrics'
      ],
      'presentation': [
        'Project pitch presentation',
        'Quarterly review slides',
        'Team update presentation',
        'Strategy deck for stakeholders'
      ]
    };

    return this.getRandomItem(descriptions[fileType] || ['File uploaded to the system']);
  }

  /**
   * Get MIME type
   */
  getMimeType(fileType) {
    const mimeTypes = {
      'image': ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      'document': ['application/pdf', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'video': ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi'],
      'audio': ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'],
      'archive': ['application/zip', 'application/x-tar', 'application/x-rar-compressed', 'application/gzip'],
      'code': ['application/javascript', 'text/plain', 'application/json', 'text/css'],
      'spreadsheet': ['application/vnd.ms-excel', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      'presentation': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/pdf']
    };

    return this.getRandomItem(mimeTypes[fileType] || ['application/octet-stream']);
  }

  /**
   * Generate file size
   */
  generateFileSize(fileType) {
    const sizeRanges = {
      'image': { min: 50, max: 5000 }, // KB
      'document': { min: 100, max: 10000 }, // KB
      'video': { min: 1000, max: 100000 }, // KB
      'audio': { min: 500, max: 50000 }, // KB
      'archive': { min: 200, max: 20000 }, // KB
      'code': { min: 1, max: 100 }, // KB
      'spreadsheet': { min: 50, max: 2000 }, // KB
      'presentation': { min: 200, max: 5000 } // KB
    };

    const range = sizeRanges[fileType] || { min: 100, max: 1000 };
    return faker.number.int(range) * 1024; // Convert to bytes
  }

  /**
   * Generate file path
   */
  generateFilePath(fileType) {
    const folders = {
      'image': 'uploads/images',
      'document': 'uploads/documents',
      'video': 'uploads/videos',
      'audio': 'uploads/audio',
      'archive': 'uploads/archives',
      'code': 'uploads/code',
      'spreadsheet': 'uploads/spreadsheets',
      'presentation': 'uploads/presentations'
    };

    const folder = folders[fileType] || 'uploads/files';
    const fileName = this.generateFileName(fileType);
    const extension = this.getFileExtension(fileType);
    
    return `${folder}/${fileName}.${extension}`;
  }

  /**
   * Generate file URL
   */
  generateFileUrl(fileType) {
    const baseUrl = 'https://taskflow-files.s3.amazonaws.com';
    const path = this.generateFilePath(fileType);
    return `${baseUrl}/${path}`;
  }

  /**
   * Get file extension
   */
  getFileExtension(fileType) {
    const extensions = {
      'image': ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      'document': ['pdf', 'doc', 'docx', 'txt'],
      'video': ['mp4', 'mov', 'webm', 'avi'],
      'audio': ['mp3', 'wav', 'm4a', 'ogg'],
      'archive': ['zip', 'tar.gz', 'rar', '7z'],
      'code': ['js', 'ts', 'json', 'css', 'py'],
      'spreadsheet': ['xlsx', 'xls', 'csv'],
      'presentation': ['pptx', 'ppt', 'pdf', 'key']
    };

    return this.getRandomItem(extensions[fileType] || ['txt']);
  }

  /**
   * Generate file tags
   */
  generateFileTags(fileType) {
    const tags = [];
    
    if (fileType === 'image') tags.push('image', 'visual', 'design');
    if (fileType === 'document') tags.push('document', 'text', 'pdf');
    if (fileType === 'video') tags.push('video', 'media', 'recording');
    if (fileType === 'audio') tags.push('audio', 'sound', 'recording');
    if (fileType === 'archive') tags.push('archive', 'compressed', 'backup');
    if (fileType === 'code') tags.push('code', 'script', 'development');
    if (fileType === 'spreadsheet') tags.push('data', 'spreadsheet', 'analysis');
    if (fileType === 'presentation') tags.push('presentation', 'slides', 'deck');
    
    return tags;
  }

  /**
   * Get image width
   */
  getImageWidth(fileType) {
    if (fileType !== 'image') return null;
    return faker.number.int({ min: 800, max: 4000 });
  }

  /**
   * Get image height
   */
  getImageHeight(fileType) {
    if (fileType !== 'image') return null;
    return faker.number.int({ min: 600, max: 3000 });
  }

  /**
   * Get video duration
   */
  getVideoDuration(fileType) {
    if (fileType !== 'video') return null;
    return faker.number.int({ min: 30, max: 3600 }); // seconds
  }

  /**
   * Get document pages
   */
  getDocumentPages(fileType) {
    if (fileType !== 'document') return null;
    return faker.number.int({ min: 1, max: 50 });
  }

  /**
   * Get file encoding
   */
  getFileEncoding(fileType) {
    const encodings = ['UTF-8', 'ASCII', 'ISO-8859-1', 'UTF-16'];
    return this.getRandomItem(encodings);
  }

  /**
   * Generate checksum
   */
  generateChecksum() {
    return faker.string.alphanumeric(64);
  }

  /**
   * Get random allowed users
   */
  getRandomAllowedUsers(users) {
    if (users.length === 0) return [];
    
    const numUsers = faker.number.int({ min: 0, max: Math.min(3, users.length) });
    return this.getRandomItems(users, { min: numUsers, max: numUsers }).map(user => user._id);
  }

  /**
   * Generate file versions
   */
  generateFileVersions(fileType) {
    const hasVersions = faker.datatype.boolean({ probability: 0.2 });
    if (!hasVersions) return [];

    const numVersions = faker.number.int({ min: 1, max: 3 });
    const versions = [];

    for (let i = 0; i < numVersions; i++) {
      versions.push({
        version: i + 1,
        name: `v${i + 1}_${this.generateFileName(fileType)}`,
        size: this.generateFileSize(fileType),
        path: this.generateFilePath(fileType),
        url: this.generateFileUrl(fileType),
        createdAt: this.getRandomPastDate(30),
        createdBy: faker.string.uuid()
      });
    }

    return versions;
  }

  /**
   * Create file in database
   */
  async createFile(data) {
    try {
      const file = new this.fileModel(data);
      const savedFile = await file.save();
      
      this.success(`Created ${savedFile.type} file: ${savedFile.name}`);
      return savedFile;
      
    } catch (error) {
      this.error(`Failed to create file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available users for file creation
   */
  async getAvailableUsers() {
    // First try to get users from the user seeder if available
    if (this.userSeeder && this.userSeeder.getCreatedData('user')) {
      const userData = this.userSeeder.getCreatedData('user');
      return userData.map(data => data.user);
    }

    // Fallback to database query
    try {
      const users = await this.userModel.find({}).limit(50);
      return users;
    } catch (error) {
      this.error(`Failed to fetch users: ${error.message}`);
      return [];
    }
  }

  /**
   * Get available tasks for file creation
   */
  async getAvailableTasks() {
    // First try to get tasks from the task seeder if available
    if (this.taskSeeder && this.taskSeeder.getCreatedTasks()) {
      return this.taskSeeder.getCreatedTasks();
    }

    // Fallback to database query
    try {
      const tasks = await this.taskModel.find({}).limit(50);
      return tasks;
    } catch (error) {
      this.warning(`Failed to fetch tasks: ${error.message}`);
      return [];
    }
  }

  /**
   * Get configuration for this seeder
   */
  getConfig(path) {
    const config = require('../config/seeder.config');
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = config.environments[environment];
    return path ? path.split('.').reduce((obj, key) => obj?.[key], envConfig) : envConfig;
  }

  /**
   * Validate file data
   */
  validateFile(data) {
    const validator = require('../utils/validator');
    const result = validator.validateFile(data);
    
    if (result.errors.length > 0) {
      this.error(`File validation errors: ${result.errors.join(', ')}`);
      return false;
    }
    
    if (result.warnings.length > 0) {
      this.warning(`File validation warnings: ${result.warnings.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Get created files
   */
  getCreatedFiles() {
    return this.getCreatedData('files') || [];
  }

  /**
   * Get files by type
   */
  getFilesByType(type) {
    const files = this.getCreatedFiles();
    return files.filter(file => file.type === type);
  }

  /**
   * Print seeding summary
   */
  printSummary() {
    const files = this.getCreatedFiles();
    
    this.success('\n=== File Seeding Summary ===');
    this.log(`✅ Created ${files.length} files`);
    
    if (files.length > 0) {
      this.log('\n📋 File Type Distribution:');
      const typeGroups = {};
      files.forEach(file => {
        if (!typeGroups[file.type]) {
          typeGroups[file.type] = 0;
        }
        typeGroups[file.type]++;
      });
      
      Object.entries(typeGroups).forEach(([type, count]) => {
        this.log(`  ${type}: ${count} files`);
      });

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const averageSize = totalSize / files.length;
      const publicFiles = files.filter(f => f.permissions.isPublic);
      const archivedFiles = files.filter(f => f.isArchived);

      this.log(`\n📋 File Statistics:`);
      this.log(`  Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      this.log(`  Average size: ${(averageSize / 1024).toFixed(2)} KB`);
      this.log(`  Public files: ${publicFiles.length}`);
      this.log(`  Archived files: ${archivedFiles.length}`);
    }
    
    this.success('=== End File Seeding Summary ===\n');
  }
}

module.exports = FileSeeder;
