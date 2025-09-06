import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  currentSection: 'dashboard' | 'settings' | 'workspace';
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  route: string;
  section: 'dashboard' | 'settings' | 'workspace';
}

const dashboardItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: 'home', route: '/index', section: 'dashboard' },
];

const settingsItems: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: 'user', route: '/settings/profile', section: 'settings' },
  { id: 'theme', label: 'Theme Settings', icon: 'paint-brush', route: '/settings/theme', section: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/settings/notifications', section: 'settings' },
  { id: 'upgrade', label: 'Upgrade', icon: 'star', route: '/settings/upgrade', section: 'settings' },
];

const workspaceItems: NavItem[] = [
  { id: 'ws-reports', label: 'Reports', icon: 'line-chart', route: '/(tabs)/workspace/reports', section: 'workspace' },
  { id: 'ws-settings', label: 'Settings', icon: 'cog', route: '/(tabs)/workspace/settings', section: 'workspace' },
];

export default function Sidebar({ isVisible, onClose, currentSection }: SidebarProps) {
  const colors = useThemeColors();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const dispatch = useAppDispatch();
  const { spaces, currentWorkspace } = useAppSelector((s: any) => s.workspace);

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
    if (route.startsWith('/')) {
      router.push(route as any);
    }
  };

  const handleOpenSpace = (space: any) => {
    if (!space) return;
    dispatch(setSelectedSpace(space));
    onClose();
    router.push('/(tabs)/workspace/space');
  };

  const getCurrentItems = () => {
    switch (currentSection) {
      case 'dashboard':
        return dashboardItems;
      case 'workspace':
        return workspaceItems;
      case 'settings':
      default:
        return settingsItems;
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'workspace':
        return 'Workspace';
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
          {currentSection === 'workspace' && (
            <>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground, marginHorizontal: 16, marginTop: 16, marginBottom: 8 }]}>Spaces</Text>
              {Array.isArray(spaces) && spaces.length > 0 ? (
                spaces
                  .filter((sp: any) => sp?.status !== 'archived')
                  .map((sp: any) => (
                    <TouchableOpacity
                      key={sp._id || sp.id}
                      style={[
                        styles.navItem,
                        { backgroundColor: colors.card, borderBottomColor: colors.border },
                      ]}
                      onPress={() => handleOpenSpace(sp)}
                    >
                      <View style={styles.navItemContent}>
                        <FontAwesome name="folder" size={18} color={colors.accent} style={styles.navIcon} />
                        <Text style={[TextStyles.body.medium, { color: colors.foreground }]} numberOfLines={1}>
                          {sp.name}
                        </Text>
                      </View>
                      <FontAwesome name="chevron-right" size={14} color={colors['muted-foreground']} />
                    </TouchableOpacity>
                  ))
              ) : (
                <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
                  <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>No spaces</Text>
                </View>
              )}
            </>
          )}
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