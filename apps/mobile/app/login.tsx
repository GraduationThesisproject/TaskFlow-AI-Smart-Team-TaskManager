import React from 'react';
import { ScrollView } from 'react-native';
import { Text, View, Card, Button, ButtonText } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import LoginForm from '@/components/auth/LoginForm';
import { router } from 'expo-router';
 

export default function LoginScreen() {
  const colors = useThemeColors();
  const { loginWithOAuth } = useOAuth();

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
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>Login</Text>
          </Card>
          <LoginForm onSignup={() => router.replace('/register')} onForgotPassword={handleForgotPassword}/>
        </View>
      </ScrollView>
    </View>
  );
}
