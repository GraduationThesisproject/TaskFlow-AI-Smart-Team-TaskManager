import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Typography, Input, Avatar, AvatarImage, AvatarFallback } from '@taskflow/ui';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateProfileSecure } from '../../../store/slices/authSlice';

const AccountSettings: React.FC = () => {
  // Profile state
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [profileForm, setProfileForm] = useState({
    name: user?.user?.name || '',
    email: user?.user?.email || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar selection state
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

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedAvatar(null);
      setAvatarPreview(null);
      return;
    }

    // Client-side validation: type and size (<= 2MB)
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be 2MB or smaller.');
      return;
    }

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const buildFormData = (currentPassword?: string) => {
    const formData = new FormData();
    if (profileForm.name && profileForm.name !== user?.user?.name) {
      formData.append('name', profileForm.name);
    }
    if (selectedAvatar) {
      // Multer expects the field name 'file' (see upload.single('file') in backend)
      formData.append('file', selectedAvatar);
    }
    if (currentPassword) {
      formData.append('currentPassword', currentPassword);
    }
    return formData;
  };

  const onSaveProfile = async () => {
    // Open confirmation popup first
    setConfirmError(null);
    setConfirmPwd('');
    setShowConfirm(true);
  };

  const confirmAndSave = async () => {
    if (!confirmPwd || confirmPwd.length < 6) {
      setConfirmError('Please enter your current password.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = buildFormData(confirmPwd);
      await dispatch(updateProfileSecure(formData)).unwrap();
      setShowConfirm(false);
      setConfirmPwd('');
      console.log('Profile updated successfully', user);
    } catch (e) {
      console.error('Failed to update profile:', e);
      const msg = (e as any)?.response?.data?.message || 'Failed to update profile';
      setConfirmError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const cancelConfirm = () => {
    if (isSavingProfile) return;
    setShowConfirm(false);
    setConfirmPwd('');
    setConfirmError(null);
  };

  // Security state
  const [showPassword, setShowPassword] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const onSecurityChange = (
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    value: string
  ) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = () => {
    // TODO: wire password change API
    console.log('Change password clicked', securityForm);
  };

  const currentAvatarSrc = avatarPreview || (typeof user?.user?.avatar === 'string' ? user?.user?.avatar : (user as any)?.user?.avatar?.url) || undefined;

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.18)] transition-shadow">
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Profile Section */}
        <section>
          <div className="mb-4">
            <Typography variant="body-medium" className="font-medium">Profile</Typography>
            <Typography variant="caption" className="text-muted-foreground">Manage your personal information</Typography>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <Avatar size="xl">
              <AvatarImage src={currentAvatarSrc} alt={user?.user?.name} />
              <AvatarFallback variant="primary" size="xl">
                {user?.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
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
              <Typography variant="caption" className="text-muted-foreground block mt-1">
                JPG, PNG or WEBP. Max size 2MB.
              </Typography>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input value={profileForm.name} onChange={(e) => onProfileChange('name', e.target.value)} placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <Input type="email" value={profileForm.email} onChange={(e) => onProfileChange('email', e.target.value)} placeholder="Enter your email" disabled />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={onSaveProfile} disabled={isSavingProfile}>Save Changes</Button>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Security Section */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <Typography variant="body-medium" className="font-medium">Security</Typography>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={securityForm.currentPassword}
                  onChange={(e) => onSecurityChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
              <Input
                type="password"
                value={securityForm.newPassword}
                onChange={(e) => onSecurityChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
            <Input
              type="password"
              value={securityForm.confirmPassword}
              onChange={(e) => onSecurityChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
          </div>
        </section>
      </CardContent>

      {/* Password confirmation popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6">
            <Typography variant="body-medium" className="font-medium mb-2">Confirm your password</Typography>
            <Typography variant="caption" className="text-muted-foreground mb-4 block">
              For security reasons, please enter your current password to save changes.
            </Typography>
            <Input
              type="password"
              placeholder="Current password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
            {confirmError && (
              <Typography variant="caption" className="text-red-500 mt-2 block">{confirmError}</Typography>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={cancelConfirm} disabled={isSavingProfile}>Cancel</Button>
              <Button onClick={confirmAndSave} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AccountSettings;
