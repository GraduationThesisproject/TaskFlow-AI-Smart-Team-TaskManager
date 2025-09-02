import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { Input } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Switch } from '@taskflow/ui';

interface TwoFactorAuthVerificationProps {
  userId: string;
  onVerificationSuccess: (data: any) => void;
  onCancel: () => void;
  onVerify: (token: string, rememberDevice: boolean) => Promise<any>;
}

const TwoFactorAuthVerification: React.FC<TwoFactorAuthVerificationProps> = ({
  userId,
  onVerificationSuccess,
  onCancel,
  onVerify
}) => {
  const [token, setToken] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
console.log(token);
console.log(rememberDevice);
console.log(isLoading);
console.log(error);
console.log(useBackupCode);
  const handleVerification = async () => {
    if (!token.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Use the custom verification function - it should handle the verification directly
      await onVerify(token, rememberDevice);
      // onVerify handles everything, no need to call onVerificationSuccess
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeToggle = () => {
    setUseBackupCode(!useBackupCode);
    setToken('');
    setError('');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <svg className="h-8 w-8 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Typography variant="body-medium" className="text-muted-foreground mb-4">
              {useBackupCode 
                ? 'Enter one of your backup codes to access your account.'
                : 'Enter the 6-digit code from your authenticator app.'
              }
            </Typography>
          </div>

          {/* Toggle between TOTP and Backup Code */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setUseBackupCode(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !useBackupCode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Authenticator App
            </button>
            <button
              onClick={() => setUseBackupCode(true)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                useBackupCode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Backup Code
            </button>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-center">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <Input
              type="text"
              placeholder={useBackupCode ? 'Enter backup code' : '000000'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className={`text-center font-mono text-lg ${
                useBackupCode ? 'tracking-normal' : 'tracking-widest'
              }`}
              maxLength={useBackupCode ? 8 : 6}
            />
          </div>

          {/* Remember Device Option */}
          {!useBackupCode && (
            <div className="flex items-center space-x-2">
              <Switch
                id="rememberDevice"
                checked={rememberDevice}
                onCheckedChange={setRememberDevice}
              />
              <label htmlFor="rememberDevice" className="text-sm text-muted-foreground">
                Remember this device for 30 days
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <Typography variant="body-small" className="text-red-800 text-center">
                {error}
              </Typography>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleVerification}
              disabled={isLoading || !token.trim()}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <Typography variant="body-small" className="text-muted-foreground">
              {useBackupCode 
                ? 'Lost your backup codes? Contact your administrator.'
                : 'Lost your authenticator app? Use a backup code instead.'
              }
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuthVerification;
