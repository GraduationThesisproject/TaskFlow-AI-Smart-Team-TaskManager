import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

export default function FormField({ 
  label, 
  error, 
  required = false, 
  helperText,
  children 
}: FormFieldProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
          {label}
          {required && (
            <Text style={{ color: colors.error }}> *</Text>
          )}
        </Text>
      </View>

      {children}

      {(error || helperText) && (
        <View style={styles.messageContainer}>
          {error && (
            <Text style={[TextStyles.body.small, { color: colors.error }]}>
              {error}
            </Text>
          )}
          {helperText && !error && (
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'] }]}>
              {helperText}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  messageContainer: {
    marginTop: 4,
  },
});
