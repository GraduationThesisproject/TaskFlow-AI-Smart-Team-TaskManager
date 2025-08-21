import React, { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Users,
  CreditCard,
  Trash2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Typography,
  Input,
  Switch,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge
} from "@taskflow/ui";
import { DashboardShell } from "./DashboardShell";
import { useAppSelector, useAppDispatch } from "../../store";
import { updateUser } from "../../store/slices/authSlice";
import { usePermissions } from "../../hooks";

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { permissions } = usePermissions();

  // Form state
  const [formData, setFormData] = useState({
    name: user?.user?.name || '',
    email: user?.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
    smsNotifications: user?.preferences?.notifications?.sms ?? false,
    weeklySummary: true,
    marketingEmails: user?.preferences?.notifications?.marketing ?? false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update user basic info
      if (user) {
        dispatch(updateUser({
          user: {
            ...user.user,
            name: formData.name,
            email: formData.email
          }
        }));
      }
      // Show success message
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Update user preferences
      if (user) {
        dispatch(updateUser({
          preferences: {
            ...user.preferences,
            notifications: {
              email: settings.emailNotifications,
              push: settings.pushNotifications,
              sms: settings.smsNotifications,
              marketing: settings.marketingEmails
            }
          }
        }));
      }
      // Show success message
      console.log('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete account logic
    }
  };

  return (
    <DashboardShell title="Settings">
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar size="xl">
                <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
                <AvatarFallback variant="primary" size="xl">
                  {user?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
                <Typography variant="caption" className="text-muted-foreground block mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </Typography>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Typography variant="body-medium" className="font-medium">
                  Email Notifications
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Receive notifications via email
                </Typography>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Typography variant="body-medium" className="font-medium">
                  Push Notifications
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Get instant updates on your device
                </Typography>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Typography variant="body-medium" className="font-medium">
                  SMS Notifications
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Receive notifications via SMS
                </Typography>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Typography variant="body-medium" className="font-medium">
                  Weekly Summary
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Weekly progress reports
                </Typography>
              </div>
              <Switch
                checked={settings.weeklySummary}
                onChange={(e) => handleSettingChange('weeklySummary', e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Typography variant="body-medium" className="font-medium">
                  Marketing Emails
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Receive updates about new features
                </Typography>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
              />
            </div>

            <Button onClick={handleSaveSettings} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Typography variant="body-medium" className="font-medium mb-2">
                Theme
              </Typography>
              <Typography variant="caption" className="text-muted-foreground mb-3 block">
                Choose your preferred theme
              </Typography>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Light
                </Button>
                <Button variant="outline" size="sm">
                  Dark
                </Button>
                <Button variant="outline" size="sm">
                  System
                </Button>
              </div>
            </div>

            <div>
              <Typography variant="body-medium" className="font-medium mb-2">
                Accent Color
              </Typography>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
                <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
                <div className="w-8 h-8 rounded-full bg-orange-500 cursor-pointer border-2 border-transparent hover:border-border"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button variant="outline">
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Account Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar size="sm">
                  <AvatarImage src={user?.user?.avatar} alt={user?.user?.name} />
                  <AvatarFallback variant="primary" size="sm">
                    {user?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Typography variant="body-medium" className="font-medium">
                    {user?.user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {user?.user?.email}
                  </Typography>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span>{user?.user?.createdAt ? new Date(user.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last login</span>
                  <span>{user?.user?.lastLogin ? new Date(user.user.lastLogin).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Subscription</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2">
                  Free Plan
                </Badge>
                <Typography variant="body-medium" className="font-medium">
                  Current Plan
                </Typography>
                <Typography variant="caption" className="text-muted-foreground">
                  Basic features included
                </Typography>
              </div>
              <Button className="w-full">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <CardTitle>Team Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Workspaces</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Members</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Projects</span>
                  <span>8</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Manage Team
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Typography variant="body-medium" className="mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default Settings;
