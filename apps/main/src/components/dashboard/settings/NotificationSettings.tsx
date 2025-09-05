import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, Switch, Button, Badge, Separator } from '@taskflow/ui';
import { Save, Bell, Mail, Smartphone, Clock, Calendar, Megaphone, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updatePreferences, updateUser } from '../../../store/slices/authSlice';
import {NotificationSettingsState} from "../../../types/dash.types"

const NotificationSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsState>({
    emailNotifications: (() => {
      const pref: any = user?.preferences?.notifications?.email;
      if (pref && typeof pref === 'object') {
        return Object.values(pref).some(Boolean);
      }
      return pref ?? true;
    })(),
    pushNotifications: (() => {
      const pref: any = user?.preferences?.notifications?.push;
      if (pref && typeof pref === 'object') {
        return Object.values(pref).some(Boolean);
      }
      return pref ?? true;
    })(),
    realTimeNotifications: (() => {
      const pref: any = user?.preferences?.notifications?.realTime;
      if (pref && typeof pref === 'object') {
        return Object.values(pref).some(Boolean);
      }
      return pref ?? true;
    })(),
    weeklySummary: (() => {
      const emailPref: any = user?.preferences?.notifications?.email;
      if (emailPref && typeof emailPref === 'object' && 'weeklyDigest' in emailPref) {
        return !!emailPref.weeklyDigest;
      }
      return true;
    })(),
    marketingEmails: user?.preferences?.notifications?.marketing ?? false,
  });

  // Keep local UI settings in sync when Redux user.preferences change
  React.useEffect(() => {
    setSettings({
      emailNotifications: (() => {
        const pref: any = user?.preferences?.notifications?.email;
        if (pref && typeof pref === 'object') return Object.values(pref).some(Boolean);
        return pref ?? true;
      })(),
      pushNotifications: (() => {
        const pref: any = user?.preferences?.notifications?.push;
        if (pref && typeof pref === 'object') return Object.values(pref).some(Boolean);
        return pref ?? true;
      })(),
      realTimeNotifications: (() => {
        const pref: any = user?.preferences?.notifications?.realTime;
        if (pref && typeof pref === 'object') return Object.values(pref).some(Boolean);
        return pref ?? true;
      })(),
      weeklySummary: (() => {
        const emailPref: any = user?.preferences?.notifications?.email;
        if (emailPref && typeof emailPref === 'object' && 'weeklyDigest' in emailPref) {
          return !!emailPref.weeklyDigest;
        }
        return true;
      })(),
      marketingEmails: user?.preferences?.notifications?.marketing ?? false,
    });
  }, [user?.preferences]);

  const onToggle = (key: keyof NotificationSettingsState, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const emailUpdates = {
          taskAssigned: settings.emailNotifications,
          taskCompleted: settings.emailNotifications,
          taskOverdue: settings.emailNotifications,
          commentAdded: settings.emailNotifications,
          mentionReceived: settings.emailNotifications,
          spaceUpdates: settings.emailNotifications,
          weeklyDigest: settings.weeklySummary,
        };

        const pushUpdates = {
          taskAssigned: settings.pushNotifications,
          taskCompleted: settings.pushNotifications,
          taskOverdue: settings.pushNotifications,
          commentAdded: settings.pushNotifications,
          mentionReceived: settings.pushNotifications,
          spaceUpdates: settings.pushNotifications,
        };

        const realTimeUpdates = {
          taskAssigned: settings.realTimeNotifications,
          taskCompleted: settings.realTimeNotifications,
          taskOverdue: settings.realTimeNotifications,
          commentAdded: settings.realTimeNotifications,
          mentionReceived: settings.realTimeNotifications,
          spaceUpdates: settings.realTimeNotifications,
          workspaceCreated: settings.realTimeNotifications,
          workspaceArchived: settings.realTimeNotifications,
          workspaceRestored: settings.realTimeNotifications,
          workspaceDeleted: settings.realTimeNotifications,
          templateCreated: settings.realTimeNotifications,
        };

        // Optimistic update so middleware reacts instantly
        const currentPrefs: any = user.preferences || {};
        const currentNotif: any = currentPrefs.notifications || {};
        dispatch(updateUser({
          preferences: {
            ...currentPrefs,
            notifications: {
              ...currentNotif,
              email: emailUpdates,
              push: pushUpdates,
              realTime: realTimeUpdates,
              marketing: settings.marketingEmails,
            },
          },
        } as any));

        // Persist to backend preferences
        await dispatch(
          updatePreferences({
            section: 'notifications',
            updates: {
              email: emailUpdates,
              push: pushUpdates,
              realTime: realTimeUpdates,
              marketing: settings.marketingEmails,
            },
          }) as any
        );
      }
      console.log('Settings updated successfully');
    } catch (e) {
      console.error('Failed to update settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const notificationOptions = [
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive important updates and summaries via email',
      icon: Mail,
      gradient: 'from-blue-500 to-cyan-500',
      category: 'Communication'
    },
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Get instant alerts on your device for real-time updates',
      icon: Smartphone,
      gradient: 'from-green-500 to-emerald-500',
      category: 'Communication'
    },
    {
      key: 'realTimeNotifications',
      title: 'Real-time Updates',
      description: 'Instant notifications for live collaboration and changes',
      icon: Clock,
      gradient: 'from-purple-500 to-pink-500',
      category: 'Communication'
    },
    {
      key: 'weeklySummary',
      title: 'Weekly Summary',
      description: 'Receive a comprehensive weekly progress report',
      icon: Calendar,
      gradient: 'from-orange-500 to-red-500',
      category: 'Reports'
    },
    {
      key: 'marketingEmails',
      title: 'Marketing Updates',
      description: 'Stay informed about new features and improvements',
      icon: Megaphone,
      gradient: 'from-indigo-500 to-purple-500',
      category: 'Updates'
    }
  ];

  const getActiveCount = () => {
    return Object.values(settings).filter(Boolean).length;
  };

  const getCategoryCount = (category: string) => {
    return notificationOptions.filter(opt => opt.category === category).length;
  };

  const getCategoryActiveCount = (category: string) => {
    return notificationOptions
      .filter(opt => opt.category === category)
      .filter(opt => settings[opt.key as keyof NotificationSettingsState]).length;
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold">{getActiveCount()}</Typography>
              <Typography variant="body-small" className="text-muted-foreground">Active Notifications</Typography>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold">{getCategoryActiveCount('Communication')}</Typography>
              <Typography variant="body-small" className="text-muted-foreground">Communication</Typography>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <Typography variant="h3" className="font-bold">{getCategoryActiveCount('Reports')}</Typography>
              <Typography variant="body-small" className="text-muted-foreground">Reports & Updates</Typography>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Settings Card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Notification Preferences</CardTitle>
              <Typography variant="body-small" className="text-muted-foreground mt-1">
                Customize how and when you receive notifications
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Communication Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Typography variant="body-medium" className="font-semibold">Communication</Typography>
              <Badge variant="secondary" className="text-xs">
                {getCategoryActiveCount('Communication')}/{getCategoryCount('Communication')}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {notificationOptions
                .filter(opt => opt.category === 'Communication')
                .map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.key}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        settings[item.key as keyof NotificationSettingsState]
                          ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/20'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="space-y-1">
                            <Typography variant="body-medium" className="font-medium">{item.title}</Typography>
                            <Typography variant="body-small" className="text-muted-foreground">{item.description}</Typography>
                          </div>
                        </div>
                        <Switch
                          checked={settings[item.key as keyof NotificationSettingsState]}
                          onCheckedChange={(checked) => onToggle(item.key as keyof NotificationSettingsState, checked)}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <Separator />

          {/* Reports Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Typography variant="body-medium" className="font-semibold">Reports & Updates</Typography>
              <Badge variant="secondary" className="text-xs">
                {getCategoryActiveCount('Reports') + getCategoryActiveCount('Updates')}/{getCategoryCount('Reports') + getCategoryCount('Updates')}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {notificationOptions
                .filter(opt => opt.category === 'Reports' || opt.category === 'Updates')
                .map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.key}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        settings[item.key as keyof NotificationSettingsState]
                          ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/20'
                          : 'border-border hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="space-y-1">
                            <Typography variant="body-medium" className="font-medium">{item.title}</Typography>
                            <Typography variant="body-small" className="text-muted-foreground">{item.description}</Typography>
                          </div>
                        </div>
                        <Switch
                          checked={settings[item.key as keyof NotificationSettingsState]}
                          onCheckedChange={(checked) => onToggle(item.key as keyof NotificationSettingsState, checked)}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <Typography variant="body-small" className="text-muted-foreground">
                Changes will be applied immediately
              </Typography>
            </div>
            <Button 
              onClick={onSave} 
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
