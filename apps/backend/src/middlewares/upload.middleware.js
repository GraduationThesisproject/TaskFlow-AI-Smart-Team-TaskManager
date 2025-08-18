const multer = require('multer');
const { uploadFile, uploadMultipleFiles } = require('../config/cloudinary');
const { sendResponse } = require('../utils/response');
const logger = require('../config/logger');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedMimes = {
        avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        attachment: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed'
        ],
        logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
        background: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    };

    const fileType = req.uploadType || 'attachment';
    const allowed = allowedMimes[fileType] || allowedMimes.attachment;

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} not allowed for ${fileType} uploads`), false);
    }
};

// Create multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB default limit
        files: 10 // Maximum 10 files per request
    }
});

// Middleware for single file upload
const uploadSingle = (fieldName, fileType = 'attachment') => {
    return (req, res, next) => {
        req.uploadType = fileType;
        
        upload.single(fieldName)(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return sendResponse(res, 400, false, 'File too large');
                    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                        return sendResponse(res, 400, false, 'Unexpected file field');
                    }
                }
                return sendResponse(res, 400, false, err.message);
            }

            if (!req.file) {
                return next(); // No file uploaded, continue
            }

            try {
                // Upload to Cloudinary
                const uploadResult = await uploadFile(
                    req.file.buffer,
                    req.file.originalname,
                    fileType,
                    req.user ? req.user.id : null
                );

                // Attach upload result to request
                req.uploadedFile = {
                    ...uploadResult,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size
                };

                logger.info(`File uploaded successfully: ${uploadResult.publicId}`);
                next();

            } catch (uploadError) {
                logger.error('File upload error:', uploadError);
                return sendResponse(res, 500, false, 'File upload failed');
            }
        });
    };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5, fileType = 'attachment') => {
    return (req, res, next) => {
        req.uploadType = fileType;
        
        upload.array(fieldName, maxCount)(req, res, async (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return sendResponse(res, 400, false, 'One or more files too large');
                    } else if (err.code === 'LIMIT_FILE_COUNT') {
                        return sendResponse(res, 400, false, `Maximum ${maxCount} files allowed`);
                    }
                }
                return sendResponse(res, 400, false, err.message);
            }

            if (!req.files || req.files.length === 0) {
                return next(); // No files uploaded, continue
            }

            try {
                // Upload all files to Cloudinary
                const uploadResults = await uploadMultipleFiles(
                    req.files,
                    fileType,
                    req.user ? req.user.id : null
                );

                // Attach upload results to request
                req.uploadedFiles = uploadResults.map((result, index) => ({
                    ...result,
                    originalName: req.files[index].originalname,
                    mimeType: req.files[index].mimetype,
                    size: req.files[index].size
                }));

                logger.info(`Multiple files uploaded successfully: ${uploadResults.length} files`);
                next();

            } catch (uploadError) {
                logger.error('Multiple file upload error:', uploadError);
                return sendResponse(res, 500, false, 'File upload failed');
            }
        });
    };
};

// Middleware for handling upload errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return sendResponse(res, 400, false, 'File too large');
            case 'LIMIT_FILE_COUNT':
                return sendResponse(res, 400, false, 'Too many files');
            case 'LIMIT_FIELD_COUNT':
                return sendResponse(res, 400, false, 'Too many fields');
            case 'LIMIT_UNEXPECTED_FILE':
                return sendResponse(res, 400, false, 'Unexpected file field');
            default:
                return sendResponse(res, 400, false, 'Upload error');
        }
    }

    if (err.message.includes('File type')) {
        return sendResponse(res, 400, false, err.message);
    }

    next(err);
};

// Validate file before upload
const validateFile = (fileType = 'attachment') => {
    return (req, res, next) => {
        const limits = {
            avatar: { maxSize: 2 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] },
            attachment: { maxSize: 10 * 1024 * 1024, types: ['image/*', 'application/pdf', 'text/*'] },
            logo: { maxSize: 1 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/svg+xml'] },
            background: { maxSize: 3 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp'] }
        };

        const limit = limits[fileType] || limits.attachment;
        
        // Set dynamic limits
        req.uploadLimit = limit;
        req.uploadType = fileType;
        
        next();
    };
};

// Middleware to add file metadata to database
const attachFileMetadata = (req, res, next) => {
    if (req.uploadedFile) {
        req.fileMetadata = {
            filename: req.uploadedFile.publicId,
            originalName: req.uploadedFile.originalName,
            mimeType: req.uploadedFile.mimeType,
            size: req.uploadedFile.size,
            url: req.uploadedFile.url,
            cloudinaryData: {
                publicId: req.uploadedFile.publicId,
                format: req.uploadedFile.format,
                resourceType: req.uploadedFile.resourceType,
                bytes: req.uploadedFile.bytes
            },
            uploadedBy: req.user ? req.user.id : null,
            uploadedAt: new Date()
        };
    }

    if (req.uploadedFiles) {
        req.filesMetadata = req.uploadedFiles.map(file => ({
            filename: file.publicId,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            url: file.url,
            cloudinaryData: {
                publicId: file.publicId,
                format: file.format,
                resourceType: file.resourceType,
                bytes: file.bytes
            },
            uploadedBy: req.user ? req.user.id : null,
            uploadedAt: new Date()
        }));
    }

    next();
};

// Express middleware for different upload types
const avatarUpload = [
    validateFile('avatar'),
    uploadSingle('avatar', 'avatar'),
    attachFileMetadata
];

const taskAttachmentUpload = [
    validateFile('attachment'),
    uploadMultiple('attachments', 5, 'taskAttachment'),
    attachFileMetadata
];

const commentAttachmentUpload = [
    validateFile('attachment'),
    uploadMultiple('attachments', 3, 'commentAttachment'),
    attachFileMetadata
];

const logoUpload = [
    validateFile('logo'),
    uploadSingle('logo', 'logo'),
    attachFileMetadata
];

const boardBackgroundUpload = [
    validateFile('background'),
    uploadSingle('background', 'boardBackground'),
    attachFileMetadata
];

// Single attachment upload
const singleAttachmentUpload = [
    validateFile('attachment'),
    uploadSingle('attachment', 'taskAttachment'),
    attachFileMetadata
];

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    handleUploadError,
    validateFile,
    attachFileMetadata,
    // Pre-configured middleware
    avatarUpload,
    taskAttachmentUpload,
    commentAttachmentUpload,
    logoUpload,
    boardBackgroundUpload,
    singleAttachmentUpload
};
