const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

/**
 * Admin Seeder
 * Seeds the admin table with initial admin users
 */

/**
 * Create the main super admin user
 */
const createMainAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userEmail: 'admin@admin.com' });
    
    if (existingAdmin) {
      logger.info('Main admin already exists, skipping creation');
      return existingAdmin;
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123!', saltRounds);

    // Create the main admin user
    const mainAdmin = new Admin({
      userName: 'jesser_sekri',
      userEmail: 'admin@admin.com',
      password: hashedPassword,
      firstName: 'Jesser',
      lastName: 'Sekri',
      role: 'super_admin',
      isActive: true,
      permissions: [
        {
          name: 'admin_management',
          description: 'Manage admin users and roles',
          allowed: true
        },
        {
          name: 'user_management',
          description: 'Manage regular users',
          allowed: true
        },
        {
          name: 'system_settings',
          description: 'Access system settings',
          allowed: true
        },
        {
          name: 'audit_logs',
          description: 'View audit logs',
          allowed: true
        },
        {
          name: 'data_export',
          description: 'Export system data',
          allowed: true
        }
      ],
      notes: 'Main system administrator - created by seeder'
    });

    await mainAdmin.save();
    logger.info('Main admin created successfully:', mainAdmin.userEmail);
    return mainAdmin;
  } catch (error) {
    logger.error('Error creating main admin:', error);
    throw error;
  }
};

/**
 * Create additional admin users with different roles
 */
const createDefaultAdmins = async () => {
  try {
    const admins = [
      {
        userName: 'admin_user',
        userEmail: 'admin@taskflow.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: [
          {
            name: 'admin_management',
            description: 'Manage admin users and roles',
            allowed: true
          },
          {
            name: 'user_management',
            description: 'Manage regular users',
            allowed: true
          },
          {
            name: 'system_settings',
            description: 'Access system settings',
            allowed: true
          }
        ]
      },
      {
        userName: 'moderator_user',
        userEmail: 'moderator@taskflow.com',
        password: 'Moderator123!',
        firstName: 'Moderator',
        lastName: 'User',
        role: 'moderator',
        permissions: [
          {
            name: 'user_management',
            description: 'Manage regular users',
            allowed: true
          },
          {
            name: 'audit_logs',
            description: 'View audit logs',
            allowed: true
          }
        ]
      },
      {
        userName: 'viewer_user',
        userEmail: 'viewer@taskflow.com',
        password: 'Viewer123!',
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        permissions: [
          {
            name: 'audit_logs',
            description: 'View audit logs',
            allowed: true
          }
        ]
      }
    ];

    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ userEmail: adminData.userEmail });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        
        const admin = new Admin({
          ...adminData,
          password: hashedPassword,
          isActive: true,
          notes: `Default ${adminData.role} user - created by seeder`
        });

        await admin.save();
        logger.info(`${adminData.role} admin created:`, adminData.userEmail);
      } else {
        logger.info(`${adminData.role} admin already exists:`, adminData.userEmail);
      }
    }
  } catch (error) {
    logger.error('Error creating default admins:', error);
    throw error;
  }
};

/**
 * Create admin user from existing User data
 * This function migrates your existing admin user to the new Admin table
 */
const createAdminFromExistingUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userEmail: 'admin@admin.com' });
    
    if (existingAdmin) {
      logger.info('Admin from existing user already exists, skipping creation');
      return existingAdmin;
    }

    // Create admin user based on your existing user data
    const adminData = {
      userName: 'jesser_sekri',
      userEmail: 'admin@admin.com',
      password: '$2b$12$Y65BX54IyfltQjip3L9eke9dWueCLch42K9y4qt3AaLWGpRNvQx5.', // Your existing hashed password
      firstName: 'Jesser',
      lastName: 'Sekri',
      role: 'super_admin',
      isActive: true,
      avatar: 'http://localhost:3001/uploads/avatars/avatar_68a4a907389cdc9bfd56f57d_1756141687201_09ae9611c07e.jpeg',
      phoneNumber: '',
      permissions: [
        {
          name: 'admin_management',
          description: 'Manage admin users and roles',
          allowed: true
        },
        {
          name: 'user_management',
          description: 'Manage regular users',
          allowed: true
        },
        {
          name: 'system_settings',
          description: 'Access system settings',
          allowed: true
        },
        {
          name: 'audit_logs',
          description: 'View audit logs',
          allowed: true
        },
        {
          name: 'data_export',
          description: 'Export system data',
          allowed: true
        },
        {
          name: 'two_factor_auth',
          description: 'Manage 2FA settings',
          allowed: true
        }
      ],
      notes: 'Migrated from existing user data - created by seeder',
      // Preserve your existing metadata
      metadata: {
        originalUserId: '68b01e6ab31ba4056f2c7aa0',
        migratedFrom: 'existing_user',
        globalRole: 'superadmin'
      }
    };

    const admin = new Admin(adminData);
    await admin.save();
    
    logger.info('Admin from existing user created successfully:', admin.userEmail);
    return admin;
  } catch (error) {
    logger.error('Error creating admin from existing user:', error);
    throw error;
  }
};

/**
 * Main seeding function
 */
const seedAdmins = async () => {
  try {
    logger.info('Starting admin seeding...');
    
    // Create admin from your existing user data first
    await createAdminFromExistingUser();
    
    // Create additional default admins
    await createDefaultAdmins();
    
    logger.info('Admin seeding completed successfully!');
    
    // List all created admins
    const allAdmins = await Admin.find({}).select('userName userEmail role isActive');
    logger.info('All admins in database:', allAdmins);
    
  } catch (error) {
    logger.error('Admin seeding failed:', error);
    throw error;
  }
};

/**
 * Reset admin data (for testing)
 */
const resetAdminData = async () => {
  try {
    logger.info('Resetting admin data...');
    await Admin.deleteMany({});
    logger.info('Admin data reset completed');
  } catch (error) {
    logger.error('Error resetting admin data:', error);
    throw error;
  }
};

/**
 * Get admin statistics
 */
const getAdminStats = async () => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    const superAdmins = await Admin.countDocuments({ role: 'super_admin' });
    const regularAdmins = await Admin.countDocuments({ role: 'admin' });
    const moderators = await Admin.countDocuments({ role: 'moderator' });
    const viewers = await Admin.countDocuments({ role: 'viewer' });

    logger.info('Admin Statistics:', {
      total: totalAdmins,
      active: activeAdmins,
      superAdmins,
      regularAdmins,
      moderators,
      viewers
    });

    return {
      total: totalAdmins,
      active: activeAdmins,
      superAdmins,
      regularAdmins,
      moderators,
      viewers
    };
  } catch (error) {
    logger.error('Error getting admin stats:', error);
    throw error;
  }
};

module.exports = {
  seedAdmins,
  createMainAdmin,
  createDefaultAdmins,
  createAdminFromExistingUser,
  resetAdminData,
  getAdminStats
};

// Run seeder if called directly
if (require.main === module) {
  const runSeeder = async () => {
    try {
      await seedAdmins();
      console.log('✅ Admin seeding completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Admin seeding failed:', error);
      process.exit(1);
    }
  };

  runSeeder();
}
