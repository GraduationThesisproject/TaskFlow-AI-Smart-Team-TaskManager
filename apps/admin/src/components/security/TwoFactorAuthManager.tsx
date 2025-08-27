import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@taskflow/ui';
import { Button } from '@taskflow/ui';
import { Input } from '@taskflow/ui';
import { Typography } from '@taskflow/ui';
import { Switch } from '@taskflow/ui';
import { Modal } from '@taskflow/ui';
import twoFactorAuthService, { TwoFactorAuthStatus } from '../../services/twoFactorAuthService';
import TwoFactorAuthSetup from './TwoFactorAuthSetup';

const TwoFactorAuthManager: React.FC = () => {
  const [status, setStatus] = useState<TwoFactorAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showRecoveryTokenModal, setShowRecoveryTokenModal] = useState(false);
  
  // Form states
  const [disableToken, setDisableToken] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [recoveryTokenData, setRecoveryTokenData] = useState<{ token: string; expiresAt: string } | null>(null);

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await twoFactorAuthService.get2FAStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load 2FA status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = () => {
    setShowSetupModal(true);
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    load2FAStatus();
    setSuccess('Two-factor authentication has been enabled successfully!');
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleDisable2FA = async () => {
    if (!disableToken.trim() && !recoveryToken.trim()) {
      setError('Please enter either a verification code or recovery token');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await twoFactorAuthService.disable2FA(disableToken, recoveryToken || undefined);
      setShowDisableModal(false);
      setDisableToken('');
      setRecoveryToken('');
      load2FAStatus();
      setSuccess('Two-factor authentication has been disabled successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await twoFactorAuthService.generateBackupCodes();
      setNewBackupCodes(data.backupCodes);
      setShowBackupCodesModal(true);
      load2FAStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to generate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecoveryToken = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await twoFactorAuthService.generateRecoveryToken();
      setRecoveryTokenData(data);
      setShowRecoveryTokenModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recovery token');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (isLoading && !status) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body-medium">Loading 2FA status...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Typography variant="body-medium" className="text-red-800">
            {error}
          </Typography>
          <button
            onClick={clearMessages}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Typography variant="body-medium" className="text-green-800">
            {success}
          </Typography>
          <button
            onClick={clearMessages}
            className="text-green-600 hover:text-green-800 text-sm mt-2"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* Main 2FA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Two-Factor Authentication
            </div>
            <Switch
              checked={status?.isEnabled || false}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnable2FA();
                } else {
                  setShowDisableModal(true);
                }
              }}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.isEnabled ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Typography variant="body-medium" className="text-green-800 mb-2">
                  ✓ Two-factor authentication is enabled
                </Typography>
                <Typography variant="body-small" className="text-green-700">
                  Enabled on: {new Date(status.enabledAt!).toLocaleDateString()}
                  {status.lastUsed && ` • Last used: ${new Date(status.lastUsed).toLocaleDateString()}`}
                </Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <Typography variant="body-medium" className="text-amber-800 mb-2">
                    Backup Codes
                  </Typography>
                  <Typography variant="body-small" className="text-amber-700 mb-3">
                    {status.remainingBackupCodes} of {status.totalBackupCodes} codes remaining
                    {status.needsNewBackupCodes && ' • Generate new codes recommended'}
                  </Typography>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateBackupCodes}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate New Codes'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Typography variant="body-medium" className="text-blue-800 mb-2">
                    Recovery Token
                  </Typography>
                  <Typography variant="body-small" className="text-blue-700 mb-3">
                    Generate a recovery token to disable 2FA if you lose access to your authenticator app.
                  </Typography>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateRecoveryToken}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Token'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <Typography variant="body-medium" className="text-gray-800 mb-2">
                Two-factor authentication is not enabled
              </Typography>
              <Typography variant="body-small" className="text-gray-700 mb-3">
                Enable 2FA to add an extra layer of security to your account. You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
              </Typography>
              <Button onClick={handleEnable2FA}>
                Enable Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        size="lg"
      >
        <TwoFactorAuthSetup
          onSetupComplete={handleSetupComplete}
          onCancel={() => setShowSetupModal(false)}
        />
      </Modal>

      {/* Disable Modal */}
      <Modal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        size="md"
      >
        <div className="p-6">
          <Typography variant="h3" className="mb-4">
            Disable Two-Factor Authentication
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-6">
            To disable 2FA, you'll need to provide either a verification code from your authenticator app or a recovery token.
          </Typography>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Verification Code (6 digits)
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={disableToken}
                onChange={(e) => setDisableToken(e.target.value)}
                className="w-full"
                maxLength={6}
              />
            </div>

            <div className="text-center">
              <Typography variant="body-small" className="text-muted-foreground">
                OR
              </Typography>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Recovery Token
              </label>
              <Input
                type="text"
                placeholder="Enter recovery token"
                value={recoveryToken}
                onChange={(e) => setRecoveryToken(e.target.value)}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDisableModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDisable2FA}
                disabled={isLoading || (!disableToken.trim() && !recoveryToken.trim())}
              >
                {isLoading ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        size="lg"
      >
        <div className="p-6">
          <Typography variant="h3" className="mb-4">
            New Backup Codes Generated
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-6">
            Save these backup codes in a secure location. Each code can only be used once.
          </Typography>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {newBackupCodes.map((code, index) => (
              <div 
                key={index}
                className="bg-white border-2 border-blue-300 rounded-lg px-4 py-3 font-mono text-center text-lg font-bold text-blue-800 shadow-sm"
              >
                {code}
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <Typography variant="body-small" className="text-amber-800">
              ⚠️ Important: Save these codes now. They won't be shown again after you close this dialog.
            </Typography>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowBackupCodesModal(false)}>
              I've Saved the Codes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recovery Token Modal */}
      <Modal
        isOpen={showRecoveryTokenModal}
        onClose={() => setShowRecoveryTokenModal(false)}
        size="md"
      >
        <div className="p-6">
          <Typography variant="h3" className="mb-4">
            Recovery Token Generated
          </Typography>
          <Typography variant="body-medium" className="text-muted-foreground mb-6">
            Use this recovery token to disable 2FA if you lose access to your authenticator app.
          </Typography>

          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-4 shadow-sm">
            <Typography variant="body-small" className="text-blue-800 mb-2 font-medium">
              Recovery Token:
            </Typography>
            <div className="font-mono text-lg break-all text-blue-900 font-bold bg-blue-50 p-3 rounded border border-blue-200">
              {recoveryTokenData?.recoveryToken}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Typography variant="body-small" className="text-blue-800">
              ⚠️ This token expires on: {recoveryTokenData?.expiresAt ? new Date(recoveryTokenData.expiresAt).toLocaleString() : 'Unknown'}
            </Typography>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowRecoveryTokenModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TwoFactorAuthManager;
