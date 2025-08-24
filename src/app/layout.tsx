import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientProviders from '@/components/ClientProviders';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Startup Value Simulator',
  description: 'Professional Cap Table & Exit Scenario Calculator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientProviders>
            {children}
            <PerformanceMonitor />
            <ServiceWorkerRegistration />
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
