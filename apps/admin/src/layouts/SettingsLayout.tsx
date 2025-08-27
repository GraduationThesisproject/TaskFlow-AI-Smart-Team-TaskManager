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
  Select,
  Badge
} from '@taskflow/ui';
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserPlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useLanguageContext } from '../contexts/LanguageContext';


import { adminService } from '../services/adminService';
import TwoFactorAuthManager from '../components/security/TwoFactorAuthManager';


const SettingsLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('security');
  const { currentLanguage, changeLanguage } = useLanguageContext();


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
    sessionTimeout: 30
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

  // Add User State
  const [addUser, setAddUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'moderator'
  });

  const [addUserStatus, setAddUserStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

  // Role Management State
  const [roleManagement, setRoleManagement] = useState({
    selectedUserId: '',
    newRole: 'moderator'
  });

  const [roleManagementStatus, setRoleManagementStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

  // Available roles for current user
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRoleManagementModal, setShowRoleManagementModal] = useState(false);

  // Admin Users Management State
  const [adminUsers, setAdminUsers] = useState<Array<{
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  }>>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [addAdminForm, setAddAdminForm] = useState({
    email: '',
    role: 'moderator'
  });
  const [addAdminStatus, setAddAdminStatus] = useState({
    isLoading: false,
    message: '',
    isError: false
  });

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

  // Admin Users Management Functions
  const handleAddAdmin = async () => {
    if (!addAdminForm.email || !addAdminForm.role) {
      setAddAdminStatus({ isLoading: false, message: 'Email and role are required', isError: true });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addAdminForm.email)) {
      setAddAdminStatus({ isLoading: false, message: 'Please enter a valid email address', isError: true });
      return;
    }

    try {
      setAddAdminStatus({ isLoading: true, message: '', isError: false });
      
      // Add admin user via API
      const newAdmin = {
        id: Date.now().toString(), // Temporary ID
        email: addAdminForm.email,
        role: addAdminForm.role,
        isActive: true
      };
      
      setAdminUsers(prev => [...prev, newAdmin]);
      setAddAdminForm({ email: '', role: 'moderator' });
      setShowAddAdminModal(false);
      setAddAdminStatus({ isLoading: false, message: 'Admin user added successfully!', isError: false });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAddAdminStatus(prev => ({ ...prev, message: '' }));
      }, 3000);
      
    } catch (error: any) {
      setAddAdminStatus({ 
        isLoading: false, 
        message: error.message || 'Failed to add admin user. Please try again.', 
        isError: true 
      });
    }
  };

  const handleEditAdmin = (admin: any) => {
    // TODO: Implement edit admin functionality
    console.log('Edit admin:', admin);
  };

  const handleToggleAdminStatus = (adminId: string) => {
    setAdminUsers(prev => prev.map(admin => 
      admin.id === adminId 
        ? { ...admin, isActive: !admin.isActive }
        : admin
    ));
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

  // Add User Functions
  const handleAddUser = async () => {
    // Validation
    if (!addUser.username || !addUser.email || !addUser.password || !addUser.confirmPassword) {
      setAddUserStatus({ isLoading: false, message: 'All fields are required', isError: true });
      return;
    }

    if (addUser.password !== addUser.confirmPassword) {
      setAddUserStatus({ isLoading: false, message: 'Passwords do not match', isError: true });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addUser.email)) {
      setAddUserStatus({ isLoading: false, message: 'Please enter a valid email address', isError: true });
      return;
    }

    // Password strength validation
    if (addUser.password.length < 8) {
      setAddUserStatus({ isLoading: false, message: 'Password must be at least 8 characters long', isError: true });
      return;
    }

    try {
      setAddUserStatus({ isLoading: true, message: '', isError: false });
      
      await adminService.addUserWithEmail({
        username: addUser.username,
        email: addUser.email,
        password: addUser.password,
        role: addUser.role
      });

      setAddUserStatus({ 
        isLoading: false, 
        message: 'User added successfully!', 
        isError: false 
      });

      // Reset form
      setAddUser({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'moderator'
      });

      // Close modal after success
      setTimeout(() => {
        setShowAddUserModal(false);
        setAddUserStatus({ isLoading: false, message: '', isError: false });
      }, 2000);

    } catch (error) {
      setAddUserStatus({ 
        isLoading: false, 
        message: error instanceof Error ? error.message : 'Failed to add user', 
        isError: true 
      });
    }
  };

  // Role Management Functions
  const handleRoleChange = async () => {
    if (!roleManagement.selectedUserId || !roleManagement.newRole) {
      setRoleManagementStatus({ isLoading: false, message: 'User ID and new role are required', isError: true });
      return;
    }

    try {
      setRoleManagementStatus({ isLoading: true, message: '', isError: false });
      
      await adminService.updateUserRole(roleManagement.selectedUserId, roleManagement.newRole);

      setRoleManagementStatus({ 
        isLoading: false, 
        message: 'User role updated successfully!', 
        isError: false 
      });

      // Reset form
      setRoleManagement({
        selectedUserId: '',
        newRole: 'moderator'
      });

      // Close modal after success
      setTimeout(() => {
        setShowRoleManagementModal(false);
        setRoleManagementStatus({ isLoading: false, message: '', isError: false });
      }, 2000);

    } catch (error) {
      setRoleManagementStatus({ 
        isLoading: false, 
        message: error instanceof Error ? error.message : 'Failed to update user role', 
        isError: true 
      });
    }
  };

  // Load available roles on component mount
  React.useEffect(() => {
    const loadAvailableRoles = async () => {
      try {
        const rolesData = await adminService.getAvailableRoles();
        setAvailableRoles(rolesData.availableRoles);
        setCurrentUserRole(rolesData.userRole);
      } catch (error) {
        console.error('Failed to load available roles:', error);
      }
    };

    loadAvailableRoles();
  }, []);

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
              {/* Admin Users Management */}
              <div className="space-y-4">
                <Typography variant="h3" className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Admin Panel Users Management
                </Typography>

                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="h4">Add New Admin User</Typography>
                      <Typography variant="body-small" className="text-muted-foreground">
                        Add email addresses for admin panel access with specific roles
                      </Typography>
                    </div>
                    <Button onClick={() => setShowAddAdminModal(true)} className="flex items-center space-x-2">
                      <UserPlusIcon className="h-4 w-4" />
                      Add Admin User
                    </Button>
                  </div>

                  {/* Admin Users List */}
                  <div className="space-y-3">
                    {adminUsers.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <Typography variant="body-medium" className="font-medium">
                              {admin.email}
                            </Typography>
                            <Typography variant="body-small" className="text-muted-foreground">
                              Role: {admin.role}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={admin.isActive ? 'success' : 'error'}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAdmin(admin)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleAdminStatus(admin.id)}
                          >
                            {admin.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {adminUsers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <UserGroupIcon className="h-8 w-8 mx-auto mb-2" />
                        <Typography variant="body-medium">No admin users added yet</Typography>
                        <Typography variant="body-small">Add the first admin user to get started</Typography>
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireSpecialChars: checked }))}
                    />
                    <label htmlFor="requireSpecialChars" className="text-sm font-medium">Require special characters</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={securitySettings.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireNumbers: checked }))}
                    />
                    <label htmlFor="requireNumbers" className="text-sm font-medium">Require numbers</label>
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
                 <Typography variant="h3">Two-Factor Authentication</Typography>
                 <TwoFactorAuthManager />
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

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <Typography variant="h3">Add New User</Typography>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Message */}
              {addUserStatus.message && (
                <div className={`p-3 rounded-md mb-4 ${
                  addUserStatus.isError 
                    ? 'bg-red-100 border border-red-300 text-red-700' 
                    : 'bg-green-100 border border-green-300 text-green-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{addUserStatus.message}</span>
                    <button
                      onClick={() => setAddUserStatus({ isLoading: false, message: '', isError: false })}
                      className="text-sm hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="modalUsername" className="text-sm font-medium">Username</label>
                  <Input
                    id="modalUsername"
                    value={addUser.username}
                    onChange={(e) => setAddUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalEmail" className="text-sm font-medium">Email Address</label>
                  <Input
                    id="modalEmail"
                    type="email"
                    value={addUser.email}
                    onChange={(e) => setAddUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalRole" className="text-sm font-medium">Role</label>
                  <Select
                    value={addUser.role}
                    onValueChange={(value) => setAddUser(prev => ({ ...prev, role: value }))}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalPassword" className="text-sm font-medium">Password</label>
                  <Input
                    id="modalPassword"
                    type="password"
                    value={addUser.password}
                    onChange={(e) => setAddUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                  <div className="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalConfirmPassword" className="text-sm font-medium">Confirm Password</label>
                  <Input
                    id="modalConfirmPassword"
                    type="password"
                    value={addUser.confirmPassword}
                    onChange={(e) => setAddUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddUser}
                  disabled={addUserStatus.isLoading}
                  className="min-w-[120px]"
                >
                  {addUserStatus.isLoading ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Role Management Modal */}
        {showRoleManagementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <Typography variant="h3">Manage User Role</Typography>
                </div>
                <button
                  onClick={() => setShowRoleManagementModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Message */}
              {roleManagementStatus.message && (
                <div className={`p-3 rounded-md mb-4 ${
                  roleManagementStatus.isError 
                    ? 'bg-red-100 border border-red-300 text-red-700' 
                    : 'bg-green-100 border border-green-300 text-green-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{roleManagementStatus.message}</span>
                    <button
                      onClick={() => setRoleManagementStatus({ isLoading: false, message: '', isError: false })}
                      className="text-sm hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="modalUserId" className="text-sm font-medium">User ID</label>
                  <Input
                    id="modalUserId"
                    value={roleManagement.selectedUserId}
                    onChange={(e) => setRoleManagement(prev => ({ ...prev, selectedUserId: e.target.value }))}
                    placeholder="Enter user ID"
                  />
                  <div className="text-xs text-muted-foreground">
                    Enter the ID of the user whose role you want to change
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modalNewRole" className="text-sm font-medium">New Role</label>
                  <Select
                    value={roleManagement.newRole}
                    onValueChange={(value) => setRoleManagement(prev => ({ ...prev, newRole: value }))}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRoleManagementModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRoleChange}
                  disabled={roleManagementStatus.isLoading}
                  className="min-w-[120px]"
                >
                  {roleManagementStatus.isLoading ? 'Updating...' : 'Update Role'}
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
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium">Email Notifications</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                    <label htmlFor="pushNotifications" className="text-sm font-medium">Push Notifications</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slackNotifications"
                      checked={notificationSettings.slackNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, slackNotifications: checked }))}
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
                     <Select defaultValue="moderator">
                       <option value="admin">Administrator</option>
                       <option value="moderator">Moderator</option>
                       <option value="super_admin">Super Admin</option>
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
                        <th className="px-4 py-2 text-center">Super Admin</th>
                        <th className="px-4 py-2 text-center">Admin</th>
                        <th className="px-4 py-2 text-center">Moderator</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">View Dashboard</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Create Tasks</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">Manage Users</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✓</td>
                        <td className="px-4 py-2 text-center">✗</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2">System Settings</td>
                        <td className="px-4 py-2 text-center">✓</td>
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
                     <Switch defaultChecked />
                     <label className="text-sm font-medium">Enable usage analytics</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked />
                     <label className="text-sm font-medium">Track user behavior</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch defaultChecked />
                     <label className="text-sm font-medium">Performance monitoring</label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Switch />
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

        {/* Add Admin Modal */}
        {showAddAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <UserPlusIcon className="h-6 w-6 text-primary" />
                  <Typography variant="h3">Add New Admin User</Typography>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Message */}
              {addAdminStatus.message && (
                <div className={`p-3 rounded-md mb-4 ${
                  addAdminStatus.isError 
                    ? 'bg-red-100 border border-red-300 text-red-700' 
                    : 'bg-green-100 border border-green-300 text-green-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span>{addAdminStatus.message}</span>
                    <button
                      onClick={() => setAddAdminStatus(prev => ({ ...prev, message: '' }))}
                      className="text-sm hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="adminEmail" className="text-sm font-medium">Email Address</label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={addAdminForm.email}
                    onChange={(e) => setAddAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter admin email address"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="adminRole" className="text-sm font-medium">Admin Role</label>
                  <Select
                    value={addAdminForm.role}
                    onChange={(e) => setAddAdminForm(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="moderator">Moderator - Basic admin access with limited permissions</option>
                    <option value="admin">Admin - Full admin access with most permissions</option>
                    <option value="super_admin">Super Admin - Complete system access with all permissions</option>
                  </Select>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Typography variant="body-small" className="text-blue-700">
                    <strong>Note:</strong> Admin users are completely separate from regular app users. 
                    They will only have access to the admin panel with permissions based on their role.
                  </Typography>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAdminModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddAdmin}
                  disabled={addAdminStatus.isLoading}
                  className="min-w-[120px]"
                >
                  {addAdminStatus.isLoading ? 'Adding...' : 'Add Admin User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default SettingsLayout;
