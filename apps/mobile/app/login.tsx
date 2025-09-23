import React from 'react';
import { ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import LoginForm from '@/components/auth/LoginForm';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useOAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const colors = useThemeColors();
  const { loginWithOAuth } = useOAuth();

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

        {/* OAuth divider */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View style={{ height: 1, backgroundColor: colors.border }} />
        </View>

        {/* GitHub Login */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => loginWithOAuth('github')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
            accessibilityLabel="Continue with GitHub"
          >
            <FontAwesome name="github" size={18} color={colors.foreground} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.foreground, fontWeight: '600' }}>Continue with GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
