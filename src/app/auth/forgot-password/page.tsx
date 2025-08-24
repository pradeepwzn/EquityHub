'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(values.email);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <CheckCircleOutlined className="text-3xl text-blue-600" />
          </div>
          <Title level={1} className="text-3xl font-bold text-gray-900 mb-4">
            Check Your Email
          </Title>
                      <Paragraph className="text-gray-600 mb-6">
              We&apos;ve sent you a password reset link. Please check your email and follow the instructions to reset your password.
            </Paragraph>
          <Link href="/auth/login">
            <Button type="primary" size="large" className="rounded-lg">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-100 rounded-full mb-4 sm:mb-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            <MailOutlined className="text-2xl sm:text-3xl md:text-4xl text-blue-600" />
          </div>
          <Title level={1} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            Forgot Password?
          </Title>
          <Paragraph className="text-gray-600 text-sm sm:text-base">
            Enter your email address and we&apos;ll send you a link to reset your password
          </Paragraph>
        </div>

        {/* Reset Form */}
        <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 -mx-6 -mt-6 mb-6">
            <Title level={2} className="text-white mb-0 text-center">
              Reset Password
            </Title>
          </div>

          <div className="p-6">
            {error && (
              <Alert
                message="Reset Error"
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

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 text-lg font-semibold rounded-lg shadow-lg"
                >
                  Send Reset Link
                </Button>
              </Form.Item>
            </Form>

            <Divider className="my-6">
              <Text type="secondary">or</Text>
            </Divider>

            <div className="text-center">
              <Link href="/auth/login">
                <Button 
                  type="default" 
                  size="large"
                  icon={<ArrowLeftOutlined />}
                  className="w-full h-12 rounded-lg border-2 border-blue-200 text-blue-600 hover:border-blue-300 hover:text-blue-700"
                >
                  Back to Login
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
