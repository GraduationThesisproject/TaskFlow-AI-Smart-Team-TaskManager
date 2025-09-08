import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import InputField from '@/components/forms/InputField';
import { AuthService } from '@/services/authService';
import { router, useLocalSearchParams } from 'expo-router';

export default function VerifyCodeScreen() {
  const colors = useThemeColors();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateCode = (code: string) => {
    return /^\d{4}$/.test(code);
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setCodeError('Code is required');
      return;
    }

    if (!validateCode(code)) {
      setCodeError('Please enter a valid 4-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setCodeError('');
      
      await AuthService.verifyForgotPasswordCode({ email: email!, code });
      
      Alert.alert(
        'Code Verified',
        'Your code has been verified. You can now reset your password.',
        [
          {
            text: 'Continue',
            onPress: () => router.push({
              pathname: '/reset-password',
              params: { email, code }
            })
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid or expired code';
      setCodeError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setCodeError('');
      
      await AuthService.sendForgotPasswordCode({ email: email! });
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setCode('');
      
      Alert.alert('Code Sent', 'A new reset code has been sent to your email.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend code';
      setCodeError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Card style={{ padding: 24, marginBottom: 16 }}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
            Enter Verification Code
          </Text>
          
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
            We've sent a 4-digit code to {email}
          </Text>

          <View style={{ marginTop: 24 }}>
            <InputField
              label="Verification Code"
              value={code}
              onChangeText={(val) => {
                setCode(val);
                if (codeError) setCodeError('');
              }}
              placeholder="Enter 4-digit code"
              keyboardType="numeric"
              maxLength={4}
              error={codeError}
              required
            />
          </View>

          {timeLeft > 0 && (
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
                Code expires in {formatTime(timeLeft)}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={handleVerifyCode} 
            disabled={isLoading || !validateCode(code)}
            style={{
              marginTop: 24,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary,
              opacity: (isLoading || !validateCode(code)) ? 0.6 : 1
            }}
          >
            <Text style={{ color: colors['primary-foreground'], textAlign: 'center' }}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          {canResend && (
            <TouchableOpacity 
              onPress={handleResendCode} 
              disabled={isLoading}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={[TextStyles.body.medium, { color: colors.primary }]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={handleBackToForgotPassword} 
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Back to Forgot Password
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
