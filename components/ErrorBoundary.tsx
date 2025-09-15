import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ErrorBoundaryState } from '../types';
import { errorUtils } from '../utils';
import { UI_CONSTANTS } from '../constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: any, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo });
    
    // Log error
    errorUtils.logError(error, 'ErrorBoundary');
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo,
          this.handleRetry
        );
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
            
            <Text style={styles.title}>Bir Hata Oluştu</Text>
            
            <Text style={styles.message}>
              {errorUtils.getErrorMessage(this.state.error)}
            </Text>
            
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={this.handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
            
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Bilgisi:</Text>
                <Text style={styles.debugText}>
                  {this.state.error.name}: {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text style={styles.debugText}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_CONSTANTS.SPACING.XL,
  },
  errorIcon: {
    marginBottom: UI_CONSTANTS.SPACING.XL,
  },
  errorIconText: {
    fontSize: 64,
  },
  title: {
    fontSize: UI_CONSTANTS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: UI_CONSTANTS.SPACING.MD,
  },
  message: {
    fontSize: UI_CONSTANTS.FONT_SIZES.MD,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: UI_CONSTANTS.SPACING.XL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MD,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: UI_CONSTANTS.SPACING.XL,
    paddingVertical: UI_CONSTANTS.SPACING.MD,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.MD,
    marginBottom: UI_CONSTANTS.SPACING.XL,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: UI_CONSTANTS.FONT_SIZES.MD,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: '#f8f9fa',
    padding: UI_CONSTANTS.SPACING.MD,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: '#dee2e6',
    width: '100%',
  },
  debugTitle: {
    fontSize: UI_CONSTANTS.FONT_SIZES.SM,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: UI_CONSTANTS.SPACING.SM,
  },
  debugText: {
    fontSize: UI_CONSTANTS.FONT_SIZES.XS,
    color: '#6c757d',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;