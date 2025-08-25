import React, { useState, useRef } from 'react';
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
  Avatar
} from '@taskflow/ui';
import { 
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon,
  CameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '../store';
import { updateAdminProfileAsync, uploadAdminAvatar } from '../store/slices/adminSlice';
import { ConfirmationDialog } from '../components/common';

const ProfileLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentAdmin, isLoading, error } = useAppSelector(state => state.admin);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentAdmin?.name || '',
    email: currentAdmin?.email || '',
    role: currentAdmin?.role || '',
    bio: 'No bio available',
    location: 'Not specified',
    phone: 'Not specified'
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarRemoveConfirm, setShowAvatarRemoveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('handleAvatarChange: file selected:', file);
    if (file) {
      console.log('handleAvatarChange: file details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('handleAvatarChange: no file selected');
    }
  };

  const handleAvatarUpload = async () => {
    console.log('handleAvatarUpload: called with avatarFile:', avatarFile);
    if (!avatarFile) {
      console.log('handleAvatarUpload: no avatar file, returning early');
      return;
    }
    
    try {
      console.log('handleAvatarUpload: dispatching uploadAdminAvatar with file:', avatarFile.name);
      await dispatch(uploadAdminAvatar(avatarFile)).unwrap();
      console.log('handleAvatarUpload: upload successful');
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAvatarRemoveConfirm(false);
  };

  const handleSave = async () => {
    try {
      // Update profile data
      await dispatch(updateAdminProfileAsync({
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        phone: profileData.phone,
      })).unwrap();
      
      // Upload avatar if selected
      if (avatarFile) {
        await handleAvatarUpload();
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: currentAdmin?.name || '',
      email: currentAdmin?.email || '',
      role: currentAdmin?.role || '',
      bio: 'No bio available',
      location: 'Not specified',
      phone: 'Not specified'
    });
    setIsEditing(false);
  };

  // Update profileData when currentAdmin changes
  React.useEffect(() => {
    if (currentAdmin) {
      setProfileData({
        name: currentAdmin.name || '',
        email: currentAdmin.email || '',
        role: currentAdmin.role || '',
        bio: currentAdmin.bio || 'No bio available',
        location: currentAdmin.location || 'Not specified',
        phone: currentAdmin.phone || 'Not specified'
      });
    }
  }, [currentAdmin]);

  return (
    <Container size="7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="heading-large" className="text-foreground mb-2">
              Admin Profile
            </Typography>
            <Typography variant="body-medium" className="text-muted-foreground">
              Manage your personal information and account details
            </Typography>
          </div>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4 relative">
                <Avatar size="xl" className="bg-primary text-primary-foreground">
                  {currentAdmin?.avatar ? (
                    <img 
                      src={`${currentAdmin.avatar}?v=${encodeURIComponent(currentAdmin.avatar)}`} 
                      alt={currentAdmin?.name || 'Admin'} 
                      className="w-full h-full object-cover rounded-full"
                      key={currentAdmin.avatar} // Force re-render when avatar changes
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  )}
                </Avatar>
                
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-8 h-8 p-0 rounded-full bg-background border-2 border-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CameraIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              {avatarPreview && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                      onClick={() => setShowAvatarRemoveConfirm(true)}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <Typography variant="body-small" className="text-muted-foreground mt-2">
                    New avatar preview
                  </Typography>
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Uploading...' : 'Upload Avatar Now'}
                    </Button>
                  </div>
                </div>
              )}
              
              <CardTitle className="text-xl">{currentAdmin?.name || 'Admin User'}</CardTitle>
              <Typography variant="body-medium" className="text-muted-foreground">
                {currentAdmin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
              </Typography>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-muted-foreground" />
                <Typography variant="body-medium">{currentAdmin?.email || 'No email'}</Typography>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
                <Typography variant="body-medium">
                  {currentAdmin?.role === 'super_admin' ? 'Full System Access' : 'Administrative Access'}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Grid cols={2} className="gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">Location</label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your location"
                  />
                </div>
              </Grid>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px] resize-none"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Typography variant="body-small" className="text-red-600 dark:text-red-400">
                    {error}
                  </Typography>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Typography variant="body-medium" className="font-medium">Two-Factor Authentication</Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Add an extra layer of security to your account
                  </Typography>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Typography variant="body-medium" className="font-medium">Login Sessions</Typography>
                  <Typography variant="body-small" className="text-muted-foreground">
                    Manage your active login sessions
                  </Typography>
                </div>
                <Button variant="outline" size="sm">
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Removal Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showAvatarRemoveConfirm}
        onClose={() => setShowAvatarRemoveConfirm(false)}
        onConfirm={handleRemoveAvatar}
        title="Remove Avatar Preview"
        description="Are you sure you want to remove the selected avatar? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep"
        type="warning"
        confirmButtonVariant="destructive"
      />
    </Container>
  );
};

export default ProfileLayout;
