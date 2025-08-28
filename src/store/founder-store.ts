import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Founder } from '@/types';

// Form data interface for founder creation/editing
export interface FounderFormData {
  name: string;
  email?: string;
  initial_ownership: number;
  shares: number;
}

// Founder store interface
export interface FounderStore {
  // State
  founders: Founder[];
  currentFounder: Founder | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createFounder: (companyId: string, data: FounderFormData) => Promise<Founder>;
  selectFounder: (founderId: string) => void;
  updateFounder: (founderId: string, data: Partial<FounderFormData>) => Promise<Founder>;
  deleteFounder: (founderId: string) => Promise<void>;
  clearCurrentFounder: () => void;
  clearError: () => void;
  
  // Utility functions
  getFounderById: (founderId: string) => Founder | undefined;
  getFoundersByCompany: (companyId: string) => Founder[];
  calculateEquityDistribution: (companyId: string) => {
    totalShares: number;
    totalOwnership: number;
    founders: Array<{
      id: string;
      name: string;
      shares: number;
      ownershipPercent: number;
      value: number;
    }>;
  };
}

// Validation function for founder data
export function validateFounderData(data: FounderFormData, totalCompanyShares: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Founder name is required');
  }
  
  if (data.name && data.name.trim().length < 2) {
    errors.push('Founder name must be at least 2 characters');
  }
  
  if (data.name && data.name.trim().length > 100) {
    errors.push('Founder name must be less than 100 characters');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (data.shares <= 0) {
    errors.push('Shares must be a positive number');
  }
  
  if (data.shares > totalCompanyShares) {
    errors.push(`Shares cannot exceed total company shares (${totalCompanyShares.toLocaleString()})`);
  }
  
  if (data.initial_ownership < 0 || data.initial_ownership > 100) {
    errors.push('Initial ownership must be between 0% and 100%');
  }
  
  // Check if total ownership would exceed 100%
  // This will be validated at the store level when creating/updating
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate unique founder ID
function generateFounderId(): string {
  return `founder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create the founder store
export const useFounderStore = create<FounderStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        founders: [],
        currentFounder: null,
        isLoading: false,
        error: null,
        
        // Create a new founder
        createFounder: async (companyId: string, data: FounderFormData): Promise<Founder> => {
          set({ isLoading: true, error: null });
          
          try {
            // Validate the data
            const validation = validateFounderData(data, 10000000); // Default company shares
            if (!validation.isValid) {
              throw new Error(validation.errors.join(', '));
            }
            
            // Check if total ownership would exceed 100%
            const existingFounders = get().founders.filter(f => f.company_id === companyId);
            const totalExistingOwnership = existingFounders.reduce((sum, f) => sum + f.initial_ownership, 0);
            
            if (totalExistingOwnership + data.initial_ownership > 100) {
              throw new Error(`Total ownership would exceed 100%. Current: ${totalExistingOwnership}%, Adding: ${data.initial_ownership}%`);
            }
            
            // Create the founder
            const newFounder: Founder = {
              id: generateFounderId(),
              company_id: companyId,
              name: data.name.trim(),
              email: data.email?.trim() || undefined,
              initial_ownership: data.initial_ownership,
              current_ownership: data.initial_ownership, // Initially same as initial
              shares: data.shares,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            // Add to store
            set(state => ({
              founders: [...state.founders, newFounder],
              currentFounder: newFounder,
              isLoading: false
            }));
            
            return newFounder;
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to create founder',
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Select a founder
        selectFounder: (founderId: string) => {
          const founder = get().founders.find(f => f.id === founderId);
          set({ currentFounder: founder || null });
        },
        
        // Update an existing founder
        updateFounder: async (founderId: string, data: Partial<FounderFormData>): Promise<Founder> => {
          set({ isLoading: true, error: null });
          
          try {
            const state = get();
            const founderIndex = state.founders.findIndex(f => f.id === founderId);
            
            if (founderIndex === -1) {
              throw new Error('Founder not found');
            }
            
            const existingFounder = state.founders[founderIndex];
            const updatedFounder: Founder = {
              ...existingFounder,
              ...data,
              name: data.name?.trim() || existingFounder.name,
              email: data.email?.trim() || existingFounder.email,
              shares: data.shares || existingFounder.shares,
              initial_ownership: data.initial_ownership || existingFounder.initial_ownership,
              updated_at: new Date().toISOString()
            };
            
            // Validate the updated data
            const validation = validateFounderData({
              name: updatedFounder.name,
              email: updatedFounder.email,
              initial_ownership: updatedFounder.initial_ownership,
              shares: updatedFounder.shares
            }, 10000000); // Default company shares
            
            if (!validation.isValid) {
              throw new Error(validation.errors.join(', '));
            }
            
            // Check ownership constraints
            const otherFounders = state.founders.filter(f => f.id !== founderId && f.company_id === updatedFounder.company_id);
            const totalOtherOwnership = otherFounders.reduce((sum, f) => sum + f.initial_ownership, 0);
            
            if (totalOtherOwnership + updatedFounder.initial_ownership > 100) {
              throw new Error(`Total ownership would exceed 100%. Current: ${totalOtherOwnership}%, Updated: ${updatedFounder.initial_ownership}%`);
            }
            
            // Update the founder
            const updatedFounders = [...state.founders];
            updatedFounders[founderIndex] = updatedFounder;
            
            set(state => ({
              founders: updatedFounders,
              currentFounder: state.currentFounder?.id === founderId ? updatedFounder : state.currentFounder,
              isLoading: false
            }));
            
            return updatedFounder;
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to update founder',
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Delete a founder
        deleteFounder: async (founderId: string): Promise<void> => {
          set({ isLoading: true, error: null });
          
          try {
            const state = get();
            const founder = state.founders.find(f => f.id === founderId);
            
            if (!founder) {
              throw new Error('Founder not found');
            }
            
            // Remove the founder
            const updatedFounders = state.founders.filter(f => f.id !== founderId);
            
            set(state => ({
              founders: updatedFounders,
              currentFounder: state.currentFounder?.id === founderId ? null : state.currentFounder,
              isLoading: false
            }));
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to delete founder',
              isLoading: false 
            });
            throw error;
          }
        },
        
        // Clear current founder selection
        clearCurrentFounder: () => {
          set({ currentFounder: null });
        },
        
        // Clear error
        clearError: () => {
          set({ error: null });
        },
        
        // Get founder by ID
        getFounderById: (founderId: string) => {
          return get().founders.find(f => f.id === founderId);
        },
        
        // Get founders by company ID
        getFoundersByCompany: (companyId: string) => {
          return get().founders.filter(f => f.company_id === companyId);
        },
        
        // Calculate equity distribution for a company
        calculateEquityDistribution: (companyId: string) => {
          const founders = get().founders.filter(f => f.company_id === companyId);
          const totalShares = founders.reduce((sum, f) => sum + f.shares, 0);
          const totalOwnership = founders.reduce((sum, f) => sum + f.initial_ownership, 0);
          
          const foundersWithDetails = founders.map(founder => ({
            id: founder.id,
            name: founder.name,
            shares: founder.shares,
            ownershipPercent: founder.initial_ownership,
            value: 0 // Will be calculated when company valuation is available
          }));
          
          return {
            totalShares,
            totalOwnership,
            founders: foundersWithDetails
          };
        }
      }),
      {
        name: 'founder-store',
        partialize: (state) => ({
          founders: state.founders,
          currentFounder: state.currentFounder
        })
      }
    ),
    {
      name: 'founder-store'
    }
  )
);


