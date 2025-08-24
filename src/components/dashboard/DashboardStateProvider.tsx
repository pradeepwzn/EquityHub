'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useCompany,
  useFounders,
  useFundingRounds,
  useExitResults, 
  useScenarios, 
  useIsLoading, 
  useError,
  useSetCompany,
  useAddFounder,
  useRemoveFounder,
  useAddFundingRound,
  useRemoveFundingRound,
  useSetExitValue,
  useSetESOPAllocation,
  useLoadUserCompanies,
  useClearError,
  useLoadScenarios,
  useCalculateScenario
} from '@/hooks/useSimulatorStoreOptimized';

interface DashboardStateProviderProps {
  children: (props: {
    // State
    activeTab: string;
    company: any;
    founders: any[];
    fundingRounds: any[];
    exitResults: any;
    scenarios: any[];
    isLoading: boolean;
    error: string | null;
    user: any;
    
    // Actions
    setActiveTab: (tab: string) => void;
    handleCompanySubmit: (values: any) => void;
    handleFounderSubmit: (values: any) => void;
    handleRoundSubmit: (values: any) => void;
    handleUpdateAndRecalculate: () => void;
    handleTabChange: (key: string) => void;
    handleSignOut: () => void;
    clearError: () => void;
    removeFounder: (id: string) => void;
    removeFundingRound: (id: string) => void;
    setExitValue: (value: number) => void;
    setESOPAllocation: (value: number) => void;
  }) => React.ReactNode;
}

const DashboardStateProvider: React.FC<DashboardStateProviderProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  
  // Use optimized hooks to reduce re-renders
  const company = useCompany();
  const founders = useFounders();
  const fundingRounds = useFundingRounds();
  const exitResults = useExitResults();
  const scenarios = useScenarios();
  const isLoading = useIsLoading();
  const error = useError();
  
  // Individual action hooks
  const setCompany = useSetCompany();
  const addFounder = useAddFounder();
  const removeFounder = useRemoveFounder();
  const addFundingRound = useAddFundingRound();
  const removeFundingRound = useRemoveFundingRound();
  const setExitValue = useSetExitValue();
  const setESOPAllocation = useSetESOPAllocation();
  const loadUserCompanies = useLoadUserCompanies();
  const clearError = useClearError();
  const loadScenarios = useLoadScenarios();
  const calculateScenario = useCalculateScenario();

  const [activeTab, setActiveTab] = useState<string>('company');

  // Simple debounced API calls to prevent excessive requests
  const debouncedLoadUserCompanies = useCallback((userId: string) => {
    const timeoutId = setTimeout(() => {
      loadUserCompanies(userId);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [loadUserCompanies]);

  const debouncedLoadScenarios = useCallback((companyId: string) => {
    const timeoutId = setTimeout(() => {
      loadScenarios(companyId);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [loadScenarios]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleCompanySubmit = useCallback((values: { name: string; total_shares: number; valuation: number; esop_pool: number }) => {
    setCompany({
      id: company?.id || '',
      user_id: company?.user_id || user?.id || '',
      created_at: company?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...values,
    });
    setActiveTab('founders');
    message.success('Company created successfully!');
  }, [company, user?.id, setCompany]);

  const handleFounderSubmit = useCallback((values: { name: string; initial_ownership: number }) => {
    addFounder({
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for store
      company_id: company!.id,
      name: values.name,
      initial_ownership: values.initial_ownership,
      current_ownership: values.initial_ownership,
      shares: Math.floor((company!.total_shares * values.initial_ownership) / 100),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    message.success('Founder added successfully!');
  }, [company, addFounder]);

  const handleRoundSubmit = useCallback((values: any) => {
    // Calculate post-money valuation based on valuation type
    let preMoneyValuation = values.pre_money_valuation;
    let postMoneyValuation = values.pre_money_valuation;
    
    if (values.valuation_type === 'post_money') {
      preMoneyValuation = values.pre_money_valuation - values.investment_amount;
      postMoneyValuation = values.pre_money_valuation;
    } else {
      preMoneyValuation = values.pre_money_valuation;
      postMoneyValuation = values.pre_money_valuation + values.investment_amount;
    }

    // Calculate shares issued for priced rounds
    let sharesIssued = 0;
    let pricePerShare = 0;
    
    if (values.round_type === 'Priced Round') {
      pricePerShare = preMoneyValuation / company!.total_shares;
      sharesIssued = Math.floor(values.investment_amount / pricePerShare);
    }

    const fundingRoundData = {
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for store
      company_id: company!.id,
      name: values.name,
      investment_amount: values.investment_amount,
      pre_money_valuation: preMoneyValuation,
      post_money_valuation: postMoneyValuation,
      shares_issued: sharesIssued,
      price_per_share: pricePerShare,
      order: fundingRounds.length + 1,
      // Enhanced fields
      round_type: values.round_type || 'Priced Round',
      valuation_type: values.valuation_type || 'pre_money',
      esop_adjustment: values.esop_adjustment,
      founder_secondary_sale: values.founder_secondary_sale,
      safe_terms: values.safe_terms,
      esop_allocation_percent: values.esop_allocation_percent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addFundingRound(fundingRoundData);
    message.success('Funding round added successfully!');
  }, [company, fundingRounds, addFundingRound]);

  const handleUpdateAndRecalculate = useCallback(() => {
    calculateScenario();
    message.success('Scenario updated and recalculated successfully!');
  }, [calculateScenario]);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, [signOut]);

  // Load user's company data when they log in
  useEffect(() => {
    if (user?.id) {
      const cleanup = debouncedLoadUserCompanies(user.id);
      return cleanup;
    }
  }, [user?.id, debouncedLoadUserCompanies]);

  useEffect(() => {
    if (company?.id) {
      const cleanup = debouncedLoadScenarios(company.id);
      return cleanup;
    }
  }, [company?.id, debouncedLoadScenarios]);

  return children({
    // State
    activeTab,
    company,
    founders,
    fundingRounds,
    exitResults,
    scenarios,
    isLoading,
    error,
    user,
    
    // Actions
    setActiveTab,
    handleCompanySubmit,
    handleFounderSubmit,
    handleRoundSubmit,
    handleUpdateAndRecalculate,
    handleTabChange,
    handleSignOut,
    clearError,
    removeFounder,
    removeFundingRound,
    setExitValue,
    setESOPAllocation,
  });
};

DashboardStateProvider.displayName = 'DashboardStateProvider';

export default DashboardStateProvider;
