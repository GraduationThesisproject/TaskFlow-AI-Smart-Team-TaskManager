import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store';
import { setSelectedSpace } from '@/store/slices/workspaceSlice';

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
  currentSection?: SidebarSection;
  onSectionChange?: (sectionId: string) => void;
  onItemPress?: (item: NavItem) => void;
  context?: 'dashboard' | 'settings' | 'workspace';
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

const workspaceItems: NavItem[] = [
  { id: 'ws-spaces', label: 'Spaces', icon: 'folder-open', route: '/(tabs)/workspace/spaces', section: 'workspace', disabled: true, onPress: () => {} },
  { id: 'ws-rules', label: 'Rules', icon: 'book', route: '/(tabs)/workspace/rules', section: 'workspace' },
  { id: 'ws-reports', label: 'Reports', icon: 'line-chart', route: '/(tabs)/workspace/reports', section: 'workspace' },
  { id: 'ws-settings', label: 'Settings', icon: 'cog', route: '/(tabs)/workspace/settings', section: 'workspace' },
];

export default function Sidebar({
  isVisible,
  onClose,
  sections,
  currentSection,
  onSectionChange,
  onItemPress,
  context = 'dashboard',
  showBackdrop = true,
  width = 300,
  animationDuration = 250,
  headerTitle,
  footerText,
  showFooter = true,
  customHeader,
  customFooter,
  style,
  navItemStyle,
  headerStyle,
  footerStyle,
}: SidebarProps) {
  const colors = useThemeColors();
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const dispatch = useAppDispatch();
  const { spaces, currentWorkspace } = useAppSelector((s: any) => s.workspace);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  // Build default sections based on context when explicit sections are not provided
  const defaultSections: SidebarSection[] = React.useMemo(() => {
    switch (context) {
      case 'settings':
        return [{ id: 'settings', title: 'Settings', items: settingsItems }];
      case 'workspace':
        return [{ id: 'workspace', title: 'Workspace', items: workspaceItems }];
      case 'dashboard':
      default:
        return [{ id: 'dashboard', title: 'Dashboard', items: dashboardItems }];
    }
  }, [context]);

  // Early return after all hooks to avoid violating Rules of Hooks
  if (!isVisible) return null;

  const handleNavigation = (item: NavItem) => {
    // Check if this is a premium locked item
    if (item.disabled && item.id === 'ws-spaces') {
      setShowPremiumModal(true);
      return;
    }

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
          opacity: item.disabled ? 0.7 : 1,
        },
        navItemStyle,
      ]}
      onPress={() => handleNavigation(item)}
      disabled={false} // Allow clicking to show premium modal
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
        {item.disabled && (
          <View style={[styles.premiumBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
            <FontAwesome name="lock" size={12} color={colors.primary} />
            <Text style={[TextStyles.caption.small, { color: colors.primary, marginLeft: 4, fontWeight: '600' }]}>
              Premium
            </Text>
          </View>
        )}
      </View>
      <FontAwesome 
        name={item.disabled ? "lock" : "chevron-right"} 
        size={16} 
        color={item.disabled ? colors.primary : colors['muted-foreground']} 
      />
    </TouchableOpacity>
  );

  const finalSections = (sections && sections.length ? sections : defaultSections);
  const activeSection = currentSection ?? finalSections[0];

  const renderSectionTabs = () => {
    if (!finalSections || finalSections.length <= 1 || !activeSection) return null;

    return (
      <View style={[styles.sectionTabs, { borderBottomColor: colors.border }]}>
        {finalSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionTab,
              {
                backgroundColor: activeSection.id === section.id ? colors.primary : colors.card,
                borderBottomColor: activeSection.id === section.id ? colors.primary : 'transparent',
              }
            ]}
            onPress={() => handleSectionChange(section.id)}
          >
            <Text style={[
              TextStyles.body.medium,
              {
                color: activeSection.id === section.id ? colors.background : colors.foreground,
              }
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
              {headerTitle || activeSection?.title}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={onClose}
            >
              <FontAwesome name="times" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Section Tabs */}
        {renderSectionTabs()}

        {/* Navigation Items */}
        <View style={styles.navContainer}>
          {activeSection?.items?.map(renderNavItem)}
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

      {/* Premium Lock Modal */}
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIcon, { backgroundColor: colors.primary + '20' }]}>
                <FontAwesome name="lock" size={24} color={colors.primary} />
              </View>
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
                Premium Feature
              </Text>
              <TouchableOpacity
                onPress={() => setShowPremiumModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.muted }]}
              >
                <FontAwesome name="times" size={16} color={colors['muted-foreground']} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={[TextStyles.body.large, { color: colors.foreground, textAlign: 'center', marginBottom: 8 }]}>
                Spaces Management
              </Text>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginBottom: 24 }]}>
                Access all spaces and advanced management features with Premium
              </Text>

              {/* Benefits */}
              <View style={styles.modalBenefits}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 12, fontWeight: '600' }]}>
                  Premium includes:
                </Text>
                {[
                  "Unlimited spaces (currently limited to 5)",
                  "Advanced space management",
                  "Priority support",
                  "Custom integrations"
                ].map((benefit, index) => (
                  <View key={index} style={styles.modalBenefitItem}>
                    <FontAwesome name="check" size={16} color={colors.success} style={styles.modalCheckIcon} />
                    <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                      {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => setShowPremiumModal(false)}
                style={[styles.modalButton, styles.modalCancelButton, { borderColor: colors.border }]}
              >
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowPremiumModal(false);
                  router.push('/(tabs)/settings?section=upgrade');
                }}
                style={[styles.modalButton, styles.modalUpgradeButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="star" size={16} color={colors['primary-foreground']} style={styles.modalUpgradeIcon} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], fontWeight: '600' }]}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalBenefits: {
    marginTop: 8,
  },
  modalBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCheckIcon: {
    marginRight: 12,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalCancelButton: {
    borderWidth: 1,
  },
  modalUpgradeButton: {
    // backgroundColor set dynamically
  },
  modalUpgradeIcon: {
    marginRight: 8,
  },
});