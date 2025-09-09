import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Text, View, Card } from '@/components/Themed';
import { useThemeColors } from '@/components/ThemeProvider';
import { TextStyles } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountSettings: React.FC = () => {
  const colors = useThemeColors();
  const { user, updateProfileSecure, changePassword } = useAuth();
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  
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

  // Initialize form once user loads
  useEffect(() => {
    if (user?.user) {
      setProfileForm({
        name: user.user.name || '',
        email: user.user.email || '',
      });
    }
  }, [user]);

  const onProfileChange = (field: 'name' | 'email', value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChooseAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const onSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfileSecure({
        name: profileForm.name.trim(),
        avatar: selectedAvatar || undefined,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
      setSelectedAvatar(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

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
    } catch (error: any) {
      setSecurityError(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentAvatarSrc = selectedAvatar || user?.user?.avatar;
  const originalName = user?.user?.name || '';
  const hasChanges = profileForm.name.trim() !== originalName || !!selectedAvatar;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="user" size={20} color={colors.primary} />
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Profile Information
          </Text>
        </View>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChooseAvatar} style={styles.avatarContainer}>
            {currentAvatarSrc ? (
              <Image source={{ uri: currentAvatarSrc }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <FontAwesome name="user" size={32} color={colors['primary-foreground']} />
              </View>
            )}
            <View style={[styles.avatarOverlay, { backgroundColor: colors.background }]}>
              <FontAwesome name="camera" size={16} color={colors.foreground} />
            </View>
          </TouchableOpacity>
          <Text style={[TextStyles.body.small, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
            Tap to change profile picture
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.foreground, 
                borderColor: colors.border 
              }]}
              value={profileForm.name}
              onChangeText={(value) => onProfileChange('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor={colors['muted-foreground']}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[TextStyles.body.medium, { color: colors.foreground, marginBottom: 8 }]}>
              Email Address
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.muted, 
                color: colors['muted-foreground'], 
                borderColor: colors.border 
              }]}
              value={profileForm.email}
              editable={false}
              placeholder="your.email@example.com"
              placeholderTextColor={colors['muted-foreground']}
            />
            <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], marginTop: 4 }]}>
              Email cannot be changed. Contact support if needed.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { 
              backgroundColor: hasChanges ? colors.primary : colors.muted,
              opacity: isSavingProfile ? 0.6 : 1
            }
          ]}
          onPress={onSaveProfile}
          disabled={isSavingProfile || !hasChanges}
        >
          <FontAwesome name="save" size={16} color={hasChanges ? colors['primary-foreground'] : colors['muted-foreground']} />
          <Text style={[
            TextStyles.body.medium, 
            { color: hasChanges ? colors['primary-foreground'] : colors['muted-foreground'] }
          ]}>
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Security Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="shield" size={20} color={colors.destructive} />
          <Text style={[TextStyles.heading.h2, { color: colors.foreground }]}>
            Security Settings
          </Text>
        </View>

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

        {/* Change Password Button */}
        <TouchableOpacity 
          style={[styles.changePasswordButton, { borderColor: colors.border }]}
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          <FontAwesome name="key" size={16} color={colors.foreground} />
          <Text style={[TextStyles.body.medium, { color: colors.foreground }]}>
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
});

export default AccountSettings;