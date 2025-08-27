'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '@/contexts/AuthContext';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <AuthProvider>
      <ConfigProvider>
        {children}
        {isClient && (
          <>
            <PerformanceMonitor />
            <ServiceWorkerRegistration />
          </>
        )}
      </ConfigProvider>
    </AuthProvider>
  );
}

