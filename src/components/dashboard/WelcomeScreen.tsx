'use client';

import React from 'react';

interface WelcomeScreenProps {
  onCreateCompany: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({ onCreateCompany }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8 sm:p-12 lg:p-16 text-center max-w-3xl mx-auto">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">Welcome to Startup Value Simulator!</h2>
      <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
        You don&apos;t have a company set up yet. Start by creating your company profile to begin simulating startup scenarios.
      </p>
      <button
        onClick={onCreateCompany}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
      >
        Create Company
      </button>
    </div>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;
