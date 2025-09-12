import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '../../hooks/useAuth';

interface EmailVerificationFormProps {
  email: string;
  onSuccess?: () => void;
  onResendCode?: () => void;
}

export default function EmailVerificationForm({
  email,
  onSuccess,
  onResendCode,
}: EmailVerificationFormProps) {
  const colors = useThemeColors();
  const { verifyEmailCode, isLoading: authLoading, error: authError, clearAuthError } = useAuth();
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all 4 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 4) {
      handleSubmit(newCode.join(''));
    }
    
    // Clear any existing errors
    if (error) clearAuthError();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code.join('');
    
    if (finalCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setSubmitting(true);
    setError('');
    clearAuthError();

    try {
      const result = await verifyEmailCode({ email, code: finalCode });
      
      if (result.meta.requestStatus === 'fulfilled') {
        Alert.alert('Success', 'Email verified successfully!');
        onSuccess?.();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err?.message || authError || 'Failed to verify code. Please try again.';
      setError(errorMessage);
      console.error('Verification error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      await onResendCode?.();
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      setCode(['', '', '', '']); // Clear current code
      inputRefs.current[0]?.focus(); // Focus first input
    } catch (err) {
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    }
  };

  const clearCode = () => {
    setCode(['', '', '', '']);
    inputRefs.current[0]?.focus();
    if (error) clearAuthError();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: 12, shadowColor: colors.foreground, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="mail" size={32} color={colors.primary} />
        </View>
      </View>

      <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
        Verify Your Email
      </Text>
      
      <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
        We've sent a 4-digit verification code to
      </Text>
      
      <Text style={[TextStyles.body.medium, { color: colors.foreground, textAlign: 'center', fontWeight: '600', marginTop: 4 }]}>
        {email}
      </Text>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[TextStyles.body.small, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={[TextStyles.body.medium, { color: colors.foreground, textAlign: 'center', marginBottom: 24 }]}>
          Enter the 4-digit code below
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.background,
                  color: colors.foreground,
                }
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        <View style={styles.timerContainer}>
          {!canResend ? (
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Code expires in {formatTime(timeLeft)}
            </Text>
          ) : (
            <Text style={[TextStyles.body.small, { color: colors.error, textAlign: 'center' }]}>
              Code has expired
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleSubmit()}
          disabled={submitting || isLoading || code.join('').length !== 4}
          style={[
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              opacity: (submitting || isLoading || code.join('').length !== 4) ? 0.6 : 1
            }
          ]}
          activeOpacity={0.8}
        >
          <Text style={[TextStyles.button.medium, { color: colors['primary-foreground'], textAlign: 'center' }]}>
            {submitting || isLoading ? 'Verifying...' : 'Verify Email'}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={!canResend}
            style={styles.resendButton}
            activeOpacity={0.7}
          >
            <Text style={[
              TextStyles.body.medium,
              {
                color: canResend ? colors.primary : colors['muted-foreground'],
                textAlign: 'center'
              }
            ]}>
              {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearCode}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center' }]}>
              Clear Code
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    margin: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    marginTop: 24,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
