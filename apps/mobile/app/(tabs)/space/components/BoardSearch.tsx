import React from 'react';
import { View } from '@/components/Themed';
import { TextInput, View as RNView, StyleSheet } from 'react-native';
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
      <RNView style={[styles.container, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <RNView style={[styles.icon, { backgroundColor: colors.background }]}>
          <FontAwesome name="search" size={14} color={colors['muted-foreground']} />
        </RNView>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search boards..."
          placeholderTextColor={colors['muted-foreground']}
          style={[styles.input, { color: colors.foreground }]}
        />
      </RNView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 6,
    fontSize: 16,
  },
});
