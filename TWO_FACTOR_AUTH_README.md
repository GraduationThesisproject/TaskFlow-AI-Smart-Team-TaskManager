# Two-Factor Authentication (2FA) Implementation

## Overview

This implementation provides a comprehensive Two-Factor Authentication system using TOTP (Time-based One-Time Password) with Google Authenticator compatibility, backup codes, and recovery tokens.

## Features

- **TOTP Authentication**: Industry-standard 6-digit codes that change every 30 seconds
- **QR Code Setup**: Easy setup with authenticator apps like Google Authenticator, Authy, 1Password
- **Backup Codes**: 10 one-time use backup codes for account recovery
- **Recovery Tokens**: Time-limited tokens to disable 2FA if authenticator app is lost
- **Device Remembering**: Option to remember trusted devices for 30 days
- **Comprehensive Logging**: All 2FA activities are logged for security auditing

## Backend Implementation

### Dependencies

```bash
npm install speakeasy qrcode
```

### Key Files

1. **`src/services/twoFactorAuth.service.js`** - Core 2FA logic
2. **`src/controllers/twoFactorAuth.controller.js`** - API endpoints
3. **`src/routes/twoFactorAuth.routes.js`** - Route definitions
4. **`src/models/User.js`** - Updated with 2FA fields

### API Endpoints

#### Public Endpoints (No Auth Required)
- `POST /api/auth/login/2fa-complete` - Complete login with 2FA verification

#### Protected Endpoints (Auth Required)
- `POST /api/2fa/enable` - Enable 2FA and get setup data
- `POST /api/2fa/verify-setup` - Verify and complete 2FA setup
- `POST /api/2fa/disable` - Disable 2FA
- `POST /api/2fa/backup-codes` - Generate new backup codes
- `GET /api/2fa/status` - Get 2FA status and backup code count
- `POST /api/2fa/recovery-token` - Generate recovery token

### Database Schema

The User model has been extended with:

```javascript
twoFactorAuth: {
  secret: String,           // TOTP secret (encrypted, not included in queries)
  backupCodes: [{
    code: String,           // Backup code
    used: Boolean,          // Whether code has been used
    usedAt: Date           // When code was used
  }],
  recoveryToken: String,    // Recovery token for disabling 2FA
  recoveryTokenExpires: Date, // Token expiry
  enabledAt: Date,         // When 2FA was enabled
  lastUsed: Date           // Last 2FA verification
}
```

## Frontend Implementation

### Key Components

1. **`TwoFactorAuthSetup.tsx`** - Setup flow with QR code and verification
2. **`TwoFactorAuthManager.tsx`** - Settings management (enable/disable/backup codes)
3. **`TwoFactorAuthVerification.tsx`** - Login verification component
4. **`twoFactorAuthService.ts`** - Frontend service for API communication

### Integration Points

- **Settings Layout**: 2FA management in security tab
- **Login Flow**: Enhanced to handle 2FA verification
- **Admin Panel**: Full 2FA management capabilities

## User Experience Flow

### 1. Enabling 2FA

1. User goes to Security Settings
2. Clicks "Enable Two-Factor Authentication"
3. Scans QR code with authenticator app
4. Enters 6-digit verification code
5. Receives backup codes to save securely
6. 2FA is now active

### 2. Login with 2FA

1. User enters email/password
2. If 2FA is enabled, system shows 2FA verification screen
3. User enters 6-digit code from authenticator app
4. Option to remember device for 30 days
5. Login completes successfully

### 3. Using Backup Codes

1. User loses access to authenticator app
2. During login, clicks "Use Backup Code"
3. Enters one of the saved backup codes
4. Code is marked as used and can't be reused
5. System warns if backup codes are running low

### 4. Disabling 2FA

1. User goes to Security Settings
2. Toggles 2FA off
3. Must provide either:
   - Current 6-digit verification code, OR
   - Valid recovery token
4. 2FA is disabled and all data is cleared

## Security Features

