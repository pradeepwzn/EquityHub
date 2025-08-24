'use client';

import { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '@/contexts/AuthContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <ConfigProvider>
        {children}
      </ConfigProvider>
    </AuthProvider>
  );
}

