import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Typography,
  Button,
  Input,
  Container,
  Grid,
  Switch,
  Select
} from '@taskflow/ui';
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '../hooks/useLanguage';
import { adminService } from '../services/adminService';

const SettingsLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { currentLanguage, changeLanguage } = useLanguageContext();
  const { t } = useTranslation();

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'TaskFlow AI',
    timezone: 'UTC',
    theme: 'auto',
    language: currentLanguage
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    sessionTimeout: 30,
    enable2FA: false
  });

  // Password Change State
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordChangeStatus, setPasswordChangeStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

  // Email Change State
  const [emailChange, setEmailChange] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: ''
  });

  const [emailChangeStatus, setEmailChangeStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Za-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*#?&]/.test(password)) score += 1;
    if (password.length >= 12) score += 1;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    
    return {
      score: Math.min(score, 4),
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)]
    };
  };

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    slackNotifications: false,
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587
  });

  const saveSettings = (section: string) => {
    console.log(`Saving ${section} settings...`);
    
    // If language changed, apply it immediately
    if (section === 'general' && systemSettings.language !== currentLanguage) {
      changeLanguage(systemSettings.language);
    }
    
    alert(`${section} settings saved successfully!`);
  };

  const handleLanguageChange = (language: string) => {
    setSystemSettings(prev => ({ ...prev, language: language as any }));
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword) {
      setPasswordChangeStatus({ isLoading: false, message: 'All fields are required', isError: true });
      return;
    }

    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setPasswordChangeStatus({ isLoading: false, message: 'New passwords do not match', isError: false });
      return;
    }

    if (passwordChange.newPassword.length < 8) {
      setPasswordChangeStatus({ isLoading: false, message: 'New password must be at least 8 characters', isError: true });
      return;
    }

    // Password strength validation
    const hasLetter = /[A-Za-z]/.test(passwordChange.newPassword);
    const hasNumber = /\d/.test(passwordChange.newPassword);
    const hasSpecialChar = /[@$!%*#?&]/.test(passwordChange.newPassword);

    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      setPasswordChangeStatus({ 
        isLoading: false, 
        message: 'Password must contain at least one letter, one number, and one special character', 
        isError: true 
      });
      return;
    }

    // Show confirmation dialog
    setShowPasswordConfirm(true);
  };

  const confirmPasswordChange = async () => {
    // Reset status
    setPasswordChangeStatus({ isLoading: true, message: '', isError: false });

    try {
      // Make API call to change password
      await adminService.changePassword({
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword
      });
      
      // Success
      setPasswordChangeStatus({ 
        isLoading: false, 
        message: 'Password changed successfully!', 
        isError: false 
      });
      
      // Clear form
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide confirmation dialog
      setShowPasswordConfirm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordChangeStatus(prev => ({ ...prev, message: '' }));
      }, 3000);
      
    } catch (error: any) {
      setPasswordChangeStatus({ 
        isLoading: false, 
        message: error.message || 'Failed to change password. Please try again.', 
        isError: true 
      });
    }
  };

  const clearPasswordChangeStatus = () => {
    setPasswordChangeStatus({ isLoading: false, message: '', isError: false });
  };

  const openPasswordChangeModal = () => {
    setShowPasswordChangeModal(true);
    // Clear any previous status messages
    setPasswordChangeStatus({ isLoading: false, message: '', isError: false });
    // Clear form
    setPasswordChange({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const closePasswordChangeModal = () => {
    setShowPasswordChangeModal(false);
    setShowPasswordConfirm(false);
    setPasswordChangeStatus({ isLoading: false, message: '', isError: false });
  };

  // Email Change Functions
  const handleEmailChange = async () => {
    // Validation
    if (!emailChange.currentPassword || !emailChange.newEmail || !emailChange.confirmEmail) {
      setEmailChangeStatus({ isLoading: false, message: 'All fields are required', isError: true });
      return;
    }

    if (emailChange.newEmail !== emailChange.confirmEmail) {
      setEmailChangeStatus({ isLoading: false, message: 'New emails do not match', isError: true });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailChange.newEmail)) {
      setEmailChangeStatus({ isLoading: false, message: 'Please enter a valid email address', isError: true });
      return;
    }

    // Show confirmation dialog
    setShowEmailConfirm(true);
  };

  const confirmEmailChange = async () => {
    // Reset status
    setEmailChangeStatus({ isLoading: true, message: '', isError: false });

    try {
      // Here you would make an API call to change the email
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Success
      setEmailChangeStatus({ 
        isLoading: false, 
        message: 'Email changed successfully! Please check your new email for verification.', 
        isError: false 
      });
      
      // Clear form
      setEmailChange({
        currentPassword: '',
        newEmail: '',
        confirmEmail: ''
      });
      
      // Hide confirmation dialog
      setShowEmailConfirm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setEmailChangeStatus(prev => ({ ...prev, message: '' }));
      }, 5000);
      
    } catch (error: any) {
      setEmailChangeStatus({ 
        isLoading: false, 
        message: error.message || 'Failed to change email. Please try again.', 
        isError: true 
      });
    }
  };

  const clearEmailChangeStatus = () => {
    setEmailChangeStatus({ isLoading: false, message: '', isError: false });
  };

  const openEmailChangeModal = () => {
    setShowEmailChangeModal(true);
    // Clear any previous status messages
    setEmailChangeStatus({ isLoading: false, message: '', isError: false });
    // Clear form
    setEmailChange({
      currentPassword: '',
      newEmail: '',
      confirmEmail: ''
    });
  };

  const closeEmailChangeModal = () => {
    setShowEmailChangeModal(false);
    setShowEmailConfirm(false);
    setEmailChangeStatus({ isLoading: false, message: '', isError: false });
  };

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              System Settings
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Configure system preferences, security policies, and integrations
            </Typography>
          </div>
          <Button variant="outline">
            Export Settings
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'general'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CogIcon className="h-4 w-4 mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'notifications'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <BellIcon className="h-4 w-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'integrations'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <PuzzlePieceIcon className="h-4 w-4 mr-2" />
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                General System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Grid cols={2} className="gap-6">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
                  <Select
                    value={systemSettings.timezone}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="theme" className="text-sm font-medium">Theme</label>
                  <Select
                    value={systemSettings.theme}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, theme: value }))}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium">Language</label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={handleLanguageChange}
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </Select>
                </div>
              </Grid>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('general')}>
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Security & Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Typography variant="h3">Password Policy</Typography>
                <Grid cols={2} className="gap-6">
                  <div className="space-y-2">
                    <label htmlFor="passwordMinLength" className="text-sm font-medium">Minimum Password Length</label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                      min={6}
                      max={32}
                    />
                  </div>
                </Grid>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={securitySettings.requireSpecialChars}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                    />
                    <label htmlFor="requireSpecialChars" className="text-sm font-medium">Require special characters</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={securitySettings.requireNumbers}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                    />
                    <label htmlFor="requireNumbers" className="text-sm font-medium">Require numbers</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable2FA"
                      checked={securitySettings.enable2FA}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, enable2FA: e.target.checked }))}
                    />
                    <label htmlFor="enable2FA" className="text-sm font-medium">Enable Two-Factor Authentication</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Session Management</Typography>
                <div className="space-y-2">
                  <label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    min={5}
                    max={1440}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Change Password</Typography>
                
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <Typography variant="body-medium" className="text-muted-foreground mb-4">
                    Click the button below to change your password securely.
                  </Typography>
                  
                  <Button 
                    onClick={openPasswordChangeModal}
                    className="flex items-center space-x-2"
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Change Email</Typography>
                
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <Typography variant="body-medium" className="text-muted-foreground mb-4">
                    Click the button below to change your email address securely.
                  </Typography>
                  
                                     <Button 
                     onClick={openEmailChangeModal}
                     className="flex items-center space-x-2"
                   >
                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                     Change Email
                   </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('security')}>
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Change Modal */}
        {showPasswordChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-primary" />
                  <Typography variant="h3">Change Password</Typography>
                </div>
                <button
                  onClick={closePasswordChangeModal}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Message */}
              {passwordChangeStatus.message && (
                <div className={`p-3 rounded-md mb-4 ${
                  passwordChangeStatus.isError 
                    ? 'bg-red-100 border border-red-300 text-red-700' 
                    : 'bg-green-100 border border-green-300 text-green-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{passwordChangeStatus.message}</span>
                    <button
                      onClick={clearPasswordChangeStatus}
                      className="text-sm hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="modalCurrentPassword" className="text-sm font-medium">Current Password</label>
                  <Input
                    id="modalCurrentPassword"
                    type="password"
                    value={passwordChange.currentPassword}
                    onChange={(e) => setPasswordChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalNewPassword" className="text-sm font-medium">New Password</label>
                  <Input
                    id="modalNewPassword"
                    type="password"
                    value={passwordChange.newPassword}
                    onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password"
                  />
                  <div className="text-xs text-muted-foreground">
                    Must be at least 8 characters with letters, numbers, and special characters
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordChange.newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">Strength:</span>
                        <span className={`text-xs font-medium ${getPasswordStrength(passwordChange.newPassword).color}`}>
                          {getPasswordStrength(passwordChange.newPassword).label}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-colors ${
                              level <= getPasswordStrength(passwordChange.newPassword).score
                                ? getPasswordStrength(passwordChange.newPassword).color.replace('text-', 'bg-')
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalConfirmPassword" className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    id="modalConfirmPassword"
                    type="password"
                    value={passwordChange.confirmPassword}
                    onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={closePasswordChangeModal}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={passwordChangeStatus.isLoading}
                  className="min-w-[120px]"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Email Change Modal */}
        {showEmailChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <Typography variant="h3">Change Email</Typography>
                </div>
                <button
                  onClick={closeEmailChangeModal}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Message */}
              {emailChangeStatus.message && (
                <div className={`p-3 rounded-md mb-4 ${
                  emailChangeStatus.isError 
                    ? 'bg-red-100 border border-red-300 text-red-700' 
                    : 'bg-green-100 border border-green-300 text-green-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{emailChangeStatus.message}</span>
                    <button
                      onClick={clearEmailChangeStatus}
                      className="text-sm hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="modalCurrentPasswordEmail" className="text-sm font-medium">Current Password</label>
                  <Input
                    id="modalCurrentPasswordEmail"
                    type="password"
                    value={emailChange.currentPassword}
                    onChange={(e) => setEmailChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                  <div className="text-xs text-muted-foreground">
                    Required for security verification
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalNewEmail" className="text-sm font-medium">New Email Address</label>
                  <Input
                    id="modalNewEmail"
                    type="email"
                    value={emailChange.newEmail}
                    onChange={(e) => setEmailChange(prev => ({ ...prev, newEmail: e.target.value }))}
                    placeholder="Enter your new email address"
                  />
                  <div className="text-xs text-muted-foreground">
                    Must be a valid email address
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalConfirmEmail" className="text-sm font-medium">Confirm New Email</label>
                  <Input
                    id="modalConfirmEmail"
                    type="email"
                    value={emailChange.confirmEmail}
                    onChange={(e) => setEmailChange(prev => ({ ...prev, confirmEmail: e.target.value }))}
                    placeholder="Confirm your new email address"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={closeEmailChangeModal}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEmailChange}
                  disabled={emailChangeStatus.isLoading}
                  className="min-w-[120px]"
                >
                  Change Email
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Confirmation Modal */}
        {showPasswordConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-yellow-500" />
                <Typography variant="h3">Confirm Password Change</Typography>
              </div>
              
              <Typography variant="body-medium" className="text-muted-foreground mb-6">
                Are you sure you want to change your password? This action cannot be undone and you'll need to log in again with your new password.
              </Typography>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmPasswordChange}
                  disabled={passwordChangeStatus.isLoading}
                  className="flex-1"
                >
                  {passwordChangeStatus.isLoading ? 'Changing...' : 'Confirm Change'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Email Change Confirmation Modal */}
        {showEmailConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <Typography variant="h3">Confirm Email Change</Typography>
              </div>
              
              <Typography variant="body-medium" className="text-muted-foreground mb-6">
                Are you sure you want to change your email address? This action will require email verification and may affect your login credentials.
              </Typography>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEmailConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmEmailChange}
                  disabled={emailChangeStatus.isLoading}
                  className="flex-1"
                >
                  {emailChangeStatus.isLoading ? 'Changing...' : 'Confirm Change'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Typography variant="h3">Notification Channels</Typography>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    />
                    <label htmlFor="pushNotifications" className="text-sm font-medium">Push Notifications</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slackNotifications"
                      checked={notificationSettings.slackNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, slackNotifications: e.target.checked }))}
                    />
                    <label htmlFor="slackNotifications" className="text-sm font-medium">Slack Notifications</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Typography variant="h3">Email Configuration</Typography>
                <Grid cols={2} className="gap-6">
                  <div className="space-y-2">
                    <label htmlFor="smtpServer" className="text-sm font-medium">SMTP Server</label>
                    <Input
                      id="smtpServer"
                      value={notificationSettings.smtpServer}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="smtpPort" className="text-sm font-medium">SMTP Port</label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={notificationSettings.smtpPort}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      placeholder="587"
                    />
                  </div>
                </Grid>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('notifications')}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PuzzlePieceIcon className="h-5 w-5 mr-2" />
                Third-Party Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Typography variant="h3">Slack Integration</Typography>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="slackWebhook" className="text-sm font-medium">Webhook URL</label>
                    <Input
                      id="slackWebhook"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="slackChannel" className="text-sm font-medium">Default Channel</label>
                    <Input
                      id="slackChannel"
                      placeholder="#general"
                    />
                  </div>
                  <Button variant="outline">
                    Test Slack Connection
                  </Button>
                </div>
              </div>

                             <div className="space-y-4">
                 <Typography variant="h3">Service Integrations</Typography>
                 <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Typography variant="body-medium">Google Drive</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        File storage and document collaboration
                      </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Typography variant="body-medium">GitHub</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Code repository and version control
                      </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Typography variant="body-medium">Stripe</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Payment processing and billing
                      </Typography>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveSettings('integrations')}>
                  Save Integration Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Management Settings */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                User Management & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             <div className="space-y-4">
                 <Typography variant="h3">Default User Settings</Typography>
                 <Grid cols={2} className="gap-6">
                   <div className="space-y-2">
                     <label htmlFor="defaultRole" className="text-sm font-medium">Default User Role</label>
                     <Select defaultValue="user">
                       <option value="admin">Administrator</option>
                       <option value="manager">Manager</option>
                       <option value="user">User</option>
                       <option value="viewer">Viewer</option>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <label htmlFor="autoApprove" className="text-sm font-medium">Auto-approve New Users</label>
                     <Select defaultValue="false">
                       <option value="true">Yes</option>
                       <option value="false">No</option>
                     </Select>
                   </div>
                 </Grid>
               </div>

               <div className="space-y-4">
                 <Typography variant="h3">Permission Matrix</Typography>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Permission</th>
                        <th className="px-4 py-2 text-center">Admin</th>
                        <th className="px-4 py-2 text-center">Manager</th>
                        <th className="px-4 py-2 text-center">User</th>
                        <th className="px-4 py-2 text-center">Viewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">View Dashboard</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Create Tasks</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Manage Users</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">System Settings</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                        <td className="px-4 py-2 text-center">✗</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Export Permissions
                </Button>
                <Button onClick={() => saveSettings('users')}>
                  Save User Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Settings */}
        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                             <div className="space-y-4">
                 <Typography variant="h3">Data Collection</Typography>
                 <div className="space-y-3">
                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked onChange={(e) => console.log('Usage analytics:', e.target.checked)} />
                     <label className="text-sm font-medium">Enable usage analytics</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked onChange={(e) => console.log('User behavior:', e.target.checked)} />
                     <label className="text-sm font-medium">Track user behavior</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked onChange={(e) => console.log('Performance monitoring:', e.target.checked)} />
                     <label className="text-sm font-medium">Performance monitoring</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch onChange={(e) => console.log('Error tracking:', e.target.checked)} />
                     <label className="text-sm font-medium">Error tracking and reporting</label>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <Typography variant="h3">Report Generation</Typography>
                 <Grid cols={2} className="gap-6">
                   <div className="space-y-2">
                     <label htmlFor="reportFrequency" className="text-sm font-medium">Default Report Frequency</label>
                     <Select defaultValue="weekly">
                       <option value="daily">Daily</option>
                       <option value="weekly">Weekly</option>
                       <option value="monthly">Monthly</option>
                       <option value="quarterly">Quarterly</option>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <label htmlFor="reportFormat" className="text-sm font-medium">Default Report Format</label>
                     <Select defaultValue="pdf">
                       <option value="pdf">PDF</option>
                       <option value="excel">Excel</option>
                       <option value="csv">CSV</option>
                       <option value="json">JSON</option>
                     </Select>
                   </div>
                 </Grid>
               </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  Generate Sample Report
                </Button>
                <Button onClick={() => saveSettings('analytics')}>
                  Save Analytics Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default SettingsLayout;
