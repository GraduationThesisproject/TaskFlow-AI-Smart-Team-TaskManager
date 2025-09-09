import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { Card } from '@/components/Themed';

export type SpaceHeaderProps = {
  space: any;
  onCreateBoard?: () => void;
  onSettings?: () => void;
  onMembers?: () => void;
};

const getProgressPercentage = (completed: number, total: number) => {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

export default function SpaceHeader({ space, onCreateBoard, onSettings, onMembers }: SpaceHeaderProps) {
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
    <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        {isWide ? (
          // Two-column layout: left content + right sidebar
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Left content */}
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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

              {/* Stats in sidebar */}
              <View style={{ gap: 8 }}>
                <Card style={[styles.statCard, { backgroundColor: colors.card, flexBasis: '100%' }]}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Boards</Text>
                      <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{space.totalBoards || space?.stats?.totalBoards || 0}</Text>
                    </View>
                    <View style={[styles.iconSmall, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={{ color: '#2563EB' }}>▥</Text>
                    </View>
                  </View>
                </Card>
                <Card style={[styles.statCard, { backgroundColor: colors.card, flexBasis: '100%' }]}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
                      <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{space.totalTasks || 0}</Text>
                    </View>
                    <View style={[styles.iconSmall, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={{ color: '#16A34A' }}>📊</Text>
                    </View>
                  </View>
                </Card>
                <Card style={[styles.statCard, { backgroundColor: colors.card, flexBasis: '100%' }]}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completed</Text>
                      <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{space.completedTasks || 0}</Text>
                    </View>
                    <View style={[styles.iconSmall, { backgroundColor: '#EDE9FE' }]}>
                      <Text style={{ color: '#7C3AED' }}>📅</Text>
                    </View>
                  </View>
                </Card>
                <Card style={[styles.statCard, { backgroundColor: colors.card, flexBasis: '100%' }]}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Progress</Text>
                      <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                        {getProgressPercentage(space.completedTasks || 0, space.totalTasks || 0)}%
                      </Text>
                    </View>
                    <View style={[styles.iconSmall, { backgroundColor: '#FFEDD5' }]}>
                      <Text style={{ color: '#EA580C' }}>📈</Text>
                    </View>
                  </View>
                </Card>

                {/* Members in sidebar */}
                {!!members.length && (
                  <View style={{ marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Team Members</Text>
                      <TouchableOpacity onPress={onMembers}>
                        <Text style={[TextStyles.caption.small, { color: colors.primary }]}>View All</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {members.slice(0, 5).map((m: any) => {
                        const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                        const name: string = m?.name || m?.user?.name || 'User';
                        const letter = String(name).charAt(0).toUpperCase();
                        return (
                          <View key={m.id || m._id} style={{ marginLeft: -8 }}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                              <View style={[styles.avatar, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }]}>
                                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                      {members.length > 5 && (
                        <View style={[styles.avatar, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }]}> 
                          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>+{members.length - 5}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          // Mobile stacked layout (existing)
          <>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
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

              <View style={{ flexDirection: 'row', gap: 8 }}>
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
            </View>

            {/* Stats */}
            <View style={[styles.grid, { marginTop: 12 }]}> 
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Boards</Text>
                    <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{space.totalBoards || space?.stats?.totalBoards || 0}</Text>
                  </View>
                  <View style={[styles.iconSmall, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={{ color: '#2563EB' }}>▥</Text>
                  </View>
                </View>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Total Tasks</Text>
                    <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{space.totalTasks || 0}</Text>
                  </View>
                  <View style={[styles.iconSmall, { backgroundColor: '#DCFCE7' }]}>
                    <Text style={{ color: '#16A34A' }}>📊</Text>
                  </View>
                </View>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Completed</Text>
                    <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>{space.completedTasks || 0}</Text>
                  </View>
                  <View style={[styles.iconSmall, { backgroundColor: '#EDE9FE' }]}>
                    <Text style={{ color: '#7C3AED' }}>📅</Text>
                  </View>
                </View>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Progress</Text>
                    <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
                      {getProgressPercentage(space.completedTasks || 0, space.totalTasks || 0)}%
                    </Text>
                  </View>
                  <View style={[styles.iconSmall, { backgroundColor: '#FFEDD5' }]}>
                    <Text style={{ color: '#EA580C' }}>📈</Text>
                  </View>
                </View>
              </Card>
            </View>

            {/* Members */}
            {!!members.length && (
              <View style={[styles.rowBetween, { marginTop: 12 }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Team Members:</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {members.slice(0, 5).map((m: any) => {
                      const avatarUrl = m?.avatar || m?.profile?.avatar || m?.user?.avatar;
                      const name: string = m?.name || m?.user?.name || 'User';
                      const letter = String(name).charAt(0).toUpperCase();
                      return (
                        <View key={m.id || m._id}
                          style={{ marginLeft: -8 }}
                        >
                          {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                          ) : (
                            <View style={[styles.avatar, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }]}>
                              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>{letter}</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                    {members.length > 5 && (
                      <View style={[styles.avatar, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }]}> 
                        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>+{members.length - 5}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={onMembers}>
                  <Text style={[TextStyles.caption.small, { color: colors.primary }]}>View All Members</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBox: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ghostBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  primaryBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { flexBasis: '48%', padding: 12, borderRadius: 12 },
  iconSmall: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
});