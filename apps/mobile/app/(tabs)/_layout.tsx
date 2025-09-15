import React from 'react';
import { Stack } from 'expo-router';

import { useThemeColors } from '@/components/ThemeProvider';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function StackLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerShown: false, // Hide headers by default
        animation: 'slide_from_right', // Add smooth navigation animation
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="board"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workspace"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workspaces"
        options={{
          headerShown: true,
          title: 'Workspaces',
        }}
      />
      <Stack.Screen
        name="templates"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}