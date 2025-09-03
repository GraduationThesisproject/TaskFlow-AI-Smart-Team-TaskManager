import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '../Themed';
import { useThemeColors } from '../ThemeProvider';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 24, color }: IconProps) {
  const colors = useThemeColors();
  const iconColor = color || colors.foreground;

  return (
    <Text style={[styles.icon, { fontSize: size, color: iconColor }]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontFamily: 'FontAwesome',
  },
});
