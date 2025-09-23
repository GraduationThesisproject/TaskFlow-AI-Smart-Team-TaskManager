import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { Card } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';
import { useAuth } from '@/hooks/useAuth';

export type SpaceHeaderProps = {
  space: any;
  onCreateBoard?: () => void;
  onSettings?: () => void;
  onMembers?: () => void;
  onBackToWorkspace?: () => void;
  onGoBoards?: () => void;
  boardCount?: number; // optional override for board count
  membersCount?: number; // optional override for members count
  tasksCount?: number; // optional override for tasks count across boards
};

const getProgressPercentage = (completed: number, total: number) => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

function SpaceHeaderComp({ space, onCreateBoard, onSettings, onMembers, onBackToWorkspace, onGoBoards, boardCount: boardCountProp, membersCount: membersCountProp, tasksCount: tasksCountProp }: SpaceHeaderProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();
  const { showModal, hideAlert } = useMobileAlert();
  const handleGoBoards = useCallback(() => {
    // Premium gate: All Boards accessible only for premium
    const plan = String(user?.subscription?.plan || '').toLowerCase();
    const isPremium = plan === 'premium' || plan === 'enterprise';
    if (!isPremium) {
      // Ensure modal can be shown repeatedly by hiding any previous instance first
      hideAlert();
      setTimeout(() => {
        showModal('Premium Feature', 'Viewing all boards is a Premium feature. Upgrade to unlock.');
      }, 0);
      return;
    }
    if (typeof onGoBoards === 'function') {
      return onGoBoards();
    }
    router.push('/(tabs)/space/allboards');
  }, [onGoBoards, router, user?.subscription?.plan, showModal, hideAlert]);
  const isWide = width >= 768; // tablet/landscape breakpoint to show right sidebar
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const isSmall = width < 360;
  // Ensure stats area is NOT clickable; always use View
  const InfoWrapper: any = View;
  

  if (!space) {
    return (
      <View style={{ padding: 16, backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }}>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>Loading space...</Text>
      </View>
    );
  }

  const bgTint = `${space.color || '#3B82F6'}20`;
  const members = Array.isArray(space.members) ? space.members.filter((m: any) => !!m && !!m.name) : [];

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: 28 + topInset, paddingBottom: 16 }]}>
      <View style={styles.headerLeft}>
        {!!onBackToWorkspace && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.background }]}
            onPress={onBackToWorkspace}
            accessibilityRole="button"
            accessibilityLabel="Back to workspace"
          >
            <FontAwesome name="arrow-left" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        <InfoWrapper style={styles.spaceInfo}>
        {/* Title: show only on tablets/desktops to avoid camera overlap on phones */}
        {isWide && (
          <Text
            style={[TextStyles.heading.h2, { color: colors.foreground, fontSize: isSmall ? 18 : undefined }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {space.name || 'Untitled Space'}
          </Text>
        )}

          {isWide && !!space.description && (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 2 }]} numberOfLines={1}>
              {space.description}
            </Text>
          )}
          <View style={styles.spaceStats}>
            <View style={[styles.statBadge, { backgroundColor: colors.background }]}>
              <FontAwesome name="users" size={12} color={colors.primary} />
              <Text style={[TextStyles.caption.small, { color: colors.foreground, marginLeft: 4, fontWeight: '500' }]}>
                {membersCount}
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: colors.background }]}>
              <FontAwesome name="th-large" size={12} color={colors.primary} />
              <Text style={[TextStyles.caption.small, { color: colors.foreground, marginLeft: 4, fontWeight: '500' }]}>
                {boardCount}
              </Text>
            </View>

            {/* Right sidebar */}
            <View style={{ width: 300, paddingLeft: 12 }}>
              {/* Actions */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
                <TouchableOpacity onPress={onSettings} style={[styles.ghostBtn, { borderColor: colors.border }]}> 
                  <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>⚙️ Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onMembers} style={[styles.ghostBtn, { borderColor: colors.border }]}> 
                  <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>👥 Members</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCreateBoard} style={[styles.primaryBtn, { backgroundColor: colors.primary }]}> 
                  <Text style={{ color: colors['primary-foreground'], fontWeight: '600' }}>➕ New Board</Text>
                </TouchableOpacity>
              </View>
            )}
            {taskCount > 0 && (
              <View style={[styles.statBadge, { backgroundColor: colors.background }]}>
                <FontAwesome name="check-circle" size={12} color={colors.primary} />
                <Text style={[TextStyles.caption.small, { color: colors.foreground, marginLeft: 4, fontWeight: '500' }]}>
                  {progress}%
                </Text>
              </View>
            )}
          </View>

          {/* Removed compact sub-navigation to keep single-line header */}
        </InfoWrapper>
      </View>
      
        <View style={styles.headerRight}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleGoBoards}
              style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              accessibilityLabel="Boards"
            >
              <FontAwesome name="th-large" size={16} color={colors.foreground} />
            </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSettings} 
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            accessibilityLabel="Space settings"
          > 
            <FontAwesome name="cog" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onMembers} 
            style={[styles.actionButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            accessibilityLabel="Manage members"
          > 
            <FontAwesome name="users" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onCreateBoard} 
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            accessibilityLabel="Create new board"
          > 
            <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default memo(SpaceHeaderComp);

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBox: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ghostBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  backIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { flexBasis: '48%', padding: 12, borderRadius: 12 },
  iconSmall: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
});