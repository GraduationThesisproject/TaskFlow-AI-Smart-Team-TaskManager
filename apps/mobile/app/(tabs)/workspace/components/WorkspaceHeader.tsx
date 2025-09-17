import React from 'react';
import { View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, View as ThemedView } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { TouchableOpacity } from 'react-native-gesture-handler';

export type WorkspaceHeaderProps = {
  title: string;
  onBack: () => void;
  onOpenSidebar: () => void;
  onOpenMembers?: () => void;
  showMembersButton?: boolean;
};

export default function WorkspaceHeader({ title, onBack, onOpenSidebar, onOpenMembers, showMembersButton = false }: WorkspaceHeaderProps) {
  const colors = useThemeColors();

  return (
    <ThemedView style={{
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
      borderBottomWidth: 1, backgroundColor: colors.card, borderBottomColor: colors.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <TouchableOpacity
          style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <FontAwesome name="arrow-left" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }}
          onPress={onOpenSidebar}
          accessibilityLabel="Open menu"
        >
          <FontAwesome name="bars" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '15' }}>
            <FontAwesome name="building" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[TextStyles.heading.h1, { color: colors.foreground }]}>{title}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {showMembersButton && (
          <TouchableOpacity 
            onPress={onOpenMembers} 
            style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }}
            accessibilityLabel="View members"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <FontAwesome name="users" size={16} color={colors['primary-foreground']} />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}


