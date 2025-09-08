import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAppSelector } from '@/store';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const AccountSummary: React.FC = () => {
  const colors = useThemeColors();
  const { user } = useAppSelector((s) => s.auth);

  const getMemberSince = () => {
    if (!user?.user?.createdAt) return 'N/A';
    const date = new Date(user.user.createdAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getLastLogin = () => {
    if (!user?.user?.lastLogin) return 'N/A';
    const date = new Date(user.user.lastLogin);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAccountStatus = () => {
    if (!user?.user?.lastLogin) return { status: 'inactive', label: 'Inactive', color: colors.muted };
    
    const lastLogin = new Date(user.user.lastLogin);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 1) return { status: 'active', label: 'Active', color: colors.success };
    if (diffInDays <= 7) return { status: 'recent', label: 'Recent', color: colors.accent };
    if (diffInDays <= 30) return { status: 'moderate', label: 'Moderate', color: colors.warning };
    return { status: 'inactive', label: 'Inactive', color: colors.muted };
  };

  const accountStatus = getAccountStatus();

  return (
    <Card style={styles.container}>
      <View style={styles.sectionHeader}>
        <FontAwesome name="user" size={20} color={colors.primary} />
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
          Account Overview
        </Text>
      </View>
      
      <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
        Your account information and activity
      </Text>

      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <FontAwesome name="user" size={24} color={colors['primary-foreground']} />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.profileHeader}>
            <Text style={[TextStyles.body.large, { color: colors.foreground, fontWeight: '600' }]}>
              {user?.user?.name || 'User'}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: accountStatus.color }]} />
          </View>
          <View style={styles.emailRow}>
            <FontAwesome name="envelope" size={12} color={colors['muted-foreground']} />
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              {user?.user?.email}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.muted }]}>
            <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>
              {accountStatus.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Stats */}
      <View style={styles.statsSection}>
        <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
            <FontAwesome name="calendar" size={16} color={colors.accent} />
          </View>
          <View style={styles.statContent}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Member since
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
              {getMemberSince()}
            </Text>
          </View>
        </View>

        <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
            <FontAwesome name="clock-o" size={16} color={colors.success} />
          </View>
          <View style={styles.statContent}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Last login
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
              {getLastLogin()}
            </Text>
          </View>
        </View>

        <View style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
            <FontAwesome name="shield" size={16} color={colors.warning} />
          </View>
          <View style={styles.statContent}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Account status
            </Text>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '500' }]}>
              {accountStatus.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 12 }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.card }]}>
            <FontAwesome name="history" size={16} color={colors.foreground} />
            <Text style={[TextStyles.body.small, { color: colors.foreground, fontWeight: '500' }]}>
              View Activity Log
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionItem, { backgroundColor: colors.card }]}>
            <FontAwesome name="download" size={16} color={colors.foreground} />
            <Text style={[TextStyles.body.small, { color: colors.foreground, fontWeight: '500' }]}>
              Download Data
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsSection: {
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  quickActionsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quickActions: {
    gap: 8,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
});

export default AccountSummary;
