import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAppSelector } from '@/store';
import { TextStyles } from '@/constants/Fonts';

export default function SpaceSettings() {
  const { selectedSpace } = useAppSelector((s: any) => s.workspace);
  return (
    <View style={styles.container}>
      <Text style={TextStyles.heading.h1}>Space Settings</Text>
      <Text>{selectedSpace?.name ?? 'No space selected'}</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });