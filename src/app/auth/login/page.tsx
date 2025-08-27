'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Divider, Tag } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { AuthErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { users, fetchAllUsers } = useUserStore();
  const router = useRouter();
  const { handleAuthError, handleNetworkError } = useErrorHandler();

  useEffect(() => {
    fetchAllUsers().catch((err) => {
      console.error('Failed to fetch users:', err);
      handleNetworkError(err);
    });
  }, [fetchAllUsers, handleNetworkError]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      // Immediate feedback - show loading state
      console.log('Starting sign in process...');
      
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        console.log('Sign in successful, redirecting...');
        // Use push instead of replace for faster navigation
        router.push('/dashboard');
        // Keep loading state until redirect completes
      }
    } catch (err) {
      console.error('Sign in error:', err);
      handleAuthError(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-100 rounded-full mb-4 sm:mb-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <UserOutlined className="text-2xl sm:text-3xl md:text-4xl text-blue-600" />
          </div>
          <Title level={1} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            Welcome Back
          </Title>
          <Paragraph className="text-gray-600 text-sm sm:text-base">
            Sign in to your Startup Value Simulator account
          </Paragraph>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 -mx-6 -mt-6 mb-6">
            <Title level={2} className="text-white mb-0 text-center">
              Sign In
            </Title>
          </div>

          <div className="p-6">
            {error && (
              <Alert
                message="Login Error"
                description={error}
                type="error"
                showIcon
                className="mb-6"
              />
            )}

            {/* Available Users for Testing */}
            {users.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="text-blue-800 font-semibold block mb-2">
                  Available Users for Testing:
                </Text>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <Text className="text-blue-700">{user.email}</Text>
                        <Text className="text-blue-500 text-sm ml-2">({user.username})</Text>
                      </div>
                      <Tag 
                        color="blue" 
                        className="cursor-pointer"
                        onClick={() => {
                          const form = document.querySelector('form');
                          if (form) {
                            const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
                            if (emailInput) {
                              emailInput.value = user.email;
                              emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                          }
                        }}
                      >
                        Use
                      </Tag>
                    </div>
                  ))}
                </div>
                <Text className="text-blue-600 text-xs mt-2 block">
                  Click "Use" to auto-fill email, or enter any email from the list above.
                </Text>
              </div>
            )}

            <Form
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                label={<span className="font-semibold text-gray-700">Email Address</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Enter your email"
                  className="rounded-lg"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700">Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter your password"
                  className="rounded-lg"
                  autoComplete="current-password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <div className="flex justify-between items-center">
                  <Link 
                    href="/auth/forgot-password"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 text-lg font-semibold rounded-lg shadow-lg"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                {loading && (
                  <div className="text-center mt-2">
                    <Text className="text-blue-600 text-sm">
                      Authenticating and redirecting...
                    </Text>
                  </div>
                )}
              </Form.Item>
            </Form>

            <Divider className="my-6">
              <Text type="secondary">or</Text>
            </Divider>

            <div className="text-center">
              <Text type="secondary" className="block mb-2">
                Don&apos;t have an account?
              </Text>
              <Link href="/auth/signup">
                <Button 
                  type="default" 
                  size="large"
                  className="w-full h-12 rounded-lg border-2 border-blue-200 text-blue-600 hover:border-blue-300 hover:text-blue-700"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Text type="secondary" className="text-sm">
            © 2024 Startup Value Simulator. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthErrorBoundary>
      <LoginPageContent />
    </AuthErrorBoundary>
  );
}
