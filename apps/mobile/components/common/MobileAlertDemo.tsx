import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text } from '@/components/Themed';
import { MobileAlertProvider, useMobileAlert } from '@/components/common/MobileAlertProvider';
import { TextStyles } from '@/constants/Fonts';

// Example component showing different ways to use the MobileAlert
function MobileAlertDemoContent() {
  const { 
    showModal, 
    showBanner, 
    showToast, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    showConfirm 
  } = useMobileAlert();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[TextStyles.heading.h2, styles.title]}>
          Professional MobileAlert System
        </Text>
        <Text style={[TextStyles.body.medium, styles.subtitle]}>
          Modern, reusable alert system with multiple types and professional design
        </Text>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Quick Methods</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => showSuccess('Operation completed successfully!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>✅ Quick Success</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => showError('Something went wrong!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>❌ Quick Error</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => showWarning('Please check your input!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚠️ Quick Warning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => showInfo('Here is some information!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ℹ️ Quick Info</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Modal Alerts</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => showModal('Information', 'This is an informational modal alert with professional styling.')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ℹ️ Info Modal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => showModal('Warning', 'This is a warning modal alert with important information.')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚠️ Warning Modal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => showModal('Success', 'Operation completed successfully!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>✅ Success Modal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => showModal('Error', 'Something went wrong. Please try again.')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>❌ Error Modal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Banner Notifications</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => showBanner('success', 'Success banner notification!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>✅ Success Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => showBanner('error', 'Error banner notification!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>❌ Error Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => showBanner('warning', 'Warning banner notification!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚠️ Warning Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => showBanner('info', 'Info banner notification!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ℹ️ Info Banner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Toast Notifications</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.purpleButton]}
            onPress={() => showToast('success', 'Toast notification!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🍞 Success Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.pinkButton]}
            onPress={() => showToast('error', 'Error toast notification!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🍞 Error Toast</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Confirmation Dialogs</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.orangeButton]}
            onPress={() => showConfirm(
              'Delete Item', 
              'Are you sure you want to delete this item? This action cannot be undone.',
              () => showSuccess('Item deleted successfully!')
            )}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🗑️ Delete Confirmation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tealButton]}
            onPress={() => showConfirm(
              'Save Changes', 
              'Do you want to save your changes before leaving?',
              () => showSuccess('Changes saved!'),
              { confirmText: 'Save', cancelText: 'Discard' }
            )}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>💾 Save Confirmation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Custom Alerts</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.indigoButton]}
            onPress={() => showBanner('info', 'Custom banner with no auto-hide!', { 
              duration: 0,
              position: 'top',
              showCloseButton: true 
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🎨 Custom Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.grayButton]}
            onPress={() => showModal('Custom Modal', 'This is a custom modal with different styling!', {
              variant: 'success',
              confirmText: 'Got it',
              cancelText: 'Close',
              showIcon: true,
              backdropOpacity: 0.3
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🎨 Custom Modal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Real-world Examples</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => {
              showSuccess('Member added successfully!');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>👥 Add Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => {
              showError('Failed to remove member. Please try again.');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>👥 Remove Member Error</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => {
              showConfirm(
                'Remove Member',
                'Are you sure you want to remove this member from the space?',
                () => showSuccess('Member removed successfully!')
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>👥 Remove Member</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => {
              showInfo('Space settings updated successfully!');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚙️ Settings Updated</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Wrap with provider for context usage
export default function MobileAlertDemo() {
  return (
    <MobileAlertProvider>
      <MobileAlertDemoContent />
    </MobileAlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#374151',
    fontWeight: '600',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Button color variants
  successButton: {
    backgroundColor: '#10B981',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  purpleButton: {
    backgroundColor: '#8B5CF6',
  },
  pinkButton: {
    backgroundColor: '#EC4899',
  },
  grayButton: {
    backgroundColor: '#6B7280',
  },
  orangeButton: {
    backgroundColor: '#F97316',
  },
  tealButton: {
    backgroundColor: '#14B8A6',
  },
  indigoButton: {
    backgroundColor: '#6366F1',
  },
});
