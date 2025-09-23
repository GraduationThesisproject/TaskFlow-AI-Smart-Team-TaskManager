import React from 'react';
import { ScrollView } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import RegisterFrom from '@/components/auth/RegisterFrom';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useOAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const colors = useThemeColors();
  const { signupWithOAuth } = useOAuth();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>Sign Up</Text>
        </Card>
        <RegisterFrom onSignin={() => router.replace('/login')} />
      </View>
    </ScrollView>
  );
}
