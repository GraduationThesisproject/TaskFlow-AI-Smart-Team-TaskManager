import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Text, View } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = 'large', 
  color, 
  text = 'Loading...', 
  fullScreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  const colors = useThemeColors();
  const spinnerColor = color || colors.primary;

  const SpinnerContent = () => (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], marginTop: 12 }]}>
          {text}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <SpinnerContent />
      </View>
    );
  }

  if (overlay) {
    return (
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.overlayContent, { backgroundColor: colors.card }]}>
          <SpinnerContent />
        </View>
      </View>
    );
  }

  return <SpinnerContent />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
