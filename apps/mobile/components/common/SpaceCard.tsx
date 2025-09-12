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
}) => {
  const colors = useThemeColors();

  const createdLabel = useMemo(() => {
    if (!createdAt) return undefined;
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return undefined;
      return d.toLocaleDateString();
    } catch {
      return undefined;
    }
  }, [createdAt]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[style, tileSize ? { width: tileSize, height: tileSize } : null]}
    >
      <Card
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: StyleSheet.hairlineWidth,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {/* Gradient Header with Emoji */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCap}
        >
          <Text style={styles.emoji}>{icon}</Text>
          {onToggleArchive && (
            <TouchableOpacity
              onPress={onToggleArchive}
              style={[styles.fab, { backgroundColor: colors.card }]}
            >
              <FontAwesome
                name={isArchived ? 'undo' : 'archive'}
                size={18}
                color={isArchived ? colors.success : colors.warning}
              />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Content */}
        <RNView style={styles.bottomBox}>
          <Text
            style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '600' }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {/* Meta chips (members, created date) directly under the name */}
          <RNView style={[styles.metaRow, { borderTopColor: colors.border }]}>
            <RNView style={[styles.chip, { backgroundColor: colors['muted'] }]}>
              <Text
                style={[
                  TextStyles.caption.small,
                  { color: colors.foreground },
                ]}
              >
                👥 {membersCount}
              </Text>
            </RNView>
            {createdLabel && (
              <RNView
                style={[styles.chip, { backgroundColor: colors['muted'] }]}
              >
                <Text
                  style={[
                    TextStyles.caption.small,
                    { color: colors.foreground },
                  ]}
                >
                  📅 {createdLabel}
                </Text>
              </RNView>
            )}
          </RNView>
          {/* Description intentionally hidden per request */}
        </RNView>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 12,
    overflow: 'hidden',
    aspectRatio: 1,
    justifyContent: 'space-between',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerCap: {
    height: 60,
    borderRadius: 16,
    marginBottom: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
  },
  emoji: {
    fontSize: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fab: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 999,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomBox: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  metaRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
});

export default SpaceCard;
