// Session-related types for authentication and authorization

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: string;
  lastActivityAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'web' | 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  version: string;
  isTrusted: boolean;
  fingerprint?: string;
  metadata?: Record<string, any>;
}

export interface SessionRequest {
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  rememberMe?: boolean;
  metadata?: Record<string, any>;
}

export interface SessionResponse {
  session: Session;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SessionValidation {
  isValid: boolean;
  isExpired: boolean;
  isRevoked: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface SessionRefresh {
  sessionId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
}

export interface SessionRevocation {
  sessionId: string;
  reason: 'user_logout' | 'admin_revoked' | 'security_breach' | 'expired' | 'other';
  revokedBy: string;
  revokedAt: string;
  metadata?: Record<string, any>;
}

export interface SessionAudit {
  id: string;
  sessionId: string;
  action: 'created' | 'refreshed' | 'revoked' | 'expired' | 'failed_login' | 'suspicious_activity';
  userId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SessionPolicy {
  id: string;
  name: string;
  description: string;
  maxSessionsPerUser: number;
  maxSessionsPerDevice: number;
  sessionTimeout: number; // in minutes
  refreshTokenExpiry: number; // in days
  requireReauthForSensitiveActions: boolean;
  allowedDeviceTypes: string[];
  blockedIpRanges: string[];
  allowedCountries: string[];
  metadata?: Record<string, any>;
}

export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  revokedSessions: number;
  sessionsByDeviceType: Record<string, number>;
  sessionsByCountry: Record<string, number>;
  averageSessionDuration: number;
  sessionCreationRate: number;
  sessionRevocationRate: number;
}

export interface SessionSecurity {
  sessionId: string;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  suspiciousActivities: string[];
  lastSecurityCheck: string;
  nextSecurityCheck: string;
  metadata?: Record<string, any>;
}

export interface SessionLocation {
  sessionId: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  isVpn: boolean;
  isProxy: boolean;
  metadata?: Record<string, any>;
}

export interface SessionActivity {
  id: string;
  sessionId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export interface SessionCleanup {
  expiredSessions: number;
  revokedSessions: number;
  inactiveSessions: number;
  totalCleaned: number;
  cleanupTime: number;
  errors: string[];
  metadata?: Record<string, any>;
}

// Session constants
export const SESSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  SUSPENDED: 'suspended',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export const SESSION_DEVICE_TYPES = {
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  TABLET: 'tablet',
} as const;

export type SessionDeviceType = typeof SESSION_DEVICE_TYPES[keyof typeof SESSION_DEVICE_TYPES];

export const SESSION_SECURITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SessionSecurityLevel = typeof SESSION_SECURITY_LEVELS[keyof typeof SESSION_SECURITY_LEVELS];

// Session configuration
export interface SessionConfig {
  accessTokenExpiry: number; // in minutes
  refreshTokenExpiry: number; // in days
  maxRefreshAttempts: number;
  refreshTokenRotation: boolean;
  concurrentSessionLimit: number;
  deviceFingerprinting: boolean;
  locationTracking: boolean;
  activityLogging: boolean;
  securityMonitoring: boolean;
}

// Session validation rules
export interface SessionValidationRules {
  requireValidIp: boolean;
  requireValidUserAgent: boolean;
  requireValidDeviceFingerprint: boolean;
  requireValidLocation: boolean;
  maxGeographicDistance: number; // in kilometers
  maxTimeBetweenActivities: number; // in minutes
  suspiciousActivityThreshold: number;
  autoRevokeOnSuspicion: boolean;
}
