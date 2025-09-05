import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  currentSection: 'dashboard' | 'settings' | 'board';
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  route: string;
  section: 'dashboard' | 'settings' | 'board';
}

const dashboardItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: 'home', route: '/index', section: 'dashboard' },
];

const boardItems: NavItem[] = [
  { id: 'kanban', label: 'Kanban', icon: 'th-large', route: '/board/kanban', section: 'board' },
  { id: 'list', label: 'List', icon: 'list', route: '/board/list', section: 'board' },
  { id: 'timeline', label: 'Timeline', icon: 'clock-o', route: '/board/timeline', section: 'board' },
  { id: 'task', label: 'Task Details', icon: 'tasks', route: '/board/task', section: 'board' },
];

const settingsItems: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: 'user', route: '/settings/profile', section: 'settings' },
  { id: 'theme', label: 'Theme Settings', icon: 'paint-brush', route: '/settings/theme', section: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/settings/notifications', section: 'settings' },
  { id: 'upgrade', label: 'Upgrade', icon: 'star', route: '/settings/upgrade', section: 'settings' },
];

export default function Sidebar({ isVisible, onClose, currentSection }: SidebarProps) {
  const colors = useThemeColors();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const handleNavigation = (route: string) => {
    onClose();
    // Navigate to the route
    if (route.startsWith('/')) {
      router.push(route as any);
    }
  };

  const getCurrentItems = () => {
    switch (currentSection) {
      case 'dashboard':
        return dashboardItems;
      case 'board':
        return boardItems;
      case 'settings':
      default:
        return settingsItems;
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'board':
        return 'Board';
      case 'settings':
      default:
        return 'Settings';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.background,
            borderRightColor: colors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
            {getSectionTitle()}
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.card }]}
            onPress={onClose}
          >
            <FontAwesome name="times" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <View style={styles.navContainer}>
          {getCurrentItems().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                { 
                  backgroundColor: colors.card,
                  borderBottomColor: colors.border,
                }
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.navItemContent}>
                <FontAwesome 
                  name={item.icon} 
                  size={20} 
                  color={colors.primary} 
                  style={styles.navIcon}
                />
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  {item.label}
                </Text>
              </View>
              <FontAwesome 
                name="chevron-right" 
                size={16} 
                color={colors['muted-foreground']} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
            TaskFlow Mobile v1.0.0
          </Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    borderRightWidth: 1,
    zIndex: 1001,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navContainer: {
    flex: 1,
    paddingTop: 10,
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    marginRight: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});