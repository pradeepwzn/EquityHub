import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { 
  Company, 
  Founder, 
  FundingRound, 
  Scenario, 
  ExitResults,
  OwnershipBreakdown
} from '@/types';
import { supabase } from '@/lib/supabase';

interface SimulatorStore {
  // Company Data
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
  
  // Scenarios
  scenarios: Scenario[];
  
  // UI State
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
  
  // Scenario Actions
  setScenarios: (scenarios: Scenario[]) => void;
  addScenario: (scenario: Scenario) => void;
  updateScenario: (scenarioId: string, updates: Partial<Scenario>) => void;
  removeScenario: (scenarioId: string) => void;
  loadScenarios: (companyId: string) => Promise<void>;
  saveCurrentScenario: (name: string) => Promise<Scenario | null>;
  
  // Enhanced calculation functions
  calculateCurrentValuation: (company: Company, founders: Founder[], fundingRounds: FundingRound[]) => {
    currentValuation: number;
    totalSharesOutstanding: number;
    sharePrice: number;
  };
  calculateOwnershipBreakdown: (company: Company, founders: Founder[], fundingRounds: FundingRound[], currentValuation: number) => OwnershipBreakdown;
}

export const useSimulatorStore = create<SimulatorStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // Initial state
        company: null,
        founders: [],
        fundingRounds: [],
        exitResults: null,
        scenarios: [],
        isLoading: false,
        error: null,
        activeTab: 'company',

        // Company actions
        setCompany: (company) => set({ company }),
        clearCompany: () => set({ company: null }),
        
        addFounder: (founder) => set((state) => ({
          founders: [...state.founders, founder],
          exitResults: null // Reset results when founders change
        })),
        
        removeFounder: (founderId) => set((state) => ({
          founders: state.founders.filter(f => f.id !== founderId),
          exitResults: null // Reset results when founders change
        })),
        
        addFundingRound: (round) => set((state) => ({
          fundingRounds: [...state.fundingRounds, round],
          exitResults: null // Reset results when funding rounds change
        })),
        
        removeFundingRound: (roundId) => set((state) => ({
          fundingRounds: state.fundingRounds.filter(r => r.id !== roundId),
          exitResults: null // Reset results when funding rounds change
        })),
        
        setExitValue: (value) => set({ exitResults: null }), // Reset results when exit value changes
        
        setESOPAllocation: (allocation) => set({ exitResults: null }), // Reset results when ESOP changes
        
        calculateScenario: () => {
          const state = get();
          if (!state.company || state.founders.length === 0) {
            set({ error: 'Please set up company and founders first' });
            return;
          }

          try {
            set({ isLoading: true, error: null });

            // Calculate current valuation and ownership breakdown
            const { currentValuation, totalSharesOutstanding, sharePrice } = 
              get().calculateCurrentValuation(state.company, state.founders, state.fundingRounds);

            const ownershipBreakdown = 
              get().calculateOwnershipBreakdown(state.company, state.founders, state.fundingRounds, currentValuation);

            // Calculate exit results
            const exitValue = state.exitResults?.exitValue || currentValuation * 2; // Default 2x exit
            const founderReturns = ownershipBreakdown.founders.map(founder => 
              (founder.ownershipPercent / 100) * exitValue
            );
            const investorReturns = ownershipBreakdown.investors.map(investor => 
              (investor.ownershipPercent / 100) * exitValue
            );

            const totalFounderValue = founderReturns.reduce((sum, value) => sum + value, 0);
            const totalInvestorValue = investorReturns.reduce((sum, value) => sum + value, 0);

            const newExitResults: ExitResults = {
              exitValue,
              founderReturns,
              investorReturns,
              totalFounderValue,
              totalInvestorValue,
              ownershipBreakdown,
              currentValuation,
              totalSharesOutstanding,
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
            // Session-based authentication - no token needed

            // Fetch companies from API
            const response = await fetch(`/api/protected/companies?userId=${userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch companies: ${response.statusText}`);
            }

            const { companies } = await response.json();
            
            // Set the first company as active if available
            if (companies && companies.length > 0) {
              set({ 
                company: companies[0],
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

        // Scenario actions
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
            // Implementation for loading scenarios
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
              config: {
                founders: state.founders.map(founder => ({
                  name: founder.name,
                  initial_ownership: founder.initial_ownership,
                  current_ownership: founder.current_ownership,
                  shares: founder.shares
                })),
                funding_rounds: state.fundingRounds.map(round => ({
                  name: round.name,
                  investment_amount: round.investment_amount,
                  pre_money_valuation: round.pre_money_valuation,
                  post_money_valuation: round.post_money_valuation,
                  shares_issued: round.shares_issued,
                  price_per_share: round.price_per_share,
                  order: round.order,
                  round_type: round.round_type || 'Priced Round',
                  valuation_type: round.valuation_type || 'pre_money',
                  esop_adjustment: round.esop_adjustment,
                  founder_secondary_sale: round.founder_secondary_sale,
                  safe_terms: round.safe_terms,
                  esop_allocation_percent: round.esop_allocation_percent
                })),
                exit_value: 0, // Default value, will be calculated later
                esop_allocation: state.company?.esop_pool || 0,
                total_shares: state.company?.total_shares || 0,
                company_valuation: state.company?.valuation || 0
              },
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
        },

        // Enhanced calculation functions
        calculateCurrentValuation: (company: Company, founders: Founder[], fundingRounds: FundingRound[]) => {
          let totalShares = company.total_shares;
          let currentValuation = company.valuation || 0;
          
          // Calculate ESOP pool
          const esopShares = Math.floor((totalShares * (company.esop_pool || 0)) / 100);
          totalShares += esopShares;
          
          // Process funding rounds to calculate current valuation and shares
          fundingRounds.forEach(round => {
            if (round.round_type === 'Priced Round') {
              // For priced rounds, add shares issued
              totalShares += round.shares_issued || 0;
              
              // Update current valuation based on latest round
              if (round.post_money_valuation > currentValuation) {
                currentValuation = round.post_money_valuation;
              }
            }
            
            // Handle ESOP adjustments
            if (round.esop_adjustment?.add_new_pool) {
              const additionalShares = round.esop_adjustment.pool_size;
              totalShares += additionalShares;
            }
            // Secondary sales don't affect company valuation or total shares
          });
          
          const sharePrice = totalShares > 0 ? currentValuation / totalShares : 0;
          
          return {
            currentValuation,
            totalSharesOutstanding: totalShares,
            sharePrice
          };
        },

        calculateOwnershipBreakdown: (company: Company, founders: Founder[], fundingRounds: FundingRound[], currentValuation: number): OwnershipBreakdown => {
          let totalShares = company.total_shares;
          const esopShares = Math.floor((totalShares * (company.esop_pool || 0)) / 100);
          totalShares += esopShares;
          
          // Calculate founder ownership
          const founderBreakdown = founders.map(founder => {
            const ownershipPercent = (founder.shares / totalShares) * 100;
            const currentValue = (ownershipPercent / 100) * currentValuation;
            const exitValue = currentValue; // Assuming exit value equals current value for now
            
            return {
              name: founder.name,
              shares: founder.shares,
              ownershipPercent,
              currentValue,
              exitValue
            };
          });
          
          // Calculate investor ownership from funding rounds
          const investorBreakdown = fundingRounds
            .filter(round => round.round_type === 'Priced Round')
            .map(round => {
              const ownershipPercent = ((round.shares_issued || 0) / totalShares) * 100;
              const currentValue = (ownershipPercent / 100) * currentValuation;
              const exitValue = currentValue;
              const returnMultiple = currentValue / (round.investment_amount || 1);
              
              return {
                roundName: round.name,
                shares: round.shares_issued || 0,
                ownershipPercent,
                investmentAmount: round.investment_amount,
                currentValue,
                exitValue,
                returnMultiple
              };
            });
          
          // Calculate ESOP ownership
          const esopOwnershipPercent = (esopShares / totalShares) * 100;
          const esopCurrentValue = (esopOwnershipPercent / 100) * currentValuation;
          
          const esopBreakdown = {
            shares: esopShares,
            ownershipPercent: esopOwnershipPercent,
            currentValue: esopCurrentValue,
            exitValue: esopCurrentValue
          };
          
          // Calculate available shares (unallocated)
          const allocatedShares = founders.reduce((sum, f) => sum + f.shares, 0) + 
                                 esopShares + 
                                 fundingRounds.reduce((sum, r) => sum + (r.shares_issued || 0), 0);
          const availableShares = totalShares - allocatedShares;
          const availableOwnershipPercent = (availableShares / totalShares) * 100;
          const availableCurrentValue = (availableShares / totalShares) * currentValuation;
          
          const availableBreakdown = {
            shares: availableShares,
            ownershipPercent: availableOwnershipPercent,
            currentValue: availableCurrentValue,
            exitValue: availableCurrentValue
          };
          
          return {
            founders: founderBreakdown,
            investors: investorBreakdown,
            esop: esopBreakdown,
            available: availableBreakdown
          };
        }
      }),
      {
        name: 'simulator-store',
      }
    )
  )
);
