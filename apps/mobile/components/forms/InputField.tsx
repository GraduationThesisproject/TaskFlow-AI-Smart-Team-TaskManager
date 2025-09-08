import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface InputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

export default function InputField({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  required = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  onSubmitEditing
}: InputFieldProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
            {label}
            {required && (
              <Text style={{ color: colors.error }}> *</Text>
            )}
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            error && { borderColor: colors.error },
            disabled && { opacity: 0.6 }
          ]}
        />

        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  messageContainer: {
    marginTop: 4,
  },
});
