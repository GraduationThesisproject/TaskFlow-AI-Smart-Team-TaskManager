import React from 'react';
import { ScrollView } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import RegisterFrom from '@/components/auth/RegisterFrom';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const colors = useThemeColors();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <RegisterFrom onSignin={() => router.replace('/login')} />
      </View>
    </ScrollView>
  );
}
