import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/components/ThemeProvider';

export default function SpaceLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      initialRouteName="main"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="main" options={{ title: 'Space' }} />
      <Stack.Screen name="allboards" options={{ title: 'All Boards' }} />
      <Stack.Screen name="settings" options={{ title: 'Space Settings' }} />
    </Stack>
  );
}
