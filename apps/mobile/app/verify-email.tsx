import React, { useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, Dimensions, StatusBar, StyleSheet } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles, FontSizes, FontWeights } from '@/constants/Fonts';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EmailVerificationForm from '@/components/auth/EmailVerificationForm';
import { useAuth } from '@/hooks/useAuth';
import InputField from '@/components/forms/InputField';

export default function VerifyEmailScreen() {
  const colors = useThemeColors();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const { resendVerification } = useAuth();

  const [email, setEmail] = useState((emailParam || '').toLowerCase());
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(!!emailParam);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleVerificationSuccess = () => {
    // Redirect to login screen after successful verification
    router.replace('/login');
  };

  const handleResendCode = async () => {
    try {
      if (email) {
        const result: any = await resendVerification({ email });
        if (result?.meta?.requestStatus === 'rejected') {
          console.error('Resend rejected:', result?.payload);
        }
      }
    } catch (error) {
      console.error('Failed to resend verification code:', error);
    }
  };

  const handleSendCode = async () => {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed || !validateEmail(trimmed)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setSubmitting(true);
    try {
      const result: any = await resendVerification({ email: trimmed });
      if (result?.meta?.requestStatus === 'fulfilled') {
        setCodeSent(true);
      } else {
        setEmailError(result?.payload || 'Failed to send code. Please try again.');
      }
    } catch (error: any) {
      setEmailError(error?.message || 'Failed to send code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToRegister = () => {
    router.back();
  };

  const { width, height } = Dimensions.get('window');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#1a1a1a' ? 'light-content' : 'dark-content'} />
      
      {/* Background Pattern */}
      <View style={[styles.backgroundPattern, { backgroundColor: colors.primary + '08' }]} />
      <View style={[styles.backgroundAccent, { backgroundColor: colors.accent + '05' }]} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="mail" size={48} color={colors.primary} />
          </View>
          <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center', marginTop: 16 }]}>
            Verify Your Email
          </Text>
          <Text style={[TextStyles.body.large, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
            We'll send you a verification code to confirm your email address
          </Text>
        </View>

        {/* Form Card */}
        <Card style={[styles.formCard, { backgroundColor: colors.card, shadowColor: colors.foreground }]}>
          {!codeSent ? (
            <View>
              <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginBottom: 24 }]}>
                Enter your email to receive a 4-digit code
              </Text>
              <InputField
                label="Email Address"
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
              <TouchableOpacity
                onPress={handleSendCode}
                disabled={submitting}
                style={[
                  styles.sendCodeButton, 
                  { 
                    backgroundColor: colors.primary, 
                    opacity: submitting ? 0.6 : 1 
                  }
                ]}
                activeOpacity={0.8}
              >
                <Text style={[TextStyles.button.large, { color: colors['primary-foreground'], textAlign: 'center' }]}>
                  {submitting ? 'Sending...' : 'Send Code'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.codeSentContainer}>
                <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                </View>
                <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 16 }]}>
                  We've sent a 4-digit verification code to
                </Text>
                <Text style={[TextStyles.body.large, { color: colors.foreground, textAlign: 'center', fontWeight: FontWeights.semiBold, marginTop: 4 }]}>
                  {email}
                </Text>
              </View>
              <EmailVerificationForm
                email={email}
                onSuccess={handleVerificationSuccess}
                onResendCode={handleResendCode}
              />
            </>
          )}

          <TouchableOpacity 
            onPress={handleBackToRegister} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors['muted-foreground']} style={{ marginRight: 8 }} />
            <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'] }]}>
              Back to Registration
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backgroundAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '30%',
    borderBottomLeftRadius: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  codeSentContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCodeButton: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
});
