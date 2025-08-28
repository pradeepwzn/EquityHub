'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function UserCompanyDashboardPage() {
  const params = useParams();
  const userId = params.userId as string;
  const companyId = params.companyId as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Company Dashboard</h1>
          <p className="text-gray-600">User ID: {userId}</p>
          <p className="text-gray-600">Company ID: {companyId}</p>
          <p className="text-gray-500 text-sm mt-2">This is a simplified company dashboard</p>
        </div>
      </div>
    </div>
  );
}

