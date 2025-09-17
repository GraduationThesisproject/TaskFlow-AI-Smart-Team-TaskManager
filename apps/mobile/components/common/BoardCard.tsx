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
        {/* Accent header or background */}
        <RNView style={[styles.tileHeader, { backgroundColor: themeColor }]}> 
          {!!bgImage && <RNView style={styles.headerOverlay} />}
        </RNView>

        {/* Content */}
        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
          {board?.name || 'Untitled Board'}
        </Text>
        {!!board?.description && (
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]} numberOfLines={2}>
            {board.description}
          </Text>
        )}

        <RNView style={[styles.tileMeta, { borderTopColor: colors.border }]}> 
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>Type: {board?.type || 'kanban'}</Text>
        </RNView>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boardTile: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12 },
  tileHeader: { height: 48, borderRadius: 8, marginBottom: 10 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 8, opacity: 0.15 },
  tileMeta: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 10, paddingTop: 8 },
});
