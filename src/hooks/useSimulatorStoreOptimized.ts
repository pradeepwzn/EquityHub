import { useSimulatorStore } from '@/store/simulator-store';
import { Company, Founder, FundingRound, ExitResults, Scenario } from '@/types';

// Hook for company data only
export const useCompany = (): Company | null => {
  return useSimulatorStore((state) => state.company);
};

// Hook for founders data only
export const useFounders = (): Founder[] => {
  return useSimulatorStore((state) => state.founders);
};

// Hook for funding rounds data only
export const useFundingRounds = (): FundingRound[] => {
  return useSimulatorStore((state) => state.fundingRounds);
};

// Hook for exit results only
export const useExitResults = (): ExitResults | null => {
  return useSimulatorStore((state) => state.exitResults);
};

// Hook for scenarios data only
export const useScenarios = (): Scenario[] => {
  return useSimulatorStore((state) => state.scenarios);
};

// Hook for loading state only
export const useIsLoading = (): boolean => {
  return useSimulatorStore((state) => state.isLoading);
};

// Hook for error state only
export const useError = (): string | null => {
  return useSimulatorStore((state) => state.error);
};

// Note: Removed combined hooks to prevent infinite loop errors
// Use individual hooks (useCompany, useFounders, etc.) instead of combined ones

// Individual action hooks to prevent object creation issues
export const useSetCompany = () => useSimulatorStore((state) => state.setCompany);
export const useAddFounder = () => useSimulatorStore((state) => state.addFounder);
export const useRemoveFounder = () => useSimulatorStore((state) => state.removeFounder);
export const useAddFundingRound = () => useSimulatorStore((state) => state.addFundingRound);
export const useRemoveFundingRound = () => useSimulatorStore((state) => state.removeFundingRound);
export const useSetExitValue = () => useSimulatorStore((state) => state.setExitValue);
export const useSetESOPAllocation = () => useSimulatorStore((state) => state.setESOPAllocation);
export const useCalculateScenario = () => useSimulatorStore((state) => state.calculateScenario);
export const useLoadUserCompanies = () => useSimulatorStore((state) => state.loadUserCompanies);
export const useClearError = () => useSimulatorStore((state) => state.clearError);
export const useLoadScenarios = () => useSimulatorStore((state) => state.loadScenarios);
export const useSaveCurrentScenario = () => useSimulatorStore((state) => state.saveCurrentScenario);
