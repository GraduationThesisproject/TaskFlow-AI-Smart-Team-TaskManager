import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
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
};

const getProgressPercentage = (completed: number, total: number) => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

export default function SpaceHeader({ space, onCreateBoard, onSettings, onMembers, onBackToWorkspace }: SpaceHeaderProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // tablet/landscape breakpoint to show right sidebar

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
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        {!!onBackToWorkspace && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToWorkspace}
            accessibilityRole="button"
            accessibilityLabel="Back to workspace"
          >
            <FontAwesome name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <View style={[styles.iconBox, { backgroundColor: bgTint }]}>
          <Text style={{ fontSize: 22 }}>{space.icon || '🏠'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]} numberOfLines={1}>
            {space.name || 'Untitled Space'}
          </Text>
          {!!space.description && (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 2 }]} numberOfLines={2}>
              {space.description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.headerCenter}>
        {/* Stats for mobile */}
        {!isWide && (
          <View style={styles.mobileStats}>
            <View style={styles.statRow}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Boards: {space.totalBoards || space?.stats?.totalBoards || 0}</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Tasks: {space.totalTasks || 0}</Text>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Progress: {getProgressPercentage(space.completedTasks || 0, space.totalTasks || 0)}%</Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.headerRight}>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={onSettings} style={[styles.actionButton, { borderColor: colors.border }]}> 
            <FontAwesome name="cog" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMembers} style={[styles.actionButton, { borderColor: colors.border }]}> 
            <FontAwesome name="users" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onCreateBoard} style={[styles.primaryButton, { backgroundColor: colors.primary }]}> 
            <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});