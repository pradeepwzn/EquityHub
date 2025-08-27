'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button, Card, Typography, Alert } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <BugOutlined className="text-6xl text-red-500 mb-4" />
            <Title level={2} className="text-red-600 mb-2">
              Oops! Something went wrong
            </Title>
            <Paragraph className="text-gray-600 mb-6">
              We encountered an unexpected error. Don't worry, this has been logged and we'll look into it.
            </Paragraph>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <Alert
              message="Development Error Details"
              description={
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Click to view error details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                  </pre>
                </details>
              }
              type="error"
              className="mb-4 text-left"
            />
          )}

          <div className="space-y-3">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={resetErrorBoundary}
              size="large"
              className="w-full"
            >
              Try Again
            </Button>
            
            <Button
              icon={<HomeOutlined />}
              onClick={() => window.location.href = '/'}
              size="large"
              className="w-full"
            >
              Go to Home
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <Text className="text-gray-500 text-sm">
              If this problem persists, please contact support.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Error Logger
function logErrorToService(error: Error, errorInfo: { componentStack: string }) {
  console.error('Error Boundary caught an error:', error, errorInfo);
  
  // In a real app, you would send this to your error reporting service
  // Example: Sentry.captureException(error, { extra: errorInfo });
  
  // For now, just log to console
  if (process.env.NODE_ENV === 'production') {
    // In production, you might want to send to an error tracking service
    console.error('Production error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }
}

// Main Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

export function ErrorBoundary({ 
  children, 
  fallback = ErrorFallback,
  onError = logErrorToService 
}: ErrorBoundaryProps) {
    return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={onError}
      onReset={() => {
        // Clear any error state and reload the page
                window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Specific Error Boundaries for different parts of the app

export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  const DashboardErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <BugOutlined className="text-5xl text-red-500 mb-4" />
            <Title level={3} className="text-red-600 mb-2">
              Dashboard Error
            </Title>
            <Paragraph className="text-gray-600 mb-6">
              There was a problem loading the dashboard. Your data is safe, but we need to reload the page.
            </Paragraph>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <Alert
              message="Error Details"
              description={error.message}
              type="error"
              className="mb-4 text-left"
            />
          )}

          <div className="space-y-3">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={resetErrorBoundary}
              size="large"
              className="w-full"
            >
              Reload Dashboard
            </Button>
            
            <Button
              icon={<HomeOutlined />}
              onClick={() => window.location.href = '/dashboard'}
              size="large"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Card>
      </div>
    );

  return (
    <ReactErrorBoundary
      FallbackComponent={DashboardErrorFallback}
      onError={logErrorToService}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundary;