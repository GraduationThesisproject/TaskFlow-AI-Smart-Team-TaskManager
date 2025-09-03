import React, { Component, ErrorInfo, ReactNode } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Card, Button, ButtonText, View, ScrollView } from '../Themed';
import { useThemeColors } from '../ThemeProvider';
import { TextStyles } from '@/constants/Fonts';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    // In a real app, you would send this to your error reporting service
    console.log('Reporting error:', this.state.error);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} onRetry={this.handleRetry} onReport={this.handleReportError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onRetry: () => void;
  onReport: () => void;
}

function ErrorFallback({ error, errorInfo, onRetry, onReport }: ErrorFallbackProps) {
  const colors = useThemeColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Text style={[TextStyles.heading.h1, { color: colors.foreground, textAlign: 'center' }]}>
          😱 Oops! Something went wrong
        </Text>
        
        <Text style={[TextStyles.body.medium, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 8 }]}>
          We encountered an unexpected error. Don't worry, your data is safe.
        </Text>

        {error && (
          <View style={styles.errorSection}>
            <Text style={[TextStyles.heading.h3, { color: colors.foreground }]}>
              Error Details
            </Text>
            <Text style={[TextStyles.body.small, { color: colors.error, fontFamily: 'JetBrainsMono-VariableFont_wght' }]}>
              {error.message}
            </Text>
            {error.stack && (
              <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], fontFamily: 'JetBrainsMono-VariableFont_wght' }]}>
                {error.stack}
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button onPress={onRetry} style={styles.button}>
            <ButtonText>Try Again</ButtonText>
          </Button>
          
          <Button onPress={onReport} variant="secondary" style={styles.button}>
            <ButtonText variant="secondary">Report Issue</ButtonText>
          </Button>
        </View>

        <Text style={[TextStyles.caption.small, { color: colors['muted-foreground'], textAlign: 'center', marginTop: 16 }]}>
          If this problem persists, please contact support
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
