import React, { Component } from 'react';
import { Typography, Button, Card, CardContent } from '@taskflow/ui';
import {env} from '../../config/env';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorBoundaryWrapperProps } from '../../types/interfaces/ui';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <Typography variant="h3" className="mb-4 text-destructive">
                Something went wrong
              </Typography>
              <Typography variant="body-medium" textColor="muted" className="mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </Typography>
              
              {/* Error details in development */}
              {env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                  <Typography variant="body-small" className="font-mono text-destructive">
                    {this.state.error.message}
                  </Typography>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Component Stack</summary>
                      <pre className="text-xs mt-2 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleRetry} variant="default">
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  fallback,
  name 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console with component name if provided
    const componentName = name || 'Unknown Component';
    console.error(`Error in ${componentName}:`, error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    // like Sentry, LogRocket, etc.
  };

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};