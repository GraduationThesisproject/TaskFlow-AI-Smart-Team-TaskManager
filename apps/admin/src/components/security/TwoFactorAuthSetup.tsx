import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { Input } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Modal } from '@taskflow/ui';
import twoFactorAuthService, { TwoFactorAuthSetup as TwoFactorAuthSetupData } from '../../services/twoFactorAuthService';

interface TwoFactorAuthSetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

const TwoFactorAuthSetup: React.FC<TwoFactorAuthSetupProps> = ({
  onSetupComplete,
  onCancel
}) => {
  const [setupData, setSetupData] = useState<TwoFactorAuthSetupData | null>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'setup' | 'verification'>('setup');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await twoFactorAuthService.enable2FA();
      setSetupData(data);
      setStep('setup');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationToken.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await twoFactorAuthService.verify2FASetup(verificationToken);
      setStep('verification');
      setShowBackupCodes(true);
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onSetupComplete();
  };

  if (isLoading && !setupData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body-medium">Initializing 2FA setup...</Typography>
        </div>
      </div>
    );
  }

  if (!setupData) {
    return (
      <div className="text-center p-8">
        <Typography variant="h3" className="text-red-600 mb-4">Setup Failed</Typography>
        <Typography variant="body-medium" className="text-muted-foreground mb-4">
          {error || 'Failed to initialize 2FA setup'}
        </Typography>
        <div className="space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={initializeSetup}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Set Up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'setup' && (
            <>
              <div className="text-center">
                <Typography variant="body-medium" className="text-muted-foreground mb-4">
                  Scan the QR code below with your authenticator app to set up 2FA for your account.
                </Typography>
                
                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="border-2 border-border rounded-lg p-4 bg-white">
                    <img 
                      src={setupData.qrCode} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <Typography variant="body-small" className="text-muted-foreground mb-2">
                    Can't scan the QR code? Enter this code manually in your authenticator app:
                  </Typography>
                  <div className="bg-background border border-border rounded px-3 py-2 font-mono text-sm break-all">
                    {setupData.secret}
                  </div>
                </div>

                {/* Verification Step */}
                <div className="space-y-4">
                  <Typography variant="body-medium">
                    After scanning the QR code, enter the 6-digit code from your authenticator app:
                  </Typography>
                  
                  <div className="flex justify-center">
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      className="w-32 text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  <div className="flex justify-center space-x-3">
                    <Button variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleVerification}
                      disabled={verificationToken.length !== 6 || isLoading}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'verification' && (
            <>
              <div className="text-center">
                <div className="text-green-600 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <Typography variant="h3" className="text-green-600 mb-2">
                  Two-Factor Authentication Enabled!
                </Typography>
                
                <Typography variant="body-medium" className="text-muted-foreground mb-6">
                  Your account is now protected with two-factor authentication.
                </Typography>

                {/* Backup Codes */}
                {showBackupCodes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                    <Typography variant="h4" className="text-amber-800 mb-3">
                      ⚠️ Save Your Backup Codes
                    </Typography>
                    <Typography variant="body-medium" className="text-amber-700 mb-4">
                      These backup codes can be used to access your account if you lose your authenticator app. 
                      Save them in a secure location and keep them private.
                    </Typography>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {setupData.backupCodes.map((code, index) => (
                        <div 
                          key={index}
                          className="bg-white border border-amber-300 rounded px-3 py-2 font-mono text-sm text-center"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                    
                    <Typography variant="body-small" className="text-amber-600">
                      Each code can only be used once. You can generate new codes anytime from your security settings.
                    </Typography>
                  </div>
                )}

                <div className="space-y-3">
                  <Button onClick={handleComplete} className="w-full">
                    Complete Setup
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuthSetup;
