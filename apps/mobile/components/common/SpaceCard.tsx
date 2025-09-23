import React, { useMemo } from 'react';
import { TouchableOpacity, View as RNView, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Card } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';

export type SpaceCardProps = {
  name: string;
  description?: string;
  membersCount?: number;
  icon?: string; // optional emoji
  isArchived?: boolean;
  onPress?: () => void;
  onToggleArchive?: () => void;
  style?: any;
  createdAt?: string | number | Date;
  tileSize?: number; // explicit square size (width & height)
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
  tileSize,
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

  const displayName = useMemo(() => {
    if (typeof name !== 'string') return '';
    return name.length > 5 ? name.slice(0, 5) : name;
  }, [name]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[style, tileSize ? { width: tileSize, height: tileSize } : null]}
    >
      <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}>
        {/* Header cap like BoardCard, emoji centered, actions top-right */}
        <RNView style={[styles.headerCap, { backgroundColor: colors.primary }]}> 
          <Text style={{ fontSize: 20 }}>{icon}</Text>
          <RNView style={styles.headerActions}>
            {onToggleArchive && (
              <TouchableOpacity onPress={onToggleArchive} style={[styles.iconBtn, { backgroundColor: '#ffffffB3' }]}> 
                <FontAwesome name={isArchived ? 'undo' : 'archive'} size={12} color={isArchived ? colors.success : colors.warning} />
              </TouchableOpacity>
            )}
            <RNView style={[styles.iconBtn, { backgroundColor: '#ffffffB3' }]}> 
              <FontAwesome name="chevron-right" size={10} color={colors['muted-foreground']} />
            </RNView>
          </RNView>
        </RNView>

        {/* Bottom meta */}
        <RNView style={styles.bottomBox}>
          <Text
            style={[TextStyles.body.medium, { color: colors.foreground, fontWeight: '700' }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {!!description && (
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 2 }]} numberOfLines={1}>
              {description}
            </Text>
          )}
          <RNView style={[styles.metaRow, { borderTopColor: colors.border }]}> 
            <RNView style={[styles.chip, { backgroundColor: colors.card }]}> 
              <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>{membersCount} members</Text>
            </RNView>
            {createdLabel && (
              <RNView style={[styles.chip, { backgroundColor: colors.card }]}> 
                <Text style={[TextStyles.caption.small, { color: colors.foreground }]}>created {createdLabel}</Text>
              </RNView>
            )}
            {/* archived chip removed per request */}
          </RNView>
        </RNView>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 8,
    overflow: 'hidden',
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  headerCap: { height: 48, borderRadius: 12, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  headerActions: { position: 'absolute', top: 6, right: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { padding: 5, borderRadius: 8 },
  bottomBox: {},
  metaRow: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
});

export default SpaceCard;
