/**
 * Authentication Validation Schemas
 * Contains all validation rules for auth-related endpoints
 */

// ============================================================================
// USER REGISTRATION & INVITATION
// ============================================================================

const registerSchema = {
    name: { 
        required: true, 
        minLength: 2, 
        maxLength: 100 
    },
    email: { 
        required: true, 
        email: true 
    },
    password: { 
        required: true, 
        minLength: 8 
    },
    inviteToken: { 
        string: true 
    },
    device: {
        deviceId: { 
            string: true 
        },
        deviceInfo: {
            type: { 
                enum: ['web', 'mobile', 'desktop'] 
            },
            os: { 
                string: true 
            },
            browser: { 
                string: true 
            }
        }
    }
};

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

const loginSchema = {
    email: { 
        required: true, 
        email: true 
    },
    password: { 
        required: true 
    },
    rememberMe: { 
        boolean: true 
    },
    device: {
        deviceId: { 
            string: true 
        },
        deviceInfo: {
            type: { 
                enum: ['web', 'mobile', 'desktop'] 
            },
            os: { 
                string: true 
            },
            browser: { 
                string: true 
            }
        }
    }
};

const completeLogin2FASchema = {
    userId: { 
        required: true 
    },
    token: { 
        required: true 
    },
    sessionId: { 
        required: true 
    },
    rememberMe: { 
        boolean: true 
    },
    rememberDevice: { 
        boolean: true 
    }
};

const logoutSchema = {
    deviceId: { 
        string: true, 
        required: false 
    },
    allDevices: { 
        boolean: true, 
        required: false 
    }
};

// ============================================================================
// USER PROFILE MANAGEMENT
// ============================================================================

const updateProfileSchema = {
    name: { 
        minLength: 2, 
        maxLength: 100 
    },
    avatar: { 
        string: true 
    },
    preferences: { 
        object: true 
    },
    metadata: { 
        object: true 
    }
};

const secureProfileUpdateSchema = {
    name: { 
        minLength: 2, 
        maxLength: 100 
    },
    currentPassword: { 
        required: true 
    }
};

// ============================================================================
// PASSWORD & SECURITY MANAGEMENT
// ============================================================================

const changePasswordSchema = {
    currentPassword: { 
        required: true 
    },
    newPassword: { 
        required: true, 
        minLength: 8 
    }
};

const passwordResetRequestSchema = {
    email: { 
        required: true, 
        email: true 
    }
};

const passwordResetSchema = {
    token: { 
        required: true, 
        string: true 
    },
    newPassword: { 
        required: true, 
        minLength: 8 
    }
};

// 4-Digit Code Password Reset Flow
const forgotPasswordSendCodeSchema = {
    email: { 
        required: true, 
        email: true 
    }
};

const forgotPasswordVerifyCodeSchema = {
    email: { 
        required: true, 
        email: true 
    },
    code: { 
        required: true, 
        string: true,
        pattern: /^\d{4}$/,
        message: 'Code must be exactly 4 digits'
    }
};

const forgotPasswordResetSchema = {
    email: { 
        required: true, 
        email: true 
    },
    code: { 
        required: true, 
        string: true,
        pattern: /^\d{4}$/,
        message: 'Code must be exactly 4 digits'
    },
    newPassword: { 
        required: true, 
        minLength: 8 
    }
};

// ============================================================================
// USER PREFERENCES & SETTINGS
// ============================================================================

const updatePreferencesSchema = {
    section: { 
        string: true 
    },
    updates: { 
        object: true 
    }
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const sessionIdSchema = {
    sessionId: { 
        required: true, 
        string: true 
    }
};

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

const deleteAccountSchema = {
    password: { 
        string: true,
        minLength: 1
    },
    confirmDeletion: {
        required: true,
        boolean: true,
        custom: (value) => value === true ? true : 'Account deletion must be confirmed'
    }
};

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

const activityLogSchema = {
    limit: { 
        string: true,
        pattern: /^\d+$/,
        transform: (value) => parseInt(value, 10),
        min: 1, 
        max: 100 
    },
    page: { 
        string: true,
        pattern: /^\d+$/,
        transform: (value) => parseInt(value, 10),
        min: 1 
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Registration & Invitation
    registerSchema,
    
    // Authentication
    loginSchema,
    completeLogin2FASchema,
    logoutSchema,
    
    // Profile Management
    updateProfileSchema,
    secureProfileUpdateSchema,
    
    // Password & Security
    changePasswordSchema,
    passwordResetRequestSchema,
    passwordResetSchema,
    
    // 4-Digit Code Password Reset Flow
    forgotPasswordSendCodeSchema,
    forgotPasswordVerifyCodeSchema,
    forgotPasswordResetSchema,
    
    // Preferences & Settings
    updatePreferencesSchema,
    
    // Session Management
    sessionIdSchema,
    
    // Account Management
    deleteAccountSchema,
    
    // Activity Logging
    activityLogSchema
};
