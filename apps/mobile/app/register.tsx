import React from 'react';
import { ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import RegisterFrom from '@/components/auth/RegisterFrom';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useOAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const { signupWithOAuth } = useOAuth();

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

        {/* OAuth divider */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View style={{ height: 1, backgroundColor: colors.border }} />
        </View>

        {/* GitHub Signup */}
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => signupWithOAuth('github')}
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
            accessibilityLabel="Sign up with GitHub"
          >
            <FontAwesome name="github" size={18} color={colors.foreground} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.foreground, fontWeight: '600' }}>Sign up with GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
