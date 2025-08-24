'use client';

import React, { Suspense, lazy, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCompany, useFounders, useFundingRounds, useScenarios, useIsLoading } from '@/hooks/useSimulatorStoreOptimized';
// import { useMemoryOptimization } from '@/hooks/useMemoryOptimization';

import { usePerformanceMonitor } from '@/hooks/usePerformance';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load dashboard components
const DashboardHeader = lazy(() => import('@/components/dashboard/DashboardHeader'));
const DashboardTabs = lazy(() => import('@/components/dashboard/DashboardTabs'));
const PerformanceMonitor = lazy(() => import('@/components/PerformanceMonitor'));
const CompanySelector = lazy(() => import('@/components/dashboard/CompanySelector'));

// Loading skeleton
const DashboardSkeleton = () => (
  <div className="animate-pulse min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="flex space-x-4">
            <div className="h-8 bg-slate-200 rounded w-24"></div>
            <div className="h-8 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Main content skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect to user-specific dashboard
  useEffect(() => {
    if (user?.id) {
      router.push(`/dashboard/${user.id}`);
    }
  }, [user?.id, router]);

  // Memory optimization - temporarily disabled
  // const { addCleanup, cleanupMemory, isMemoryPressure } = useMemoryOptimization({
  //   maxCacheSize: 50,
  //   cleanupInterval: 20000, // 20 seconds
  //   enableGarbageCollection: true
  // });

  // Performance monitoring
  const { metrics } = usePerformanceMonitor();
  const { renderTime, memoryUsage, componentCount } = metrics;

  // Simulator store with optimization
  const company = useCompany();
  const founders = useFounders();
  const fundingRounds = useFundingRounds();
  const scenarios = useScenarios();
  const isLoading = useIsLoading();

  // Check if Supabase is configured
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

  // Show loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error if Supabase is not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Configuration Error
            </h1>
            <p className="text-gray-600 mb-6">
              Supabase configuration is missing. Please check your environment variables.
            </p>
            <div className="bg-gray-100 p-4 rounded text-sm text-gray-700 font-mono">
              NEXT_PUBLIC_SUPABASE_URL<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Performance Monitor */}
        <Suspense fallback={<div className="h-8 bg-slate-200"></div>}>
          <PerformanceMonitor />
        </Suspense>

        {/* Dashboard Header */}
        <Suspense fallback={
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="h-8 bg-slate-200 rounded w-48"></div>
            </div>
          </div>
        }>
          <DashboardHeader 
            company={company}
            founders={founders}
            fundingRounds={fundingRounds}
            onSignOut={() => {}} // TODO: Implement sign out
          />
        </Suspense>

        {/* Main Dashboard Content */}
        <div className="w-full">
          {!company ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Suspense fallback={<DashboardSkeleton />}>
                <CompanySelector 
                  onCompanySelect={(selectedCompany: any) => {
                    // Company will be set in the store automatically
                  }}
                  onCreateCompany={() => {
                    // Modal will open automatically
                  }}
                />
              </Suspense>
            </div>
          ) : (
            <div className="w-full">
              <Suspense fallback={<DashboardSkeleton />}>
                <DashboardTabs 
                  activeTab="company"
                  company={company}
                  founders={founders}
                  fundingRounds={fundingRounds}
                  exitResults={null}
                  scenarios={scenarios}
                  onTabChange={() => {}}
                  onCompanySubmit={() => {}}
                  onFounderSubmit={() => {}}
                  onRoundSubmit={() => {}}
                  onUpdateAndRecalculate={() => {}}
                  onRemoveFounder={() => {}}
                  onRemoveFundingRound={() => {}}
                  onSetExitValue={() => {}}
                  onSetESOPAllocation={() => {}}
                />
              </Suspense>
            </div>
          )}
        </div>

        {/* Memory Usage Indicator (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
            <div>Memory: {memoryUsage?.toFixed(1)}%</div>
            <div>Render: {renderTime?.toFixed(1)}ms</div>
            <div>Components: {componentCount}</div>
            {/* {isMemoryPressure && (
              <div className="text-red-400 font-bold">⚠️ Memory Pressure</div>
            )} */}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
