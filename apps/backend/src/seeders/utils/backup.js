/**
 * Backup and Rollback Utility
 * Provides database backup and rollback functionality for seeding operations
 */

const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
const seederConfig = require('../config/seeder.config');

class BackupManager {
  constructor() {
    this.backupPath = seederConfig.rollback.backupPath;
    this.backups = [];
  }

  /**
   * Create a backup of the current database state
   */
  async createBackup(description = '') {
    if (!seederConfig.rollback.enabled) {
      console.log('⚠️  Backup disabled in configuration');
      return null;
    }

    try {
      // Ensure backup directory exists
      await this.ensureBackupDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-${timestamp}`;
      const backupDir = path.join(this.backupPath, backupId);

      // Create backup directory
      await fs.mkdir(backupDir, { recursive: true });

      console.log(`💾 Creating backup: ${backupId}`);

      // Get all collections
      const collections = await mongoose.connection.db.collections();
      const backupData = {};

      // Backup each collection
      for (const collection of collections) {
        const collectionName = collection.collectionName;
        const documents = await collection.find({}).toArray();
        
        if (documents.length > 0) {
          backupData[collectionName] = documents;
          
          // Save collection data to file
          const collectionFile = path.join(backupDir, `${collectionName}.json`);
          await fs.writeFile(collectionFile, JSON.stringify(documents, null, 2));
        }
      }

      // Create backup metadata
      const metadata = {
        id: backupId,
        timestamp: new Date().toISOString(),
        description,
        collections: Object.keys(backupData),
        totalDocuments: Object.values(backupData).reduce((sum, docs) => sum + docs.length, 0),
        database: mongoose.connection.db.databaseName,
        version: '1.0'
      };

      const metadataFile = path.join(backupDir, 'metadata.json');
      await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));

      // Store backup info
      this.backups.push({
        id: backupId,
        path: backupDir,
        metadata,
        createdAt: new Date()
      });

      console.log(`✅ Backup created: ${backupId} (${metadata.totalDocuments} documents)`);
      return backupId;

    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupId) {
    if (!seederConfig.rollback.enabled) {
      console.log('⚠️  Rollback disabled in configuration');
      return false;
    }

    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      console.log(`🔄 Restoring backup: ${backupId}`);

      // Clear current database
      await this.clearDatabase();

      // Restore collections
      const backupDir = backup.path;
      const metadataFile = path.join(backupDir, 'metadata.json');
      const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));

      for (const collectionName of metadata.collections) {
        const collectionFile = path.join(backupDir, `${collectionName}.json`);
        
        if (await this.fileExists(collectionFile)) {
          const documents = JSON.parse(await fs.readFile(collectionFile, 'utf8'));
          
          if (documents.length > 0) {
            const collection = mongoose.connection.db.collection(collectionName);
            await collection.insertMany(documents);
            console.log(`  ✅ Restored ${documents.length} documents to ${collectionName}`);
          }
        }
      }

      console.log(`✅ Backup restored successfully: ${backupId}`);
      return true;

    } catch (error) {
      console.error('❌ Backup restoration failed:', error.message);
      throw error;
    }
  }

  /**
   * List available backups
   */
  async listBackups() {
    try {
      await this.ensureBackupDirectory();
      
      const backupDirs = await fs.readdir(this.backupPath);
      const backups = [];

      for (const dir of backupDirs) {
        const backupDir = path.join(this.backupPath, dir);
        const metadataFile = path.join(backupDir, 'metadata.json');
        
        if (await this.fileExists(metadataFile)) {
          const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
          backups.push(metadata);
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return backups;

    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      return [];
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId) {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      await fs.rmdir(backup.path, { recursive: true });
      
      // Remove from backups array
      this.backups = this.backups.filter(b => b.id !== backupId);

      console.log(`✅ Backup deleted: ${backupId}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to delete backup:', error.message);
      throw error;
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const backups = await this.listBackups();
      const cutoff = new Date(Date.now() - maxAge);
      const oldBackups = backups.filter(backup => new Date(backup.timestamp) < cutoff);

      for (const backup of oldBackups) {
        await this.deleteBackup(backup.id);
      }

      console.log(`✅ Cleaned up ${oldBackups.length} old backups`);
      return oldBackups.length;

    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error.message);
      throw error;
    }
  }

  /**
   * Get backup info
   */
  async getBackupInfo(backupId) {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        return null;
      }

      const metadataFile = path.join(backup.path, 'metadata.json');
      const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));

      // Get file sizes
      const fileSizes = {};
      for (const collectionName of metadata.collections) {
        const collectionFile = path.join(backup.path, `${collectionName}.json`);
        if (await this.fileExists(collectionFile)) {
          const stats = await fs.stat(collectionFile);
          fileSizes[collectionName] = stats.size;
        }
      }

      return {
        ...metadata,
        fileSizes,
        totalSize: Object.values(fileSizes).reduce((sum, size) => sum + size, 0)
      };

    } catch (error) {
      console.error('❌ Failed to get backup info:', error.message);
      return null;
    }
  }

  /**
   * Ensure backup directory exists
   */
  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear current database
   */
  async clearDatabase() {
    try {
      const collections = await mongoose.connection.db.collections();
      
      for (const collection of collections) {
        await collection.deleteMany({});
      }

      console.log('🗑️  Database cleared');
    } catch (error) {
      console.error('❌ Failed to clear database:', error.message);
      throw error;
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats() {
    try {
      const backups = await this.listBackups();
      
      if (backups.length === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          oldestBackup: null,
          newestBackup: null,
          averageSize: 0
        };
      }

      const totalSize = backups.reduce((sum, backup) => sum + (backup.totalDocuments || 0), 0);
      const timestamps = backups.map(b => new Date(b.timestamp));
      const oldestBackup = new Date(Math.min(...timestamps));
      const newestBackup = new Date(Math.max(...timestamps));

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: oldestBackup.toISOString(),
        newestBackup: newestBackup.toISOString(),
        averageSize: Math.round(totalSize / backups.length)
      };

    } catch (error) {
      console.error('❌ Failed to get backup stats:', error.message);
      return null;
    }
  }

  /**
   * Print backup summary
   */
  async printBackupSummary() {
    const stats = await this.getBackupStats();
    
    if (!stats) {
      console.log('❌ Unable to get backup statistics');
      return;
    }

    console.log('\n📊 Backup Summary:');
    console.log(`  • Total Backups: ${stats.totalBackups}`);
    console.log(`  • Total Documents: ${stats.totalSize.toLocaleString()}`);
    console.log(`  • Average Documents per Backup: ${stats.averageSize.toLocaleString()}`);
    
    if (stats.oldestBackup) {
      console.log(`  • Oldest Backup: ${new Date(stats.oldestBackup).toLocaleDateString()}`);
    }
    
    if (stats.newestBackup) {
      console.log(`  • Newest Backup: ${new Date(stats.newestBackup).toLocaleDateString()}`);
    }
  }
}

module.exports = BackupManager;
