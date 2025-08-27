'use client';

import React, { Suspense } from 'react';
import { Button } from 'antd';
import { RocketOutlined, CalculatorOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';

// Loading skeleton components
const HeroSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-center mb-8">
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-slate-200 rounded-full"></div>
    </div>
    <div className="h-12 sm:h-16 md:h-20 lg:h-24 bg-slate-200 rounded mb-4 sm:mb-6 max-w-4xl mx-auto"></div>
    <div className="h-6 sm:h-8 md:h-10 bg-slate-200 rounded mb-6 sm:mb-8 max-w-3xl mx-auto"></div>
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
      <div className="h-10 sm:h-12 bg-slate-200 rounded w-full sm:w-48"></div>
      <div className="h-10 sm:h-12 bg-slate-200 rounded w-full sm:w-32"></div>
    </div>
  </div>
);

const FeatureSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 sm:h-10 md:h-12 bg-slate-200 rounded mb-3 sm:mb-4 max-w-2xl mx-auto"></div>
    <div className="h-5 sm:h-6 bg-slate-200 rounded mb-8 max-w-xl mx-auto"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center p-6 sm:p-8">
          <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-slate-200 rounded-full mx-auto mb-4 sm:mb-6"></div>
          <div className="h-6 sm:h-7 bg-slate-200 rounded mb-3 sm:mb-4 max-w-32 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded max-w-48 mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);

const HowItWorksSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-10 sm:h-12 md:h-14 bg-slate-200 rounded mb-4 max-w-2xl mx-auto"></div>
    <div className="h-6 bg-slate-200 rounded mb-16 max-w-xl mx-auto"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-slate-200 rounded mb-3 max-w-32 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded max-w-48 mx-auto"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Startup Value Simulator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Model your startup's valuation, funding rounds, and exit scenarios with precision.
          Track founder equity, investor returns, and ESOP allocations in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl border-2 border-blue-600"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Setup</h3>
            <p className="text-gray-600">Configure your startup's structure, shares, and valuation</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Founder Management</h3>
            <p className="text-gray-600">Track founder equity and ownership changes over time</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Funding Scenarios</h3>
            <p className="text-gray-600">Model different funding rounds and their impact on ownership</p>
          </div>
        </div>
      </div>
    </div>
  );
}