### TOTP Implementation
- Uses `speakeasy` library for industry-standard TOTP
- 32-character base32 encoded secrets
- 30-second time windows with 2-step clock skew tolerance
- Compatible with all major authenticator apps

### Backup Codes
- 10 unique 8-character alphanumeric codes
- One-time use only
- Automatically marked as used when consumed
- Warning when fewer than 3 codes remain

### Recovery Tokens
- 32-character hexadecimal tokens
- 24-hour expiration
- Can only be used to disable 2FA
- Generated on-demand for security

### Session Management
- Device tokens for "remember this device"
- 30-day validity for trusted devices
- Includes user agent and device ID for security

## Configuration

### Environment Variables

```bash
# Optional: Customize 2FA settings
TWO_FACTOR_APP_NAME="TaskFlow AI"        # App name in authenticator
TWO_FACTOR_BACKUP_CODES_COUNT=10         # Number of backup codes
TWO_FACTOR_RECOVERY_TOKEN_EXPIRY=86400000 # Token expiry in ms (24h)
TWO_FACTOR_DEVICE_TOKEN_EXPIRY=2592000000 # Device token expiry in ms (30d)
```

### Customization Options

- **App Name**: Change "TaskFlow AI" to your application name
- **Backup Code Count**: Adjust number of backup codes generated
- **Token Expiry**: Modify recovery and device token lifetimes
- **Clock Skew**: Adjust TOTP verification tolerance

## Testing

### Test Scenarios

1. **Enable 2FA**: Complete setup flow
2. **Login with 2FA**: Verify login requires 2FA code
3. **Backup Codes**: Test backup code usage
4. **Recovery Token**: Test recovery token generation and usage
5. **Device Remembering**: Test device token functionality
6. **Disable 2FA**: Test both verification code and recovery token methods

### Test Data

```javascript
// Sample TOTP secret for testing
const testSecret = 'JBSWY3DPEHPK3PXP';

// Sample backup codes
const testBackupCodes = ['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2'];
```

## Troubleshooting

### Common Issues

1. **QR Code Not Scanning**
   - Ensure good lighting and contrast
   - Check authenticator app compatibility
   - Use manual entry as fallback

2. **Verification Code Rejected**
   - Check device clock synchronization
   - Ensure code is entered within 30 seconds
   - Verify authenticator app is properly configured

3. **Backup Codes Not Working**
   - Ensure codes are entered exactly as shown
   - Check if code has already been used
   - Generate new backup codes if needed

4. **Recovery Token Expired**
   - Generate new recovery token
   - Use verification code instead
   - Contact administrator if needed

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
DEBUG=2fa:*
```

## Security Considerations

### Best Practices

1. **Backup Codes**: Store securely offline (password manager, safe)
2. **Recovery Tokens**: Generate only when needed
3. **Device Trust**: Only remember devices you own
4. **Regular Review**: Check 2FA status periodically
5. **Multiple Factors**: Combine with strong passwords

### Risk Mitigation

- **Secret Storage**: TOTP secrets are encrypted and not exposed in API responses
- **Rate Limiting**: Implement rate limiting on 2FA endpoints
- **Audit Logging**: All 2FA activities are logged for security monitoring
- **Session Management**: Proper session handling prevents 2FA bypass

## Future Enhancements

### Potential Improvements

1. **Hardware Keys**: FIDO2/U2F support for YubiKey
2. **Push Notifications**: Mobile app-based approval
3. **Biometric**: Fingerprint/Face ID integration
4. **Advanced Policies**: Role-based 2FA requirements
5. **Analytics**: 2FA usage and security metrics

### Integration Opportunities

- **SMS/Email**: Fallback verification methods
- **LDAP/AD**: Enterprise authentication integration
- **SSO**: Single sign-on with 2FA
- **Compliance**: GDPR, SOC2, HIPAA compliance features

## Support

For technical support or questions about the 2FA implementation:

1. Check this documentation
2. Review the code comments
3. Check the application logs
4. Contact the development team

## License

This 2FA implementation is part of the TaskFlow AI project and follows the same licensing terms.
