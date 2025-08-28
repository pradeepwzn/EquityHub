// Simple Supabase configuration to avoid webpack issues
let supabase: any;

try {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Fallback to mock client
    supabase = createMockClient();
  }
} catch (error) {
  console.warn('Supabase client creation failed, using mock client:', error);
  supabase = createMockClient();
}

function createMockClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Mock client - not configured') }),
      signUp: async () => ({ data: null, error: new Error('Mock client - not configured') }),
      signOut: async () => {},
      resetPasswordForEmail: async () => ({ error: new Error('Mock client - not configured') })
    },
    from: () => ({
      insert: async () => ({ error: new Error('Mock client - not configured') }),
      select: async () => ({ data: null, error: new Error('Mock client - not configured') })
    })
  };
}

export { supabase };

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          total_shares: number;
          valuation: number | null;
          esop_pool: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          total_shares: number;
          valuation?: number | null;
          esop_pool?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          total_shares?: number;
          valuation?: number | null;
          esop_pool?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      founders: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          initial_ownership: number;
          current_ownership: number;
          shares: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          initial_ownership: number;
          current_ownership: number;
          shares: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          initial_ownership?: number;
          current_ownership?: number;
          shares?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      funding_rounds: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          investment_amount: number;
          pre_money_valuation: number;
          post_money_valuation: number;
          shares_issued: number;
          price_per_share: number;
          order: number;
          esop_allocation_percent?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          investment_amount: number;
          pre_money_valuation: number;
          post_money_valuation: number;
          shares_issued: number;
          price_per_share: number;
          order: number;
          esop_allocation_percent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          investment_amount?: number;
          pre_money_valuation?: number;
          post_money_valuation?: number;
          shares_issued?: number;
          price_per_share?: number;
          order?: number;
          esop_allocation_percent?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          config: {
            founders: Array<{
              name: string;
              initial_ownership: number;
              current_ownership: number;
              shares: number;
            }>;
            funding_rounds: Array<{
              name: string;
              investment_amount: number;
              pre_money_valuation: number;
              post_money_valuation: number;
              shares_issued: number;
              price_per_share: number;
              order: number;
              esop_allocation_percent?: number;
            }>;
            exit_value: number;
            esop_allocation: number;
            total_shares: number;
            company_valuation?: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          config: {
            founders: Array<{
              name: string;
              initial_ownership: number;
              current_ownership: number;
              shares: number;
            }>;
            funding_rounds: Array<{
              name: string;
              investment_amount: number;
              pre_money_valuation: number;
              post_money_valuation: number;
              shares_issued: number;
              price_per_share: number;
              order: number;
              esop_allocation_percent?: number;
            }>;
            exit_value: number;
            esop_allocation: number;
            total_shares: number;
            company_valuation?: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          config?: {
            founders: Array<{
              name: string;
              initial_ownership: number;
              current_ownership: number;
              shares: number;
            }>;
            funding_rounds: Array<{
              name: string;
              investment_amount: number;
              pre_money_valuation: number;
              post_money_valuation: number;
              shares_issued: number;
              price_per_share: number;
              order: number;
              esop_allocation_percent?: number;
            }>;
            exit_value: number;
            esop_allocation: number;
            total_shares: number;
            company_valuation?: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Utility function to test connection (call this when needed, not at module load)
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    } else {
      console.log('Supabase connection test successful');
      return true;
    }
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
}

// Function to read companies from the database
export async function getCompanies() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    throw error;
  }
}

// Function to read companies for a specific user
export async function getUserCompanies(userId: string) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user companies:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch user companies:', error);
    throw error;
  }
}

// Function to read a specific company by ID
export async function getCompanyById(companyId: string) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch company:', error);
    throw error;
  }
}
