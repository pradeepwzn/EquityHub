'use client';

import React, { useMemo } from 'react';
import { Tabs, Alert } from 'antd';
import { Company, Founder, FundingRound, ExitResults, Scenario } from '@/types';

// Error boundary component for handling chunk load errors
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Component load error:', error);
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        {fallback || (
          <Alert
            message="Loading Error"
            description="There was an error loading this component. Please refresh the page."
            type="warning"
            showIcon
            className="max-w-md shadow-lg border-0"
          />
        )}
      </div>
    );
  }
};

// Dynamic imports for code splitting and faster initial load
import dynamic from 'next/dynamic';

// Lazy load heavy components
const CompanyTab = dynamic(() => import('@/components/dashboard/CompanyTab'), {
  loading: () => <div className="p-8 text-center">Loading Company...</div>,
  ssr: false
});

const FoundersTab = dynamic(() => import('@/components/dashboard/FoundersTab'), {
  loading: () => <div className="p-8 text-center">Loading Founders...</div>,
  ssr: false
});

const FundingRoundsTab = dynamic(() => import('@/components/dashboard/FundingRoundsTab'), {
  loading: () => <div className="p-8 text-center">Loading Funding Rounds...</div>,
  ssr: false
});

const ResultsTab = dynamic(() => import('@/components/dashboard/ResultsTab'), {
  loading: () => <div className="p-8 text-center">Loading Results...</div>,
  ssr: false
});

const DatabaseDebugTab = dynamic(() => import('@/components/dashboard/DatabaseDebugTab'), {
  loading: () => <div className="p-8 text-center">Loading Debug...</div>,
  ssr: false
});

const ScenarioManager = dynamic(() => import('@/components/dashboard/ScenarioManager'), {
  loading: () => <div className="p-8 text-center">Loading Scenarios...</div>,
  ssr: false
});

const ScenarioComparisonTab = dynamic(() => import('@/components/dashboard/ScenarioComparisonTab'), {
  loading: () => <div className="p-8 text-center">Loading Comparison...</div>,
  ssr: false
});

const ScenarioTimeline = dynamic(() => import('@/components/dashboard/ScenarioTimeline'), {
  loading: () => <div className="p-8 text-center">Loading Timeline...</div>,
  ssr: false
});

const FounderAccountTab = dynamic(() => import('@/components/dashboard/FounderAccountTab'), {
  loading: () => <div className="p-8 text-center">Loading Account...</div>,
  ssr: false
});

const ESOPTab = dynamic(() => import('@/components/dashboard/ESOPTab'), {
  loading: () => <div className="p-8 text-center">Loading ESOP...</div>,
  ssr: false
});

interface DashboardTabsProps {
  activeTab: string;
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
  scenarios: Scenario[];
  onTabChange: (key: string) => void;
  onCompanySubmit: (values: any) => void;
  onFounderSubmit: (values: any) => void;
  onRoundSubmit: (values: any) => void;
  onUpdateAndRecalculate: () => void;
  onRemoveFounder: (id: string) => void;
  onRemoveFundingRound: (id: string) => void;
  onSetExitValue: (value: number) => void;
  onSetESOPAllocation: (value: number) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = React.memo(({
  activeTab,
  company,
  founders,
  fundingRounds,
  exitResults,
  scenarios,
  onTabChange,
  onCompanySubmit,
  onFounderSubmit,
  onRoundSubmit,
  onUpdateAndRecalculate,
  onRemoveFounder,
  onRemoveFundingRound,
  onSetExitValue,
  onSetESOPAllocation,
}) => {
  // Memoize tab items to prevent recreation on every render
  const tabItems = useMemo(() => [
    {
      key: 'company',
      label: 'Company',
      children: (
        <ErrorBoundary>
          <CompanyTab
            company={company}
            founders={founders}
            fundingRounds={fundingRounds}
            onCompanySubmit={onCompanySubmit}
            onTabChange={onTabChange}
          />
        </ErrorBoundary>
      ),
    },
    {
      key: 'founders',
      label: 'Founders',
      children: (
        <FoundersTab
          company={company}
          founders={founders}
          onAddFounder={onFounderSubmit}
          onRemoveFounder={onRemoveFounder}
          onTabChange={onTabChange}
        />
      ),
    },
    {
      key: 'founder-account',
      label: 'My Account',
      children: (
        <FounderAccountTab
          company={company}
          founders={founders}
          fundingRounds={fundingRounds}
          exitResults={exitResults}
        />
      ),
    },
    {
      key: 'esop',
      label: 'ESOP',
      children: (
        <ESOPTab
          company={company}
          founders={founders}
          fundingRounds={fundingRounds}
          exitResults={exitResults}
        />
      ),
    },
    {
      key: 'rounds',
      label: 'Funding Rounds',
      children: (
        <ErrorBoundary>
          <FundingRoundsTab
            company={company}
            fundingRounds={fundingRounds}
            onAddFundingRound={onRoundSubmit}
            onRemoveFundingRound={onRemoveFundingRound}
            onTabChange={onTabChange}
            onUpdateAndRecalculate={onUpdateAndRecalculate}
            exitResults={exitResults}
          />
        </ErrorBoundary>
      ),
    },
    {
      key: 'results',
      label: 'Exit Scenarios',
      children: (
        <ResultsTab
          company={company}
          founders={founders}
          fundingRounds={fundingRounds}
          exitResults={exitResults}
          onSetExitValue={onSetExitValue}
          onSetESOPAllocation={onSetESOPAllocation}
        />
      ),
    },
    {
      key: 'scenarios',
      label: 'Scenario Manager',
      children: (
        <ScenarioManager 
          companyId={company?.id || ''}
          currentScenario={{
            founders,
            fundingRounds,
            exitValue: exitResults?.exitValue || 10000000,
            esopAllocation: 10, // Default ESOP allocation
            totalShares: company?.total_shares || 10000000,
            valuation: company?.valuation
          }}
          onScenarioSelect={(scenario) => {
            // TODO: Implement scenario loading
          }}
        />
      ),
    },
    {
      key: 'comparison',
      label: 'Scenario Comparison',
      children: (
        <ScenarioComparisonTab
          companyId={company?.id || ''}
          scenarios={scenarios}
          onScenarioSelect={(scenario) => console.log('Selected scenario:', scenario)}
        />
      ),
    },
    {
      key: 'timeline',
      label: 'Timeline',
      children: (
        <ScenarioTimeline
          company={company}
          founders={founders}
          fundingRounds={fundingRounds}
          exitResults={exitResults}
        />
      ),
    },
    {
      key: 'debug',
      label: 'Database Debug',
      children: (
        <DatabaseDebugTab
          company={company}
          founders={founders}
          fundingRounds={fundingRounds}
        />
      ),
    },
  ], [
    company, 
    founders, 
    fundingRounds, 
    exitResults, 
    scenarios, 
    onCompanySubmit, 
    onFounderSubmit, 
    onRoundSubmit, 
    onUpdateAndRecalculate, 
    onTabChange, 
    onRemoveFounder, 
    onRemoveFundingRound, 
    onSetExitValue, 
    onSetESOPAllocation
  ]);

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        className="dashboard-tabs w-full"
        tabBarStyle={{
          margin: 0,
          padding: '20px 40px 0 40px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          minHeight: '72px',
          width: '100%',
        }}
        tabBarGutter={12}
        tabPosition="top"
        type="line"
        size="large"
      />
    </div>
  );
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs;
