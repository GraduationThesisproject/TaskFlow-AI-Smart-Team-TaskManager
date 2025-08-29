import React, { useState, useRef, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Typography, Input,
  Avatar, AvatarImage, AvatarFallback,
  Modal, ModalHeader, ModalBody, ModalFooter
} from '@taskflow/ui';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const AccountSettings: React.FC = () => {
  const { user, updateProfileSecure: updateProfileSecureAction, changePassword: changePasswordAction } = useAuth();

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

  // Before
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
    if (!allowed.includes(file.type)) return alert('Only JPG, PNG, or WEBP allowed');
    if (file.size > 2 * 1024 * 1024) return alert('Max 2MB');

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
    // Only open confirmation if there are changes
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
        avatar: selectedAvatar || undefined, // 
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
    <Card>
      <CardHeader><CardTitle>Account</CardTitle></CardHeader>
      <CardContent className="space-y-8">
        {/* Profile */}
        <section>
          <Typography variant="body-medium">Profile</Typography>
          <div className="flex items-center gap-4 my-4">
            <Avatar size="xl">
              {(avatarPreview || user?.user?.avatar) && (
                <AvatarImage src={currentAvatarSrc} alt={user?.user?.name || 'User'} />
              )}
              <AvatarFallback>{user?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" onClick={handleChooseAvatar}>Change Avatar</Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onAvatarFileChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={profileForm.name}
              onChange={(e) => onProfileChange('name', e.target.value)}
              placeholder="Full Name"
            />
            <Input
              type="email"
              value={profileForm.email}
              placeholder="Email"
              disabled
            />
          </div>
          <Button className="mt-4" onClick={onSaveProfile} disabled={isSavingProfile || !hasChanges}>
            Save Changes
          </Button>
        </section>

        {/* Security */}
        <section>
          <div className="flex items-center gap-2 my-4">
            <Shield className="h-5 w-5" /><Typography variant="body-medium">Security</Typography>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current password with toggle */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={securityForm.currentPassword}
                onChange={(e) => onSecurityChange('currentPassword', e.target.value)}
                placeholder="Current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide current password' : 'Show current password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* New password with toggle */}
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={securityForm.newPassword}
                onChange={(e) => onSecurityChange('newPassword', e.target.value)}
                placeholder="New password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password with toggle */}
          <div className="relative mt-2">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={securityForm.confirmPassword}
              onChange={(e) => onSecurityChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {securityError && <Typography variant="caption" className="text-red-500">{securityError}</Typography>}
          {securitySuccess && <Typography variant="caption" className="text-green-600">{securitySuccess}</Typography>}
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </section>
      </CardContent>

      {/* Password confirmation popup (themed) */}
      <Modal isOpen={showConfirm} onClose={cancelConfirm} size="md" title="Confirm your password">
        <ModalBody>
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
              className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide current password' : 'Show current password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmError && (
            <Typography variant="caption" className="text-red-500 mt-2">{confirmError}</Typography>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={cancelConfirm} disabled={isSavingProfile}>Cancel</Button>
          <Button onClick={confirmAndSave} disabled={isSavingProfile}>
            {isSavingProfile ? 'Saving...' : 'Confirm'}
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default AccountSettings;
