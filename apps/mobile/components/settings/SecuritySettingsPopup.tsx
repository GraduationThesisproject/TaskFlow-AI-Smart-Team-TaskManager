import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface SecuritySettingsPopupProps {
  visible: boolean;
  onClose: () => void;
}

const SecuritySettingsPopup: React.FC<SecuritySettingsPopupProps> = ({ visible, onClose }) => {
  const colors = useThemeColors();
  const { changePassword } = useAuth();
  
  // Password form state
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityForm, setSecurityForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  const onSecurityChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setSecurityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    setSecurityError(null);
    setSecuritySuccess(null);
    const { currentPassword, newPassword, confirmPassword } = securityForm;
    
    if (!currentPassword) return setSecurityError('Enter current password');
    if (!newPassword || newPassword.length < 8) return setSecurityError('New password must be 8+ chars');
    if (newPassword !== confirmPassword) return setSecurityError('New password mismatch');

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSecuritySuccess('Password changed successfully');
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setSecurityError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClose = () => {
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSecurityError(null);
    setSecuritySuccess(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <FontAwesome name="shield" size={24} color={colors.destructive} />
              <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
                Security Settings
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={colors['muted-foreground']} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], marginBottom: 20 }]}>
              Change your password to keep your account secure
            </Text>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                  Current Password
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { 
                      backgroundColor: colors.card, 
                      color: colors.foreground, 
                      borderColor: colors.border 
                    }]}
                    value={securityForm.currentPassword}
                    onChangeText={(value) => onSecurityChange('currentPassword', value)}
                    placeholder="Enter current password"
                    placeholderTextColor={colors['muted-foreground']}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome 
                      name={showPassword ? "eye-slash" : "eye"} 
                      size={16} 
                      color={colors['muted-foreground']} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                  New Password
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { 
                      backgroundColor: colors.card, 
                      color: colors.foreground, 
                      borderColor: colors.border 
                    }]}
                    value={securityForm.newPassword}
                    onChangeText={(value) => onSecurityChange('newPassword', value)}
                    placeholder="Enter new password"
                    placeholderTextColor={colors['muted-foreground']}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <FontAwesome 
                      name={showNewPassword ? "eye-slash" : "eye"} 
                      size={16} 
                      color={colors['muted-foreground']} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
                  Confirm New Password
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, { 
                      backgroundColor: colors.card, 
                      color: colors.foreground, 
                      borderColor: colors.border 
                    }]}
                    value={securityForm.confirmPassword}
                    onChangeText={(value) => onSecurityChange('confirmPassword', value)}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors['muted-foreground']}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesome 
                      name={showConfirmPassword ? "eye-slash" : "eye"} 
                      size={16} 
                      color={colors['muted-foreground']} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Error/Success Messages */}
            {securityError && (
              <View style={[styles.messageContainer, { backgroundColor: colors.destructive + '20', borderColor: colors.destructive }]}>
                <FontAwesome name="exclamation-circle" size={16} color={colors.destructive} />
                <Text style={[TextStyles.body.small, { color: colors.destructive }]}>{securityError}</Text>
              </View>
            )}
            {securitySuccess && (
              <View style={[styles.messageContainer, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
                <FontAwesome name="check-circle" size={16} color={colors.success} />
                <Text style={[TextStyles.body.small, { color: colors.success }]}>{securitySuccess}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleClose}
              >
                <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.changePasswordButton, { backgroundColor: colors.primary }]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                <FontAwesome name="key" size={16} color={colors['primary-foreground']} />
                <Text style={[TextStyles.body.medium, { color: colors['primary-foreground'] }]}>
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  changePasswordButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
});

export default SecuritySettingsPopup;
