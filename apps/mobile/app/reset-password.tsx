import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import InputField from '@/components/forms/InputField';
import { AuthService } from '@/services/authService';
import { router, useLocalSearchParams } from 'expo-router';

export default function ResetPasswordScreen() {
  const colors = useThemeColors();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!newPassword) {
      setPasswordError('New password is required');
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      await AuthService.resetPasswordWithCode({
        email: email!,
        code: code!,
        newPassword
      });
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'Continue to Login',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToVerifyCode = () => {
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Card style={{ padding: 24, marginBottom: 16 }}>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
            Reset Password
          </Text>
          
          <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
            Enter your new password below
          </Text>

          <View style={{ marginTop: 24 }}>
            <InputField
              label="New Password"
              value={newPassword}
              onChangeText={(val) => {
                setNewPassword(val);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter new password"
              secureTextEntry
              error={passwordError}
              required
            />

            <InputField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              placeholder="Confirm new password"
              secureTextEntry
              error={confirmPasswordError}
              required
            />
          </View>

          <View style={{ 
            marginTop: 16, 
            padding: 12, 
            backgroundColor: colors['muted'] + '20', 
            borderRadius: 8 
          }}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              Password requirements:
            </Text>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginTop: 4 }]}>
              • At least 8 characters long
            </Text>
          </View>

          <TouchableOpacity 
            onPress={handleResetPassword} 
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
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleBackToVerifyCode} 
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Back to Verify Code
            </Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}
