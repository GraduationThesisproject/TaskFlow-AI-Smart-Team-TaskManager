import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, Switch, Button } from '@taskflow/ui';
import { Save } from 'lucide-react';
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
        // If backend returns object, toggle is on if any sub-flag is true
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

  // Keep local UI settings in sync when Redux user.preferences change (e.g., after saves or external updates)
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

        // Optimistic update so middleware reacts instantly (connect/disconnect without refresh)
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

        // Persist to backend preferences (authService -> /auth/preferences)
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

  return (
    <Card className="backdrop-blur-sm ring-1 ring-accent/10 border border-[hsl(var(--accent))]/20 shadow-[0_0_16px_hsl(var(--accent)/0.12)] hover:shadow-[0_0_28px_hsl(var(--accent)/0.18)] transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Notifications</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive notifications via email' },
          { key: 'pushNotifications', title: 'Push Notifications', desc: 'Get instant updates on your device' },
          { key: 'realTimeNotifications', title: 'Real Time Notifications', desc: 'Get instant updates on your device' },
          { key: 'weeklySummary', title: 'Weekly Summary', desc: 'Weekly progress reports' },
          { key: 'marketingEmails', title: 'Marketing Emails', desc: 'Receive updates about new features' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg ring-1 ring-accent/10 border-[hsl(var(--accent))]/20 shadow-[0_0_8px_hsl(var(--accent)/0.08)]">
            <div>
              <Typography variant="body-medium" className="font-medium">{item.title}</Typography>
              <Typography variant="caption" className="text-muted-foreground">{item.desc}</Typography>
            </div>
            <Switch
              checked={settings[item.key as keyof NotificationSettingsState]}
              onCheckedChange={(checked) => onToggle(item.key as keyof NotificationSettingsState, checked)}
            />
          </div>
        ))}
        <Button onClick={onSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
