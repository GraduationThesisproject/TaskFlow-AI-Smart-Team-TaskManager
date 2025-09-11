import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { useThemeColors } from '@/components/ThemeProvider';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import NotificationBell from '@/components/common/NotificationBell';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors['muted-foreground'],
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false, // Remove redundant header
        }}
      />
      <Tabs.Screen
        name="workspace"
        options={{
          href: null, // Hide from tab bar
          headerShown: true,
          headerTitle: 'Workspace',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerRight: () => (<NotificationBell size={22} />),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          href: null, // Hide from tab bar
          headerShown: false, // Remove redundant header
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Remove redundant header
        }}
      />
      <Tabs.Screen
        name="workspaces"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Remove redundant header
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          href: null, // Hide from tab bar
          headerShown: false, // Remove redundant header
        }}
      />
    </Tabs>
  );
}