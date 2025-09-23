import React from 'react';
import { View as RNView, TextInput, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Card, Text, View } from '@/components/Themed';
import { TextStyles } from '@/constants/Fonts';
import { useThemeColors } from '@/components/ThemeProvider';

export type WorkspaceToolbarProps = {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
  onCreate: () => void;
};

export default function WorkspaceToolbar({ value, onChange, onClear, onCreate }: WorkspaceToolbarProps) {
  const colors = useThemeColors();

  return (
    <Card style={{ padding: 20, marginBottom: 20, backgroundColor: colors.card }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderColor: colors.border }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <FontAwesome name="search" size={16} color={colors['muted-foreground']} />
          </View>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Search spaces..."
            placeholderTextColor={colors['muted-foreground']}
            style={{ flex: 1, color: colors.foreground, backgroundColor: colors.background }}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={onClear} style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.muted }}>
              <FontAwesome name="times" size={12} color={colors['muted-foreground']} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onCreate} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
          <FontAwesome name="plus" size={16} color={colors['primary-foreground']} />
          <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'], fontWeight: '600', marginLeft: 6 }]}>Create Space</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}


