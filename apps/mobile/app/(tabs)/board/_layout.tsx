import React from 'react';
import { Stack } from 'expo-router';
import { useThemeColors } from '@/components/ThemeProvider';

export default function BoardLayout() {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Board' }} />
      <Stack.Screen name="kanban" options={{ title: 'Kanban' }} />
      <Stack.Screen name="list" options={{ title: 'List' }} />
      <Stack.Screen name="timeline" options={{ title: 'Timeline' }} />
      <Stack.Screen name="task" options={{ title: 'Task Details' }} />
      <Stack.Screen name="task/[taskId]" options={{ title: 'Task Details' }} />
    </Stack>
  );
}
