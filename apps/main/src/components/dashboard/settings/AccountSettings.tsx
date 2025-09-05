import React, { useState, useRef, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Typography, Input,
  AvatarWithFallback,
  Modal, ModalBody, ModalFooter,
  Badge, Separator
} from '@taskflow/ui';
import { Shield, Eye, EyeOff, User, Camera, Save, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

const AccountSettings: React.FC = () => {
  const { user, updateProfileSecure: updateProfileSecureAction, changePassword: changePasswordAction } = useAuth();
  const { error } = useToast();

  // Profile form state
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Initialize form once user loads
  useEffect(() => {
    if (user?.user) {
      setProfileForm({
        name: user.user.name || '',
        email: user.user.email || '',
      });
    }
  }, [user]);

  // Avatar state
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password confirmation popup state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPwd, setConfirmPwd] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const onProfileChange = (field: 'name' | 'email', value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChooseAvatar = () => fileInputRef.current?.click();

  const onAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedAvatar(null);
      setAvatarPreview(null);
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return error('Only JPG, PNG, or WEBP allowed', 'Invalid File Type');
    if (file.size > 2 * 1024 * 1024) return error('Max 2MB', 'File Too Large');

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Revoke previous preview URL to avoid memory leaks
  useEffect(() => {
    if (!avatarPreview) return;
    return () => {
      try { URL.revokeObjectURL(avatarPreview); } catch {}
    };
  }, [avatarPreview]);

  const onSaveProfile = () => {
    setConfirmError(null);
    setConfirmPwd('');
    if (!hasChanges) return;
    setShowConfirm(true);
  };

  const confirmAndSave = async () => {
    if (!confirmPwd || confirmPwd.length < 6) {
      setConfirmError('Please enter your current password.');
      return;
    }
    setIsSavingProfile(true);
    try {
      console.log('[AccountSettings] confirmAndSave -> dispatch updateProfileSecure', {
        name: profileForm.name?.trim(),
        hasAvatar: !!selectedAvatar
      });
      const result = await updateProfileSecureAction({
        name: profileForm.name.trim(),
        currentPassword: confirmPwd,
        avatar: selectedAvatar || undefined,
      });

      console.log('[AccountSettings] updateProfileSecure result', result);
      console.log('[AccountSettings] updateProfileSecure success');
      setShowConfirm(false);
      setConfirmPwd('');
      setAvatarPreview(null);
      setSelectedAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      setConfirmError(e?.response?.data?.message || e?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const cancelConfirm = () => {
    if (isSavingProfile) return;
    setShowConfirm(false);
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setConfirmPwd('');
    setConfirmError(null);
  };

  // Security form state
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  const onSecurityChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    setSecurityError(null);
    setSecuritySuccess(null);
    const { currentPassword, newPassword, confirmPassword } = securityForm;
    if (!currentPassword) return setSecurityError('Enter current password');
    if (!newPassword || newPassword.length < 8) return setSecurityError('New password must be 8+ chars');
    if (newPassword !== confirmPassword) return setSecurityError('New password mismatch');

    setIsChangingPassword(true);
    try {
      console.log('[AccountSettings] changePassword -> dispatch', { hasCurrent: !!currentPassword, hasNew: !!newPassword });
      const result = await changePasswordAction({ currentPassword, newPassword });
      console.log('[AccountSettings] changePassword result', !!result ? { type: (result as any).type, meta: (result as any).meta } : result);
      console.log('[AccountSettings] changePassword success');
      setSecuritySuccess('Password changed successfully');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      console.error('[AccountSettings] changePassword error', e);
      setSecurityError(e?.response?.data?.message || e?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentAvatarSrc =
    avatarPreview ||
    (typeof user?.user?.avatar === 'string'
      ? user.user.avatar
      : (user?.user?.avatar as any)?.url) ||
    undefined;

  const originalName = user?.user?.name || '';
  const hasChanges = profileForm.name.trim() !== originalName || !!selectedAvatar;

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground mt-1">
                Update your personal information and profile picture
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <AvatarWithFallback
                size="2xl"
                className="ring-4 ring-background shadow-lg"
                src={currentAvatarSrc}
                alt={user?.user?.name || 'User'}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <Typography variant="body-medium" className="font-medium mb-2">Profile Picture</Typography>
                <Typography variant="body-small" className="text-muted-foreground mb-4">
                  Upload a new profile picture. Supported formats: JPG, PNG, WEBP (max 2MB)
                </Typography>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleChooseAvatar}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Change Avatar
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={onAvatarFileChange}
                />
              </div>
              {selectedAvatar && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  New avatar selected
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Typography variant="body-medium" className="font-medium">Full Name</Typography>
              <Input
                value={profileForm.name}
                onChange={(e) => onProfileChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Typography variant="body-medium" className="font-medium">Email Address</Typography>
              <Input
                type="email"
                value={profileForm.email}
                placeholder="your.email@example.com"
                disabled
                className="h-11 bg-muted/50"
              />
              <Typography variant="caption" className="text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </Typography>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved changes
                </Badge>
              )}
            </div>
            <Button 
              onClick={onSaveProfile} 
              disabled={isSavingProfile || !hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-destructive/5 to-warning/5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Security Settings</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground mt-1">
                Update your password and security preferences
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current password */}
            <div className="space-y-2">
              <Typography variant="body-medium" className="font-medium">Current Password</Typography>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={securityForm.currentPassword}
                  onChange={(e) => onSecurityChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Typography variant="body-medium" className="font-medium">New Password</Typography>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={securityForm.newPassword}
                  onChange={(e) => onSecurityChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Typography variant="body-medium" className="font-medium">Confirm New Password</Typography>
            <div className="relative max-w-md">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={securityForm.confirmPassword}
                onChange={(e) => onSecurityChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {securityError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <Typography variant="body-small" className="text-destructive">{securityError}</Typography>
            </div>
          )}
          {securitySuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <Typography variant="body-small" className="text-emerald-600">{securitySuccess}</Typography>
            </div>
          )}

          {/* Change Password Button */}
          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="gap-2"
          >
            <Key className="h-4 w-4" />
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Password confirmation popup */}
      <Modal isOpen={showConfirm} onClose={cancelConfirm} size="md" title="Confirm your password">
        <ModalBody>
          <div className="space-y-4">
            <Typography variant="body" className="text-muted-foreground">
              Please enter your current password to confirm the changes to your profile.
            </Typography>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Current password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide current password' : 'Show current password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <Typography variant="body-small" className="text-destructive">{confirmError}</Typography>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={cancelConfirm} disabled={isSavingProfile}>
            Cancel
          </Button>
          <Button onClick={confirmAndSave} disabled={isSavingProfile} className="gap-2">
            <Save className="h-4 w-4" />
            {isSavingProfile ? 'Saving...' : 'Confirm & Save'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AccountSettings;
