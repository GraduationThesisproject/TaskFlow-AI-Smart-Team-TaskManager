import React from 'react';
import { ScrollView } from 'react-native';
import { Text, View, Card, Button, ButtonText } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import LoginForm from '@/components/auth/LoginForm';
import { router } from 'expo-router';
 

export default function LoginScreen() {
  const colors = useThemeColors();

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

 

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
          <LoginForm onSignup={() => router.replace('/register')} onForgotPassword={handleForgotPassword}/>
        </View>
      </ScrollView>
    </View>
  );
}
