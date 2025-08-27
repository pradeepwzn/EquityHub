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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Suspense fallback={<HeroSkeleton />}>
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <RocketOutlined className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Startup Value
                <span className="text-blue-600"> Simulator</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                Model your startup&apos;s cap table, funding rounds, and exit scenarios with our comprehensive financial modeling tool.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button type="primary" size="large" className="h-10 sm:h-12 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="large" className="h-10 sm:h-12 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </Suspense>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<FeatureSkeleton />}>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                Everything You Need to Model Your Startup
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                From initial cap table setup to complex exit scenario modeling, our platform provides the tools you need.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CalculatorOutlined className="text-xl sm:text-2xl md:text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Cap Table Management</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Easily manage your startup&apos;s ownership structure, track founder equity, and model dilution effects.
                </p>
              </div>
              
              <div className="text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <RiseOutlined className="text-xl sm:text-2xl md:text-3xl text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Funding Round Modeling</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Model multiple funding rounds, calculate post-money valuations, and understand equity distribution.
                </p>
              </div>
              
              <div className="text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <TeamOutlined className="text-xl sm:text-2xl md:text-3xl text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Exit Scenario Planning</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Plan for various exit scenarios, model founder returns, and understand investor outcomes.
                </p>
              </div>
            </div>
          </Suspense>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<HowItWorksSkeleton />}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started in minutes with our simple three-step process
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Company</h3>
                <p className="text-gray-600">
                  Set up your startup profile with basic information and initial cap table structure.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Add Founders & Investors</h3>
                <p className="text-gray-600">
                  Input founder equity, funding rounds, and investor details to build your cap table.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Model Scenarios</h3>
                <p className="text-gray-600">
                  Run different exit scenarios to understand potential returns and equity distribution.
                </p>
              </div>
            </div>
          </Suspense>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Modeling Your Startup?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of entrepreneurs who are using our platform to make informed decisions about their startup&apos;s future.
          </p>
          <Link href="/auth/signup">
            <Button type="primary" size="large" className="h-12 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 border-white">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
