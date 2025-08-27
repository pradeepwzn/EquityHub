'use client';

import React, { Suspense, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCompany, useFounders, useFundingRounds, useScenarios, useIsLoading } from '@/hooks/useSimulatorStoreOptimized';
// import { useMemoryOptimization } from '@/hooks/useMemoryOptimization';

import { usePerformanceMonitor } from '@/hooks/usePerformance';
import { useSimulatorStore } from '@/store/simulator-store';
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types';

// Import dashboard components directly to fix webpack loading issues
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import PerformanceMonitor from '@/components/PerformanceMonitor';

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

export default function UserCompanyDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const userId = params.userId as string;
  const companyId = params.companyId as string;
  const activeTab = searchParams.get('tab') || 'company';

  // Memory optimization - temporarily disabled
  // const { addCleanup, cleanupMemory, isMemoryPressure } = useMemoryOptimization({
  //   maxCacheSize: 50,
  //   cleanupInterval: 20000,
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
  
  const { setCompany, clearCompany, loadUserCompanies } = useSimulatorStore();

  // Security check: Verify user owns this company
  useEffect(() => {
    if (user?.id !== userId) {
      // User doesn't match URL, redirect to their own dashboard
      router.push(`/dashboard/${user?.id || 'me'}`);
      return;
    }
  }, [user?.id, userId]); // Removed router from dependencies

  // Load specific company data for this user
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!userId || !companyId) return;

      try {
        // Load user's companies from API
        const response = await fetch('/api/protected/companies');
        if (!response.ok) {
          throw new Error('Failed to load companies');
        }
        
        const companies = await response.json();
        const selectedCompany = companies.find((c: Company) => c.id === companyId && c.user_id === userId);
        
        if (selectedCompany) {
          setCompany(selectedCompany);
        } else {
          // Company not found or doesn't belong to user, redirect to user's company selector
          router.push(`/dashboard/${userId}`);
        }
      } catch (error) {
        console.error('Error loading company data:', error);
        // Fallback to mock data for development
        const mockCompanies: Company[] = [
          {
            id: '1',
            name: 'TechStart Inc.',
            total_shares: 10000000,
            valuation: 5000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId
          },
          {
            id: '2',
            name: 'InnovateCorp',
            total_shares: 5000000,
            valuation: 2000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId
          },
          {
            id: '3',
            name: 'StartupX',
            total_shares: 8000000,
            valuation: 3000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: userId
          }
        ];

        const selectedCompany = mockCompanies.find(c => c.id === companyId && c.user_id === userId);
        if (selectedCompany) {
          setCompany(selectedCompany);
        } else {
          router.push(`/dashboard/${userId}`);
        }
      }
    };

    if (userId && companyId && user?.id === userId) {
      loadCompanyData();
    }
  }, [userId, companyId, user?.id, setCompany]); // Removed router from dependencies

  // Handle tab changes with URL updates
  const handleTabChange = (newTab: string) => {
    const url = `/dashboard/${userId}/${companyId}?tab=${newTab}`;
    router.push(url);
  };

  // Handle sign out
  const handleSignOut = () => {
    // Clear company data and redirect to login
    clearCompany();
    router.push('/auth/login');
  };

  // Memory cleanup on component unmount - temporarily disabled
  // useEffect(() => {
  //   const cleanup = () => {
  //     cleanupMemory();
  //   };

  //   addCleanup(cleanup);

  //   return () => {
  //     cleanup();
  //   };
  // }, [addCleanup, cleanupMemory]);

  // Aggressive cleanup when memory pressure is high - temporarily disabled
  // useEffect(() => {
  //   if (isMemoryPressure) {
  //     cleanupMemory();
      
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
  if (isLoading || !company) {
    return <DashboardSkeleton />;
  }

  // Verify company matches URL and belongs to user
  if (company.id !== companyId || company.user_id !== userId) {
    return <DashboardSkeleton />;
  }

  return (
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
            onSignOut={handleSignOut}
          />
        </Suspense>

        {/* Main Dashboard Content */}
        <div className="w-full">
          <div className="w-full">
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardTabs 
                activeTab={activeTab}
                company={company}
                founders={founders}
                fundingRounds={fundingRounds}
                exitResults={null}
                scenarios={scenarios}
                onTabChange={handleTabChange}
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
        </div>

        {/* Memory Usage Indicator (only in development) */}
        {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-sm">
            <div>User: {userId}</div>
            <div>Company: {company.name}</div>
            <div>ID: {companyId}</div>
            <div>Tab: {activeTab}</div>
            <div>Memory: {memoryUsage?.toFixed(1)}%</div>
            <div>Render: {renderTime?.toFixed(1)}ms</div>
            <div>Components: {componentCount}</div>
            {/* {isMemoryPressure && (
              <div className="text-red-400 font-bold">⚠️ Memory Pressure</div>
            )} */}
          </div>
        )}
      </div>
  );
}

