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
      {/* Nesting note: child routes under `space/` are declared in `space/_layout.tsx` */}
      <Stack.Screen name="main" options={{ title: 'Space' }} />
    </Stack>
  );
}
