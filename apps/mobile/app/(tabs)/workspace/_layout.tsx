import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/components/ThemeProvider';

export default function WorkspaceStackLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Workspace' }} />
      <Stack.Screen name="space/index" options={{ title: 'Space' }} />
      <Stack.Screen name="reports" options={{ title: 'Reports' }} />
      <Stack.Screen name="settings" options={{ title: 'Workspace Settings' }} />
    </Stack>
  );
}
