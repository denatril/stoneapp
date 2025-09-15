import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { AppError } from '../types';
import { errorUtils } from '../utils';

export interface UseErrorHandlerReturn {
  error: AppError | null;
  isLoading: boolean;
  showError: (error: any, context?: string) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>, context?: string) => Promise<T | null>;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => (...args: T) => Promise<R | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showError = useCallback((error: any, context?: string) => {
    const appError = errorUtils.createError(
      error?.code || 'UNKNOWN_ERROR',
      errorUtils.getErrorMessage(error),
      error
    );
    
    setError(appError);
    errorUtils.logError(error, context);
    
    // Show alert for critical errors
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'STORAGE_ERROR') {
      Alert.alert(
        'Hata',
        appError.message,
        [{ text: 'Tamam', onPress: () => setError(null) }]
      );
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (error) {
      showError(error, context);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
  ) => {
    return async (...args: T): Promise<R | null> => {
      return handleAsyncError(() => fn(...args), context);
    };
  }, [handleAsyncError]);

  return {
    error,
    isLoading,
    showError,
    clearError,
    handleAsyncError,
    withErrorHandling,
  };
};