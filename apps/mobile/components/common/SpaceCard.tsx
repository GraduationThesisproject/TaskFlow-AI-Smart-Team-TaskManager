import React, { useMemo } from 'react';
import { TouchableOpacity, View as RNView, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';

export type SpaceCardProps = {
  name: string;
  description?: string;
  membersCount?: number;
  icon?: string;
  isArchived?: boolean;
  onPress?: () => void;
  onToggleArchive?: () => void;
  style?: any;
  createdAt?: string | number | Date;
  tileSize?: number;
  boardsCount?: number;
};

const SpaceCard: React.FC<SpaceCardProps> = ({
  name,
  description,
  membersCount = 0,
  icon = '📂',
  isArchived = false,
  onPress,
  onToggleArchive,
  style,
  createdAt,
  tileSize = 160,
  boardsCount = 0,
}) => {
  const colors = useThemeColors();

  const createdLabel = useMemo(() => {
    if (!createdAt) return undefined;
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return undefined;
      return d.toLocaleString();
    } catch {
      return undefined;
    }
  }, [createdAt]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[style, tileSize ? { width: tileSize } : null]}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            shadowColor: colors.foreground,
          },
        ]}
      >
        {/* Enhanced Gradient Header with Emoji */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD', colors.primary + 'AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCap}
        >
          <RNView style={styles.emojiContainer}>
            <Text style={styles.emoji}>{icon}</Text>
          </RNView>
          {onToggleArchive && (
            <TouchableOpacity
              onPress={onToggleArchive}
              style={[styles.fab, { backgroundColor: colors.card + 'F0' }]}
            >
              <FontAwesome
                name={isArchived ? 'undo' : 'archive'}
                size={16}
                color={isArchived ? colors.success : colors.warning}
              />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Content */}
        <RNView style={styles.bottomBox}>
          <Text
            style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '700' }]}
            numberOfLines={2}
          >
            {name}
          </Text>
          
          {/* Meta chips */}
          <RNView style={[styles.metaRow, { borderTopColor: colors.border + '40' }]}> 
            <RNView style={[styles.chip, { backgroundColor: colors.primary + '15' }]}> 
              <Text
                style={[
                  TextStyles.caption.small,
                  { color: colors.primary, fontWeight: '600' },
                ]}
              >
                👥 {membersCount}
              </Text>
            </RNView>
            <RNView style={[styles.chip, { backgroundColor: colors.accent + '15' }]}> 
              <Text
                style={[
                  TextStyles.caption.small,
                  { color: colors.accent, fontWeight: '600' },
                ]}
              >
                🗂️ {boardsCount}
              </Text>
            </RNView>
            <RNView style={[styles.chip, { backgroundColor: (isArchived ? colors.warning : colors.success) + '15' }]}> 
              <Text
                style={[
                  TextStyles.caption.small,
                  { color: isArchived ? colors.warning : colors.success, fontWeight: '600' },
                ]}
              >
                {isArchived ? 'Archived' : 'Active'}
              </Text>
            </RNView>
            {createdLabel && (
              <RNView
                style={[styles.chip, { backgroundColor: colors.muted + '30' }]}
              >
                <Text
                  style={[
                    TextStyles.caption.small,
                    { color: colors['muted-foreground'], fontWeight: '500' },
                  ]}
                >
                  📅 {createdLabel}
                </Text>
              </RNView>
            )}
          </RNView>
        </RNView>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerCap: {
    height: 70,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 16,
  },
  emojiContainer: {
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
  emoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomBox: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metaRow: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 24,
    justifyContent: 'center',
  },
});

export default SpaceCard;
