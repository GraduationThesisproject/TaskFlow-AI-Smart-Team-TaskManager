import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/components/ThemeProvider';

export default function SpaceLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
