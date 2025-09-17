import React from 'react';
import { View } from '@/components/Themed';
import { TextInput, View as RNView } from 'react-native';
import { useThemeColors } from '@/components/ThemeProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export type BoardSearchProps = {
  value: string;
  onChange: (text: string) => void;
};

export default function BoardSearch({ value, onChange }: BoardSearchProps) {
  const colors = useThemeColors();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
      <RNView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <RNView style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
          <FontAwesome name="search" size={12} color={colors['muted-foreground']} />
        </RNView>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search boards..."
          placeholderTextColor={colors['muted-foreground']}
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
        />
      </RNView>
    </View>
  );
}


