'use client';

import { useEffect, useState } from 'react';

export const ServiceWorkerRegistration: React.FC = () => {
  const [swStatus, setSwStatus] = useState<'idle' | 'registering' | 'registered' | 'error'>('idle');
  const [swVersion, setSwVersion] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setSwStatus('registering');
      
      // Force update by unregistering old service workers first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        return Promise.all(
          registrations.map((registration) => registration.unregister())
        );
      }).then(() => {
        // Register new service worker
        return navigator.serviceWorker.register('/sw.js');
      }).then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        setSwStatus('registered');
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
                // Force update
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

        // Get service worker version
        if (registration.active) {
          // Wait a bit for the service worker to be fully ready
          setTimeout(() => {
            try {
              // Check if the service worker is still active
              if (!registration.active || registration.active.state !== 'activated') {
                console.warn('Service Worker not ready, skipping version request');
                return;
              }
              
              const channel = new MessageChannel();
              channel.port1.onmessage = (event) => {
                if (event.data && event.data.version) {
                  setSwVersion(event.data.version);
                }
              };
              
              // Add error handling for the message channel
              channel.port1.onmessageerror = (error) => {
                console.warn('Service Worker message error:', error);
              };
              
              // Set a timeout to prevent hanging
              const timeout = setTimeout(() => {
                console.warn('Service Worker version request timed out');
                channel.port1.close();
              }, 5000);
              
              channel.port1.onmessage = (event) => {
                clearTimeout(timeout);
                if (event.data && event.data.version) {
                  setSwVersion(event.data.version);
                }
                channel.port1.close();
              };
              
              registration.active.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
            } catch (error) {
              console.warn('Failed to get Service Worker version:', error);
            }
          }, 1000); // Wait 1 second for Service Worker to be ready
        }
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
        setSwStatus('error');
      });

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      // Handle service worker errors
      navigator.serviceWorker.addEventListener('error', (error) => {
        console.error('Service Worker error:', error);
        setSwStatus('error');
      });

      // Handle service worker message errors
      navigator.serviceWorker.addEventListener('messageerror', (error) => {
        console.error('Service Worker message error:', error);
      });
    }
  }, []);

  // Don't render on server-side
  if (!isClient) {
    return null;
  }

  // Debug info in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return (
      <div className={`service-worker-debug ${swStatus === 'registered' ? 'registered' : swStatus === 'error' ? 'error' : 'registering'}`}>
        SW: {swStatus} {swVersion && `(${swVersion})`}
      </div>
    );
  }

  return null; // This component doesn't render anything in production
};


