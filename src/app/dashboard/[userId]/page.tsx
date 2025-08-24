'use client';

import React, { Suspense, lazy, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSimulatorStore } from '@/store/simulator-store';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Company } from '@/types';

// Lazy load components
const CompanySelector = lazy(() => import('@/components/dashboard/CompanySelector'));
const PerformanceMonitor = lazy(() => import('@/components/PerformanceMonitor'));

// Loading skeleton
const UserDashboardSkeleton = () => (
  <div className="animate-pulse min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-12 bg-slate-200 rounded w-64 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

export default function UserDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params.userId as string;

  const { setCompany } = useSimulatorStore();

  // Security check: Verify user can access this dashboard
  useEffect(() => {
    if (user?.id !== userId) {
      // User doesn't match URL, redirect to their own dashboard
      router.push(`/dashboard/${user?.id || 'me'}`);
      return;
    }
  }, [user?.id, userId, router]);

  // Handle company selection
  const handleCompanySelect = (selectedCompany: Company) => {
    // Navigate to user-specific company URL
    router.push(`/dashboard/${userId}/${selectedCompany.id}?tab=company`);
  };

  // Handle company creation
  const handleCreateCompany = () => {
    // This will be handled by the CompanySelector component
  };

  // Show loading state
  if (!user || user.id !== userId) {
    return <UserDashboardSkeleton />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Performance Monitor */}
        <Suspense fallback={<div className="h-8 bg-slate-200"></div>}>
          <PerformanceMonitor />
        </Suspense>

        {/* User Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<UserDashboardSkeleton />}>
            <CompanySelector 
              onCompanySelect={handleCompanySelect}
              onCreateCompany={handleCreateCompany}
            />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}


