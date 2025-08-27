'use client';

import { useCallback } from 'react';

export function useErrorHandler() {
  const handleError = useCallback((error: Error) => {
    console.error('Error handled:', error);
    // Don't throw errors, just log them
  }, []);

  const handleAsyncError = useCallback((error: Error) => {
    console.error('Async error caught:', error);
    // Don't re-throw errors
  }, []);

  const handlePromiseRejection = useCallback((promise: Promise<any>) => {
    promise.catch(handleAsyncError);
  }, [handleAsyncError]);

  const handleApiError = useCallback((error: any, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
    
    // Log the error but don't throw it
    console.error('API Error details:', {
      message: error?.message,
      response: error?.response?.data?.message,
      context
    });
  }, []);

  const handleAuthError = useCallback((error: any) => {
    console.error('Authentication error:', error);
    
    // Log the error but don't throw it
    console.error('Authentication Error details:', {
      message: error?.message,
      type: 'authentication'
    });
  }, []);

  const handleNetworkError = useCallback((error: any) => {
    console.error('Network error:', error);
    
    // Log the error but don't throw it
    console.error('Network Error details:', {
      message: 'Network connection failed. Please check your internet connection and try again.',
      originalError: error
    });
  }, []);

  return {
    handleError,
    handleAsyncError,
    handlePromiseRejection,
    handleApiError,
    handleAuthError,
    handleNetworkError,
  };
}

// Hook for handling errors in async operations
export function useAsyncErrorHandler() {
  const { handleAsyncError, handlePromiseRejection } = useErrorHandler();

  const safeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorContext?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      console.error(`Async operation failed${errorContext ? ` in ${errorContext}` : ''}:`, error);
      // Don't re-throw errors, just return null
      return null;
    }
  }, []);

  const safePromise = useCallback((promise: Promise<any>) => {
    handlePromiseRejection(promise);
    return promise;
  }, [handlePromiseRejection]);

  return {
    safeAsync,
    safePromise,
  };
}
