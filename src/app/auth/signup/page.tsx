'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Divider, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const onFinish = async (values: { username: string; email: string; password: string; confirmPassword: string; agreeToTerms: boolean }) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!values.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await signUp(values.email, values.password, values.username);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircleOutlined className="text-3xl text-green-600" />
          </div>
          <Title level={1} className="text-3xl font-bold text-gray-900 mb-4">
            Account Created Successfully!
          </Title>
          <Paragraph className="text-gray-600 mb-6">
            Please check your email to verify your account before signing in.
          </Paragraph>
          <Link href="/auth/login">
            <Button type="primary" size="large" className="rounded-lg">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full mb-4 sm:mb-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <UserOutlined className="text-2xl sm:text-3xl md:text-4xl text-green-600" />
          </div>
          <Title level={1} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            Create Account
          </Title>
          <Paragraph className="text-gray-600 text-sm sm:text-base">
            Join Startup Value Simulator and start modeling your startup&apos;s future
          </Paragraph>
        </div>

        {/* Signup Form */}
        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 -mx-6 -mt-6 mb-6">
            <Title level={2} className="text-white mb-0 text-center">
              Sign Up
            </Title>
          </div>

          <div className="p-6">
            {error && (
              <Alert
                message="Signup Error"
                description={error}
                type="error"
                showIcon
                className="mb-6"
              />
            )}

            <Form
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                label={<span className="font-semibold text-gray-700">Username</span>}
                name="username"
                rules={[
                  { required: true, message: 'Please enter a username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' },
                  { max: 20, message: 'Username must be less than 20 characters!' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Choose a username"
                  className="rounded-lg"
                />
              </Form.Item>

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
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700">Password</span>}
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 8, message: 'Password must be at least 8 characters!' }
                ]}
                extra="Password must be at least 8 characters long"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Create a password"
                  className="rounded-lg"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700">Confirm Password</span>}
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Confirm your password"
                  className="rounded-lg"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="agreeToTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('Please agree to the terms and conditions')),
                  },
                ]}
              >
                <Checkbox className="text-sm">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                    Privacy Policy
                  </Link>
                </Checkbox>
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 text-lg font-semibold rounded-lg shadow-lg"
                >
                  Create Account
                </Button>
              </Form.Item>
            </Form>

            <Divider className="my-6">
              <Text type="secondary">or</Text>
            </Divider>

            <div className="text-center">
              <Text type="secondary" className="block mb-2">
                Already have an account?
              </Text>
              <Link href="/auth/login">
                <Button 
                  type="default" 
                  size="large"
                  className="w-full h-12 rounded-lg border-2 border-green-200 text-green-600 hover:border-green-300 hover:text-green-700"
                >
                  Sign In
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
