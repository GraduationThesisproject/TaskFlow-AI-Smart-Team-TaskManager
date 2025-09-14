import React from 'react';
import { ScrollView, StatusBar } from 'react-native';
import { View } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import LoginForm from '@/components/auth/LoginForm';
import { router } from 'expo-router';

export default function LoginScreen() {
  const colors = useThemeColors();

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LoginForm 
          onSignup={() => router.replace('/register')} 
          onForgotPassword={handleForgotPassword}
        />
      </ScrollView>
    </View>
  );
}
