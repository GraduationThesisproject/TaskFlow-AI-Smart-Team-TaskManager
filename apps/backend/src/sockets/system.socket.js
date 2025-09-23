const jwt = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../config/logger');
const os = require('os');
const { socketRateLimit } = require('../middlewares/socketRateLimit.middleware');

// Socket authentication middleware for system operations
const authenticateSystemSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verifyToken(token);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return next(new Error('User not found'));
        }

        // Check if user has system admin privileges
        const userRoles = await user.getRoles();
        console.log('System socket auth - userRoles:', userRoles);
        
        // For now, allow all authenticated users to access system socket
        // TODO: Implement proper system permission checking for admin-only features
        logger.info(`System socket access granted for user: ${user.email}`);

        socket.userId = user._id.toString();
        socket.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        };

        logger.info(`System socket authenticated: ${user.email}`);
        next();
        
    } catch (error) {
        logger.error('System socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};

// Handle system socket events with dedicated namespace
const handleSystemSocket = (io) => {
    // Create dedicated namespace for system operations
    const systemNamespace = io.of('/system');
    
    // Apply authentication and rate limiting middleware to namespace
    systemNamespace.use(authenticateSystemSocket);
    systemNamespace.use(socketRateLimit({
        windowMs: 60000, // 1 minute
        maxEvents: 50,   // 50 events per minute for system operations
        message: 'System operation rate limit exceeded. Please wait before making more requests.'
    }));
    
    systemNamespace.on('connection', (socket) => {
        logger.info(`Admin connected to system namespace: ${socket.user.name} (${socket.id})`);

        // Join system monitoring room
        socket.join('system:monitoring');
        
        // Send initial system status
        socket.emit('system:status', getSystemStatus());

        // Handle system health check requests
        socket.on('system:health-check', async () => {
            try {
                const healthStatus = await getDetailedHealthStatus();
                socket.emit('system:health-status', healthStatus);
            } catch (error) {
                logger.error('Health check error:', error);
                socket.emit('error', { message: 'Failed to get health status' });
            }
        });

        // Handle system metrics requests
        socket.on('system:get-metrics', async (data) => {
            try {
                const { metrics = ['cpu', 'memory', 'disk'] } = data || {};
                const systemMetrics = await getSystemMetrics(metrics);
                socket.emit('system:metrics', systemMetrics);
            } catch (error) {
                logger.error('Get metrics error:', error);
                socket.emit('error', { message: 'Failed to get system metrics' });
            }
        });

        // Handle system configuration updates
        socket.on('system:update-config', async (data) => {
            try {
                const { configKey, configValue } = data || {};
                
                // Validate input parameters
                if (!configKey || typeof configKey !== 'string') {
                    socket.emit('error', { message: 'Config key is required and must be a string' });
                    return;
                }
                
                if (configValue === undefined || configValue === null) {
                    socket.emit('error', { message: 'Config value is required' });
                    return;
                }
                
                // Validate configuration update
                if (!isValidSystemConfig(configKey, configValue)) {
                    socket.emit('error', { message: 'Invalid configuration key or value' });
                    return;
                }

                // Update system configuration
                const result = await updateSystemConfig(configKey, configValue);
                
                // Broadcast configuration change to all system monitors
                systemNamespace.to('system:monitoring').emit('system:config-updated', {
                    configKey,
                    configValue,
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

                socket.emit('system:config-updated', { configKey, configValue, result });
                
            } catch (error) {
                logger.error('Update system config error:', error);
                socket.emit('error', { message: 'Failed to update system configuration' });
            }
        });

        // Handle system maintenance mode
        socket.on('system:maintenance-mode', async (data) => {
            try {
                const { enabled, reason, estimatedDuration } = data;
                
                // Toggle maintenance mode
                const maintenanceStatus = await toggleMaintenanceMode(enabled, reason, estimatedDuration);
                
                // Broadcast maintenance mode change
                systemNamespace.to('system:monitoring').emit('system:maintenance-mode-changed', {
                    enabled,
                    reason,
                    estimatedDuration,
                    updatedBy: socket.user,
                    timestamp: new Date()
                });

                // Notify all connected users about maintenance mode
                if (enabled) {
                    io.of('/').emit('system:maintenance-notice', {
                        message: `System maintenance in progress: ${reason}`,
                        estimatedDuration,
                        timestamp: new Date()
                    });
                }

                socket.emit('system:maintenance-mode-updated', maintenanceStatus);
                
            } catch (error) {
                logger.error('Maintenance mode error:', error);
                socket.emit('error', { message: 'Failed to update maintenance mode' });
            }
        });

        // Handle system backup requests
        socket.on('system:backup', async (data) => {
            try {
                const { backupType = 'full', includeFiles = true } = data || {};
                
                // Initiate system backup
                const backupJob = await initiateSystemBackup(backupType, includeFiles);
                
                socket.emit('system:backup-initiated', backupJob);
                
                // Monitor backup progress
                monitorBackupProgress(backupJob.id, (progress) => {
                    socket.emit('system:backup-progress', progress);
                });
                
            } catch (error) {
                logger.error('System backup error:', error);
                socket.emit('error', { message: 'Failed to initiate system backup' });
            }
        });

        // Handle system restart requests
        socket.on('system:restart', async (data) => {
            try {
                const { reason, scheduledTime } = data || {};
                
                // Validate restart request
                if (scheduledTime && new Date(scheduledTime) <= new Date()) {
                    socket.emit('error', { message: 'Scheduled time must be in the future' });
                    return;
                }

                // Schedule or execute system restart
                const restartJob = await scheduleSystemRestart(reason, scheduledTime);
                
                // Broadcast restart notification
                systemNamespace.to('system:monitoring').emit('system:restart-scheduled', {
                    reason,
                    scheduledTime: restartJob.scheduledTime,
                    scheduledBy: socket.user,
                    timestamp: new Date()
                });

                socket.emit('system:restart-scheduled', restartJob);
                
            } catch (error) {
                logger.error('System restart error:', error);
                socket.emit('error', { message: 'Failed to schedule system restart' });
            }
        });

        // Handle real-time system monitoring subscription
        socket.on('system:subscribe-monitoring', (data) => {
            try {
                const { interval = 30000 } = data || {}; // Default 30 second updates
                
                // Validate interval to prevent abuse
                if (interval < 5000 || interval > 300000) { // 5 seconds to 5 minutes
                    socket.emit('error', { message: 'Invalid interval value. Must be between 5000 and 300000 ms' });
                    return;
                }
                
                // Clear any existing monitoring interval
                if (socket.monitoringInterval) {
                    clearInterval(socket.monitoringInterval);
                }
                
                // Start sending periodic system updates
                const monitoringInterval = setInterval(() => {
                    // Check if socket is still connected before sending
                    if (socket.connected) {
                        const systemStatus = getSystemStatus();
                        socket.emit('system:status-update', systemStatus);
                    } else {
                        // Clean up if socket is disconnected
                        clearInterval(monitoringInterval);
                    }
                }, interval);

                // Store interval reference for cleanup
                socket.monitoringInterval = monitoringInterval;
                
                socket.emit('system:monitoring-subscribed', { interval });
                
            } catch (error) {
                logger.error('System monitoring subscription error:', error);
                socket.emit('error', { message: 'Failed to subscribe to system monitoring' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            logger.info(`Admin disconnected from system namespace: ${socket.user.name} (${reason})`);
            
            // Clean up monitoring interval
            if (socket.monitoringInterval) {
                clearInterval(socket.monitoringInterval);
                socket.monitoringInterval = null;
            }
        });

        // Handle connection errors
        socket.on('connect_error', (error) => {
            logger.error('System socket connection error:', error);
            
            // Clean up monitoring interval on connection error
            if (socket.monitoringInterval) {
                clearInterval(socket.monitoringInterval);
                socket.monitoringInterval = null;
            }
        });

        logger.info(`Admin ${socket.user.name} connected to system namespace`);
    });

    // ===== SYSTEM UTILITY FUNCTIONS =====
    
    // Get basic system status
    function getSystemStatus() {
        return {
            uptime: process.uptime(),
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            },
            cpu: {
                loadAverage: os.loadavg(),
                cores: os.cpus().length
            },
            platform: os.platform(),
            nodeVersion: process.version,
            timestamp: new Date()
        };
    }

    // Get detailed health status
    async function getDetailedHealthStatus() {
        try {
            // Mock database health check
            const dbHealth = await checkDatabaseHealth();
            
            // Mock external service health checks
            const externalServices = await checkExternalServices();
            
            return {
                status: 'healthy',
                checks: {
                    database: dbHealth,
                    externalServices,
                    system: getSystemStatus()
                },
                timestamp: new Date()
            };
        } catch (error) {
            logger.error('Detailed health check error:', error);
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    // Get system metrics
    async function getSystemMetrics(metrics) {
        const result = {};
        
        if (metrics.includes('cpu')) {
            result.cpu = {
                loadAverage: os.loadavg(),
                cores: os.cpus().length,
                usage: process.cpuUsage()
            };
        }
        
        if (metrics.includes('memory')) {
            result.memory = {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
                processMemory: process.memoryUsage()
            };
        }
        
        if (metrics.includes('disk')) {
            // Mock disk metrics
            result.disk = {
                total: 1000000000000, // 1TB
                free: 500000000000,   // 500GB
                used: 500000000000    // 500GB
            };
        }
        
        return {
            ...result,
            timestamp: new Date()
        };
    }

    // Validate system configuration
    function isValidSystemConfig(key, value) {
        const validConfigs = {
            'maintenance.enabled': typeof value === 'boolean',
            'backup.retention': typeof value === 'number' && value > 0 && value <= 365, // Max 1 year
            'monitoring.interval': typeof value === 'number' && value >= 5000 && value <= 300000, // 5s to 5min
            'backup.enabled': typeof value === 'boolean',
            'notifications.enabled': typeof value === 'boolean',
            'max.file.size': typeof value === 'number' && value > 0 && value <= 100 * 1024 * 1024, // Max 100MB
            'session.timeout': typeof value === 'number' && value >= 300 && value <= 86400 // 5min to 24h
        };
        
        return validConfigs[key] || false;
    }

    // Update system configuration
    async function updateSystemConfig(key, value) {
        // Mock configuration update
        logger.info(`System config updated: ${key} = ${value}`);
        return { success: true, key, value, timestamp: new Date() };
    }

    // Toggle maintenance mode
    async function toggleMaintenanceMode(enabled, reason, estimatedDuration) {
        // Mock maintenance mode toggle
        logger.info(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}: ${reason}`);
        return {
            enabled,
            reason,
            estimatedDuration,
            timestamp: new Date()
        };
    }

    // Initiate system backup
    async function initiateSystemBackup(type, includeFiles) {
        // Mock backup initiation
        const backupId = `backup_${Date.now()}`;
        logger.info(`System backup initiated: ${type} (${backupId})`);
        
        return {
            id: backupId,
            type,
            includeFiles,
            status: 'initiated',
            timestamp: new Date()
        };
    }

    // Monitor backup progress
    function monitorBackupProgress(backupId, callback) {
        // Mock backup progress monitoring
        let progress = 0;
        const progressInterval = setInterval(() => {
            try {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(progressInterval);
                }
                callback({ backupId, progress: Math.round(progress) });
            } catch (error) {
                logger.error('Backup progress monitoring error:', error);
                clearInterval(progressInterval);
            }
        }, 1000);
        
        // Return cleanup function
        return () => {
            clearInterval(progressInterval);
        };
    }

    // Schedule system restart
    async function scheduleSystemRestart(reason, scheduledTime) {
        // Mock restart scheduling
        logger.info(`System restart scheduled: ${reason} at ${scheduledTime}`);
        
        return {
            id: `restart_${Date.now()}`,
            reason,
            scheduledTime: scheduledTime || new Date(Date.now() + 60000), // Default 1 minute
            status: 'scheduled',
            timestamp: new Date()
        };
    }

    // Check database health
    async function checkDatabaseHealth() {
        try {
            // Mock database health check
            return { status: 'healthy', responseTime: 15 };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    // Check external services
    async function checkExternalServices() {
        // Mock external service health checks
        return {
            email: { status: 'healthy', responseTime: 45 },
            storage: { status: 'healthy', responseTime: 23 },
            analytics: { status: 'healthy', responseTime: 67 }
        };
    }

    // Return system namespace for proper module management
    return systemNamespace;
};

module.exports = handleSystemSocket;
