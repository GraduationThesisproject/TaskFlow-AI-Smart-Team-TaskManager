import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import InputField from '@/components/forms/InputField';
import { AuthService } from '@/services/authService';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }

    try {
      setIsLoading(true);
      setEmailError('');
      
      await AuthService.sendForgotPasswordCode({ email });
      setCodeSent(true);
      
      Alert.alert(
        'Code Sent',
        'If an account with that email exists, a reset code has been sent to your email.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/verify-code',
              params: { email }
            })
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset code';
      setEmailError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Card style={{ padding: 24, marginBottom: 16 }}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
            Forgot Password?
          </Text>
          
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
            {codeSent 
              ? 'We\'ve sent a 4-digit code to your email'
              : 'Enter your email address and we\'ll send you a reset code'
            }
          </Text>

          {!codeSent && (
            <>
              <View style={{ marginTop: 24 }}>
                <InputField
                  label="Email"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={emailError}
                  required
                />
              </View>

              <TouchableOpacity 
                onPress={handleSendCode} 
                disabled={isLoading}
                style={{
                  marginTop: 24,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
                  {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            onPress={handleBackToLogin} 
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
