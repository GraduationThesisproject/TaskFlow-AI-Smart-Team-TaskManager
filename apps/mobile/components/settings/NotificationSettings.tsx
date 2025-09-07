import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector, useAppDispatch } from '@/store';
import { updatePreferences } from '@/store/slices/authSlice';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface NotificationSettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  realTimeNotifications: boolean;
  weeklySummary: boolean;
  marketingEmails: boolean;
}

const NotificationSettings: React.FC = () => {
  const colors = useThemeColors();
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
      icon: 'envelope',
      gradient: 'from-blue-500 to-cyan-500',
      category: 'Communication'
    },
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Get instant alerts on your device for real-time updates',
      icon: 'mobile',
      gradient: 'from-green-500 to-emerald-500',
      category: 'Communication'
    },
    {
      key: 'realTimeNotifications',
      title: 'Real-time Updates',
      description: 'Instant notifications for live collaboration and changes',
      icon: 'clock-o',
      gradient: 'from-purple-500 to-pink-500',
      category: 'Communication'
    },
    {
      key: 'weeklySummary',
      title: 'Weekly Summary',
      description: 'Receive a comprehensive weekly progress report',
      icon: 'calendar',
      gradient: 'from-orange-500 to-red-500',
      category: 'Reports'
    },
    {
      key: 'marketingEmails',
      title: 'Marketing Updates',
      description: 'Stay informed about new features and improvements',
      icon: 'megaphone',
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
    <ScrollView style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { backgroundColor: colors.primary + '20' }]}>
          <FontAwesome name="bell" size={20} color={colors.primary} />
          <Text style={[TextStyles.heading.h3, { color: colors.primary }]}>
            {getActiveCount()}
          </Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Active Notifications
          </Text>
        </Card>
        
        <Card style={[styles.statCard, { backgroundColor: colors.accent + '20' }]}>
          <FontAwesome name="envelope" size={20} color={colors.accent} />
          <Text style={[TextStyles.heading.h3, { color: colors.accent }]}>
            {getCategoryActiveCount('Communication')}
          </Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Communication
          </Text>
        </Card>
        
        <Card style={[styles.statCard, { backgroundColor: colors.warning + '20' }]}>
          <FontAwesome name="calendar" size={20} color={colors.warning} />
          <Text style={[TextStyles.heading.h3, { color: colors.warning }]}>
            {getCategoryActiveCount('Reports')}
          </Text>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            Reports & Updates
          </Text>
        </Card>
      </View>

      {/* Main Settings Card */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="bell" size={20} color={colors.primary} />
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Notification Preferences
          </Text>
        </View>
        
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
          Customize how and when you receive notifications
        </Text>

        {/* Communication Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
              Communication
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
              <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                {getCategoryActiveCount('Communication')}/{getCategoryCount('Communication')}
              </Text>
            </View>
          </View>
          
          {notificationOptions
            .filter(opt => opt.category === 'Communication')
            .map((item) => (
              <View
                key={item.key}
                style={[
                  styles.notificationOption,
                  {
                    backgroundColor: settings[item.key as keyof NotificationSettingsState] 
                      ? colors.primary + '10' 
                      : colors.card,
                    borderColor: settings[item.key as keyof NotificationSettingsState] 
                      ? colors.primary 
                      : colors.border,
                  }
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.notificationIcon, { backgroundColor: colors.primary }]}>
                    <FontAwesome name={item.icon as any} size={20} color={colors['primary-foreground']} />
                  </View>
                  <View style={styles.notificationText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
                      {item.title}
                    </Text>
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={settings[item.key as keyof NotificationSettingsState]}
                    onValueChange={(value) => onToggle(item.key as keyof NotificationSettingsState, value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>
            ))}
        </View>

        {/* Reports Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}>
              Reports & Updates
            </Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
              <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
                {getCategoryActiveCount('Reports') + getCategoryActiveCount('Updates')}/{getCategoryCount('Reports') + getCategoryCount('Updates')}
              </Text>
            </View>
          </View>
          
          {notificationOptions
            .filter(opt => opt.category === 'Reports' || opt.category === 'Updates')
            .map((item) => (
              <View
                key={item.key}
                style={[
                  styles.notificationOption,
                  {
                    backgroundColor: settings[item.key as keyof NotificationSettingsState] 
                      ? colors.primary + '10' 
                      : colors.card,
                    borderColor: settings[item.key as keyof NotificationSettingsState] 
                      ? colors.primary 
                      : colors.border,
                  }
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.notificationIcon, { backgroundColor: colors.accent }]}>
                    <FontAwesome name={item.icon as any} size={20} color={colors['primary-foreground']} />
                  </View>
                  <View style={styles.notificationText}>
                    <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
                      {item.title}
                    </Text>
                    <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                      {item.description}
                    </Text>
                  </View>
                  <Switch
                    value={settings[item.key as keyof NotificationSettingsState]}
                    onValueChange={(value) => onToggle(item.key as keyof NotificationSettingsState, value)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>
            ))}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { 
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.6 : 1
            }
          ]}
          onPress={onSave}
          disabled={isLoading}
        >
          <FontAwesome name="save" size={16} color={colors['primary-foreground']} />
          <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notificationOption: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    gap: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
});

export default NotificationSettings;
