import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

// Types for better reusability
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  route: string;
  section?: string;
  badge?: number;
  disabled?: boolean;
  onPress?: () => void;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  sections?: SidebarSection[];
  currentSectionId?: string;
  onSectionChange?: (sectionId: string) => void;
  onItemPress?: (item: NavItem) => void;
  context?: 'dashboard' | 'settings';
  showBackdrop?: boolean;
  width?: number;
  animationDuration?: number;
  headerTitle?: string;
  footerText?: string;
  showFooter?: boolean;
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
  style?: any;
  navItemStyle?: any;
  headerStyle?: any;
  footerStyle?: any;
}

// Navigation items for different sections
const dashboardItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', route: '/(tabs)', section: 'dashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart', route: '/analytics', section: 'dashboard' },
  { id: 'workspaces', label: 'Workspaces', icon: 'folder', route: '/workspaces', section: 'dashboard' },
  { id: 'templates', label: 'Templates', icon: 'copy', route: '/templates', section: 'dashboard' },
];

const settingsItems: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: 'user', route: '/(tabs)/settings?section=profile', section: 'settings' },
  { id: 'theme', label: 'Theme', icon: 'paint-brush', route: '/(tabs)/settings?section=theme', section: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/(tabs)/settings?section=notifications', section: 'settings' },
  { id: 'activity', label: 'Activity', icon: 'clock-o', route: '/(tabs)/settings?section=activity', section: 'settings' },
  { id: 'upgrade', label: 'Upgrade', icon: 'star', route: '/(tabs)/settings?section=upgrade', section: 'settings' },
];

// Function to get appropriate sections based on context
const getSectionsForContext = (context?: string): SidebarSection[] => {
  if (context === 'settings') {
    return [
      {
        id: 'settings',
        title: 'Settings',
        items: settingsItems,
      },
    ];
  }
  
  // Default to dashboard only
  return [
    {
      id: 'dashboard',
      title: 'Dashboard',
      items: dashboardItems,
    },
  ];
};

const defaultSections = getSectionsForContext();

export default function Sidebar({
  isVisible,
  onClose,
  sections,
  currentSectionId,
  onSectionChange,
  onItemPress,
  context,
  showBackdrop = true,
  width = 300,
  animationDuration = 300,
  headerTitle,
  footerText = 'TaskFlow Mobile v1.0.0',
  showFooter = true,
  customHeader,
  customFooter,
  style,
  navItemStyle,
  headerStyle,
  footerStyle,
}: SidebarProps) {
  // Use provided sections or get sections based on context
  const finalSections = sections || getSectionsForContext(context);
  const colors = useThemeColors();
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  // Determine current section (default to dashboard)
  const currentSection = currentSectionId 
    ? finalSections.find(section => section.id === currentSectionId) || finalSections[0]
    : finalSections[0];

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim, width, animationDuration]);

  const handleNavigation = (item: NavItem) => {
    // Call custom onItemPress if provided
    if (onItemPress) {
      onItemPress(item);
      return;
    }

    // Default navigation behavior
    if (item.onPress) {
      item.onPress();
    } else if (item.route && item.route.startsWith('/')) {
      router.push(item.route as any);
    }

    onClose();
  };

  const handleSectionChange = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const renderNavItem = (item: NavItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.navItem,
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          opacity: item.disabled ? 0.5 : 1,
        },
        navItemStyle,
      ]}
      onPress={() => !item.disabled && handleNavigation(item)}
      disabled={item.disabled}
    >
      <View style={styles.navItemContent}>
        <FontAwesome 
          name={item.icon} 
          size={20} 
          color={item.disabled ? colors['muted-foreground'] : colors.primary} 
          style={styles.navIcon}
        />
        <Text style={[
          TextStyles.body.medium, 
          { 
            color: item.disabled ? colors['muted-foreground'] : colors.foreground 
          }
        ]}>
          {item.label}
        </Text>
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[TextStyles.caption.small, { color: colors.background }]}>
              {item.badge}
            </Text>
          </View>
        )}
      </View>
      <FontAwesome 
        name="chevron-right" 
        size={16} 
        color={colors['muted-foreground']} 
      />
    </TouchableOpacity>
  );

  const renderSectionTabs = () => {
    if (finalSections.length <= 1) return null;

    return (
      <View style={[styles.sectionTabs, { borderBottomColor: colors.border }]}>
        {finalSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionTab,
              {
                backgroundColor: currentSection.id === section.id ? colors.primary : colors.card,
                borderBottomColor: currentSection.id === section.id ? colors.primary : 'transparent',
              }
            ]}
            onPress={() => handleSectionChange(section.id)}
          >
            <Text style={[
              TextStyles.body.medium,
              {
                color: currentSection.id === section.id ? colors.background : colors.foreground,
              }
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      
      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.background,
            borderRightColor: colors.border,
            width,
            transform: [{ translateX: slideAnim }],
          },
          style,
        ]}
      >
        {/* Header */}
        {customHeader || (
          <View style={[styles.header, { borderBottomColor: colors.border }, headerStyle]}>
            <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>
              {headerTitle || currentSection.title}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={onClose}
            >
              <FontAwesome name="times" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        )}

        {/* Section Tabs */}
        {renderSectionTabs()}

        {/* Navigation Items */}
        <View style={styles.navContainer}>
          {currentSection.items.map(renderNavItem)}
        </View>

        {/* Footer */}
        {showFooter && (
          customFooter || (
            <View style={[styles.footer, { borderTopColor: colors.border }, footerStyle]}>
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'] }]}>
                {footerText}
              </Text>
            </View>
          )
        )}
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
  sectionTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
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
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});
