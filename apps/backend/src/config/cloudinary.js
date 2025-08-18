const { v2: cloudinary } = require('cloudinary');
const env = require('./env');
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
});

// Verify configuration
const verifyCloudinaryConfig = async () => {
    try {
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            logger.info('☁️  Cloudinary connected successfully');
            return true;
        }
        return false;
    } catch (error) {
        logger.error('Cloudinary configuration error:', error);
        return false;
    }
};

// Upload options for different file types
const uploadOptions = {
    // User avatars
    avatar: {
        folder: 'taskflow/avatars',
        transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 2000000, // 2MB
        public_id_prefix: 'avatar_'
    },
    
    // Task attachments
    taskAttachment: {
        folder: 'taskflow/tasks',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'],
        max_file_size: 10000000, // 10MB
        public_id_prefix: 'task_'
    },
    
    // Comment attachments
    commentAttachment: {
        folder: 'taskflow/comments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
        max_file_size: 5000000, // 5MB
        public_id_prefix: 'comment_'
    },
    
    // Project/workspace logos
    logo: {
        folder: 'taskflow/logos',
        transformation: [
            { width: 400, height: 400, crop: 'fit' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
        max_file_size: 1000000, // 1MB
        public_id_prefix: 'logo_'
    },
    
    // Board backgrounds
    boardBackground: {
        folder: 'taskflow/boards',
        transformation: [
            { width: 1920, height: 1080, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        max_file_size: 3000000, // 3MB
        public_id_prefix: 'board_bg_'
    }
};

// Upload file to Cloudinary
const uploadFile = async (fileBuffer, fileName, fileType = 'taskAttachment', userId = null) => {
    try {
        const options = uploadOptions[fileType] || uploadOptions.taskAttachment;
        
        // Generate unique public_id
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const publicId = `${options.public_id_prefix}${userId || 'unknown'}_${timestamp}_${randomId}`;
        
        const uploadResult = await cloudinary.uploader.upload(fileBuffer, {
            ...options,
            public_id: publicId,
            resource_type: 'auto', // Automatically detect file type
            use_filename: true,
            unique_filename: false,
            overwrite: false
        });

        logger.info(`File uploaded to Cloudinary: ${uploadResult.public_id}`);

        return {
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url,
            originalFilename: fileName,
            format: uploadResult.format,
            resourceType: uploadResult.resource_type,
            bytes: uploadResult.bytes,
            width: uploadResult.width,
            height: uploadResult.height,
            createdAt: uploadResult.created_at
        };

    } catch (error) {
        logger.error('Cloudinary upload error:', error);
        throw new Error(`File upload failed: ${error.message}`);
    }
};

// Upload multiple files
const uploadMultipleFiles = async (files, fileType = 'taskAttachment', userId = null) => {
    try {
        const uploadPromises = files.map(file => 
            uploadFile(file.buffer, file.originalname, fileType, userId)
        );
        
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        logger.error('Multiple file upload error:', error);
        throw new Error(`Multiple file upload failed: ${error.message}`);
    }
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            logger.info(`File deleted from Cloudinary: ${publicId}`);
            return true;
        }
        
        logger.warn(`File deletion failed: ${publicId}, result: ${result.result}`);
        return false;
    } catch (error) {
        logger.error('Cloudinary deletion error:', error);
        throw new Error(`File deletion failed: ${error.message}`);
    }
};

// Delete multiple files
const deleteMultipleFiles = async (publicIds) => {
    try {
        const deletePromises = publicIds.map(publicId => deleteFile(publicId));
        const results = await Promise.all(deletePromises);
        
        const successful = results.filter(result => result === true).length;
        const failed = results.length - successful;
        
        logger.info(`Bulk deletion completed: ${successful} successful, ${failed} failed`);
        
        return {
            successful,
            failed,
            total: results.length
        };
    } catch (error) {
        logger.error('Bulk deletion error:', error);
        throw new Error(`Bulk deletion failed: ${error.message}`);
    }
};

// Generate optimized URL for different use cases
const getOptimizedUrl = (publicId, optimization = 'auto') => {
    const optimizations = {
        avatar: 'w_200,h_200,c_fill,g_face,q_auto,f_auto',
        thumbnail: 'w_300,h_200,c_fill,q_auto,f_auto',
        preview: 'w_800,h_600,c_fit,q_auto,f_auto',
        original: 'q_auto,f_auto',
        auto: 'q_auto,f_auto'
    };

    const transform = optimizations[optimization] || optimizations.auto;
    return cloudinary.url(publicId, { transformation: transform });
};

// Get file metadata
const getFileMetadata = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            url: result.secure_url,
            createdAt: result.created_at
        };
    } catch (error) {
        logger.error('Get file metadata error:', error);
        throw new Error(`Failed to get file metadata: ${error.message}`);
    }
};

// Search files by tag or folder
const searchFiles = async (searchOptions = {}) => {
    try {
        const { folder, tags, resourceType = 'image', maxResults = 50 } = searchOptions;
        
        let expression = `resource_type:${resourceType}`;
        
        if (folder) {
            expression += ` AND folder:${folder}`;
        }
        
        if (tags && tags.length > 0) {
            expression += ` AND tags:(${tags.join(' OR ')})`;
        }

        const result = await cloudinary.search
            .expression(expression)
            .max_results(maxResults)
            .sort_by([['created_at', 'desc']])
            .execute();

        return result.resources.map(resource => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            format: resource.format,
            bytes: resource.bytes,
            createdAt: resource.created_at
        }));
    } catch (error) {
        logger.error('File search error:', error);
        throw new Error(`File search failed: ${error.message}`);
    }
};

// Generate upload signature for client-side uploads
const generateUploadSignature = (options = {}) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
        timestamp,
        ...options
    };

    const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
    
    return {
        signature,
        timestamp,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME
    };
};

// Cleanup old files (for maintenance)
const cleanupOldFiles = async (olderThanDays = 30, folder = null) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        
        let expression = `created_at<${cutoffDate.toISOString()}`;
        if (folder) {
            expression += ` AND folder:${folder}`;
        }

        const result = await cloudinary.search
            .expression(expression)
            .max_results(500)
            .execute();

        if (result.resources.length === 0) {
            return { deleted: 0, message: 'No old files found' };
        }

        const publicIds = result.resources.map(r => r.public_id);
        const deleteResult = await deleteMultipleFiles(publicIds);
        
        logger.info(`Cleanup completed: deleted ${deleteResult.successful} old files`);
        
        return deleteResult;
    } catch (error) {
        logger.error('Cleanup error:', error);
        throw new Error(`Cleanup failed: ${error.message}`);
    }
};

// Initialize Cloudinary configuration
const initializeCloudinary = async () => {
    const isConfigured = await verifyCloudinaryConfig();
    if (isConfigured) {
        logger.info('Cloudinary initialized successfully');
    } else {
        logger.warn('Cloudinary configuration failed. File upload features will be limited.');
    }
    return isConfigured;
};

module.exports = {
    cloudinary,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    deleteMultipleFiles,
    getOptimizedUrl,
    getFileMetadata,
    searchFiles,
    generateUploadSignature,
    cleanupOldFiles,
    initializeCloudinary,
    uploadOptions
};
