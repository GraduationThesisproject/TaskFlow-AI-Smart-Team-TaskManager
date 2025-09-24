import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text } from '@/components/Themed';
import { Banner, BannerProvider, useBanner } from './BannerProvider';
import { TextStyles } from '@/constants/Fonts';

// Example component showing different ways to use the Banner
function BannerExampleContent() {
  const { 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo, 
    showBanner,
    showBannerWithTitle,
    showBannerWithAction 
  } = useBanner();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[TextStyles.heading.h2, styles.title]}>
          Professional Banner Examples
        </Text>
        <Text style={[TextStyles.body.medium, styles.subtitle]}>
          Explore different banner types and configurations
        </Text>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Basic Banners</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => showSuccess('Operation completed successfully!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>✓ Success Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => showError('Something went wrong!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>✕ Error Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => showWarning('Please check your input!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚠ Warning Banner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => showInfo('Here is some information!')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>ℹ Info Banner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Advanced Banners</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.purpleButton]}
            onPress={() => showBannerWithTitle('success', 'Welcome!', 'You have successfully logged in to your account.')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>📋 Banner with Title</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.pinkButton]}
            onPress={() => showBannerWithAction('warning', 'Update available!', 'Update', () => {
              showSuccess('Update started!');
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🔧 Banner with Action</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.grayButton]}
            onPress={() => showBanner({
              type: 'info',
              message: 'Custom banner with no auto-hide!',
              duration: 0,
              position: 'top',
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⏰ No Auto-Hide (Top)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.orangeButton]}
            onPress={() => showBanner({
              type: 'success',
              message: 'Click anywhere on this banner!',
              onPress: () => {
                showSuccess('Banner was clicked!');
              },
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>👆 Clickable Banner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Custom Animations</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.tealButton]}
            onPress={() => showBanner({
              type: 'info',
              message: 'Fast animation banner!',
              animationDuration: 200,
              duration: 2000,
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚡ Fast Animation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.indigoButton]}
            onPress={() => showBanner({
              type: 'success',
              message: 'Slow animation banner!',
              animationDuration: 800,
              duration: 5000,
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>🐌 Slow Animation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Example of using Banner directly (without provider)
function DirectBannerExample() {
  const [showBanner, setShowBanner] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={[TextStyles.heading.h4, styles.sectionTitle]}>Direct Usage</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.grayButton]}
        onPress={() => setShowBanner(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>🎯 Show Direct Banner</Text>
      </TouchableOpacity>

      <Banner
        visible={showBanner}
        type="info"
        title="Direct Usage"
        message="This is a direct banner usage example with custom styling!"
        onClose={() => setShowBanner(false)}
        duration={3000}
        animationDuration={500}
      />
    </View>
  );
}

export { BannerExampleContent, DirectBannerExample };

// Wrap with provider for context usage
export default function BannerExample() {
  return (
    <BannerProvider>
      <BannerExampleContent />
    </BannerProvider>
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
