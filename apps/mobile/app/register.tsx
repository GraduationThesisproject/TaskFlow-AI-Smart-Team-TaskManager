import React from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import RegisterFrom from '@/components/auth/RegisterFrom';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const colors = useThemeColors();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.accent} />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <RegisterFrom onSignin={() => router.replace('/login')} />
      </ScrollView>
    </View>
  );
}
