import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

export interface BoardCardProps {
  board: any;
  onPress?: () => void;
  style?: any;
}

export default function BoardCard({ board, onPress, style }: BoardCardProps) {
  const colors = useThemeColors();
  const themeColor = board?.theme?.color || colors.primary;
  const bgImage = board?.theme?.background?.url;
  const boardType = board?.type || 'kanban';
  
  const getBoardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'kanban': return 'columns';
      case 'scrum': return 'tasks';
      case 'gantt': return 'calendar';
      case 'timeline': return 'clock-o';
      default: return 'th-large';
    }
  };

  const getBoardTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'kanban': return 'Kanban Board';
      case 'scrum': return 'Scrum Board';
      case 'gantt': return 'Gantt Chart';
      case 'timeline': return 'Timeline';
      default: return 'Board';
    }
  };

  const formatCreatedDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      } else {
        const years = Math.floor(diffInDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
      <Card style={[styles.boardTile, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        {/* Enhanced Gradient Header */}
        <LinearGradient
          colors={[themeColor, themeColor + 'DD', themeColor + 'AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tileHeader}
        >
          <RNView style={styles.headerContent}>
            <RNView style={styles.iconContainer}>
              <FontAwesome
                name={getBoardIcon(boardType)}
                size={24}
                color="white"
              />
            </RNView>
            {!!bgImage && <RNView style={styles.headerOverlay} />}
          </RNView>
        </LinearGradient>

        {/* Enhanced Content */}
        <RNView style={styles.contentContainer}>
          <Text style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '700' }]} numberOfLines={2}>
            {board?.name || 'Untitled Board'}
          </Text>

          {/* Enhanced Meta Section */}
          <RNView style={[styles.tileMeta, { borderTopColor: colors.border + '40' }]}> 
            <RNView style={[styles.typeChip, { backgroundColor: themeColor + '15' }]}>
              <FontAwesome
                name={getBoardIcon(boardType)}
                size={12}
                color={themeColor}
                style={{ marginRight: 4 }}
              />
              <Text style={[TextStyles.caption.small, { color: themeColor, fontWeight: '600' }]}>
                {getBoardTypeLabel(boardType)}
              </Text>
            </RNView>
            
            {board?.taskCount !== undefined && (
              <RNView style={[styles.taskChip, { backgroundColor: colors.muted + '30' }]}>
                <Text style={[TextStyles.caption.small, { color: colors.mutedForeground, fontWeight: '500' }]}>
                  📋 {board.taskCount} tasks
                </Text>
              </RNView>
            )}
            
            {board?.createdAt && (
              <RNView style={[styles.timeChip, { backgroundColor: colors.muted + '30' }]}>
                <FontAwesome
                  name="clock-o"
                  size={10}
                  color={colors.mutedForeground}
                  style={{ marginRight: 4 }}
                />
                <Text style={[TextStyles.caption.small, { color: colors.mutedForeground, fontWeight: '500' }]}>
                  {formatCreatedDate(board.createdAt)}
                </Text>
              </RNView>
            )}
          </RNView>
        </RNView>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boardTile: { 
    borderWidth: StyleSheet.hairlineWidth, 
    borderRadius: 20, 
    padding: 16,
    overflow: 'hidden',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  tileHeader: { 
    height: 70, 
    borderRadius: 16, 
    marginBottom: 12,
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    borderRadius: 16, 
    opacity: 0.15 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tileMeta: { 
    borderTopWidth: 1, 
    marginTop: 12, 
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  taskChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 24,
    justifyContent: 'center',
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
