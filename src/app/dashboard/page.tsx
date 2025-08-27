'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorHandler } from '@/hooks/useErrorHandler';



function DashboardPageContent() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { handleError } = useErrorHandler();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to user-specific dashboard
  useEffect(() => {
    if (isRedirecting) return; // Prevent multiple redirects
    
    try {
      if (user?.id) {
        console.log('User authenticated, redirecting to dashboard:', user.id);
        setIsRedirecting(true);
        // Use replace to prevent back button issues and avoid loops
        router.replace(`/dashboard/${user.id}`);
      } else if (!loading) {
        console.log('No user found, redirecting to login');
        setIsRedirecting(true);
        // If no user and not loading, redirect to login
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Error in dashboard redirect:', error);
      handleError(error as Error);
      setIsRedirecting(false);
    }
  }, [user?.id, loading, router, handleError, isRedirecting]);

  // Memory optimization - temporarily disabled
  // const { addCleanup, cleanupMemory, isMemoryPressure } = useMemoryOptimization({
  //   maxCacheSize: 50,
  //   cleanupInterval: 20000, // 20 seconds
  //   enableGarbageCollection: true
  // });



  // Check if Supabase is configured (optional for development)
  const isSupabaseConfigured = useMemo(() => {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);



  // Memory cleanup on component unmount - temporarily disabled
  // React.useEffect(() => {
  //   const cleanup = () => {
  //     cleanupMemory();
  //   };

  //   addCleanup(cleanup);

  //   return () => {
  //     cleanup();
  //   };
  // }, [addCleanup, cleanupMemory]);

  // Aggressive cleanup when memory pressure is high - temporarily disabled
  // React.useEffect(() => {
  //   if (isMemoryPressure) {
  //     cleanupMemory();
      
  //     // Force garbage collection if available
  //     if ('gc' in window) {
  //       try {
  //         (window as any).gc();
  //       } catch (error) {
  //         // GC not available
  //       }
  //     }
  //   }
  // }, [isMemoryPressure, cleanupMemory]);



  // Show warning if Supabase is not configured (but don't block the app)
  if (!isSupabaseConfigured && process.env.NODE_ENV === 'development') {
    console.warn('Supabase not configured - using mock data');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Dashboard Content for Testing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-4">Welcome to your dashboard!</p>
          
          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                ✅ Logged in as: <strong>{user.email}</strong>
              </p>
              <p className="text-green-700 text-sm mt-1">
                User ID: {user.id}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                ⚠️ No user logged in
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={async () => {
                await signOut();
                window.location.href = '/auth/login';
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardPageContent />
    </DashboardErrorBoundary>
  );
}
