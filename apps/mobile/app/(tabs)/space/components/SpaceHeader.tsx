import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { Card } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  const handleGoBoards = useCallback(() => {
    if (typeof onGoBoards === 'function') {
      return onGoBoards();
    }
    router.push('/(tabs)/space/allboards');
  }, [onGoBoards, router]);
  const isWide = width >= 768; // tablet/landscape breakpoint to show right sidebar
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;
  const isSmall = width < 360;
  // Ensure stats area is NOT clickable; always use View
  const InfoWrapper: any = View;
  

  if (!space) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.loadingContent}>
          <View style={[styles.loadingIcon, { backgroundColor: colors.muted }]} />
          <View style={styles.loadingText}>
            <View style={[styles.loadingLine, { backgroundColor: colors.muted, width: '60%' }]} />
            <View style={[styles.loadingLine, { backgroundColor: colors.muted, width: '40%', marginTop: 4 }]} />
          </View>
        </View>
      </View>
    );
  }

  const bgTint = `${space.color || '#3B82F6'}15`;
  const members = Array.isArray(space.members) ? space.members.filter((m: any) => !!m) : [];
  const membersCount =
    (typeof membersCountProp === 'number' ? membersCountProp : undefined) ??
    (Array.isArray(members) ? members.length : 0);
  const boardCount =
    (typeof boardCountProp === 'number' ? boardCountProp : undefined) ??
    (typeof space?.totalBoards === 'number' ? space.totalBoards : undefined) ??
    (typeof space?.stats?.totalBoards === 'number' ? space.stats.totalBoards : undefined) ??
    (Array.isArray((space as any)?.boards) ? (space as any).boards.length : 0);

  // Tasks count across all boards
  const tasksCount =
    (typeof tasksCountProp === 'number' ? tasksCountProp : undefined) ??
    (typeof (space as any)?.totalTasks === 'number' ? (space as any).totalTasks : undefined) ??
    (typeof space?.stats?.totalTasks === 'number' ? space.stats.totalTasks : undefined) ??
    (Array.isArray((space as any)?.boards)
      ? ((space as any).boards as any[]).reduce((sum, b) => sum + (Number((b as any)?.tasksCount || (b as any)?.totalTasks || 0) || 0), 0)
      : 0);
  const taskCount = space.totalTasks || 0;
  const progress = getProgressPercentage(space.completedTasks || 0, taskCount);

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
            {tasksCount > 0 && (
              <View style={[styles.statBadge, { backgroundColor: colors.background }]}> 
                <FontAwesome name="tasks" size={12} color={colors.primary} />
                <Text style={[TextStyles.caption.small, { color: colors.foreground, marginLeft: 4, fontWeight: '500' }]}> 
                  {tasksCount}
                </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 72,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  loadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  loadingText: {
    flex: 1,
  },
  loadingLine: {
    height: 12,
    borderRadius: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  spaceInfo: {
    flex: 1,
    gap: 8,
  },
  spaceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});