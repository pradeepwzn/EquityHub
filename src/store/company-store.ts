import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Company } from '@/types';

// Company data validation
interface CompanyFormData {
  name: string;
  total_shares: number;
  valuation: number;
  esop_pool: number;
}

interface CompanyStore {
  // State
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createCompany: (companyData: CompanyFormData) => Company;
  selectCompany: (companyId: string) => void;
  updateCompany: (companyId: string, updates: Partial<Company>) => void;
  deleteCompany: (companyId: string) => void;
  clearCurrentCompany: () => void;
  clearError: () => void;
  
  // Utility functions
  getCompanyById: (companyId: string) => Company | undefined;
  validateCompanyData: (data: CompanyFormData) => { isValid: boolean; errors: string[] };
}

// Validation function
const validateCompanyData = (data: CompanyFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Company name is required');
  }
  
  if (!data.total_shares || data.total_shares <= 0) {
    errors.push('Total shares must be a positive number');
  }
  
  if (!data.valuation || data.valuation <= 0) {
    errors.push('Company valuation must be a positive number');
  }
  
  if (data.esop_pool < 0 || data.esop_pool > 100) {
    errors.push('ESOP pool must be between 0% and 100%');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate unique ID for local companies
const generateCompanyId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useCompanyStore = create<CompanyStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        companies: [],
        currentCompany: null,
        isLoading: false,
        error: null,
        
        // Actions
        createCompany: (companyData: CompanyFormData) => {
          const validation = validateCompanyData(companyData);
          
          if (!validation.isValid) {
            set({ error: validation.errors.join(', ') });
            throw new Error(validation.errors.join(', '));
          }
          
          const newCompany: Company = {
            id: generateCompanyId(),
            name: companyData.name.trim(),
            user_id: 'local_user', // Placeholder for local storage
            total_shares: companyData.total_shares,
            valuation: companyData.valuation,
            esop_pool: companyData.esop_pool,
            status: 'Active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set((state) => ({
            companies: [...state.companies, newCompany],
            currentCompany: newCompany,
            error: null,
          }));
          
          return newCompany;
        },
        
        selectCompany: (companyId: string) => {
          const company = get().getCompanyById(companyId);
          if (company) {
            set({ currentCompany: company, error: null });
          } else {
            set({ error: 'Company not found' });
          }
        },
        
        updateCompany: (companyId: string, updates: Partial<Company>) => {
          set((state) => ({
            companies: state.companies.map((company) =>
              company.id === companyId
                ? { ...company, ...updates, updated_at: new Date().toISOString() }
                : company
            ),
            currentCompany: state.currentCompany?.id === companyId
              ? { ...state.currentCompany, ...updates, updated_at: new Date().toISOString() }
              : state.currentCompany,
            error: null,
          }));
        },
        
        deleteCompany: (companyId: string) => {
          set((state) => {
            const updatedCompanies = state.companies.filter((company) => company.id !== companyId);
            const newCurrentCompany = state.currentCompany?.id === companyId
              ? (updatedCompanies.length > 0 ? updatedCompanies[0] : null)
              : state.currentCompany;
            
            return {
              companies: updatedCompanies,
              currentCompany: newCurrentCompany,
              error: null,
            };
          });
        },
        
        clearCurrentCompany: () => {
          set({ currentCompany: null, error: null });
        },
        
        clearError: () => {
          set({ error: null });
        },
        
        // Utility functions
        getCompanyById: (companyId: string) => {
          return get().companies.find((company) => company.id === companyId);
        },
        
        validateCompanyData,
      }),
      {
        name: 'company-storage', // localStorage key
        partialize: (state) => ({
          companies: state.companies,
          currentCompany: state.currentCompany,
        }),
      }
    ),
    {
      name: 'company-store', // Redux DevTools name
    }
  )
);

// Export validation function for external use
export { validateCompanyData };
