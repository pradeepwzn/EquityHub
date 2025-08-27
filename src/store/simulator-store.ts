import { create } from 'zustand';

// Simplified types to avoid import issues
interface Company {
  id: string;
  name: string;
  user_id: string;
  total_shares: number;
  valuation?: number;
  esop_pool?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface Founder {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  initial_ownership: number;
  current_ownership: number;
  shares: number;
  created_at: string;
  updated_at: string;
}

interface FundingRound {
  id: string;
  company_id: string;
  name: string;
  investment_amount: number;
  pre_money_valuation: number;
  post_money_valuation: number;
  shares_issued: number;
  price_per_share: number;
  order: number;
  round_type: 'SAFE' | 'Priced Round';
  valuation_type: 'pre_money' | 'post_money';
  created_at: string;
  updated_at: string;
}

interface Scenario {
  id: string;
  company_id: string;
  name: string;
  config: any;
  created_at: string;
  updated_at: string;
}

interface ExitResults {
  exitValue: number;
  founderReturns: number[];
  investorReturns: number[];
  totalFounderValue: number;
  totalInvestorValue: number;
  ownershipBreakdown: any;
  currentValuation: number;
  totalSharesOutstanding: number;
  sharePrice: number;
}

// Mock data
const mockCompanies = [
  {
    id: 'company-1',
    name: 'Tech Startup Inc',
    user_id: 'user-1',
    total_shares: 1000000,
    valuation: 5000000,
    esop_pool: 100000,
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

interface SimulatorStore {
  // State
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  
  // Actions
  setCompany: (company: Company) => void;
  clearCompany: () => void;
  addFounder: (founder: Founder) => void;
  removeFounder: (founderId: string) => void;
  addFundingRound: (round: FundingRound) => void;
  removeFundingRound: (roundId: string) => void;
  setExitValue: (value: number) => void;
  setESOPAllocation: (allocation: number) => void;
  calculateScenario: () => void;
  loadUserCompanies: (userId: string) => Promise<void>;
  clearError: () => void;
  setScenarios: (scenarios: Scenario[]) => void;
  addScenario: (scenario: Scenario) => void;
  updateScenario: (scenarioId: string, updates: Partial<Scenario>) => void;
  removeScenario: (scenarioId: string) => void;
  loadScenarios: (companyId: string) => Promise<void>;
  saveCurrentScenario: (name: string) => Promise<Scenario | null>;
}

// Create store with minimal complexity
export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  // Initial state
  company: null,
  founders: [],
  fundingRounds: [],
  exitResults: null,
  scenarios: [],
  isLoading: false,
  error: null,
  activeTab: 'overview',

  // Actions
  setCompany: (company) => set({ company }),
  clearCompany: () => set({ company: null }),
  
  addFounder: (founder) => set((state) => ({
    founders: [...state.founders, founder],
    exitResults: null
  })),
  
  removeFounder: (founderId) => set((state) => ({
    founders: state.founders.filter(f => f.id !== founderId),
    exitResults: null
  })),
  
  addFundingRound: (round) => set((state) => ({
    fundingRounds: [...state.fundingRounds, round],
    exitResults: null
  })),
  
  removeFundingRound: (roundId) => set((state) => ({
    fundingRounds: state.fundingRounds.filter(r => r.id !== roundId),
    exitResults: null
  })),
  
  setExitValue: (value) => set({ exitResults: null }),
  setESOPAllocation: (allocation) => set({ exitResults: null }),
  
  calculateScenario: () => {
    const state = get();
    if (!state.company || state.founders.length === 0) {
      set({ error: 'Please set up company and founders first' });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      
      // Simple calculation
      const currentValuation = state.company.valuation || 0;
      const totalShares = state.company.total_shares;
      const sharePrice = totalShares > 0 ? currentValuation / totalShares : 0;
      
      const newExitResults: ExitResults = {
        exitValue: currentValuation * 2,
        founderReturns: [currentValuation * 0.4, currentValuation * 0.35, currentValuation * 0.25],
        investorReturns: [currentValuation * 0.13],
        totalFounderValue: currentValuation,
        totalInvestorValue: currentValuation * 0.13,
        ownershipBreakdown: { founders: [], investors: [], esop: {}, available: {} },
        currentValuation,
        totalSharesOutstanding: totalShares,
        sharePrice
      };

      set({ 
        exitResults: newExitResults, 
        isLoading: false 
      });

    } catch (error) {
      set({ 
        error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        isLoading: false 
      });
    }
  },

  loadUserCompanies: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const userCompanies = mockCompanies.filter(c => c.user_id === userId);
      
      if (userCompanies && userCompanies.length > 0) {
        set({ 
          company: userCompanies[0],
          isLoading: false 
        });
      } else {
        set({ 
          company: null,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: `Failed to load companies: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
  setScenarios: (scenarios) => set({ scenarios }),
  
  addScenario: (scenario) => set((state) => ({
    scenarios: [...state.scenarios, scenario]
  })),
  
  updateScenario: (scenarioId, updates) => set((state) => ({
    scenarios: state.scenarios.map(s => 
      s.id === scenarioId ? { ...s, ...updates } : s
    )
  })),
  
  removeScenario: (scenarioId) => set((state) => ({
    scenarios: state.scenarios.filter(s => s.id !== scenarioId)
  })),

  loadScenarios: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: `Failed to load scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        isLoading: false 
      });
    }
  },

  saveCurrentScenario: async (name: string): Promise<Scenario | null> => {
    const state = get();
    if (!state.company) {
      set({ error: 'No company data to save' });
      return null;
    }

    try {
      const scenario: Scenario = {
        id: `temp-${Date.now()}`,
        company_id: state.company.id,
        name,
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      set((state) => ({
        scenarios: [...state.scenarios, scenario]
      }));

      return scenario;
    } catch (error) {
      set({ 
        error: `Failed to save scenario: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
      return null;
    }
  }
}));
