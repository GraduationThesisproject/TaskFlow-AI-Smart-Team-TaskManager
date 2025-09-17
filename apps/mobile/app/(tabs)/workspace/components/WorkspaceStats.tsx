import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card, Text } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';

export type WorkspaceStatsProps = {
  membersCount: number;
  activeSpacesCount: number;
  archivedSpacesCount: number;
};

export default function WorkspaceStats({ membersCount, activeSpacesCount, archivedSpacesCount }: WorkspaceStatsProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isTablet = width >= 768;

  // Responsive tokens
  const cardPadding = isSmall ? 14 : 20;
  const gap = isSmall ? 10 : 12;
  const badgeSize = isSmall ? 34 : 40;
  const iconSize = isSmall ? 16 : 20;
  const numberStyle = isSmall ? { fontSize: 20, lineHeight: 24 } : {};
  const containerStyle = isTablet ? { gap } : { gap, flexWrap: 'wrap' as const };
  return (
    <View style={{ flexDirection: 'row', marginBottom: 20, ...containerStyle }}>
      <Card style={{ flex: 1, padding: cardPadding, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap, backgroundColor: colors.card, minWidth: isTablet ? undefined : '30%' }}>
        <View style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '15' }}>
          <FontAwesome name="users" size={iconSize} color={colors.primary} />
        </View>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }, numberStyle]}>{membersCount}</Text>
      </Card>
      <Card style={{ flex: 1, padding: cardPadding, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap, backgroundColor: colors.card, minWidth: isTablet ? undefined : '30%' }}>
        <View style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent + '15' }}>
          <FontAwesome name="th-large" size={iconSize} color={colors.accent} />
        </View>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }, numberStyle]}>{activeSpacesCount}</Text>
      </Card>
      <Card style={{ flex: 1, padding: cardPadding, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap, backgroundColor: colors.card, minWidth: isTablet ? undefined : '30%' }}>
        <View style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.warning + '15' }}>
          <FontAwesome name="archive" size={iconSize} color={colors.warning} />
        </View>
        <Text style={[TextStyles.heading.h2, { color: colors.foreground }, numberStyle]}>{archivedSpacesCount}</Text>
      </Card>
    </View>
  );
}


