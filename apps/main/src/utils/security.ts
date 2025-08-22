// Security utilities for input validation, sanitization, and security checks

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const sanitizedEmail = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    errors.push('Invalid email format');
  }
  
  if (sanitizedEmail.length > 254) {
    errors.push('Email is too long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password is too long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Name is required');
    return { isValid: false, errors };
  }
  
  const sanitizedName = sanitizeInput(name);
  
  if (sanitizedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (sanitizedName.length > 50) {
    errors.push('Name is too long');
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(sanitizedName)) {
    errors.push('Name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// URL validation
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url) {
    errors.push('URL is required');
    return { isValid: false, errors };
  }
  
  const sanitizedUrl = sanitizeInput(url);
  
  try {
    const urlObj = new URL(sanitizedUrl);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('URL must use HTTP or HTTPS protocol');
    }
  } catch {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// XSS prevention
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Content Security Policy helper
export const generateCSP = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' ws: wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Secure random string generation
export const generateSecureString = (length: number = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[array[i] % charset.length];
  }
  
  return result;
};

// Input length validation
export const validateLength = (
  input: string, 
  minLength: number, 
  maxLength: number, 
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (!input) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }
  
  if (input.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (input.length > maxLength) {
    errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File type validation
export const validateFileType = (
  file: File, 
  allowedTypes: string[]
): ValidationResult => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check file extension as additional security
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = allowedTypes.map(type => 
    type.split('/')[1]?.toLowerCase()
  ).filter(Boolean);
  
  if (extension && !allowedExtensions.includes(extension)) {
    errors.push(`File extension .${extension} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// File size validation
export const validateFileSize = (
  file: File, 
  maxSizeBytes: number
): ValidationResult => {
  const errors: string[] = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
