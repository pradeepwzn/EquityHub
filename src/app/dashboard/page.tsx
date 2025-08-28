'use client';

import React, { Suspense, lazy, useState } from 'react';
import { useCompanyStore } from '@/store/company-store';
import CompanyManagement from '@/components/company/CompanyManagement';
import FounderManagement from '@/components/founder/FounderManagement';

// Lazy load dashboard components
const DashboardHeader = lazy(() => import('@/components/dashboard/DashboardHeader'));
const DashboardTabs = lazy(() => import('@/components/dashboard/DashboardTabs'));
const PerformanceMonitor = lazy(() => import('@/components/PerformanceMonitor'));

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
  const { currentCompany } = useCompanyStore();
  const [showCompanyManagement, setShowCompanyManagement] = useState(false);
  const [showFounderManagement, setShowFounderManagement] = useState(false);

  const handleCompanySelected = (company: any) => {
    // Company is now selected in the store
    console.log('Company selected:', company);
    setShowCompanyManagement(false);
  };

  const handleBackToCompanyManagement = () => {
    setShowCompanyManagement(true);
    setShowFounderManagement(false);
  };

  const handleBackToMainDashboard = () => {
    setShowCompanyManagement(false);
    setShowFounderManagement(false);
  };

  // Show company management if no company is selected or if user wants to manage companies
  if (showCompanyManagement || !currentCompany) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Performance Monitor */}
        <Suspense fallback={<div className="h-8 bg-slate-200"></div>}>
          <PerformanceMonitor />
        </Suspense>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CompanyManagement
            onCompanySelected={handleCompanySelected}
            onBack={currentCompany ? handleBackToCompanyManagement : undefined}
          />
        </div>

        {/* Success Message */}
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          <div className="font-bold">✅ Module 2 Active!</div>
          <div className="text-sm">Company Management System</div>
        </div>
      </div>
    );
  }

  // Show founder management if user wants to manage founders
  if (showFounderManagement) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Performance Monitor */}
        <Suspense fallback={<div className="h-8 bg-slate-200"></div>}>
          <PerformanceMonitor />
        </Suspense>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FounderManagement
            onBack={handleBackToMainDashboard}
          />
        </div>
      </div>
    );
  }

  // Show main dashboard when company is selected
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
          company={currentCompany}
          founders={[]}
          fundingRounds={[]}
          onSignOut={() => {}} // TODO: Implement sign out
        />
      </Suspense>

      {/* Management Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => setShowCompanyManagement(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Companies
        </button>
        
        <button
          onClick={() => setShowFounderManagement(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          Manage Founders
        </button>
      </div>

      {/* Main Dashboard Content */}
      <div className="w-full">
        <div className="w-full">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardTabs 
              activeTab="company"
              company={currentCompany}
              founders={[]}
              fundingRounds={[]}
              exitResults={null}
              scenarios={[]}
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
      </div>

      {/* Module Status */}
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg text-sm">
        <div className="font-bold">👥 Module 3 Active</div>
        <div>Company: {currentCompany.name}</div>
        <div>Status: Founder Management Ready</div>
      </div>
    </div>
  );
}
