import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native';
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
                size={22}
                color="white"
              />
            </RNView>
            {!!bgImage && <RNView pointerEvents="none" style={styles.headerOverlay} />}
            {!!onToggleArchive && (
              <TouchableOpacity
                onPress={(e: any) => {
                  // Prevent parent TouchableOpacity from firing
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                  onToggleArchive(board);
                }}
                style={[styles.headerActionBtn, { backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.35)' }]}
                accessibilityLabel={isArchived ? 'Restore board' : 'Archive board'}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <FontAwesome name={isArchived ? 'undo' : 'archive'} size={12} color="#fff" />
              </TouchableOpacity>
            )}
          </RNView>
        </LinearGradient>

        {/* Enhanced Content */}
        <RNView style={styles.contentContainer}>
          {/* Title row with status */}
          <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '700' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {(board?.name ? String(board.name) : 'Untitled Board').slice(0, 5)}{(board?.name && String(board.name).length > 5) ? '…' : ''}
            </Text>
            <RNView style={[styles.statusChipInline, { backgroundColor: (isArchived ? colors.warning : colors.success) + '15' }]}> 
              <FontAwesome
                name={isArchived ? 'archive' : 'check'}
                size={10}
                color={isArchived ? colors.warning : colors.success}
                style={{ marginRight: 4 }}
              />
              <Text style={[TextStyles.caption.small, { color: isArchived ? colors.warning : colors.success, fontWeight: '600' }]}> 
                {isArchived ? 'Archived' : 'Active'}
              </Text>
            </RNView>
          </RNView>

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
            
            {typeof board?.taskCount === 'number' && (
              <RNView style={[styles.taskChip, { backgroundColor: colors.muted + '30' }]}>
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], fontWeight: '500' }]}>
                  📋 {board.taskCount} tasks
                </Text>
              </RNView>
            )}
            
            {board?.createdAt && (
              <RNView style={[styles.timeChip, { backgroundColor: colors.muted + '30' }]}>
                <FontAwesome
                  name="clock-o"
                  size={10}
                  color={colors['muted-foreground']}
                  style={{ marginRight: 4 }}
                />
                <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], fontWeight: '500' }]}>
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  headerActionBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
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
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChipInline: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
