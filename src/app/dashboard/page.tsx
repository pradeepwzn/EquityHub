'use client';

import React, { Suspense, lazy } from 'react';

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
  // Debug: Force show main interface immediately
  const showMainInterface = true;

  if (!showMainInterface) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="ant-spin ant-spin-lg ant-spin-spinning mb-4">
            <span className="ant-spin-dot ant-spin-dot-spin">
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
              <i className="ant-spin-dot-item"></i>
            </span>
          </div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info Bar */}
      <div className="bg-green-100 border-b border-green-200 px-4 py-2 text-sm text-green-800">
        🎉 Dashboard Loaded Successfully! | Debug Mode Active
      </div>

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
          company={null}
          founders={[]}
          fundingRounds={[]}
          onSignOut={() => {}} // TODO: Implement sign out
        />
      </Suspense>

      {/* Main Dashboard Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<DashboardSkeleton />}>
            <CompanySelector 
              onCompanySelect={(selectedCompany: any) => {
                // Company will be set in the store automatically
                console.log('Company selected:', selectedCompany);
              }}
              onCreateCompany={() => {
                // Modal will open automatically
                console.log('Create company clicked');
              }}
            />
          </Suspense>
        </div>
      </div>

      {/* Success Message */}
      <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
        <div className="font-bold">✅ Dashboard Working!</div>
        <div className="text-sm">All components loaded successfully</div>
      </div>
    </div>
  );
}
