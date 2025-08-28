import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Typography, Switch, Button } from '@taskflow/ui';
import { Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updatePreferences } from '../../../store/slices/authSlice';

export interface NotificationSettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
  marketingEmails: boolean;
}

const NotificationSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsState>({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
    weeklySummary: true,
    marketingEmails: user?.preferences?.notifications?.marketing ?? false,
  });

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

        // Persist to backend preferences (authService -> /auth/preferences)
        await dispatch(
          updatePreferences({
            section: 'notifications',
            updates: {
              email: emailUpdates,
              push: pushUpdates,
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
