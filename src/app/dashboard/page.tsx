'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CompaniesList from '@/components/dashboard/CompaniesList';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Startup Value Simulator</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.username || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">User ID: {user.id}</span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Companies</h2>
            <p className="mt-2 text-gray-600">
              View and manage your startup companies below.
            </p>
          </div>
          
          {/* Companies List for the logged-in user */}
          <div className="bg-white shadow rounded-lg">
            <CompaniesList userId={user.id} />
          </div>

          {/* Debug Info */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
