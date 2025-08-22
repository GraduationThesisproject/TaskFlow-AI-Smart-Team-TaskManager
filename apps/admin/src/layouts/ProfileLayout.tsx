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
  Avatar
} from '@taskflow/ui';
import { 
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../store';

const ProfileLayout: React.FC = () => {
  const { currentAdmin } = useAppSelector(state => state.admin);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentAdmin?.name || '',
    email: currentAdmin?.email || '',
    role: currentAdmin?.role || '',
    bio: 'No bio available',
    location: 'Not specified',
    phone: 'Not specified'
  });

  const handleSave = () => {
    // Here you would make an API call to update the profile
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // You could dispatch an action to update the profile in Redux
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
              <div className="flex justify-center mb-4">
                <Avatar size="xl" className="bg-primary text-primary-foreground">
                  <span className="text-2xl font-bold">
                    {currentAdmin?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </Avatar>
              </div>
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
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
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
    </Container>
  );
};

export default ProfileLayout;
