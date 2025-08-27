import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  user_id: string;
  total_shares: number;
  valuation: number | null;
  esop_pool: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UseCompaniesReturn {
  companies: Company[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompanies(userId?: string): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = userId 
        ? `/api/companies?userId=${encodeURIComponent(userId)}`
        : '/api/companies';
        
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setCompanies(result.data);
      } else {
        setError(result.error || 'Failed to fetch companies');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userId]);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies
  };
}

// Hook for fetching a single company
export function useCompany(companyId: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/companies/${companyId}`);
        const result = await response.json();
        
        if (result.success) {
          setCompany(result.data);
        } else {
          setError(result.error || 'Failed to fetch company');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  return { company, loading, error };
}
