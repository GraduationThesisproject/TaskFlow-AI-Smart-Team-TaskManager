import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Kanban, Users, User } from 'lucide-react-native';
import './global.css';

// Import theme
import { ThemeProvider, useTheme } from './theme';

// Import screens
import DashboardScreen from './screens/DashboardScreen';
import BoardScreen from './screens/BoardScreen';
import TeamsScreen from './screens/TeamsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SpaceScreen from './screens/SpaceScreen';
const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingBottom: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            height: 70,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: {
            fontSize: theme.typography.fontSize.xs,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Home color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Boards"
          component={BoardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Kanban color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Teams"
          component={TeamsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Users color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Space"
          component={SpaceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <AppNavigator />
    </ThemeProvider>
  );
}